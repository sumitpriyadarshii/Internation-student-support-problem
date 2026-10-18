import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import User from '@/models/User';

const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to confirm account deletion'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const body = await req.json();
    const { password } = deleteAccountSchema.parse(body);

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return errorResponse('User not found', 404);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return errorResponse('Incorrect password', 400);
    }

    user.accountStatus = 'deactivated';
    await user.save();

    return successResponse({ message: 'Account deactivated successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
