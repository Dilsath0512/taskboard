import { useState, useEffect, useCallback } from 'react';
import { getTasks, createTask, updateTask, assignTask, deleteTask } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import TaskModal from '../components/TaskModal';
import KanbanBoard from '../components/KanbanBoard';
import Navbar from '../components/Navbar';

export default function Board() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await getTasks();
      setTasks(res.data.tasks);
    } catch {
      toast.error('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const handleCreateTask = async (data) => {
    try {
      const res = await createTask(data);
      setTasks(prev => [res.data.task, ...prev]);
      toast.success('Task created!');
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create task.');
    }
  };

  const handleUpdateTask = async (id, data) => {
    try {
      const res = await updateTask(id, data);
      setTasks(prev => prev.map(t => t.id === id ? res.data.task : t));
      toast.success('Task updated!');
      setEditingTask(null);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update task.');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    try {
      const res = await updateTask(taskId, { status: newStatus });
      setTasks(prev => prev.map(t => t.id === taskId ? res.data.task : t));
    } catch (err) {
      // Revert on error
      fetchTasks();
      toast.error(err.response?.data?.error || 'Failed to update status.');
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

  const todoCount = tasks.filter(t => t.status === 'todo').length;
  const doingCount = tasks.filter(t => t.status === 'doing').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  if (loading) {
    return (
      <div className="spinner-page">
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Loading your board...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="board-page">
        <div className="board-header">
          <div>
            <h2>📋 My Task Board</h2>
            <p>
              {tasks.length} task{tasks.length !== 1 ? 's' : ''} total &nbsp;·&nbsp;
              {todoCount} todo &nbsp;·&nbsp;
              {doingCount} in progress &nbsp;·&nbsp;
              {doneCount} done
            </p>
          </div>
          <button
            id="create-task-btn"
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
          >
            + New Task
          </button>
        </div>

        <KanbanBoard
          tasks={tasks}
          user={user}
          onStatusChange={handleStatusChange}
          onEdit={(task) => setEditingTask(task)}
          onDelete={handleDeleteTask}
          onAssignSelf={handleAssignSelf}
        />
      </div>

      {showModal && (
        <TaskModal
          title="Create New Task"
          onSubmit={handleCreateTask}
          onClose={() => setShowModal(false)}
        />
      )}

      {editingTask && (
        <TaskModal
          title="Edit Task"
          initialData={editingTask}
          onSubmit={(data) => handleUpdateTask(editingTask.id, data)}
          onClose={() => setEditingTask(null)}
        />
      )}
    </>
  );
}
