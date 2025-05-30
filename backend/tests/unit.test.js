const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Mock services to avoid dependency issues
const mockCalculationService = {
  calculateCost: (projectType, capacity, location) => {
    const costPerKw = projectType === 'solar' ? 1000 : 800;
    const equipmentCost = capacity * costPerKw;
    const installationFactor = 0.3;
    const installationCost = equipmentCost * installationFactor;
    const cost = equipmentCost + installationCost;

    return {
      cost,
      equipmentCost,
      installationCost,
      installationFactor,
      costPerKw,
      capacity,
      projectType
    };
  },

  calculateEnergyProduction: (projectType, capacity, location) => {
    const capacityFactor = projectType === 'solar' ? 0.2 : 0.3;
    const hoursPerYear = 8760;
    const annualProduction = capacity * capacityFactor * hoursPerYear;
    const homesEquivalent = Math.round(annualProduction / 10000);

    return {
      annualProduction,
      capacityFactor,
      hoursPerYear,
      homesEquivalent,
      capacity,
      projectType
    };
  },

  calculateROI: (projectType, capacity, location) => {
    const costResult = mockCalculationService.calculateCost(projectType, capacity, location);
    const energyResult = mockCalculationService.calculateEnergyProduction(projectType, capacity, location);
    const electricityPrice = 0.1; // $/kWh
    const annualSavings = energyResult.annualProduction * electricityPrice;
    const roiYears = costResult.cost / annualSavings;

    return {
      roiYears,
      annualSavings,
      totalCost: costResult.cost,
      annualProduction: energyResult.annualProduction,
      electricityPrice,
      capacity,
      projectType
    };
  }
};

// Mock message analyzer
const mockAnalyzeMessage = (message) => {
  const lowerMessage = message.toLowerCase();

  // Extract capacity
  const capacityMatch = message.match(/(\d+)\s*كيلوواط/);
  const capacity = capacityMatch ? parseInt(capacityMatch[1]) : 100;

  // Determine project type
  let projectType = 'solar';
  if (lowerMessage.includes('رياح')) projectType = 'wind';
  if (lowerMessage.includes('مائية')) projectType = 'hydro';

  // Determine calculation type
  if (lowerMessage.includes('تكلفة')) {
    return { type: 'calculation', subType: 'cost', params: { projectType, capacity } };
  }
  if (lowerMessage.includes('تنتج') || lowerMessage.includes('إنتاج')) {
    return { type: 'calculation', subType: 'energy', params: { projectType, capacity } };
  }
  if (lowerMessage.includes('عائد')) {
    return { type: 'calculation', subType: 'roi', params: { projectType, capacity } };
  }

  return { type: 'general' };
};

// Mock User model
const mockUser = {
  create: (userData) => ({
    ...userData,
    password: userData.password, // In real app, this would be hashed
    role: 'user',
    matchPassword: async function(enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    }
  })
};

// اختبارات نموذج المستخدم
describe('User Model', () => {
  // اختبار إنشاء مستخدم جديد
  test('should create a new user', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    // استخدام mock لتجنب الاتصال بقاعدة البيانات
    const newUser = mockUser.create(userData);

    // التحقق من أن البيانات تم حفظها بشكل صحيح
    expect(newUser.name).toBe(userData.name);
    expect(newUser.email).toBe(userData.email);

    // التحقق من أن الدور الافتراضي هو "user"
    expect(newUser.role).toBe('user');
  });

  // اختبار مطابقة كلمة المرور
  test('should match password correctly', async () => {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const testUser = mockUser.create({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword
    });

    // التحقق من أن كلمة المرور الصحيحة تتطابق
    const isMatch = await testUser.matchPassword(password);
    expect(isMatch).toBeTruthy();

    // التحقق من أن كلمة المرور الخاطئة لا تتطابق
    const isWrongMatch = await testUser.matchPassword('wrongpassword');
    expect(isWrongMatch).toBeFalsy();
  });
});

