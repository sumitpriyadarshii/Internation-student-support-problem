import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAuth, successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import AdminRequest from '@/models/AdminRequest';
import Notification from '@/models/Notification';

export async function GET() {
  try {
    const session = await requireAuth();
    await connectDB();

    const emailQuery = session.user.email ? [{ userEmail: session.user.email }] : [];
    const requests = await AdminRequest.find({
      $or: [{ userId: session.user.id }, ...emailQuery],
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return successResponse({ requests });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAuth();
    await connectDB();

    const body = await req.json();
    const { type, title, message, documentType, documentUrl, urgency } = body;

    if (!title || !title.trim()) {
      return errorResponse('Title is required', 400);
    }

    if (!message || !message.trim()) {
      return errorResponse('Description / reason message is required', 400);
    }

    const validTypes = ['document_review', 'permission', 'activation', 'account_issue', 'role_upgrade'];
    const requestType = validTypes.includes(type) ? type : 'document_review';

    const userEmail = session.user.email || 'student@farfromhome.com';
    const userName = session.user.name || userEmail.split('@')[0];

    const newRequest = await AdminRequest.create({
      userId: session.user.id,
      userEmail,
      userName,
      type: requestType,
      title: title.trim(),
      message: message.trim(),
      documentType: documentType?.trim() || '',
      documentUrl: documentUrl?.trim() || '',
      urgency: urgency === 'urgent' ? 'urgent' : 'normal',
      status: 'pending',
    });

    // Notify user of receipt
    await Notification.create({
      userId: session.user.id,
      title: 'Request Submitted to Administration',
      message: `Your request "${title.trim()}" has been received and is queued for administrative review.`,
      type: 'system',
    });

    return successResponse(
      {
        request: newRequest,
        message: 'Your request has been submitted to the administration. You can track its status on your dashboard.',
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
