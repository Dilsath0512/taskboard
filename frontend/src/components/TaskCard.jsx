import { Edit2, Trash2, UserPlus, Calendar } from 'lucide-react';

export default function TaskCard({ task, user, isDragging, onDragStart, onDragEnd, onEdit, onDelete, onAssignSelf }) {
  const canEdit = user.role === 'admin' || task.creator_id === user.id || task.assigned_to === user.id;
  const canDelete = user.role === 'admin' || task.creator_id === user.id;
  const canAssignSelf = !task.assigned_to && user.role !== 'admin';

  const getInitial = (name) => name?.[0]?.toUpperCase() || 'U';

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div
      id={`task-card-${task.id}`}
      className={`task-card ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={(e) => onDragStart(e, task.id)}
      onDragEnd={onDragEnd}
    >
      <div className="task-card-header">
        <span className="task-title">{task.title}</span>
        <div className="task-card-actions">
          {canEdit && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              title="Edit task"
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
              style={{ padding: 4 }}
            >
              <Edit2 size={13} />
            </button>
          )}
          {canDelete && (
            <button
              className="btn btn-danger btn-icon btn-sm"
              title="Delete task"
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              style={{ padding: 4 }}
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-footer">
        <div className="task-meta">
          {task.assigned_to ? (
            <div className="task-assignee" title={`Assigned to: ${task.assigned_name}`}>
              <div className="task-avatar-small">{getInitial(task.assigned_name)}</div>
              <span className="truncate" style={{ maxWidth: 100 }}>{task.assigned_name}</span>
            </div>
          ) : (
            <span className="task-unassigned">Unassigned</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {canAssignSelf && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={(e) => { e.stopPropagation(); onAssignSelf(task.id); }}
              title="Assign to yourself"
              style={{ padding: '3px 8px', fontSize: 11 }}
            >
              <UserPlus size={12} />
              <span>Assign me</span>
            </button>
          )}
          <div className="task-date">
            <Calendar size={11} />
            <span>{formatDate(task.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
