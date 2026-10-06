import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

const API_BASE = 'http://127.0.0.1:8000/api';
const BIEU_THUC_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const BIEU_THUC_MAT_KHAU = /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;

export default function FormDangKy() {
  const dieuHuong = useNavigate();
  
  const [duLieuForm, setDuLieuForm] = useState({
    hoTen: '',
    email: '',
    matKhau: '',
    xacNhanMatKhau: '',
  });

  const [danhSachLoi, setDanhSachLoi] = useState({});
  const [dangGuiDuLieu, setDangGuiDuLieu] = useState(false);
  const [loiMayChu, setLoiMayChu] = useState('');

  const xuLyThayDoi = (suKien) => {
    const { name, value } = suKien.target;
    setDuLieuForm((duLieuTruoc) => ({ ...duLieuTruoc, [name]: value }));
    
    if (danhSachLoi[name]) {
      setDanhSachLoi((loiTruoc) => ({ ...loiTruoc, [name]: '' }));
    }
    if (loiMayChu) setLoiMayChu('');
  };

  const kiemTraHopLe = () => {
    const loiMoi = {};

    if (!duLieuForm.hoTen?.trim()) {
      loiMoi.hoTen = 'Vui lòng nhập họ và tên.';
    } else if (duLieuForm.hoTen.trim().length < 2) {
      loiMoi.hoTen = 'Họ và tên phải có ít nhất 2 ký tự.';
    }

    if (!duLieuForm.email?.trim()) {
      loiMoi.email = 'Vui lòng nhập email.';
    } else if (!BIEU_THUC_EMAIL.test(duLieuForm.email)) {
      loiMoi.email = 'Email không đúng định dạng.';
    }

    if (!duLieuForm.matKhau) {
      loiMoi.matKhau = 'Vui lòng nhập mật khẩu.';
    } else if (duLieuForm.matKhau.length < 8) {
      loiMoi.matKhau = 'Mật khẩu phải từ 8 ký tự trở lên.';
    } else if (!BIEU_THUC_MAT_KHAU.test(duLieuForm.matKhau)) {
      loiMoi.matKhau = 'Mật khẩu phải chứa chữ hoa, chữ thường và số.';
    }

    if (!duLieuForm.xacNhanMatKhau) {
      loiMoi.xacNhanMatKhau = 'Vui lòng xác nhận mật khẩu.';
    } else if (duLieuForm.xacNhanMatKhau !== duLieuForm.matKhau) {
      loiMoi.xacNhanMatKhau = 'Mật khẩu xác nhận không khớp.';
    }

    return loiMoi;
  };

  const xuLyDangKy = async (suKien) => {
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
      const phanHoi = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: duLieuForm.hoTen,
          email: duLieuForm.email,
          password: duLieuForm.matKhau,
        }),
      });

      if (!phanHoi.ok) {
        const duLieuLoi = await phanHoi.json().catch(() => null);
        throw new Error(duLieuLoi?.detail || 'Không thể tạo tài khoản. Vui lòng thử lại.');
      }

      alert('Đăng ký tài khoản thành công!');
      dieuHuong('/dang-nhap');
    } catch (loi) {
      setLoiMayChu(loi.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setDangGuiDuLieu(false);
    }
  };

  return (
    <div className="auth-card">
      <h2 className="auth-title">Tạo tài khoản</h2>

      {/* Thông báo lỗi trả về từ máy chủ */}
      {loiMayChu && (
        <p className="error-text" style={{ marginBottom: 12, textAlign: 'center' }}>
          {loiMayChu}
        </p>
      )}

      <form onSubmit={xuLyDangKy} noValidate>
        <div className="input-group">
          <label className="input-label" htmlFor="hoTen">Họ và tên</label>
          <input
            id="hoTen"
            type="text"
            name="hoTen"
            placeholder="Nguyễn Văn A"
            value={duLieuForm.hoTen}
            onChange={xuLyThayDoi}
            className={`input-field ${danhSachLoi.hoTen ? 'error' : ''}`}
          />
          {danhSachLoi.hoTen && <p className="error-text">{danhSachLoi.hoTen}</p>}
        </div>

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

        <div className="input-group">
          <label className="input-label" htmlFor="xacNhanMatKhau">Xác nhận mật khẩu</label>
          <input
            id="xacNhanMatKhau"
            type="password"
            name="xacNhanMatKhau"
            placeholder="••••••••"
            value={duLieuForm.xacNhanMatKhau}
            onChange={xuLyThayDoi}
            className={`input-field ${danhSachLoi.xacNhanMatKhau ? 'error' : ''}`}
          />
          {danhSachLoi.xacNhanMatKhau && <p className="error-text">{danhSachLoi.xacNhanMatKhau}</p>}
        </div>

        <button type="submit" disabled={dangGuiDuLieu} className="btn-submit">
          {dangGuiDuLieu ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </button>
      </form>

      <p className="switch-text">
        Đã có tài khoản?{' '}
        <Link to="/dang-nhap" className="switch-btn-link">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}