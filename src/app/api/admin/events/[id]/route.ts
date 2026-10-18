import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin, successResponse, handleApiError, errorResponse } from '@/lib/api-helpers';
import CommunityEvent from '@/models/CommunityEvent';
import EventRegistration from '@/models/EventRegistration';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const event = await CommunityEvent.findById(id).populate('organiserId', 'name email').lean();

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    return successResponse(event);
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

    const allowedFields = [
      'title',
      'description',
      'category',
      'location',
      'startDate',
      'endDate',
      'capacity',
      'status',
    ];

    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    const updatedEvent = await CommunityEvent.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return errorResponse('Event not found', 404);
    }

    return successResponse(updatedEvent);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const deleted = await CommunityEvent.findByIdAndDelete(id);

    if (!deleted) {
      return errorResponse('Event not found', 404);
    }

    // Also remove registrations for this event
    await EventRegistration.deleteMany({ eventId: id });

    return successResponse({ message: 'Event deleted successfully', id });
  } catch (error) {
    return handleApiError(error);
  }
}
