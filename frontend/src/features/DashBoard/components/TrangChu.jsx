import React from 'react';
import { useNavigate } from 'react-router-dom';
import './TrangChu.css';

export default function TrangChu() {
  const dieuHuong = useNavigate();

  return (
    <div className="khung-trang-chu">
      {/* Thanh Header ở trên cùng */}
      <header className="thanh-dau-trang">
        <div className="logo-thuong-hieu">DevTask</div>
        <div className="nhom-nut-dieu-huong">
          <button className="nut-vien" onClick={() => dieuHuong('/dang-nhap')}>
            Đăng nhập
          </button>
          <button className="nut-chinh" onClick={() => dieuHuong('/dang-ky')}>
            Đăng ký
          </button>
        </div>
      </header>

      {/* Nội dung chào mừng chính */}
      <main className="khu-vuc-chao-mung">
        <span className="nhan-noi-bat">Nền tảng Quản lý Dự án IT</span>
        
        <h1 className="tieu-de-lon">
          Chào mừng đến với <span style={{ color: 'var(--mau-chinh)' }}>DevTask</span>
        </h1>
        
        <p className="doan-van-mota">
          Giải pháp toàn diện giúp các đội ngũ phát triển phần mềm theo dõi tiến độ, 
          phân công công việc và quản lý dự án công nghệ thông tin một cách hiệu quả và tối ưu.
        </p>

        <div className="nhom-nut-keu-goi">
          <button 
            className="nut-chinh nut-keu-goi-chinh" 
            onClick={() => dieuHuong('/dang-ky')}
          >
            Bắt đầu miễn phí
          </button>
          <button 
            className="nut-vien nut-keu-goi-phu" 
            onClick={() => dieuHuong('/dang-nhap')}
          >
            Đã có tài khoản?
          </button>
        </div>
      </main>

      {/* Footter chân trang */}
      <footer className="chan-trang">
        &copy; {new Date().getFullYear()} DevTask. Hệ thống quản lý dự án CNTT.
      </footer>
    </div>
  );
}