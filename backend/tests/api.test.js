const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../server');
const User = require('../models/User');
const Project = require('../models/Project');
const Chat = require('../models/Chat');

let mongoServer;
let token;
let userId;
let projectId;
let chatId;

// إعداد قاعدة بيانات اختبار في الذاكرة
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

// إغلاق الاتصال بقاعدة البيانات بعد الانتهاء من الاختبارات
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// مسح البيانات بين الاختبارات
afterEach(async () => {
  if (mongoose.connection.readyState === 1) {
    // await User.deleteMany({});
    // await Project.deleteMany({});
    // await Chat.deleteMany({});
  }
});

describe('Auth API', () => {
  // اختبار تسجيل مستخدم جديد
  test('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('Test User');
    expect(res.body.email).toBe('test@example.com');

    // حفظ معرف المستخدم والرمز للاختبارات اللاحقة
    userId = res.body._id;
    token = res.body.token;
  });

  // اختبار تسجيل الدخول
  test('should login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.email).toBe('test@example.com');

    // تحديث الرمز للاختبارات اللاحقة
    token = res.body.token;
  });

  // اختبار فشل تسجيل الدخول بكلمة مرور خاطئة
  test('should not login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  // اختبار الحصول على معلومات المستخدم
  test('should get user profile', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('Test User');
    expect(res.body.email).toBe('test@example.com');
  });
});

describe('Projects API', () => {
  // اختبار إنشاء مشروع جديد
  test('should create a new project', async () => {
    const res = await request(app)
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Project',
        type: 'solar',
        location: 'Amman, Jordan',
        capacity: 100,
        status: 'planning',
        notes: 'This is a test project'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('Test Project');
    expect(res.body.type).toBe('solar');
    expect(res.body.capacity).toBe(100);

    // حفظ معرف المشروع للاختبارات اللاحقة
    projectId = res.body._id;
  });

  // اختبار الحصول على قائمة المشاريع
  test('should get all projects for user', async () => {
    const res = await request(app)
      .get('/api/projects')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(Array.isArray(res.body.data)).toBeTruthy();
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  // اختبار الحصول على مشروع محدد
  test('should get a specific project', async () => {
    const res = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data._id).toBe(projectId);
    expect(res.body.data.name).toBe('Test Project');
  });

  // اختبار تحديث مشروع
  test('should update a project', async () => {
    const res = await request(app)
      .put(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Updated Project',
        capacity: 150
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe('Updated Project');
    expect(res.body.capacity).toBe(150);
    expect(res.body.type).toBe('solar'); // يجب أن تظل القيم الأخرى كما هي
  });

  // اختبار حذف مشروع
  test('should delete a project', async () => {
    const res = await request(app)
      .delete(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', projectId);

    // التأكد من أن المشروع قد تم حذفه
    const checkRes = await request(app)
      .get(`/api/projects/${projectId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(checkRes.statusCode).toBe(404);
  });
});

describe('Chat API', () => {
  // اختبار إنشاء محادثة جديدة
  test('should create a new chat', async () => {
    const res = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Chat'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toBe('Test Chat');
    expect(res.body.user.toString()).toBe(userId);
    expect(Array.isArray(res.body.messages)).toBeTruthy();
    expect(res.body.messages.length).toBe(0);

    // حفظ معرف المحادثة للاختبارات اللاحقة
    chatId = res.body._id;
  });

  // اختبار إرسال رسالة إلى محادثة
  test('should send a message to chat', async () => {
    const res = await request(app)
      .post(`/api/chat/${chatId}/message`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        message: 'Hello, AI assistant!'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('messages');
    expect(Array.isArray(res.body.messages)).toBeTruthy();
    expect(res.body.messages.length).toBeGreaterThan(0);

    // التحقق من رسالة المستخدم
    const userMessage = res.body.messages[0];
    expect(userMessage.sender).toBe('user');
    expect(userMessage.content).toBe('Hello, AI assistant!');

    // التحقق من رد الذكاء الاصطناعي
    const aiMessage = res.body.messages[1];
    expect(aiMessage.sender).toBe('ai');
    expect(aiMessage.content).toBeTruthy();
  });

  // اختبار الحصول على قائمة المحادثات
  test('should get all chats for user', async () => {
    const res = await request(app)
      .get('/api/chat')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBeTruthy();
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('_id');
    expect(res.body[0]).toHaveProperty('title');
  });

  // اختبار الحصول على محادثة محددة
  test('should get a specific chat', async () => {
    const res = await request(app)
      .get(`/api/chat/${chatId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('_id', chatId);
    expect(res.body).toHaveProperty('title', 'Test Chat');
    expect(Array.isArray(res.body.messages)).toBeTruthy();
  });

  // اختبار حذف محادثة
  test('should delete a chat', async () => {
    const res = await request(app)
      .delete(`/api/chat/${chatId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', chatId);

    // التأكد من أن المحادثة قد تم حذفها
    const checkRes = await request(app)
      .get(`/api/chat/${chatId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(checkRes.statusCode).toBe(404);
  });
});

describe('Calculation Service', () => {
  // اختبار حساب تكلفة مشروع
  test('should calculate project cost', async () => {
    const res = await request(app)
      .post('/api/chat')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Cost Calculation'
      });

    expect(res.statusCode).toBe(201);
    const newChatId = res.body._id;

    const messageRes = await request(app)
      .post(`/api/chat/${newChatId}/message`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        message: 'ما هي تكلفة مشروع طاقة شمسية بقدرة 200 كيلوواط؟'
      });

    expect(messageRes.statusCode).toBe(200);
    expect(messageRes.body.messages.length).toBeGreaterThan(1);

    // التحقق من أن الرد يحتوي على معلومات التكلفة
    const aiResponse = messageRes.body.messages[1].content;
    expect(aiResponse).toContain('تكلفة');
    // Check for 200 in either Arabic or English numerals
    expect(aiResponse.includes('200') || aiResponse.includes('٢٠٠')).toBe(true);
  });
});
