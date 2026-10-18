import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { GUIDE_CATEGORIES } from './Guide';

export const TASK_CATEGORIES = [
  ...GUIDE_CATEGORIES,
  'personal',
] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'not-started' | 'in-progress' | 'completed';

export interface ITask extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  templateId?: Types.ObjectId;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: TaskPriority;
  dueDate?: Date;
  status: TaskStatus;
  relatedGuideId?: Types.ObjectId;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    templateId: {
      type: Schema.Types.ObjectId,
      ref: 'TaskTemplate',
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: {
        values: TASK_CATEGORIES,
        message: '{VALUE} is not a valid task category',
      },
      default: 'personal',
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'medium',
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: {
        values: ['not-started', 'in-progress', 'completed'],
        message: '{VALUE} is not a valid status',
      },
      default: 'not-started',
    },
    relatedGuideId: {
      type: Schema.Types.ObjectId,
      ref: 'Guide',
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes on userId, status, dueDate, [userId, status] compound
TaskSchema.index({ userId: 1 });
TaskSchema.index({ status: 1 });
TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ userId: 1, status: 1 });

const Task: Model<ITask> =
  (mongoose.models.Task as Model<ITask>) ||
  mongoose.model<ITask>('Task', TaskSchema);

export default Task;
export { Task };
