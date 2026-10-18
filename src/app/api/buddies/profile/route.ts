import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import { buddyProfileSchema } from '@/lib/validation';
import BuddyProfile from '@/models/BuddyProfile';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const profile = await BuddyProfile.findOne({ userId: session.user.id })
      .populate('userId', 'name email profile')
      .lean();

    return successResponse(profile || null);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await req.json();
    const validatedData = buddyProfileSchema.parse(body);

    await connectDB();

    let profile = await BuddyProfile.findOne({ userId: session.user.id });

    if (profile) {
      profile.university = validatedData.university;
      profile.languages = validatedData.languages;
      profile.interests = validatedData.interests;
      profile.supportAreas = validatedData.supportAreas;
      profile.availability = validatedData.availability;
      profile.biography = validatedData.biography ?? '';
      await profile.save();
    } else {
      profile = await BuddyProfile.create({
        ...validatedData,
        userId: session.user.id,
        approvalStatus: 'pending',
      });
    }

    const populatedProfile = await BuddyProfile.findById(profile._id)
      .populate('userId', 'name email profile')
      .lean();

    return successResponse(populatedProfile, profile ? 200 : 201);
  } catch (error) {
    return handleApiError(error);
  }
}
