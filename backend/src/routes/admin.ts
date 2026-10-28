import { Router, Response } from 'express';
import { AuthRequest, authenticate, authorize } from '../middleware/auth';
import Registration from '../models/Registration';
import User from '../models/User';
import Referral from '../models/Referral';
import Workshop from '../models/Workshop';
import Campaign from '../models/Campaign';
import CampaignChannel from '../models/CampaignChannel';
import CampaignEvent from '../models/CampaignEvent';
import Ambassador from '../models/Ambassador';
import { parsePagination } from '../utils/helpers';
import { campaignSchema, channelSchema } from '../utils/validation';

const router = Router();

// All admin routes require admin role
router.use(authenticate, authorize('admin'));

// GET /api/admin/stats — dashboard summary
router.get('/stats', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalRegistrations = await Registration.countDocuments({ status: 'confirmed' });
    const totalUsers = await User.countDocuments({ role: 'user' });
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const registrationsToday = await Registration.countDocuments({
      status: 'confirmed',
      registeredAt: { $gte: todayStart },
    });
    const totalReferrals = await Referral.countDocuments({ status: 'completed' });

    // Get campaign info
    const campaign = await Campaign.findOne().sort({ createdAt: -1 });
    const target = campaign?.targetRegistrations || 500;
    const budget = campaign?.totalBudget || 2000;

    // Calculate actual spend
    const channels = campaign
      ? await CampaignChannel.find({ campaignId: campaign._id })
      : [];
    const actualSpend = channels.reduce((sum, ch) => sum + ch.actualSpend, 0);
    const costPerReg = totalRegistrations > 0
      ? Math.round((actualSpend / totalRegistrations) * 100) / 100
      : 'N/A';

    res.json({
      totalRegistrations,
      totalUsers,
      registrationsToday,
      totalReferrals,
      target,
      remaining: Math.max(0, target - totalRegistrations),
      progressPercent: Math.round((totalRegistrations / target) * 10000) / 100,
      budget,
      actualSpend,
      remainingBudget: budget - actualSpend,
      costPerRegistration: costPerReg,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/admin/registrations — paginated, searchable, filterable
router.get('/registrations', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { page, limit, skip } = parsePagination(req.query);
    const { search, channel, startDate, endDate } = req.query;

    const filter: any = {};

    if (channel && channel !== 'all') {
      filter.channel = channel;
    }

    if (startDate || endDate) {
      filter.registeredAt = {};
      if (startDate) filter.registeredAt.$gte = new Date(startDate as string);
      if (endDate) filter.registeredAt.$lte = new Date(endDate as string);
    }

    // If search, find matching users first
    let userIds: any[] | undefined;
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');
      const users = await User.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { college: searchRegex },
        ],
      }).select('_id');
      userIds = users.map((u) => u._id);
      filter.userId = { $in: userIds };
    }

    const total = await Registration.countDocuments(filter);
    const registrations = await Registration.find(filter)
      .populate('userId', 'name email college branch graduationYear emailVerified')
      .populate('workshopId', 'title')
      .sort({ registeredAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      registrations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Registrations fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
});

// GET /api/admin/registrations/export — CSV export
router.get('/registrations/export', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { channel, startDate, endDate } = req.query;
    const filter: any = {};
    if (channel && channel !== 'all') filter.channel = channel;
    if (startDate || endDate) {
      filter.registeredAt = {};
      if (startDate) filter.registeredAt.$gte = new Date(startDate as string);
      if (endDate) filter.registeredAt.$lte = new Date(endDate as string);
    }

    const registrations = await Registration.find(filter)
      .populate('userId', 'name email college branch graduationYear')
      .populate('workshopId', 'title')
      .sort({ registeredAt: -1 });

    // Build CSV
    const headers = 'Name,Email,College,Branch,Graduation Year,Workshop,Channel,Status,Registered At\n';
    const rows = registrations
      .map((r) => {
        const u = r.userId as any;
        const w = r.workshopId as any;
        return [
          `"${u?.name || ''}"`,
          `"${u?.email || ''}"`,
          `"${u?.college || ''}"`,
          `"${u?.branch || ''}"`,
          u?.graduationYear || '',
          `"${w?.title || ''}"`,
          r.channel,
          r.status,
          r.registeredAt?.toISOString() || '',
        ].join(',');
      })
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=registrations.csv');
    res.send(headers + rows);
  } catch (error) {
    res.status(500).json({ error: 'Export failed' });
  }
});

