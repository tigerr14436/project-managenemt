import React from 'react';
import { Shield, Lock, Trash2 } from 'lucide-react';

export default function MemberPermissions({ memberList, setMemberList, showNotification }) {
  return (
    <div className="khung-phan-quyen">
      <div className="header-phan-quyen">
        <h3><Shield size={20} style={{ color: '#818cf8' }} /> Quản lý Phân Quyền Thành Viên</h3>
        <span className="nhan-ma-moi">Tổng số: {memberList.length} thành viên</span>
      </div>
      <p className="tieu-de-phu" style={{ marginBottom: '20px' }}>Thiết lập quyền hạn truy cập, chỉnh sửa và quản trị cho từng thành viên trong dự án</p>

      <div className="bang-thanh-vien-wrapper">
        <table className="bang-phan-quyen">
          <thead>
            <tr>
              <th>Thành viên</th>
              <th>Email</th>
              <th>Vai trò (Role)</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {memberList.map((member) => (
              <tr key={member.id}>
                <td>
                  <div className="cell-thanh-vien">
                    <div className="avatar-thanh-vien-nho">{member.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <p className="ten-thanh-vien-table">{member.name}</p>
                    </div>
                  </div>
                </td>
                <td><span className="email-thanh-vien-table">{member.email}</span></td>
                <td>
                  <select
                    className="select-vai-tro"
                    defaultValue={member.role}
                    onChange={(e) => {
                      showNotification('thanh-cong', 'Đổi quyền thành công', `Đã cập nhật vai trò của ${member.name} thành ${e.target.value}`);
                    }}
                  >
                    <option value="Owner">Quản trị viên (Owner)</option>
                    <option value="Member">Thành viên (Member)</option>
                    <option value="Viewer">Người xem (Viewer)</option>
                  </select>
                </td>
                <td>
                  <button
                    className="nut-thu-hoi"
                    onClick={() => {
                      if (window.confirm(`Bạn muốn xóa ${member.name} khỏi dự án?`)) {
                        setMemberList(prev => prev.filter(item => item.id !== member.id));
                        showNotification('can-bao', 'Đã thu hồi quyền', `Đã gỡ ${member.name} khỏi dự án`);
                      }
                    }}
                  >
                    <Trash2 size={13} /> Xóa khỏi dự án
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ma-trix-grid">
        <div className="card-matrix">
          <h5>Quản trị viên (Owner)</h5>
          <ul>
            <li>Toàn quyền quản lý dự án</li>
            <li>Thêm / xóa thành viên & phân quyền</li>
            <li>Xóa dự án hoặc cấu hình hệ thống</li>
          </ul>
        </div>
        <div className="card-matrix">
          <h5>Thành viên (Member)</h5>
          <ul>
            <li>Tạo và chỉnh sửa Task / Kanban</li>
            <li>Cập nhật trạng thái công việc</li>
            <li>Bình luận và trao đổi trong task</li>
          </ul>
        </div>
        <div className="card-matrix">
          <h5>Người xem (Viewer)</h5>
          <ul>
            <li>Chỉ được xem tiến độ dự án</li>
            <li>Không thể tạo hoặc sửa Task</li>
            <li>Xem danh sách thành viên nhóm</li>
          </ul>
        </div>
      </div>
    </div>
  );
}