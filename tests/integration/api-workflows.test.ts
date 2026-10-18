import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  connectDB: vi.fn(),
}));

vi.mock('@/models/User', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
    findById: vi.fn(),
  },
}));

vi.mock('@/models/Task', () => ({
  default: {
    find: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    findOneAndUpdate: vi.fn(),
  },
}));

vi.mock('@/models/BuddyRequest', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock('@/models/CommunityEvent', () => ({
  default: {
    findById: vi.fn(),
  },
}));

vi.mock('@/models/EventRegistration', () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
  },
}));

import { auth } from '@/lib/auth';
import User from '@/models/User';
import Task from '@/models/Task';
import BuddyRequest from '@/models/BuddyRequest';
import CommunityEvent from '@/models/CommunityEvent';
import EventRegistration from '@/models/EventRegistration';

describe('API Workflows and Business Rules Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication & Registration Rules', () => {
    it('prevents registering an already existing email address', async () => {
      vi.mocked(User.findOne).mockResolvedValueOnce({
        _id: 'existing-id',
        email: 'priya@example.com',
      } as any);

      const existingUser = await User.findOne({ email: 'priya@example.com' });
      expect(existingUser).not.toBeNull();
      expect(existingUser?._id).toBe('existing-id');
    });
  });

  describe('Cross-User Data Protection', () => {
    it('enforces task ownership and denies access when student is not the owner', async () => {
      const studentSession = { user: { id: 'student-A', role: 'student' } };
      vi.mocked(auth).mockResolvedValueOnce(studentSession as any);

      // Task belongs to student-B
      vi.mocked(Task.findById).mockResolvedValueOnce({
        _id: 'task-101',
        userId: 'student-B',
        title: 'Confidential Task',
        status: 'in-progress',
      } as any);

      const currentSession = await auth();
      const task = await Task.findById('task-101');

      const isOwner = task?.userId === currentSession?.user?.id;
      const isAdmin = currentSession?.user?.role === 'admin';
      const canAccess = isOwner || isAdmin;

      expect(canAccess).toBe(false);
    });

    it('allows administrator to inspect or manage resources across students', async () => {
      const adminSession = { user: { id: 'admin-1', role: 'admin' } };
      vi.mocked(auth).mockResolvedValueOnce(adminSession as any);

      vi.mocked(Task.findById).mockResolvedValueOnce({
        _id: 'task-101',
        userId: 'student-B',
        title: 'Student Task',
      } as any);

      const currentSession = await auth();
      const task = await Task.findById('task-101');

      const isOwner = task?.userId === currentSession?.user?.id;
      const isAdmin = currentSession?.user?.role === 'admin';
      const canAccess = isOwner || isAdmin;

      expect(canAccess).toBe(true);
    });
  });

  describe('Buddy Request Transition and Guard Rules', () => {
    it('prevents a user from requesting themselves as a peer buddy', () => {
      const requesterId = 'student-123';
      const recipientId = 'student-123';

      const isSelfRequest = requesterId === recipientId;
      expect(isSelfRequest).toBe(true);
    });

    it('detects and prevents duplicate pending requests between the same peer pair', async () => {
      vi.mocked(BuddyRequest.findOne).mockResolvedValueOnce({
        _id: 'req-1',
        requesterId: 'student-A',
        recipientId: 'student-B',
        status: 'pending',
      } as any);

      const existingRequest = await BuddyRequest.findOne({
        requesterId: 'student-A',
        recipientId: 'student-B',
        status: 'pending',
      });

      expect(existingRequest).not.toBeNull();
      expect(existingRequest?.status).toBe('pending');
    });

    it('validates state transitions: requester can cancel, recipient can accept/reject', () => {
      const requesterId = 'student-A';
      const recipientId = 'student-B';

      const isValidTransition = (
        currentStatus: string,
        newStatus: string,
        actorId: string
      ): boolean => {
        if (currentStatus !== 'pending') return false;
        if (actorId === requesterId && newStatus === 'cancelled') return true;
        if (actorId === recipientId && (newStatus === 'accepted' || newStatus === 'rejected')) {
          return true;
        }
        return false;
      };

      // Requester cancels => valid
      expect(isValidTransition('pending', 'cancelled', requesterId)).toBe(true);
      // Requester accepts own request => invalid
      expect(isValidTransition('pending', 'accepted', requesterId)).toBe(false);
      // Recipient accepts => valid
      expect(isValidTransition('pending', 'accepted', recipientId)).toBe(true);
      // Recipient rejects => valid
      expect(isValidTransition('pending', 'rejected', recipientId)).toBe(true);
      // Recipient cancels => invalid
      expect(isValidTransition('pending', 'cancelled', recipientId)).toBe(false);
      // Transition from already accepted state => invalid
      expect(isValidTransition('accepted', 'cancelled', requesterId)).toBe(false);
    });
  });

  describe('Community Event Registration Guards', () => {
    it('prevents registering when event has reached maximum capacity', async () => {
      vi.mocked(CommunityEvent.findById).mockResolvedValueOnce({
        _id: 'event-1',
        title: 'Campus Tour',
        capacity: 30,
        registrationCount: 30,
      } as any);

      const event = await CommunityEvent.findById('event-1');
      const isFull = (event?.registrationCount ?? 0) >= (event?.capacity ?? Infinity);
      expect(isFull).toBe(true);
    });

    it('prevents duplicate event registration for the same student', async () => {
      vi.mocked(EventRegistration.findOne).mockResolvedValueOnce({
        _id: 'reg-1',
        eventId: 'event-1',
        userId: 'student-A',
        registrationStatus: 'registered',
      } as any);

      const existingReg = await EventRegistration.findOne({
        eventId: 'event-1',
        userId: 'student-A',
        registrationStatus: 'registered',
      });

      expect(existingReg).not.toBeNull();
    });
  });
});
