import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import Notification from '@/models/Notification';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid notification ID format', 400);
    }

    await connectDB();

    const notification = await Notification.findById(id);
    if (!notification) {
      return errorResponse('Notification not found', 404);
    }

    if (notification.userId.toString() !== session.user.id && session.user.role !== 'admin') {
      return errorResponse('Forbidden: You do not own this notification', 403);
    }

    notification.readAt = new Date();
    await notification.save();

    return successResponse(notification);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid notification ID format', 400);
    }

    await connectDB();

    const notification = await Notification.findById(id);
    if (!notification) {
      return errorResponse('Notification not found', 404);
    }

    if (notification.userId.toString() !== session.user.id && session.user.role !== 'admin') {
      return errorResponse('Forbidden: You do not own this notification', 403);
    }

    await Notification.deleteOne({ _id: id });

    return successResponse({ message: 'Notification deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
