import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaignEvent extends Document {
  _id: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  eventType: 'outreach' | 'registration' | 'referral' | 'spend' | 'note';
  channel?: string;
  description?: string;
  amount?: number;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const campaignEventSchema = new Schema<ICampaignEvent>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    eventType: {
      type: String,
      enum: ['outreach', 'registration', 'referral', 'spend', 'note'],
      required: true,
    },
    channel: { type: String, trim: true },
    description: { type: String, trim: true },
    amount: { type: Number },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

campaignEventSchema.index({ campaignId: 1, timestamp: 1 });
campaignEventSchema.index({ eventType: 1 });

export default mongoose.model<ICampaignEvent>('CampaignEvent', campaignEventSchema);
