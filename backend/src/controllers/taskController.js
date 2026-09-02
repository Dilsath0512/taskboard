const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');

// GET /api/tasks
// Normal user: sees their own tasks (created or assigned)
// Admin: sees all tasks
const getTasks = async (req, res) => {
  try {
    let query;
    let params;

    if (req.user.role === 'admin') {
      query = `
        SELECT t.*, 
          c.name AS creator_name, c.email AS creator_email,
          a.name AS assigned_name, a.email AS assigned_email
        FROM tasks t
        LEFT JOIN users c ON t.creator_id = c.id
        LEFT JOIN users a ON t.assigned_to = a.id
        ORDER BY t.created_at DESC
      `;
      params = [];
    } else {
      query = `
        SELECT t.*,
          c.name AS creator_name, c.email AS creator_email,
          a.name AS assigned_name, a.email AS assigned_email
        FROM tasks t
        LEFT JOIN users c ON t.creator_id = c.id
        LEFT JOIN users a ON t.assigned_to = a.id
        WHERE t.creator_id = $1 OR t.assigned_to = $1
        ORDER BY t.created_at DESC
      `;
      params = [req.user.id];
    }

    const result = await pool.query(query, params);
    res.json({ tasks: result.rows });
  } catch (err) {
    console.error('GetTasks error:', err);
    res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
};

// POST /api/tasks
const createTask = async (req, res) => {
  const { title, description } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Task title is required.' });
  }

  try {
    const id = uuidv4();
    const result = await pool.query(
      `INSERT INTO tasks (id, title, description, status, creator_id)
       VALUES ($1, $2, $3, 'todo', $4)
       RETURNING *`,
      [id, title.trim(), description?.trim() || '', req.user.id]
    );

    const task = result.rows[0];
    // Fetch with joined user info
    const fullTask = await pool.query(
      `SELECT t.*, 
        c.name AS creator_name, c.email AS creator_email,
        a.name AS assigned_name, a.email AS assigned_email
       FROM tasks t
       LEFT JOIN users c ON t.creator_id = c.id
       LEFT JOIN users a ON t.assigned_to = a.id
       WHERE t.id = $1`,
      [task.id]
    );

    res.status(201).json({ message: 'Task created', task: fullTask.rows[0] });
  } catch (err) {
    console.error('CreateTask error:', err);
    res.status(500).json({ error: 'Failed to create task.' });
  }
};

// PUT /api/tasks/:id  (update title, description, status)
const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  const validStatuses = ['todo', 'doing', 'done'];
  if (status && !validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status value.' });
  }

  try {
    // Check task exists
    const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const task = taskResult.rows[0];

    // Normal users can only update their own tasks
    if (req.user.role !== 'admin' && task.creator_id !== req.user.id && task.assigned_to !== req.user.id) {
      return res.status(403).json({ error: 'You can only update your own tasks.' });
    }

    const updatedTitle = title !== undefined ? title.trim() : task.title;
    const updatedDescription = description !== undefined ? description.trim() : task.description;
    const updatedStatus = status !== undefined ? status : task.status;

    const result = await pool.query(
      `UPDATE tasks 
       SET title = $1, description = $2, status = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [updatedTitle, updatedDescription, updatedStatus, id]
    );

    const fullTask = await pool.query(
      `SELECT t.*, 
        c.name AS creator_name, c.email AS creator_email,
        a.name AS assigned_name, a.email AS assigned_email
       FROM tasks t
       LEFT JOIN users c ON t.creator_id = c.id
       LEFT JOIN users a ON t.assigned_to = a.id
       WHERE t.id = $1`,
      [id]
    );

    res.json({ message: 'Task updated', task: fullTask.rows[0] });
  } catch (err) {
    console.error('UpdateTask error:', err);
    res.status(500).json({ error: 'Failed to update task.' });
  }
};

// PUT /api/tasks/:id/assign
const assignTask = async (req, res) => {
  const { id } = req.params;
  const { assigned_to } = req.body; // null to unassign

  try {
    const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const task = taskResult.rows[0];

    if (req.user.role !== 'admin') {
      // Normal users: can only assign unassigned tasks to themselves
      if (task.assigned_to !== null) {
        return res.status(403).json({ error: 'This task is already assigned. Only admins can reassign tasks.' });
      }
      if (assigned_to !== req.user.id) {
        return res.status(403).json({ error: 'You can only assign tasks to yourself.' });
      }
    } else {
      // Admin: validate target user exists if assigned_to is not null
      if (assigned_to !== null && assigned_to !== undefined) {
        const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [assigned_to]);
        if (userCheck.rows.length === 0) {
          return res.status(404).json({ error: 'Target user not found.' });
        }
      }
    }

    const result = await pool.query(
      `UPDATE tasks SET assigned_to = $1, updated_at = NOW() WHERE id = $2`,
      [assigned_to || null, id]
    );

    const fullTask = await pool.query(
      `SELECT t.*, 
        c.name AS creator_name, c.email AS creator_email,
        a.name AS assigned_name, a.email AS assigned_email
       FROM tasks t
       LEFT JOIN users c ON t.creator_id = c.id
       LEFT JOIN users a ON t.assigned_to = a.id
       WHERE t.id = $1`,
      [id]
    );

    res.json({ message: 'Task assignment updated', task: fullTask.rows[0] });
  } catch (err) {
    console.error('AssignTask error:', err);
    res.status(500).json({ error: 'Failed to assign task.' });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [id]);
    if (taskResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const task = taskResult.rows[0];

    // Normal users can only delete their own created tasks
    if (req.user.role !== 'admin' && task.creator_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete tasks you created.' });
    }

    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: 'Task deleted successfully.' });
  } catch (err) {
    console.error('DeleteTask error:', err);
    res.status(500).json({ error: 'Failed to delete task.' });
  }
};

module.exports = { getTasks, createTask, updateTask, assignTask, deleteTask };
