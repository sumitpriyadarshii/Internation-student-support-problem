import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { TASK_CATEGORIES, TaskCategory, TaskPriority } from './Task';

export interface ITaskTemplate extends Document {
  _id: Types.ObjectId;
  title: string;
  description?: string;
  category: TaskCategory;
  destinationCountry?: string;
  destinationCity?: string;
  university?: string;
  required: boolean;
  defaultPriority: TaskPriority;
  dueDateOffsetDays?: number;
  relatedGuideId?: Types.ObjectId;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskTemplateSchema = new Schema<ITaskTemplate>(
  {
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
    destinationCountry: {
      type: String,
      trim: true,
    },
    destinationCity: {
      type: String,
      trim: true,
    },
    university: {
      type: String,
      trim: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    defaultPriority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high', 'urgent'],
        message: '{VALUE} is not a valid priority',
      },
      default: 'medium',
    },
    dueDateOffsetDays: {
      type: Number,
      default: 0,
    },
    relatedGuideId: {
      type: Schema.Types.ObjectId,
      ref: 'Guide',
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes on active, destinationCountry
TaskTemplateSchema.index({ active: 1 });
TaskTemplateSchema.index({ destinationCountry: 1 });
TaskTemplateSchema.index({ active: 1, destinationCountry: 1 });

const TaskTemplate: Model<ITaskTemplate> =
  (mongoose.models.TaskTemplate as Model<ITaskTemplate>) ||
  mongoose.model<ITaskTemplate>('TaskTemplate', TaskTemplateSchema);

export default TaskTemplate;
export { TaskTemplate };
