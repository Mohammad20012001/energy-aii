const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log('MongoDB Connected');
    } else {
      console.log('No MongoDB URI - running in demo mode');
    }
  } catch (error) {
    console.log('MongoDB connection failed - running in demo mode');
  }
};

connectDB();

// Simple User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: { type: String, default: 'user' }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Energy.AI Backend is running',
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Energy.AI Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Please provide name, email and password'
      });
    }

    // Demo mode - always succeed
    const token = jwt.sign(
      { id: '123', email: email },
      process.env.JWT_SECRET || 'demo-secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      _id: '123',
      name: name,
      email: email,
      role: 'user',
      token: token
    });

  } catch (error) {
    res.status(500).json({
      message: 'Server error during registration'
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password'
      });
    }

    // Demo mode - always succeed with valid email
    if (email.includes('@')) {
      const token = jwt.sign(
        { id: '123', email: email },
        process.env.JWT_SECRET || 'demo-secret',
        { expiresIn: '30d' }
      );

      res.json({
        _id: '123',
        name: 'Demo User',
        email: email,
        role: 'user',
        token: token
      });
    } else {
      res.status(401).json({
        message: 'Invalid credentials'
      });
    }

  } catch (error) {
    res.status(500).json({
      message: 'Server error during login'
    });
  }
});

// Initialize Google Gemini
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

// Chat endpoint with Google Gemini
app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }

    // If Gemini API is available, use it
    if (genAI && process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `أنت مساعد ذكي متخصص في هندسة الطاقة. أجب على السؤال التالي باللغة العربية بطريقة مفيدة ومفصلة:

السؤال: ${message}

يرجى تقديم إجابة مفيدة ومتخصصة في مجال الطاقة والهندسة.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({
          response: text,
          timestamp: new Date().toISOString(),
          source: 'gemini'
        });
      } catch (aiError) {
        console.error('Gemini AI Error:', aiError);
        // Fallback to simple responses
        const fallbackResponses = [
          'مرحباً! كيف يمكنني مساعدتك في حسابات الطاقة؟',
          'يمكنني مساعدتك في حساب استهلاك الطاقة والتكاليف.',
          'هل تريد حساب الطاقة المطلوبة لمشروعك؟',
          'أستطيع مساعدتك في تحليل كفاءة الطاقة.'
        ];

        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

        res.json({
          response: randomResponse,
          timestamp: new Date().toISOString(),
          source: 'fallback'
        });
      }
    } else {
      // Fallback responses when no API key
      const responses = [
        'مرحباً! كيف يمكنني مساعدتك في حسابات الطاقة؟',
        'يمكنني مساعدتك في حساب استهلاك الطاقة والتكاليف.',
        'هل تريد حساب الطاقة المطلوبة لمشروعك؟',
        'أستطيع مساعدتك في تحليل كفاءة الطاقة.',
        'لتفعيل الذكاء الاصطناعي المتقدم، يرجى إضافة مفتاح Google Gemini API.'
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      res.json({
        response: randomResponse,
        timestamp: new Date().toISOString(),
        source: 'demo'
      });
    }

  } catch (error) {
    console.error('Chat Error:', error);
    res.status(500).json({
      error: 'حدث خطأ في معالجة رسالتك'
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
