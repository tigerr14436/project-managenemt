import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TrangWorkspace.css';

export default function TrangWorkspace() {
  const dieuHuong = useNavigate();

  const [danhSachWorkspace, setDanhSachWorkspace] = useState([]);
  const [workspaceChon, setWorkspaceChon] = useState(null);
  const [danhSachNhom, setDanhSachNhom] = useState([]);

  // Form states
  const [tenWorkspaceMoi, setTenWorkspaceMoi] = useState('');
  const [tenNhomMoi, setTenNhomMoi] = useState('');
  const [emailThanhVien, setEmailThanhVien] = useState('');

  const [thongBao, setThongBao] = useState({ loai: '', noiDung: '' });
  const [dangTai, setDangTai] = useState(false);

  useEffect(() => {
    taiDanhSachWorkspace();
  }, []);

  // Tải danh sách Workspace
  const taiDanhSachWorkspace = async () => {
    try {
      const duLieu = await guiYeuCauXacThuc('/workspaces');
      setDanhSachWorkspace(duLieu);
      if (duLieu.length > 0 && !workspaceChon) {
        chonWorkspace(duLieu[0]);
      }
    } catch (loi) {
      if (loi.message.includes('chưa đăng nhập')) {
        dieuHuong('/dang-nhap');
      } else {
        setThongBao({ loai: 'error', noiDung: loi.message });
      }
    }
  };

  // Chọn Workspace để xem danh sách Nhóm tương ứng
  const chonWorkspace = async (workspace) => {
    setWorkspaceChon(workspace);
    try {
      const duLieuNhom = await guiYeuCauXacThuc(`/workspaces/${workspace.id}/teams`);
      setDanhSachNhom(duLieuNhom);
    } catch (loi) {
      setThongBao({ loai: 'error', noiDung: loi.message });
    }
  };

  // 1. Tạo Workspace Mới
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
      setThongBao({ loai: 'error', noiDung: loi.message });
    } finally {
      setDangTai(false);
    }
  };

  // 2. Tạo Nhóm mới trong Workspace hiện tại
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
      setThongBao({ loai: 'success', noiDung: 'Tạo nhóm thành công!' });
    } catch (loi) {
      setThongBao({ loai: 'error', noiDung: loi.message });
    } finally {
      setDangTai(false);
    }
  };

  // 3. Mời thành viên vào Workspace
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
      setThongBao({ loai: 'success', noiDung: 'Đã gửi lời mời tham gia!' });
    } catch (loi) {
      setThongBao({ loai: 'error', noiDung: loi.message });
    } finally {
      setDangTai(false);
    }
  };

  return (
    <div className="workspace-container">
      <h2 className="workspace-title">Không gian làm việc & Nhóm</h2>

      {thongBao.noiDung && (
        <p className={`alert-text ${thongBao.loai}`}>{thongBao.noiDung}</p>
      )}

      <div className="workspace-layout">
        {/* CỘT BÊN TRÁI: DANH SÁCH WORKSPACE & TẠO WORKSPACE */}
        <div className="workspace-sidebar">
          <div className="card-box">
            <h3>Tạo Workspace Mới</h3>
            <form onSubmit={xuLyTaoWorkspace}>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Tên Workspace..."
                  value={tenWorkspaceMoi}
                  onChange={(e) => setTenWorkspaceMoi(e.target.value)}
                  className="input-field"
                />
              </div>
              <button type="submit" disabled={dangTai} className="btn-submit">
                {dangTai ? 'Đang tạo...' : '+ Tạo Workspace'}
              </button>
            </form>
          </div>

          <div className="card-box" style={{ marginTop: 20 }}>
            <h3>Workspace của bạn</h3>
            <div className="workspace-list">
              {danhSachWorkspace.map((ws) => (
                <div
                  key={ws.id}
                  className={`workspace-item ${workspaceChon?.id === ws.id ? 'active' : ''}`}
                  onClick={() => chonWorkspace(ws)}
                >
                  <span className="ws-icon">🏢</span>
                  <span className="ws-name">{ws.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CỘT BÊN PHẢI: CHI TIẾT WORKSPACE VÀ QUẢN LÝ NHÓM */}
        <div className="workspace-main">
          {workspaceChon ? (
            <>
              <div className="workspace-header">
                <h3>Workspace: <span>{workspaceChon.name}</span></h3>
              </div>

              <div className="workspace-grid-forms">
                {/* Form Tạo Nhóm */}
                <div className="card-box">
                  <h4>Tạo Nhóm Mới</h4>
                  <form onSubmit={xuLyTaoNhom}>
                    <div className="input-group">
                      <input
                        type="text"
                        placeholder="Tên nhóm (Dev, Design, Marketing...)"
                        value={tenNhomMoi}
                        onChange={(e) => setTenNhomMoi(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <button type="submit" disabled={dangTai} className="btn-submit">
                      {dangTai ? 'Đang xử lý...' : '+ Tạo Nhóm'}
                    </button>
                  </form>
                </div>

                {/* Form Mời Thành Viên */}
                <div className="card-box">
                  <h4>Thêm Thành Viên</h4>
                  <form onSubmit={xuLyMoiThanhVien}>
                    <div className="input-group">
                      <input
                        type="email"
                        placeholder="Nhập email người dùng..."
                        value={emailThanhVien}
                        onChange={(e) => setEmailThanhVien(e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <button type="submit" disabled={dangTai} className="btn-submit">
                      {dangTai ? 'Đang gửi...' : 'Gửi lời mời'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Danh sách nhóm */}
              <div className="team-section">
                <h4>Danh sách Nhóm ({danhSachNhom.length})</h4>
                <div className="team-list">
                  {danhSachNhom.map((nhom) => (
                    <div key={nhom.id} className="team-item">
                      <div className="team-info">
                        <span className="team-icon">👥</span>
                        <div>
                          <h5 className="team-name">{nhom.name}</h5>
                          <p className="team-sub">{nhom.members_count || 0} thành viên</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {danhSachNhom.length === 0 && (
                    <p className="empty-text">Chưa có nhóm nào trong Workspace này.</p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-workspace">
              <p>Vui lòng chọn hoặc tạo mới một Workspace để bắt đầu.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}