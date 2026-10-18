import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  connectDB: vi.fn(),
}));

import { handleApiError, requireAuth, requireAdmin } from '@/lib/api-helpers';
import { auth } from '@/lib/auth';
import { ZodError, z } from 'zod';

describe('Permissions & Error Handling', () => {
  it('converts Unauthorized error into 401 response with friendly message', async () => {
    const error = new Error('Unauthorized');
    const response = handleApiError(error);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('You must be signed in');
  });

  it('converts Forbidden error into 403 response with access denied message', async () => {
    const error = new Error('Forbidden');
    const response = handleApiError(error);

    expect(response.status).toBe(403);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('permission');
  });

  it('handles Zod validation errors with 400 status and aggregated issues', async () => {
    const parseResult = z.string().min(8, 'Password must be at least 8 characters').safeParse('short');
    if (parseResult.success) throw new Error('Expected failure');
    const zodError = parseResult.error;

    const response = handleApiError(zodError);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain('Password must be at least 8 characters');
  });

  it('handles general errors gracefully', async () => {
    const generalError = new Error('Database query timed out');
    const response = handleApiError(generalError);
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe('Database query timed out');
  });

  it('requireAuth rejects unauthenticated requests', async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as any);
    await expect(requireAuth()).rejects.toThrow('Unauthorized');
  });

  it('requireAuth allows authenticated users', async () => {
    const mockSession = { user: { id: 'u1', role: 'student', onboardingCompleted: true } };
    vi.mocked(auth).mockResolvedValueOnce(mockSession as any);
    const session = await requireAuth();
    expect(session.user.id).toBe('u1');
  });

  it('requireAdmin blocks non-admin users with Forbidden error', async () => {
    const studentSession = { user: { id: 'u1', role: 'student', onboardingCompleted: true } };
    vi.mocked(auth).mockResolvedValueOnce(studentSession as any);
    await expect(requireAdmin()).rejects.toThrow('Forbidden');
  });

  it('requireAdmin allows administrator sessions', async () => {
    const adminSession = { user: { id: 'admin1', role: 'admin', onboardingCompleted: true } };
    vi.mocked(auth).mockResolvedValueOnce(adminSession as any);
    const session = await requireAdmin();
    expect(session.user.role).toBe('admin');
  });
});
