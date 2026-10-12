import React, { useState } from 'react';
import { User, Mail, Shield, CheckCircle2, Save, Sparkles, Camera } from 'lucide-react';
import './TrangProfile.css';

export default function TrangProfile() {
  const [thongTin, setThongTin] = useState({
    name: 'Shut Heast',
    email: 'shutheast@devtask.vn',
    role: 'Lead Developer / Owner',
    department: 'Engineering & DevOps',
    bio: 'Đam mê lập trình web full-stack, kiến trúc hệ thống đám mây và tối ưu hiệu suất ứng dụng.',
    avatar: null // Lưu trữ URL hoặc Base64 của ảnh đại diện
  });

  const [thanhCong, setThanhCong] = useState(false);

  // Xử lý khi người dùng chọn file ảnh từ máy tính
  const xuLyChonAnh = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThongTin((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const xuLyLuuThongTin = (e) => {
    e.preventDefault();
    setThanhCong(true);
    setTimeout(() => setThanhCong(false), 3000);
  };

  return (
    <div className="profile-container">
      {thanhCong && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#34d399',
          padding: '12px 16px',
          borderRadius: '12px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          <span>Đã cập nhật thông tin hồ sơ và hình đại diện thành công!</span>
        </div>
      )}

      <div className="profile-header">
        <h2 className="profile-title">Hồ Sơ Cá Nhân</h2>
        <p className="profile-subtitle">Quản lý thông tin tài khoản và hình ảnh đại diện của bạn trên DevTask</p>
      </div>

      <div className="profile-card">
        {/* BANNER THÔNG TIN & AVATAR CÓ THỂ ĐỔI ẢNH */}
        <div className="profile-top-section">
          <div className="profile-avatar-wrapper">
            {thongTin.avatar ? (
              <img src={thongTin.avatar} alt="Avatar" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-fallback">
                {thongTin.name ? thongTin.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SH'}
              </div>
            )}
            
            {/* Nút click để tải ảnh lên */}
            <label className="avatar-upload-overlay" title="Thay đổi hình đại diện">
              <Camera size={22} />
              <input 
                type="file" 
                accept="image/*" 
                className="avatar-file-input" 
                onChange={xuLyChonAnh} 
              />
            </label>
          </div>

          <div className="profile-user-meta">
            <h3>{thongTin.name}</h3>
            <p>{thongTin.email}</p>
            <span className="profile-role-tag">{thongTin.role}</span>
          </div>
        </div>

        {/* FORM CHỈNH SỬA */}
        <form onSubmit={xuLyLuuThongTin} className="profile-form">
          <div className="profile-grid-two">
            <div className="form-group-profile">
              <label><User size={16} style={{ color: '#818cf8' }} /> Họ và tên</label>
              <input
                type="text"
                className="profile-input"
                value={thongTin.name}
                onChange={(e) => setThongTin({ ...thongTin, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group-profile">
              <label><Mail size={16} style={{ color: '#38bdf8' }} /> Địa chỉ Email</label>
              <input
                type="email"
                className="profile-input"
                value={thongTin.email}
                disabled
              />
            </div>
          </div>

          <div className="profile-grid-two">
            <div className="form-group-profile">
              <label><Shield size={16} style={{ color: '#34d399' }} /> Vai trò hệ thống</label>
              <input
                type="text"
                className="profile-input"
                value={thongTin.role}
                onChange={(e) => setThongTin({ ...thongTin, role: e.target.value })}
              />
            </div>

            <div className="form-group-profile">
              <label><Sparkles size={16} style={{ color: '#fbbf24' }} /> Phòng ban / Nhóm</label>
              <input
                type="text"
                className="profile-input"
                value={thongTin.department}
                onChange={(e) => setThongTin({ ...thongTin, department: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group-profile">
            <label>Giới thiệu bản thân (Bio)</label>
            <textarea
              className="profile-input"
              style={{ minHeight: '90px', resize: 'vertical' }}
              value={thongTin.bio}
              onChange={(e) => setThongTin({ ...thongTin, bio: e.target.value })}
            />
          </div>

          <div className="profile-actions">
            <button type="submit" className="btn-save-profile">
              <Save size={16} />
              <span>Lưu Thay Đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}