import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  FolderKanban, 
  Building2, 
  LogIn, 
  UserPlus, 
  LogOut, 
  Menu, 
  Zap 
} from 'lucide-react';
import AuthModal from '../features/Auth/components/AuthModal';
import './Navigation.css';

export default function Navigation({ children }) {
  const [moSidebar, setMoSidebar] = useState(false);
  const [moAuthModal, setMoAuthModal] = useState(false);
  const [tabXacThuc, setTabXacThuc] = useState('login');

  const dieuHuong = useNavigate();
  const viTriHienTai = useLocation();

  // KIỂM TRA TRẠNG THÁI ĐĂNG NHẬP
  const daDangNhap = Boolean(localStorage.getItem('access_token'));

  const xulyDangXuat = () => {
    localStorage.removeItem('access_token');
    dieuHuong('/');
  };

  const xulyMoAuthModal = (tab = 'login') => {
    setTabXacThuc(tab);
    setMoAuthModal(true);
    setMoSidebar(false);
  };

  return (
    <div className="layout-wrapper">
      {/* HEADER CỐ ĐỊNH TRÊN CÙNG */}
      <header className="main-header">
        <div className="header-left">
          <button className="menu-toggle-btn" onClick={() => setMoSidebar(!moSidebar)}>
            <Menu size={20} />
          </button>
          <div className="brand-logo" onClick={() => dieuHuong('/')}>
            <Zap size={22} className="brand-icon" />
            <span>DevTask</span>
          </div>
        </div>

        {/* NÚT ĐĂNG NHẬP / ĐĂNG KÝ HOẶC ĐĂNG XUẤT TÙY TRẠNG THÁI */}
        <div className="header-right">
          {daDangNhap ? (
            <button onClick={xulyDangXuat} className="logout-btn">
              <LogOut size={16} />
              <span>Đăng xuất</span>
            </button>
          ) : (
            <div className="header-auth-btns">
              <button className="header-btn login-btn" onClick={() => xulyMoAuthModal('login')}>
                <LogIn size={16} />
                <span>Đăng nhập</span>
              </button>
              <button className="header-btn register-btn" onClick={() => xulyMoAuthModal('register')}>
                <UserPlus size={16} />
                <span>Đăng ký</span>
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="main-body">
        {moSidebar && (
          <div className="sidebar-overlay" onClick={() => setMoSidebar(false)}></div>
        )}

        {/* SIDEBAR CỐ ĐỊNH BÊN TRÁI */}
        <aside className={`main-sidebar ${moSidebar ? 'open' : ''}`}>
          <nav className="sidebar-nav">
            <Link
              to="/"
              onClick={() => setMoSidebar(false)}
              className={`nav-item ${viTriHienTai.pathname === '/' ? 'active' : ''}`}
            >
              <Home size={18} className="nav-icon" />
              <span>Trang chủ</span>
            </Link>

            <Link
              to="/du-an"
              onClick={() => setMoSidebar(false)}
              className={`nav-item ${viTriHienTai.pathname === '/du-an' ? 'active' : ''}`}
            >
              <FolderKanban size={18} className="nav-icon" />
              <span>Quản lý Dự án</span>
            </Link>

            <Link
              to="/workspace"
              onClick={() => setMoSidebar(false)}
              className={`nav-item ${viTriHienTai.pathname === '/workspace' ? 'active' : ''}`}
            >
              <Building2 size={18} className="nav-icon" />
              <span>Workspace & Nhóm</span>
            </Link>
          </nav>
        </aside>

        {/* NỘI DUNG CHÍNH */}
        <main className="main-content">{children}</main>
      </div>

      {/* POP-UP XÁC THỰC */}
      <AuthModal
        moModal={moAuthModal}
        xulyDong={() => setMoAuthModal(false)}
        tabBanDau={tabXacThuc}
      />
    </div>
  );
}