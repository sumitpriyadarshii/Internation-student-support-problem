import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin, successResponse, handleApiError, errorResponse } from '@/lib/api-helpers';
import BuddyProfile from '@/models/BuddyProfile';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const profile = await BuddyProfile.findById(id).populate('userId', 'name email profile').lean();

    if (!profile) {
      return errorResponse('Buddy profile not found', 404);
    }

    return successResponse(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const body = await req.json();
    const { approvalStatus } = body;

    if (!['pending', 'approved', 'rejected'].includes(approvalStatus)) {
      return errorResponse('Invalid approval status', 400);
    }

    const updated = await BuddyProfile.findByIdAndUpdate(
      id,
      { $set: { approvalStatus } },
      { new: true, runValidators: true }
    ).populate('userId', 'name email profile');

    if (!updated) {
      return errorResponse('Buddy profile not found', 404);
    }

    return successResponse(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const deleted = await BuddyProfile.findByIdAndDelete(id);

    if (!deleted) {
      return errorResponse('Buddy profile not found', 404);
    }

    return successResponse({ message: 'Buddy profile removed', id });
  } catch (error) {
    return handleApiError(error);
  }
}
