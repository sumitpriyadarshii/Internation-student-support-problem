import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin, successResponse, handleApiError, errorResponse } from '@/lib/api-helpers';
import BuddyProfile from '@/models/BuddyProfile';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search') || searchParams.get('q') || '';

    const query: Record<string, unknown> = {};

    if (status && status !== 'all') {
      query.approvalStatus = status;
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { university: searchRegex },
        { languages: { $in: [searchRegex] } },
        { supportAreas: { $in: [searchRegex] } },
      ];
    }

    const profiles = await BuddyProfile.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email profile')
      .lean();

    return successResponse(profiles);
  } catch (error) {
    return handleApiError(error);
  }
}
