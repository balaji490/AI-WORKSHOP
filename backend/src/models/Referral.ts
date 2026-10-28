import mongoose, { Schema, Document } from 'mongoose';

export interface IReferral extends Document {
  _id: mongoose.Types.ObjectId;
  referrerId: mongoose.Types.ObjectId;
  referralCode: string;
  referredUserId?: mongoose.Types.ObjectId;
  referredRegistrationId?: mongoose.Types.ObjectId;
  status: 'pending' | 'completed' | 'invalid';
  attributedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const referralSchema = new Schema<IReferral>(
  {
    referrerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    referralCode: { type: String, required: true, trim: true },
    referredUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    referredRegistrationId: {
      type: Schema.Types.ObjectId,
      ref: 'Registration',
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'invalid'],
      default: 'pending',
    },
    attributedAt: { type: Date },
  },
  { timestamps: true }
);

referralSchema.index({ referrerId: 1 });
referralSchema.index({ referralCode: 1 });
referralSchema.index({ referredUserId: 1 });
// Prevent duplicate attribution
referralSchema.index(
  { referredUserId: 1, referralCode: 1 },
  { unique: true, partialFilterExpression: { referredUserId: { $exists: true } } }
);

export default mongoose.model<IReferral>('Referral', referralSchema);
