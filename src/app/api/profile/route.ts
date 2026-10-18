import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import { profileUpdateSchema } from '@/lib/validation';
import User from '@/models/User';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const user = await User.findById(session.user.id).select('-passwordHash').lean();
    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await req.json();
    const validatedData = profileUpdateSchema.parse(body);

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    if (validatedData.name) {
      user.name = validatedData.name;
    }

    // Update profile sub-document fields if present
    const profileFields = [
      'countryOfOrigin',
      'destinationCountry',
      'destinationCity',
      'university',
      'preferredLanguage',
      'languagesSpoken',
      'arrivalDate',
      'interests',
      'supportPreferences',
      'profileImage',
    ] as const;

    for (const field of profileFields) {
      if (validatedData[field] !== undefined) {
        ((user.profile as unknown) as Record<string, unknown>)[field] = validatedData[field];
      }
    }

    await user.save();

    const updatedUser = await User.findById(user._id).select('-passwordHash').lean();
    return successResponse(updatedUser);
  } catch (error) {
    return handleApiError(error);
  }
}
