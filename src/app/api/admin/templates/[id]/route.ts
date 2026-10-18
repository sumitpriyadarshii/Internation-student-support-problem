import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin, successResponse, handleApiError, errorResponse } from '@/lib/api-helpers';
import TaskTemplate from '@/models/TaskTemplate';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const template = await TaskTemplate.findById(id).populate('relatedGuideId', 'title slug').lean();

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
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const body = await req.json();

    const allowedFields = [
      'title',
      'description',
      'category',
      'destinationCountry',
      'destinationCity',
      'university',
      'required',
      'defaultPriority',
      'dueDateOffsetDays',
      'relatedGuideId',
      'active',
    ];

    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    // Clean up empty string relatedGuideId to null
    if (updateData.relatedGuideId === '') {
      updateData.relatedGuideId = null;
    }

    const updatedTemplate = await TaskTemplate.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedTemplate) {
      return errorResponse('Task template not found', 404);
    }

    return successResponse(updatedTemplate);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const deleted = await TaskTemplate.findByIdAndDelete(id);

    if (!deleted) {
      return errorResponse('Task template not found', 404);
    }

    return successResponse({ message: 'Task template deleted successfully', id });
  } catch (error) {
    return handleApiError(error);
  }
}
