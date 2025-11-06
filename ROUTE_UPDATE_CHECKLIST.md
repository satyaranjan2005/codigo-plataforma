# Route Update Checklist

This checklist helps you systematically update all remaining routes with the new error handling pattern.

## 📋 Routes to Update

### ✅ Completed
- [x] `routes/Auth.js` - Registration and login routes
- [x] `routes/_auth_middleware.js` - Authentication middleware
- [x] `index.js` - Main server file with error handlers

### ⏳ Pending

#### `routes/User.js`
- [ ] Import `asyncHandler`, custom errors, and validators
- [ ] Wrap all route handlers with `asyncHandler`
- [ ] Replace manual validation with `validateRequired()`
- [ ] Replace `res.status().json({ error })` with throwing custom errors
- [ ] Add consistent success responses with `{ success: true, ... }`

Routes to update:
- [ ] `GET /users` - List users
- [ ] `GET /users/search` - Search users
- [ ] `GET /users/:id` - Get single user
- [ ] `PUT /users/:id` - Update user
- [ ] `DELETE /users/:id` - Delete user (if exists)

#### `routes/Team.js`
- [ ] Import `asyncHandler`, custom errors, and validators
- [ ] Wrap all route handlers with `asyncHandler`
- [ ] Replace manual validation with `validateRequired()`
- [ ] Replace `res.status().json({ error })` with throwing custom errors
- [ ] Add consistent success responses

Routes to update:
- [ ] `POST /teams` - Create team
- [ ] `POST /teams/:id/register` - Register problem
- [ ] `GET /teams` - List teams
- [ ] `GET /teams/:id` - Get team details
- [ ] `PUT /teams/:id` - Update team
- [ ] `DELETE /teams/:id` - Delete team
- [ ] Other team routes...

#### `routes/casestudy.js` (Problem Statement)
- [ ] Import `asyncHandler`, custom errors, and validators
- [ ] Wrap all route handlers with `asyncHandler`
- [ ] Replace manual error responses with custom errors
- [ ] Add validation where needed

Routes to update:
- [ ] All problem statement CRUD operations

#### `routes/Admin.js`
- [ ] Import `asyncHandler`, custom errors, and validators
- [ ] Wrap all route handlers with `asyncHandler`
- [ ] Add authorization checks using `ForbiddenError`
- [ ] Replace manual error responses with custom errors

Routes to update:
- [ ] All admin operations

## 🔧 Update Pattern

For each route, follow this pattern:

### Before (Old Pattern)
```javascript
router.get('/resource/:id', authenticate, async (req, res, next) => {
  try {
    // Validation
    if (!req.params.id) {
      return res.status(400).json({ error: 'ID is required' });
    }

    // Business logic
    const resource = await prisma.resource.findUnique({
      where: { id: req.params.id }
    });

    // Error handling
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Success response
    return res.json({ resource });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});
```

### After (New Pattern)
```javascript
const { asyncHandler } = require('../middleware/errorHandler');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { validateRequired } = require('../utils/validators');

router.get('/resource/:id', authenticate, asyncHandler(async (req, res) => {
  // Validation - throw errors instead of returning responses
  if (!req.params.id) {
    throw new BadRequestError('ID is required');
  }

  // Business logic - let Prisma errors bubble up
  const resource = await prisma.resource.findUnique({
    where: { id: req.params.id }
  });

  // Error handling - throw custom errors
  if (!resource) {
    throw new NotFoundError('Resource not found');
  }

  // Success response - add success: true
  return res.json({ 
    success: true,
    resource 
  });
}));
```

## ✅ Step-by-Step Process

### 1. Add Imports
At the top of each route file:
```javascript
const { asyncHandler } = require('../middleware/errorHandler');
const { 
  BadRequestError, 
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError
} = require('../utils/errors');
const { validateRequired, isValidEmail } = require('../utils/validators');
```

### 2. Wrap Each Route Handler
Replace:
```javascript
router.get('/path', authenticate, async (req, res, next) => {
  try {
    // ...
  } catch (err) {
    next(err);
  }
});
```

With:
```javascript
router.get('/path', authenticate, asyncHandler(async (req, res) => {
  // ... (no try-catch needed)
}));
```

### 3. Replace Manual Validation
Replace:
```javascript
if (!name || !email) {
  return res.status(400).json({ error: 'Missing required fields' });
}
```

With:
```javascript
validateRequired(req.body, ['name', 'email']);
```

### 4. Replace Error Responses
Replace all instances of:
```javascript
return res.status(4xx).json({ error: '...' });
```

With:
```javascript
throw new CustomError('...');
```

Examples:
- `res.status(400)` → `throw new BadRequestError(...)`
- `res.status(401)` → `throw new UnauthorizedError(...)`
- `res.status(403)` → `throw new ForbiddenError(...)`
- `res.status(404)` → `throw new NotFoundError(...)`
- `res.status(409)` → `throw new ConflictError(...)`
- `res.status(422)` → `throw new ValidationError(...)`

