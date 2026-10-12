import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderKanban, 
  CheckSquare, 
  Building2, 
  Users, 
  TrendingUp, 
  Clock, 
  PlusCircle, 
  ArrowRight, 
  Activity,
  Layers,
  CheckCircle2,
  BarChart3
} from 'lucide-react';
import './TrangChu.css';

export default function TrangChu() {
  const dieuHuong = useNavigate();

  const thongKe = {
    tongDuAn: 3,
    taskHoanThanh: 26,
    workspace: 2,
    thanhVien: 12
  };

  // Dữ liệu cho sơ đồ tiến độ các dự án
  const soDoTienDo = [
    { id: 1, name: 'Hệ thống E-Commerce DevTask', progress: 75, color: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)' },
    { id: 2, name: 'Ứng dụng Mobile Banking', progress: 45, color: 'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)' },
    { id: 3, name: 'Website Quản lý Nhân sự HR', progress: 100, color: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)' }
  ];

  const hoatDongGanDay = [
    { id: 1, action: 'Đã hoàn thành task "Thiết kế Giao diện Checkout"', project: 'Hệ thống E-Commerce DevTask', time: '10 phút trước' },
    { id: 2, action: 'Tạo task mới "Xác thực sinh trắc học FaceID"', project: 'Ứng dụng Mobile Banking', time: '1 giờ trước' },
    { id: 3, action: 'Thêm thành viên mới vào Workspace Công nghệ', project: 'DevTech Workspace', time: '3 giờ trước' },
    { id: 4, action: 'Khởi tạo dự án mới thành công', project: 'Website Quản lý Nhân sự HR', time: 'Hôm qua' }
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h2 className="dashboard-title">Tổng quan Dashboard</h2>
        <p className="dashboard-subtitle">Chào mừng bạn trở lại hệ thống quản lý công việc DevTask</p>
      </div>

      {/* 4 THẺ THỐNG KÊ TỔNG QUAN */}
      <div className="stats-grid">
        <div className="stat-card-box">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <FolderKanban size={24} />
          </div>
          <div className="stat-content">
            <h5>Tổng số dự án</h5>
            <h3>{thongKe.tongDuAn}</h3>
          </div>
        </div>

        <div className="stat-card-box">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(52, 211, 153, 0.15)', color: '#34d399' }}>
            <CheckSquare size={24} />
          </div>
          <div className="stat-content">
            <h5>Task hoàn thành</h5>
            <h3>{thongKe.taskHoanThanh}</h3>
          </div>
        </div>

        <div className="stat-card-box">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
            <Building2 size={24} />
          </div>
          <div className="stat-content">
            <h5>Workspace</h5>
            <h3>{thongKe.workspace}</h3>
          </div>
        </div>

        <div className="stat-card-box">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h5>Thành viên nhóm</h5>
            <h3>{thongKe.thanhVien}</h3>
          </div>
        </div>
      </div>

      {/* SƠ ĐỒ / BIỂU ĐỒ TIẾN ĐỘ DỰ ÁN */}
      <div className="dashboard-card" style={{ marginBottom: '24px' }}>
        <h3 className="dashboard-card-title">
          <BarChart3 size={20} style={{ color: '#38bdf8' }} />
          Sơ đồ tiến độ các dự án hiện tại
        </h3>

        <div className="chart-container">
          {soDoTienDo.map((item) => (
            <div key={item.id} className="chart-item">
              <div className="chart-info-row">
                <span>{item.name}</span>
                <span>{item.progress}%</span>
              </div>
              <div className="chart-bar-bg">
                <div 
                  className="chart-bar-fill" 
                  style={{ width: `${item.progress}%`, background: item.color }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LƯỚI NỘI DUNG CHÍNH */}
      <div className="dashboard-grid-main">
        {/* CỘT TRÁI: HOẠT ĐỘNG GẦN ĐÂY */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">
            <Activity size={20} style={{ color: '#818cf8' }} />
            Hoạt động gần đây của hệ thống
          </h3>

          <div className="activity-list">
            {hoatDongGanDay.map((item) => (
              <div key={item.id} className="activity-item">
                <div className="activity-icon">
                  <CheckCircle2 size={18} />
                </div>
                <div className="activity-details">
                  <p className="activity-text">
                    <strong>{item.action}</strong> trong dự án <em>{item.project}</em>
                  </p>
                  <p className="activity-time">
                    <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CỘT PHẢI: LỐI TẮT NHANH (QUICK ACTIONS) */}
        <div className="dashboard-card">
          <h3 className="dashboard-card-title">
            <TrendingUp size={20} style={{ color: '#38bdf8' }} />
            Truy cập nhanh
          </h3>

          <div className="quick-actions-list">
            <button className="quick-action-btn" onClick={() => dieuHuong('/du-an')}>
              <div className="quick-action-btn-left">
                <FolderKanban size={18} style={{ color: '#818cf8' }} />
                <span>Quản lý & Tạo Dự Án</span>
              </div>
              <ArrowRight size={16} style={{ color: '#64748b' }} />
            </button>

            <button className="quick-action-btn" onClick={() => dieuHuong('/workspace')}>
              <div className="quick-action-btn-left">
                <Building2 size={18} style={{ color: '#38bdf8' }} />
                <span>Workspace & Thành viên</span>
              </div>
              <ArrowRight size={16} style={{ color: '#64748b' }} />
            </button>

            <button className="quick-action-btn" onClick={() => dieuHuong('/du-an')}>
              <div className="quick-action-btn-left">
                <PlusCircle size={18} style={{ color: '#34d399' }} />
                <span>Mở Bảng Kanban Tiến Độ</span>
              </div>
              <ArrowRight size={16} style={{ color: '#64748b' }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}