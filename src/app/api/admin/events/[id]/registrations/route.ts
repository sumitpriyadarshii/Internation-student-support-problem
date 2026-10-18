import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin, successResponse, handleApiError, errorResponse } from '@/lib/api-helpers';
import EventRegistration from '@/models/EventRegistration';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;

    const registrations = await EventRegistration.find({ eventId: id })
      .populate('userId', 'name email profile.university profile.countryOfOrigin profile.destinationCountry')
      .sort({ registeredAt: -1 })
      .lean();

    return successResponse(registrations);
  } catch (error) {
    return handleApiError(error);
  }
}
