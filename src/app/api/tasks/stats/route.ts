import { connectDB } from '@/lib/db';
import { auth } from '@/lib/auth';
import { successResponse, errorResponse, handleApiError } from '@/lib/api-helpers';
import Task from '@/models/Task';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return errorResponse('Unauthorized', 401);
    }

    await connectDB();

    const tasks = await Task.find({ userId: session.user.id })
      .populate('relatedGuideId', 'title slug category')
      .lean();

    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    let completed = 0;
    let pending = 0;
    let overdue = 0;

    const upcomingDeadlines: typeof tasks = [];

    for (const task of tasks) {
      if (task.status === 'completed') {
        completed++;
      } else {
        pending++;
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          if (dueDate < now) {
            overdue++;
          } else if (dueDate <= next7Days) {
            upcomingDeadlines.push(task);
          }
        }
      }
    }

    upcomingDeadlines.sort((a, b) => {
      const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
      const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
      return dateA - dateB;
    });

    const total = tasks.length;
    const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return successResponse({
      total,
      completed,
      pending,
      overdue,
      completionPercentage,
      upcomingDeadlines,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
