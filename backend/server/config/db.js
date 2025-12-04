import mongoose from 'mongoose';

let isConnected = false;

const connectDB = async () => {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.warn('⚠️  MONGODB_URI is not defined in environment. Skipping MongoDB connection.');
    console.warn('Create a `.env` file with `MONGODB_URI` to enable DB connection.');
    return false;
  }

  // If already connected, return early
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('✅ Using existing MongoDB connection');
    return true;
  }

  try {
    // Set connection options for serverless
    const options = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    await mongoose.connect(MONGODB_URI, options);
    isConnected = true;
    console.log('✅ MongoDB Atlas connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    isConnected = false;
    // Don't exit in serverless - just log and continue
    return false;
  }
};

export default connectDB;
