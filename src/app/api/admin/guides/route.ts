import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin, successResponse, handleApiError } from '@/lib/api-helpers';
import { guideSchema } from '@/lib/validation';
import { generateSlug } from '@/lib/utils';
import Guide from '@/models/Guide';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || searchParams.get('q') || '';
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const verificationStatus = searchParams.get('verificationStatus');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (verificationStatus && verificationStatus !== 'all') {
      query.verificationStatus = verificationStatus;
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { summary: searchRegex },
        { tags: { $in: [searchRegex] } },
        { applicableCountries: { $in: [searchRegex] } },
      ];
    }

    const [guides, total] = await Promise.all([
      Guide.find(query)
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email')
        .lean(),
      Guide.countDocuments(query),
    ]);

    return successResponse({
      guides,
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
    const session = await requireAdmin();
    await connectDB();

    const body = await req.json();
    const validatedData = guideSchema.parse(body);

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
      lastVerifiedAt: validatedData.verificationStatus === 'verified' ? new Date() : undefined,
    });

    return successResponse(guide, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
