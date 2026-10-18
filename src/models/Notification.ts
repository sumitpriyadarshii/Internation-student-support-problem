import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export const NOTIFICATION_TYPES = [
  'task-reminder',
  'buddy-request',
  'event-update',
  'system',
  'guide-update',
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface INotification extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  message: string;
  type: NotificationType;
  relatedResourceType?: string;
  relatedResourceId?: Types.ObjectId;
  readAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: {
        values: NOTIFICATION_TYPES,
        message: '{VALUE} is not a valid notification type',
      },
      required: [true, 'Notification type is required'],
    },
    relatedResourceType: {
      type: String,
      trim: true,
    },
    relatedResourceId: {
      type: Schema.Types.ObjectId,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes on userId, [userId, readAt]
NotificationSchema.index({ userId: 1 });
NotificationSchema.index({ userId: 1, readAt: 1 });

const Notification: Model<INotification> =
  (mongoose.models.Notification as Model<INotification>) ||
  mongoose.model<INotification>('Notification', NotificationSchema);

export default Notification;
export { Notification };
