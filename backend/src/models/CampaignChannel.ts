import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaignChannel extends Document {
  _id: mongoose.Types.ObjectId;
  campaignId: mongoose.Types.ObjectId;
  channelName: string;
  targetRegistrations: number;
  plannedBudget: number;
  actualSpend: number;
  createdAt: Date;
  updatedAt: Date;
}

const campaignChannelSchema = new Schema<ICampaignChannel>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: true,
    },
    channelName: { type: String, required: true, trim: true },
    targetRegistrations: { type: Number, default: 0 },
    plannedBudget: { type: Number, default: 0 },
    actualSpend: { type: Number, default: 0 },
  },
  { timestamps: true }
);

campaignChannelSchema.index({ campaignId: 1 });
campaignChannelSchema.index({ channelName: 1 });

export default mongoose.model<ICampaignChannel>('CampaignChannel', campaignChannelSchema);
