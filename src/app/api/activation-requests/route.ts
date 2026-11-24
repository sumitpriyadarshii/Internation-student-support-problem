import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import User from '@/models/User';
import AdminRequest from '@/models/AdminRequest';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const email = (body.email || '').toLowerCase().trim();
    const userMessage = (body.message || '').trim() || 'Please review and reactivate my account so I can continue using the platform.';

    if (!email) {
      return errorResponse('Email address is required', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse('No account registered with this email address.', 404);
    }

    if (user.accountStatus === 'active') {
      return successResponse({
        alreadyActive: true,
        message: 'Your account is already active. You can log in directly with your password.',
      });
    }

    // Check for an existing pending request
    const existingPending = await AdminRequest.findOne({
      userEmail: email,
      status: 'pending',
    });

    if (existingPending) {
      return successResponse({
        pending: true,
        message: 'You already have an activation request pending review. The administrator will activate your account shortly.',
      });
    }

    const newRequest = await AdminRequest.create({
      userId: user._id,
      userEmail: email,
      userName: user.name,
      type: 'activation',
      title: 'Account Reactivation Request',
      message: userMessage,
      status: 'pending',
    });

    return successResponse({
      requestId: newRequest._id,
      message: 'Your activation request has been submitted to the administrator. Once approved, you will be able to log in.',
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
