import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, FolderKanban, Building2, User } from "lucide-react";

export default function Sidebar({ isSidebarOpen, setIsSidebarOpen, isAuthenticated }) {
  const location = useLocation();

  if (!isAuthenticated) return null;

  return (
    <>
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside className={`main-sidebar ${isSidebarOpen ? "open" : ""}`}>
        <nav className="sidebar-nav">
          <Link
            to="/"
            className={`nav-item ${location.pathname === "/" ? "active" : ""}`}
          >
            <LayoutDashboard size={18} className="nav-icon" />
            <span>Tổng quan Dashboard</span>
          </Link>

          <Link
            to="/project"
            className={`nav-item ${location.pathname === "/project" ? "active" : ""}`}
          >
            <FolderKanban size={18} className="nav-icon" />
            <span>Quản lý Dự án</span>
          </Link>
          
          <Link
            to="/profile"
            className={`nav-item ${location.pathname === "/profile" ? "active" : ""}`}
          >

            <User size={18} className="nav-icon" />
            <span>Hồ sơ cá nhân</span>
          </Link>
        </nav>
      </aside>
    </>
  );
}