import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/',           label: '📊 Dashboard' },
  { to: '/tracks',     label: '🎵 Tracks'    },
  { to: '/favorites',  label: '❤️  Favorites' },
  { to: '/playlists',  label: '🎧 Playlists' },
 
];

export default function Layout() {
  const { user, doLogout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { doLogout(); navigate('/login'); };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">Melopiies</div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <NavLink key={n.to} to={n.to} end={n.to === '/'}
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="user-name">👤 {user?.username}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}