import mongoose, { Schema, Document } from 'mongoose';

export interface IRegistration extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  workshopId: mongoose.Types.ObjectId;
  status: 'pending' | 'confirmed' | 'cancelled';
  channel: string;
  referralCode?: string;
  registeredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    workshopId: {
      type: Schema.Types.ObjectId,
      ref: 'Workshop',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'confirmed',
    },
    channel: {
      type: String,
      default: 'direct',
      trim: true,
    },
    referralCode: { type: String, trim: true },
    registeredAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// One registration per user per workshop
registrationSchema.index({ userId: 1, workshopId: 1 }, { unique: true });
registrationSchema.index({ workshopId: 1, status: 1 });
registrationSchema.index({ channel: 1 });
registrationSchema.index({ registeredAt: 1 });

export default mongoose.model<IRegistration>('Registration', registrationSchema);
