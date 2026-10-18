import { z } from 'zod';
import { GUIDE_CATEGORIES } from '@/models/Guide';
import { TASK_CATEGORIES } from '@/models/Task';
import { BUDDY_SUPPORT_AREAS } from '@/models/BuddyProfile';
import { EVENT_CATEGORIES } from '@/models/CommunityEvent';

// -------------------------------------------------------------
// Authentication Schemas
// -------------------------------------------------------------

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Please enter a valid email address')
    .toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

// -------------------------------------------------------------
// Profile Update Schema
// -------------------------------------------------------------

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
  countryOfOrigin: z.string().trim().max(100).optional(),
  destinationCountry: z.string().trim().max(100).optional(),
  destinationCity: z.string().trim().max(100).optional(),
  university: z.string().trim().max(150).optional(),
  preferredLanguage: z.string().trim().max(50).optional(),
  languagesSpoken: z.array(z.string().trim()).optional(),
  arrivalDate: z.coerce.date().optional().nullable(),
  interests: z.array(z.string().trim()).optional(),
  supportPreferences: z.array(z.string().trim()).optional(),
  profileImage: z.string().trim().optional(),
});

// -------------------------------------------------------------
// Onboarding Schemas (Step-based and Full)
// -------------------------------------------------------------

export const onboardingStep1Schema = z.object({
  countryOfOrigin: z.string().trim().min(1, 'Country of origin is required'),
  destinationCountry: z.string().trim().min(1, 'Destination country is required'),
  destinationCity: z.string().trim().min(1, 'Destination city is required'),
  arrivalDate: z.coerce.date({
    error: 'Please select a valid arrival date',
  }),
});

export const onboardingStep2Schema = z.object({
  university: z.string().trim().min(1, 'University name is required'),
  preferredLanguage: z.string().trim().min(1, 'Preferred language is required'),
  languagesSpoken: z
    .array(z.string().trim())
    .min(1, 'Select at least one spoken language'),
});

export const onboardingStep3Schema = z.object({
  interests: z
    .array(z.string().trim())
    .min(1, 'Please select at least one interest'),
  supportPreferences: z
    .array(z.string().trim())
    .min(1, 'Please select at least one support area you need help with'),
});

export const onboardingSchema = z.object({
  step: z.number().int().min(1).max(3).optional(),
  countryOfOrigin: z.string().trim().optional(),
  destinationCountry: z.string().trim().optional(),
  destinationCity: z.string().trim().optional(),
  arrivalDate: z.coerce.date().optional().nullable(),
  university: z.string().trim().optional(),
  preferredLanguage: z.string().trim().optional(),
  languagesSpoken: z.array(z.string().trim()).optional(),
  interests: z.array(z.string().trim()).optional(),
  supportPreferences: z.array(z.string().trim()).optional(),
  profileImage: z.string().trim().optional(),
});

// -------------------------------------------------------------
// Guide Schema
// -------------------------------------------------------------

export const guideSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  slug: z.string().trim().optional(),
  summary: z
    .string()
    .trim()
    .min(10, 'Summary must be at least 10 characters')
    .max(500, 'Summary cannot exceed 500 characters'),
  content: z
    .string()
    .min(20, 'Content must be at least 20 characters'),
  category: z.enum(GUIDE_CATEGORIES, {
    error: 'Please select a valid guide category',
  }),
  applicableCountries: z
    .array(z.string().trim())
    .default([]),
  applicableRegions: z
    .array(z.string().trim())
    .default([]),
  tags: z
    .array(z.string().trim())
    .default([]),
  sourceUrl: z
    .string()
    .trim()
    .url('Please enter a valid URL')
    .optional()
    .or(z.literal('')),
  verificationStatus: z
    .enum(['unverified', 'verified', 'outdated'])
    .default('unverified'),
  status: z
    .enum(['draft', 'published', 'archived'])
    .default('draft'),
});

