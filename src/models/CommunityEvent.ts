import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export const EVENT_CATEGORIES = [
  'cultural-exchange',
  'language-practice',
  'campus-orientation',
  'food-cooking',
  'sports-recreation',
  'career-networking',
  'local-exploration',
] as const;

export type CommunityEventCategory = (typeof EVENT_CATEGORIES)[number];
export type CommunityEventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface ICommunityEvent extends Document {
  _id: Types.ObjectId;
  title: string;
  description: string;
  category: CommunityEventCategory;
  location: string;
  startDate: Date;
  endDate?: Date;
  organiserId?: Types.ObjectId;
  capacity?: number;
  registrationCount: number;
  status: CommunityEventStatus;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityEventSchema = new Schema<ICommunityEvent>(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Event description is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: {
        values: EVENT_CATEGORIES,
        message: '{VALUE} is not a valid event category',
      },
      required: [true, 'Category is required'],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
    },
    organiserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    capacity: {
      type: Number,
      min: 0,
    },
    registrationCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: {
        values: ['upcoming', 'ongoing', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid event status',
      },
      default: 'upcoming',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes on startDate, status, category
CommunityEventSchema.index({ startDate: 1 });
CommunityEventSchema.index({ status: 1 });
CommunityEventSchema.index({ category: 1 });

const CommunityEvent: Model<ICommunityEvent> =
  (mongoose.models.CommunityEvent as Model<ICommunityEvent>) ||
  mongoose.model<ICommunityEvent>('CommunityEvent', CommunityEventSchema);

export default CommunityEvent;
export { CommunityEvent };
