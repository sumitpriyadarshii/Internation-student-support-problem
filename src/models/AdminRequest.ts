import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export type AdminRequestType = 'activation' | 'permission' | 'role_upgrade' | 'account_issue';
export type AdminRequestStatus = 'pending' | 'approved' | 'rejected';

export interface IAdminRequest extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  userEmail: string;
  userName: string;
  type: AdminRequestType;
  title: string;
  message: string;
  status: AdminRequestStatus;
  adminNotes?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AdminRequestSchema = new Schema<IAdminRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    userEmail: {
      type: String,
      required: [true, 'User email is required'],
      lowercase: true,
      trim: true,
    },
    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['activation', 'permission', 'role_upgrade', 'account_issue'],
      default: 'activation',
    },
    title: {
      type: String,
      required: [true, 'Request title is required'],
      trim: true,
      default: 'Account Activation Request',
    },
    message: {
      type: String,
      required: [true, 'Message / reason is required'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      default: '',
      trim: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    reviewedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

AdminRequestSchema.index({ status: 1 });
AdminRequestSchema.index({ userEmail: 1 });
AdminRequestSchema.index({ createdAt: -1 });

const AdminRequest: Model<IAdminRequest> =
  (mongoose.models.AdminRequest as Model<IAdminRequest>) ||
  mongoose.model<IAdminRequest>('AdminRequest', AdminRequestSchema);

export default AdminRequest;
export { AdminRequest };
