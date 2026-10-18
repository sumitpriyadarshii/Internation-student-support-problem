import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import EventRegistration from '@/models/EventRegistration';
import CommunityEvent from '@/models/CommunityEvent';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const registrations = await EventRegistration.find({
      userId: session.user.id,
      registrationStatus: 'registered',
    })
      .populate({
        path: 'eventId',
        model: CommunityEvent,
      })
      .sort({ createdAt: -1 })
      .lean();

    const events = registrations
      .filter((r) => r.eventId)
      .map((r) => ({
        ...(r.eventId as unknown as Record<string, unknown>),
        isRegistered: true,
        registeredAt: r.registeredAt || r.createdAt,
      }));

    return successResponse(events);
  } catch (error) {
    return handleApiError(error);
  }
}
