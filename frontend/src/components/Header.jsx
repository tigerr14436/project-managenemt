import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Zap, LogIn, UserPlus, LogOut } from 'lucide-react';

export default function Header({ 
  moSidebar, 
  setMoSidebar, 
  daDangNhap, 
  xulyMoAuthModal, 
  xulyDangXuat 
}) {
  const dieuHuong = useNavigate();

  const xulyClickLogo = () => {
    if (daDangNhap) {
      dieuHuong('/du-an'); // Đã đăng nhập -> sang tab Quản lý dự án
    } else {
      dieuHuong('/'); // Chưa đăng nhập -> về trang chủ
    }
  };

  return (
    <header className="main-header">
      <div className="header-left">
        {daDangNhap && (
          <button className="menu-toggle-btn" onClick={() => setMoSidebar(!moSidebar)}>
            <Menu size={20} />
          </button>
        )}
        
        {/* Cập nhật điều hướng khi click logo */}
        <div className="brand-logo" onClick={xulyClickLogo}>
          <Zap size={22} className="brand-icon" />
          <span>DevTask</span>
        </div>
      </div>

      <div className="header-right">
        {daDangNhap ? (
          <button onClick={xulyDangXuat} className="logout-btn">
            <LogOut size={16} />
            <span>Đăng xuất</span>
          </button>
        ) : (
          <div className="header-auth-btns">
            <button className="header-btn login-btn" onClick={xulyMoAuthModal}>
              <LogIn size={16} />
              <span>Đăng nhập</span>
            </button>
            <button className="header-btn register-btn" onClick={xulyMoAuthModal}>
              <UserPlus size={16} />
              <span>Đăng ký</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}