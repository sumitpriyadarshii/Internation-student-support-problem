import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import { calculateMatchScore } from '@/lib/utils';
import BuddyProfile, { BuddySupportArea } from '@/models/BuddyProfile';
import User from '@/models/User';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid ID format', 400);
    }

    await connectDB();

    // Check by either BuddyProfile _id or userId
    const buddy = await BuddyProfile.findOne({
      $or: [{ userId: id }, { _id: id }],
    })
      .populate('userId', 'name email profile')
      .lean();

    if (!buddy) {
      return errorResponse('Buddy profile not found', 404);
    }

    const currentUser = await User.findById(session.user.id).lean();
    let matchScore = 0;
    let matchHighlights = {
      sharedLanguages: [] as string[],
      sharedInterests: [] as string[],
      sharedSupportAreas: [] as string[],
    };

    if (currentUser) {
      const studentInfo = {
        languages: currentUser.profile?.languagesSpoken || [],
        university: currentUser.profile?.university || '',
        interests: currentUser.profile?.interests || [],
        supportPreferences: currentUser.profile?.supportPreferences || [],
      };

      matchScore = calculateMatchScore(studentInfo, {
        languages: buddy.languages || [],
        university: buddy.university || '',
        interests: buddy.interests || [],
        supportAreas: buddy.supportAreas || [],
      });

      matchHighlights = {
        sharedLanguages: (studentInfo.languages || []).filter((l) =>
          (buddy.languages || []).includes(l)
        ),
        sharedInterests: (studentInfo.interests || []).filter((i) =>
          (buddy.interests || []).includes(i)
        ),
        sharedSupportAreas: (studentInfo.supportPreferences || []).filter((s) =>
          (buddy.supportAreas || []).includes(s as BuddySupportArea)
        ),
      };
    }

    return successResponse({
      ...buddy,
      matchScore,
      matchHighlights,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