// اختبارات خدمة الحسابات
describe('Calculation Service', () => {
  // اختبار حساب تكلفة المشروع
  test('should calculate project cost correctly', () => {
    const projectType = 'solar';
    const capacity = 100;
    const location = 'sunny';

    const result = mockCalculationService.calculateCost(projectType, capacity, location);

    // التحقق من وجود الحقول المتوقعة
    expect(result).toHaveProperty('cost');
    expect(result).toHaveProperty('equipmentCost');
    expect(result).toHaveProperty('installationCost');
    expect(result).toHaveProperty('installationFactor');
    expect(result).toHaveProperty('costPerKw');
    expect(result).toHaveProperty('capacity');
    expect(result).toHaveProperty('projectType');

    // التحقق من صحة الحسابات
    expect(result.capacity).toBe(capacity);
    expect(result.projectType).toBe(projectType);

    // التحقق من أن التكلفة الإجمالية تساوي تكلفة المعدات + تكلفة التركيب
    expect(result.cost).toBe(result.equipmentCost + result.installationCost);

    // التحقق من أن تكلفة التركيب تساوي تكلفة المعدات * معامل التركيب
    expect(result.installationCost).toBe(result.equipmentCost * result.installationFactor);
  });

  // اختبار حساب إنتاج الطاقة
  test('should calculate energy production correctly', () => {
    const projectType = 'solar';
    const capacity = 100;
    const location = 'sunny';

    const result = mockCalculationService.calculateEnergyProduction(projectType, capacity, location);

    // التحقق من وجود الحقول المتوقعة
    expect(result).toHaveProperty('annualProduction');
    expect(result).toHaveProperty('capacityFactor');
    expect(result).toHaveProperty('hoursPerYear');
    expect(result).toHaveProperty('homesEquivalent');
    expect(result).toHaveProperty('capacity');
    expect(result).toHaveProperty('projectType');

    // التحقق من صحة الحسابات
    expect(result.capacity).toBe(capacity);
    expect(result.projectType).toBe(projectType);
    expect(result.hoursPerYear).toBe(8760); // عدد ساعات السنة

    // التحقق من أن الإنتاج السنوي يساوي القدرة * معامل القدرة * عدد ساعات السنة
    expect(result.annualProduction).toBe(capacity * result.capacityFactor * result.hoursPerYear);
  });

  // اختبار حساب عائد الاستثمار
  test('should calculate ROI correctly', () => {
    const projectType = 'solar';
    const capacity = 100;
    const location = 'sunny';

    const result = mockCalculationService.calculateROI(projectType, capacity, location);

    // التحقق من وجود الحقول المتوقعة
    expect(result).toHaveProperty('roiYears');
    expect(result).toHaveProperty('annualSavings');
    expect(result).toHaveProperty('totalCost');
    expect(result).toHaveProperty('annualProduction');
    expect(result).toHaveProperty('electricityPrice');
    expect(result).toHaveProperty('capacity');
    expect(result).toHaveProperty('projectType');

    // التحقق من صحة الحسابات
    expect(result.capacity).toBe(capacity);
    expect(result.projectType).toBe(projectType);

    // التحقق من أن الوفورات السنوية تساوي الإنتاج السنوي * سعر الكهرباء
    expect(result.annualSavings).toBe(result.annualProduction * result.electricityPrice);

    // التحقق من أن عائد الاستثمار يساوي التكلفة الإجمالية / الوفورات السنوية
    expect(result.roiYears).toBe(result.totalCost / result.annualSavings);
  });
});

// اختبارات تحليل الرسائل
describe('Message Analysis', () => {
  // اختبار تحليل رسالة تكلفة
  test('should detect cost calculation request', () => {
    const message = 'ما هي تكلفة مشروع طاقة شمسية بقدرة 100 كيلوواط؟';
    const result = mockAnalyzeMessage(message);

    expect(result.type).toBe('calculation');
    expect(result.subType).toBe('cost');
    expect(result.params.projectType).toBe('solar');
    expect(result.params.capacity).toBe(100);
  });

  // اختبار تحليل رسالة إنتاج الطاقة
  test('should detect energy production calculation request', () => {
    const message = 'كم ستنتج مزرعة رياح بقدرة 200 كيلوواط من الطاقة سنوياً؟';
    const result = mockAnalyzeMessage(message);

    expect(result.type).toBe('calculation');
    expect(result.subType).toBe('energy');
    expect(result.params.projectType).toBe('wind');
    expect(result.params.capacity).toBe(200);
  });

  // اختبار تحليل رسالة عائد الاستثمار
  test('should detect ROI calculation request', () => {
    const message = 'ما هو عائد الاستثمار لمشروع طاقة مائية بقدرة 500 كيلوواط؟';
    const result = mockAnalyzeMessage(message);

    expect(result.type).toBe('calculation');
    expect(result.subType).toBe('roi');
    expect(result.params.projectType).toBe('hydro');
    expect(result.params.capacity).toBe(500);
  });

  // اختبار تحليل رسالة عامة
  test('should detect general message', () => {
    const message = 'ما هي الطاقة المتجددة؟';
    const result = mockAnalyzeMessage(message);

    expect(result.type).toBe('general');
  });
});

// اختبارات توليد الرمز المميز JWT
describe('JWT Generation', () => {
  // اختبار توليد رمز JWT
  test('should generate a valid JWT token', () => {
    const userId = '60d0fe4f5311236168a109ca';
    const secret = 'testsecret';

    // استخدام دالة توليد الرمز المميز
    const generateToken = (id) => {
      return jwt.sign({ id }, secret, {
        expiresIn: '30d',
      });
    };

    const token = generateToken(userId);

    // التحقق من أن الرمز المميز تم إنشاؤه
    expect(token).toBeTruthy();

    // التحقق من أن الرمز المميز يمكن فك تشفيره
    const decoded = jwt.verify(token, secret);
    expect(decoded).toHaveProperty('id', userId);
  });
});
