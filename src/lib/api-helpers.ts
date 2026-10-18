import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { auth } from './auth';
import { connectDB } from './db';

export function successResponse<T = unknown>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function getAuthSession() {
  const session = await auth();
  return session;
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.user.role !== 'admin') {
    throw new Error('Forbidden');
  }
  return session;
}

export async function withDB() {
  await connectDB();
}

export function handleApiError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof ZodError) {
    const message = error.issues.map((i) => i.message).join(', ');
    return errorResponse(message || 'Validation failed', 400);
  }

  if (error instanceof Error) {
    if (error.message === 'Unauthorized') {
      return errorResponse('You must be signed in to perform this action', 401);
    }
    if (error.message === 'Forbidden') {
      return errorResponse('You do not have permission to access this resource', 403);
    }
    return errorResponse(error.message, 400);
  }

  return errorResponse('An unexpected error occurred', 500);
}
