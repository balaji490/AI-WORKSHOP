import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User';
import Campaign from '../models/Campaign';
import CampaignChannel from '../models/CampaignChannel';
import { generateReferralCode } from '../utils/helpers';

dotenv.config();

const seedAdmin = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nxtwave-workshop';
    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nxtwave.tech';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminName = process.env.ADMIN_NAME || 'Platform Admin';

    // Check if admin exists
    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log(`Admin account already exists: ${adminEmail}`);
    } else {
      const admin = new User({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        emailVerified: true,
        college: 'NxtWave',
        branch: 'Administration',
        graduationYear: 2025,
        referralCode: generateReferralCode('ADMIN'),
      });
      await admin.save();
      console.log(`✅ Admin account created: ${adminEmail}`);
    }

    // Seed default campaign if none exists
    const campaignCount = await Campaign.countDocuments();
    if (campaignCount === 0) {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(endDate.getDate() + 7);

      const campaign = await Campaign.create({
        name: 'AI Workshop Launch Campaign',
        startDate: now,
        endDate,
        targetRegistrations: 500,
        totalBudget: 2000,
        status: 'active',
      });

      // Seed default channels
      const channels = [
        { channelName: 'WhatsApp Communities', targetRegistrations: 150, plannedBudget: 0, actualSpend: 0 },
        { channelName: 'College Clubs', targetRegistrations: 100, plannedBudget: 0, actualSpend: 0 },
        { channelName: 'Student Ambassadors', targetRegistrations: 80, plannedBudget: 200, actualSpend: 0 },
        { channelName: 'Peer Referrals', targetRegistrations: 70, plannedBudget: 0, actualSpend: 0 },
        { channelName: 'LinkedIn', targetRegistrations: 30, plannedBudget: 300, actualSpend: 0 },
        { channelName: 'Instagram', targetRegistrations: 40, plannedBudget: 500, actualSpend: 0 },
        { channelName: 'Paid Ads', targetRegistrations: 20, plannedBudget: 800, actualSpend: 0 },
        { channelName: 'Other', targetRegistrations: 10, plannedBudget: 200, actualSpend: 0 },
      ];

      await CampaignChannel.insertMany(
        channels.map((ch) => ({ ...ch, campaignId: campaign._id }))
      );

      console.log('✅ Default campaign and channels created');
    }

    await mongoose.disconnect();
    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedAdmin();
