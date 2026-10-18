import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import CommunityEvent from '@/models/CommunityEvent';
import EventRegistration from '@/models/EventRegistration';
import Notification from '@/models/Notification';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid event ID format', 400);
    }

    await connectDB();

    const event = await CommunityEvent.findById(id);
    if (!event) {
      return errorResponse('Event not found', 404);
    }

    if (event.status === 'cancelled') {
      return errorResponse('Cannot register for a cancelled event', 400);
    }

    if (event.capacity && event.registrationCount >= event.capacity) {
      return errorResponse('This event has reached full capacity', 400);
    }

    const existingReg = await EventRegistration.findOne({
      eventId: id,
      userId: session.user.id,
    });

    if (existingReg) {
      if (existingReg.registrationStatus === 'registered') {
        return errorResponse('You are already registered for this event', 409);
      }
      existingReg.registrationStatus = 'registered';
      existingReg.registeredAt = new Date();
      await existingReg.save();
    } else {
      await EventRegistration.create({
        eventId: id,
        userId: session.user.id,
        registrationStatus: 'registered',
        registeredAt: new Date(),
      });
    }

    event.registrationCount = (event.registrationCount || 0) + 1;
    await event.save();

    await Notification.create({
      userId: session.user.id,
      title: 'Event Registration Confirmed! 🎟️',
      message: `You are registered for "${event.title}". See you at ${event.location}!`,
      type: 'event-update',
      relatedResourceType: 'CommunityEvent',
      relatedResourceId: event._id,
    });

    return successResponse({
      message: 'Successfully registered for event',
      eventId: event._id,
      registrationCount: event.registrationCount,
    });
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
      return errorResponse('Invalid event ID format', 400);
    }

    await connectDB();

    const event = await CommunityEvent.findById(id);
    if (!event) {
      return errorResponse('Event not found', 404);
    }

    const registration = await EventRegistration.findOne({
      eventId: id,
      userId: session.user.id,
      registrationStatus: 'registered',
    });

    if (!registration) {
      return errorResponse('You do not have an active registration for this event', 404);
    }

    registration.registrationStatus = 'cancelled';
    await registration.save();

    event.registrationCount = Math.max(0, (event.registrationCount || 1) - 1);
    await event.save();

    return successResponse({
      message: 'Event registration cancelled successfully',
      eventId: event._id,
      registrationCount: event.registrationCount,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
