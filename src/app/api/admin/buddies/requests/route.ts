import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin, successResponse, handleApiError } from '@/lib/api-helpers';
import BuddyRequest from '@/models/BuddyRequest';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query: Record<string, unknown> = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    const requests = await BuddyRequest.find(query)
      .sort({ createdAt: -1 })
      .populate('requesterId', 'name email profile.countryOfOrigin profile.destinationCountry profile.university')
      .populate('recipientId', 'name email profile.countryOfOrigin profile.destinationCountry profile.university')
      .lean();

    return successResponse(requests);
  } catch (error) {
    return handleApiError(error);
  }
}
