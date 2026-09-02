import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const KanbanIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/>
    <rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/>
    <rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>
);

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const getInitial = (name) => name?.[0]?.toUpperCase() || '?';

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <KanbanIcon />
        TaskFlow
      </div>

      <div className="navbar-right">
        {user?.role === 'admin' && (
          <div className="nav-tabs">
            <button
              className={`nav-tab ${location.pathname === '/board' ? 'active' : ''}`}
              onClick={() => navigate('/board')}
              id="nav-board"
            >
              📋 Board
            </button>
            <button
              className={`nav-tab ${location.pathname === '/admin' ? 'active' : ''}`}
              onClick={() => navigate('/admin')}
              id="nav-admin"
            >
              🛡️ Admin
            </button>
          </div>
        )}

        <div className="navbar-user">
          <div className="navbar-avatar">{getInitial(user?.name)}</div>
          <div className="navbar-user-info">
            <span className="navbar-user-name">{user?.name}</span>
            <span className="navbar-user-role">{user?.role}</span>
          </div>
        </div>

        <button
          id="logout-btn"
          className="btn btn-ghost btn-sm"
          onClick={handleLogout}
          title="Sign out"
        >
          🚪 Sign Out
        </button>
      </div>
    </nav>
  );
}
