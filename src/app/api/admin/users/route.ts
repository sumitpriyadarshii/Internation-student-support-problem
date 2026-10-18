import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin, successResponse, handleApiError, errorResponse } from '@/lib/api-helpers';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || searchParams.get('q') || '';
    const role = searchParams.get('role');
    const status = searchParams.get('status');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10', 10)));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (role && role !== 'all') {
      query.role = role;
    }

    if (status && status !== 'all') {
      query.accountStatus = status;
    }

    if (search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { 'profile.university': searchRegex },
        { 'profile.destinationCountry': searchRegex },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-passwordHash')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(query),
    ]);

    return successResponse({
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await requireAdmin();
    await connectDB();

    const body = await req.json();
    const { userId, role, accountStatus } = body;

    if (!userId) {
      return errorResponse('User ID is required', 400);
    }

    // Prevent admin from deactivating or changing their own role to student
    if (session.user.id === userId && (role === 'student' || accountStatus === 'suspended' || accountStatus === 'deactivated')) {
      return errorResponse('You cannot demote or suspend your own admin account', 400);
    }

    const updateFields: Record<string, unknown> = {};
    if (role && ['student', 'admin'].includes(role)) {
      updateFields.role = role;
    }
    if (accountStatus && ['active', 'suspended', 'deactivated'].includes(accountStatus)) {
      updateFields.accountStatus = accountStatus;
    }

    if (Object.keys(updateFields).length === 0) {
      return errorResponse('No valid fields provided for update', 400);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!updatedUser) {
      return errorResponse('User not found', 404);
    }

    return successResponse(updatedUser);
  } catch (error) {
    return handleApiError(error);
  }
}
