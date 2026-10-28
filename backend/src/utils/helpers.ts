import crypto from 'crypto';

/**
 * Generate a URL-safe referral code
 */
export const generateReferralCode = (prefix: string = 'NW'): string => {
  const random = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `${prefix}-${random}`;
};

/**
 * Generate a secure random token for email verification / password reset
 */
export const generateSecureToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Parse pagination params from query
 */
export const parsePagination = (query: any) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

/**
 * Safe division — returns 'N/A' string when denominator is 0
 */
export const safeDivide = (numerator: number, denominator: number): number | string => {
  if (denominator === 0) return 'N/A';
  return Math.round((numerator / denominator) * 100) / 100;
};

/**
 * Calculate percentage safely
 */
export const safePercentage = (part: number, total: number): number | string => {
  if (total === 0) return 'N/A';
  return Math.round((part / total) * 10000) / 100;
};
