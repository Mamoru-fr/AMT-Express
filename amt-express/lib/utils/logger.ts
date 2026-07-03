/**
 * Logger utilities for sensitive data masking
 * 
 * This module provides functions to safely log information while masking sensitive data
 * such as emails, names, accounting codes, etc.
 */

/**
 * Masks sensitive parts of a string
 * - Emails: keeps first 3 chars + domain (joh***@example.com)
 * - Names: keeps first 3 chars (Joh***)
 * - Accounting codes: keeps first 3 chars (ABC***)
 * - Phone numbers: shows only last 4 digits (***1234)
 * - Any other string: keeps first 3 chars
 */
export function maskSensitive(data: string): string {
  if (!data || typeof data !== 'string') {
    return '[empty]';
  }

  // Email pattern: mask local part (before @), keep domain
  if (/^[\w\.-]+@[\w\.-]+\.\w+$/.test(data)) {
    const [localPart, domain] = data.split('@');
    const maskedLocal = localPart.length <= 3 
      ? localPart 
      : `${localPart.slice(0, 3)}***`;
    return `${maskedLocal}@${domain}`;
  }

  // Phone number pattern: keep last 4 digits
  if (/^\+?[\d\s\-\(\)]{8,}$/.test(data)) {
    const digits = data.replace(/\D/g, '');
    if (digits.length <= 4) {
      return digits;
    }
    return `***${digits.slice(-4)}`;
  }

  // Short strings (3 chars or less) - don't mask
  if (data.length <= 3) {
    return data;
  }

  // Default: mask after first 3 characters
  return `${data.slice(0, 3)}***`;
}

/**
 * Safely logs an object by masking sensitive fields
 * @param obj - Object to log
 * @param sensitiveKeys - Keys to always mask (default: common sensitive field names)
 * @param maxDepth - Maximum recursion depth for nested objects
 */
export function logObject(obj: unknown, sensitiveKeys: string[] = [], maxDepth: number = 3): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (maxDepth <= 0) {
    return '[Object]';
  }

  // Default sensitive keys
  const defaultSensitiveKeys = [
    'password', 'hash', 'token', 'secret', 'key', 'apiKey',
    'email', 'phone', 'ssn', 'creditCard', 'address',
    'accountingCode', 'driverName', 'userId', 'uuid'
  ];

  const allSensitiveKeys = [...new Set([...defaultSensitiveKeys, ...sensitiveKeys])];

  if (typeof obj !== 'object') {
    return allSensitiveKeys.some(key => String(obj).toLowerCase().includes(key)) 
      ? maskSensitive(String(obj))
      : obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => logObject(item, sensitiveKeys, maxDepth - 1));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const isSensitive = allSensitiveKeys.some(sensitiveKey => 
      key.toLowerCase().includes(sensitiveKey.toLowerCase())
    );

    result[key] = isSensitive 
      ? maskSensitive(typeof value === 'string' ? value : String(value))
      : logObject(value, sensitiveKeys, maxDepth - 1);
  }

  return result;
}

/**
 * Safe console.log that masks sensitive data
 */
export function safeLog(message: string, ...args: unknown[]): void {
  const maskedArgs = args.map(arg => 
    typeof arg === 'string' 
      ? maskSensitive(arg)
      : logObject(arg)
  );
  console.log(message, ...maskedArgs);
}

/**
 * Safe console.error that masks sensitive data
 */
export function safeError(message: string, ...args: unknown[]): void {
  const maskedArgs = args.map(arg => 
    typeof arg === 'string' 
      ? maskSensitive(arg)
      : logObject(arg)
  );
  console.error(message, ...maskedArgs);
}

/**
 * Safe console.warn that masks sensitive data
 */
export function safeWarn(message: string, ...args: unknown[]): void {
  const maskedArgs = args.map(arg => 
    typeof arg === 'string' 
      ? maskSensitive(arg)
      : logObject(arg)
  );
  console.warn(message, ...maskedArgs);
}

export default {
  maskSensitive,
  logObject,
  safeLog,
  safeError,
  safeWarn
};
