import React, { useState, useEffect } from 'react';
import GroupKanbanBoard from './GroupKanbanBoard';
import { Users, Plus, Lock, Crown, Trash2, Shield, Mail, CheckCircle, Search, LayoutGrid, List, Clock, ArrowLeft, MessageSquare, Send, UserPlus } from 'lucide-react';

async function groupRequest(projectId, path = '', options = {}) {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('Bạn cần đăng nhập lại');
  const res = await fetch(`http://127.0.0.1:8000/api/projects/${encodeURIComponent(projectId)}/groups${path}`, {
    ...options, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers }
  });
  if (res.status === 204) return null;
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(typeof data?.detail === 'string' ? data.detail : 'Thao tác thất bại');
  return data;
}

export default function GroupManagement({ projectId, groups = [], setGroups, projectMembers = [], isProjectOwner = false,
  currentUserId, currentUserName = '', currentUserEmail = '', projectTasks = [], showNotification }) {
  const [newGroupName, setNewGroupName] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [kanbanGroupId, setKanbanGroupId] = useState(null);
  const selectedGroup = groups.find(g => g.id === selectedGroupId) || null;
  const setSelectedGroup = (g) => { setSelectedGroupId(g?.id || null); setKanbanGroupId(null); };
  const [inviteEmail, setInviteEmail] = useState('');
  const [groupMessages] = useState({}); // Chưa có API chat; không tạo dữ liệu giả
  const [chatInput, setChatInput] = useState('');
  const [saving, setSaving] = useState(false);
  const isLeaderOfGroup = g => !!g && (isProjectOwner || (!!currentUserId && g.leader_id === currentUserId));
  const notifyError = e => showNotification?.('loi', 'Không thực hiện được', e.message);
  const reload = async () => {
    if (!projectId) return;
    const data = await groupRequest(projectId);
    setGroups(Array.isArray(data) ? data : []);
  };
  useEffect(() => { setSelectedGroupId(null); setKanbanGroupId(null); setInviteEmail(''); reload().catch(notifyError); }, [projectId]);
  const mutate = async (fn, message) => {
    if (saving) return;
    setSaving(true);
    try { await fn(); await reload(); showNotification?.('thanh-cong', 'Thành công', message); }
    catch (e) { notifyError(e); }
    finally { setSaving(false); }
  };
  const handleCreateGroup = e => {
    e.preventDefault();
    const name = newGroupName.trim();
    if (!isProjectOwner || !name) return;
    mutate(async () => { await groupRequest(projectId, '', {method:'POST',body:JSON.stringify({name})}); setNewGroupName(''); }, `Đã tạo nhóm "${name}"`);
  };
  const handleAssignLeader = (groupId, userId) => {
    if (!isProjectOwner) return;
    mutate(() => groupRequest(projectId, `/${groupId}/leader`, {method:'PUT',body:JSON.stringify({user_id:userId || null})}), 'Đã cập nhật trưởng nhóm');
  };
  const handleSendInvite = groupId => {
    const group = groups.find(g => g.id === groupId);
    if (!isLeaderOfGroup(group)) return;
    const member = projectMembers.find(m => m.id === inviteEmail);
    if (!member) return showNotification?.('loi', 'Chưa chọn thành viên', 'Vui lòng chọn thành viên đã tham gia dự án.');
    mutate(async () => {
      await groupRequest(projectId, `/${groupId}/members`, {method:'POST',body:JSON.stringify({user_id:member.id})});
      setInviteEmail('');
    }, `Đã thêm ${member.name} vào nhóm`);
  };
  const handleRemoveMember = (groupId, memberId) => {
    const group = groups.find(g => g.id === groupId);
    if (!isLeaderOfGroup(group) || group?.leader_id === memberId) return;
    if (!window.confirm('Gỡ thành viên khỏi nhóm?')) return;
    mutate(() => groupRequest(projectId, `/${groupId}/members/${memberId}`, {method:'DELETE'}), 'Đã gỡ thành viên khỏi nhóm');
  };
  const handleDeleteGroup = (groupId, groupName) => {
    if (!isProjectOwner || !window.confirm(`Bạn có chắc muốn xóa nhóm "${groupName}" không?`)) return;
    mutate(async () => { await groupRequest(projectId, `/${groupId}`, {method:'DELETE'}); setSelectedGroup(null); }, `Đã xóa nhóm "${groupName}"`);
  };
  const handleSendMessage = e => {
    e.preventDefault();
    showNotification?.('can-bao', 'Chat chưa được kích hoạt', 'Cần bổ sung API và bảng lưu tin nhắn để sử dụng chat nội bộ.');
  };
  const filteredGroups = groups.filter(group => {
    const matchesKeyword = group.name.toLowerCase().includes(searchKeyword.toLowerCase()) || (group.leader || '').toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesRole = roleFilter === 'all' || (roleFilter === 'leader' && group.leader_id === currentUserId) || (roleFilter === 'unassigned' && !group.leader_id);
    return matchesKeyword && matchesRole;
  });
  const availableMembers = selectedGroup ? projectMembers.filter(m => !(selectedGroup.members || []).some(x => x.id === m.id)) : [];

  return (

    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '30px' }}>



      {/* ================= SECTION CHI TIẾT NHÓM (XUẤT HIỆN KHI BẤM VÀO NHÓM) ================= */}

      {selectedGroup && kanbanGroupId === selectedGroup.id ? (
        <GroupKanbanBoard
          projectId={projectId}
          group={selectedGroup}
          projectTasks={projectTasks}
          currentUserId={currentUserId}
          isProjectOwner={isProjectOwner}
          showNotification={showNotification}
          onBack={() => setKanbanGroupId(null)}
        />
      ) : selectedGroup ? (

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>



          {/* Nút quay lại danh sách nhóm */}

          <button

            onClick={() => setSelectedGroup(null)}

            style={{

              display: 'inline-flex',

              alignItems: 'center',

              gap: '8px',

              background: '#1e293b',

              color: '#38bdf8',

              border: '1px solid #334155',

              padding: '8px 16px',

              borderRadius: '8px',

              fontSize: '13px',

              fontWeight: 600,

              cursor: 'pointer',

              width: 'fit-content'

            }}

          >

            <ArrowLeft size={16} /> Quay lại Danh sách Nhóm

          </button>



          {/* Header nhóm chi tiết */}

          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

              <div style={{ width: '48px', height: '48px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>

                {selectedGroup.name.charAt(0).toUpperCase()}

              </div>

              <div>

                <h3 style={{ color: '#f8fafc', fontSize: '20px', margin: '0 0 4px 0', fontWeight: 700 }}>{selectedGroup.name}</h3>

                <span style={{ fontSize: '13px', color: '#94a3b8' }}>

                  Chi tiết phân quyền & Thảo luận nội bộ nhóm

                </span>

              </div>

            </div>



            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => setKanbanGroupId(selectedGroup.id)}
                style={{ background: '#4f46e5', border: '1px solid #6366f1', color: '#fff', padding: '9px 14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', fontSize: '13px', fontWeight: 600 }}
              >
                <LayoutGrid size={16} /> Mở Kanban của nhóm
              </button>
              {isProjectOwner && (

              <button

                onClick={() => handleDeleteGroup(selectedGroup.id, selectedGroup.name)}

                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}

              >

                <Trash2 size={16} /> Xóa Nhóm

              </button>

            )}
            </div>

          </div>



          {/* Bố cục 2 cột: Cột trái (Trưởng nhóm + Thành viên) - Cột phải (Chat Nội Bộ) */}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>



            {/* CỘT T TRÁI: QUẢN LÝ PHÂN QUYỀN & THÀNH VIÊN */}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>



              {/* 1. Trưởng nhóm phụ trách */}

              <div style={{ background: '#1e293b', padding: '16px', borderRadius: '16px', border: '1px solid #334155' }}>

                <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>

                  <Crown size={16} style={{ color: '#fbbf24' }} /> Trưởng nhóm phụ trách:

                </div>



                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#0f172a', padding: '12px', borderRadius: '10px', border: '1px solid #334155' }}>

                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#38bdf8', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', overflow: 'hidden', flexShrink: 0 }}>

                    {selectedGroup.leaderAvatar && selectedGroup.leaderAvatar.startsWith('http') ? (

                      <img src={selectedGroup.leaderAvatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                    ) : (

                      <span>{selectedGroup.leader ? selectedGroup.leader.charAt(0).toUpperCase() : "?"}</span>

                    )}

                  </div>

                  <div>

                    <div style={{ color: '#f8fafc', fontSize: '15px', fontWeight: 'bold' }}>

                      {selectedGroup.leader || "Chưa phân công"}

                    </div>

                    {selectedGroup.leaderEmail && (

                      <div style={{ color: '#94a3b8', fontSize: '12px' }}>{selectedGroup.leaderEmail}</div>

                    )}

                  </div>

                </div>



                {isProjectOwner && (

                  <div style={{ marginTop: '12px' }}>

                    <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>

                      Chỉ định Trưởng nhóm mới:

                    </label>

                    <select

                      value={selectedGroup.leader_id || ""}

                      onChange={(e) => handleAssignLeader(selectedGroup.id, e.target.value)}

                      style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '10px', borderRadius: '8px', fontSize: '13px', outline: 'none' }}

                    >

                      <option value="">-- Chọn thành viên làm Leader --</option>

                      {projectMembers.map((member) => (

                        <option key={member.id} value={member.id}>

                          {member.name} {member.email ? `(${member.email})` : ''}

                        </option>

                      ))}

                    </select>

                  </div>

                )}

              </div>



              {/* 2. Danh sách thành viên & Mời thành viên */}

              <div style={{ background: '#1e293b', padding: '16px', borderRadius: '16px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '12px' }}>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

                  <span style={{ fontSize: '14px', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>

                    <Users size={16} /> Danh Sách Thành Viên ({selectedGroup.members?.length || 0})

                  </span>

                </div>



                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>

                  {selectedGroup.members && selectedGroup.members.length > 0 ? (

                    selectedGroup.members.map((member) => {

                      const isMe = member.id === currentUserId;



                      return (

                        <div key={member.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#0f172a', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', color: '#f8fafc', border: '1px solid #334155' }}>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#64748b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 'bold' }}>

                              {member.name ? member.name.charAt(0).toUpperCase() : "U"}

                            </div>

                            <div>

                              <span style={{ fontWeight: 500 }}>{member.name} {isMe && "(Tôi)"}</span>

                              <div style={{ fontSize: '11px', color: '#94a3b8' }}>{member.email}</div>

                            </div>

                          </div>



                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>

                            {member.status === 'accepted' ? (

                              <span style={{ fontSize: '11px', color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>

                                <CheckCircle size={12} /> Đã vào nhóm

                              </span>

                            ) : member.status === 'pending_invite' ? (

                              isMe ? (

                                <div style={{ display: 'flex', gap: '4px' }}>

                                  <button

                                    disabled

                                    style={{ background: '#10b981', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}

                                  >

                                    Đồng ý

                                  </button>

                                  <button

                                    disabled

                                    style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}

                                  >

                                    Từ chối

                                  </button>

                                </div>

                              ) : (

                                <span style={{ fontSize: '11px', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>

                                  <Clock size={12} /> Chờ phản hồi

                                </span>

                              )

                            ) : (

                              <span style={{ fontSize: '11px', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>

                                Đã từ chối

                              </span>

                            )}



                            {isLeaderOfGroup(selectedGroup) && member.id !== selectedGroup.leader_id && (

                              <button

                                onClick={() => handleRemoveMember(selectedGroup.id, member.id)}

                                style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}

                                title="Gỡ khỏi nhóm"

                              >

                                <Trash2 size={14} />

                              </button>

                            )}

                          </div>

                        </div>

                      );

                    })

                  ) : (

                    <span style={{ fontSize: '12px', color: '#64748b', fontStyle: 'italic' }}>Chưa có thành viên nào.</span>

                  )}

                </div>



                {isLeaderOfGroup(selectedGroup) && (

                  <div style={{ borderTop: '1px solid #334155', paddingTop: '12px', marginTop: '4px' }}>

                    <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>

                      <Mail size={14} /> Thêm thành viên đã tham gia dự án:

                    </label>

                    <div style={{ display: 'flex', gap: '8px' }}>

                      <select value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                        style={{ flex: 1, background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none' }}>
                        <option value="">-- Chọn thành viên trong dự án --</option>
                        {availableMembers.map(m => <option key={m.id} value={m.id}>{m.name}{m.email ? ` (${m.email})` : ''}</option>)}
                      </select>

                      <button

                        type="button"

                        onClick={() => handleSendInvite(selectedGroup.id)}

                        style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}

                      >

                        Thêm

                      </button>

                    </div>

                  </div>

                )}

              </div>



            </div>



            {/* CỘT PHẢI: KHUNG CHAT NỘI BỘ DÀNH RIÊNG CHO NHÓM NÀY */}

            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', height: '420px' }}>

              <div style={{ fontSize: '15px', color: '#34d399', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>

                <MessageSquare size={18} /> Thảo Luận Nội Bộ - {selectedGroup.name}

              </div>



              {/* Danh sách tin nhắn */}

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', paddingRight: '4px' }}>

                {(groupMessages[selectedGroup.id] || []).length > 0 ? (

                  groupMessages[selectedGroup.id].map((msg) => {

                    const laToi = msg.sender === currentUserName;

                    return (

                      <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: laToi ? 'flex-end' : 'flex-start' }}>

                        <span style={{ fontSize: '10px', color: '#64748b', marginBottom: '2px' }}>{msg.sender} • {msg.time}</span>

                        <div style={{ 

                          background: laToi ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)' : '#0f172a', 

                          color: '#f8fafc', 

                          padding: '8px 12px', 

                          borderRadius: '10px', 

                          fontSize: '13px',

                          border: laToi ? 'none' : '1px solid #334155',

                          maxWidth: '80%',

                          wordBreak: 'break-word'

                        }}>

                          {msg.text}

                        </div>

                      </div>

                    );

                  })

                ) : (

                  <div style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', marginTop: 'auto', marginBottom: 'auto', fontStyle: 'italic' }}>

                    Chat nội bộ chưa kết nối Backend. Tin nhắn sẽ được hỗ trợ ở giai đoạn tiếp theo.

                  </div>

                )}

              </div>



              {/* Input nhắn tin */}

              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', borderTop: '1px solid #334155', paddingTop: '10px' }}>

                <input

                  type="text"

                  placeholder="Chat sẽ hoạt động sau khi có API lưu tin nhắn" disabled

                  value={chatInput}

                  onChange={(e) => setChatInput(e.target.value)}

                  style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#f8fafc', fontSize: '13px', outline: 'none' }}

                />

                <button type="submit" disabled style={{ background: '#10b981', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>

                  <Send size={15} />

                </button>

              </form>

            </div>



          </div>



        </div>

      ) : (

        /* ================= SECTION DANH SÁCH TẤT CẢ CÁC NHÓM ================= */

        <>

          {/* KHUNG TẠO NHÓM MỚI */}

          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>

            <h4 style={{ color: '#f8fafc', fontSize: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px', margin: '0 0 12px 0' }}>

              <Users size={20} style={{ color: '#38bdf8' }} /> Khởi Tạo Nhóm Làm Việc Mới

            </h4>



            {isProjectOwner ? (

              <form onSubmit={handleCreateGroup} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>

                <div className="nhom-nhap-lieu" style={{ flex: 1, minWidth: '240px', margin: 0 }}>

                  <Users size={16} className="bieu-tuong-input" />

                  <input

                    type="text"

                    placeholder="Nhập tên nhóm (VD: Nhóm Frontend, Đội DevOps...)"

                    value={newGroupName}

                    onChange={(e) => setNewGroupName(e.target.value)}

                    className="o-nhap-lieu"

                    required

                    style={{ width: '100%' }}

                  />

                </div>

                <button type="submit" className="nut-chinh" style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}>

                  <Plus size={16} /> Tạo Nhóm Ngay

                </button>

              </form>

            ) : (

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '13px', background: '#0f172a', padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155' }}>

                <Lock size={15} style={{ color: '#fbbf24', flexShrink: 0 }} />

                <span>Chỉ có <strong>Chủ dự án (Owner)</strong> mới có quyền khởi tạo nhóm mới và chỉ định Trưởng nhóm.</span>

              </div>

            )}

          </div>



          {/* THANH CÔNG CỤ & DANH SÁCH NHÓM */}

          <div className="khung-danh-sach-du-an" style={{ background: 'transparent', padding: 0, border: 'none' }}>

            <div className="thanh-tieu-de-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>



              <div className="nhom-tieu-de" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                <Shield size={20} className="icon-tieu-de" style={{ color: '#34d399' }} />

                <h3 style={{ color: '#f8fafc', fontSize: '18px', margin: 0 }}>Danh Sách Nhóm Trong Dự Án ({filteredGroups.length})</h3>

              </div>



              <div className="nhom-cong-cu" style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>

                <div className="khung-tim-kiem" style={{ display: 'flex', alignItems: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', padding: '6px 12px', gap: '8px' }}>

                  <Search size={16} className="icon-tim-kiem" style={{ color: '#94a3b8' }} />

                  <input

                    type="text"

                    placeholder="Tìm kiếm nhóm hoặc trưởng nhóm..."

                    value={searchKeyword}

                    onChange={(e) => setSearchKeyword(e.target.value)}

                    style={{ background: 'transparent', border: 'none', color: '#f8fafc', outline: 'none', fontSize: '13px' }}

                  />

                </div>



                <select

                  className="bo-loc-select"

                  value={roleFilter}

                  onChange={(e) => setRoleFilter(e.target.value)}

                  style={{ background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none', cursor: 'pointer' }}

                >

                  <option value="all">Tất cả nhóm</option>

                  <option value="leader">Nhóm tôi phụ trách</option>

                  <option value="unassigned">Chưa phân công trưởng nhóm</option>

                </select>



                <div className="chuyen-che-do-xem" style={{ display: 'flex', background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', overflow: 'hidden' }}>

                  <button

                    className={`nut-che-do ${viewMode === "grid" ? "dang-chon" : ""}`}

                    onClick={() => setViewMode("grid")}

                    style={{ background: viewMode === "grid" ? '#334155' : 'transparent', border: 'none', color: '#f8fafc', padding: '8px 10px', cursor: 'pointer' }}

                  >

                    <LayoutGrid size={16} />

                  </button>

                  <button

                    className={`nut-che-do ${viewMode === "list" ? "dang-chon" : ""}`}

                    onClick={() => setViewMode("list")}

                    style={{ background: viewMode === "list" ? '#334155' : 'transparent', border: 'none', color: '#f8fafc', padding: '8px 10px', cursor: 'pointer' }}

                  >

                    <List size={16} />

                  </button>

                </div>

              </div>

            </div>



            {filteredGroups.length === 0 ? (

              <div style={{ textAlign: 'center', padding: '40px', background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', color: '#94a3b8' }}>

                <Users size={36} style={{ marginBottom: '8px', opacity: 0.5 }} />

                <p style={{ margin: 0 }}>Không tìm thấy nhóm nào phù hợp.</p>

              </div>

            ) : viewMode === "grid" ? (

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>

                {filteredGroups.map((group) => {

                  return (

                    <div 

                      key={group.id} 

                      onClick={() => setSelectedGroup(group)}

                      style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.2s ease', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}

                      className="the-nhom-item"

                    >

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>

                        <div style={{ width: '42px', height: '42px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px' }}>

                          {group.name.charAt(0).toUpperCase()}

                        </div>

                        <div>

                          <h5 style={{ color: '#f8fafc', fontSize: '16px', margin: '0 0 4px 0', fontWeight: 600 }}>{group.name}</h5>

                          <span style={{ fontSize: '12px', color: '#94a3b8' }}>

                            Trưởng nhóm: <strong style={{ color: '#fbbf24' }}>{group.leader || "Chưa phân công"}</strong> • {group.members?.length || 0} thành viên

                          </span>

                        </div>

                      </div>



                      {isProjectOwner && (

                        <button

                          onClick={(e) => {

                            e.stopPropagation();

                            handleDeleteGroup(group.id, group.name);

                          }}

                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '6px 8px', borderRadius: '8px', cursor: 'pointer' }}

                          title="Xóa nhóm"

                        >

                          <Trash2 size={15} />

                        </button>

                      )}

                    </div>

                  );

                })}

              </div>

            ) : (

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

                {filteredGroups.map((group) => {

                  return (

                    <div 

                      key={group.id} 

                      onClick={() => setSelectedGroup(group)}

                      style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '12px', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}

                    >

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>

                        <div style={{ width: '40px', height: '40px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px' }}>

                          {group.name.charAt(0).toUpperCase()}

                        </div>

                        <div>

                          <h5 style={{ color: '#f8fafc', fontSize: '15px', margin: '0 0 4px 0', fontWeight: 600 }}>{group.name}</h5>

                          <span style={{ fontSize: '12px', color: '#fbbf24' }}>

                            Trưởng nhóm: {group.leader || "Chưa phân công"} • Thành viên: {group.members?.length || 0}

                          </span>

                        </div>

                      </div>



                      {isProjectOwner && (

                        <button

                          onClick={(e) => {

                            e.stopPropagation();

                            handleDeleteGroup(group.id, group.name);

                          }}

                          style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}

                          title="Xóa nhóm"

                        >

                          <Trash2 size={15} />

                        </button>

                      )}

                    </div>

                  );

                })}

              </div>

            )}

          </div>

        </>

      )}



    </div>

  );

}