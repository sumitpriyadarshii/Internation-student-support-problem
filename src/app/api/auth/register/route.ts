import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import { registerSchema } from '@/lib/validation';
import User from '@/models/User';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);

    await connectDB();

    const existingUser = await User.findOne({
      email: validatedData.email.toLowerCase(),
    });

    if (existingUser) {
      return errorResponse('An account with this email already exists', 409);
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(validatedData.password, saltRounds);

    const newUser = await User.create({
      name: validatedData.name.trim(),
      email: validatedData.email.toLowerCase(),
      passwordHash,
      role: 'student',
      accountStatus: 'active',
      onboardingCompleted: false,
      onboardingStep: 0,
      profile: {
        countryOfOrigin: '',
        destinationCountry: '',
        destinationCity: '',
        university: '',
        preferredLanguage: '',
        languagesSpoken: [],
        interests: [],
        supportPreferences: [],
        profileImage: '',
      },
    });

    return successResponse(
      {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        onboardingCompleted: newUser.onboardingCompleted,
        onboardingStep: newUser.onboardingStep,
        createdAt: newUser.createdAt,
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
