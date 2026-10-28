import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../../../lib/api';
import './Auth.css';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

function getError(err, fallback) {
  if (typeof err?.message === 'string' && err.message) return err.message;
  return fallback;
}

export default function RegisterForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');
  const [step, setStep] = useState('register');
  const [verificationEmail, setVerificationEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendAvailableAt, setResendAvailableAt] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);

  React.useEffect(() => {
    if (step !== 'verify' || resendAvailableAt === 0) return undefined;
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((resendAvailableAt - Date.now()) / 1000)));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [step, resendAvailableAt]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    setServerError('');
  };

  const validateForm = () => {
    const errors = {};
    if (formData.fullName.trim().length < 2) errors.fullName = 'Họ và tên phải có ít nhất 2 ký tự.';
    if (!EMAIL_REGEX.test(formData.email.trim())) errors.email = 'Email không đúng định dạng.';
    if (formData.password.length < 8) errors.password = 'Mật khẩu phải từ 8 ký tự trở lên.';
    else if (!PASSWORD_REGEX.test(formData.password)) errors.password = 'Mật khẩu phải chứa chữ hoa, chữ thường và số.';
    if (formData.confirmPassword !== formData.password || !formData.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }
    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setServerError('');
    setServerSuccess('');
    const errors = validateForm();
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }
    setIsSubmitting(true);
    try {
      const email = formData.email.trim().toLowerCase();
      await api.post('/auth/register', {
        name: formData.fullName.trim(),
        email,
        password: formData.password,
      });
      setVerificationEmail(email);
      setOtp('');
      setResendAvailableAt(Date.now() + 60000);
      setStep('verify');
      setServerSuccess('Tài khoản đã được tạo. Vui lòng kiểm tra email để lấy mã OTP (có hiệu lực 5 phút).');
    } catch (err) {
      setServerError(getError(err, 'Đăng ký thất bại. Vui lòng thử lại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    setServerError('');
    setServerSuccess('');
    if (!/^\d{6}$/.test(otp)) {
      setServerError('Vui lòng nhập chính xác 6 chữ số OTP.');
      return;
    }
    setIsSubmitting(true);
    try {
      await api.post('/auth/verify-email', { email: verificationEmail, code: otp });
      setStep('complete');
      setServerSuccess('Xác minh email thành công! Bạn có thể đăng nhập.');
    } catch (err) {
      setServerError(getError(err, 'Xác minh không thành công. Vui lòng thử lại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (isResending || secondsLeft > 0) return;
    setIsResending(true);
    setServerError('');
    setServerSuccess('');
    try {
      await api.post('/auth/resend-verification', { email: verificationEmail });
      setOtp('');
      setResendAvailableAt(Date.now() + 60000);
      setServerSuccess('Nếu tài khoản chưa xác minh, mã OTP mới sẽ được gửi đến email của bạn.');
    } catch (err) {
      setServerError(getError(err, 'Không gửi lại được mã OTP.'));
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">
        {step === 'register' ? 'Tạo tài khoản' : step === 'verify' ? 'Xác minh email' : 'Xác minh thành công'}
      </h2>

      {serverError && <p role="alert" className="error-text" style={{ marginBottom: 12 }}>{serverError}</p>}
      {serverSuccess && <p role="status" style={{ marginBottom: 12, color: '#34D399', fontSize: '0.875rem' }}>{serverSuccess}</p>}

      {step === 'register' && (
        <form onSubmit={handleSubmit} noValidate>
          {[
            { name: 'fullName', label: 'Họ và tên', type: 'text', placeholder: 'Nguyễn Văn A', autoComplete: 'name' },
            { name: 'email', label: 'Địa chỉ Email', type: 'email', placeholder: 'name@example.com', autoComplete: 'email' },
            { name: 'password', label: 'Mật khẩu', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
            { name: 'confirmPassword', label: 'Xác nhận mật khẩu', type: 'password', placeholder: '••••••••', autoComplete: 'new-password' },
          ].map((field) => (
            <div className="input-group" key={field.name}>
              <label className="input-label" htmlFor={field.name}>{field.label}</label>
              <input
                id={field.name}
                type={field.type}
                name={field.name}
                placeholder={field.placeholder}
                autoComplete={field.autoComplete}
                value={formData[field.name]}
                onChange={handleChange}
                className={`input-field ${fieldErrors[field.name] ? 'error' : ''}`}
                aria-invalid={Boolean(fieldErrors[field.name])}
                required
              />
              {fieldErrors[field.name] && <p className="error-text">{fieldErrors[field.name]}</p>}
            </div>
          ))}
          <button type="submit" disabled={isSubmitting} className="btn-submit">
            {isSubmitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>
        </form>
      )}

      {step === 'verify' && (
        <>
          <p className="switch-text" style={{ marginBottom: 18, marginTop: 0 }}>
            Mã OTP đã được gửi đến <strong style={{ color: '#fff' }}>{verificationEmail}</strong>.
          </p>
          <form onSubmit={handleVerify}>
            <div className="input-group">
              <label className="input-label" htmlFor="otp">Mã xác minh gồm 6 chữ số</label>
              <input
                id="otp"
                className="input-field"
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                autoComplete="one-time-code"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={(event) => { setOtp(event.target.value.replace(/\D/g, '').slice(0, 6)); setServerError(''); }}
                required
              />
            </div>
            <button className="btn-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Đang xác minh...' : 'Xác minh email'}
            </button>
          </form>
          <button
            type="button"
            className="btn-submit"
            style={{ background: 'transparent', border: '1px solid #334155', marginTop: 12 }}
            onClick={handleResend}
            disabled={isResending || secondsLeft > 0}
          >
            {isResending ? 'Đang gửi lại...' : secondsLeft > 0 ? `Gửi lại mã sau ${secondsLeft}s` : 'Gửi lại mã OTP'}
          </button>
        </>
      )}

      {step === 'complete' && (
        <button type="button" className="btn-submit" onClick={() => navigate('/')}>
          Về trang chủ để đăng nhập
        </button>
      )}

      <p className="switch-text">
        Đã có tài khoản?{' '}
        <Link to="/" className="switch-btn-link">Về trang đăng nhập</Link>
      </p>
    </div>
  );
}
