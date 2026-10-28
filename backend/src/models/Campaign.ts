import mongoose, { Schema, Document } from 'mongoose';

export interface ICampaign extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  startDate: Date;
  endDate: Date;
  targetRegistrations: number;
  totalBudget: number;
  status: 'draft' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const campaignSchema = new Schema<ICampaign>(
  {
    name: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    targetRegistrations: { type: Number, required: true, default: 500 },
    totalBudget: { type: Number, required: true, default: 2000 },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICampaign>('Campaign', campaignSchema);