// GET /api/admin/analytics/daily — daily registration chart data
router.get('/analytics/daily', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const daily = await Registration.aggregate([
      {
        $match: {
          status: 'confirmed',
          registeredAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$registeredAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing days
    const result: { date: string; count: number }[] = [];
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const found = daily.find((item) => item._id === dateStr);
      result.push({ date: dateStr, count: found?.count || 0 });
    }

    res.json({ daily: result });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch daily analytics' });
  }
});

// GET /api/admin/analytics/channels — registrations by channel
router.get('/analytics/channels', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const channelData = await Registration.aggregate([
      { $match: { status: 'confirmed' } },
      {
        $group: {
          _id: '$channel',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Merge with campaign channel data for targets/budget
    const campaign = await Campaign.findOne().sort({ createdAt: -1 });
    let channelConfigs: any[] = [];
    if (campaign) {
      channelConfigs = await CampaignChannel.find({ campaignId: campaign._id });
    }

    const channels = channelData.map((ch) => {
      const config = channelConfigs.find(
        (c) => c.channelName.toLowerCase() === ch._id?.toLowerCase()
      );
      return {
        channel: ch._id || 'direct',
        actual: ch.count,
        target: config?.targetRegistrations || 0,
        plannedBudget: config?.plannedBudget || 0,
        actualSpend: config?.actualSpend || 0,
        costPerReg:
          ch.count > 0 && config?.actualSpend
            ? Math.round((config.actualSpend / ch.count) * 100) / 100
            : 'N/A',
      };
    });

    res.json({ channels });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch channel analytics' });
  }
});

// GET /api/admin/analytics/referrals — referral performance
router.get('/analytics/referrals', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const referralStats = await Referral.aggregate([
      { $match: { status: 'completed' } },
      {
        $group: {
          _id: '$referrerId',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 50 },
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
          count: 1,
          name: '$user.name',
          college: '$user.college',
          referralCode: '$user.referralCode',
        },
      },
    ]);

    res.json({ referralStats });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch referral analytics' });
  }
});

// ===== CAMPAIGN MANAGEMENT =====

// GET /api/admin/campaigns
router.get('/campaigns', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json({ campaigns });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch campaigns' });
  }
});

// POST /api/admin/campaigns
router.post('/campaigns', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = campaignSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }
    const campaign = new Campaign(parsed.data);
    await campaign.save();
    res.status(201).json({ message: 'Campaign created', campaign });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create campaign' });
  }
});

// PUT /api/admin/campaigns/:id
router.put('/campaigns/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = campaignSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }
    const campaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      { $set: parsed.data },
      { new: true }
    );
    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }
    res.json({ message: 'Campaign updated', campaign });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update campaign' });
  }
});

// ===== CAMPAIGN CHANNELS =====

// GET /api/admin/campaigns/:id/channels
router.get('/campaigns/:id/channels', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const channels = await CampaignChannel.find({ campaignId: req.params.id });
    res.json({ channels });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch channels' });
  }
});

// POST /api/admin/campaigns/:id/channels
router.post('/campaigns/:id/channels', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = channelSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }
    const channel = new CampaignChannel({
      campaignId: req.params.id,
      ...parsed.data,
    });
    await channel.save();
    res.status(201).json({ message: 'Channel created', channel });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create channel' });
  }
});

// PUT /api/admin/channels/:id
router.put('/channels/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = channelSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors });
      return;
    }
    const channel = await CampaignChannel.findByIdAndUpdate(
      req.params.id,
      { $set: parsed.data },
      { new: true }
    );
    if (!channel) {
      res.status(404).json({ error: 'Channel not found' });
      return;
    }
    res.json({ message: 'Channel updated', channel });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update channel' });
  }
});

// ===== CAMPAIGN EVENTS =====

// POST /api/admin/campaigns/:id/events
router.post('/campaigns/:id/events', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventType, channel, description, amount } = req.body;
    const event = new CampaignEvent({
      campaignId: req.params.id,
      eventType,
      channel,
      description,
      amount,
    });
    await event.save();

    // If it's a spend event, update channel actual spend
    if (eventType === 'spend' && channel && amount) {
      await CampaignChannel.findOneAndUpdate(
        { campaignId: req.params.id, channelName: channel },
        { $inc: { actualSpend: amount } }
      );
    }

    res.status(201).json({ message: 'Event recorded', event });
  } catch (error) {
    res.status(500).json({ error: 'Failed to record event' });
  }
});

// GET /api/admin/campaigns/:id/events
router.get('/campaigns/:id/events', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const events = await CampaignEvent.find({ campaignId: req.params.id })
      .sort({ timestamp: -1 })
      .limit(100);
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// ===== WORKSHOP MANAGEMENT =====

// GET /api/admin/workshops — get all workshops including drafts
router.get('/workshops', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const workshops = await Workshop.find().sort({ createdAt: -1 });
    res.json({ workshops });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch workshops' });
  }
});

export default router;
