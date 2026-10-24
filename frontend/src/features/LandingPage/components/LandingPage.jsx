import React, { useState } from 'react';
import AuthModal from '../../Auth/components/AuthModal';
import './LandingPage.css';

export default function LandingPage({ onLoginSuccess }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [initialMode, setInitialMode] = useState('login');

  return (
    <div className="landing-page-container">
      <div className="landing-page-hero">
        <div className="landing-badge-pill">
          <span>Nền tảng Quản lý Dự án IT</span>
        </div>

        <h1 className="landing-main-title">
          Chào mừng đến với <span className="highlight-text">DevTask</span>
        </h1>

        <p className="landing-description">
          Giải pháp toàn diện giúp các đội ngũ phát triển phần mềm theo dõi tiến độ, phân công công việc và quản lý dự án công nghệ thông tin một cách hiệu quả và tối ưu.
        </p>

        <div className="landing-action-group">
          <button 
            className="btn-primary-purple" 
            onClick={() => { setInitialMode('register'); setShowAuthModal(true); }}
          >
            Bắt đầu miễn phí
          </button>
          <button 
            className="btn-outline-dark" 
            onClick={() => { setInitialMode('login'); setShowAuthModal(true); }}
          >
            Đã có tài khoản?
          </button>
        </div>
      </div>

      <AuthModal
        key={initialMode + '-' + String(showAuthModal)}
        isOpen={showAuthModal}
        initialMode={initialMode}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(data) => {
          setShowAuthModal(false);
          if (onLoginSuccess) onLoginSuccess(data);
        }}
      />
    </div>
  );
}
