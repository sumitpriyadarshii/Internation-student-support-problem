import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IBookmark extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  guideId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BookmarkSchema = new Schema<IBookmark>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    guideId: {
      type: Schema.Types.ObjectId,
      ref: 'Guide',
      required: [true, 'Guide ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound unique index on [userId, guideId]
BookmarkSchema.index({ userId: 1, guideId: 1 }, { unique: true });
BookmarkSchema.index({ userId: 1 });
BookmarkSchema.index({ guideId: 1 });

const Bookmark: Model<IBookmark> =
  (mongoose.models.Bookmark as Model<IBookmark>) ||
  mongoose.model<IBookmark>('Bookmark', BookmarkSchema);

export default Bookmark;
export { Bookmark };
