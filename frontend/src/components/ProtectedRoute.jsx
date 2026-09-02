import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Protect routes: redirect to login if not authenticated
// Optionally require admin role
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="spinner-page">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/board" replace />;
  }

  return children;
}
