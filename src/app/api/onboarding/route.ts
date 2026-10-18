import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import User from '@/models/User';
import TaskTemplate from '@/models/TaskTemplate';
import Task from '@/models/Task';
import Notification from '@/models/Notification';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const user = await User.findById(session.user.id).select(
      'name email onboardingCompleted onboardingStep profile'
    );
    if (!user) {
      return errorResponse('User not found', 404);
    }

    return successResponse({
      name: user.name,
      email: user.email,
      onboardingCompleted: user.onboardingCompleted,
      onboardingStep: user.onboardingStep,
      profile: user.profile,
    });
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
    const { step, data = {} } = body;

    if (!step || typeof step !== 'number' || step < 1 || step > 4) {
      return errorResponse('Valid step number (1, 2, 3, or 4) is required', 400);
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    if (!user.profile) {
      user.profile = {
        languagesSpoken: [],
        interests: [],
        supportPreferences: [],
      };
    }

    if (step === 1) {
      // Step 1: Basic profile - name confirmation, profile image
      if (data.name && typeof data.name === 'string' && data.name.trim().length >= 2) {
        user.name = data.name.trim();
      }
      if (data.profileImage !== undefined) {
        user.profile.profileImage = data.profileImage;
      }
      user.onboardingStep = Math.max(user.onboardingStep || 0, 1);
    } else if (step === 2) {
      // Step 2: Location & Institution
      if (data.countryOfOrigin) user.profile.countryOfOrigin = data.countryOfOrigin;
      if (data.destinationCountry) user.profile.destinationCountry = data.destinationCountry;
      if (data.destinationCity) user.profile.destinationCity = data.destinationCity;
      if (data.university) user.profile.university = data.university;
      if (data.arrivalDate) user.profile.arrivalDate = new Date(data.arrivalDate);
      user.onboardingStep = Math.max(user.onboardingStep || 0, 2);
    } else if (step === 3) {
      // Step 3: Language & Preferences
      if (data.preferredLanguage) user.profile.preferredLanguage = data.preferredLanguage;
      if (Array.isArray(data.languagesSpoken)) user.profile.languagesSpoken = data.languagesSpoken;
      if (Array.isArray(data.interests)) user.profile.interests = data.interests;
      if (Array.isArray(data.supportPreferences)) user.profile.supportPreferences = data.supportPreferences;
      user.onboardingStep = Math.max(user.onboardingStep || 0, 3);
    } else if (step === 4) {
      // Step 4: Summary & Completion
      user.onboardingStep = 4;
      user.onboardingCompleted = true;

      // Auto-assign task templates matching user's destination
      const activeTemplates = await TaskTemplate.find({ active: true });
      const destCountry = (user.profile.destinationCountry || '').trim().toLowerCase();

      const matchingTemplates = activeTemplates.filter((tmpl) => {
        if (!tmpl.destinationCountry || tmpl.destinationCountry.trim() === '') {
          return true;
        }
        return tmpl.destinationCountry.trim().toLowerCase() === destCountry;
      });

      const arrivalTime = user.profile.arrivalDate
        ? new Date(user.profile.arrivalDate).getTime()
        : null;

      const newTasks = matchingTemplates.map((tmpl) => {
        let taskDueDate: Date | undefined = undefined;
        if (arrivalTime) {
          const offsetDays = tmpl.dueDateOffsetDays || 0;
          taskDueDate = new Date(arrivalTime + offsetDays * 24 * 60 * 60 * 1000);
        }

        return {
          userId: user._id,
          templateId: tmpl._id,
          title: tmpl.title,
          description: tmpl.description || '',
          category: tmpl.category,
          priority: tmpl.defaultPriority,
          dueDate: taskDueDate,
          status: 'not-started',
          relatedGuideId: tmpl.relatedGuideId,
        };
      });

      if (newTasks.length > 0) {
        await Task.insertMany(newTasks);
      }

      // Create a welcome notification
      await Notification.create({
        userId: user._id,
        title: 'Welcome to Far From Home! 🎒',
        message: `Your pre-departure journey to ${user.profile.destinationCountry || 'your destination'} has begun. We have auto-generated your initial preparation checklist.`,
        type: 'system',
      });
    }

    await user.save();

    return successResponse({
      name: user.name,
      onboardingCompleted: user.onboardingCompleted,
      onboardingStep: user.onboardingStep,
      profile: user.profile,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
