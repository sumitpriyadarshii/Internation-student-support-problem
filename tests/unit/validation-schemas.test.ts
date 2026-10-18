import { describe, it, expect } from 'vitest';
import {
  registerSchema,
  loginSchema,
  taskSchema,
  buddyProfileSchema,
  eventSchema,
  guideSchema,
  buddyRequestSchema,
} from '@/lib/validation';

describe('Validation Schemas (Zod)', () => {
  describe('registerSchema', () => {
    it('accepts valid student registration payloads', () => {
      const valid = {
        name: 'Alex Johnson',
        email: 'alex@example.edu',
        password: 'SecurePassword123!',
      };
      const result = registerSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it('rejects passwords shorter than 8 characters', () => {
      const invalid = {
        name: 'Alex',
        email: 'alex@example.edu',
        password: 'Pass1',
      };
      const result = registerSchema.safeParse(invalid);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('at least 8 characters');
      }
    });

    it('rejects passwords without numbers or uppercase letters', () => {
      const noUpper = {
        name: 'Alex',
        email: 'alex@example.edu',
        password: 'password123',
      };
      expect(registerSchema.safeParse(noUpper).success).toBe(false);

      const noNumber = {
        name: 'Alex',
        email: 'alex@example.edu',
        password: 'PasswordOnly',
      };
      expect(registerSchema.safeParse(noNumber).success).toBe(false);
    });

    it('rejects malformed email addresses', () => {
      const invalidEmail = {
        name: 'Alex',
        email: 'not-an-email',
        password: 'SecurePassword123!',
      };
      expect(registerSchema.safeParse(invalidEmail).success).toBe(false);
    });
  });

  describe('taskSchema', () => {
    it('accepts valid task inputs with default values', () => {
      const task = {
        title: 'Open Bank Account',
      };
      const result = taskSchema.safeParse(task);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.priority).toBe('medium');
        expect(result.data.category).toBe('personal');
        expect(result.data.status).toBe('not-started');
      }
    });

    it('maps legacy status aliases to valid task status', () => {
      const task = {
        title: 'Register SIM',
        status: 'pending',
      };
      const result = taskSchema.safeParse(task);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('not-started');
      }
    });
  });

  describe('buddyProfileSchema', () => {
    it('validates proper buddy mentor submissions', () => {
      const buddy = {
        university: 'University of Toronto',
        languages: ['English', 'Spanish'],
        interests: ['Travel', 'Cooking'],
        supportAreas: ['academic', 'housing'],
        availability: 'available',
        biography: 'Experienced international student happy to guide newcomers.',
      };
      const result = buddyProfileSchema.safeParse(buddy);
      expect(result.success).toBe(true);
    });

    it('rejects invalid support area categories', () => {
      const invalidBuddy = {
        university: 'U of T',
        languages: ['English'],
        interests: ['Art'],
        supportAreas: ['invalid-support-type'],
      };
      const result = buddyProfileSchema.safeParse(invalidBuddy);
      expect(result.success).toBe(false);
    });
  });

  describe('eventSchema', () => {
    it('validates community event creation payload', () => {
      const event = {
        title: 'Welcome Orientation BBQ',
        description: 'Meet other international students and enjoy food and games.',
        category: 'campus-orientation',
        location: 'Student Union Quad',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        capacity: 50,
      };
      const result = eventSchema.safeParse(event);
      expect(result.success).toBe(true);
    });
  });

  describe('guideSchema', () => {
    it('requires minimum title and content lengths', () => {
      const tooShort = {
        title: 'Hi',
        summary: 'Too short',
        content: 'Short',
        category: 'food-groceries',
      };
      const result = guideSchema.safeParse(tooShort);
      expect(result.success).toBe(false);
    });
  });

  describe('buddyRequestSchema', () => {
    it('enforces recipient ID and validates optional note', () => {
      const request = {
        recipientId: 'user_12345',
        message: 'Hi, would love to connect about campus life!',
      };
      const result = buddyRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('rejects empty recipient ID', () => {
      const emptyRecipient = {
        recipientId: '',
        message: 'Hello!',
      };
      expect(buddyRequestSchema.safeParse(emptyRecipient).success).toBe(false);
    });
  });
});
