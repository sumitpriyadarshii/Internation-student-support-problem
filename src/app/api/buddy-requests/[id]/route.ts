import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import BuddyRequest from '@/models/BuddyRequest';
import Notification from '@/models/Notification';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateStatusSchema = z.object({
  status: z.enum(['accepted', 'rejected', 'cancelled']),
});

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid request ID format', 400);
    }

    const body = await req.json();
    const { status: newStatus } = updateStatusSchema.parse(body);

    await connectDB();

    const buddyRequest = await BuddyRequest.findById(id);
    if (!buddyRequest) {
      return errorResponse('Buddy request not found', 404);
    }

    if (buddyRequest.status !== 'pending') {
      return errorResponse(
        `Cannot change status of a request that is already ${buddyRequest.status}`,
        400
      );
    }

    const userId = session.user.id;
    const isRequester = buddyRequest.requesterId.toString() === userId;
    const isRecipient = buddyRequest.recipientId.toString() === userId;

    if (newStatus === 'cancelled') {
      if (!isRequester && session.user.role !== 'admin') {
        return errorResponse(
          'Forbidden: Only the requester can cancel this buddy request',
          403
        );
      }
    } else if (newStatus === 'accepted' || newStatus === 'rejected') {
      if (!isRecipient && session.user.role !== 'admin') {
        return errorResponse(
          'Forbidden: Only the recipient can accept or reject this buddy request',
          403
        );
      }
    }

    buddyRequest.status = newStatus;
    await buddyRequest.save();

    // Send notification if accepted or rejected
    if (newStatus === 'accepted' || newStatus === 'rejected') {
      await Notification.create({
        userId: buddyRequest.requesterId,
        title: `Buddy Request ${newStatus === 'accepted' ? 'Accepted! 🎉' : 'Declined'}`,
        message: `${session.user.name || 'Your prospective buddy'} has ${newStatus} your connection request.`,
        type: 'buddy-request',
        relatedResourceType: 'BuddyRequest',
        relatedResourceId: buddyRequest._id,
      });
    }

    const populated = await BuddyRequest.findById(buddyRequest._id)
      .populate('recipientId', 'name email profile')
      .populate('requesterId', 'name email profile')
      .lean();

    return successResponse(populated);
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
      return errorResponse('Invalid request ID format', 400);
    }

    await connectDB();

    const buddyRequest = await BuddyRequest.findById(id);
    if (!buddyRequest) {
      return errorResponse('Buddy request not found', 404);
    }

    const isRequester = buddyRequest.requesterId.toString() === session.user.id;
    if (!isRequester && session.user.role !== 'admin') {
      return errorResponse('Forbidden: Only the requester can delete this request', 403);
    }

    if (buddyRequest.status === 'accepted') {
      return errorResponse('Cannot delete an already accepted buddy connection', 400);
    }

    await BuddyRequest.deleteOne({ _id: id });

    return successResponse({ message: 'Buddy request deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
