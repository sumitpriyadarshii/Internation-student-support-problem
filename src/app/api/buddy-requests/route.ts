import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import { buddyRequestSchema } from '@/lib/validation';
import BuddyRequest from '@/models/BuddyRequest';
import BuddyProfile from '@/models/BuddyProfile';
import Notification from '@/models/Notification';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type'); // 'sent' | 'received' | 'all'

    await connectDB();

    if (type === 'sent') {
      const sent = await BuddyRequest.find({ requesterId: session.user.id })
        .populate('recipientId', 'name email profile')
        .sort({ createdAt: -1 })
        .lean();
      return successResponse({ sent });
    }

    if (type === 'received') {
      const received = await BuddyRequest.find({ recipientId: session.user.id })
        .populate('requesterId', 'name email profile')
        .sort({ createdAt: -1 })
        .lean();
      return successResponse({ received });
    }

    const [sent, received] = await Promise.all([
      BuddyRequest.find({ requesterId: session.user.id })
        .populate('recipientId', 'name email profile')
        .sort({ createdAt: -1 })
        .lean(),
      BuddyRequest.find({ recipientId: session.user.id })
        .populate('requesterId', 'name email profile')
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return successResponse({ sent, received });
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
    const validatedData = buddyRequestSchema.parse(body);

    if (validatedData.recipientId === session.user.id) {
      return errorResponse('You cannot send a buddy request to yourself', 400);
    }

    if (!mongoose.Types.ObjectId.isValid(validatedData.recipientId)) {
      return errorResponse('Invalid recipient ID format', 400);
    }

    await connectDB();

    // Verify recipient has an approved buddy profile
    const buddyProfile = await BuddyProfile.findOne({
      userId: validatedData.recipientId,
      approvalStatus: 'approved',
    });

    if (!buddyProfile) {
      return errorResponse(
        'The recipient has not registered as an approved buddy',
        404
      );
    }

    // Check for duplicate pending requests
    const existingPending = await BuddyRequest.findOne({
      requesterId: session.user.id,
      recipientId: validatedData.recipientId,
      status: 'pending',
    });

    if (existingPending) {
      return errorResponse(
        'You already have an active pending request with this buddy',
        409
      );
    }

    const buddyRequest = await BuddyRequest.create({
      requesterId: session.user.id,
      recipientId: validatedData.recipientId,
      message: validatedData.message || '',
      status: 'pending',
    });

    // Notify recipient
    await Notification.create({
      userId: validatedData.recipientId,
      title: 'New Buddy Request 🤝',
      message: `${session.user.name || 'A student'} sent you a buddy connection request!`,
      type: 'buddy-request',
      relatedResourceType: 'BuddyRequest',
      relatedResourceId: buddyRequest._id,
    });

    const populated = await BuddyRequest.findById(buddyRequest._id)
      .populate('recipientId', 'name email profile')
      .populate('requesterId', 'name email profile')
      .lean();

    return successResponse(populated, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
