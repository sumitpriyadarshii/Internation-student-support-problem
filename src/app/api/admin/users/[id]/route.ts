import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin, successResponse, handleApiError, errorResponse } from '@/lib/api-helpers';
import User from '@/models/User';
import Task from '@/models/Task';
import BuddyProfile from '@/models/BuddyProfile';
import BuddyRequest from '@/models/BuddyRequest';
import EventRegistration from '@/models/EventRegistration';
import Notification from '@/models/Notification';
import Bookmark from '@/models/Bookmark';
import AdminRequest from '@/models/AdminRequest';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const user = await User.findById(id).select('-passwordHash').lean();

    if (!user) {
      return errorResponse('User not found', 404);
    }

    const [tasks, buddyProfile, registrations] = await Promise.all([
      Task.find({ userId: id }).sort({ dueDate: 1 }).limit(10).lean(),
      BuddyProfile.findOne({ userId: id }).lean(),
      EventRegistration.find({ userId: id })
        .populate('eventId', 'title startDate location status')
        .sort({ registeredAt: -1 })
        .limit(5)
        .lean(),
    ]);

    return successResponse({
      user,
      tasks,
      buddyProfile,
      registrations,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAdmin();
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    if (session.user.id === id && (body.role === 'student' || body.accountStatus === 'suspended')) {
      return errorResponse('You cannot demote or suspend your own admin account', 400);
    }

    const allowedUpdates = ['role', 'accountStatus', 'onboardingCompleted', 'failedLoginAttempts', 'lockoutUntil'];
    const updateData: Record<string, unknown> = {};

    for (const key of allowedUpdates) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    if (body.unlockAccount === true) {
      updateData.failedLoginAttempts = 0;
      updateData.lockoutUntil = null;
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return errorResponse('User not found', 404);
    }

    return successResponse(updatedUser);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await requireAdmin();
    await connectDB();

    const { id } = await params;

    // Prevent admin from deleting their own account
    if (session.user.id === id) {
      return errorResponse('You cannot delete your own admin account', 400);
    }

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return errorResponse('User not found', 404);
    }

    // Cascade delete all associated data
    await Promise.all([
      User.findByIdAndDelete(id),
      Task.deleteMany({ userId: id }),
      BuddyProfile.deleteMany({ userId: id }),
      BuddyRequest.deleteMany({ $or: [{ requesterId: id }, { recipientId: id }] }),
      EventRegistration.deleteMany({ userId: id }),
      Notification.deleteMany({ userId: id }),
      Bookmark.deleteMany({ userId: id }),
      AdminRequest.deleteMany({ $or: [{ userId: id }, { userEmail: targetUser.email }] }),
    ]);

    return successResponse({
      message: `User ${targetUser.email} and all associated records have been permanently deleted.`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
