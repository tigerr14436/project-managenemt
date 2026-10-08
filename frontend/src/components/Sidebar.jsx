import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FolderKanban, Building2 } from 'lucide-react';

export default function Sidebar({ moSidebar, setMoSidebar, daDangNhap }) {
  const viTriHienTai = useLocation();

  if (!daDangNhap) return null;

  return (
    <>
      {moSidebar && (
        <div className="sidebar-overlay" onClick={() => setMoSidebar(false)}></div>
      )}

      <aside className={`main-sidebar ${moSidebar ? 'open' : ''}`}>
        <nav className="sidebar-nav">
          <Link
            to="/du-an"
            className={`nav-item ${viTriHienTai.pathname === '/du-an' ? 'active' : ''}`}
          >
            <FolderKanban size={18} className="nav-icon" />
            <span>Quản lý Dự án</span>
          </Link>

          <Link
            to="/workspace"
            className={`nav-item ${viTriHienTai.pathname === '/workspace' ? 'active' : ''}`}
          >
            <Building2 size={18} className="nav-icon" />
            <span>Workspace & Nhóm</span>
          </Link>
        </nav>
      </aside>
    </>
  );
}