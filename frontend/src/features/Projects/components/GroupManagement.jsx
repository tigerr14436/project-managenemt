import React, { useState } from 'react';
import { 
  Users, Plus, Lock, Crown, Trash2, Shield, Mail, 
  CheckCircle, Search, LayoutGrid, List, Clock, 
  ArrowLeft, MessageSquare, Send, UserPlus 
} from 'lucide-react';

export default function GroupManagement({
  groups,
  setGroups,
  projectMembers,
  isProjectOwner,
  currentUserName,
  currentUserEmail = "shutheast@devtask.vn",
  showNotification
}) {
  const [newGroupName, setNewGroupName] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  // State quản lý nhóm đang được chọn để xem Section chi tiết (null = đang ở Danh sách nhóm)
  const [selectedGroup, setSelectedGroup] = useState(null);

  // State lưu trữ email nhập vào để mời
  const [inviteEmail, setInviteEmail] = useState("");

  // State tin nhắn chat riêng biệt theo ID từng nhóm
  const [groupMessages, setGroupMessages] = useState({
    101: [
      { id: 1, sender: 'Nguyễn Văn A', text: 'Chào mọi người, API backend đã sẵn sàng!', time: '10:30 AM' }
    ],
    102: [
      { id: 1, sender: 'Trần Thị B', text: 'Team Frontend check lại giao diện nhé.', time: '11:00 AM' }
    ]
  });
  const [chatInput, setChatInput] = useState("");

  const isLeaderOfGroup = (group) => {
    if (!group) return false;
    return isProjectOwner || group.leader === currentUserName;
  };

  // 1. TẠO NHÓM MỚI
  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!isProjectOwner) {
      showNotification?.("loi", "Từ chối", "Chỉ Chủ dự án mới có quyền khởi tạo nhóm mới!");
      return;
    }
    if (!newGroupName.trim()) return;

    const newGrpId = Date.now();
    const newGrp = {
      id: newGrpId,
      name: newGroupName.trim(),
      leader: "Chưa phân công",
      leaderEmail: "",
      leaderAvatar: "",
      members: [
        { id: Date.now(), name: currentUserName, email: currentUserEmail, role: "Owner", status: "accepted" }
      ]
    };

    setGroups((prev) => [...prev, newGrp]);
    setGroupMessages((prev) => ({ ...prev, [newGrpId]: [] }));
    setNewGroupName("");
    showNotification?.("thanh-cong", "Thành công", `Đã tạo nhóm "${newGrp.name}"`);
  };

  // 2. CHỈ ĐỊNH TRƯỞNG NHÓM (Lấy Tên, Email, Avatar)
  const handleAssignLeader = (groupId, memberName) => {
    if (!isProjectOwner) {
      showNotification?.("loi", "Từ chối", "Chỉ Chủ dự án mới có quyền chỉ định Trưởng nhóm!");
      return;
    }

    const member = projectMembers.find((m) => m.name === memberName);

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const updated = {
            ...g,
            leader: memberName,
            leaderEmail: member?.email || "",
            leaderAvatar: member?.avatar || memberName.charAt(0).toUpperCase()
          };
          if (selectedGroup?.id === groupId) setSelectedGroup(updated);
          return updated;
        }
        return g;
      })
    );

    showNotification?.("thanh-cong", "Đã cập nhật", `Đã chỉ định ${memberName} làm Trưởng nhóm.`);
  };

  // 3. MỜI THÀNH VIÊN VÀO NHÓM (Bắt buộc @gmail.com)
  const handleSendInvite = (groupId) => {
    if (!inviteEmail || !inviteEmail.trim()) {
      showNotification?.("loi", "Lỗi", "Vui lòng nhập email trước khi mời.");
      return;
    }

    const trimmedEmail = inviteEmail.trim().toLowerCase();
    const gmailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!gmailRegex.test(trimmedEmail)) {
      showNotification?.("loi", "Sai định dạng", "Email mời phải có đúng định dạng Gmail (vd: tentaikhoan@gmail.com)!");
      return;
    }

    const targetGroup = groups.find(g => g.id === groupId);
    if (!targetGroup) return;

    if (!isLeaderOfGroup(targetGroup)) {
      showNotification?.("loi", "Từ chối", "Bạn không có quyền mời thành viên vào nhóm này!");
      return;
    }

    const existing = targetGroup.members?.find(m => m.email.toLowerCase() === trimmedEmail);
    if (existing) {
      showNotification?.("can-bao", "Thông báo", "Email này đã nằm trong danh sách của nhóm.");
      return;
    }

    const newMemberInvite = {
      id: Date.now(),
      name: trimmedEmail.split('@')[0],
      email: trimmedEmail,
      role: "Member",
      status: "pending_invite"
    };

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const updated = { ...g, members: [...(g.members || []), newMemberInvite] };
          if (selectedGroup?.id === groupId) setSelectedGroup(updated);
          return updated;
        }
        return g;
      })
    );

    setInviteEmail("");
    showNotification?.("thanh-cong", "Gửi lời mời thành công", `Đã gửi thiệp mời đến Gmail: ${trimmedEmail}`);
  };

  // 4. CHẤP NHẬN / TỪ CHỐI LỜI MỜI
  const handleRespondInvite = (groupId, memberId, accept) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const updatedMembers = g.members.map(m => {
            if (m.id === memberId) {
              return { ...m, status: accept ? "accepted" : "rejected" };
            }
            return m;
          });
          const updated = { ...g, members: updatedMembers };
          if (selectedGroup?.id === groupId) setSelectedGroup(updated);
          return updated;
        }
        return g;
      })
    );

    showNotification?.(
      accept ? "thanh-cong" : "can-bao",
      accept ? "Đã tham gia nhóm" : "Đã từ chối",
      accept ? "Bạn đã chấp nhận lời mời tham gia nhóm thành công." : "Bạn đã từ chối lời mời."
    );
  };

  // 5. GỠ THÀNH VIÊN KHỎI NHÓM
  const handleRemoveMember = (groupId, memberId) => {
    const targetGroup = groups.find(g => g.id === groupId);
    if (!targetGroup) return;

    if (!isLeaderOfGroup(targetGroup)) {
      showNotification?.("loi", "Từ chối", "Bạn không có quyền quản lý thành viên nhóm này!");
      return;
    }

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          const updated = { ...g, members: (g.members || []).filter(m => m.id !== memberId) };
          if (selectedGroup?.id === groupId) setSelectedGroup(updated);
          return updated;
        }
        return g;
      })
    );
    showNotification?.("can-bao", "Đã xóa", "Đã gỡ thành viên khỏi nhóm.");
  };

  // 6. XÓA NHÓM
  const handleDeleteGroup = (groupId, groupName) => {
    if (!isProjectOwner) {
      showNotification?.("loi", "Từ chối", "Chỉ Chủ dự án mới có quyền xóa nhóm!");
      return;
    }

    if (window.confirm(`Bạn có chắc chắn muốn xóa nhóm "${groupName}" không?`)) {
      setGroups((prev) => prev.filter(g => g.id !== groupId));
      if (selectedGroup?.id === groupId) setSelectedGroup(null);
      showNotification?.("can-bao", "Đã xóa", `Đã xóa nhóm "${groupName}".`);
    }
  };

  // 7. GỬI TIN NHẮN CHAT NỘI BỘ
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedGroup) return;

    const newMessage = {
      id: Date.now(),
      sender: currentUserName,
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setGroupMessages((prev) => ({
      ...prev,
      [selectedGroup.id]: [...(prev[selectedGroup.id] || []), newMessage]
    }));

    setChatInput("");
  };

  const filteredGroups = groups.filter((group) => {
    const matchesKeyword = group.name.toLowerCase().includes(searchKeyword.toLowerCase()) || 
                           group.leader.toLowerCase().includes(searchKeyword.toLowerCase());
    
    let matchesRole = true;
    if (roleFilter === "leader") {
      matchesRole = group.leader === currentUserName;
    } else if (roleFilter === "unassigned") {
      matchesRole = group.leader === "Chưa phân công";
    }
    return matchesKeyword && matchesRole;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '30px' }}>
      
      {/* ================= SECTION CHI TIẾT NHÓM (XUẤT HIỆN KHI BẤM VÀO NHÓM) ================= */}
      {selectedGroup ? (
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

            {isProjectOwner && (
              <button
                onClick={() => handleDeleteGroup(selectedGroup.id, selectedGroup.name)}
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
              >
                <Trash2 size={16} /> Xóa Nhóm
              </button>
            )}
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
                      value={selectedGroup.leader}
                      onChange={(e) => handleAssignLeader(selectedGroup.id, e.target.value)}
                      style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '10px', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                    >
                      <option value="Chưa phân công">-- Chọn thành viên làm Leader --</option>
                      {projectMembers.map((member) => (
                        <option key={member.id} value={member.name}>
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
                      const isMe = member.email === currentUserEmail;

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
                                    onClick={() => handleRespondInvite(selectedGroup.id, member.id, true)}
                                    style={{ background: '#10b981', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                                  >
                                    Đồng ý
                                  </button>
                                  <button
                                    onClick={() => handleRespondInvite(selectedGroup.id, member.id, false)}
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

                            {isLeaderOfGroup(selectedGroup) && (
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
                      <Mail size={14} /> Mời thành viên qua Gmail (@gmail.com):
                    </label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="email"
                        placeholder="vd: user@gmail.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        style={{ flex: 1, background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '8px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSendInvite(selectedGroup.id)}
                        style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Mời
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
                    Chưa có tin nhắn nào trong nhóm này. Hãy gửi tin nhắn đầu tiên!
                  </div>
                )}
              </div>

              {/* Input nhắn tin */}
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px', borderTop: '1px solid #334155', paddingTop: '10px' }}>
                <input
                  type="text"
                  placeholder="Nhập tin nhắn nội bộ..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  style={{ flex: 1, background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', padding: '8px 12px', color: '#f8fafc', fontSize: '13px', outline: 'none' }}
                />
                <button type="submit" style={{ background: '#10b981', border: 'none', color: '#fff', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
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