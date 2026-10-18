import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import { taskSchema } from '@/lib/validation';
import { isOverdue } from '@/lib/utils';
import Task from '@/models/Task';

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
      return errorResponse('Invalid task ID', 400);
    }

    await connectDB();

    const task = await Task.findById(id).populate('relatedGuideId', 'title slug category').lean();
    if (!task) {
      return errorResponse('Task not found', 404);
    }

    if (task.userId.toString() !== session.user.id && session.user.role !== 'admin') {
      return errorResponse('Forbidden: You do not own this task', 403);
    }

    return successResponse({
      ...task,
      isOverdue: task.dueDate ? isOverdue(task.dueDate, task.status) : false,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid task ID', 400);
    }

    const body = await req.json();
    const partialTaskSchema = taskSchema.partial();
    const validatedData = partialTaskSchema.parse(body);

    await connectDB();

    const task = await Task.findById(id);
    if (!task) {
      return errorResponse('Task not found', 404);
    }

    if (task.userId.toString() !== session.user.id && session.user.role !== 'admin') {
      return errorResponse('Forbidden: You do not own this task', 403);
    }

    // Handle status change and completedAt
    if (validatedData.status) {
      if (validatedData.status === 'completed' && task.status !== 'completed') {
        task.completedAt = new Date();
      } else if (validatedData.status !== 'completed' && task.status === 'completed') {
        task.completedAt = undefined;
      }
      task.status = validatedData.status;
    }

    if (validatedData.title !== undefined) task.title = validatedData.title;
    if (validatedData.description !== undefined) task.description = validatedData.description;
    if (validatedData.category !== undefined) task.category = validatedData.category;
    if (validatedData.priority !== undefined) task.priority = validatedData.priority;
    if (validatedData.dueDate !== undefined) task.dueDate = validatedData.dueDate ?? undefined;
    if (validatedData.relatedGuideId !== undefined) {
      task.relatedGuideId = validatedData.relatedGuideId
        ? new mongoose.Types.ObjectId(validatedData.relatedGuideId)
        : undefined;
    }

    await task.save();

    return successResponse({
      ...task.toObject(),
      isOverdue: task.dueDate ? isOverdue(task.dueDate, task.status) : false,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse('Invalid task ID', 400);
    }

    await connectDB();

    const task = await Task.findById(id);
    if (!task) {
      return errorResponse('Task not found', 404);
    }

    if (task.userId.toString() !== session.user.id && session.user.role !== 'admin') {
      return errorResponse('Forbidden: You do not own this task', 403);
    }

    await Task.deleteOne({ _id: id });

    return successResponse({ message: 'Task deleted successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
