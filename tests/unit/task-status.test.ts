import { describe, it, expect } from 'vitest';
import { isOverdue, getDaysUntil } from '@/lib/utils';

describe('Task Status and Overdue Calculations', () => {
  it('identifies overdue tasks when dueDate is in the past and task is not completed', () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(isOverdue(yesterday, 'not-started')).toBe(true);
    expect(isOverdue(yesterday, 'in-progress')).toBe(true);
  });

  it('never marks completed tasks as overdue, even if completion happened after dueDate', () => {
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    expect(isOverdue(lastMonth, 'completed')).toBe(false);
  });

  it('does not mark tasks with future dueDates as overdue', () => {
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    expect(isOverdue(nextWeek, 'not-started')).toBe(false);
    expect(isOverdue(nextWeek, 'in-progress')).toBe(false);
  });

  it('correctly calculates days until a target deadline', () => {
    const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 1000);
    const daysUntil = getDaysUntil(inThreeDays);
    expect(daysUntil).toBeGreaterThanOrEqual(3);
  });

  it('returns negative days for past deadlines', () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const daysUntil = getDaysUntil(fiveDaysAgo);
    expect(daysUntil).toBeLessThanOrEqual(-4);
  });
});
