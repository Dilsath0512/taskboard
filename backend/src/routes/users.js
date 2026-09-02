const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// All user management routes: must be logged in AND be admin
router.use(authenticate);
router.use(requireAdmin);

router.get('/', getAllUsers);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

module.exports = router;
