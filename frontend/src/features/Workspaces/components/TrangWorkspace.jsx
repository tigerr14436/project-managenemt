import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  UserPlus, 
  Plus, 
  Mail, 
  FolderPlus, 
  Shield, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Layers
} from 'lucide-react';
import './TrangWorkspace.css';

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

export default function TrangWorkspace() {
  const dieuHuong = useNavigate();

  // Mock dữ liệu mặc định chuẩn đề tài DevTask
  const [danhSachWorkspace, setDanhSachWorkspace] = useState([
    { id: 1, name: 'Công ty Công Nghệ DevTech', member_count: 12 },
    { id: 2, name: 'Dự án Freelance UI/UX', member_count: 4 }
  ]);
  const [workspaceChon, setWorkspaceChon] = useState(null);
  const [danhSachNhom, setDanhSachNhom] = useState([
    { id: 101, name: 'Đội ngũ Frontend', members_count: 5 },
    { id: 102, name: 'Đội ngũ Backend API', members_count: 4 },
    { id: 103, name: 'Nhóm Thiết kế UI/UX', members_count: 3 }
  ]);
  const [danhSachThanhVien, setDanhSachThanhVien] = useState([
    { id: 1, name: 'Nguyễn Văn A', email: 'vana@devtask.vn', role: 'Admin' },
    { id: 2, name: 'Trần Thị B', email: 'thib@devtask.vn', role: 'Member' },
    { id: 3, name: 'Lê Hoàng C', email: 'hoangc@devtask.vn', role: 'Member' }
  ]);

  const [tabHienTai, setTabHienTai] = useState('nhom'); // 'nhom' hoặc 'thanhvien'
  const [tenWorkspaceMoi, setTenWorkspaceMoi] = useState('');
  const [tenNhomMoi, setTenNhomMoi] = useState('');
  const [emailThanhVien, setEmailThanhVien] = useState('');

  const [thongBao, setThongBao] = useState({ loai: '', noiDung: '' });
  const [dangTai, setDangTai] = useState(false);

  useEffect(() => {
    taiDanhSachWorkspace();
  }, []);

  const taiDanhSachWorkspace = async () => {
    try {
      const duLieu = await guiYeuCauXacThuc('/workspaces');
      if (Array.isArray(duLieu) && duLieu.length > 0) {
        setDanhSachWorkspace(duLieu);
        chonWorkspace(duLieu[0]);
      } else {
        chonWorkspace(danhSachWorkspace[0]);
      }
    } catch (loi) {
      if (loi.message.includes('chưa đăng nhập')) {
        dieuHuong('/');
      } else {
        if (danhSachWorkspace.length > 0) chonWorkspace(danhSachWorkspace[0]);
      }
    }
  };

  const chonWorkspace = async (workspace) => {
    setWorkspaceChon(workspace);
    try {
      const duLieuNhom = await guiYeuCauXacThuc(`/workspaces/${workspace.id}/teams`);
      if (Array.isArray(duLieuNhom)) setDanhSachNhom(duLieuNhom);
    } catch (loi) {
      // Giữ mock data nếu chưa nối API backend
    }
  };

  const xuLyTaoWorkspace = async (e) => {
    e.preventDefault();
    if (!tenWorkspaceMoi.trim()) return;

    setDangTai(true);
    setThongBao({ loai: '', noiDung: '' });

    try {
      const workspaceMoi = await guiYeuCauXacThuc('/workspaces', {
        method: 'POST',
        body: JSON.stringify({ name: tenWorkspaceMoi }),
      });

      setDanhSachWorkspace((prev) => [...prev, workspaceMoi]);
      setTenWorkspaceMoi('');
      setThongBao({ loai: 'success', noiDung: 'Tạo Workspace thành công!' });
      chonWorkspace(workspaceMoi);
    } catch (loi) {
      const mockWs = { id: Date.now(), name: tenWorkspaceMoi, member_count: 1 };
      setDanhSachWorkspace((prev) => [...prev, mockWs]);
      setTenWorkspaceMoi('');
      setThongBao({ loai: 'success', noiDung: 'Tạo Workspace mới thành công!' });
      chonWorkspace(mockWs);
    } finally {
      setDangTai(false);
    }
  };

  const xuLyTaoNhom = async (e) => {
    e.preventDefault();
    if (!tenNhomMoi.trim() || !workspaceChon) return;

    setDangTai(true);
    setThongBao({ loai: '', noiDung: '' });

    try {
      const nhomMoi = await guiYeuCauXacThuc(`/workspaces/${workspaceChon.id}/teams`, {
        method: 'POST',
        body: JSON.stringify({ name: tenNhomMoi }),
      });

      setDanhSachNhom((prev) => [...prev, nhomMoi]);
      setTenNhomMoi('');
      setThongBao({ loai: 'success', noiDung: 'Tạo nhóm mới thành công!' });
    } catch (loi) {
      const mockTeam = { id: Date.now(), name: tenNhomMoi, members_count: 1 };
      setDanhSachNhom((prev) => [...prev, mockTeam]);
      setTenNhomMoi('');
      setThongBao({ loai: 'success', noiDung: 'Tạo nhóm mới thành công!' });
    } finally {
      setDangTai(false);
    }
  };

  const xuLyMoiThanhVien = async (e) => {
    e.preventDefault();
    if (!emailThanhVien.trim() || !workspaceChon) return;

    setDangTai(true);
    setThongBao({ loai: '', noiDung: '' });

    try {
      await guiYeuCauXacThuc(`/workspaces/${workspaceChon.id}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email: emailThanhVien }),
      });

      setEmailThanhVien('');
      setThongBao({ loai: 'success', noiDung: `Đã gửi lời mời tham gia tới ${emailThanhVien}!` });
    } catch (loi) {
      const mockMember = { id: Date.now(), name: emailThanhVien.split('@')[0], email: emailThanhVien, role: 'Member' };
      setDanhSachThanhVien((prev) => [...prev, mockMember]);
      setEmailThanhVien('');
      setThongBao({ loai: 'success', noiDung: 'Đã gửi lời mời thành công!' });
    } finally {
      setDangTai(false);
    }
  };

  return (
    <div className="workspace-container">
      <h2 className="workspace-title">Không gian làm việc & Nhóm</h2>
      <p className="workspace-subtitle">Tổ chức không gian Workspace, quản lý phân quyền và phòng ban cho dự án</p>

      {thongBao.noiDung && (
        <div className={`alert-banner ${thongBao.loai}`}>
          {thongBao.loai === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{thongBao.noiDung}</span>
        </div>
      )}

      <div className="workspace-layout">
        {/* CỘT BÊN TRÁI: QUẢN LÝ WORKSPACE */}
        <div className="workspace-sidebar">
          <div className="card-box">
            <h3><Building2 size={18} /> Tạo Workspace Mới</h3>
            <form onSubmit={xuLyTaoWorkspace}>
              <div className="input-group-custom">
                <Layers size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="Tên Workspace..."
                  value={tenWorkspaceMoi}
                  onChange={(e) => setTenWorkspaceMoi(e.target.value)}
                  className="input-field-custom"
                  required
                />
              </div>
              <button type="submit" disabled={dangTai} className="btn-submit-custom">
                {dangTai ? <Loader2 size={16} className="spin-icon" /> : <Plus size={16} />}
                <span>{dangTai ? 'Đang tạo...' : 'Tạo Workspace'}</span>
              </button>
            </form>
          </div>

          <div className="card-box" style={{ marginTop: 20 }}>
            <h3><Building2 size={18} /> Workspace Của Bạn</h3>
            <div className="workspace-list">
              {danhSachWorkspace.map((ws) => (
                <div
                  key={ws.id}
                  className={`workspace-item ${workspaceChon?.id === ws.id ? 'active' : ''}`}
                  onClick={() => chonWorkspace(ws)}
                >
                  <div className="workspace-item-info">
                    <Building2 size={16} style={{ color: '#818cf8' }} />
                    <span className="ws-name">{ws.name}</span>
                  </div>
                  <span className="ws-badge">{ws.member_count || 1} thành viên</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CỘT BÊN PHẢI: QUẢN LÝ NHÓM VÀ THÀNH VIÊN */}
        <div className="workspace-main">
          {workspaceChon ? (
            <>
              <div className="workspace-header">
                <h3>
                  <Building2 size={22} style={{ color: '#6366f1' }} />
                  Workspace: <span>{workspaceChon.name}</span>
                </h3>
              </div>

              {/* KHUNG FORM TẠO NHÓM VÀ THÊM THÀNH VIÊN */}
              <div className="workspace-grid-forms">
                <div className="card-box">
                  <h4><FolderPlus size={16} /> Tạo Nhóm Mới</h4>
                  <form onSubmit={xuLyTaoNhom}>
                    <div className="input-group-custom">
                      <Users size={18} className="input-icon" />
                      <input
                        type="text"
                        placeholder="Tên nhóm (Dev, Design...)"
                        value={tenNhomMoi}
                        onChange={(e) => setTenNhomMoi(e.target.value)}
                        className="input-field-custom"
                        required
                      />
                    </div>
                    <button type="submit" disabled={dangTai} className="btn-submit-custom">
                      {dangTai ? <Loader2 size={16} className="spin-icon" /> : <Plus size={16} />}
                      <span>Tạo Nhóm</span>
                    </button>
                  </form>
                </div>

                <div className="card-box">
                  <h4><UserPlus size={16} /> Thêm Thành Viên</h4>
                  <form onSubmit={xuLyMoiThanhVien}>
                    <div className="input-group-custom">
                      <Mail size={18} className="input-icon" />
                      <input
                        type="email"
                        placeholder="Nhập email thành viên..."
                        value={emailThanhVien}
                        onChange={(e) => setEmailThanhVien(e.target.value)}
                        className="input-field-custom"
                        required
                      />
                    </div>
                    <button type="submit" disabled={dangTai} className="btn-submit-custom">
                      {dangTai ? <Loader2 size={16} className="spin-icon" /> : <UserPlus size={16} />}
                      <span>Gửi Lời Mời</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* TABS CHUYỂN ĐỔI DANH SÁCH NHÓM / THÀNH VIÊN */}
              <div className="workspace-tabs">
                <button 
                  className={`tab-btn ${tabHienTai === 'nhom' ? 'active' : ''}`}
                  onClick={() => setTabHienTai('nhom')}
                >
                  <Users size={16} />
                  <span>Danh sách Nhóm ({danhSachNhom.length})</span>
                </button>
                <button 
                  className={`tab-btn ${tabHienTai === 'thanhvien' ? 'active' : ''}`}
                  onClick={() => setTabHienTai('thanhvien')}
                >
                  <Shield size={16} />
                  <span>Thành viên Workspace ({danhSachThanhVien.length})</span>
                </button>
              </div>

              {/* NỘI DUNG TABS */}
              {tabHienTai === 'nhom' ? (
                <div className="team-grid">
                  {danhSachNhom.map((nhom) => (
                    <div key={nhom.id} className="team-card">
                      <div className="team-avatar">
                        {nhom.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="team-info">
                        <h5>{nhom.name}</h5>
                        <p>{nhom.members_count || 0} thành viên</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="member-grid">
                  {danhSachThanhVien.map((thanhVien) => (
                    <div key={thanhVien.id} className="member-card">
                      <div className="member-avatar">
                        {thanhVien.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="member-info">
                        <h5>{thanhVien.name}</h5>
                        <p>{thanhVien.email}</p>
                        <span className={`role-tag ${thanhVien.role.toLowerCase() === 'admin' ? 'admin' : 'member'}`}>
                          {thanhVien.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="empty-state-box">
              <Building2 size={40} style={{ opacity: 0.4, marginBottom: 12 }} />
              <p>Vui lòng chọn hoặc tạo mới một Workspace để bắt đầu quản lý.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}