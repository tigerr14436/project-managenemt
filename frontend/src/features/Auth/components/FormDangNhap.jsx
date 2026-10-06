import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const API_BASE = 'http://127.0.0.1:8000/api';
const BIEU_THUC_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FormDangNhap() {
  const dieuHuong = useNavigate();

  const [duLieuForm, setDuLieuForm] = useState({ email: '', matKhau: '' });
  const [danhSachLoi, setDanhSachLoi] = useState({});
  const [dangGuiDuLieu, setDangGuiDuLieu] = useState(false);
  const [loiMayChu, setLoiMayChu] = useState('');

  const xuLyThayDoi = (suKien) => {
    const { name, value } = suKien.target;
    setDuLieuForm((duLieuTruoc) => ({ ...duLieuTruoc, [name]: value }));
    
    // Xóa thông báo lỗi khi người dùng bắt đầu nhập lại
    if (danhSachLoi[name]) {
      setDanhSachLoi((loiTruoc) => ({ ...loiTruoc, [name]: '' }));
    }
    if (loiMayChu) setLoiMayChu('');
  };

  const kiemTraHopLe = () => {
    const loiMoi = {};

    if (!duLieuForm.email?.trim()) {
      loiMoi.email = 'Vui lòng nhập email.';
    } else if (!BIEU_THUC_EMAIL.test(duLieuForm.email)) {
      loiMoi.email = 'Email không đúng định dạng.';
    }

    if (!duLieuForm.matKhau) {
      loiMoi.matKhau = 'Vui lòng nhập mật khẩu.';
    }

    return loiMoi;
  };

  const xuLyDangNhap = async (suKien) => {
    suKien.preventDefault();
    setLoiMayChu('');

    const loiKiemTra = kiemTraHopLe();
    if (Object.keys(loiKiemTra).length > 0) {
      setDanhSachLoi(loiKiemTra);
      return;
    }

    setDangGuiDuLieu(true);

    try {
      // ===== GỌI API THẬT TỚI BACKEND =====
      const phanHoi = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: duLieuForm.email,
          password: duLieuForm.matKhau,
        }),
      });

      if (!phanHoi.ok) {
        const duLieuLoi = await phanHoi.json().catch(() => null);
        throw new Error(duLieuLoi?.detail || 'Email hoặc mật khẩu không đúng.');
      }

      const duLieuNhanVe = await phanHoi.json();
      
      // Lưu Token vào bộ nhớ trình duyệt
      localStorage.setItem('access_token', duLieuNhanVe.access_token);

      // Chuyển hướng sang trang chủ
      dieuHuong('/');
    } catch (loi) {
      setLoiMayChu(loi.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setDangGuiDuLieu(false);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Đăng nhập</h2>

      {/* Thông báo lỗi trả về từ Server/Backend */}
      {loiMayChu && (
        <p className="error-text" style={{ marginBottom: 12, textAlign: 'center' }}>
          {loiMayChu}
        </p>
      )}

      <form onSubmit={xuLyDangNhap} noValidate>
        <div className="input-group">
          <label className="input-label" htmlFor="email">Địa chỉ Email</label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="name@example.com"
            value={duLieuForm.email}
            onChange={xuLyThayDoi}
            className={`input-field ${danhSachLoi.email ? 'error' : ''}`}
          />
          {danhSachLoi.email && <p className="error-text">{danhSachLoi.email}</p>}
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="matKhau">Mật khẩu</label>
          <input
            id="matKhau"
            type="password"
            name="matKhau"
            placeholder="••••••••"
            value={duLieuForm.matKhau}
            onChange={xuLyThayDoi}
            className={`input-field ${danhSachLoi.matKhau ? 'error' : ''}`}
          />
          {danhSachLoi.matKhau && <p className="error-text">{danhSachLoi.matKhau}</p>}
        </div>

        <div className="forgot-pass">
          <Link to="/quen-mat-khau" className="forgot-link">Quên mật khẩu?</Link>
        </div>

        <button type="submit" disabled={dangGuiDuLieu} className="btn-submit">
          {dangGuiDuLieu ? 'Đang xác thực...' : 'Đăng nhập'}
        </button>
      </form>

      <p className="switch-text">
        Chưa có tài khoản?{' '}
        <Link to="/dang-ky" className="switch-btn-link">
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}