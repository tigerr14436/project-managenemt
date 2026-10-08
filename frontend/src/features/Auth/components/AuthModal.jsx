import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import './AuthModal.css';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); 
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const switchMode = (mode) => {
    setIsLogin(mode);
    setMessage({ type: '', content: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', content: '' });

    if (!isLogin && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', content: 'Mật khẩu xác nhận không trùng khớp!' });
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name, email: formData.email, password: formData.password };

      const response = await fetch(`http://127.0.0.1:8000/api${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail || 'Lỗi server');
      }

      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }

      setMessage({
        type: 'success',
        content: isLogin ? 'Đăng nhập thành công!' : 'Đăng ký tài khoản thành công!',
      });

      setTimeout(() => {
        if (onSuccess) onSuccess(data);
        onClose();
        navigate('/du-an'); // Tự động chuyển thẳng tới trang Dự án (Tab đầu tiên của Sidebar)
      }, 800);

    } catch (err) {
      // Mock Demo nếu Backend chưa sẵn sàng
      const mockToken = 'mock_jwt_token_' + Date.now();
      localStorage.setItem('access_token', mockToken);
      localStorage.setItem('user_email', formData.email);

      setMessage({
        type: 'success',
        content: isLogin ? 'Đăng nhập thành công (Demo)!' : 'Đăng ký thành công (Demo)!',
      });

      setTimeout(() => {
        if (onSuccess) onSuccess({ email: formData.email, token: mockToken });
        onClose();
        navigate('/du-an'); // Tự động chuyển thẳng tới trang Dự án
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="auth-modal-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab-btn ${isLogin ? 'active' : ''}`}
            onClick={() => switchMode(true)}
          >
            <LogIn size={16} />
            <span>Đăng nhập</span>
          </button>
          <button
            type="button"
            className={`auth-tab-btn ${!isLogin ? 'active' : ''}`}
            onClick={() => switchMode(false)}
          >
            <UserPlus size={16} />
            <span>Đăng ký</span>
          </button>
        </div>

        <div className="auth-header">
          <h3>{isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}</h3>
          <p>
            {isLogin
              ? 'Nhập bất kỳ email & mật khẩu nào để thử nghiệm'
              : 'Điền thông tin để trải nghiệm ngay hệ thống DevTask'}
          </p>
        </div>

        {message.content && (
          <div className={`auth-alert ${message.type}`}>
            {message.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{message.content}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="auth-input-group">
              <User size={18} className="auth-input-icon" />
              <input
                type="text"
                name="name"
                placeholder="Họ và tên..."
                value={formData.name}
                onChange={handleChange}
                required={!isLogin}
                className="auth-input-field"
              />
            </div>
          )}

          <div className="auth-input-group">
            <Mail size={18} className="auth-input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Địa chỉ Email..."
              value={formData.email}
              onChange={handleChange}
              required
              className="auth-input-field"
            />
          </div>

          <div className="auth-input-group">
            <Lock size={18} className="auth-input-icon" />
            <input
              type="password"
              name="password"
              placeholder="Mật khẩu..."
              value={formData.password}
              onChange={handleChange}
              required
              className="auth-input-field"
            />
          </div>

          {!isLogin && (
            <div className="auth-input-group">
              <Lock size={18} className="auth-input-icon" />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Xác nhận mật khẩu..."
                value={formData.confirmPassword}
                onChange={handleChange}
                required={!isLogin}
                className="auth-input-field"
              />
            </div>
          )}

          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? (
              <Loader2 size={18} className="auth-spin-icon" />
            ) : (
              <>
                <span>{isLogin ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản Ngay'}</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          {isLogin ? (
            <p>
              Chưa có tài khoản?{' '}
              <span onClick={() => switchMode(false)}>Đăng ký ngay</span>
            </p>
          ) : (
            <p>
              Đã có tài khoản?{' '}
              <span onClick={() => switchMode(true)}>Đăng nhập</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}