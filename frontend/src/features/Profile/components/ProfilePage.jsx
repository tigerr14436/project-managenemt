import React, { useState } from 'react';
import { User, Mail, Shield, CheckCircle2, Save, Sparkles, Camera } from 'lucide-react';
import './ProfilePage.css';

export default function ProfilePage() {
  const [profileData, setProfileData] = useState({
    name: 'Shut Heast',
    email: 'shutheast@devtask.vn',
    role: 'Lead Developer / Owner',
    department: 'Engineering & DevOps',
    bio: 'Đam mê lập trình web full-stack, kiến trúc hệ thống đám mây và tối ưu hiệu suất ứng dụng.',
    avatar: null // Lưu trữ URL hoặc Base64 của ảnh đại diện
  });

  const [isSuccess, setIsSuccess] = useState(false);

  // Xử lý khi người dùng chọn file ảnh từ máy tính
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prev) => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3000);
  };

  return (
    <div className="profile-container">
      {isSuccess && (
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
            {profileData.avatar ? (
              <img src={profileData.avatar} alt="Avatar" className="profile-avatar-img" />
            ) : (
              <div className="profile-avatar-fallback">
                {profileData.name ? profileData.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'SH'}
              </div>
            )}

            {/* Nút click để tải ảnh lên */}
            <label className="avatar-upload-overlay" title="Thay đổi hình đại diện">
              <Camera size={22} />
              <input
                type="file"
                accept="image/*"
                className="avatar-file-input"
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          <div className="profile-user-meta">
            <h3>{profileData.name}</h3>
            <p>{profileData.email}</p>
            <span className="profile-role-tag">{profileData.role}</span>
          </div>
        </div>

        {/* FORM CHỈNH SỬA */}
        <form onSubmit={handleSaveProfile} className="profile-form">
          <div className="profile-grid-two">
            <div className="form-group-profile">
              <label><User size={16} style={{ color: '#818cf8' }} /> Họ và tên</label>
              <input
                type="text"
                className="profile-input"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group-profile">
              <label><Mail size={16} style={{ color: '#38bdf8' }} /> Địa chỉ Email</label>
              <input
                type="email"
                className="profile-input"
                value={profileData.email}
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
                value={profileData.role}
                onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
              />
            </div>

            <div className="form-group-profile">
              <label><Sparkles size={16} style={{ color: '#fbbf24' }} /> Phòng ban / Nhóm</label>
              <input
                type="text"
                className="profile-input"
                value={profileData.department}
                onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group-profile">
            <label>Giới thiệu bản thân (Bio)</label>
            <textarea
              className="profile-input"
              style={{ minHeight: '90px', resize: 'vertical' }}
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
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