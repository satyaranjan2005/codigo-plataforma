# Error Handling Implementation

This document describes the comprehensive error handling system implemented across the frontend and backend.

## Backend Error Handling

### 1. Custom Error Classes (`Backend/utils/errors.js`)

We've created custom error classes that extend the base `Error` class:

- **AppError**: Base error class with statusCode and operational flag
- **BadRequestError** (400): For invalid client requests
- **UnauthorizedError** (401): For authentication failures
- **ForbiddenError** (403): For authorization failures
- **NotFoundError** (404): For missing resources
- **ConflictError** (409): For duplicate resources
- **ValidationError** (422): For validation failures
- **InternalServerError** (500): For server errors

**Usage:**
```javascript
const { BadRequestError, NotFoundError } = require('../utils/errors');

// Throw custom errors in your routes
if (!user) {
  throw new NotFoundError('User not found');
}

if (!email || !password) {
  throw new BadRequestError('Email and password are required');
}
```

### 2. Error Handler Middleware (`Backend/middleware/errorHandler.js`)

Centralized error handling middleware that:
- Catches all errors thrown in routes
- Handles Prisma-specific errors (P2002, P2025, P2003)
- Handles JWT errors (invalid/expired tokens)
- Formats consistent error responses
- Logs errors for debugging
- Includes stack traces in development mode

**Features:**
- `errorHandler`: Main error handling middleware
- `asyncHandler`: Wrapper for async route handlers (eliminates try-catch)
- `notFoundHandler`: Handles 404 errors

**Usage:**
```javascript
const { asyncHandler } = require('../middleware/errorHandler');

router.get('/users/:id', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) throw new NotFoundError('User not found');
  res.json({ user });
}));
```

### 3. Validation Utilities (`Backend/utils/validators.js`)

Helper functions for input validation:

- `validateRequired(body, fields)`: Validates required fields
- `isValidEmail(email)`: Email format validation
- `isValidPhone(phone)`: Phone number validation
- `validatePassword(password)`: Password strength validation
- `sanitizeInput(input)`: Basic XSS prevention

**Usage:**
```javascript
const { validateRequired, isValidEmail } = require('../utils/validators');

router.post('/register', asyncHandler(async (req, res) => {
  validateRequired(req.body, ['name', 'email', 'password']);
  
  if (!isValidEmail(req.body.email)) {
    throw new ValidationError('Invalid email format');
  }
  
  // Continue with registration...
}));
```

### 4. Updated Routes

- **Auth.js**: Updated with asyncHandler, custom errors, and validation
- **_auth_middleware.js**: Throws UnauthorizedError instead of sending response directly
- **index.js**: Integrated error handling middleware with graceful shutdown

## Frontend Error Handling

### 1. Error Handler Utilities (`frontend/src/lib/errorHandler.js`)

Comprehensive error handling utilities:

- `getErrorMessage(error)`: Extracts user-friendly messages from various error formats
- `getErrorStatus(error)`: Gets HTTP status code
- `isAuthError(error)`: Checks if error is auth-related
- `isNetworkError(error)`: Checks for network errors
- `formatValidationErrors(error)`: Formats validation errors for display
- `logError(error, context)`: Logs errors with context (can integrate with Sentry)

**Usage:**
```javascript
import { getErrorMessage, logError } from '@/lib/errorHandler';

try {
  await apiPost('/auth/login', credentials);
} catch (error) {
  const message = getErrorMessage(error);
  setError(message);
  logError(error, { component: 'LoginForm' });
}
```

### 2. Error Boundary (`frontend/src/components/ErrorBoundary.jsx`)

React Error Boundary component that:
- Catches JavaScript errors in component tree
- Shows user-friendly error UI
- Displays error details in development mode
- Provides "Try Again" and "Go Home" buttons
- Can accept custom fallback UI

**Features:**
- Automatic error catching
- Error logging
- Graceful degradation
- Development mode debugging

### 3. Toast Notification System (`frontend/src/components/Toast.jsx`)

Toast notification system for user feedback:

- `ToastProvider`: Context provider for toast functionality
- `useToast()`: Hook to access toast methods
- Auto-dismiss after configurable duration
- Different types: success, error, warning, info
- Animated slide-in effect

**Usage:**
```javascript
import { useToast } from '@/components/Toast';

function MyComponent() {
  const toast = useToast();
  
  const handleSuccess = () => {
    toast.success('Operation completed successfully!');
  };
  
  const handleError = () => {
    toast.error('Something went wrong', 7000); // Custom duration
  };
  
  return <button onClick={handleSuccess}>Save</button>;
}
```

