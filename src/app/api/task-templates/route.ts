import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import { taskTemplateSchema } from '@/lib/validation';
import TaskTemplate from '@/models/TaskTemplate';

export async function GET() {
  try {
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return errorResponse('Forbidden: Admin access required', 403);
    }

    await connectDB();

    const templates = await TaskTemplate.find()
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
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return errorResponse('Forbidden: Admin access required', 403);
    }

    const body = await req.json();
    const validatedData = taskTemplateSchema.parse(body);

    await connectDB();

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
      relatedGuideId: validatedData.relatedGuideId
        ? new mongoose.Types.ObjectId(validatedData.relatedGuideId)
        : undefined,
      active: validatedData.active,
    });

    return successResponse(template, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
