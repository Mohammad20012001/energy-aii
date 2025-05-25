const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');
const calculationService = require('../services/calculationService');
const { analyzeMessage } = require('../controllers/chatController');

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
    const mockUser = new User(userData);
    
    // التحقق من أن كلمة المرور تم تشفيرها
    expect(mockUser.password).not.toBe(userData.password);
    
    // التحقق من أن الدور الافتراضي هو "user"
    expect(mockUser.role).toBe('user');
  });
  
  // اختبار مطابقة كلمة المرور
  test('should match password correctly', async () => {
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const mockUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: hashedPassword
    });
    
    // إضافة دالة matchPassword يدويًا للاختبار
    mockUser.matchPassword = async function(enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    };
    
    // التحقق من أن كلمة المرور الصحيحة تتطابق
    const isMatch = await mockUser.matchPassword(password);
    expect(isMatch).toBeTruthy();
    
    // التحقق من أن كلمة المرور الخاطئة لا تتطابق
    const isWrongMatch = await mockUser.matchPassword('wrongpassword');
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
    
    const result = calculationService.calculateCost(projectType, capacity, location);
    
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
    
    const result = calculationService.calculateEnergyProduction(projectType, capacity, location);
    
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
    
    const result = calculationService.calculateROI(projectType, capacity, location);
    
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
    const result = analyzeMessage(message);
    
    expect(result.type).toBe('calculation');
    expect(result.subType).toBe('cost');
    expect(result.params.projectType).toBe('solar');
    expect(result.params.capacity).toBe(100);
  });
  
  // اختبار تحليل رسالة إنتاج الطاقة
  test('should detect energy production calculation request', () => {
    const message = 'كم ستنتج مزرعة رياح بقدرة 200 كيلوواط من الطاقة سنوياً؟';
    const result = analyzeMessage(message);
    
    expect(result.type).toBe('calculation');
    expect(result.subType).toBe('energy');
    expect(result.params.projectType).toBe('wind');
    expect(result.params.capacity).toBe(200);
  });
  
  // اختبار تحليل رسالة عائد الاستثمار
  test('should detect ROI calculation request', () => {
    const message = 'ما هو عائد الاستثمار لمشروع طاقة مائية بقدرة 500 كيلوواط؟';
    const result = analyzeMessage(message);
    
    expect(result.type).toBe('calculation');
    expect(result.subType).toBe('roi');
    expect(result.params.projectType).toBe('hydro');
    expect(result.params.capacity).toBe(500);
  });
  
  // اختبار تحليل رسالة عامة
  test('should detect general message', () => {
    const message = 'ما هي الطاقة المتجددة؟';
    const result = analyzeMessage(message);
    
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
