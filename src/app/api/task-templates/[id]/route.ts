import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import { taskTemplateSchema } from '@/lib/validation';
import TaskTemplate from '@/models/TaskTemplate';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return errorResponse('Forbidden: Admin access required', 403);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid template ID', 400);
    }

    await connectDB();

    const template = await TaskTemplate.findById(id)
      .populate('relatedGuideId', 'title slug category')
      .lean();

    if (!template) {
      return errorResponse('Task template not found', 404);
    }

    return successResponse(template);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return errorResponse('Forbidden: Admin access required', 403);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid template ID', 400);
    }

    const body = await req.json();
    const partialSchema = taskTemplateSchema.partial();
    const validatedData = partialSchema.parse(body);

    await connectDB();

    const template = await TaskTemplate.findById(id);
    if (!template) {
      return errorResponse('Task template not found', 404);
    }

    Object.assign(template, validatedData);
    await template.save();

    return successResponse(template);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (session?.user?.role !== 'admin') {
      return errorResponse('Forbidden: Admin access required', 403);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid template ID', 400);
    }

    await connectDB();

    const template = await TaskTemplate.findById(id);
    if (!template) {
      return errorResponse('Task template not found', 404);
    }

    // Soft deactivate
    template.active = false;
    await template.save();

    return successResponse({
      message: 'Task template deactivated successfully',
      template,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
