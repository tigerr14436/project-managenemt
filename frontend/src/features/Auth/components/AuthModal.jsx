import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Mail, Lock, User, ArrowRight, Loader2,
  AlertCircle, CheckCircle2, LogIn, UserPlus, ShieldCheck, RefreshCw
} from 'lucide-react';
import './AuthModal.css';

const API_BASE = 'http://127.0.0.1:8000/api';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function errorMessage(data, fallback) {
  if (typeof data?.detail === 'string') return data.detail;
  if (Array.isArray(data?.detail)) return data.detail.map(item => item.msg || 'Dữ liệu không hợp lệ').join('; ');
  return fallback;
}

async function postJson(endpoint, payload) {
  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error('Không thể kết nối Backend. Kiểm tra server ở cổng 8000.');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(errorMessage(data, `Yêu cầu thất bại (HTTP ${response.status}).`));
  return data;
}

export default function AuthModal({ isOpen, onClose, onSuccess, initialMode = 'login' }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(initialMode); // login | register | verify
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [verificationEmail, setVerificationEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', content: '' });
  const [resendAvailableAt, setResendAvailableAt] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (!isOpen || step !== 'verify') return undefined;
    const update = () => setSecondsLeft(Math.max(0, Math.ceil((resendAvailableAt - Date.now()) / 1000)));
    update();
    const interval = window.setInterval(update, 1000);
    return () => window.clearInterval(interval);
  }, [isOpen, step, resendAvailableAt]);

  if (!isOpen) return null;

  const clearFeedback = () => setFeedback({ type: '', content: '' });
  const switchMode = (nextStep) => {
    if (isLoading || isResending) return;
    setStep(nextStep);
    clearFeedback();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    clearFeedback();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isLoading) return;
    clearFeedback();
    const email = formData.email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      setFeedback({ type: 'error', content: 'Địa chỉ email không hợp lệ.' });
      return;
    }
    if (step === 'register') {
      if (formData.name.trim().length < 2) {
        setFeedback({ type: 'error', content: 'Họ và tên phải có ít nhất 2 ký tự.' });
        return;
      }
      if (formData.password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        setFeedback({ type: 'error', content: 'Mật khẩu cần ít nhất 8 ký tự, gồm chữ hoa, chữ thường và số.' });
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFeedback({ type: 'error', content: 'Mật khẩu xác nhận không trùng khớp!' });
        return;
      }
    }
    setIsLoading(true);
    try {
      if (step === 'register') {
        await postJson('/auth/register', { name: formData.name.trim(), email, password: formData.password });
        setVerificationEmail(email);
        setOtp('');
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        setResendAvailableAt(Date.now() + 60000);
        setStep('verify');
        setFeedback({ type: 'success', content: 'Đã tạo tài khoản và gửi mã OTP. Vui lòng kiểm tra email (mã có hiệu lực 5 phút).' });
      } else {
        const data = await postJson('/auth/login', { email, password: formData.password });
        if (!data?.access_token) throw new Error('Backend chưa trả về access_token.');
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('user_email', email);
        setFeedback({ type: 'success', content: 'Đăng nhập thành công!' });
        if (onSuccess) onSuccess(data);
        onClose();
        navigate('/', { replace: true });
      }
    } catch (error) {
      setFeedback({ type: 'error', content: error.message || 'Có lỗi xảy ra. Vui lòng thử lại.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    if (isLoading) return;
    clearFeedback();
    if (!/^\d{6}$/.test(otp)) {
      setFeedback({ type: 'error', content: 'Vui lòng nhập chính xác mã OTP gồm 6 chữ số.' });
      return;
    }
    setIsLoading(true);
    try {
      await postJson('/auth/verify-email', { email: verificationEmail, code: otp });
      setOtp('');
      setStep('login');
      setFormData(prev => ({ ...prev, email: verificationEmail, password: '', confirmPassword: '' }));
      setFeedback({ type: 'success', content: 'Xác minh email thành công! Bạn có thể đăng nhập.' });
    } catch (error) {
      setFeedback({ type: 'error', content: error.message || 'Xác minh thất bại.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (isLoading || isResending || secondsLeft > 0) return;
    clearFeedback();
    setIsResending(true);
    try {
      await postJson('/auth/resend-verification', { email: verificationEmail });
      setOtp('');
      setResendAvailableAt(Date.now() + 60000);
      setFeedback({ type: 'success', content: 'Yêu cầu gửi lại mã đã được tiếp nhận. Vui lòng kiểm tra hộp thư và Spam.' });
    } catch (error) {
      setFeedback({ type: 'error', content: error.message || 'Không thể gửi lại mã OTP.' });
    } finally {
      setIsResending(false);
    }
  };

  const isVerify = step === 'verify';
  const isLogin = step === 'login';

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={event => event.stopPropagation()}>
        <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Đóng">
          <X size={20} />
        </button>

        {!isVerify && (
          <div className="auth-tabs">
            <button type="button" className={`auth-tab-btn ${isLogin ? 'active' : ''}`} onClick={() => switchMode('login')}>
              <LogIn size={16} /><span>Đăng nhập</span>
            </button>
            <button type="button" className={`auth-tab-btn ${!isLogin ? 'active' : ''}`} onClick={() => switchMode('register')}>
              <UserPlus size={16} /><span>Đăng ký</span>
            </button>
          </div>
        )}

        <div className="auth-header">
          <h3>{isVerify ? 'Xác minh email' : isLogin ? 'Chào mừng trở lại!' : 'Tạo tài khoản mới'}</h3>
          <p>{isVerify ? 'Nhập mã OTP gồm 6 chữ số được gửi đến email của bạn' : isLogin ? 'Đăng nhập bằng email và mật khẩu đã đăng ký' : 'Điền thông tin để tạo tài khoản DevTask'}</p>
        </div>

        {feedback.content && (
          <div className={`auth-alert ${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>
            {feedback.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
            <span>{feedback.content}</span>
          </div>
        )}

        {isVerify ? (
          <>
            <p style={{ textAlign: 'center', overflowWrap: 'anywhere', color: '#cbd5e1', margin: '12px 0' }}>
              Mã đã được gửi đến <strong style={{ color: '#fff' }}>{verificationEmail}</strong>
            </p>
            <form className="auth-form" onSubmit={handleVerify}>
              <div className="auth-input-group">
                <ShieldCheck size={18} className="auth-input-icon" />
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  aria-label="Mã OTP gồm 6 chữ số"
                  placeholder="Nhập mã OTP 6 chữ số"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  className="auth-input-field"
                  value={otp}
                  onChange={event => { setOtp(event.target.value.replace(/\D/g, '').slice(0, 6)); clearFeedback(); }}
                  required
                  autoFocus
                />
              </div>
              <button type="submit" className="auth-submit-btn" disabled={isLoading || otp.length !== 6}>
                {isLoading ? <Loader2 size={18} className="auth-spin-icon" /> : <><span>Xác minh email</span><ArrowRight size={18} /></>}
              </button>
            </form>
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending || isLoading || secondsLeft > 0}
              style={{ width: '100%', marginTop: 12, padding: 10, background: 'transparent', color: '#a5b4fc', border: '1px solid #334155', borderRadius: 8, cursor: 'pointer', opacity: isResending || secondsLeft > 0 ? 0.6 : 1 }}
            >
              <RefreshCw size={15} style={{ verticalAlign: 'middle', marginRight: 6 }} />
              {isResending ? 'Đang gửi lại...' : secondsLeft > 0 ? `Gửi lại mã sau ${secondsLeft}s` : 'Gửi lại mã OTP'}
            </button>
            <div className="auth-footer">
              <p><span onClick={() => switchMode('login')}>Quay về đăng nhập</span></p>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="auth-form">
              {!isLogin && (
                <div className="auth-input-group">
                  <User size={18} className="auth-input-icon" />
                  <input type="text" name="name" placeholder="Họ và tên..." value={formData.name} onChange={handleChange} required className="auth-input-field" autoComplete="name" />
                </div>
              )}
              <div className="auth-input-group">
                <Mail size={18} className="auth-input-icon" />
                <input type="email" name="email" placeholder="Địa chỉ Email..." value={formData.email} onChange={handleChange} required className="auth-input-field" autoComplete="email" />
              </div>
              <div className="auth-input-group">
                <Lock size={18} className="auth-input-icon" />
                <input type="password" name="password" placeholder="Mật khẩu..." value={formData.password} onChange={handleChange} required className="auth-input-field" autoComplete={isLogin ? 'current-password' : 'new-password'} />
              </div>
              {!isLogin && (
                <div className="auth-input-group">
                  <Lock size={18} className="auth-input-icon" />
                  <input type="password" name="confirmPassword" placeholder="Xác nhận mật khẩu..." value={formData.confirmPassword} onChange={handleChange} required className="auth-input-field" autoComplete="new-password" />
                </div>
              )}
              <button type="submit" disabled={isLoading} className="auth-submit-btn">
                {isLoading ? <Loader2 size={18} className="auth-spin-icon" /> : <><span>{isLogin ? 'Đăng Nhập Ngay' : 'Tạo Tài Khoản Ngay'}</span><ArrowRight size={18} /></>}
              </button>
            </form>
            <div className="auth-footer">
              {isLogin ? (
                <p>Chưa có tài khoản? <span onClick={() => switchMode('register')}>Đăng ký ngay</span></p>
              ) : (
                <p>Đã có tài khoản? <span onClick={() => switchMode('login')}>Đăng nhập</span></p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
