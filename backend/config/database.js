const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/shopease';
    
    const conn = await mongoose.connect(mongoUri, {
      // Modern options (useNewUrlParser and useUnifiedTopology are no longer needed in Mongoose 6+)
      maxPoolSize: 10,
      minPoolSize: 5,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true
    });

    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('✗ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠ MongoDB disconnected');
    });

    return conn;
  } catch (error) {
    console.error('✗ Database connection error:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
