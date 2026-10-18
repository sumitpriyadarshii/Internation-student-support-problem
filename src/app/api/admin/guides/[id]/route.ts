import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin, successResponse, handleApiError, errorResponse } from '@/lib/api-helpers';
import Guide from '@/models/Guide';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const guide = await Guide.findById(id).populate('createdBy', 'name email').lean();

    if (!guide) {
      return errorResponse('Guide not found', 404);
    }

    return successResponse(guide);
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
      'summary',
      'content',
      'category',
      'applicableCountries',
      'applicableRegions',
      'tags',
      'sourceUrl',
      'verificationStatus',
      'status',
    ];

    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key];
      }
    }

    if (body.verificationStatus === 'verified') {
      updateData.lastVerifiedAt = new Date();
    }

    const updatedGuide = await Guide.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedGuide) {
      return errorResponse('Guide not found', 404);
    }

    return successResponse(updatedGuide);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    await connectDB();

    const { id } = await params;
    const deletedGuide = await Guide.findByIdAndDelete(id);

    if (!deletedGuide) {
      return errorResponse('Guide not found', 404);
    }

    return successResponse({ message: 'Guide successfully deleted', id });
  } catch (error) {
    return handleApiError(error);
  }
}
