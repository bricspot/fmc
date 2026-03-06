/**
 * Input Sanitisation Utilities
 * Used across all API route handlers
 */

/**
 * Sanitize a string: trim, remove HTML tags, limit to maxLength chars
 */
export function sanitizeString(str, maxLength = 500) {
    if (typeof str !== 'string') return '';
    return str
        .trim()
        .replace(/<[^>]*>/g, '') // Strip HTML tags
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .slice(0, maxLength);
}

/**
 * Sanitize and validate an email address
 * Returns lowercase trimmed email or empty string if invalid
 */
export function sanitizeEmail(str) {
    if (typeof str !== 'string') return '';
    const email = str.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) ? email : '';
}

/**
 * Sanitize a phone number: strips non-numeric chars (except leading +)
 * Validates 10-15 digit length
 * Returns sanitized phone or empty string if invalid
 */
export function sanitizePhone(str) {
    if (typeof str !== 'string') return '';
    const trimmed = str.trim();
    // Keep leading + and digits only
    const cleaned = trimmed.replace(/[^\d+]/g, '');
    // Must start with + or digit, and have 10-15 digits total
    const digitsOnly = cleaned.replace(/\+/g, '');
    if (digitsOnly.length < 10 || digitsOnly.length > 15) return '';
    return cleaned;
}
