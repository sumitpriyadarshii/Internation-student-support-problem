import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import { guideSchema } from '@/lib/validation';
import Guide from '@/models/Guide';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    const isAdmin = session?.user?.role === 'admin';

    await connectDB();

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { _id: id } : { slug: id };

    const guide = await Guide.findOne(query)
      .populate('createdBy', 'name email')
      .lean();

    if (!guide) {
      return errorResponse('Guide not found', 404);
    }

    if (!isAdmin && guide.status !== 'published') {
      return errorResponse('Guide not found', 404);
    }

    return successResponse(guide);
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

    const body = await req.json();
    const partialGuideSchema = guideSchema.partial();
    const validatedData = partialGuideSchema.parse(body);

    await connectDB();

    const guide = await Guide.findById(id);
    if (!guide) {
      return errorResponse('Guide not found', 404);
    }

    Object.assign(guide, validatedData);
    if (validatedData.verificationStatus === 'verified' && !guide.lastVerifiedAt) {
      guide.lastVerifiedAt = new Date();
    }

    await guide.save();

    return successResponse(guide);
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

    await connectDB();

    const guide = await Guide.findById(id);
    if (!guide) {
      return errorResponse('Guide not found', 404);
    }

    guide.status = 'archived';
    await guide.save();

    return successResponse({ message: 'Guide archived successfully', guide });
  } catch (error) {
    return handleApiError(error);
  }
}
