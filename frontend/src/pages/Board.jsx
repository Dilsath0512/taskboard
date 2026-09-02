import { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, deleteTask, assignTask, getAllUsers } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import KanbanBoard from '../components/KanbanBoard';
import TaskModal from '../components/TaskModal';
import Layout from '../components/Layout';
import toast from 'react-hot-toast';
import { Plus, Search, Filter } from 'lucide-react';

export default function Board() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAssignee, setFilterAssignee] = useState('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const tasksRes = await getTasks();
      setTasks(tasksRes.data.tasks);

      if (user?.role === 'admin') {
        const usersRes = await getAllUsers();
        setUsers(usersRes.data.users);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast.error('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleStatusChange = async (taskId, newStatus) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      await updateTask(taskId, { status: newStatus });
      toast.success('Task updated!');
    } catch (err) {
      toast.error('Failed to update task status.');
      fetchData();
    }
  };

  const handleAssignSelf = async (taskId) => {
    try {
      const res = await assignTask(taskId, { assigned_to: user.id });
      setTasks(prev => prev.map(t => t.id === taskId ? res.data.task : t));
      toast.success('Task assigned to you!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to assign task.');
    }
  };

  const handleSaveTask = async (formData) => {
    try {
      if (editingTask) {
        const res = await updateTask(editingTask.id, formData);
        setTasks(prev => prev.map(t => t.id === editingTask.id ? res.data.task : t));
        toast.success('Task updated!');
      } else {
        const res = await createTask(formData);
        setTasks(prev => [res.data.task, ...prev]);
        toast.success('Task created!');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save task.');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      toast.success('Task deleted.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to delete task.');
    }
  };

  // Filter tasks by search query & assignee
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (filterAssignee === 'me') {
      return matchesSearch && t.assigned_to === user.id;
    }
    if (filterAssignee === 'unassigned') {
      return matchesSearch && !t.assigned_to;
    }
    return matchesSearch;
  });

  return (
    <Layout>
      <div className="page-container">
        {/* Header Bar */}
        <div className="page-header">
          <div className="page-title-group">
            <h2>My Tasks</h2>
            <p>Manage and track team workflow across stages.</p>
          </div>

          <div className="page-actions">
            {/* Search */}
            <div className="search-wrapper">
              <Search className="search-icon" />
              <input
                className="form-input search-input"
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 200 }}
              />
            </div>

            {/* Filter */}
            <select
              className="form-select"
              value={filterAssignee}
              onChange={(e) => setFilterAssignee(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">All Tasks</option>
              <option value="me">Assigned to Me</option>
              <option value="unassigned">Unassigned</option>
            </select>

            {/* Create Task Primary Button */}
            <button
              id="create-task-btn"
              className="btn btn-primary"
              onClick={() => { setEditingTask(null); setModalOpen(true); }}
            >
              <Plus size={16} />
              <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* Kanban Board Container */}
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
            Loading tasks...
          </div>
        ) : (
          <KanbanBoard
            tasks={filteredTasks}
            user={user}
            onStatusChange={handleStatusChange}
            onEditTask={(task) => { setEditingTask(task); setModalOpen(true); }}
            onDeleteTask={handleDeleteTask}
            onAssignSelf={handleAssignSelf}
            onCreateTask={() => { setEditingTask(null); setModalOpen(true); }}
          />
        )}
      </div>

      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingTask(null); }}
        onSubmit={handleSaveTask}
        initialTask={editingTask}
        users={users}
        isAdmin={user?.role === 'admin'}
      />
    </Layout>
  );
}
