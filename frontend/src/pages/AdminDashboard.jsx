import { useState, useEffect, useCallback } from 'react';
import { getAllUsers, getTasks, assignTask, updateTask, deleteTask, updateUserRole, deleteUser } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const STATUS_COLORS = {
  todo: { bg: 'var(--todo-bg)', color: 'var(--todo-color)', label: 'To Do' },
  doing: { bg: 'var(--doing-bg)', color: 'var(--doing-color)', label: 'Doing' },
  done: { bg: 'var(--done-bg)', color: 'var(--done-color)', label: 'Done' },
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, tasksRes] = await Promise.all([getAllUsers(), getTasks()]);
      setUsers(usersRes.data.users);
      setTasks(tasksRes.data.tasks);
    } catch {
      toast.error('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAssign = async (taskId, userId) => {
    try {
      const res = await assignTask(taskId, { assigned_to: userId || null });
      setTasks(prev => prev.map(t => t.id === taskId ? res.data.task : t));
      toast.success('Task assignment updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to assign task.');
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      const res = await updateTask(taskId, { status });
      setTasks(prev => prev.map(t => t.id === taskId ? res.data.task : t));
      toast.success('Status updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task deleted.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete task.');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      const res = await updateUserRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: res.data.user.role } : u));
      toast.success('Role updated!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role.');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      // Refresh tasks in case user's assigned tasks changed
      const tasksRes = await getTasks();
      setTasks(tasksRes.data.tasks);
      toast.success(`User "${userName}" deleted successfully.`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete user.');
    }
  };

  if (loading) {
    return (
      <div className="spinner-page">
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading admin data...</p>
      </div>
    );
  }

  const totalAssigned = tasks.filter(t => t.assigned_to).length;
  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const doingCount = tasks.filter(t => t.status === 'doing').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  return (
    <>
      <Navbar />
      <div className="admin-page">
        {/* Header */}
        <div className="admin-header">
          <h2>🛡️ Admin Dashboard</h2>
          <p>Full system control — manage all users and tasks</p>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(124,58,237,0.15)' }}>👥</div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: 'var(--accent-purple-light)' }}>{users.length}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)' }}>📋</div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: 'var(--accent-blue)' }}>{tasks.length}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>⚡</div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: 'var(--doing-color)' }}>{doingCount}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>✅</div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: 'var(--accent-green)' }}>{doneCount}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="nav-tabs" style={{ width: 'fit-content' }}>
          <button
            id="tab-tasks"
            className={`nav-tab ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            📋 All Tasks ({tasks.length})
          </button>
          <button
            id="tab-users"
            className={`nav-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 All Users ({users.length})
          </button>
        </div>

        {/* Tasks Table */}
        {activeTab === 'tasks' && (
          <div className="table-container">
            <div className="table-header">
              <div>
                <h3>All Tasks</h3>
                <p>{tasks.length} tasks across all users</p>
              </div>
            </div>
            {tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📭</div>
                <p>No tasks yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table id="admin-tasks-table">
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Status</th>
                      <th>Creator</th>
                      <th>Assigned To</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map(task => (
                      <tr key={task.id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{task.title}</div>
                          {task.description && (
                            <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {task.description}
                            </div>
                          )}
                        </td>
                        <td>
                          <select
                            className="form-select"
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            style={{ padding: '4px 28px 4px 10px', fontSize: 12, width: 'auto', borderRadius: 20 }}
                          >
                            <option value="todo">To Do</option>
                            <option value="doing">Doing</option>
                            <option value="done">Done</option>
                          </select>
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div className="task-avatar">{task.creator_name?.[0]?.toUpperCase()}</div>
                            <span style={{ fontSize: 12 }}>{task.creator_name}</span>
                          </div>
                        </td>
                        <td>
                          <select
                            className="form-select"
                            value={task.assigned_to || ''}
                            onChange={(e) => handleAssign(task.id, e.target.value || null)}
                            style={{ padding: '4px 28px 4px 10px', fontSize: 12, width: 'auto', minWidth: 140 }}
                          >
                            <option value="">Unassigned</option>
                            {users.map(u => (
                              <option key={u.id} value={u.id}>{u.name}</option>
                            ))}
                          </select>
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                          {new Date(task.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users Table */}
        {activeTab === 'users' && (
          <div className="table-container">
            <div className="table-header">
              <div>
                <h3>All Users</h3>
                <p>{users.length} registered users</p>
              </div>
            </div>
            {users.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">👤</div>
                <p>No users yet.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table id="admin-users-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Tasks Created</th>
                      <th>Tasks Assigned</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div className="task-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>
                              {u.name?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13 }}>
                                {u.name}
                                {u.id === user.id && <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--accent-purple-light)' }}>(you)</span>}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{u.email}</td>
                        <td>
                          <span className={`role-badge ${u.role}`}>
                            {u.role === 'admin' ? '🛡️' : '👤'} {u.role}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>{u.tasks_created}</td>
                        <td style={{ textAlign: 'center' }}>{u.tasks_assigned}</td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                          {new Date(u.created_at).toLocaleDateString()}
                        </td>
                        <td>
                          {u.id !== user.id ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <select
                                className="form-select"
                                value={u.role}
                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                style={{ padding: '4px 28px 4px 10px', fontSize: 12, width: 'auto' }}
                              >
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                              </select>
                              <button
                                className="btn btn-danger btn-sm"
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                title={`Delete user ${u.name}`}
                              >
                                🗑️ Remove
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