### 5. Add Success Flag
Add `success: true` to all successful responses:
```javascript
return res.json({ 
  success: true,
  data: result,
  message: 'Operation successful'
});
```

## 🧪 Testing Each Route

After updating each route, test:

1. **Success case:** Verify it works as before
2. **Validation errors:** Send invalid/missing data
3. **Auth errors:** Test without token or with invalid token
4. **Not found errors:** Request non-existent resources
5. **Conflict errors:** Try creating duplicates

### Example Test Commands

```powershell
# Success case
curl http://localhost:3000/users/123 -H "Authorization: Bearer YOUR_TOKEN"

# Missing auth
curl http://localhost:3000/users/123

# Invalid token
curl http://localhost:3000/users/123 -H "Authorization: Bearer invalid"

# Not found
curl http://localhost:3000/users/nonexistent -H "Authorization: Bearer YOUR_TOKEN"

# Validation error
curl -X POST http://localhost:3000/users -H "Authorization: Bearer YOUR_TOKEN" -H "Content-Type: application/json" -d "{}"
```

## 📝 Common Patterns

### Pattern 1: Simple GET with ID
```javascript
router.get('/:id', authenticate, asyncHandler(async (req, res) => {
  const resource = await prisma.resource.findUnique({
    where: { id: req.params.id }
  });
  
  if (!resource) {
    throw new NotFoundError('Resource not found');
  }
  
  return res.json({ success: true, resource });
}));
```

### Pattern 2: POST with Validation
```javascript
router.post('/', authenticate, asyncHandler(async (req, res) => {
  validateRequired(req.body, ['name', 'email']);
  
  if (!isValidEmail(req.body.email)) {
    throw new ValidationError('Invalid email format');
  }
  
  const resource = await prisma.resource.create({
    data: req.body
  });
  
  return res.status(201).json({ 
    success: true,
    message: 'Resource created',
    resource 
  });
}));
```

### Pattern 3: PUT with Authorization
```javascript
router.put('/:id', authenticate, asyncHandler(async (req, res) => {
  const requesterId = req.authUser?.id;
  const targetId = req.params.id;
  const requesterRole = req.authUser?.role;
  
  // Check authorization
  if (requesterId !== targetId && !['ADMIN', 'SUPERADMIN'].includes(requesterRole)) {
    throw new ForbiddenError('Insufficient permissions');
  }
  
  // Check if exists
  const existing = await prisma.resource.findUnique({
    where: { id: targetId }
  });
  
  if (!existing) {
    throw new NotFoundError('Resource not found');
  }
  
  // Update
  const updated = await prisma.resource.update({
    where: { id: targetId },
    data: req.body
  });
  
  return res.json({ 
    success: true,
    message: 'Resource updated',
    resource: updated 
  });
}));
```

### Pattern 4: DELETE with Admin Check
```javascript
router.delete('/:id', authenticate, asyncHandler(async (req, res) => {
  const requesterRole = req.authUser?.role;
  
  if (!['ADMIN', 'SUPERADMIN'].includes(requesterRole)) {
    throw new ForbiddenError('Only admins can delete resources');
  }
  
  const resource = await prisma.resource.findUnique({
    where: { id: req.params.id }
  });
  
  if (!resource) {
    throw new NotFoundError('Resource not found');
  }
  
  await prisma.resource.delete({
    where: { id: req.params.id }
  });
  
  return res.json({ 
    success: true,
    message: 'Resource deleted'
  });
}));
```

## 🎯 Progress Tracking

Update this section as you complete each file:

- [ ] **Day 1:** Update User.js (5 routes)
- [ ] **Day 2:** Update Team.js (6+ routes)
- [ ] **Day 3:** Update casestudy.js
- [ ] **Day 4:** Update Admin.js
- [ ] **Day 5:** Test all routes thoroughly

## ✨ Benefits You'll Get

After updating all routes, you'll have:

1. **Consistent error responses** across all endpoints
2. **Less code** (no try-catch blocks)
3. **Better error messages** for users
4. **Easier debugging** with centralized error logging
5. **Type-safe errors** with custom error classes
6. **Automatic Prisma error handling**
7. **Automatic JWT error handling**
8. **Validation in one place**

## 🚀 Final Checklist

After updating all routes:

- [ ] All routes use `asyncHandler`
- [ ] All routes throw custom errors (no manual res.status())
- [ ] All success responses include `success: true`
- [ ] All routes are tested
- [ ] Error responses are consistent
- [ ] Validation is centralized
- [ ] Authorization checks use `ForbiddenError`
- [ ] Documentation is updated

## 💡 Tips

1. **Update one file at a time** - Don't try to do everything at once
2. **Test after each change** - Make sure nothing breaks
3. **Use find & replace** - Speed up repetitive changes
4. **Keep the pattern consistent** - Follow the examples above
5. **Ask for help** - Refer to ERROR_HANDLING_EXAMPLES.js

Good luck! 🎉
