// Example: How to update existing routes with new error handling

// BEFORE: Old error handling approach
router.get('/users/:id', authenticate, async (req, res, next) => {
  try {
    const user = await prisma.student.findUnique({
      where: { sic_no: req.params.id }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json({ user });
  } catch (err) {
    console.error(err);
    return next(err);
  }
});

// AFTER: New error handling approach
const { asyncHandler } = require('../middleware/errorHandler');
const { NotFoundError, BadRequestError } = require('../utils/errors');
const { validateRequired } = require('../utils/validators');

router.get('/users/:id', authenticate, asyncHandler(async (req, res) => {
  const user = await prisma.student.findUnique({
    where: { sic_no: req.params.id }
  });
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  return res.json({ 
    success: true,
    user 
  });
}));

// Example: POST with validation
router.post('/users', authenticate, asyncHandler(async (req, res) => {
  // Validate required fields
  validateRequired(req.body, ['name', 'email', 'sic_no']);
  
  // Validate email format
  if (!isValidEmail(req.body.email)) {
    throw new ValidationError('Invalid email format');
  }
  
  // Validate password if provided
  if (req.body.password) {
    const passwordValidation = validatePassword(req.body.password);
    if (!passwordValidation.valid) {
      throw new ValidationError(
        'Password does not meet requirements',
        passwordValidation.errors.map(err => ({ field: 'password', message: err }))
      );
    }
  }
  
  // Create user
  const user = await prisma.student.create({
    data: req.body
  });
  
  return res.status(201).json({
    success: true,
    message: 'User created successfully',
    user
  });
}));

// Example: PUT with authorization
router.put('/users/:id', authenticate, asyncHandler(async (req, res) => {
  const requesterId = req.authUser?.sic_no;
  const targetId = req.params.id;
  const requesterRole = req.authUser?.role;
  
  // Check if user can update this profile
  if (requesterId !== targetId && !['ADMIN', 'SUPERADMIN'].includes(requesterRole)) {
    throw new ForbiddenError('You can only update your own profile');
  }
  
  // Check if user exists
  const existingUser = await prisma.student.findUnique({
    where: { sic_no: targetId }
  });
  
  if (!existingUser) {
    throw new NotFoundError('User not found');
  }
  
  // Update user
  const updatedUser = await prisma.student.update({
    where: { sic_no: targetId },
    data: req.body
  });
  
  return res.json({
    success: true,
    message: 'User updated successfully',
    user: updatedUser
  });
}));

// Example: DELETE with authorization
router.delete('/users/:id', authenticate, asyncHandler(async (req, res) => {
  const requesterRole = req.authUser?.role;
  
  // Only admins can delete users
  if (!['ADMIN', 'SUPERADMIN'].includes(requesterRole)) {
    throw new ForbiddenError('Only admins can delete users');
  }
  
  // Check if user exists
  const user = await prisma.student.findUnique({
    where: { sic_no: req.params.id }
  });
  
  if (!user) {
    throw new NotFoundError('User not found');
  }
  
  // Delete user
  await prisma.student.delete({
    where: { sic_no: req.params.id }
  });
  
  return res.json({
    success: true,
    message: 'User deleted successfully'
  });
}));

// Example: Error handling in frontend component
import { useToast } from '@/components/Toast';
import { getErrorMessage, logError } from '@/lib/errorHandler';
import { get, post, put, del } from '@/lib/api';

function UserManagement() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  
  const handleCreateUser = async (userData) => {
    setLoading(true);
    try {
      const result = await post('/users', userData);
      toast.success('User created successfully!');
      // Refresh user list or redirect
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      logError(error, { component: 'UserManagement', action: 'create' });
    } finally {
      setLoading(false);
    }
  };
  
  const handleUpdateUser = async (userId, updates) => {
    setLoading(true);
    try {
      const result = await put(`/users/${userId}`, updates);
      toast.success('User updated successfully!');
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      logError(error, { component: 'UserManagement', action: 'update', userId });
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    setLoading(true);
    try {
      await del(`/users/${userId}`);
      toast.success('User deleted successfully!');
      // Refresh user list
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(message);
      logError(error, { component: 'UserManagement', action: 'delete', userId });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    // Component JSX
  );
}
