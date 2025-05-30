// استيراد خدمة التخزين المؤقت
const cacheService = require('./cacheService');

/**
 * Validate calculation parameters
 * @param {Object} params - Parameters for calculation
 * @returns {Object} - Validation result
 */
const validateParams = (params) => {
  const { projectType, capacity, location } = params;

  // Validate project type
  const validProjectTypes = ['solar', 'wind', 'hydro', 'geothermal', 'biomass', 'other'];
  if (!projectType || !validProjectTypes.includes(projectType)) {
    return {
      isValid: false,
      message: `Invalid project type. Must be one of: ${validProjectTypes.join(', ')}`
    };
  }

  // Validate capacity
  if (!capacity || isNaN(capacity) || capacity <= 0 || capacity > 1000000) {
    return {
      isValid: false,
      message: 'Invalid capacity. Must be a positive number between 1 and 1,000,000 kW'
    };
  }

  // Validate location
  const validLocations = ['urban', 'rural', 'remote', 'sunny', 'windy', 'default'];
  if (!location || !validLocations.includes(location)) {
    return {
      isValid: false,
      message: `Invalid location. Must be one of: ${validLocations.join(', ')}`
    };
  }

  return { isValid: true };
};

/**
 * إنشاء مفتاح التخزين المؤقت للحسابات
 * @param {string} type - نوع الحساب
 * @param {Object} params - معلمات الحساب
 * @returns {string} - مفتاح التخزين المؤقت
 */
const createCacheKey = (type, params) => {
  const { projectType, capacity, location } = params;
  // تقريب السعة إلى أقرب 5 كيلوواط للتخزين المؤقت
  const roundedCapacity = Math.round(capacity / 5) * 5;
  return `calc:${type}:${projectType}:${roundedCapacity}:${location}`;
};

/**
 * Perform energy-related calculations
 * @param {string} type - Type of calculation (cost, energy, roi)
 * @param {Object} params - Parameters for calculation
 * @returns {Object} - Calculation results
 */
const performCalculation = async (type, params) => {
  // Validate calculation type
  const validTypes = ['cost', 'energy', 'roi'];
  if (!type || !validTypes.includes(type)) {
    throw new Error(`Invalid calculation type. Must be one of: ${validTypes.join(', ')}`);
  }

  // Validate parameters
  const validation = validateParams(params);
  if (!validation.isValid) {
    throw new Error(validation.message);
  }

  const { projectType, capacity, location } = params;

  // التحقق من وجود النتائج في التخزين المؤقت
  const cacheKey = createCacheKey(type, params);
  const cachedResult = await cacheService.get(cacheKey);

  if (cachedResult) {
    console.log(`Using cached calculation result for ${cacheKey}`);
    return cachedResult;
  }

  // إجراء الحسابات إذا لم تكن موجودة في التخزين المؤقت
  let result;

  console.time(`Calculation: ${type}`);
  switch (type) {
    case 'cost':
      result = calculateCost(projectType, capacity, location);
      break;
    case 'energy':
      result = calculateEnergyProduction(projectType, capacity, location);
      break;
    case 'roi':
      result = calculateROI(projectType, capacity, location);
      break;
    default:
      throw new Error('Invalid calculation type');
  }
  console.timeEnd(`Calculation: ${type}`);

  // تخزين النتائج في التخزين المؤقت
  // استخدام مدة تخزين مؤقت طويلة لأن الحسابات لا تتغير كثيرًا
  await cacheService.set(cacheKey, result, 86400); // 24 ساعة

  return result;
};

/**
 * Calculate project cost
 * @param {string} projectType - Type of energy project
 * @param {number} capacity - Capacity in kW
 * @param {string} location - Project location
 * @returns {Object} - Cost calculation results
 */
const calculateCost = (projectType, capacity, location) => {
  let costPerKw;
  let installationFactor;

  // Cost per kW based on project type
  switch (projectType) {
    case 'solar':
      costPerKw = 1500;
      break;
    case 'wind':
      costPerKw = 1700;
      break;
    case 'hydro':
      costPerKw = 2500;
      break;
    case 'geothermal':
      costPerKw = 3500;
      break;
    case 'biomass':
      costPerKw = 3000;
      break;
    default:
      costPerKw = 2000;
  }

  // Installation factor based on location (simplified)
  switch (location) {
    case 'urban':
      installationFactor = 1.2;
      break;
    case 'rural':
      installationFactor = 1.1;
      break;
    case 'remote':
      installationFactor = 1.3;
      break;
    default:
      installationFactor = 1.15;
  }

  const equipmentCost = capacity * costPerKw;
  const installationCost = equipmentCost * (installationFactor - 1);
  const totalCost = equipmentCost + installationCost;

  return {
    equipmentCost,
    installationCost,
    cost: totalCost,
    costPerKw,
    installationFactor,
    capacity,
    projectType,
    location
  };
};

/**
 * Calculate energy production
 * @param {string} projectType - Type of energy project
 * @param {number} capacity - Capacity in kW
 * @param {string} location - Project location
 * @returns {Object} - Energy production calculation results
 */
const calculateEnergyProduction = (projectType, capacity, location) => {
  let capacityFactor;

  // Capacity factor based on project type and location (simplified)
  switch (projectType) {
    case 'solar':
      capacityFactor = location === 'sunny' ? 0.25 : 0.18;
      break;
    case 'wind':
      capacityFactor = location === 'windy' ? 0.35 : 0.25;
      break;
    case 'hydro':
      capacityFactor = 0.4;
      break;
    case 'geothermal':
      capacityFactor = 0.8;
      break;
    case 'biomass':
      capacityFactor = 0.7;
      break;
    default:
      capacityFactor = 0.3;
  }

  const hoursPerYear = 8760;
  const annualProduction = capacity * capacityFactor * hoursPerYear;
  const homesEquivalent = Math.round(annualProduction / 10000); // Assuming 10,000 kWh per home per year

  return {
    annualProduction,
    capacityFactor,
    hoursPerYear,
    homesEquivalent,
    capacity,
    projectType,
    location
  };
};

/**
 * Calculate return on investment (ROI)
 * @param {string} projectType - Type of energy project
 * @param {number} capacity - Capacity in kW
 * @param {string} location - Project location
 * @returns {Object} - ROI calculation results
 */
const calculateROI = (projectType, capacity, location) => {
  // Get cost and energy production
  const costResult = calculateCost(projectType, capacity, location);
  const energyResult = calculateEnergyProduction(projectType, capacity, location);

  // Assume electricity price ($/kWh)
  const electricityPrice = 0.12;

  // Calculate annual savings/revenue
  const annualSavings = energyResult.annualProduction * electricityPrice;

  // Calculate ROI in years
  const roiYears = costResult.cost / annualSavings;

  return {
    roiYears,
    annualSavings,
    totalCost: costResult.cost,
    annualProduction: energyResult.annualProduction,
    electricityPrice,
    capacity,
    projectType,
    location
  };
};

module.exports = {
  performCalculation,
};
