const { ValidationError } = require('./errors');

/**
 * Validation helper utilities
 */

/**
 * Validate required fields in request body
 * @param {Object} body - Request body
 * @param {Array<string>} fields - Required field names
 * @throws {ValidationError} If any field is missing
 */
function validateRequired(body, fields) {
  const missing = fields.filter(field => !body[field]);
  
  if (missing.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missing.join(', ')}`,
      missing.map(field => ({ field, message: `${field} is required` }))
    );
  }
}

/**
 * Validate email format
 * @param {string} email 
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic)
 * @param {string} phone 
 * @returns {boolean}
 */
function isValidPhone(phone) {
  const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
  return phoneRegex.test(phone);
}

/**
 * Validate password strength
 * @param {string} password 
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
function validatePassword(password) {
  const errors = [];
  
  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize user input (basic XSS prevention)
 * @param {string} input 
 * @returns {string}
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

module.exports = {
  validateRequired,
  isValidEmail,
  isValidPhone,
  validatePassword,
  sanitizeInput,
};
