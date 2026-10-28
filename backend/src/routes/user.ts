import { Router, Response } from 'express';
import User from '../models/User';
import { AuthRequest, authenticate } from '../middleware/auth';
import { updateProfileSchema } from '../utils/validation';

const router = Router();

// GET /api/user/profile
router.get('/profile', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({ user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/user/profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { $set: parsed.data },
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ message: 'Profile updated', user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
