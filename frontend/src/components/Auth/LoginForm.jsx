import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

export default function LoginForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email?.trim()) {
      newErrors.email = 'Vui lòng nhập email.';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email không đúng định dạng.';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu.';
    }

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      alert('Đăng nhập thành công!');
    }, 1000);
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Đăng nhập</h2>

      <form onSubmit={handleSubmit} noValidate>
        <div className="input-group">
          <label className="input-label" htmlFor="email">Địa chỉ Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            className={`input-field ${errors.email ? 'error' : ''}`}
          />
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="password">Mật khẩu</label>
          <input
            id="password"
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            className={`input-field ${errors.password ? 'error' : ''}`}
          />
          {errors.password && <p className="error-text">{errors.password}</p>}
        </div>

        <div className="forgot-pass">
          <Link to="/forgot-password" className="forgot-link">Quên mật khẩu?</Link>
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-submit">
          {isSubmitting ? 'Đang xác thực...' : 'Đăng nhập'}
        </button>
      </form>

      <p className="switch-text">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="switch-btn-link">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}