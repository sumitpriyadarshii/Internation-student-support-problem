import { connectDB } from '@/lib/db';
import { requireAdmin, successResponse, handleApiError } from '@/lib/api-helpers';
import User from '@/models/User';
import Guide from '@/models/Guide';
import Task from '@/models/Task';
import CommunityEvent from '@/models/CommunityEvent';
import BuddyProfile from '@/models/BuddyProfile';
import BuddyRequest from '@/models/BuddyRequest';

interface RecentUserDoc {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

interface RecentGuideDoc {
  _id: unknown;
  title: string;
  category: string;
  status: string;
  createdAt: Date;
}

interface RecentEventDoc {
  _id: unknown;
  title: string;
  category: string;
  status: string;
  startDate: Date;
  createdAt: Date;
}

interface RecentBuddyRequestDoc {
  _id: unknown;
  requesterId?: { name?: string };
  recipientId?: { name?: string };
  createdAt: Date;
}

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    const now = new Date();

    // 1. Core Platform Counts
    const [
      totalUsers,
      activeStudents,
      activeUsers,
      totalGuides,
      publishedGuides,
      totalTasks,
      completedTasks,
      inProgressTasks,
      notStartedTasks,
      totalEvents,
      upcomingEvents,
      totalBuddyProfiles,
      pendingBuddyProfiles,
      totalBuddyRequests,
      pendingBuddyRequests,
      acceptedBuddyRequests,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student', accountStatus: 'active' }),
      User.countDocuments({ accountStatus: 'active' }),
      Guide.countDocuments(),
      Guide.countDocuments({ status: 'published' }),
      Task.countDocuments(),
      Task.countDocuments({ status: 'completed' }),
      Task.countDocuments({ status: 'in-progress' }),
      Task.countDocuments({ status: 'not-started' }),
      CommunityEvent.countDocuments(),
      CommunityEvent.countDocuments({
        $or: [{ status: 'upcoming' }, { startDate: { $gte: now } }],
      }),
      BuddyProfile.countDocuments(),
      BuddyProfile.countDocuments({ approvalStatus: 'pending' }),
      BuddyRequest.countDocuments(),
      BuddyRequest.countDocuments({ status: 'pending' }),
      BuddyRequest.countDocuments({ status: 'accepted' }),
    ]);

    // 2. Task Completion Status Breakdown
    const taskTotal = completedTasks + inProgressTasks + notStartedTasks;
    const taskCompletionRates = [
      {
        name: 'Completed',
        value: completedTasks,
        percentage: taskTotal > 0 ? Math.round((completedTasks / taskTotal) * 100) : 0,
        color: '#10b981', // green
      },
      {
        name: 'In Progress',
        value: inProgressTasks,
        percentage: taskTotal > 0 ? Math.round((inProgressTasks / taskTotal) * 100) : 0,
        color: '#0ea5e9', // blue
      },
      {
        name: 'Not Started',
        value: notStartedTasks,
        percentage: taskTotal > 0 ? Math.round((notStartedTasks / taskTotal) * 100) : 0,
        color: '#f59e0b', // amber
      },
    ];

    // 3. Events by Category Breakdown
    const eventsGrouped = await CommunityEvent.aggregate<{ _id: string; count: number }>([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]);

    const categoryLabels: Record<string, string> = {
      'cultural-exchange': 'Cultural',
      'language-practice': 'Language',
      'campus-orientation': 'Orientation',
      'food-cooking': 'Food & Social',
      'sports-recreation': 'Sports',
      'career-networking': 'Networking',
      'local-exploration': 'Exploration',
    };

    const eventsByCategory = eventsGrouped.map((item) => ({
      category: item._id,
      label: categoryLabels[item._id] || item._id,
      count: item.count,
    }));

    // 4. User Growth
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const userGrowthAgg = await User.aggregate<{
      _id: { year: number; month: number };
      count: number;
    }>([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let runningUsers = Math.max(0, totalUsers - userGrowthAgg.reduce((acc, u) => acc + u.count, 0));

    const userGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const match = userGrowthAgg.find((u) => u._id.year === y && u._id.month === m);
      const newInMonth = match ? match.count : 0;
      runningUsers += newInMonth;
      userGrowth.push({
        month: `${monthNames[m - 1]} ${y.toString().slice(-2)}`,
        users: runningUsers,
        newUsers: newInMonth,
      });
    }

    if (userGrowth.every((g) => g.users === 0) && totalUsers > 0) {
      userGrowth[userGrowth.length - 1].users = totalUsers;
    }

    // 5. Recent Activity Feed
    const [recentUsers, recentGuides, recentEvents, recentRequests] = await Promise.all([
      User.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select('name email role createdAt')
        .lean<RecentUserDoc[]>(),
      Guide.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select('title category status createdAt')
        .lean<RecentGuideDoc[]>(),
      CommunityEvent.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .select('title category status startDate createdAt')
        .lean<RecentEventDoc[]>(),
      BuddyRequest.find()
        .sort({ createdAt: -1 })
        .limit(3)
        .populate('requesterId', 'name')
        .populate('recipientId', 'name')
        .lean<RecentBuddyRequestDoc[]>(),
    ]);

    const activities: Array<{
      id: string;
      type: 'user' | 'guide' | 'event' | 'buddy';
      title: string;
      description: string;
      timestamp: Date;
    }> = [];

    recentUsers.forEach((u) => {
      activities.push({
        id: `user-${u._id}`,
        type: 'user',
        title: 'New User Registered',
        description: `${u.name} joined as a ${u.role}`,
        timestamp: u.createdAt,
      });
    });

    recentGuides.forEach((g) => {
      activities.push({
        id: `guide-${g._id}`,
        type: 'guide',
        title: 'Guide Published / Updated',
        description: `"${g.title}" in ${g.category}`,
        timestamp: g.createdAt,
      });
    });

    recentEvents.forEach((e) => {
      activities.push({
        id: `event-${e._id}`,
        type: 'event',
        title: 'Community Event Created',
        description: `"${e.title}" scheduled`,
        timestamp: e.createdAt,
      });
    });

    recentRequests.forEach((r) => {
      activities.push({
        id: `buddy-${r._id}`,
        type: 'buddy',
        title: 'Buddy Connection Request',
        description: `${r.requesterId?.name || 'A student'} requested buddy ${r.recipientId?.name || 'support'}`,
        timestamp: r.createdAt,
      });
    });

    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return successResponse({
      stats: {
        totalUsers,
        activeUsers,
        activeStudents,
        totalGuides,
        publishedGuides,
        totalTasks,
        completedTasks,
        activeTasks: inProgressTasks + notStartedTasks,
        totalEvents,
        upcomingEvents,
        totalBuddyProfiles,
        pendingBuddyProfiles,
        totalBuddyRequests,
        pendingBuddyRequests,
        acceptedBuddyRequests,
      },
      taskCompletionRates,
      eventsByCategory,
      userGrowth,
      recentActivity: activities.slice(0, 8),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
