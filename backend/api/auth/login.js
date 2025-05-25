// Simple login endpoint for Vercel
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Please provide email and password'
      });
    }

    // Simple validation for demo
    if (email && password) {
      const token = jwt.sign(
        { id: '123', email: email },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '30d' }
      );

      return res.status(200).json({
        _id: '123',
        name: 'Demo User',
        email: email,
        role: 'user',
        token: token
      });
    }

    return res.status(401).json({
      message: 'Invalid credentials'
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      message: 'Server error during login'
    });
  }
};
