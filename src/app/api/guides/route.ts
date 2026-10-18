import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import { guideSchema } from '@/lib/validation';
import { generateSlug } from '@/lib/utils';
import Guide from '@/models/Guide';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const isAdmin = session?.user?.role === 'admin';

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('q') || searchParams.get('search') || '';
    const category = searchParams.get('category');
    const country = searchParams.get('country');
    const requestedStatus = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    await connectDB();

    const query: Record<string, unknown> = {};

    // Role-based visibility: students can only see published guides
    if (!isAdmin) {
      query.status = 'published';
    } else if (requestedStatus) {
      query.status = requestedStatus;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (country && country !== 'all') {
      query.applicableCountries = { $in: [country] };
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { summary: searchRegex },
        { tags: { $in: [searchRegex] } },
      ];
    }

    const [items, total] = await Promise.all([
      Guide.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .lean(),
      Guide.countDocuments(query),
    ]);

    return successResponse({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
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
    const validatedData = guideSchema.parse(body);

    await connectDB();

    // Generate unique slug
    let baseSlug = validatedData.slug
      ? generateSlug(validatedData.slug)
      : generateSlug(validatedData.title);

    if (!baseSlug) {
      baseSlug = `guide-${Date.now()}`;
    }

    let slug = baseSlug;
    let counter = 1;
    while (await Guide.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const guide = await Guide.create({
      ...validatedData,
      slug,
      createdBy: session.user.id,
    });

    return successResponse(guide, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
