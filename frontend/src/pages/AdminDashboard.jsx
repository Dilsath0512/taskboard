import { useState, useEffect, useCallback } from 'react';
import { getAllUsers, getTasks, assignTask, updateTask, deleteTask, updateUserRole, deleteUser } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import {
  Users,
  CheckSquare,
  Clock,
  CheckCircle2,
  Search,
  MoreVertical,
  Trash2,
  UserCheck,
  Shield,
  Activity,
  Layers,
  Calendar
} from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [usersRes, tasksRes] = await Promise.all([getAllUsers(), getTasks()]);
      setUsers(usersRes.data.users);
      setTasks(tasksRes.data.tasks);
    } catch {
      toast.error('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAssign = async (taskId, userId) => {
    try {
      const res = await assignTask(taskId, { assigned_to: userId || null });
      setTasks(prev => prev.map(t => t.id === taskId ? res.data.task : t));
      toast.success('Assignment updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to assign task.');
    }
  };

  const handleStatusChange = async (taskId, status) => {
    try {
      const res = await updateTask(taskId, { status });
      setTasks(prev => prev.map(t => t.id === taskId ? res.data.task : t));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update status.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task deleted');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete task.');
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      const res = await updateUserRole(userId, role);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: res.data.user.role } : u));
      toast.success('User role updated');
      setActiveMenuId(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update role.');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      const tasksRes = await getTasks();
      setTasks(tasksRes.data.tasks);
      toast.success(`User "${userName}" deleted.`);
      setActiveMenuId(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete user.');
    }
  };

  // Metrics calculation
  const totalUsers = users.length;
  const totalTasks = tasks.length;
  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const doingCount = tasks.filter(t => t.status === 'doing').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  const getPercent = (count) => totalTasks === 0 ? 0 : Math.round((count / totalTasks) * 100);

  // Filtered Lists
  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTasks = tasks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.creator_name && t.creator_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getInitial = (name) => name?.[0]?.toUpperCase() || 'U';

  return (
    <Layout>
      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div className="page-title-group">
            <h2>Admin Overview</h2>
            <p>Monitor users, tasks, and workspace activity.</p>
          </div>

          <div className="page-actions">
            <div className="search-wrapper">
              <Search className="search-icon" />
              <input
                className="form-input search-input"
                type="text"
                placeholder={activeTab === 'users' ? 'Search users...' : 'Search tasks...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 220 }}
              />
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon-box">
              <Users size={18} />
            </div>
            <div>
              <div className="stat-value">{totalUsers}</div>
              <div className="stat-label">Total Users</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-box">
              <CheckSquare size={18} />
            </div>
            <div>
              <div className="stat-value">{totalTasks}</div>
              <div className="stat-label">Total Tasks</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-box" style={{ color: 'var(--status-doing)' }}>
              <Clock size={18} />
            </div>
            <div>
              <div className="stat-value">{doingCount}</div>
              <div className="stat-label">In Progress</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-box" style={{ color: 'var(--status-done)' }}>
              <CheckCircle2 size={18} />
            </div>
            <div>
              <div className="stat-value">{doneCount}</div>
              <div className="stat-label">Completed</div>
            </div>
          </div>
        </div>

        {/* Two-Column Analytics Grid */}
        <div className="dashboard-analytics-grid">
          {/* Left: Task Status Overview */}
          <div className="analytics-card">
            <span className="analytics-card-title">
              <Layers size={16} />
              <span>Task Status Distribution</span>
            </span>
            <div className="progress-bar-group">
              <div className="progress-item">
                <div className="progress-info">
                  <span>To Do</span>
                  <span>{todoCount} ({getPercent(todoCount)}%)</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${getPercent(todoCount)}%`, backgroundColor: 'var(--status-todo)' }} />
                </div>
              </div>

              <div className="progress-item">
                <div className="progress-info">
                  <span>In Progress</span>
                  <span>{doingCount} ({getPercent(doingCount)}%)</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${getPercent(doingCount)}%`, backgroundColor: 'var(--status-doing)' }} />
                </div>
              </div>

              <div className="progress-item">
                <div className="progress-info">
                  <span>Done</span>
                  <span>{doneCount} ({getPercent(doneCount)}%)</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${getPercent(doneCount)}%`, backgroundColor: 'var(--status-done)' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Recent Activity Log */}
          <div className="analytics-card">
            <span className="analytics-card-title">
              <Activity size={16} />
              <span>Recent Workspace Activity</span>
            </span>
            <div className="activity-feed">
              {tasks.slice(0, 4).map((t) => (
                <div className="activity-item" key={t.id}>
                  <div className="task-avatar-small">{getInitial(t.creator_name)}</div>
                  <div className="activity-text truncate">
                    <strong>{t.creator_name || 'System'}</strong> created task "{t.title}"
                  </div>
                  <span className="activity-time">
                    {new Date(t.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
              {tasks.length === 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>No recent activity.</div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
          <button
            className={`btn ${activeTab === 'users' ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('users')}
          >
            <Users size={14} />
            <span>Workspace Members ({users.length})</span>
          </button>
          <button
            className={`btn ${activeTab === 'tasks' ? 'btn-secondary' : 'btn-ghost'}`}
            onClick={() => setActiveTab('tasks')}
          >
            <CheckSquare size={14} />
            <span>All Tasks ({tasks.length})</span>
          </button>
        </div>

        {/* Table Content */}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading dashboard data...
          </div>
        ) : activeTab === 'users' ? (
          /* Users Table */
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th style={{ textAlign: 'center' }}>Tasks Created</th>
                  <th style={{ textAlign: 'center' }}>Tasks Assigned</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div className="user-avatar" style={{ width: 28, height: 28, fontSize: 11 }}>
                          {getInitial(u.name)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>
                            {u.name}
                            {u.id === user.id && (
                              <span style={{ marginLeft: 6, fontSize: 10, color: 'var(--accent-primary-hover)' }}>(you)</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>
                        {u.role === 'admin' ? <Shield size={11} /> : <UserCheck size={11} />}
                        <span>{u.role}</span>
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>{u.tasks_created}</td>
                    <td style={{ textAlign: 'center' }}>{u.tasks_assigned}</td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {u.id !== user.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                          <select
                            className="form-select"
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            style={{ padding: '4px 24px 4px 8px', fontSize: 11, width: 'auto' }}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            title="Remove User"
                          >
                            <Trash2 size={13} />
                            <span>Remove</span>
                          </button>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Tasks Table */
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Task Title</th>
                  <th>Status</th>
                  <th>Creator</th>
                  <th>Assignee</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{t.title}</div>
                      {t.description && (
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }} className="truncate">
                          {t.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <select
                        className="form-select"
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        style={{ padding: '4px 24px 4px 8px', fontSize: 11, width: 'auto' }}
                      >
                        <option value="todo">To Do</option>
                        <option value="doing">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{t.creator_name || 'System'}</td>
                    <td>
                      <select
                        className="form-select"
                        value={t.assigned_to || ''}
                        onChange={(e) => handleAssign(t.id, e.target.value)}
                        style={{ padding: '4px 24px 4px 8px', fontSize: 11, width: 'auto' }}
                      >
                        <option value="">Unassigned</option>
                        {users.map((u) => (
                          <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-danger btn-icon btn-sm"
                        onClick={() => handleDeleteTask(t.id)}
                        title="Delete Task"
                      >
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}
