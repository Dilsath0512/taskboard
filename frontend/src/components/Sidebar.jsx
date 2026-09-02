import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Kanban,
  LayoutDashboard,
  CheckSquare,
  Users,
  LogOut,
  Shield,
  UserCheck,
  FolderKanban
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const getInitial = (name) => name?.[0]?.toUpperCase() || 'U';

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div>
        {/* Brand */}
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">
            <Kanban size={16} />
          </div>
          <span className="sidebar-logo-text">TaskFlow</span>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav">
          <div className="nav-section">
            <span className="nav-section-title">Workspace</span>
            <button
              id="nav-board"
              className={`nav-item ${isActive('/board') ? 'active' : ''}`}
              onClick={() => { navigate('/board'); onClose?.(); }}
            >
              <FolderKanban className="nav-item-icon" />
              <span>Board</span>
            </button>
          </div>

          {user?.role === 'admin' && (
            <div className="nav-section">
              <span className="nav-section-title">Administration</span>
              <button
                id="nav-admin"
                className={`nav-item ${isActive('/admin') ? 'active' : ''}`}
                onClick={() => { navigate('/admin'); onClose?.(); }}
              >
                <LayoutDashboard className="nav-item-icon" />
                <span>Overview</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* User Footer */}
      <div>
        <div className="sidebar-user">
          <div className="sidebar-user-details">
            <div className="user-avatar">{getInitial(user?.name)}</div>
            <div className="user-info">
              <span className="user-name truncate">{user?.name}</span>
              <span className="user-role-badge">{user?.role}</span>
            </div>
          </div>
          <button
            id="logout-btn"
            className="btn btn-ghost btn-icon"
            onClick={handleLogout}
            title="Sign out"
            style={{ padding: 6 }}
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );
}
