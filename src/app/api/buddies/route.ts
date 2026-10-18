import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import { calculateMatchScore } from '@/lib/utils';
import BuddyProfile, { BuddySupportArea } from '@/models/BuddyProfile';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const university = searchParams.get('university');
    const language = searchParams.get('language');
    const interest = searchParams.get('interest');
    const supportArea = searchParams.get('supportArea');
    const search = searchParams.get('search') || searchParams.get('q') || '';
    const availability = searchParams.get('availability');

    await connectDB();

    const currentUser = await User.findById(session.user.id).lean();
    if (!currentUser) {
      return errorResponse('Current user not found', 404);
    }

    const studentInfo = {
      languages: currentUser.profile?.languagesSpoken || [],
      university: currentUser.profile?.university || '',
      interests: currentUser.profile?.interests || [],
      supportPreferences: currentUser.profile?.supportPreferences || [],
    };

    const query: Record<string, unknown> = {
      approvalStatus: 'approved',
      userId: { $ne: currentUser._id },
    };

    if (university && university !== 'all') {
      query.university = new RegExp(university, 'i');
    }

    if (language && language !== 'all') {
      query.languages = { $in: [language] };
    }

    if (interest && interest !== 'all') {
      query.interests = { $in: [interest] };
    }

    if (supportArea && supportArea !== 'all') {
      query.supportAreas = { $in: [supportArea] };
    }

    if (availability && availability !== 'all') {
      query.availability = availability;
    }

    const buddies = await BuddyProfile.find(query)
      .populate('userId', 'name email profile')
      .lean();

    // Map and score buddies
    const scoredBuddies = buddies
      .map((buddy) => {
        const score = calculateMatchScore(studentInfo, {
          languages: buddy.languages || [],
          university: buddy.university || '',
          interests: buddy.interests || [],
          supportAreas: buddy.supportAreas || [],
        });

        // Calculate shared elements for highlighting in UI
        const sharedLanguages = (studentInfo.languages || []).filter((l) =>
          (buddy.languages || []).includes(l)
        );
        const sharedInterests = (studentInfo.interests || []).filter((i) =>
          (buddy.interests || []).includes(i)
        );
        const sharedSupportAreas = (studentInfo.supportPreferences || []).filter((s) =>
          (buddy.supportAreas || []).includes(s as BuddySupportArea)
        );

        return {
          ...buddy,
          matchScore: score,
          matchHighlights: {
            sharedLanguages,
            sharedInterests,
            sharedSupportAreas,
          },
        };
      })
      .filter((buddy) => {
        if (!search.trim()) return true;
        const searchLower = search.trim().toLowerCase();
        const userName = (buddy.userId as unknown as { name?: string })?.name?.toLowerCase() || '';
        const uni = buddy.university?.toLowerCase() || '';
        const bio = buddy.biography?.toLowerCase() || '';
        return (
          userName.includes(searchLower) ||
          uni.includes(searchLower) ||
          bio.includes(searchLower)
        );
      });

    // Sort by match score descending
    scoredBuddies.sort((a, b) => b.matchScore - a.matchScore);

    return successResponse(scoredBuddies);
  } catch (error) {
    return handleApiError(error);
  }
}
