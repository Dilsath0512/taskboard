export default function TaskCard({ task, user, isDragging, onDragStart, onDragEnd, onEdit, onDelete, onAssignSelf }) {
  const canEdit = user.role === 'admin' || task.creator_id === user.id || task.assigned_to === user.id;
  const canDelete = user.role === 'admin' || task.creator_id === user.id;
  const canAssignSelf = !task.assigned_to && user.role !== 'admin';

  const getInitial = (name) => name?.[0]?.toUpperCase() || '?';

  const formatDate = (dateStr) => {
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
        <div className="task-title">{task.title}</div>
        <div className="task-card-actions">
          {canEdit && (
            <button
              className="btn btn-ghost btn-icon btn-sm"
              title="Edit task"
              onClick={(e) => { e.stopPropagation(); onEdit(task); }}
              style={{ fontSize: 13 }}
            >
              ✏️
            </button>
          )}
          {canDelete && (
            <button
              className="btn btn-danger btn-icon btn-sm"
              title="Delete task"
              onClick={(e) => { e.stopPropagation(); onDelete(task.id); }}
              style={{ fontSize: 13 }}
            >
              🗑️
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
              <div className="task-avatar">{getInitial(task.assigned_name)}</div>
              <span>{task.assigned_name}</span>
            </div>
          ) : (
            <span className="task-unassigned">Unassigned</span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {canAssignSelf && (
            <button
              className="assign-btn"
              onClick={(e) => { e.stopPropagation(); onAssignSelf(task.id); }}
              title="Assign to yourself"
            >
              + Assign Me
            </button>
          )}
          <span className="task-date">{formatDate(task.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
