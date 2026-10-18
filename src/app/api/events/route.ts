import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import { eventSchema } from '@/lib/validation';
import CommunityEvent from '@/models/CommunityEvent';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search') || searchParams.get('q') || '';
    const upcomingOnly = searchParams.get('upcoming') === 'true';

    await connectDB();

    const query: Record<string, unknown> = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (upcomingOnly) {
      query.startDate = { $gte: new Date() };
      if (!status) {
        query.status = { $ne: 'cancelled' };
      }
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
      .sort({ startDate: 1 })
      .populate('organiserId', 'name email')
      .lean();

    return successResponse(events);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return errorResponse('Forbidden: Admin access required', 403);
    }

    const body = await req.json();
    const validatedData = eventSchema.parse(body);

    await connectDB();

    const event = await CommunityEvent.create({
      title: validatedData.title,
      description: validatedData.description,
      category: validatedData.category,
      location: validatedData.location,
      startDate: validatedData.startDate,
      endDate: validatedData.endDate ?? undefined,
      capacity: validatedData.capacity ?? undefined,
      status: validatedData.status,
      organiserId: new mongoose.Types.ObjectId(session.user.id),
      registrationCount: 0,
    });

    const populated = await CommunityEvent.findById(event._id)
      .populate('organiserId', 'name email')
      .lean();

    return successResponse(populated, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
