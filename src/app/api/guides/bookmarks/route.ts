import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import Bookmark from '@/models/Bookmark';
import Guide from '@/models/Guide';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const bookmarks = await Bookmark.find({ userId: session.user.id })
      .populate({
        path: 'guideId',
        model: Guide,
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filter out bookmarks where guide might have been deleted or is not published
    const isAdmin = session.user.role === 'admin';
    const validGuides = bookmarks
      .filter((b) => b.guideId && (isAdmin || (b.guideId as unknown as { status: string }).status === 'published'))
      .map((b) => ({
        bookmarkId: b._id,
        bookmarkedAt: b.createdAt,
        guide: b.guideId,
      }));

    return successResponse(validGuides);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await req.json();
    const { guideId } = body;

    if (!guideId || !mongoose.Types.ObjectId.isValid(guideId)) {
      return errorResponse('Valid guideId is required', 400);
    }

    await connectDB();

    const guide = await Guide.findById(guideId);
    if (!guide) {
      return errorResponse('Guide not found', 404);
    }

    const existingBookmark = await Bookmark.findOne({
      userId: session.user.id,
      guideId,
    });

    if (existingBookmark) {
      await Bookmark.deleteOne({ _id: existingBookmark._id });
      return successResponse({
        bookmarked: false,
        message: 'Bookmark removed successfully',
      });
    }

    await Bookmark.create({
      userId: session.user.id,
      guideId,
    });

    return successResponse(
      {
        bookmarked: true,
        message: 'Guide bookmarked successfully',
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
