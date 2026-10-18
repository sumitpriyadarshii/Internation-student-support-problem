import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export const GUIDE_CATEGORIES = [
  'food-groceries',
  'banking-financial',
  'sim-mobile',
  'documentation-immigration',
  'university-campus',
  'accommodation-transport',
  'healthcare-emergency',
  'local-culture-language',
] as const;

export type GuideCategory = (typeof GUIDE_CATEGORIES)[number];
export type GuideVerificationStatus = 'unverified' | 'verified' | 'outdated';
export type GuideStatus = 'draft' | 'published' | 'archived';

export interface IGuide extends Document {
  _id: Types.ObjectId;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: GuideCategory;
  applicableCountries: string[];
  applicableRegions: string[];
  tags: string[];
  sourceUrl?: string;
  verificationStatus: GuideVerificationStatus;
  lastVerifiedAt?: Date;
  status: GuideStatus;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GuideSchema = new Schema<IGuide>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      lowercase: true,
      trim: true,
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      trim: true,
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    category: {
      type: String,
      enum: {
        values: GUIDE_CATEGORIES,
        message: '{VALUE} is not a valid guide category',
      },
      required: [true, 'Category is required'],
    },
    applicableCountries: {
      type: [String],
      default: [],
    },
    applicableRegions: {
      type: [String],
      default: [],
    },
    tags: {
      type: [String],
      default: [],
    },
    sourceUrl: {
      type: String,
      trim: true,
    },
    verificationStatus: {
      type: String,
      enum: {
        values: ['unverified', 'verified', 'outdated'],
        message: '{VALUE} is not a valid verification status',
      },
      default: 'unverified',
    },
    lastVerifiedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published', 'archived'],
        message: '{VALUE} is not a valid status',
      },
      default: 'draft',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes on slug (unique), category, status, applicableCountries
GuideSchema.index({ slug: 1 }, { unique: true });
GuideSchema.index({ category: 1 });
GuideSchema.index({ status: 1 });
GuideSchema.index({ applicableCountries: 1 });

const Guide: Model<IGuide> =
  (mongoose.models.Guide as Model<IGuide>) ||
  mongoose.model<IGuide>('Guide', GuideSchema);

export default Guide;
export { Guide };
