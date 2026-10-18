export const GUIDE_CATEGORIES = [
  'food-groceries',
  'banking-financial',
  'sim-mobile',
  'documentation-immigration',
  'university-campus',
  'accommodation-transport',
  'healthcare-emergency',
  'local-culture-language',
] as const;

export const TASK_CATEGORIES = [
  ...GUIDE_CATEGORIES,
  'personal',
] as const;

export const BUDDY_SUPPORT_AREAS = [
  'academic',
  'cultural',
  'language',
  'housing',
  'financial',
  'social',
  'career',
  'health',
] as const;

export const EVENT_CATEGORIES = [
  'cultural-exchange',
  'language-practice',
  'campus-orientation',
  'food-cooking',
  'sports-recreation',
  'career-networking',
  'local-exploration',
] as const;

export const NOTIFICATION_TYPES = [
  'task-reminder',
  'buddy-request',
  'event-update',
  'system',
  'guide-update',
] as const;
