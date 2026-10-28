import { Router, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { signupSchema, loginSchema } from '../utils/validation';
import { generateReferralCode, generateSecureToken } from '../utils/helpers';
import {
  AuthRequest,
  authenticate,
  generateTokens,
  setTokenCookies,
} from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/auth/signup
router.post('/signup', authLimiter, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { name, email, password, college, branch, graduationYear, phone, referralCode } =
      parsed.data;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({
        error: 'An account with this email already exists. Please log in instead.',
        code: 'EMAIL_EXISTS',
      });
      return;
    }

    // Generate unique referral code
    let userReferralCode = generateReferralCode();
    while (await User.findOne({ referralCode: userReferralCode })) {
      userReferralCode = generateReferralCode();
    }

    // Create verification token
    const emailVerificationToken = generateSecureToken();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create user (password hashing is handled by pre-save hook)
    const user = new User({
      name,
      email,
      password,
      college,
      branch,
      graduationYear,
      phone,
      referralCode: userReferralCode,
      emailVerificationToken,
      emailVerificationExpires,
      // In development, auto-verify email
      emailVerified: process.env.NODE_ENV === 'development',
    });

    await user.save();

    // Generate tokens
    const tokens = generateTokens(user);
    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    res.status(201).json({
      message: 'Account created successfully',
      user: user.toJSON(),
      accessToken: tokens.accessToken,
      referralCodeUsed: referralCode || null,
    });
  } catch (error: any) {
    console.error('Signup error:', error.message);
    if (error.code === 11000) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }
    res.status(500).json({ error: 'Failed to create account' });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const { email, password } = parsed.data;

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const tokens = generateTokens(user);
    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    res.json({
      message: 'Login successful',
      user: user.toJSON(),
      accessToken: tokens.accessToken,
    });
  } catch (error: any) {
    console.error('Login error:', error.message);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/logout
router.post('/logout', (_req, res: Response): void => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken', { path: '/api/auth/refresh' });
  res.json({ message: 'Logged out successfully' });
});

// POST /api/auth/refresh
router.post('/refresh', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      res.status(401).json({ error: 'No refresh token provided' });
      return;
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret'
    ) as { userId: string; role: string };

    const user = await User.findById(decoded.userId);
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const tokens = generateTokens(user);
    setTokenCookies(res, tokens.accessToken, tokens.refreshToken);

    res.json({
      message: 'Token refreshed',
      accessToken: tokens.accessToken,
      user: user.toJSON(),
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({ user: req.user?.toJSON() });
});

// POST /api/auth/verify-email
router.post('/verify-email', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    if (!token) {
      res.status(400).json({ error: 'Verification token is required' });
      return;
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired verification token' });
      return;
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Email verification failed' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', authLimiter, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always return success to prevent email enumeration
    if (!user) {
      res.json({ message: 'If an account exists with that email, a reset link will be sent.' });
      return;
    }

    user.passwordResetToken = generateSecureToken();
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // In production, send email here
    console.log(`[DEV] Password reset token for ${email}: ${user.passwordResetToken}`);

    res.json({ message: 'If an account exists with that email, a reset link will be sent.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process request' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', authLimiter, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      res.status(400).json({ error: 'Token and new password are required' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ error: 'Password must be at least 8 characters' });
      return;
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      res.status(400).json({ error: 'Invalid or expired reset token' });
      return;
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Password reset failed' });
  }
});

export default router;
