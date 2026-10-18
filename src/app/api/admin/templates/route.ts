import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin, successResponse, handleApiError } from '@/lib/api-helpers';
import { taskTemplateSchema } from '@/lib/validation';
import TaskTemplate from '@/models/TaskTemplate';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const destination = searchParams.get('destination');
    const active = searchParams.get('active');
    const search = searchParams.get('search') || searchParams.get('q') || '';

    const query: Record<string, unknown> = {};

    if (category && category !== 'all') {
      query.category = category;
    }

    if (destination && destination !== 'all') {
      query.destinationCountry = destination;
    }

    if (active === 'true') {
      query.active = true;
    } else if (active === 'false') {
      query.active = false;
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { destinationCountry: searchRegex },
        { destinationCity: searchRegex },
        { university: searchRegex },
      ];
    }

    const templates = await TaskTemplate.find(query)
      .sort({ destinationCountry: 1, dueDateOffsetDays: 1, createdAt: -1 })
      .populate('relatedGuideId', 'title slug category')
      .lean();

    return successResponse(templates);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const body = await req.json();
    const validatedData = taskTemplateSchema.parse(body);
    const template = await TaskTemplate.create({
      title: validatedData.title,
      description: validatedData.description,
      category: validatedData.category,
      destinationCountry: validatedData.destinationCountry,
      destinationCity: validatedData.destinationCity,
      university: validatedData.university,
      required: validatedData.required,
      defaultPriority: validatedData.defaultPriority,
      dueDateOffsetDays: validatedData.dueDateOffsetDays,
      active: validatedData.active,
    });

    return successResponse(template, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
