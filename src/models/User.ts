import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type UserRole = 'student' | 'admin';
export type AccountStatus = 'active' | 'suspended' | 'deactivated';

export interface IUserProfile {
  countryOfOrigin?: string;
  destinationCountry?: string;
  destinationCity?: string;
  university?: string;
  preferredLanguage?: string;
  languagesSpoken: string[];
  arrivalDate?: Date;
  interests: string[];
  supportPreferences: string[];
  profileImage?: string;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  profile: IUserProfile;
  onboardingCompleted: boolean;
  onboardingStep: number;
  accountStatus: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema = new Schema<IUserProfile>(
  {
    countryOfOrigin: { type: String, trim: true, default: '' },
    destinationCountry: { type: String, trim: true, default: '' },
    destinationCity: { type: String, trim: true, default: '' },
    university: { type: String, trim: true, default: '' },
    preferredLanguage: { type: String, trim: true, default: '' },
    languagesSpoken: { type: [String], default: [] },
    arrivalDate: { type: Date },
    interests: { type: [String], default: [] },
    supportPreferences: { type: [String], default: [] },
    profileImage: { type: String, default: '' },
  },
  { _id: false }
);

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password hash is required'],
    },
    role: {
      type: String,
      enum: {
        values: ['student', 'admin'],
        message: '{VALUE} is not a valid role',
      },
      default: 'student',
    },
    profile: {
      type: UserProfileSchema,
      default: () => ({}),
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    onboardingStep: {
      type: Number,
      default: 0,
      min: 0,
    },
    accountStatus: {
      type: String,
      enum: {
        values: ['active', 'suspended', 'deactivated'],
        message: '{VALUE} is not a valid account status',
      },
      default: 'active',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes on email (unique), role, accountStatus
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });
UserSchema.index({ accountStatus: 1 });

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>('User', UserSchema);

export default User;
export { User };
