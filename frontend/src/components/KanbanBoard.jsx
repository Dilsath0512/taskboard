import { useState } from 'react';
import TaskCard from './TaskCard';
import { ClipboardList, Plus } from 'lucide-react';

const COLUMNS = [
  { id: 'todo', title: 'To Do', colClass: 'col-todo' },
  { id: 'doing', title: 'In Progress', colClass: 'col-doing' },
  { id: 'done', title: 'Done', colClass: 'col-done' },
];

export default function KanbanBoard({ tasks, user, onStatusChange, onEditTask, onDeleteTask, onAssignSelf, onCreateTask }) {
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const handleDragStart = (e, taskId) => {
    e.dataTransfer.setData('text/plain', taskId);
    setDraggedTaskId(taskId);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverCol(null);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    if (dragOverCol !== colId) setDragOverCol(colId);
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;
    const task = tasks.find(t => t.id === taskId);
    if (task && task.status !== targetStatus) {
      onStatusChange(taskId, targetStatus);
    }
  };

  return (
    <div className="kanban-board" id="kanban-board">
      {COLUMNS.map(col => {
        const colTasks = tasks.filter(t => t.status === col.id);
        const isOver = dragOverCol === col.id;

        return (
          <div
            key={col.id}
            id={`col-${col.id}`}
            className={`kanban-column ${col.colClass} ${isOver ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="column-header">
              <div className="column-title">
                <span className="column-dot" />
                <span>{col.title}</span>
              </div>
              <span className="column-count">{colTasks.length}</span>
            </div>

            <div className="column-cards">
              {colTasks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon-box">
                    <ClipboardList size={20} />
                  </div>
                  <h4>No tasks in {col.title}</h4>
                  <p>Create a new task or move an existing task here.</p>
                  {col.id === 'todo' && onCreateTask && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={onCreateTask}
                      style={{ marginTop: 4 }}
                    >
                      <Plus size={13} />
                      <span>Add Task</span>
                    </button>
                  )}
                </div>
              ) : (
                colTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    user={user}
                    isDragging={draggedTaskId === task.id}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
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