// -------------------------------------------------------------
// Task Schema
// -------------------------------------------------------------

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z.string().trim().optional().default(''),
  category: z.enum(TASK_CATEGORIES).default('personal'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.coerce.date().optional().nullable(),
  status: z
    .enum(['not-started', 'in-progress', 'completed', 'pending', 'cancelled'])
    .transform((val) => (val === 'pending' ? 'not-started' : val === 'cancelled' ? 'not-started' : val))
    .pipe(z.enum(['not-started', 'in-progress', 'completed']))
    .default('not-started'),
  templateId: z.string().optional().nullable(),
  relatedGuideId: z.string().optional().nullable(),
});

// -------------------------------------------------------------
// Task Template Schema
// -------------------------------------------------------------

export const taskTemplateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z.string().trim().optional().default(''),
  category: z.enum(TASK_CATEGORIES).default('personal'),
  destinationCountry: z.string().trim().optional(),
  destinationCity: z.string().trim().optional(),
  university: z.string().trim().optional(),
  required: z.boolean().default(false),
  defaultPriority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDateOffsetDays: z.number().int().default(0),
  relatedGuideId: z.string().optional().nullable(),
  active: z.boolean().default(true),
});

// -------------------------------------------------------------
// Buddy Profile Schema
// -------------------------------------------------------------

export const buddyProfileSchema = z.object({
  university: z
    .string()
    .trim()
    .min(2, 'University must be at least 2 characters'),
  languages: z
    .array(z.string().trim())
    .min(1, 'Select at least one language'),
  interests: z
    .array(z.string().trim())
    .min(1, 'Select at least one interest'),
  supportAreas: z
    .array(z.enum(BUDDY_SUPPORT_AREAS))
    .min(1, 'Select at least one support area'),
  availability: z
    .enum(['available', 'busy', 'unavailable'])
    .default('available'),
  biography: z
    .string()
    .trim()
    .max(1000, 'Bio cannot exceed 1000 characters')
    .optional()
    .default(''),
});

// -------------------------------------------------------------
// Buddy Request Schema
// -------------------------------------------------------------

export const buddyRequestSchema = z.object({
  recipientId: z.string().trim().min(1, 'Recipient ID is required'),
  message: z
    .string()
    .trim()
    .min(5, 'Message must be at least 5 characters')
    .max(1000, 'Message cannot exceed 1000 characters')
    .optional()
    .default(''),
});

// -------------------------------------------------------------
// Community Event Schema
// -------------------------------------------------------------

export const eventSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters'),
  category: z.enum(EVENT_CATEGORIES, {
    error: 'Please select a valid event category',
  }),
  location: z
    .string()
    .trim()
    .min(2, 'Location is required'),
  startDate: z.coerce.date({
    error: 'Please enter a valid start date',
  }),
  endDate: z.coerce.date().optional().nullable(),
  capacity: z.coerce.number().int().min(1, 'Capacity must be at least 1').optional().nullable(),
  status: z
    .enum(['upcoming', 'ongoing', 'completed', 'cancelled'])
    .default('upcoming'),
});

// -------------------------------------------------------------
// Event Registration Schema
// -------------------------------------------------------------

export const eventRegistrationSchema = z.object({
  eventId: z.string().trim().min(1, 'Event ID is required'),
  notes: z.string().trim().max(500).optional(),
  dietaryRequirements: z.string().trim().max(200).optional(),
  guestsCount: z.coerce.number().int().min(0).max(5).default(0),
  registrationStatus: z
    .enum(['registered', 'cancelled'])
    .default('registered'),
});

// -------------------------------------------------------------
// Inferred TypeScript Types
// -------------------------------------------------------------

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type OnboardingStep1Input = z.infer<typeof onboardingStep1Schema>;
export type OnboardingStep2Input = z.infer<typeof onboardingStep2Schema>;
export type OnboardingStep3Input = z.infer<typeof onboardingStep3Schema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
export type GuideInput = z.infer<typeof guideSchema>;
export type TaskInput = z.infer<typeof taskSchema>;
export type TaskTemplateInput = z.infer<typeof taskTemplateSchema>;
export type BuddyProfileInput = z.infer<typeof buddyProfileSchema>;
export type BuddyRequestInput = z.infer<typeof buddyRequestSchema>;
export type EventInput = z.infer<typeof eventSchema>;
export type EventRegistrationInput = z.infer<typeof eventRegistrationSchema>;
