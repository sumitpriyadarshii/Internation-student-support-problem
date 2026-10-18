import { NextRequest } from 'next/server';
import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import { taskSchema } from '@/lib/validation';
import { isOverdue } from '@/lib/utils';
import Task from '@/models/Task';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search') || searchParams.get('q') || '';

    await connectDB();

    const query: Record<string, unknown> = {
      userId: session.user.id,
    };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    if (search.trim()) {
      query.title = new RegExp(search.trim(), 'i');
    }

    const tasks = await Task.find(query)
      .sort({ dueDate: 1, createdAt: -1 })
      .populate('relatedGuideId', 'title slug category')
      .lean();

    const tasksWithOverdue = tasks.map((task) => ({
      ...task,
      isOverdue: task.dueDate ? isOverdue(task.dueDate, task.status) : false,
    }));

    return successResponse(tasksWithOverdue);
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
    const validatedData = taskSchema.parse(body);

    await connectDB();

    const task = await Task.create({
      userId: new mongoose.Types.ObjectId(session.user.id),
      title: validatedData.title,
      description: validatedData.description,
      category: validatedData.category,
      priority: validatedData.priority,
      dueDate: validatedData.dueDate ?? undefined,
      status: validatedData.status,
      templateId: validatedData.templateId
        ? new mongoose.Types.ObjectId(validatedData.templateId)
        : undefined,
      relatedGuideId: validatedData.relatedGuideId
        ? new mongoose.Types.ObjectId(validatedData.relatedGuideId)
        : undefined,
      completedAt: validatedData.status === 'completed' ? new Date() : undefined,
    });

    return successResponse(task, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
