import mongoose, { Schema, Document } from 'mongoose';

export interface IAmbassador extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  college: string;
  referralCode: string;
  status: 'active' | 'inactive';
  assignedCampaign?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ambassadorSchema = new Schema<IAmbassador>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    college: { type: String, required: true, trim: true },
    referralCode: { type: String, required: true, unique: true, trim: true },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    assignedCampaign: { type: String, trim: true },
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

ambassadorSchema.index({ status: 1 });

export default mongoose.model<IAmbassador>('Ambassador', ambassadorSchema);
