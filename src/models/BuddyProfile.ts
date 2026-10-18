import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export const BUDDY_SUPPORT_AREAS = [
  'academic',
  'cultural',
  'language',
  'housing',
  'financial',
  'social',
  'career',
  'health',
] as const;

export type BuddySupportArea = (typeof BUDDY_SUPPORT_AREAS)[number];
export type BuddyAvailability = 'available' | 'busy' | 'unavailable';
export type BuddyApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface IBuddyProfile extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  university: string;
  languages: string[];
  interests: string[];
  supportAreas: BuddySupportArea[];
  availability: BuddyAvailability;
  biography?: string;
  approvalStatus: BuddyApprovalStatus;
  createdAt: Date;
  updatedAt: Date;
}

const BuddyProfileSchema = new Schema<IBuddyProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    university: {
      type: String,
      required: [true, 'University is required'],
      trim: true,
    },
    languages: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    supportAreas: {
      type: [String],
      enum: {
        values: BUDDY_SUPPORT_AREAS,
        message: '{VALUE} is not a valid support area',
      },
      default: [],
    },
    availability: {
      type: String,
      enum: {
        values: ['available', 'busy', 'unavailable'],
        message: '{VALUE} is not a valid availability status',
      },
      default: 'available',
    },
    biography: {
      type: String,
      trim: true,
      default: '',
    },
    approvalStatus: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: '{VALUE} is not a valid approval status',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes on userId (unique), approvalStatus, university
BuddyProfileSchema.index({ userId: 1 }, { unique: true });
BuddyProfileSchema.index({ approvalStatus: 1 });
BuddyProfileSchema.index({ university: 1 });

const BuddyProfile: Model<IBuddyProfile> =
  (mongoose.models.BuddyProfile as Model<IBuddyProfile>) ||
  mongoose.model<IBuddyProfile>('BuddyProfile', BuddyProfileSchema);

export default BuddyProfile;
export { BuddyProfile };
