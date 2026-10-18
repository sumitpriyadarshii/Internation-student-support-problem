import type {
  IUser,
  IUserProfile,
  UserRole,
  AccountStatus,
  IGuide,
  GuideCategory,
  GuideVerificationStatus,
  GuideStatus,
  ITask,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  ITaskTemplate,
  IBuddyProfile,
  BuddySupportArea,
  BuddyAvailability,
  BuddyApprovalStatus,
  IBuddyRequest,
  BuddyRequestStatus,
  ICommunityEvent,
  CommunityEventCategory,
  CommunityEventStatus,
  IEventRegistration,
  EventRegistrationStatus,
  INotification,
  NotificationType,
  IBookmark,
} from '@/models';

// Re-export core model types
export type {
  IUser,
  IUserProfile,
  UserRole,
  AccountStatus,
  IGuide,
  GuideCategory,
  GuideVerificationStatus,
  GuideStatus,
  ITask,
  TaskCategory,
  TaskPriority,
  TaskStatus,
  ITaskTemplate,
  IBuddyProfile,
  BuddySupportArea,
  BuddyAvailability,
  BuddyApprovalStatus,
  IBuddyRequest,
  BuddyRequestStatus,
  ICommunityEvent,
  CommunityEventCategory,
  CommunityEventStatus,
  IEventRegistration,
  EventRegistrationStatus,
  INotification,
  NotificationType,
  IBookmark,
};

export * from '@/lib/constants';

// -------------------------------------------------------------
// Standard API Response Structure
// -------------------------------------------------------------

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// -------------------------------------------------------------
// Safe Client-Side User Types
// -------------------------------------------------------------

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profile: IUserProfile;
  onboardingCompleted: boolean;
  onboardingStep: number;
  accountStatus: AccountStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// -------------------------------------------------------------
// Buddy Matching & Interaction Types
// -------------------------------------------------------------

export interface BuddyCardData {
  id: string;
  userId: string;
  name: string;
  university: string;
  languages: string[];
  interests: string[];
  supportAreas: BuddySupportArea[];
  availability: BuddyAvailability;
  biography?: string;
  profileImage?: string;
  countryOfOrigin?: string;
  matchScore?: number;
}

export interface BuddyMatchScoreDetails {
  totalScore: number;
  languageScore: number;
  universityScore: number;
  interestScore: number;
  supportScore: number;
  sharedLanguages: string[];
  sharedInterests: string[];
  sharedSupportAreas: string[];
}

export interface BuddyRequestWithUsers {
  id: string;
  requester: {
    id: string;
    name: string;
    email: string;
    profile?: IUserProfile;
  };
  recipient: {
    id: string;
    name: string;
    email: string;
    profile?: IUserProfile;
  };
  message?: string;
  status: BuddyRequestStatus;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// -------------------------------------------------------------
// Filter & Query Options
// -------------------------------------------------------------

export interface TaskFilterOptions {
  category?: TaskCategory | 'all';
  priority?: TaskPriority | 'all';
  status?: TaskStatus | 'all';
  search?: string;
}

export interface GuideFilterOptions {
  category?: GuideCategory | 'all';
  country?: string;
  search?: string;
  tag?: string;
  status?: GuideStatus;
}

export interface EventFilterOptions {
  category?: CommunityEventCategory | 'all';
  status?: CommunityEventStatus | 'all';
  upcomingOnly?: boolean;
  search?: string;
}

// -------------------------------------------------------------
// Dashboard Summary Types
// -------------------------------------------------------------

export interface DashboardMetrics {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  upcomingEventsCount: number;
  activeBuddyRequestsCount: number;
  bookmarkedGuidesCount: number;
  daysUntilArrival?: number | null;
}
