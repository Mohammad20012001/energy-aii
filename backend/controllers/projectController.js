const Project = require('../models/Project');

// Validate project data
const validateProjectData = (data) => {
  const { name, type, location, capacity } = data;

  // Validate required fields
  if (!name || !type || !location || !capacity) {
    return {
      isValid: false,
      message: 'Please provide name, type, location, and capacity'
    };
  }

  // Validate project type
  const validTypes = ['solar', 'wind', 'hydro', 'geothermal', 'biomass', 'other'];
  if (!validTypes.includes(type)) {
    return {
      isValid: false,
      message: `Invalid project type. Must be one of: ${validTypes.join(', ')}`
    };
  }

  // Validate capacity
  if (isNaN(capacity) || capacity <= 0 || capacity > 1000000) {
    return {
      isValid: false,
      message: 'Capacity must be a positive number between 1 and 1,000,000 kW'
    };
  }

  return { isValid: true };
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    const {
      name,
      type,
      location,
      capacity,
      estimatedCost,
      annualProduction,
      roi,
      co2Reduction,
      status = 'planning',
      notes,
    } = req.body;

    // Validate project data
    const validation = validateProjectData({ name, type, location, capacity });
    if (!validation.isValid) {
      return res.status(400).json({ message: validation.message });
    }

    // Sanitize inputs
    const sanitizedName = name.trim().substring(0, 100);
    const sanitizedLocation = location.trim().substring(0, 100);
    const sanitizedNotes = notes ? notes.trim().substring(0, 1000) : '';

    // Calculate default values if not provided
    const calculatedEstimatedCost = estimatedCost || calculateDefaultCost(type, capacity);
    const calculatedAnnualProduction = annualProduction || calculateDefaultProduction(type, capacity);
    const calculatedRoi = roi || calculateDefaultRoi(type, capacity, calculatedEstimatedCost, calculatedAnnualProduction);
    const calculatedCo2Reduction = co2Reduction || calculateDefaultCo2Reduction(type, calculatedAnnualProduction);

    const project = await Project.create({
      user: req.user._id,
      name: sanitizedName,
      type,
      location: sanitizedLocation,
      capacity: Number(capacity),
      estimatedCost: Number(calculatedEstimatedCost),
      annualProduction: Number(calculatedAnnualProduction),
      roi: Number(calculatedRoi),
      co2Reduction: Number(calculatedCo2Reduction),
      status,
      notes: sanitizedNotes,
      createdAt: Date.now()
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      message: 'Server error while creating project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Helper functions for default calculations
const calculateDefaultCost = (type, capacity) => {
  const costPerKw = {
    solar: 1500,
    wind: 1700,
    hydro: 2500,
    geothermal: 3500,
    biomass: 2000,
    other: 2000
  };
  return capacity * (costPerKw[type] || 2000);
};

const calculateDefaultProduction = (type, capacity) => {
  const hoursPerYear = 8760;
  const capacityFactor = {
    solar: 0.2,
    wind: 0.35,
    hydro: 0.5,
    geothermal: 0.8,
    biomass: 0.6,
    other: 0.4
  };
  return capacity * hoursPerYear * (capacityFactor[type] || 0.4);
};

const calculateDefaultRoi = (type, capacity, cost, production) => {
  const electricityPrice = 0.12; // $/kWh
  const annualRevenue = production * electricityPrice;
  return cost / annualRevenue;
};

const calculateDefaultCo2Reduction = (type, production) => {
  // Average CO2 emissions from conventional electricity (kg CO2/kWh)
  const co2PerKwh = 0.7;
  return production * co2PerKwh;
};

// استيراد خدمة التخزين المؤقت
const cacheService = require('../services/cacheService');

// @desc    Get all user projects with filtering, sorting and pagination
// @route   GET /api/projects
// @access  Private
const getProjects = async (req, res) => {
  try {
    // Extract query parameters
    const {
      type,
      status,
      sort = 'createdAt',
      order = 'desc',
      page = 1,
      limit = 10,
      search,
      noCache = false
    } = req.query;

    // إنشاء مفتاح التخزين المؤقت
    const cacheKey = cacheService.createKey('projects', {
      userId: req.user._id.toString(),
      type: type || 'all',
      status: status || 'all',
      sort,
      order,
      page,
      limit,
      search: search || ''
    });

    // التحقق من وجود البيانات في التخزين المؤقت
    if (!noCache) {
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        return res.status(200).json(cachedData);
      }
    }

    // Build filter object
    const filter = { user: req.user._id };

    // Add type filter if provided
    if (type && type !== 'all') {
      filter.type = type;
    }

    // Add status filter if provided
    if (status && status !== 'all') {
      filter.status = status;
    }

    // Add search filter if provided
    if (search) {
      // استخدام فهرس نصي للبحث بدلاً من التعبير العادي
      filter.$text = { $search: search };
    }

    // Validate sort field
    const validSortFields = ['name', 'type', 'capacity', 'estimatedCost', 'createdAt', 'status'];
    const sortField = validSortFields.includes(sort) ? sort : 'createdAt';

    // Validate sort order
    const sortOrder = order === 'asc' ? 1 : -1;

    // Build sort object
    const sortOptions = { [sortField]: sortOrder };

    // إضافة ترتيب حسب الصلة إذا كان هناك بحث
    if (search && sortField !== 'score') {
      sortOptions.score = { $meta: 'textScore' };
    }

    // Parse page and limit to integers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    // Calculate skip value for pagination
    const skip = (pageNum - 1) * limitNum;

    // استخدام عمليات متوازية للحصول على البيانات وعدد السجلات
    const [total, projects] = await Promise.all([
      Project.countDocuments(filter),
      Project.find(filter, search ? { score: { $meta: 'textScore' } } : {})
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .lean() // استخدام lean() للحصول على كائنات JavaScript عادية بدلاً من وثائق Mongoose
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);
    const hasMore = pageNum < totalPages;
    const hasPrev = pageNum > 1;

    // إعداد البيانات للإرجاع
    const responseData = {
      success: true,
      count: projects.length,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages,
        hasMore,
        hasPrev
      },
      data: projects
    };

    // تخزين البيانات في التخزين المؤقت
    await cacheService.set(cacheKey, responseData, 300); // تخزين لمدة 5 دقائق

    res.status(200).json(responseData);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      message: 'Server error while fetching projects',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get single project
// @route   GET /api/projects/:id
// @access  Private
const getProject = async (req, res) => {
  try {
    // Validate project ID
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check authorization
    const isAdmin = req.user.role === 'admin';
    const isOwner = project.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(401).json({ message: 'Not authorized to access this project' });
    }

    // Calculate additional metrics for the project
    const additionalMetrics = {
      // Calculate CO2 reduction in tons
      co2ReductionTons: project.co2Reduction / 1000,

      // Calculate annual revenue
      annualRevenue: project.annualProduction * 0.12, // Assuming $0.12 per kWh

      // Calculate lifetime revenue (25 years typical for energy projects)
      lifetimeRevenue: project.annualProduction * 0.12 * 25,

      // Calculate payback period in years
      paybackPeriod: project.estimatedCost / (project.annualProduction * 0.12),

      // Calculate levelized cost of energy (LCOE)
      lcoe: (project.estimatedCost / (project.annualProduction * 25)).toFixed(4)
    };

    res.status(200).json({
      success: true,
      data: {
        ...project.toObject(),
        metrics: additionalMetrics
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      message: 'Server error while fetching project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    // Validate project ID
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Make sure the logged in user matches the project user
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const {
      name,
      type,
      location,
      capacity,
      estimatedCost,
      annualProduction,
      roi,
      co2Reduction,
      status,
      notes,
    } = req.body;

    // Validate updated data if provided
    if (name || type || location || capacity) {
      const dataToValidate = {
        name: name || project.name,
        type: type || project.type,
        location: location || project.location,
        capacity: capacity || project.capacity
      };

      const validation = validateProjectData(dataToValidate);
      if (!validation.isValid) {
        return res.status(400).json({ message: validation.message });
      }
    }

    // Prepare update data with sanitization
    const updateData = {};

    if (name) updateData.name = name.trim().substring(0, 100);
    if (type) updateData.type = type;
    if (location) updateData.location = location.trim().substring(0, 100);
    if (capacity) updateData.capacity = Number(capacity);
    if (estimatedCost) updateData.estimatedCost = Number(estimatedCost);
    if (annualProduction) updateData.annualProduction = Number(annualProduction);
    if (roi) updateData.roi = Number(roi);
    if (co2Reduction) updateData.co2Reduction = Number(co2Reduction);
    if (status) updateData.status = status;
    if (notes) updateData.notes = notes.trim().substring(0, 1000);

    // Add updatedAt timestamp
    updateData.updatedAt = Date.now();

    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    res.status(200).json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      message: 'Server error while updating project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    // Validate project ID
    if (!req.params.id || !req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid project ID' });
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Make sure the logged in user matches the project user
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    // Check if user is admin or project owner
    const isAdmin = req.user.role === 'admin';
    const isOwner = project.user.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner) {
      return res.status(401).json({ message: 'Not authorized to delete this project' });
    }

    // Use findByIdAndDelete instead of remove() which is deprecated
    await Project.findByIdAndDelete(req.params.id);

    // Return success with deleted project ID
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
      id: req.params.id
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      message: 'Server error while deleting project',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};
