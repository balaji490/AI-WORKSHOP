import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkshop extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  scheduledDate?: Date;
  duration: number; // minutes
  status: 'draft' | 'scheduled' | 'published' | 'completed';
  joinLink?: string;
  maxParticipants?: number;
  createdAt: Date;
  updatedAt: Date;
}

const workshopSchema = new Schema<IWorkshop>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    scheduledDate: { type: Date },
    duration: { type: Number, default: 60 },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'completed'],
      default: 'draft',
    },
    joinLink: { type: String },
    maxParticipants: { type: Number },
  },
  { timestamps: true }
);

export default mongoose.model<IWorkshop>('Workshop', workshopSchema);
