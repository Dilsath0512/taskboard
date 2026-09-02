const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, assignTask, deleteTask } = require('../controllers/taskController');
const { authenticate } = require('../middleware/auth');

// All task routes require authentication
router.use(authenticate);

router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.put('/:id/assign', assignTask);
router.delete('/:id', deleteTask);

module.exports = router;
