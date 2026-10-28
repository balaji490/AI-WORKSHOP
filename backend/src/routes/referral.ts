import { Router, Response } from 'express';
import User from '../models/User';
import Referral from '../models/Referral';
import { AuthRequest, authenticate } from '../middleware/auth';

const router = Router();

// GET /api/referrals/validate/:code — public, validate a referral code
router.get('/validate/:code', async (req, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const user = await User.findOne({ referralCode: code }).select('name college referralCode');

    if (!user) {
      res.status(404).json({ valid: false, error: 'Invalid referral code' });
      return;
    }

    res.json({
      valid: true,
      referrer: {
        name: user.name.split(' ')[0], // First name only for privacy
        college: user.college,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate referral code' });
  }
});

// GET /api/referrals/my — get user's referral stats
router.get('/my', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    const referrals = await Referral.find({ referrerId: userId })
      .populate('referredUserId', 'name college createdAt')
      .sort({ createdAt: -1 });

    const totalReferrals = referrals.length;
    const completedReferrals = referrals.filter((r) => r.status === 'completed').length;
    const conversionRate =
      totalReferrals > 0
        ? Math.round((completedReferrals / totalReferrals) * 10000) / 100
        : 0;

    res.json({
      referralCode: req.user?.referralCode,
      totalReferrals,
      completedReferrals,
      conversionRate,
      referrals: referrals.map((r) => ({
        id: r._id,
        status: r.status,
        referredUser: r.referredUserId
          ? {
              name: (r.referredUserId as any).name,
              college: (r.referredUserId as any).college,
              joinedAt: (r.referredUserId as any).createdAt,
            }
          : null,
        attributedAt: r.attributedAt,
        createdAt: r.createdAt,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch referral data' });
  }
});

// GET /api/referrals/leaderboard — public leaderboard
router.get('/leaderboard', async (_req, res: Response): Promise<void> => {
  try {
    const leaderboard = await Referral.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$referrerId',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 1,
          count: 1,
          name: '$user.name',
          college: '$user.college',
        },
      },
    ]);

    // Mask last names for privacy
    const maskedLeaderboard = leaderboard.map((entry, index) => {
      const nameParts = entry.name.split(' ');
      const displayName =
        nameParts.length > 1
          ? `${nameParts[0]} ${nameParts[1][0]}.`
          : nameParts[0];

      return {
        rank: index + 1,
        displayName,
        college: entry.college,
        referralCount: entry.count,
      };
    });

    res.json({ leaderboard: maskedLeaderboard });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

export default router;
