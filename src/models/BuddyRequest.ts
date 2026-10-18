import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type BuddyRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface IBuddyRequest extends Document {
  _id: Types.ObjectId;
  requesterId: Types.ObjectId;
  recipientId: Types.ObjectId;
  message?: string;
  status: BuddyRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const BuddyRequestSchema = new Schema<IBuddyRequest>(
  {
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester ID is required'],
    },
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient ID is required'],
    },
    message: {
      type: String,
      trim: true,
      default: '',
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected', 'cancelled'],
        message: '{VALUE} is not a valid request status',
      },
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index on [requesterId, recipientId, status] for duplicate prevention
BuddyRequestSchema.index({ requesterId: 1, recipientId: 1, status: 1 });
BuddyRequestSchema.index({ requesterId: 1 });
BuddyRequestSchema.index({ recipientId: 1 });

const BuddyRequest: Model<IBuddyRequest> =
  (mongoose.models.BuddyRequest as Model<IBuddyRequest>) ||
  mongoose.model<IBuddyRequest>('BuddyRequest', BuddyRequestSchema);

export default BuddyRequest;
export { BuddyRequest };
