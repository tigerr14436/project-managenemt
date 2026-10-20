import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users, UserPlus, Mail, Plus, FolderPlus, Trash2, ArrowLeft, FolderKanban, ExternalLink, Clock, Check, X, UserCheck, UserX } from 'lucide-react';

async function sendAuthenticatedRequest(apiPath, options = {}) {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("Người dùng chưa đăng nhập");

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const response = await fetch(`http://127.0.0.1:8000/api${apiPath}`, {
    ...options,
    headers,
  });
  if (response.status === 204) return null;

  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data?.detail || "Đã có lỗi xảy ra");
  return data;
}

export default function GroupManagement() {
  const navigate = useNavigate();

  // Giả lập tài khoản đang đăng nhập hiện tại
  const currentUserEmail = "shutheast@devtask.vn"; 

  const [projectList, setProjectList] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [groupList, setGroupList] = useState([
    { id: 101, name: "Đội ngũ Frontend", members_count: 3, project_id: 1, current_project: "DevTask Dashboard v2.0" },
    { id: 102, name: "Đội ngũ Backend API", members_count: 2, project_id: 2, current_project: "Hệ thống xác thực OAuth2" },
  ]);

  const [selectedGroup, setSelectedGroup] = useState(null);

  const [groupMembers, setGroupMembers] = useState({
    101: [
      { id: 1, name: "Nguyễn Văn A", email: "vana@devtask.vn", role: "Owner", status: "accepted" },
      { id: 2, name: "Trần Thị B", email: "thib@devtask.vn", role: "Member", status: "accepted" },
      { id: 3, name: "Lê Hoàng C", email: "hoangc@devtask.vn", role: "Viewer", status: "pending_invite" },
      { id: 6, name: "Vũ Văn X", email: "vux@devtask.vn", role: "Member", status: "pending_approval" },
    ],
    102: [
      { id: 4, name: "Shut Heast", email: "shutheast@devtask.vn", role: "Owner", status: "accepted" },
      { id: 5, name: "Phạm Văn D", email: "vand@devtask.vn", role: "Member", status: "pending_invite" },
    ]
  });

  const [newGroupName, setNewGroupName] = useState("");
  const [memberEmail, setMemberEmail] = useState("");
  const [joinGroupCode, setJoinGroupCode] = useState("");

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const data = await sendAuthenticatedRequest("/projects");
      if (data && data.length > 0) {
        setProjectList(data);
        setSelectedProjectId(data[0].id.toString());
      } else {
        setProjectList([
          { id: 1, name: "DevTask Dashboard v2.0" },
          { id: 2, name: "Hệ thống xác thực OAuth2" },
          { id: 3, name: "Ứng dụng Mobile iOS & Android" },
        ]);
        setSelectedProjectId("1");
      }
    } catch {
      setProjectList([
        { id: 1, name: "DevTask Dashboard v2.0" },
        { id: 2, name: "Hệ thống xác thực OAuth2" },
        { id: 3, name: "Ứng dụng Mobile iOS & Android" },
      ]);
      setSelectedProjectId("1");
    }
  };

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const matchedProject = projectList.find(p => p.id.toString() === selectedProjectId);
    const newId = Date.now();

    setGroupList((prev) => [
      ...prev,
      { 
        id: newId, 
        name: newGroupName.trim(), 
        members_count: 1, 
        project_id: matchedProject ? matchedProject.id : null,
        current_project: matchedProject ? matchedProject.name : "Chưa gán dự án" 
      },
    ]);

    setGroupMembers((prev) => ({
      ...prev,
      [newId]: [{ id: Date.now(), name: "Shut Heast", email: currentUserEmail, role: "Owner", status: "accepted" }]
    }));

    setNewGroupName("");
  };

  const handleInviteMember = (e) => {
    e.preventDefault();
    if (!memberEmail.trim() || !selectedGroup) return;

    const newMember = {
      id: Date.now(),
      name: memberEmail.split("@")[0],
      email: memberEmail,
      role: "Member",
      status: "pending_invite" 
    };

    setGroupMembers((prev) => ({
      ...prev,
      [selectedGroup.id]: [...(prev[selectedGroup.id] || []), newMember]
    }));

    setGroupList((prev) => prev.map(g => g.id === selectedGroup.id ? { ...g, members_count: g.members_count + 1 } : g));
    setMemberEmail("");
  };

  const handleRequestJoinGroup = (e) => {
    e.preventDefault();
    if (!joinGroupCode.trim()) return;

    const targetGroup = groupList.find(g => g.name.toLowerCase().includes(joinGroupCode.trim().toLowerCase()) || g.id.toString() === joinGroupCode.trim());
    
    if (!targetGroup) {
      alert("Không tìm thấy nhóm với tên hoặc mã này!");
      return;
    }

    const requestMember = {
      id: Date.now(),
      name: "Shut Heast (Tôi)",
      email: currentUserEmail,
      role: "Member",
      status: "pending_approval"
    };

    setGroupMembers((prev) => ({
      ...prev,
      [targetGroup.id]: [...(prev[targetGroup.id] || []), requestMember]
    }));

    setGroupList((prev) => prev.map(g => g.id === targetGroup.id ? { ...g, members_count: g.members_count + 1 } : g));
    setJoinGroupCode("");
    alert(`Đã gửi yêu cầu tham gia nhóm "${targetGroup.name}". Vui lòng chờ chủ nhóm phê duyệt!`);
  };

  const handleUpdateStatus = (memberId, newStatus) => {
    if (!selectedGroup) return;
    setGroupMembers((prev) => ({
      ...prev,
      [selectedGroup.id]: prev[selectedGroup.id].map(m => m.id === memberId ? { ...m, status: newStatus } : m)
    }));
  };

  const handleNavigateToProject = (e, projectId) => {
    e.stopPropagation();
    if (projectId) {
      navigate('/project');
    }
  };

  return (
    <div className="khung-quan-ly-du-an" style={{ padding: '20px' }}>
      {selectedGroup ? (
        <div>
          <button 
            className="nut-quay-lai" 
            onClick={() => setSelectedGroup(null)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px' }}
          >
            <ArrowLeft size={16} /> Quay lại danh sách nhóm
          </button>

          <div className="tieu-de-trang-quan-ly">
            <h2 className="tieu-de-chinh">
              <Building2 size={24} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#38bdf8' }} /> 
              Nhóm: {selectedGroup.name}
            </h2>
            <p className="tieu-de-phu" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
              <FolderKanban size={14} style={{ color: '#34d399' }} /> 
              Dự án đang làm: 
              <button 
                onClick={(e) => handleNavigateToProject(e, selectedGroup.project_id)}
                style={{ background: 'transparent', border: 'none', color: '#34d399', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
              >
                {selectedGroup.current_project} <ExternalLink size={12} />
              </button>
            </p>
          </div>

          <div className="the-box-inline" style={{ marginTop: '20px', marginBottom: '24px', padding: '16px', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}>
            <h4 style={{ fontSize: '14px', color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UserPlus size={16} /> Mời thành viên vào nhóm (Chủ nhóm mời)
            </h4>
            <form onSubmit={handleInviteMember} style={{ display: 'flex', gap: '10px' }}>
              <div className="nhom-nhap-lieu" style={{ flex: 1 }}>
                <Mail size={18} className="bieu-tuong-input" />
                <input
                  type="email"
                  placeholder="Nhập email thành viên cần mời..."
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="o-nhap-lieu"
                  required
                />
              </div>
              <button type="submit" className="nut-chinh" style={{ padding: '8px 16px' }}>
                Gửi lời mời
              </button>
            </form>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', color: '#f8fafc', marginBottom: '14px' }}>
              Thành viên trong nhóm ({groupMembers[selectedGroup.id]?.length || 0})
            </h3>
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#0f172a', color: '#94a3b8', fontSize: '13px' }}>
                    <th style={{ padding: '12px 16px' }}>Thành viên</th>
                    <th style={{ padding: '12px 16px' }}>Email</th>
                    <th style={{ padding: '12px 16px' }}>Vai trò (Role)</th>
                    <th style={{ padding: '12px 16px' }}>Trạng thái / Phê duyệt</th>
                    <th style={{ padding: '12px 16px' }}>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {(groupMembers[selectedGroup.id] || []).map((member) => {
                    const isCurrentUser = member.email === currentUserEmail;

                    return (
                      <tr key={member.id} style={{ borderTop: '1px solid #334155', fontSize: '13px' }}>
                        <td style={{ padding: '12px 16px', color: '#f8fafc', fontWeight: 500 }}>{member.name}</td>
                        <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{member.email}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <select 
                            defaultValue={member.role} 
                            style={{ background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '6px 10px', borderRadius: '6px', outline: 'none' }}
                          >
                            <option value="Owner">Quản trị viên (Owner)</option>
                            <option value="Member">Thành viên (Member)</option>
                            <option value="Viewer">Người xem (Viewer)</option>
                          </select>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          {member.status === 'pending_invite' ? (
                            <span style={{ color: '#fbbf24', background: 'rgba(245, 158, 11, 0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Clock size={12} /> Chờ thành viên đồng ý
                            </span>
                          ) : member.status === 'pending_approval' ? (
                            <span style={{ color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <UserCheck size={12} /> Chờ chủ nhóm duyệt
                            </span>
                          ) : member.status === 'accepted' ? (
                            <span style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                              <Check size={12} /> Đã tham gia
                            </span>
                          ) : (
                            <span style={{ color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}>
                              Đã từ chối
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {/* 1. CHỦ NHÓM DUYỆT THÀNH VIÊN XIN VÀO (pending_approval) */}
                            {member.status === 'pending_approval' && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(member.id, 'accepted')}
                                  title="Phê duyệt cho vào nhóm"
                                  style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.2)', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}
                                >
                                  <Check size={13} /> Duyệt
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(member.id, 'rejected')}
                                  title="Từ chối yêu cầu"
                                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}
                                >
                                  <X size={13} /> Từ chối
                                </button>
                              </>
                            )}

                            {/* 2. CHỈ TÀI KHOẢN ĐƯỢC MỜI MỚI THẤY NÚT ĐỒNG Ý / TỪ CHỐI */}
                            {member.status === 'pending_invite' && isCurrentUser && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(member.id, 'accepted')}
                                  title="Chấp nhận lời mời tham gia nhóm"
                                  style={{ background: 'rgba(52, 211, 153, 0.1)', color: '#34d399', border: '1px solid rgba(52, 211, 153, 0.2)', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}
                                >
                                  <Check size={13} /> Đồng ý
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(member.id, 'rejected')}
                                  title="Từ chối lời mời"
                                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 8px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600 }}
                                >
                                  <X size={13} /> Từ chối
                                </button>
                              </>
                            )}

                            {/* 3. CHỦ NHÓM CHỈ CÓ NÚT HỦY LỜI MỜI/XÓA KHỎI NHÓM */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Xóa / Hủy lời mời ${member.name}?`)) {
                                  setGroupMembers(prev => ({
                                    ...prev,
                                    [selectedGroup.id]: prev[selectedGroup.id].filter(m => m.id !== member.id)
                                  }));
                                  setGroupList(prev => prev.map(g => g.id === selectedGroup.id ? { ...g, members_count: g.members_count - 1 } : g));
                                }
                              }}
                              style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' }}
                              title="Xóa thành viên / Hủy lời mời"
                            >
                              <Trash2 size={13} style={{ verticalAlign: 'middle' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="tieu-de-trang-quan-ly">
            <h2 className="tieu-de-chinh">
              <Building2 size={24} style={{ marginRight: '8px', verticalAlign: 'middle', color: '#38bdf8' }} /> 
              Quản Lý Nhóm
            </h2>
            <p className="tieu-de-phu">Chọn nhóm để quản lý, tạo nhóm mới hoặc gửi yêu cầu xin tham gia nhóm</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '20px', marginBottom: '30px' }}>
            <div className="the-box-inline" style={{ padding: '16px', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', margin: 0 }}>
              <h4 style={{ fontSize: '14px', color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FolderPlus size={16} /> Tạo Nhóm Mới & Gán Dự Án
              </h4>
              <form onSubmit={handleCreateGroup} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="nhom-nhap-lieu">
                  <Users size={18} className="bieu-tuong-input" />
                  <input
                    type="text"
                    placeholder="Tên nhóm mới..."
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    className="o-nhap-lieu"
                    required
                  />
                </div>

                <div className="nhom-nhap-lieu">
                  <FolderKanban size={18} className="bieu-tuong-input" />
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="o-nhap-lieu"
                    style={{ cursor: 'pointer' }}
                  >
                    {projectList.map((project) => (
                      <option key={project.id} value={project.id} style={{ background: '#0f172a', color: '#f8fafc' }}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button type="submit" className="nut-chinh" style={{ padding: '8px 16px', justifyContent: 'center' }}>
                  <Plus size={16} /> Tạo Nhóm
                </button>
              </form>
            </div>

            <div className="the-box-inline" style={{ padding: '16px', background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', margin: 0 }}>
              <h4 style={{ fontSize: '14px', color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <UserCheck size={16} /> Xin Tham Gia Nhóm (Thành viên)
              </h4>
              <form onSubmit={handleRequestJoinGroup} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className="nhom-nhap-lieu">
                  <Users size={18} className="bieu-tuong-input" />
                  <input
                    type="text"
                    placeholder="Nhập tên nhóm hoặc ID nhóm..."
                    value={joinGroupCode}
                    onChange={(e) => setJoinGroupCode(e.target.value)}
                    className="o-nhap-lieu"
                    required
                  />
                </div>
                <p style={{ color: '#94a3b8', fontSize: '11px', margin: 0 }}>Khi gửi yêu cầu, trạng thái sẽ chờ chủ nhóm phê duyệt.</p>
                <button type="submit" className="nut-phu" style={{ padding: '8px 16px', justifyContent: 'center', marginTop: '6px' }}>
                  <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} /> Gửi Yêu Cầu Xin Vào
                </button>
              </form>
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', color: '#f8fafc', marginBottom: '14px' }}>Danh sách Nhóm ({groupList.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {groupList.map((group) => (
                <div
                  key={group.id}
                  onClick={() => setSelectedGroup(group)}
                  style={{ background: '#1e293b', border: '1px solid #334155', padding: '16px', borderRadius: '12px', display: 'flex', alignItems: 'flex-start', gap: '14px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                >
                  <div style={{ width: '44px', height: '44px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '10px', fontWeight: 'bold', fontSize: '18px', flexShrink: 0 }}>
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: '0' }}>
                    <h5 style={{ margin: '0 0 4px 0', color: '#f8fafc', fontSize: '15px' }}>{group.name}</h5>
                    <p 
                      onClick={(e) => handleNavigateToProject(e, group.project_id)}
                      style={{ margin: '0 0 6px 0', color: '#34d399', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      title="Bấm để truy cập dự án này"
                    >
                      <FolderKanban size={12} /> {group.current_project} <ExternalLink size={10} />
                    </p>
                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Users size={12} /> {groupMembers[group.id]?.length || group.members_count} thành viên
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}