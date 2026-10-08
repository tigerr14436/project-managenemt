import React from 'react';
import { useAuthModal } from '../../../context/AuthContext';
import './TrangChu.css';

export default function TrangChu() {
  // Lấy trực tiếp hàm mở modal từ Context
  const { xulyMoAuthModal } = useAuthModal();

  return (
    <div className="khung-trang-chu">
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
            type="button"
            className="nut-chinh nut-keu-goi-chinh" 
            onClick={xulyMoAuthModal}
          >
            Bắt đầu miễn phí
          </button>
          <button 
            type="button"
            className="nut-vien nut-keu-goi-phu" 
            onClick={xulyMoAuthModal}
          >
            Đã có tài khoản?
          </button>
        </div>
      </main>

      <footer className="chan-trang">
        &copy; {new Date().getFullYear()} DevTask. Hệ thống quản lý dự án CNTT.
      </footer>
    </div>
  );
}