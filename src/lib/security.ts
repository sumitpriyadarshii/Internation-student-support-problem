/**
 * Security & Rate Limiting Module for Far From Home
 * 
 * Features:
 * 1. Account Lockout: locks an account after 5 consecutive failed login attempts for 15 minutes.
 * 2. IP Rate Limiting: temporarily blocks an IP after 10 failed login attempts across accounts for 15 minutes.
 * 3. Inactivity Timeout: 15-minute idle session timeout policy.
 */

export const SECURITY_CONFIG = {
  MAX_FAILED_LOGIN_ATTEMPTS: 5,
  ACCOUNT_LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
  IP_MAX_FAILED_ATTEMPTS: 10,
  IP_LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
  SESSION_INACTIVITY_TIMEOUT_MS: 15 * 60 * 1000, // 15 minutes
  SESSION_MAX_AGE_SECONDS: 15 * 60, // 15 minutes JWT session lifespan
} as const;

interface IpRateRecord {
  attempts: number;
  firstAttemptAt: number;
  blockedUntil?: number;
}

// In-memory rate limiting map for IP brute-force protection
const ipAttempts = new Map<string, IpRateRecord>();

// Clean up stale IP records every 10 minutes to prevent memory leaks
let lastCleanup = Date.now();
function cleanupStaleRecords(): void {
  const now = Date.now();
  if (now - lastCleanup < 10 * 60 * 1000) return;
  lastCleanup = now;

  for (const [ip, record] of ipAttempts.entries()) {
    const isBlockExpired = record.blockedUntil && record.blockedUntil <= now;
    const isWindowExpired = !record.blockedUntil && (now - record.firstAttemptAt > SECURITY_CONFIG.IP_LOCKOUT_DURATION_MS);
    if (isBlockExpired || isWindowExpired) {
      ipAttempts.delete(ip);
    }
  }
}

/**
 * Extracts client IP from incoming request or headers safely
 */
export function extractClientIp(req?: any): string {
  try {
    if (req?.headers) {
      if (typeof req.headers.get === 'function') {
        const xff = req.headers.get('x-forwarded-for');
        if (xff) return xff.split(',')[0].trim();
        const realIp = req.headers.get('x-real-ip');
        if (realIp) return realIp.trim();
      } else if (req.headers['x-forwarded-for']) {
        return String(req.headers['x-forwarded-for']).split(',')[0].trim();
      } else if (req.headers['x-real-ip']) {
        return String(req.headers['x-real-ip']).trim();
      }
    }
    if (req?.ip && typeof req.ip === 'string') {
      return req.ip.trim();
    }
  } catch {}
  return '127.0.0.1';
}

/**
 * Checks if an IP is currently blocked
 */
export function checkIpRateLimit(ip: string): { isBlocked: boolean; retryAfterMs?: number } {
  cleanupStaleRecords();
  const record = ipAttempts.get(ip);
  if (!record) return { isBlocked: false };

  const now = Date.now();
  if (record.blockedUntil) {
    if (record.blockedUntil > now) {
      return { isBlocked: true, retryAfterMs: record.blockedUntil - now };
    }
    // Block has expired, clear record
    ipAttempts.delete(ip);
    return { isBlocked: false };
  }

  // Check if window expired without hitting block limit
  if (now - record.firstAttemptAt > SECURITY_CONFIG.IP_LOCKOUT_DURATION_MS) {
    ipAttempts.delete(ip);
    return { isBlocked: false };
  }

  return { isBlocked: false };
}

/**
 * Records a failed login attempt for an IP
 */
export function recordFailedIpAttempt(ip: string): { isBlocked: boolean; currentAttempts: number } {
  cleanupStaleRecords();
  const now = Date.now();
  let record = ipAttempts.get(ip);

  if (!record || (now - record.firstAttemptAt > SECURITY_CONFIG.IP_LOCKOUT_DURATION_MS && !record.blockedUntil)) {
    record = { attempts: 1, firstAttemptAt: now };
    ipAttempts.set(ip, record);
    return { isBlocked: false, currentAttempts: 1 };
  }

  record.attempts += 1;

  if (record.attempts >= SECURITY_CONFIG.IP_MAX_FAILED_ATTEMPTS) {
    record.blockedUntil = now + SECURITY_CONFIG.IP_LOCKOUT_DURATION_MS;
    return { isBlocked: true, currentAttempts: record.attempts };
  }

  return { isBlocked: false, currentAttempts: record.attempts };
}

/**
 * Resets IP attempts on successful login
 */
export function resetIpAttempt(ip: string): void {
  ipAttempts.delete(ip);
}

/**
 * Reset all IP rate limit records (primarily for test suites)
 */
export function clearAllRateLimits(): void {
  ipAttempts.clear();
}

/**
 * Checks if a user account is locked
 */
export function isAccountLocked(lockoutUntil?: Date | null): boolean {
  if (!lockoutUntil) return false;
  return new Date(lockoutUntil).getTime() > Date.now();
}

/**
 * Calculates remaining lockout minutes
 */
export function calculateRemainingLockoutMinutes(lockoutUntil?: Date | null): number {
  if (!lockoutUntil) return 0;
  const remainingMs = new Date(lockoutUntil).getTime() - Date.now();
  if (remainingMs <= 0) return 0;
  return Math.ceil(remainingMs / (60 * 1000));
}
