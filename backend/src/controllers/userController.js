const pool = require('../config/db');

// GET /api/users  (admin only)
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, created_at,
        (SELECT COUNT(*) FROM tasks WHERE creator_id = users.id) AS tasks_created,
        (SELECT COUNT(*) FROM tasks WHERE assigned_to = users.id) AS tasks_assigned
       FROM users
       ORDER BY created_at ASC`
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error('GetAllUsers error:', err);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

// PUT /api/users/:id/role  (admin only)
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!['user', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Role must be "user" or "admin".' });
  }

  // Prevent admin from demoting themselves
  if (id === req.user.id && role === 'user') {
    return res.status(400).json({ error: 'You cannot demote yourself.' });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role`,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'Role updated', user: result.rows[0] });
  } catch (err) {
    console.error('UpdateRole error:', err);
    res.status(500).json({ error: 'Failed to update role.' });
  }
};

module.exports = { getAllUsers, updateUserRole };
