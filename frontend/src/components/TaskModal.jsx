import { useState } from 'react';

export default function TaskModal({ title, initialData, onSubmit, onClose }) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError('Task title is required.');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(formData);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" id="task-modal">
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="modal-close" onClick={onClose} id="modal-close-btn">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Task Title *</label>
              <input
                id="task-title-input"
                className="form-input"
                type="text"
                name="title"
                placeholder="What needs to be done?"
                value={formData.title}
                onChange={handleChange}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                id="task-description-input"
                className="form-textarea"
                name="description"
                placeholder="Add more details (optional)..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            {error && (
              <div className="alert alert-error">
                ⚠️ {error}
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              id="modal-submit-btn"
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? '⏳ Saving...' : initialData ? '💾 Save Changes' : '✨ Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
