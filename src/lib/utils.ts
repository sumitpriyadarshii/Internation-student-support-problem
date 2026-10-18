import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getDaysUntil(date: Date | string): number {
  const now = new Date();
  const target = new Date(date);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function isOverdue(dueDate: Date | string, status: string): boolean {
  if (status === 'completed') return false;
  return new Date(dueDate) < new Date();
}

export function calculateMatchScore(
  student: { languages: string[]; university: string; interests: string[]; supportPreferences: string[] },
  buddy: { languages: string[]; university: string; interests: string[]; supportAreas: string[] }
): number {
  let score = 0;
  // Language match (30% weight)
  const sharedLangs = (student.languages || []).filter((l) => (buddy.languages || []).includes(l));
  if (student.languages && student.languages.length > 0) {
    score += 30 * Math.min(sharedLangs.length / student.languages.length, 1);
  }
  // University match (25% weight)
  if (
    student.university &&
    buddy.university &&
    student.university.toLowerCase() === buddy.university.toLowerCase()
  ) {
    score += 25;
  }
  // Interest match (20% weight)
  const sharedInterests = (student.interests || []).filter((i) => (buddy.interests || []).includes(i));
  if (student.interests && student.interests.length > 0) {
    score += 20 * Math.min(sharedInterests.length / student.interests.length, 1);
  }
  // Support match (15% weight)
  const sharedSupport = (student.supportPreferences || []).filter((s) => (buddy.supportAreas || []).includes(s));
  if (student.supportPreferences && student.supportPreferences.length > 0) {
    score += 15 * Math.min(sharedSupport.length / student.supportPreferences.length, 1);
  }
  // Base availability score (10%)
  score += 10;
  return Math.round(score);
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function sanitizeInput(input: string): string {
  return input.replace(/<[^>]*>/g, '').trim();
}
