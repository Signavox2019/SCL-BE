const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, allowRoles } = require('../middleware/auth.middleware');

// Get all users (Admin)
router.get('/', userController.getAllUsers);

// Get specific user by ID
router.get('/:id', userController.getUser);

// Approve or reject user registration (Admin)
router.put('/status/:id', userController.updateUserStatus);

router.put('/update-role', protect, allowRoles('Admin'), userController.updateUserRole);


// Delete user (Admin)
router.delete('/:id', userController.deleteUser);

// Get user metrics
router.get('/stats/metrics', userController.userStats);

module.exports = router;
