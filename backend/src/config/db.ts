import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnecting = false;

const connectDB = async (): Promise<void> => {
  if (isConnecting) return;
  isConnecting = true;
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nxtwave-workshop';
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log('✅ MongoDB connected successfully');
    isConnecting = false;
  } catch (error: any) {
    console.error('❌ MongoDB connection error:', error.message || error);
    if (error.name === 'MongooseServerSelectionError') {
      console.error('👉 TIP: Verify 0.0.0.0/0 is allowed in MongoDB Atlas > Network Access');
    }
    isConnecting = false;
    // Retry in 10 seconds instead of crashing the server
    setTimeout(connectDB, 10000);
  }
};

export default connectDB;
