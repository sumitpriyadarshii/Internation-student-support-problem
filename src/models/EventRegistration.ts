import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type EventRegistrationStatus = 'registered' | 'cancelled';

export interface IEventRegistration extends Document {
  _id: Types.ObjectId;
  eventId: Types.ObjectId;
  userId: Types.ObjectId;
  registrationStatus: EventRegistrationStatus;
  registeredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EventRegistrationSchema = new Schema<IEventRegistration>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'CommunityEvent',
      required: [true, 'Event ID is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    registrationStatus: {
      type: String,
      enum: {
        values: ['registered', 'cancelled'],
        message: '{VALUE} is not a valid registration status',
      },
      default: 'registered',
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index on [eventId, userId]
EventRegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });
EventRegistrationSchema.index({ userId: 1 });
EventRegistrationSchema.index({ eventId: 1 });

const EventRegistration: Model<IEventRegistration> =
  (mongoose.models.EventRegistration as Model<IEventRegistration>) ||
  mongoose.model<IEventRegistration>('EventRegistration', EventRegistrationSchema);

export default EventRegistration;
export { EventRegistration };
