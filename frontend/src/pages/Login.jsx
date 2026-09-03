import { useState } from 'react';
import { login, register } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Kanban, CheckCircle2, Layers, ShieldCheck, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function Login() {
  const [tab, setTab] = useState('login');
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (tab === 'login') {
        res = await login({ email: formData.email, password: formData.password });
      } else {
        res = await register({ name: formData.name, email: formData.email, password: formData.password });
      }
      const { token, user } = res.data;
      loginUser(token, user);
      navigate(user.role === 'admin' ? '/admin' : '/board');
    } catch (err) {
      console.error('Auth error:', err);
      const serverMsg = err.response?.data?.error;
      setError(serverMsg || err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Brand Showcase Panel */}
      <div className="auth-sidebar">
        <div className="auth-brand">
          <div className="sidebar-logo-icon">
            <Kanban size={16} />
          </div>
          <span className="sidebar-logo-text" style={{ fontSize: 16 }}>TaskFlow</span>
        </div>

        <div className="auth-hero-content">
          <h1 className="auth-hero-title">Organize work. Move faster.</h1>
          <p className="auth-hero-desc">
            A modern, minimal task management board designed for clarity, focus, and team velocity.
          </p>

          <div className="auth-features">
            <div className="auth-feature-item">
              <CheckCircle2 className="auth-feature-icon" />
              <span>Native drag-and-drop workflow tracking</span>
            </div>
            <div className="auth-feature-item">
              <Layers className="auth-feature-icon" />
              <span>Role-based access control and admin controls</span>
            </div>
            <div className="auth-feature-item">
              <ShieldCheck className="auth-feature-icon" />
              <span>Secure JWT authentication & encrypted data</span>
            </div>
          </div>
        </div>

        <div style={{ fontSize: 12, color: 'var(--text-muted)', zIndex: 1 }}>
          © {new Date().getFullYear()} TaskFlow Inc. All rights reserved.
        </div>
      </div>

      {/* Right Form Area */}
      <div className="auth-main">
        <div className="auth-card">
          <div className="auth-header">
            <h2>{tab === 'login' ? 'Welcome back' : 'Create an account'}</h2>
            <p>
              {tab === 'login'
                ? 'Sign in to access your workspace'
                : 'Get started with TaskFlow today'}
            </p>
          </div>

          <div className="auth-tabs">
            <button
              className={`auth-tab ${tab === 'login' ? 'active' : ''}`}
              onClick={() => { setTab('login'); setError(''); }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${tab === 'register' ? 'active' : ''}`}
              onClick={() => { setTab('register'); setError(''); }}
            >
              Register
            </button>
          </div>

          <form className="auth-form" onSubmit={handleSubmit} id="auth-form">
            {tab === 'register' && (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  id="register-name"
                  className="form-input"
                  type="text"
                  name="name"
                  placeholder="Mohamed Dilsath"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                id={tab === 'login' ? 'login-email' : 'register-email'}
                className="form-input"
                type="email"
                name="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  id={tab === 'login' ? 'login-password' : 'register-password'}
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-error" id="auth-error">
                <span>{error}</span>
              </div>
            )}

            <button
              id="auth-submit-btn"
              className="btn btn-primary btn-lg"
              type="submit"
              disabled={loading}
              style={{ width: '100%', marginTop: 8 }}
            >
              {loading ? (
                'Processing...'
              ) : (
                <>
                  <span>{tab === 'login' ? 'Sign In' : 'Create Account'}</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
