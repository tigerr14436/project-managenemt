
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Zap,
  LogIn,
  UserPlus,
  LogOut,
  Bell,
  X
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api';
const CV_KEY = 'devtask_cv_profile_v3';

const getInitials = (name) => {
  if (!name) return 'U';

  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
};

export default function Header({
  isSidebarOpen,
  setIsSidebarOpen,
  isAuthenticated,
  onOpenAuthModal,
  onLogout,
}) {
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [avatar, setAvatar] = useState('');
  const [userName, setUserName] = useState('');

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Đã thêm vào dự án',
      message: 'Bạn được thêm vào nhóm Backend API',
      time: '10 phút trước',
      read: false
    },
    {
      id: 2,
      title: 'Cập nhật Task',
      message: "Task 'OAuth2' đã chuyển sang Hoàn thành",
      time: '1 giờ trước',
      read: false
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Đọc ảnh đại diện đã lưu trong hồ sơ theo ID tài khoản.
  const loadProfileAvatar = async () => {
    if (!isAuthenticated) {
      setAvatar('');
      setUserName('');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');

      if (!token) {
        setAvatar('');
        return;
      }

      const response = await fetch(`${API_BASE}/users/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Không thể tải thông tin tài khoản.');
      }

      const account = await response.json();

      setUserName(account.name || '');

      if (!account.id) {
        setAvatar('');
        return;
      }

      const savedProfile = JSON.parse(
        localStorage.getItem(`${CV_KEY}:${account.id}`) || '{}'
      );

      setAvatar(savedProfile.avatar || '');
    } catch (error) {
      console.error('Lỗi tải ảnh đại diện:', error);
      setAvatar('');
    }
  };

  // Tải ảnh khi Header được khởi tạo hoặc trạng thái đăng nhập thay đổi.
  useEffect(() => {
    loadProfileAvatar();
  }, [isAuthenticated]);

  // Nhận sự kiện khi người dùng lưu ảnh mới trong ProfilePage.
  useEffect(() => {
    const handleProfileUpdated = (event) => {
      const updatedAvatar = event.detail?.avatar;

      if (typeof updatedAvatar === 'string') {
        setAvatar(updatedAvatar);
      }

      if (event.detail?.name) {
        setUserName(event.detail.name);
      }
    };

    window.addEventListener(
      'devtask-profile-updated',
      handleProfileUpdated
    );

    return () => {
      window.removeEventListener(
        'devtask-profile-updated',
        handleProfileUpdated
      );
    };
  }, []);

  // Đồng bộ nếu dữ liệu hồ sơ được cập nhật từ tab trình duyệt khác.
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key?.startsWith(`${CV_KEY}:`)) {
        loadProfileAvatar();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAuthenticated]);

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
    setAvatar('');
    setUserName('');

    if (typeof onLogout === 'function') {
      onLogout();
    }

    navigate('/');
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, read: true }))
    );
  };

  const removeNotification = (id, event) => {
    event.stopPropagation();

    setNotifications((prev) =>
      prev.filter((item) => item.id !== id)
    );
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
              event.preventDefault();
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

            {/* KHU VỰC THÔNG BÁO */}
            <div className="notification-wrapper">
              <button
                type="button"
                className="notification-bell-btn"
                onClick={() =>
                  setShowNotifications((prev) => !prev)
                }
                title="Thông báo"
                aria-label="Thông báo"
              >
                <Bell size={18} />

                {unreadCount > 0 && (
                  <span className="notification-badge">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h4>Thông báo</h4>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllAsRead}
                        className="mark-read-btn"
                      >
                        Đánh dấu đã đọc
                      </button>
                    )}
                  </div>

                  <div className="notification-list">
                    {notifications.length > 0 ? (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`notification-item ${
                            !item.read ? 'unread' : ''
                          }`}
                        >
                          <div className="notification-content">
                            <h5>{item.title}</h5>
                            <p>{item.message}</p>
                            <span className="notification-time">
                              {item.time}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="notification-delete"
                            onClick={(event) =>
                              removeNotification(item.id, event)
                            }
                            title="Xóa thông báo"
                            aria-label="Xóa thông báo"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="notification-empty">
                        Không có thông báo nào
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* ẢNH ĐẠI DIỆN TỪ HỒ SƠ CÁ NHÂN */}
            <div
              className="user-avatar-badge"
              title={userName || 'Tài khoản cá nhân'}
            >
              {avatar ? (
                <img
                  src={avatar}
                  alt="Ảnh đại diện"
                  className="header-user-avatar"
                />
              ) : (
                <span>{getInitials(userName)}</span>
              )}
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
