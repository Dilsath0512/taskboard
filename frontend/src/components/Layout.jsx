import { useState } from 'react';
import Sidebar from './Sidebar';
import { Menu, X, Kanban } from 'lucide-react';

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Dark backdrop overlay on mobile */}
      <div
        className={`sidebar-backdrop ${mobileOpen ? 'open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar drawer */}
      <Sidebar isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main Content Wrapper */}
      <div className="main-wrapper">
        {/* Mobile Top Header */}
        <header className="mobile-top-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="sidebar-logo-icon" style={{ width: 24, height: 24 }}>
              <Kanban size={14} />
            </div>
            <span className="sidebar-logo-text" style={{ fontSize: 14 }}>TaskFlow</span>
          </div>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </header>

        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
}
