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

    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password };

    let response;
    try {
      // Bước 1: gửi request. Nếu fetch ở đây ném lỗi (catch bên dưới),
      // nghĩa là KHÔNG kết nối được tới server (backend chưa chạy, sai port...)
      response = await fetch(`http://127.0.0.1:8000/api${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (networkErr) {
      // Chỉ rơi vào đây khi KHÔNG kết nối được server — lỗi mạng thật sự,
      // không phải do sai email/mật khẩu. Không tự coi là thành công.
      setMessage({
        type: 'error',
        content: 'Không thể kết nối tới server. Kiểm tra backend đã chạy ở cổng 8000 chưa.',
      });
      setLoading(false);
      return;
    }

    // Bước 2: server ĐÃ phản hồi — có thể là thành công hoặc lỗi nghiệp vụ thật
    // (sai mật khẩu, email trùng...). Những trường hợp này KHÔNG được coi là "demo thành công".
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      setMessage({
        type: 'error',
        content: data?.detail || 'Email hoặc mật khẩu không đúng.',
      });
      setLoading(false);
      return;
    }

    // Chỉ tới đây khi server xác nhận thành công thật (status 2xx)
    if (isLogin && data?.access_token) {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('user_email', formData.email);
    }

    setMessage({
      type: 'success',
      content: isLogin ? 'Đăng nhập thành công!' : 'Đăng ký tài khoản thành công!',
    });

    setLoading(false);

    setTimeout(() => {
      if (isLogin) {
        if (onSuccess) onSuccess(data);
        onClose();
        navigate('/du-an');
      } else {
        // Đăng ký xong KHÔNG có sẵn access_token (backend chỉ trả về
        // thông tin user) — chuyển sang tab đăng nhập thay vì vào thẳng app.
        switchMode(true);
      }
    }, 800);
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
              ? 'Đăng nhập bằng email và mật khẩu đã đăng ký'
              : 'Điền thông tin để tạo tài khoản DevTask'}
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