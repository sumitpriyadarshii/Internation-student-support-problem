import { describe, it, expect, beforeEach } from 'vitest';
import {
  SECURITY_CONFIG,
  extractClientIp,
  checkIpRateLimit,
  recordFailedIpAttempt,
  resetIpAttempt,
  clearAllRateLimits,
  isAccountLocked,
  calculateRemainingLockoutMinutes,
} from '@/lib/security';

describe('Security & Rate Limiting Module', () => {
  beforeEach(() => {
    clearAllRateLimits();
  });

  describe('Configuration Policies', () => {
    it('enforces 5 max failed attempts for account lockout', () => {
      expect(SECURITY_CONFIG.MAX_FAILED_LOGIN_ATTEMPTS).toBe(5);
    });

    it('enforces 15-minute account lockout duration', () => {
      expect(SECURITY_CONFIG.ACCOUNT_LOCKOUT_DURATION_MS).toBe(15 * 60 * 1000);
    });

    it('enforces 15-minute session inactivity timeout', () => {
      expect(SECURITY_CONFIG.SESSION_INACTIVITY_TIMEOUT_MS).toBe(15 * 60 * 1000);
    });

    it('enforces 15-minute JWT session expiration', () => {
      expect(SECURITY_CONFIG.SESSION_MAX_AGE_SECONDS).toBe(15 * 60);
    });
  });

  describe('Account Lockout Verification', () => {
    it('returns false when lockoutUntil is null or undefined', () => {
      expect(isAccountLocked(null)).toBe(false);
      expect(isAccountLocked(undefined)).toBe(false);
    });

    it('returns true when lockout is active in the future', () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
      expect(isAccountLocked(futureDate)).toBe(true);
    });

    it('returns false when lockout date is in the past', () => {
      const pastDate = new Date(Date.now() - 5000);
      expect(isAccountLocked(pastDate)).toBe(false);
    });

    it('correctly calculates remaining lockout minutes', () => {
      expect(calculateRemainingLockoutMinutes(null)).toBe(0);
      expect(calculateRemainingLockoutMinutes(new Date(Date.now() - 10000))).toBe(0);

      const nineMinFuture = new Date(Date.now() + 8.5 * 60 * 1000);
      expect(calculateRemainingLockoutMinutes(nineMinFuture)).toBe(9);
    });
  });

  describe('IP Rate Limiter & Brute Force Prevention', () => {
    const testIp = '198.51.100.42';

    it('allows clean IP initially', () => {
      const status = checkIpRateLimit(testIp);
      expect(status.isBlocked).toBe(false);
    });

    it('tracks failed attempts and blocks IP after threshold', () => {
      // 9 attempts should stay unblocked
      for (let i = 1; i <= 9; i++) {
        const result = recordFailedIpAttempt(testIp);
        expect(result.isBlocked).toBe(false);
        expect(result.currentAttempts).toBe(i);
      }

      // 10th attempt must block the IP
      const blockedResult = recordFailedIpAttempt(testIp);
      expect(blockedResult.isBlocked).toBe(true);
      expect(blockedResult.currentAttempts).toBe(10);

      // Subsequent check must show blocked with retryAfter
      const status = checkIpRateLimit(testIp);
      expect(status.isBlocked).toBe(true);
      expect(status.retryAfterMs).toBeGreaterThan(0);
    });

    it('resets IP attempts on successful login', () => {
      recordFailedIpAttempt(testIp);
      recordFailedIpAttempt(testIp);
      resetIpAttempt(testIp);

      const status = checkIpRateLimit(testIp);
      expect(status.isBlocked).toBe(false);
    });
  });

  describe('Client IP Extraction', () => {
    it('extracts primary IP from x-forwarded-for header with proxies', () => {
      const mockReq = {
        headers: {
          get: (name: string) => (name === 'x-forwarded-for' ? '203.0.113.195, 70.41.3.18' : null),
        },
      };
      expect(extractClientIp(mockReq)).toBe('203.0.113.195');
    });

    it('extracts IP from x-real-ip header', () => {
      const mockReq = {
        headers: {
          get: (name: string) => (name === 'x-real-ip' ? '198.51.100.25' : null),
        },
      };
      expect(extractClientIp(mockReq)).toBe('198.51.100.25');
    });

    it('falls back to 127.0.0.1 if headers are empty or malformed', () => {
      expect(extractClientIp(undefined)).toBe('127.0.0.1');
      expect(extractClientIp({})).toBe('127.0.0.1');
    });
  });
});
