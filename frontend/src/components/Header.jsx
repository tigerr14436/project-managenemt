import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Zap,
  LogIn,
  UserPlus,
  LogOut,
  Bell,
  CheckCircle,
  X
} from 'lucide-react';

export default function Header({
  isSidebarOpen,
  setIsSidebarOpen,
  isAuthenticated,
  onOpenAuthModal,
  onLogout,
}) {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Danh sách thông báo mẫu
  const [notifications, setNotifications] = useState([
    { id: 1, title: "Đã thêm vào dự án", message: "Bạn được thêm vào nhóm Backend API", time: "10 phút trước", read: false },
    { id: 2, title: "Cập nhật Task", message: "Task 'OAuth2' đã chuyển sang Hoàn thành", time: "1 giờ trước", read: false },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogoClick = () => {
    if (isAuthenticated) {
      navigate('/du-an');
    } else {
      navigate('/');
    }
  };

  const handleToggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    if (typeof onLogout === 'function') {
      onLogout();
    }
    navigate('/');
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  const removeNotification = (id, e) => {
    e.stopPropagation();
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return (
    <header className="main-header">
      <div className="header-left">
        {isAuthenticated && (
          <button
            type="button"
            className="menu-toggle-btn"
            onClick={handleToggleSidebar}
            aria-label="Mở hoặc đóng menu"
          >
            <Menu size={20} />
          </button>
        )}

        <div
          className="brand-logo"
          onClick={handleLogoClick}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              handleLogoClick();
            }
          }}
        >
          <Zap size={22} className="brand-icon" />
          <span>DevTask</span>
        </div>
      </div>

      <div className="header-right">
        {isAuthenticated ? (
          <div className="user-profile-section">
            {/* NÚT THÔNG BÁO (NOTIFICATION BELL) */}
            <div className="notification-wrapper">
              <button
                type="button"
                className="notification-bell-btn"
                onClick={() => setShowNotifications(!showNotifications)}
                title="Thông báo"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>

              {/* HỘP THẢ NGOÀI (DROPDOWN) THÔNG BÁO */}
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h4>Thông báo</h4>
                    {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="mark-read-btn">
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>

                  <div className="notification-list">
                    {notifications.length > 0 ? (
                      notifications.map((item) => (
                        <div key={item.id} className={`notification-item ${!item.read ? 'unread' : ''}`}>
                          <div className="notification-content">
                            <h5>{item.title}</h5>
                            <p>{item.message}</p>
                            <span className="notification-time">{item.time}</span>
                          </div>
                          <button 
                            className="notification-delete" 
                            onClick={(e) => removeNotification(item.id, e)}
                            title="Xóa thông báo"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="notification-empty">Không có thông báo nào</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div
              className="user-avatar-badge"
              title="Tài khoản cá nhân"
            >
              SH
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="logout-btn"
            >
              <LogOut size={16} />
              <span>Đăng xuất</span>
            </button>
          </div>
        ) : (
          <div className="header-auth-btns">
            <button
              type="button"
              className="header-btn login-btn"
              onClick={onOpenAuthModal}
            >
              <LogIn size={16} />
              <span>Đăng nhập</span>
            </button>

            <button
              type="button"
              className="header-btn register-btn"
              onClick={onOpenAuthModal}
            >
              <UserPlus size={16} />
              <span>Đăng ký</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}