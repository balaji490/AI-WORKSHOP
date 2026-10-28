import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

import connectDB from './config/db';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';

import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import workshopRoutes from './routes/workshop';
import registrationRoutes from './routes/registration';
import referralRoutes from './routes/referral';
import adminRoutes from './routes/admin';
import ambassadorRoutes from './routes/ambassador';

// Load env
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '5000', 10);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL.replace(/\/$/, '')) ||
      origin.endsWith('.onrender.com') ||
      origin.endsWith('.vercel.app')
    ) {
      return callback(null, true);
    }
    // In production or development, allow origin with credentials
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/ambassadors', ambassadorRoutes);

// Serve frontend static files if built
const frontendDist = path.resolve(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();

  // Seed default admin if none exists
  try {
    const User = (await import('./models/User')).default;
    const { generateReferralCode } = await import('./utils/helpers');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nxtwave.tech';
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const admin = new User({
        name: process.env.ADMIN_NAME || 'Platform Admin',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role: 'admin',
        emailVerified: true,
        college: 'NxtWave',
        branch: 'Administration',
        graduationYear: 2025,
        referralCode: generateReferralCode('ADMIN'),
      });
      await admin.save();
      console.log(`✅ Default admin created on startup: ${adminEmail}`);
    }
  } catch (err) {
    console.warn('⚠️ Admin auto-seed notice:', err);
  }

  // Seed default workshop if none exists
  const Workshop = (await import('./models/Workshop')).default;
  const workshopCount = await Workshop.countDocuments();
  if (workshopCount === 0) {
    await Workshop.create({
      title: 'Build Your First AI Project in 60 Minutes',
      description:
        'Go from AI curiosity to a working project. A free, beginner-friendly online workshop designed for aspiring engineers. Learn how to build a real AI project from scratch with hands-on guidance.',
      duration: 60,
      status: 'published',
    });
    console.log('📦 Default workshop created');
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer().catch(console.error);

export default app;
