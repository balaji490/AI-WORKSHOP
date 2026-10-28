import { Router, Response } from 'express';
import Ambassador from '../models/Ambassador';
import Referral from '../models/Referral';
import Registration from '../models/Registration';
import User from '../models/User';
import { AuthRequest, authenticate, authorize } from '../middleware/auth';
import { ambassadorSchema } from '../utils/validation';
import { generateReferralCode } from '../utils/helpers';

const router = Router();

router.use(authenticate, authorize('admin'));

// GET /api/admin/ambassadors
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ambassadors = await Ambassador.find().sort({ createdAt: -1 });

    // Enrich with registration counts
    const enriched = await Promise.all(
      ambassadors.map(async (amb) => {
        const referralCount = await Referral.countDocuments({
          referralCode: amb.referralCode,
          status: 'completed',
        });
        return {
          ...amb.toJSON(),
          registrationCount: referralCount,
        };
      })
    );

    res.json({ ambassadors: enriched });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch ambassadors' });
  }
});

// POST /api/admin/ambassadors
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = ambassadorSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    // Generate referral code if not provided
    let code = parsed.data.referralCode || generateReferralCode('AMB');
    while (await Ambassador.findOne({ referralCode: code })) {
      code = generateReferralCode('AMB');
    }

    const ambassador = new Ambassador({
      ...parsed.data,
      referralCode: code,
    });

    await ambassador.save();
    res.status(201).json({ message: 'Ambassador created', ambassador });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(409).json({ error: 'Referral code already exists' });
      return;
    }
    res.status(500).json({ error: 'Failed to create ambassador' });
  }
});

// PUT /api/admin/ambassadors/:id
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = ambassadorSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: parsed.error.flatten().fieldErrors,
      });
      return;
    }

    const ambassador = await Ambassador.findByIdAndUpdate(
      req.params.id,
      { $set: parsed.data },
      { new: true }
    );

    if (!ambassador) {
      res.status(404).json({ error: 'Ambassador not found' });
      return;
    }

    res.json({ message: 'Ambassador updated', ambassador });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update ambassador' });
  }
});

// DELETE /api/admin/ambassadors/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const ambassador = await Ambassador.findByIdAndDelete(req.params.id);
    if (!ambassador) {
      res.status(404).json({ error: 'Ambassador not found' });
      return;
    }
    res.json({ message: 'Ambassador removed' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to remove ambassador' });
  }
});

export default router;
