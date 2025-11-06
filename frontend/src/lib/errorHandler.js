/**
 * Error handling utilities for the frontend
 */

/**
 * Extract user-friendly error message from various error formats
 * @param {Error|Object} error - Error object or axios error
 * @returns {string} User-friendly error message
 */
export function getErrorMessage(error) {
  // Check if it's an axios error with response
  if (error?.response?.data) {
    const data = error.response.data;
    
    // Check for specific error message field
    if (data.error) return data.error;
    if (data.message) return data.message;
    
    // Check for validation errors
    if (data.errors && Array.isArray(data.errors)) {
      return data.errors.map(e => e.message || e.field).join(', ');
    }
    
    // Generic message based on status code
    if (error.response.status === 400) return 'Invalid request. Please check your input.';
    if (error.response.status === 401) return 'Authentication required. Please login again.';
    if (error.response.status === 403) return 'You do not have permission to perform this action.';
    if (error.response.status === 404) return 'Resource not found.';
    if (error.response.status === 409) return 'This resource already exists.';
    if (error.response.status === 422) return 'Validation failed. Please check your input.';
    if (error.response.status >= 500) return 'Server error. Please try again later.';
  }
  
  // Check if it's a network error
  if (error?.message === 'Network Error' || error?.code === 'ERR_NETWORK') {
    return 'Network error. Please check your internet connection.';
  }
  
  // Check for timeout
  if (error?.code === 'ECONNABORTED' || error?.message?.includes('timeout')) {
    return 'Request timeout. Please try again.';
  }
  
  // Fallback to error message or generic message
  return error?.message || 'An unexpected error occurred. Please try again.';
}

/**
 * Extract status code from error
 * @param {Error|Object} error 
 * @returns {number|null}
 */
export function getErrorStatus(error) {
  return error?.response?.status || null;
}

/**
 * Check if error is authentication related
 * @param {Error|Object} error 
 * @returns {boolean}
 */
export function isAuthError(error) {
  const status = getErrorStatus(error);
  return status === 401 || status === 403;
}

/**
 * Check if error is a network error
 * @param {Error|Object} error 
 * @returns {boolean}
 */
export function isNetworkError(error) {
  return error?.message === 'Network Error' || 
         error?.code === 'ERR_NETWORK' ||
         error?.code === 'ECONNABORTED';
}

/**
 * Format validation errors for display
 * @param {Object} error 
 * @returns {Object} Object with field names as keys and error messages as values
 */
export function formatValidationErrors(error) {
  const errors = {};
  
  if (error?.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    error.response.data.errors.forEach(err => {
      if (err.field && err.message) {
        errors[err.field] = err.message;
      }
    });
  }
  
  return errors;
}

/**
 * Log error for debugging (can be extended to send to error tracking service)
 * @param {Error|Object} error 
 * @param {Object} context - Additional context information
 */
export function logError(error, context = {}) {
  console.error('Error occurred:', {
    message: getErrorMessage(error),
    status: getErrorStatus(error),
    context,
    error,
    timestamp: new Date().toISOString(),
  });
  
  // TODO: Send to error tracking service (e.g., Sentry, LogRocket)
  // if (process.env.NODE_ENV === 'production') {
  //   Sentry.captureException(error, { extra: context });
  // }
}

export default {
  getErrorMessage,
  getErrorStatus,
  isAuthError,
  isNetworkError,
  formatValidationErrors,
  logError,
};
