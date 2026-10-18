import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import { eventSchema } from '@/lib/validation';
import CommunityEvent from '@/models/CommunityEvent';
import EventRegistration from '@/models/EventRegistration';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid event ID format', 400);
    }

    await connectDB();

    const event = await CommunityEvent.findById(id)
      .populate('organiserId', 'name email')
      .lean();

    if (!event) {
      return errorResponse('Event not found', 404);
    }

    let isRegistered = false;
    if (session?.user?.id) {
      const registration = await EventRegistration.findOne({
        eventId: id,
        userId: session.user.id,
        registrationStatus: 'registered',
      });
      isRegistered = !!registration;
    }

    return successResponse({
      ...event,
      isRegistered,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return errorResponse('Forbidden: Admin access required', 403);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid event ID format', 400);
    }

    const body = await req.json();
    const partialEventSchema = eventSchema.partial();
    const validatedData = partialEventSchema.parse(body);

    await connectDB();

    const event = await CommunityEvent.findById(id);
    if (!event) {
      return errorResponse('Event not found', 404);
    }

    if (validatedData.title !== undefined) event.title = validatedData.title;
    if (validatedData.description !== undefined) event.description = validatedData.description;
    if (validatedData.category !== undefined) event.category = validatedData.category;
    if (validatedData.location !== undefined) event.location = validatedData.location;
    if (validatedData.startDate !== undefined) event.startDate = validatedData.startDate;
    if (validatedData.endDate !== undefined) event.endDate = validatedData.endDate ?? undefined;
    if (validatedData.capacity !== undefined) event.capacity = validatedData.capacity ?? undefined;
    if (validatedData.status !== undefined) event.status = validatedData.status;

    await event.save();

    return successResponse(event);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return errorResponse('Forbidden: Admin access required', 403);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid event ID format', 400);
    }

    await connectDB();

    const event = await CommunityEvent.findById(id);
    if (!event) {
      return errorResponse('Event not found', 404);
    }

    event.status = 'cancelled';
    await event.save();

    return successResponse({ message: 'Event cancelled successfully', event });
  } catch (error) {
    return handleApiError(error);
  }
}
