import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  college: string;
  branch: string;
  graduationYear: number;
  phone?: string;
  referralCode: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 255,
    },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String },
    emailVerificationExpires: { type: Date },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    college: { type: String, required: true, trim: true, maxlength: 200 },
    branch: { type: String, required: true, trim: true, maxlength: 100 },
    graduationYear: { type: Number, required: true, min: 2020, max: 2035 },
    phone: { type: String, trim: true, maxlength: 15 },
    referralCode: { type: String, unique: true, required: true },
  },
  { timestamps: true }
);

userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Never return password in JSON
userSchema.set('toJSON', {
  transform: (_doc, ret: any) => {
    delete ret.password;
    delete ret.emailVerificationToken;
    delete ret.emailVerificationExpires;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    return ret;
  },
});

export default mongoose.model<IUser>('User', userSchema);
