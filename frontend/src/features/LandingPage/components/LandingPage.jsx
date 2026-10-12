import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  LogIn,
  UserPlus
} from 'lucide-react';
import './LandingPage.css';

export default function LandingPage() {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', content: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const switchMode = (loginMode) => {
    setIsLoginMode(loginMode);
    setFeedback({ type: '', content: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', content: '' });

    if (!isLoginMode && formData.password !== formData.confirmPassword) {
      setFeedback({ type: 'error', content: 'Mật khẩu xác nhận không trùng khớp!' });
      return;
    }

    setIsLoading(true);

    const endpoint = isLoginMode ? '/auth/login' : '/auth/register';
    const payload = isLoginMode
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password };

    let response;
    try {
      response = await fetch(`http://127.0.0.1:8000/api${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (networkError) {
      setFeedback({
        type: 'error',
        content: 'Không thể kết nối tới server. Kiểm tra backend đã chạy ở cổng 8000 chưa.',
      });
      setIsLoading(false);
      return;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setFeedback({
        type: 'error',
        content: data?.detail || 'Email hoặc mật khẩu không đúng.',
      });
      setIsLoading(false);
      return;
    }

    if (isLoginMode && data?.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_email', formData.email);
    }

    setFeedback({
      type: 'success',
      content: isLoginMode ? 'Đăng nhập thành công!' : 'Đăng ký tài khoản thành công!',
    });

    setIsLoading(false);

    // Tự động reload và chuyển hướng ngay lập tức sau 800ms
    setTimeout(() => {
      if (isLoginMode) {
        window.location.href = '/';
      } else {
        switchMode(true);
      }
    }, 800);
  };

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
            onClick={() => { setIsLoginMode(false); setShowAuthModal(true); }}
          >
            Bắt đầu miễn phí
          </button>
          <button 
            className="btn-outline-dark" 
            onClick={() => { setIsLoginMode(true); setShowAuthModal(true); }}
          >
            Đã có tài khoản?
          </button>
        </div>
      </div>

      {showAuthModal && (
        <div className="landing-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="landing-modal-box auth-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="landing-modal-close auth-modal-close" onClick={() => setShowAuthModal(false)} aria-label="Close">
              <X size={18} />
            </button>

            <div className="auth-tabs" style={{ marginBottom: '20px' }}>
              <button
                type="button"
                className={`auth-tab-btn ${isLoginMode ? 'active' : ''}`}
                onClick={() => switchMode(true)}
              >
                <LogIn size={16} />
                <span>Đăng nhập</span>
              </button>
              <button
                type="button"
                className={`auth-tab-btn ${!isLoginMode ? 'active' : ''}`}
                onClick={() => switchMode(false)}
              >
                <UserPlus size={16} />
                <span>Đăng ký</span>
              </button>
            </div>

            <div className="landing-header auth-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
              <h3 className="landing-modal-title" style={{ fontSize: '20px', fontWeight: 700, color: '#f8fafc', margin: '0 0 6px 0' }}>
                {isLoginMode ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}
              </h3>
              <p className="landing-modal-subtitle" style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                {isLoginMode
                  ? 'Đăng nhập bằng email và mật khẩu đã đăng ký'
                  : 'Điền thông tin để tạo tài khoản DevTask'}
              </p>
            </div>

            {feedback.content && (
              <div className={`auth-alert ${feedback.type}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', marginBottom: '16px', background: feedback.type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(52, 211, 153, 0.15)', color: feedback.type === 'error' ? '#f87171' : '#34d399', border: `1px solid ${feedback.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(52, 211, 153, 0.3)'}` }}>
                {feedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                <span>{feedback.content}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {!isLoginMode && (
                <div className="auth-input-group" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <User size={18} className="auth-input-icon" style={{ position: 'absolute', left: '14px', color: '#64748b' }} />
                  <input
                    type="text"
                    name="name"
                    placeholder="Họ và tên..."
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLoginMode}
                    className="auth-input-field"
                    style={{ width: '100%', padding: '11px 14px 11px 42px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f8fafc', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              )}

              <div className="auth-input-group" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail size={18} className="auth-input-icon" style={{ position: 'absolute', left: '14px', color: '#64748b' }} />
                <input
                  type="email"
                  name="email"
                  placeholder="Địa chỉ Email..."
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="auth-input-field"
                  style={{ width: '100%', padding: '11px 14px 11px 42px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f8fafc', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div className="auth-input-group" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} className="auth-input-icon" style={{ position: 'absolute', left: '14px', color: '#64748b' }} />
                <input
                  type="password"
                  name="password"
                  placeholder="Mật khẩu..."
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="auth-input-field"
                  style={{ width: '100%', padding: '11px 14px 11px 42px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f8fafc', fontSize: '14px', outline: 'none' }}
                />
              </div>

              {!isLoginMode && (
                <div className="auth-input-group" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Lock size={18} className="auth-input-icon" style={{ position: 'absolute', left: '14px', color: '#64748b' }} />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Xác nhận mật khẩu..."
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required={!isLoginMode}
                    className="auth-input-field"
                    style={{ width: '100%', padding: '11px 14px 11px 42px', backgroundColor: '#0f172a', border: '1px solid #334155', borderRadius: '10px', color: '#f8fafc', fontSize: '14px', outline: 'none' }}
                  />
                </div>
              )}

              <button type="submit" disabled={isLoading} className="auth-submit-btn btn-primary-purple" style={{ width: '100%', marginTop: '6px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                {isLoading ? (
                  <Loader2 size={18} className="auth-spin-icon" />
                ) : (
                  <>
                    <span>{isLoginMode ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản Ngay'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer" style={{ textAlign: 'center', marginTop: '16px' }}>
              {isLoginMode ? (
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  Chưa có tài khoản?{' '}
                  <span onClick={() => switchMode(false)} style={{ color: '#818cf8', fontWeight: 600, cursor: 'pointer' }}>Đăng ký ngay</span>
                </p>
              ) : (
                <p style={{ fontSize: '13px', color: '#94a3b8', margin: 0 }}>
                  Đã có tài khoản?{' '}
                  <span onClick={() => switchMode(true)} style={{ color: '#818cf8', fontWeight: 600, cursor: 'pointer' }}>Đăng nhập</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}