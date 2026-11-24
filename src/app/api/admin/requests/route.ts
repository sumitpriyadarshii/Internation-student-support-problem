import { NextRequest } from 'next/server';
import { connectDB } from '@/lib/db';
import { requireAdmin, successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import AdminRequest from '@/models/AdminRequest';
import User from '@/models/User';
import Notification from '@/models/Notification';

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '15', 10)));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (type && type !== 'all') {
      query.type = type;
    }

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ userName: regex }, { userEmail: regex }, { title: regex }, { message: regex }];
    }

    const [requests, total, pendingCount] = await Promise.all([
      AdminRequest.find(query)
        .populate('userId', 'name email role accountStatus')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdminRequest.countDocuments(query),
      AdminRequest.countDocuments({ status: 'pending' }),
    ]);

    return successResponse({
      requests,
      total,
      pendingCount,
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
    const { requestId, action, adminNotes } = body;

    if (!requestId) {
      return errorResponse('Request ID is required', 400);
    }

    if (!['approve', 'reject'].includes(action)) {
      return errorResponse('Action must be either "approve" or "reject"', 400);
    }

    const adminRequest = await AdminRequest.findById(requestId);
    if (!adminRequest) {
      return errorResponse('Request not found', 404);
    }

    const isApproval = action === 'approve';
    adminRequest.status = isApproval ? 'approved' : 'rejected';
    adminRequest.adminNotes = adminNotes || (isApproval ? 'Approved by administrator' : 'Rejected by administrator');
    adminRequest.reviewedBy = session.user.id as any;
    adminRequest.reviewedAt = new Date();
    await adminRequest.save();

    // Notify user of decision
    let updatedUser = null;
    const targetUserId = adminRequest.userId;

    if (isApproval) {
      if (adminRequest.type === 'activation') {
        const userFilter = adminRequest.userId ? { _id: adminRequest.userId } : { email: adminRequest.userEmail };
        updatedUser = await User.findOneAndUpdate(
          userFilter,
          {
            $set: {
              accountStatus: 'active',
              failedLoginAttempts: 0,
              lockoutUntil: null,
            },
          },
          { new: true }
        );

        if (updatedUser) {
          await Notification.create({
            userId: updatedUser._id,
            title: 'Account Reactivated 🎉',
            message: 'Your account activation request was approved by the administrator. All platform features are now available.',
            type: 'system',
          });
        }
      } else if (targetUserId) {
        const notifTitle =
          adminRequest.type === 'document_review'
            ? 'Document Verified & Approved ✅'
            : 'Permission Request Approved ✅';

        await Notification.create({
          userId: targetUserId,
          title: notifTitle,
          message: `Your request "${adminRequest.title}" was approved by the administration. ${adminRequest.adminNotes}`,
          type: 'system',
        });
      }
    } else if (targetUserId) {
      await Notification.create({
        userId: targetUserId,
        title: 'Request Update: Attention Required ⚠️',
        message: `Your request "${adminRequest.title}" was reviewed by the administration: ${adminRequest.adminNotes}`,
        type: 'system',
      });
    }

    return successResponse({
      request: adminRequest,
      user: updatedUser,
      message: isApproval
        ? `Request "${adminRequest.title}" approved successfully.`
        : `Request marked as rejected.`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return errorResponse('Request ID is required', 400);
    }

    await AdminRequest.findByIdAndDelete(id);
    return successResponse({ message: 'Request deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
