import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Building2, User } from "lucide-react";

export default function Sidebar({ moSidebar, setMoSidebar, daDangNhap }) {
  const viTriHienTai = useLocation();

  if (!daDangNhap) return null;

  return (
    <>
      {moSidebar && (
        <div
          className="sidebar-overlay"
          onClick={() => setMoSidebar(false)}
        ></div>
      )}

      <aside className={`main-sidebar ${moSidebar ? "open" : ""}`}>
        <nav className="sidebar-nav">
          <Link
            to="/"
            className={`nav-item ${viTriHienTai.pathname === "/" ? "active" : ""}`}
          >
            <LayoutDashboard size={18} className="nav-icon" />
            <span>Tổng quan Dashboard</span>
          </Link>

          <Link
            to="/du-an"
            className={`nav-item ${viTriHienTai.pathname === "/du-an" ? "active" : ""}`}
          >
            <FolderKanban size={18} className="nav-icon" />
            <span>Quản lý Dự án</span>
          </Link>
          <Link
            to="/profile"
            className={`nav-item ${viTriHienTai.pathname === "/profile" ? "active" : ""}`}
          >
            <User size={18} className="nav-icon" />
            <span>Hồ sơ cá nhân</span>
          </Link>
        </nav>
      </aside>
    </>
  );
}
