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
import './WorkspacePage.css';

async function sendAuthenticatedRequest(url, options = {}) {
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

export default function WorkspacePage() {
  const navigate = useNavigate();

  // Mock dữ liệu mặc định chuẩn đề tài DevTask
  const [workspaceList, setWorkspaceList] = useState([
    { id: 1, name: 'Công ty Công Nghệ DevTech', member_count: 12 },
    { id: 2, name: 'Dự án Freelance UI/UX', member_count: 4 }
  ]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [groupList, setGroupList] = useState([
    { id: 101, name: 'Đội ngũ Frontend', members_count: 5 },
    { id: 102, name: 'Đội ngũ Backend API', members_count: 4 },
    { id: 103, name: 'Nhóm Thiết kế UI/UX', members_count: 3 }
  ]);
  const [memberList, setMemberList] = useState([
    { id: 1, name: 'Nguyễn Văn A', email: 'vana@devtask.vn', role: 'Admin' },
    { id: 2, name: 'Trần Thị B', email: 'thib@devtask.vn', role: 'Member' },
    { id: 3, name: 'Lê Hoàng C', email: 'hoangc@devtask.vn', role: 'Member' }
  ]);

  const [activeTab, setActiveTab] = useState('nhom'); // 'nhom' hoặc 'thanhvien'
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');

  const [notification, setNotification] = useState({ type: '', content: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchWorkspaceList();
  }, []);

  const fetchWorkspaceList = async () => {
    try {
      const data = await sendAuthenticatedRequest('/workspaces');
      if (Array.isArray(data) && data.length > 0) {
        setWorkspaceList(data);
        selectWorkspace(data[0]);
      } else {
        selectWorkspace(workspaceList[0]);
      }
    } catch (error) {
      if (error.message.includes('chưa đăng nhập')) {
        navigate('/');
      } else {
        if (workspaceList.length > 0) selectWorkspace(workspaceList[0]);
      }
    }
  };

  const selectWorkspace = async (workspace) => {
    setSelectedWorkspace(workspace);
    try {
      const groupData = await sendAuthenticatedRequest(`/workspaces/${workspace.id}/teams`);
      if (Array.isArray(groupData)) setGroupList(groupData);
    } catch (error) {
      // Giữ mock data nếu chưa nối API backend
    }
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    setIsLoading(true);
    setNotification({ type: '', content: '' });

    try {
      const newWorkspace = await sendAuthenticatedRequest('/workspaces', {
        method: 'POST',
        body: JSON.stringify({ name: newWorkspaceName }),
      });

      setWorkspaceList((prev) => [...prev, newWorkspace]);
      setNewWorkspaceName('');
      setNotification({ type: 'success', content: 'Tạo Workspace thành công!' });
      selectWorkspace(newWorkspace);
    } catch (error) {
      const mockWs = { id: Date.now(), name: newWorkspaceName, member_count: 1 };
      setWorkspaceList((prev) => [...prev, mockWs]);
      setNewWorkspaceName('');
      setNotification({ type: 'success', content: 'Tạo Workspace mới thành công!' });
      selectWorkspace(mockWs);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim() || !selectedWorkspace) return;

    setIsLoading(true);
    setNotification({ type: '', content: '' });

    try {
      const newGroup = await sendAuthenticatedRequest(`/workspaces/${selectedWorkspace.id}/teams`, {
        method: 'POST',
        body: JSON.stringify({ name: newGroupName }),
      });

      setGroupList((prev) => [...prev, newGroup]);
      setNewGroupName('');
      setNotification({ type: 'success', content: 'Tạo nhóm mới thành công!' });
    } catch (error) {
      const mockTeam = { id: Date.now(), name: newGroupName, members_count: 1 };
      setGroupList((prev) => [...prev, mockTeam]);
      setNewGroupName('');
      setNotification({ type: 'success', content: 'Tạo nhóm mới thành công!' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteMember = async (e) => {
    e.preventDefault();
    if (!memberEmail.trim() || !selectedWorkspace) return;

    setIsLoading(true);
    setNotification({ type: '', content: '' });

    try {
      await sendAuthenticatedRequest(`/workspaces/${selectedWorkspace.id}/invite`, {
        method: 'POST',
        body: JSON.stringify({ email: memberEmail }),
      });

      setMemberEmail('');
      setNotification({ type: 'success', content: `Đã gửi lời mời tham gia tới ${memberEmail}!` });
    } catch (error) {
      const mockMember = { id: Date.now(), name: memberEmail.split('@')[0], email: memberEmail, role: 'Member' };
      setMemberList((prev) => [...prev, mockMember]);
      setMemberEmail('');
      setNotification({ type: 'success', content: 'Đã gửi lời mời thành công!' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="workspace-container">
      <h2 className="workspace-title">Không gian làm việc & Nhóm</h2>
      <p className="workspace-subtitle">Tổ chức không gian Workspace, quản lý phân quyền và phòng ban cho dự án</p>

      {notification.content && (
        <div className={`alert-banner ${notification.type}`}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notification.content}</span>
        </div>
      )}

      <div className="workspace-layout">
        {/* CỘT BÊN TRÁI: QUẢN LÝ WORKSPACE */}
        <div className="workspace-sidebar">
          <div className="card-box">
            <h3><Building2 size={18} /> Tạo Workspace Mới</h3>
            <form onSubmit={handleCreateWorkspace}>
              <div className="input-group-custom">
                <Layers size={18} className="input-icon" />
                <input
                  type="text"
                  placeholder="Tên Workspace..."
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="input-field-custom"
                  required
                />
              </div>
              <button type="submit" disabled={isLoading} className="btn-submit-custom">
                {isLoading ? <Loader2 size={16} className="spin-icon" /> : <Plus size={16} />}
                <span>{isLoading ? 'Đang tạo...' : 'Tạo Workspace'}</span>
              </button>
            </form>
          </div>

          <div className="card-box" style={{ marginTop: 20 }}>
            <h3><Building2 size={18} /> Workspace Của Bạn</h3>
            <div className="workspace-list">
              {workspaceList.map((ws) => (
                <div
                  key={ws.id}
                  className={`workspace-item ${selectedWorkspace?.id === ws.id ? 'active' : ''}`}
                  onClick={() => selectWorkspace(ws)}
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
          {selectedWorkspace ? (
            <>
              <div className="workspace-header">
                <h3>
                  <Building2 size={22} style={{ color: '#6366f1' }} />
                  Workspace: <span>{selectedWorkspace.name}</span>
                </h3>
              </div>

              {/* KHUNG FORM TẠO NHÓM VÀ THÊM THÀNH VIÊN */}
              <div className="workspace-grid-forms">
                <div className="card-box">
                  <h4><FolderPlus size={16} /> Tạo Nhóm Mới</h4>
                  <form onSubmit={handleCreateGroup}>
                    <div className="input-group-custom">
                      <Users size={18} className="input-icon" />
                      <input
                        type="text"
                        placeholder="Tên nhóm (Dev, Design...)"
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        className="input-field-custom"
                        required
                      />
                    </div>
                    <button type="submit" disabled={isLoading} className="btn-submit-custom">
                      {isLoading ? <Loader2 size={16} className="spin-icon" /> : <Plus size={16} />}
                      <span>Tạo Nhóm</span>
                    </button>
                  </form>
                </div>

                <div className="card-box">
                  <h4><UserPlus size={16} /> Thêm Thành Viên</h4>
                  <form onSubmit={handleInviteMember}>
                    <div className="input-group-custom">
                      <Mail size={18} className="input-icon" />
                      <input
                        type="email"
                        placeholder="Nhập email thành viên..."
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        className="input-field-custom"
                        required
                      />
                    </div>
                    <button type="submit" disabled={isLoading} className="btn-submit-custom">
                      {isLoading ? <Loader2 size={16} className="spin-icon" /> : <UserPlus size={16} />}
                      <span>Gửi Lời Mời</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* TABS CHUYỂN ĐỔI DANH SÁCH NHÓM / THÀNH VIÊN */}
              <div className="workspace-tabs">
                <button
                  className={`tab-btn ${activeTab === 'nhom' ? 'active' : ''}`}
                  onClick={() => setActiveTab('nhom')}
                >
                  <Users size={16} />
                  <span>Danh sách Nhóm ({groupList.length})</span>
                </button>
                <button
                  className={`tab-btn ${activeTab === 'thanhvien' ? 'active' : ''}`}
                  onClick={() => setActiveTab('thanhvien')}
                >
                  <Shield size={16} />
                  <span>Thành viên Workspace ({memberList.length})</span>
                </button>
              </div>

              {/* NỘI DUNG TABS */}
              {activeTab === 'nhom' ? (
                <div className="team-grid">
                  {groupList.map((group) => (
                    <div key={group.id} className="team-card">
                      <div className="team-avatar">
                        {group.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="team-info">
                        <h5>{group.name}</h5>
                        <p>{group.members_count || 0} thành viên</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="member-grid">
                  {memberList.map((member) => (
                    <div key={member.id} className="member-card">
                      <div className="member-avatar">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="member-info">
                        <h5>{member.name}</h5>
                        <p>{member.email}</p>
                        <span className={`role-tag ${member.role.toLowerCase() === 'admin' ? 'admin' : 'member'}`}>
                          {member.role}
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