### 4. Updated API Client (`frontend/src/lib/api.js`)

Enhanced axios client with:
- Automatic token attachment
- Error message extraction
- Auth error handling (clears token, redirects)
- Network error detection
- Request/response logging
- Timeout handling

**Features:**
- Interceptors for request/response
- Automatic 401 handling (logout + redirect)
- User-friendly error messages
- Error logging

### 5. Updated Components

- **login-form.jsx**: Uses toast notifications and error handler
- **signup-form.jsx**: Uses toast notifications and error handler
- **layout.jsx**: Wraps app with ErrorBoundary and ToastProvider

## Error Response Format

All backend errors follow this consistent format:

```json
{
  "success": false,
  "error": "User-friendly error message",
  "statusCode": 400,
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

Success responses include:
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

## Best Practices

### Backend

1. **Always use asyncHandler** for async routes:
   ```javascript
   router.get('/path', asyncHandler(async (req, res) => { ... }));
   ```

2. **Throw custom errors** instead of sending responses:
   ```javascript
   // ✅ Good
   if (!user) throw new NotFoundError('User not found');
   
   // ❌ Bad
   if (!user) return res.status(404).json({ error: 'User not found' });
   ```

3. **Validate input** before processing:
   ```javascript
   validateRequired(req.body, ['email', 'password']);
   if (!isValidEmail(email)) throw new ValidationError('Invalid email');
   ```

4. **Let errors bubble up** to the error handler:
   ```javascript
   // The error handler will catch and format all errors
   const user = await prisma.user.findUnique({ where: { id } });
   ```

### Frontend

1. **Use useToast** for user feedback:
   ```javascript
   toast.success('Saved successfully!');
   toast.error('Failed to save');
   ```

2. **Use getErrorMessage** for consistent error display:
   ```javascript
   const errorMsg = getErrorMessage(error);
   setError(errorMsg);
   toast.error(errorMsg);
   ```

3. **Wrap app with ErrorBoundary** in layout:
   ```jsx
   <ErrorBoundary>
     <ToastProvider>
       {children}
     </ToastProvider>
   </ErrorBoundary>
   ```

4. **Log errors** for debugging:
   ```javascript
   logError(error, { component: 'MyComponent', action: 'save' });
   ```

## Testing Error Handling

### Backend Tests

```javascript
// Test custom errors
it('should throw NotFoundError when user not found', async () => {
  await expect(getUserById('invalid-id')).rejects.toThrow(NotFoundError);
});

// Test validation
it('should validate required fields', async () => {
  await expect(createUser({})).rejects.toThrow(ValidationError);
});
```

### Frontend Tests

```javascript
// Test error boundary
it('should catch and display errors', () => {
  const ThrowError = () => { throw new Error('Test error'); };
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});

// Test toast
it('should show toast notification', () => {
  const { result } = renderHook(() => useToast());
  act(() => {
    result.current.error('Test error');
  });
  expect(screen.getByText('Test error')).toBeInTheDocument();
});
```

## Future Enhancements

1. **Error Tracking Integration**
   - Integrate Sentry or LogRocket
   - Send errors to monitoring service
   - Track error rates and patterns

2. **Enhanced Validation**
   - Use Zod or Yup for schema validation
   - Add more complex validation rules
   - Better error messages

3. **Rate Limiting**
   - Implement rate limiting middleware
   - Custom errors for rate limit exceeded
   - User-friendly messages

4. **Internationalization**
   - Multi-language error messages
   - Locale-specific formatting
   - Translation keys

## Environment Variables

Add these to your `.env` files:

### Backend (.env)
```env
NODE_ENV=development
JWT_SECRET=your-secret-key
PORT=3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_BASE=http://localhost:3000
NODE_ENV=development
```

## Summary

This error handling implementation provides:

✅ **Consistent error responses** across all endpoints  
✅ **User-friendly error messages** for better UX  
✅ **Automatic error logging** for debugging  
✅ **Type-safe error handling** with custom classes  
✅ **Graceful degradation** when errors occur  
✅ **Toast notifications** for user feedback  
✅ **Error boundaries** to prevent app crashes  
✅ **Comprehensive validation** utilities  
✅ **Development-friendly** error details  
✅ **Production-ready** error handling  

The system is extensible, maintainable, and follows industry best practices.
