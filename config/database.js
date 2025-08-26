const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Only try to connect if MONGODB_URI is provided
    if (!process.env.MONGODB_URI) {
      console.log('⚠️ No MONGODB_URI provided, skipping database connection');
      console.log('📝 Set MONGODB_URI in your .env file to enable database features');
      return;
    }

    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔄 MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    console.log('⚠️ Server will continue without database connection');
  }
};

module.exports = connectDB;
