import React from 'react';
import { Building2, Users, UserPlus, Mail, Shield, Plus, FolderPlus } from 'lucide-react';

export default function WorkspacePanel({
  groupList,
  memberList,
  workspaceTab,
  setWorkspaceTab,
  newGroupName,
  setNewGroupName,
  memberEmail,
  setMemberEmail,
  handleCreateGroupInline,
  handleInviteMemberInline
}) {
  return (
    <div className="phan-workspace-tich-hop">
      <div className="header-workspace-row">
        <h3><Building2 size={20} /> Không gian làm việc & Nhóm dự án</h3>
      </div>

      <div className="luoi-workspace-inline">
        <div className="the-box-inline">
          <h4><FolderPlus size={16} /> Tạo Nhóm Làm Việc</h4>
          <form onSubmit={handleCreateGroupInline}>
            <div className="nhom-nhap-lieu">
              <Users size={18} className="bieu-tuong-input" />
              <input
                type="text"
                placeholder="Tên nhóm (Frontend, Backend...)"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="o-nhap-lieu"
                required
              />
            </div>
            <button type="submit" className="nut-chinh" style={{ width: '100%', marginTop: '12px' }}>
              <Plus size={16} /> Tạo Nhóm
            </button>
          </form>
        </div>

        <div className="the-box-inline">
          <h4><UserPlus size={16} /> Mời Thành Viên</h4>
          <form onSubmit={handleInviteMemberInline}>
            <div className="nhom-nhap-lieu">
              <Mail size={18} className="bieu-tuong-input" />
              <input
                type="email"
                placeholder="Email thành viên..."
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                className="o-nhap-lieu"
                required
              />
            </div>
            <button type="submit" className="nut-phu" style={{ width: '100%', marginTop: '12px' }}>
              <UserPlus size={16} /> Gửi Lời Mời
            </button>
          </form>
        </div>
      </div>

      <div className="tab-workspace-inline">
        <button
          className={`nut-tab-inline ${workspaceTab === 'nhom' ? 'dang-chon' : ''}`}
          onClick={() => setWorkspaceTab('nhom')}
        >
          <Users size={14} /> Danh sách Nhóm ({groupList.length})
        </button>
        <button
          className={`nut-tab-inline ${workspaceTab === 'thanhvien' ? 'dang-chon' : ''}`}
          onClick={() => setWorkspaceTab('thanhvien')}
        >
          <Shield size={14} /> Thành viên ({memberList.length})
        </button>
      </div>

      {workspaceTab === 'nhom' ? (
        <div className="luoi-nhom-inline">
          {groupList.map((group) => (
            <div key={group.id} className="the-nhom-inline">
              <div className="avatar-nhom-inline">{group.name.charAt(0).toUpperCase()}</div>
              <div className="thong-tin-nhom">
                <h5>{group.name}</h5>
                <p>{group.members_count || 1} thành viên</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="luoi-thanh-vien-inline">
          {memberList.map((member) => (
            <div key={member.id} className="the-thanh-vien-inline">
              <div className="avatar-thanh-vien-inline">{member.name.charAt(0).toUpperCase()}</div>
              <div className="thong-tin-thanh-vien">
                <h5>{member.name}</h5>
                <p>{member.email}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}