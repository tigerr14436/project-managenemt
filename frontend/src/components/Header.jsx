import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Zap, LogIn, UserPlus, LogOut } from 'lucide-react';

export default function Header({ 
  isSidebarOpen, 
  setIsSidebarOpen, 
  isAuthenticated, 
  onOpenAuthModal, 
  onLogout 
}) {
  const navigate = useNavigate();

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/du-an');
    } else {
      navigate('/');
    }
  };

  return (
    <header className="main-header">
      <div className="header-left">
        {isAuthenticated && (
          <button className="menu-toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu size={20} />
          </button>
        )}
        
        <div className="brand-logo" onClick={handleLogoClick}>
          <Zap size={22} className="brand-icon" />
          <span>DevTask</span>
        </div>
      </div>

      <div className="header-right">
        {isAuthenticated ? (
          <div className="user-profile-section">
            <div className="user-avatar-badge" title="Tài khoản cá nhân">
              SH
            </div>
            <button onClick={onLogout} className="logout-btn">
              <LogOut size={16} />
              <span>Đăng xuất</span>
            </button>
          </div>
        ) : (
          <div className="header-auth-btns">
            <button className="header-btn login-btn" onClick={onOpenAuthModal}>
              <LogIn size={16} />
              <span>Đăng nhập</span>
            </button>
            <button className="header-btn register-btn" onClick={onOpenAuthModal}>
              <UserPlus size={16} />
              <span>Đăng ký</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}