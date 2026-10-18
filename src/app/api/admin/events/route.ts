import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin, successResponse, handleApiError, errorResponse } from '@/lib/api-helpers';
import { eventSchema } from '@/lib/validation';
import CommunityEvent from '@/models/CommunityEvent';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search') || searchParams.get('q') || '';

    const query: Record<string, unknown> = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
      ];
    }

    const events = await CommunityEvent.find(query)
      .sort({ startDate: -1 })
      .populate('organiserId', 'name email')
      .lean();

    return successResponse(events);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    await connectDB();

    const body = await req.json();
    const validatedData = eventSchema.parse(body);

    const event = await CommunityEvent.create({
      title: validatedData.title,
      description: validatedData.description,
      category: validatedData.category,
      location: validatedData.location,
      startDate: validatedData.startDate,
      endDate: validatedData.endDate ?? undefined,
      capacity: validatedData.capacity ?? undefined,
      status: validatedData.status,
      organiserId: session.user.id,
      registrationCount: 0,
    });

    return successResponse(event, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
