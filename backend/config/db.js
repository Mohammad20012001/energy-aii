const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Skip database connection in test environment
    if (process.env.NODE_ENV === 'test') {
      console.log('Skipping database connection in test environment');
      return;
    }

    // Check if MONGODB_URI exists
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/energy-ai';

    const conn = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);

    // In test environment, don't exit - just log the error
    if (process.env.NODE_ENV === 'test') {
      console.log('Continuing without database in test mode');
      return;
    }

    // Don't exit in production, just log the error
    if (process.env.NODE_ENV !== 'production') {
      console.log('Retrying database connection in 5 seconds...');
      setTimeout(connectDB, 5000);
    }
  }
};

module.exports = connectDB;
