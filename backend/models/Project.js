const mongoose = require('mongoose');

const projectSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
      index: true // إضافة فهرس للمستخدم لتسريع الاستعلامات حسب المستخدم
    },
    name: {
      type: String,
      required: [true, 'Please add a project name'],
      trim: true,
      maxlength: [100, 'Project name cannot be more than 100 characters']
    },
    type: {
      type: String,
      enum: ['solar', 'wind', 'hydro', 'geothermal', 'biomass', 'other'],
      required: true,
      index: true // إضافة فهرس للنوع لتسريع الاستعلامات حسب النوع
    },
    location: {
      type: String,
      required: [true, 'Please add a location'],
      trim: true,
      maxlength: [100, 'Location cannot be more than 100 characters']
    },
    capacity: {
      type: Number,
      required: [true, 'Please add capacity in kW'],
      min: [0, 'Capacity cannot be negative'],
      index: true // إضافة فهرس للسعة لتسريع الاستعلامات حسب السعة
    },
    estimatedCost: {
      type: Number,
      required: [true, 'Please add estimated cost'],
      min: [0, 'Cost cannot be negative']
    },
    annualProduction: {
      type: Number,
      required: [true, 'Please add annual production in kWh'],
      min: [0, 'Production cannot be negative']
    },
    roi: {
      type: Number,
      required: [true, 'Please add ROI in years'],
      min: [0, 'ROI cannot be negative']
    },
    co2Reduction: {
      type: Number,
      required: [true, 'Please add CO2 reduction in tons/year'],
      min: [0, 'CO2 reduction cannot be negative']
    },
    status: {
      type: String,
      enum: ['planning', 'in-progress', 'completed', 'cancelled'],
      default: 'planning',
      index: true // إضافة فهرس للحالة لتسريع الاستعلامات حسب الحالة
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot be more than 1000 characters']
    },
  },
  {
    timestamps: true,
  }
);

// إضافة فهرس نصي للبحث
projectSchema.index(
  {
    name: 'text',
    location: 'text',
    notes: 'text'
  },
  {
    weights: {
      name: 10,      // أهمية أعلى لاسم المشروع
      location: 5,   // أهمية متوسطة للموقع
      notes: 1       // أهمية أقل للملاحظات
    },
    name: 'project_text_index'
  }
);

// إضافة فهرس مركب للاستعلامات الشائعة
projectSchema.index({ user: 1, type: 1, status: 1 });
projectSchema.index({ user: 1, createdAt: -1 });
projectSchema.index({ user: 1, capacity: -1 });

module.exports = mongoose.model('Project', projectSchema);
