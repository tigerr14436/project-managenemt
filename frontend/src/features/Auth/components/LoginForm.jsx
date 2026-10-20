
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../../lib/api';
import './Auth.css';

export default function LoginForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  // Xử lý khi người dùng nhập dữ liệu
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Xóa lỗi của trường đang được chỉnh sửa
    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));

    // Xóa thông báo lỗi máy chủ khi nhập lại
    if (serverError) {
      setServerError('');
    }
  };

  // Kiểm tra dữ liệu trước khi đăng nhập
  const validateForm = () => {
    const newErrors = {};

    const email = formData.email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email) {
      newErrors.email = 'Vui lòng nhập email.';
    } else if (!emailRegex.test(email)) {
      newErrors.email =
        'Email không đúng định dạng. Ví dụ: name@gmail.com';
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu.';
    }

    return newErrors;
  };

  // Xử lý đăng nhập
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setServerError('');

    const validationErrors = validateForm();
    setErrors(validationErrors);

    // Nếu dữ liệu không hợp lệ thì dừng
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Gửi yêu cầu đăng nhập đến backend
      const data = await api.post('/auth/login', {
        email: formData.email.trim(),
        password: formData.password,
      });

      // Kiểm tra token trả về
      if (!data?.access_token) {
        throw new Error(
          'Không nhận được access token từ máy chủ.'
        );
      }

      // Lưu token để các request tiếp theo sử dụng
      localStorage.setItem('access_token', data.access_token);

      // Chuyển về trang chủ, không giữ trang đăng nhập trong lịch sử
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Login error:', err);

      setServerError(
        err instanceof Error
          ? err.message
          : 'Đăng nhập thất bại. Vui lòng thử lại.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Đăng nhập</h2>

      {serverError && (
        <p
          className="error-text"
          role="alert"
          style={{ marginBottom: 12 }}
        >
          {serverError}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Email */}
        <div className="input-group">
          <label className="input-label" htmlFor="email">
            Địa chỉ Email
          </label>

          <input
            id="email"
            type="email"
            name="email"
            placeholder="name@example.com"
            value={formData.email}
            onChange={handleChange}
            className={`input-field ${
              errors.email ? 'error' : ''
            }`}
            autoComplete="email"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={
              errors.email ? 'email-error' : undefined
            }
          />

          {errors.email && (
            <p id="email-error" className="error-text">
              {errors.email}
            </p>
          )}
        </div>

        {/* Mật khẩu */}
        <div className="input-group">
          <label className="input-label" htmlFor="password">
            Mật khẩu
          </label>

          <input
            id="password"
            type="password"
            name="password"
            placeholder="Nhập mật khẩu"
            value={formData.password}
            onChange={handleChange}
            className={`input-field ${
              errors.password ? 'error' : ''
            }`}
            autoComplete="current-password"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.password)}
            aria-describedby={
              errors.password ? 'password-error' : undefined
            }
          />

          {errors.password && (
            <p id="password-error" className="error-text">
              {errors.password}
            </p>
          )}
        </div>

        {/* Quên mật khẩu */}
        <div className="forgot-pass">
          <Link
            to="/forgot-password"
            className="forgot-link"
          >
            Quên mật khẩu?
          </Link>
        </div>

        {/* Nút đăng nhập */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-submit"
        >
          {isSubmitting
            ? 'Đang xác thực...'
            : 'Đăng nhập'}
        </button>
      </form>

      {/* Chuyển sang đăng ký */}
      <p className="switch-text">
        Chưa có tài khoản?{' '}
        <Link to="/register" className="switch-btn-link">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}
