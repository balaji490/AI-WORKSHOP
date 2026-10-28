import { Router, Response } from 'express';
import Registration from '../models/Registration';
import Workshop from '../models/Workshop';
import Referral from '../models/Referral';
import User from '../models/User';
import { AuthRequest, authenticate } from '../middleware/auth';
import { registrationLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/registrations — register for workshop
router.post(
  '/',
  authenticate,
  registrationLimiter,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?._id;
      const { workshopId, channel, referralCode } = req.body;

      // Find workshop
      let workshop;
      if (workshopId) {
        workshop = await Workshop.findById(workshopId);
      } else {
        // Default to the first published workshop
        workshop = await Workshop.findOne({ status: { $in: ['published', 'scheduled', 'draft'] } })
          .sort({ createdAt: -1 });
      }

      if (!workshop) {
        res.status(404).json({ error: 'Workshop not found' });
        return;
      }

      // Check for existing registration
      const existingReg = await Registration.findOne({
        userId,
        workshopId: workshop._id,
      });

      if (existingReg) {
        res.status(409).json({
          error: 'You are already registered for this workshop',
          registration: existingReg,
        });
        return;
      }

      // Create registration
      const registration = new Registration({
        userId,
        workshopId: workshop._id,
        status: 'confirmed',
        channel: channel || 'direct',
        referralCode: referralCode || undefined,
      });

      await registration.save();

      // Process referral attribution
      if (referralCode) {
        // Find the referrer
        const referrer = await User.findOne({ referralCode });

        if (referrer && referrer._id.toString() !== userId?.toString()) {
          // Create referral record — prevent self-referral
          try {
            const referral = new Referral({
              referrerId: referrer._id,
              referralCode,
              referredUserId: userId,
              referredRegistrationId: registration._id,
              status: 'completed',
              attributedAt: new Date(),
            });
            await referral.save();
          } catch (err: any) {
            // Ignore duplicate referral errors
            if (err.code !== 11000) {
              console.error('Referral attribution error:', err.message);
            }
          }
        }
      }

      res.status(201).json({
        message: 'Registration successful',
        registration,
      });
    } catch (error: any) {
      if (error.code === 11000) {
        res.status(409).json({ error: 'You are already registered for this workshop' });
        return;
      }
      console.error('Registration error:', error.message);
      res.status(500).json({ error: 'Registration failed' });
    }
  }
);

// GET /api/registrations/my — get user's registrations
router.get(
  '/my',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const registrations = await Registration.find({ userId: req.user?._id })
        .populate('workshopId')
        .sort({ createdAt: -1 });

      res.json({ registrations });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch registrations' });
    }
  }
);

// GET /api/registrations/my/status — quick registration status check
router.get(
  '/my/status',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const registration = await Registration.findOne({ userId: req.user?._id })
        .populate('workshopId');

      res.json({
        registered: !!registration,
        registration: registration || null,
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to check registration status' });
    }
  }
);

export default router;
