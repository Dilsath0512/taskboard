import { useState } from 'react';
import TaskCard from './TaskCard';

const COLUMNS = [
  { id: 'todo',  label: 'To Do',       colClass: 'col-todo'  },
  { id: 'doing', label: 'In Progress',  colClass: 'col-doing' },
  { id: 'done',  label: 'Done',         colClass: 'col-done'  },
];

export default function KanbanBoard({ tasks, user, onStatusChange, onEdit, onDelete, onAssignSelf }) {
  const [dragOverCol, setDragOverCol] = useState(null);
  const [draggingId, setDraggingId] = useState(null);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingId(taskId);
  };

  const handleDragEnd = () => {
    setDraggingId(null);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colId);
  };

  const handleDragLeave = () => {
    setDragOverCol(null);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('taskId');
    if (!taskId) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;

    onStatusChange(taskId, newStatus);
  };

  const getColumnTasks = (status) => tasks.filter(t => t.status === status);

  return (
    <div className="kanban-board">
      {COLUMNS.map(col => {
        const colTasks = getColumnTasks(col.id);
        return (
          <div
            key={col.id}
            id={`column-${col.id}`}
            className={`kanban-column ${col.colClass} ${dragOverCol === col.id ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="column-header">
              <div className="column-title">
                <div className="column-dot" />
                <span>{col.label}</span>
              </div>
              <span className="column-count">{colTasks.length}</span>
            </div>

            <div className="column-cards">
              {colTasks.length === 0 ? (
                <div className="empty-state" style={{ padding: '24px 12px' }}>
                  <div className="empty-state-icon" style={{ fontSize: 28 }}>
                    {col.id === 'todo' ? '📝' : col.id === 'doing' ? '⚡' : '🎉'}
                  </div>
                  <p>Drop tasks here</p>
                </div>
              ) : (
                colTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    user={user}
                    isDragging={draggingId === task.id}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onAssignSelf={onAssignSelf}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
