import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FolderPlus, 
  UserPlus, 
  FolderKanban, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  Code2,
  Search,
  Copy,
  Check,
  Trash2,
  ExternalLink
} from 'lucide-react';
import './TrangDuAn.css';

// Hàm gửi request có xác thực JWT
async function guiYeuCauXacThuc(url, options = {}) {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('Người dùng chưa đăng nhập');

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  const res = await fetch(`http://127.0.0.1:8000/api${url}`, { ...options, headers });
  if (!res.ok) {
    const errData = await res.json().catch(() => null);
    throw new Error(errData?.detail || 'Đã có lỗi xảy ra');
  }
  return await res.json();
}

export default function TrangDuAn() {
  const dieuHuong = useNavigate();
  
  // Danh sách dự án mẫu ban đầu
  const [danhSachDuAn, setDanhSachDuAn] = useState([
    { id: 1, name: 'Hệ thống E-Commerce DevTask', join_code: 'DEV-8892', role: 'Owner', member_count: 5 },
    { id: 2, name: 'Ứng dụng Mobile Banking', join_code: 'MB-1029', role: 'Member', member_count: 8 },
    { id: 3, name: 'Website Quản lý Nhân sự HR', join_code: 'HR-5541', role: 'Owner', member_count: 3 }
  ]);

  const [tenDuAnMoi, setTenDuAnMoi] = useState('');
  const [maThamGia, setMaThamGia] = useState('');
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState('');
  const [thongBao, setThongBao] = useState({ loai: '', noiDung: '' });
  const [dangTai, setDangTai] = useState(false);
  const [daSaoChep, setDaSaoChep] = useState(null); // Lưu ID mã dự án đã copy

  useEffect(() => {
    taiDanhSachDuAn();
  }, []);

  const taiDanhSachDuAn = async () => {
    try {
      const duLieu = await guiYeuCauXacThuc('/projects');
      if (Array.isArray(duLieu)) setDanhSachDuAn(duLieu);
    } catch (loi) {
      if (loi.message.includes('chưa đăng nhập')) {
        dieuHuong('/');
      }
    }
  };

  // Tạo dự án mới
  const xuLyTaoDuAn = async (e) => {
    e.preventDefault();
    if (!tenDuAnMoi.trim()) return;

    setDangTai(true);
    setThongBao({ loai: '', noiDung: '' });

    try {
      const duAnMoi = await guiYeuCauXacThuc('/projects', {
        method: 'POST',
        body: JSON.stringify({ name: tenDuAnMoi }),
      });

      setDanhSachDuAn((prev) => [duAnMoi, ...prev]);
      setTenDuAnMoi('');
      setThongBao({ loai: 'success', noiDung: 'Tạo dự án mới thành công!' });
    } catch (loi) {
      // Mock dữ liệu nếu chưa có API backend
      const mockProject = {
        id: Date.now(),
        name: tenDuAnMoi,
        join_code: `PRJ-${Math.floor(1000 + Math.random() * 9000)}`,
        role: 'Owner',
        member_count: 1
      };
      setDanhSachDuAn((prev) => [mockProject, ...prev]);
      setTenDuAnMoi('');
      setThongBao({ loai: 'success', noiDung: 'Tạo dự án mới thành công!' });
    } finally {
      setDangTai(false);
    }
  };

  // Tham gia dự án bằng Join Code
  const xuLyThamGiaDuAn = async (e) => {
    e.preventDefault();
    if (!maThamGia.trim()) return;

    setDangTai(true);
    setThongBao({ loai: '', noiDung: '' });

    try {
      const duAnDaThamGia = await guiYeuCauXacThuc('/projects/join', {
        method: 'POST',
        body: JSON.stringify({ join_code: maThamGia.trim() }),
      });

      setDanhSachDuAn((prev) => [duAnDaThamGia, ...prev]);
      setMaThamGia('');
      setThongBao({ loai: 'success', noiDung: 'Tham gia dự án thành công!' });
    } catch (loi) {
      setThongBao({ loai: 'error', noiDung: loi.message || 'Mã tham gia không hợp lệ hoặc bạn đã ở trong dự án này!' });
    } finally {
      setDangTai(false);
    }
  };

  // Sao chép mã mời
  const saoChepMaMoi = (code, id) => {
    navigator.clipboard.writeText(code);
    setDaSaoChep(id);
    setTimeout(() => setDaSaoChep(null), 2000);
  };

  // Xóa dự án
  const xuLyXoaDuAn = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa/rời khỏi dự án "${name}"?`)) return;

    try {
      await guiYeuCauXacThuc(`/projects/${id}`, { method: 'DELETE' });
      setDanhSachDuAn((prev) => prev.filter((item) => item.id !== id));
      setThongBao({ loai: 'success', noiDung: `Đã xóa dự án "${name}"` });
    } catch (loi) {
      // Mock xóa local nếu API chưa có
      setDanhSachDuAn((prev) => prev.filter((item) => item.id !== id));
      setThongBao({ loai: 'success', noiDung: `Đã xóa dự án "${name}"` });
    }
  };

  // Lọc danh sách dự án theo từ khóa
  const danhSachLoc = danhSachDuAn.filter((duAn) =>
    duAn.name.toLowerCase().includes(tuKhoaTimKiem.toLowerCase()) ||
    duAn.join_code.toLowerCase().includes(tuKhoaTimKiem.toLowerCase())
  );

  return (
    <div className="projects-container">
      {/* HEADER TỔNG QUAN */}
      <div className="projects-header">
        <div>
          <h2 className="projects-title">Quản lý Dự án</h2>
          <p className="projects-subtitle">Khởi tạo dự án mới, quản lý không gian làm việc hoặc tham gia bằng mã mời</p>
        </div>
      </div>

      {/* THÔNG BÁO ALERT */}
      {thongBao.noiDung && (
        <div className={`alert-banner ${thongBao.loai}`}>
          {thongBao.loai === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{thongBao.noiDung}</span>
        </div>
      )}

      {/* LƯỚI KHUNG THAO TÁC (TẠO & THAM GIA) */}
      <div className="projects-grid">
        {/* CARD TẠO DỰ ÁN */}
        <div className="project-action-card">
          <div className="card-header-icon">
            <FolderPlus size={22} />
          </div>
          <h3>Tạo Dự Án Mới</h3>
          <p className="card-desc">Thiết lập không gian quản lý tiến độ và công việc riêng cho đội ngũ của bạn</p>
          
          <form onSubmit={xuLyTaoDuAn} className="action-form">
            <div className="input-group-custom">
              <Code2 size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Nhập tên dự án..."
                value={tenDuAnMoi}
                onChange={(e) => setTenDuAnMoi(e.target.value)}
                className="input-field-custom"
                required
              />
            </div>
            <button type="submit" disabled={dangTai} className="btn-primary-custom">
              {dangTai ? <Loader2 size={16} className="spin-icon" /> : <FolderPlus size={16} />}
              <span>{dangTai ? 'Đang tạo...' : 'Tạo Dự Án'}</span>
            </button>
          </form>
        </div>

        {/* CARD THAM GIA DỰ ÁN */}
        <div className="project-action-card">
          <div className="card-header-icon secondary">
            <UserPlus size={22} />
          </div>
          <h3>Tham Gia Dự Án</h3>
          <p className="card-desc">Nhập mã mời (Join Code) được chia sẻ từ quản trị viên để tham gia</p>
          
          <form onSubmit={xuLyThamGiaDuAn} className="action-form">
            <div className="input-group-custom">
              <KeyRound size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Nhập mã tham gia (VD: DEV-8892)..."
                value={maThamGia}
                onChange={(e) => setMaThamGia(e.target.value)}
                className="input-field-custom"
                required
              />
            </div>
            <button type="submit" disabled={dangTai} className="btn-secondary-custom">
              {dangTai ? <Loader2 size={16} className="spin-icon" /> : <ArrowRight size={16} />}
              <span>{dangTai ? 'Đang tham gia...' : 'Tham Gia Ngay'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* DANH SÁCH DỰ ÁN */}
      <div className="project-list-section">
        <div className="section-title-bar">
          <div className="section-title-wrap">
            <FolderKanban size={20} className="section-icon" />
            <h3>Dự án của bạn ({danhSachLoc.length})</h3>
          </div>

          {/* Ô TÌM KIẾM */}
          <div className="search-box-custom">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm dự án hoặc mã..."
              value={tuKhoaTimKiem}
              onChange={(e) => setTuKhoaTimKiem(e.target.value)}
            />
          </div>
        </div>

        {danhSachLoc.length > 0 ? (
          <div className="project-cards-grid">
            {danhSachLoc.map((duAn) => (
              <div key={duAn.id} className="project-item-card">
                <div className="project-card-top">
                  <div className="project-avatar">
                    {duAn.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="project-info">
                    <h4 className="project-item-name">{duAn.name}</h4>
                    <div className="project-badges">
                      <span className={`role-badge ${duAn.role?.toLowerCase() === 'owner' ? 'owner' : 'member'}`}>
                        {duAn.role || 'Member'}
                      </span>
                      {duAn.member_count && (
                        <span className="member-count-badge">{duAn.member_count} thành viên</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="project-card-body">
                  <div className="code-box">
                    <span className="code-label">Mã mời:</span>
                    <code className="code-value">{duAn.join_code}</code>
                    <button 
                      className="btn-copy-code"
                      onClick={() => saoChepMaMoi(duAn.join_code, duAn.id)}
                      title="Sao chép mã"
                    >
                      {daSaoChep === duAn.id ? <Check size={14} className="success-icon" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
                
                <div className="project-card-footer">
                  <button 
                    className="btn-card-action view" 
                    onClick={() => dieuHuong(`/projects/${duAn.id}`)}
                  >
                    <span>Truy cập</span>
                    <ExternalLink size={14} />
                  </button>
                  <button 
                    className="btn-card-action delete"
                    onClick={() => xuLyXoaDuAn(duAn.id, duAn.name)}
                    title="Xóa dự án"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-project-state">
            <FolderKanban size={48} className="empty-icon" />
            <p>
              {tuKhoaTimKiem 
                ? `Không tìm thấy dự án nào khớp với "${tuKhoaTimKiem}"` 
                : 'Bạn chưa tham gia dự án nào. Hãy tạo dự án mới hoặc nhập mã mời để bắt đầu!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}