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
  ExternalLink,
  LayoutGrid,
  List,
  CheckSquare,
  ArrowLeft,
  Plus,
  Clock,
  User,
  X,
  Info,
  AlertTriangle,
  BarChart2,
  ChevronRight
} from 'lucide-react';
import './TrangDuAn.css';

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
  
  const [danhSachDuAn, setDanhSachDuAn] = useState([
    { id: 1, name: 'Hệ thống E-Commerce DevTask', join_code: 'DEV-8892', role: 'Owner', member_count: 5, status: 'active', tasks: { completed: 3, total: 6 } },
    { id: 2, name: 'Ứng dụng Mobile Banking', join_code: 'MB-1029', role: 'Member', member_count: 8, status: 'active', tasks: { completed: 1, total: 4 } },
    { id: 3, name: 'Website Quản lý Nhân sự HR', join_code: 'HR-5541', role: 'Owner', member_count: 3, status: 'completed', tasks: { completed: 4, total: 4 } }
  ]);

  const [kanbanTasks, setKanbanTasks] = useState({
    1: [
      { id: 101, title: 'Thiết kế Giao diện Checkout', desc: 'Tối ưu luồng thanh toán VNPay và Momo', status: 'todo', priority: 'high', assignee: 'Nguyễn Văn A', dueDate: '15/10' },
      { id: 102, title: 'Tích hợp API Authentication', desc: 'Viết JWT OAuth2 backend API', status: 'in_progress', priority: 'medium', assignee: 'Trần Thị B', dueDate: '12/10' },
      { id: 103, title: 'Viết Unit Test cho Order Service', desc: 'Bao phủ >80% code coverage', status: 'review', priority: 'low', assignee: 'Lê Văn C', dueDate: '18/10' },
      { id: 104, title: 'Cấu hình Server Docker CI/CD', desc: 'Triển khai lên VPS Staging', status: 'done', priority: 'high', assignee: 'Phạm Văn D', dueDate: '08/10' },
      { id: 105, title: 'Tối ưu cơ sở dữ liệu PostgreSQL', desc: 'Thêm Index cho bảng Orders', status: 'done', priority: 'medium', assignee: 'Nguyễn Văn A', dueDate: '09/10' },
      { id: 106, title: 'Thiết kế Banner Quảng cáo', desc: 'Xuất file SVG và PNG', status: 'done', priority: 'low', assignee: 'Trần Thị B', dueDate: '10/10' },
    ],
    2: [
      { id: 201, title: 'Xác thực sinh trắc học FaceID', desc: 'Tích hợp SDK Chế độ an toàn', status: 'todo', priority: 'high', assignee: 'Hoàng Văn E', dueDate: '20/10' },
      { id: 202, title: 'Giao diện Chuyển tiền nhanh', desc: 'Thêm QR Code VietQR', status: 'in_progress', priority: 'medium', assignee: 'Đỗ Thị F', dueDate: '14/10' },
      { id: 203, title: 'Kiểm tra bảo mật OWASP Top 10', desc: 'Scan lỗ hổng bảo mật', status: 'review', priority: 'high', assignee: 'Hoàng Văn E', dueDate: '22/10' },
      { id: 204, title: 'Tạo tài liệu API Swagger', desc: 'Cập nhật endpoint v2', status: 'done', priority: 'low', assignee: 'Đỗ Thị F', dueDate: '05/10' },
    ],
    3: [
      { id: 301, title: 'Chấm công GPS & Wifi', desc: 'Lưu tọa độ check-in nhân viên', status: 'done', priority: 'high', assignee: 'Vũ Văn G', dueDate: '01/10' },
      { id: 302, title: 'Tính lương & Thuế TNCN', desc: 'Xuất file Excel tổng hợp', status: 'done', priority: 'high', assignee: 'Vũ Văn G', dueDate: '03/10' },
      { id: 303, title: 'Gửi Email Thông báo Lương', desc: 'Template Email HTML', status: 'done', priority: 'medium', assignee: 'Bùi Thị H', dueDate: '04/10' },
      { id: 304, title: 'Phân quyền Role & Permission', desc: 'RBAC chi tiết phòng ban', status: 'done', priority: 'medium', assignee: 'Bùi Thị H', dueDate: '05/10' },
    ]
  });

  const [duAnDangChon, setDuAnDangChon] = useState(null);

  const [tenDuAnMoi, setTenDuAnMoi] = useState('');
  const [maThamGia, setMaThamGia] = useState('');
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState('');
  const [boLocTrangThai, setBoLocTrangThai] = useState('all');
  const [cheDoXem, setCheDoXem] = useState('grid'); 

  const [hienModalTask, setHienModalTask] = useState(false);
  const [cotTaskHienTai, setCotTaskHienTai] = useState('todo');
  const [taskForm, setTaskForm] = useState({ title: '', desc: '', priority: 'medium', assignee: '', dueDate: '' });

  const [toasts, setToasts] = useState([]);
  const [dangTai, setDangTai] = useState(false);
  const [daSaoChep, setDaSaoChep] = useState(null);

  useEffect(() => {
    taiDanhSachDuAn();
  }, []);

  const showToast = (type, title, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const taiDanhSachDuAn = async () => {
    try {
      const duLieu = await guiYeuCauXacThuc('/projects');
      if (Array.isArray(duLieu) && duLieu.length > 0) {
        setDanhSachDuAn(duLieu);
      }
    } catch (loi) {
      if (loi.message.includes('chưa đăng nhập')) {
        dieuHuong('/');
      }
    }
  };

  const xuLyTaoDuAn = async (e) => {
    e.preventDefault();
    if (!tenDuAnMoi.trim()) return;

    setDangTai(true);
    try {
      const duAnMoi = await guiYeuCauXacThuc('/projects', {
        method: 'POST',
        body: JSON.stringify({ name: tenDuAnMoi }),
      });
      setDanhSachDuAn((prev) => [duAnMoi, ...prev]);
      showToast('success', 'Thành công', `Đã khởi tạo dự án "${tenDuAnMoi}"`);
    } catch (loi) {
      const mockProject = {
        id: Date.now(),
        name: tenDuAnMoi,
        join_code: `DEV-${Math.floor(1000 + Math.random() * 9000)}`,
        role: 'Owner',
        member_count: 1,
        status: 'active',
        tasks: { completed: 0, total: 0 }
      };
      setDanhSachDuAn((prev) => [mockProject, ...prev]);
      setKanbanTasks((prev) => ({ ...prev, [mockProject.id]: [] }));
      showToast('success', 'Tạo dự án thành công', `Không gian làm việc "${tenDuAnMoi}" sẵn sàng`);
    } finally {
      setTenDuAnMoi('');
      setDangTai(false);
    }
  };

  const xuLyThamGiaDuAn = async (e) => {
    e.preventDefault();
    if (!maThamGia.trim()) return;

    setDangTai(true);
    try {
      const duAnDaThamGia = await guiYeuCauXacThuc('/projects/join', {
        method: 'POST',
        body: JSON.stringify({ join_code: maThamGia.trim() }),
      });
      setDanhSachDuAn((prev) => [duAnDaThamGia, ...prev]);
      showToast('success', 'Tham gia thành công', 'Bạn đã được thêm vào dự án mới');
    } catch (loi) {
      showToast('error', 'Lỗi tham gia', 'Mã tham gia không chính xác hoặc bạn đã trong dự án');
    } finally {
      setMaThamGia('');
      setDangTai(false);
    }
  };

  const saoChepMaMoi = (code, id) => {
    navigator.clipboard.writeText(code);
    setDaSaoChep(id);
    showToast('info', 'Đã sao chép', `Mã tham gia ${code} đã lưu vào bộ nhớ tạm`);
    setTimeout(() => setDaSaoChep(null), 2000);
  };

  const xuLyXoaDuAn = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa/rời khỏi dự án "${name}"?`)) return;

    try {
      await guiYeuCauXacThuc(`/projects/${id}`, { method: 'DELETE' });
    } catch (loi) {
      // Ignore API fail for demo UI
    }
    setDanhSachDuAn((prev) => prev.filter((item) => item.id !== id));
    if (duAnDangChon?.id === id) setDuAnDangChon(null);
    showToast('warning', 'Đã xóa dự án', `Đã gỡ bỏ "${name}" khỏi danh sách`);
  };

  const chuyenTrangThaiTask = (taskId, targetStatus) => {
    if (!duAnDangChon) return;
    const projId = duAnDangChon.id;
    const currentTasks = kanbanTasks[projId] || [];

    const updated = currentTasks.map((t) => t.id === taskId ? { ...t, status: targetStatus } : t);
    setKanbanTasks((prev) => ({ ...prev, [projId]: updated }));

    const completedCount = updated.filter(t => t.status === 'done').length;
    setDanhSachDuAn((prev) => prev.map(p => p.id === projId ? {
      ...p,
      tasks: { completed: completedCount, total: updated.length }
    } : p));

    showToast('info', 'Cập nhật tiến độ', 'Đã chuyển trạng thái công việc');
  };

  const xuLyThemTaskMoi = (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !duAnDangChon) return;

    const projId = duAnDangChon.id;
    const newTask = {
      id: Date.now(),
      title: taskForm.title,
      desc: taskForm.desc || 'Chưa có mô tả chi tiết',
      status: cotTaskHienTai,
      priority: taskForm.priority,
      assignee: taskForm.assignee || 'Chưa phân công',
      dueDate: taskForm.dueDate || 'Hôm nay'
    };

    const updated = [...(kanbanTasks[projId] || []), newTask];
    setKanbanTasks((prev) => ({ ...prev, [projId]: updated }));

    const completedCount = updated.filter(t => t.status === 'done').length;
    setDanhSachDuAn((prev) => prev.map(p => p.id === projId ? {
      ...p,
      tasks: { completed: completedCount, total: updated.length }
    } : p));

    showToast('success', 'Thêm công việc', `Đã tạo "${newTask.title}"`);
    setHienModalTask(false);
    setTaskForm({ title: '', desc: '', priority: 'medium', assignee: '', dueDate: '' });
  };

  const danhSachLoc = danhSachDuAn.filter((duAn) => {
    const khopTuKhoa = duAn.name.toLowerCase().includes(tuKhoaTimKiem.toLowerCase()) ||
                       duAn.join_code.toLowerCase().includes(tuKhoaTimKiem.toLowerCase());
    const khopTrangThai = boLocTrangThai === 'all' || duAn.status === boLocTrangThai;
    return khopTuKhoa && khopTrangThai;
  });

  const currentProjectTasks = duAnDangChon ? (kanbanTasks[duAnDangChon.id] || []) : [];

  return (
    <div className="projects-container">
      {/* SYSTEM TOAST NOTIFICATIONS NỔI */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-item ${toast.type}`}>
            <div className="toast-icon">
              {toast.type === 'success' && <CheckCircle2 size={20} />}
              {toast.type === 'error' && <AlertCircle size={20} />}
              {toast.type === 'info' && <Info size={20} />}
              {toast.type === 'warning' && <AlertTriangle size={20} />}
            </div>
            <div className="toast-content">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-message">{toast.message}</div>
            </div>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {/* CHẾ ĐỘ 1: BẢNG KANBAN CHI TIẾT */}
      {duAnDangChon ? (
        <div className="kanban-view-section">
          <div className="kanban-view-header">
            <button className="btn-back-projects" onClick={() => setDuAnDangChon(null)}>
              <ArrowLeft size={16} />
              <span>Quay lại Danh sách Dự án</span>
            </button>

            <div className="kanban-project-title-area">
              <div className="project-avatar">{duAnDangChon.name.charAt(0).toUpperCase()}</div>
              <div>
                <h3 className="kanban-project-title">{duAnDangChon.name}</h3>
                <span className="code-label">Mã tham gia: <strong style={{ color: '#38bdf8' }}>{duAnDangChon.join_code}</strong></span>
              </div>
            </div>

            <button 
              className="btn-primary-custom"
              onClick={() => { setCotTaskHienTai('todo'); setHienModalTask(true); }}
            >
              <Plus size={16} />
              <span>Tạo Task Mới</span>
            </button>
          </div>

          {/* THANH THỐNG KÊ NHANH CỦA DỰ ÁN */}
          <div className="kanban-stats-bar">
            <div className="stat-card">
              <div className="stat-icon-bg" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
                <FolderKanban size={20} />
              </div>
              <div className="stat-info">
                <h5>Tổng công việc</h5>
                <p>{currentProjectTasks.length} Tasks</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-bg" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
                <Clock size={20} />
              </div>
              <div className="stat-info">
                <h5>Đang thực hiện</h5>
                <p>{currentProjectTasks.filter(t => t.status === 'in_progress').length} Tasks</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-bg" style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399' }}>
                <CheckSquare size={20} />
              </div>
              <div className="stat-info">
                <h5>Hoàn thành</h5>
                <p>{currentProjectTasks.filter(t => t.status === 'done').length} Tasks</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon-bg" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
                <BarChart2 size={20} />
              </div>
              <div className="stat-info">
                <h5>Tiến độ dự án</h5>
                <p>
                  {currentProjectTasks.length > 0 
                    ? Math.round((currentProjectTasks.filter(t => t.status === 'done').length / currentProjectTasks.length) * 100) 
                    : 0}%
                </p>
              </div>
            </div>
          </div>

          {/* BẢNG KANBAN 4 CỘT TIẾN ĐỘ */}
          <div className="kanban-board-grid">
            {/* CỘT 1: CẦN LÀM (TO DO) */}
            <div className="kanban-column">
              <div className="kanban-column-header">
                <div className="column-title-wrap">
                  <div className="column-dot" style={{ background: '#60a5fa' }}></div>
                  <h4>Cần làm</h4>
                </div>
                <span className="task-count-badge">
                  {currentProjectTasks.filter(t => t.status === 'todo').length}
                </span>
              </div>
              
              <div className="kanban-tasks-list">
                {currentProjectTasks.filter(t => t.status === 'todo').map((task) => (
                  <div key={task.id} className="kanban-task-card">
                    <span className={`task-priority-tag priority-${task.priority}`}>
                      {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                    </span>
                    <h5 className="task-title">{task.title}</h5>
                    <p className="task-desc">{task.desc}</p>

                    <div className="task-footer">
                      <span className="task-assignee"><User size={12} /> {task.assignee}</span>
                      <span className="task-due"><Clock size={12} /> {task.dueDate}</span>
                    </div>

                    <div className="task-actions-overlay">
                      <button className="btn-move-status" onClick={() => chuyenTrangThaiTask(task.id, 'in_progress')}>
                        Làm ngay <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}

                <button 
                  className="btn-add-task-col"
                  onClick={() => { setCotTaskHienTai('todo'); setHienModalTask(true); }}
                >
                  <Plus size={14} /> Thêm task mới
                </button>
              </div>
            </div>

            {/* CỘT 2: ĐANG THỰC HIỆN (IN PROGRESS) */}
            <div className="kanban-column">
              <div className="kanban-column-header">
                <div className="column-title-wrap">
                  <div className="column-dot" style={{ background: '#f59e0b' }}></div>
                  <h4>Đang làm</h4>
                </div>
                <span className="task-count-badge">
                  {currentProjectTasks.filter(t => t.status === 'in_progress').length}
                </span>
              </div>

              <div className="kanban-tasks-list">
                {currentProjectTasks.filter(t => t.status === 'in_progress').map((task) => (
                  <div key={task.id} className="kanban-task-card">
                    <span className={`task-priority-tag priority-${task.priority}`}>
                      {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                    </span>
                    <h5 className="task-title">{task.title}</h5>
                    <p className="task-desc">{task.desc}</p>

                    <div className="task-footer">
                      <span className="task-assignee"><User size={12} /> {task.assignee}</span>
                      <span className="task-due"><Clock size={12} /> {task.dueDate}</span>
                    </div>

                    <div className="task-actions-overlay">
                      <button className="btn-move-status" onClick={() => chuyenTrangThaiTask(task.id, 'todo')}>
                        <ArrowLeft size={12} /> Cần làm
                      </button>
                      <button className="btn-move-status" onClick={() => chuyenTrangThaiTask(task.id, 'review')}>
                        Review <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}

                <button 
                  className="btn-add-task-col"
                  onClick={() => { setCotTaskHienTai('in_progress'); setHienModalTask(true); }}
                >
                  <Plus size={14} /> Thêm task mới
                </button>
              </div>
            </div>

            {/* CỘT 3: ĐANG KIỂM THỬ (REVIEW) */}
            <div className="kanban-column">
              <div className="kanban-column-header">
                <div className="column-title-wrap">
                  <div className="column-dot" style={{ background: '#a855f7' }}></div>
                  <h4>Kiểm thử / Review</h4>
                </div>
                <span className="task-count-badge">
                  {currentProjectTasks.filter(t => t.status === 'review').length}
                </span>
              </div>

              <div className="kanban-tasks-list">
                {currentProjectTasks.filter(t => t.status === 'review').map((task) => (
                  <div key={task.id} className="kanban-task-card">
                    <span className={`task-priority-tag priority-${task.priority}`}>
                      {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                    </span>
                    <h5 className="task-title">{task.title}</h5>
                    <p className="task-desc">{task.desc}</p>

                    <div className="task-footer">
                      <span className="task-assignee"><User size={12} /> {task.assignee}</span>
                      <span className="task-due"><Clock size={12} /> {task.dueDate}</span>
                    </div>

                    <div className="task-actions-overlay">
                      <button className="btn-move-status" onClick={() => chuyenTrangThaiTask(task.id, 'in_progress')}>
                        <ArrowLeft size={12} /> Sửa lại
                      </button>
                      <button className="btn-move-status" onClick={() => chuyenTrangThaiTask(task.id, 'done')} style={{ borderColor: '#10b981', color: '#34d399' }}>
                        Duyệt xong <Check size={12} />
                      </button>
                    </div>
                  </div>
                ))}

                <button 
                  className="btn-add-task-col"
                  onClick={() => { setCotTaskHienTai('review'); setHienModalTask(true); }}
                >
                  <Plus size={14} /> Thêm task mới
                </button>
              </div>
            </div>

            {/* CỘT 4: HOÀN THÀNH (DONE) */}
            <div className="kanban-column">
              <div className="kanban-column-header">
                <div className="column-title-wrap">
                  <div className="column-dot" style={{ background: '#10b981' }}></div>
                  <h4>Hoàn thành</h4>
                </div>
                <span className="task-count-badge">
                  {currentProjectTasks.filter(t => t.status === 'done').length}
                </span>
              </div>

              <div className="kanban-tasks-list">
                {currentProjectTasks.filter(t => t.status === 'done').map((task) => (
                  <div key={task.id} className="kanban-task-card" style={{ opacity: 0.85 }}>
                    <span className={`task-priority-tag priority-${task.priority}`}>
                      {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                    </span>
                    <h5 className="task-title" style={{ textDecoration: 'line-through' }}>{task.title}</h5>
                    <p className="task-desc">{task.desc}</p>

                    <div className="task-footer">
                      <span className="task-assignee"><User size={12} /> {task.assignee}</span>
                      <span className="task-due" style={{ color: '#34d399' }}><CheckCircle2 size={12} /> Đã xong</span>
                    </div>

                    <div className="task-actions-overlay">
                      <button className="btn-move-status" onClick={() => chuyenTrangThaiTask(task.id, 'review')}>
                        Mở lại task
                      </button>
                    </div>
                  </div>
                ))}

                <button 
                  className="btn-add-task-col"
                  onClick={() => { setCotTaskHienTai('done'); setHienModalTask(true); }}
                >
                  <Plus size={14} /> Thêm task đã làm
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* CHẾ ĐỘ 2: DANH SÁCH DỰ ÁN BAN ĐẦU */
        <>
          <div className="projects-header">
            <h2 className="projects-title">Quản lý Dự án</h2>
            <p className="projects-subtitle">Khởi tạo dự án mới, theo dõi tiến độ và làm việc nhóm hiệu quả</p>
          </div>

          <div className="projects-grid">
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

          <div className="project-list-section">
            <div className="section-title-bar">
              <div className="section-title-wrap">
                <FolderKanban size={20} className="section-icon" />
                <h3>Dự án của bạn ({danhSachLoc.length})</h3>
              </div>

              <div className="toolbar-controls">
                <div className="search-box-custom">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm dự án hoặc mã..."
                    value={tuKhoaTimKiem}
                    onChange={(e) => setTuKhoaTimKiem(e.target.value)}
                  />
                </div>

                <select 
                  className="filter-select"
                  value={boLocTrangThai}
                  onChange={(e) => setBoLocTrangThai(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang thực hiện</option>
                  <option value="completed">Đã hoàn thành</option>
                </select>

                <div className="view-mode-toggle">
                  <button 
                    className={`view-btn ${cheDoXem === 'grid' ? 'active' : ''}`}
                    onClick={() => setCheDoXem('grid')}
                    title="Chế độ Lưới"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button 
                    className={`view-btn ${cheDoXem === 'list' ? 'active' : ''}`}
                    onClick={() => setCheDoXem('list')}
                    title="Chế độ Danh sách"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {danhSachLoc.length > 0 ? (
              cheDoXem === 'grid' ? (
                <div className="project-cards-grid">
                  {danhSachLoc.map((duAn) => {
                    const phanTram = duAn.tasks?.total > 0 
                      ? Math.round((duAn.tasks.completed / duAn.tasks.total) * 100) 
                      : 0;

                    return (
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
                              <span className={`status-badge ${duAn.status === 'completed' ? 'completed' : 'active'}`}>
                                {duAn.status === 'completed' ? 'Hoàn thành' : 'Đang làm'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="project-card-body">
                          {duAn.tasks && (
                            <div className="progress-section">
                              <div className="progress-header-info">
                                <span><CheckSquare size={12} /> Tiến độ</span>
                                <span>{duAn.tasks.completed}/{duAn.tasks.total} Task ({phanTram}%)</span>
                              </div>
                              <div className="progress-bar-bg">
                                <div className="progress-bar-fill" style={{ width: `${phanTram}%` }}></div>
                              </div>
                            </div>
                          )}

                          <div className="code-box">
                            <span className="code-label">Mã mời:</span>
                            <code className="code-value">{duAn.join_code}</code>
                            <button 
                              className="btn-copy-code"
                              onClick={() => saoChepMaMoi(duAn.join_code, duAn.id)}
                              title="Sao chép mã"
                            >
                              {daSaoChep === duAn.id ? <Check size={14} style={{ color: '#34d399' }} /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                        
                        <div className="project-card-footer">
                          <button 
                            className="btn-card-action view" 
                            onClick={() => {
                              setDuAnDangChon(duAn);
                              showToast('info', 'Đã truy cập dự án', `Đang xem bảng Kanban của "${duAn.name}"`);
                            }}
                          >
                            <span>Truy cập Kanban</span>
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
                    );
                  })}
                </div>
              ) : (
                <div className="project-cards-list">
                  {danhSachLoc.map((duAn) => (
                    <div key={duAn.id} className="project-list-row">
                      <div className="list-row-left">
                        <div className="project-avatar">{duAn.name.charAt(0).toUpperCase()}</div>
                        <div>
                          <h4 className="project-item-name">{duAn.name}</h4>
                          <span className={`role-badge ${duAn.role?.toLowerCase() === 'owner' ? 'owner' : 'member'}`}>
                            {duAn.role || 'Member'}
                          </span>
                        </div>
                      </div>

                      <div className="list-row-right">
                        <div className="code-box">
                          <code className="code-value">{duAn.join_code}</code>
                          <button className="btn-copy-code" onClick={() => saoChepMaMoi(duAn.join_code, duAn.id)}>
                            {daSaoChep === duAn.id ? <Check size={14} style={{ color: '#34d399' }} /> : <Copy size={14} />}
                          </button>
                        </div>
                        <button 
                          className="btn-card-action view" 
                          onClick={() => {
                            setDuAnDangChon(duAn);
                            showToast('info', 'Đã truy cập dự án', `Đang xem bảng Kanban của "${duAn.name}"`);
                          }}
                        >
                          <span>Truy cập Kanban</span>
                          <ExternalLink size={14} />
                        </button>
                        <button className="btn-card-action delete" onClick={() => xuLyXoaDuAn(duAn.id, duAn.name)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : (
              <div className="empty-project-state">
                <FolderKanban size={48} className="empty-icon" />
                <p>
                  {tuKhoaTimKiem 
                    ? `Không tìm thấy dự án nào khớp với "${tuKhoaTimKiem}"` 
                    : 'Chưa có dự án nào trong danh sách. Hãy khởi tạo hoặc tham gia dự án ngay!'}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* MODAL TẠO TASK MỚI CHO BẢNG KANBAN */}
      {hienModalTask && (
        <div className="modal-overlay" onClick={() => setHienModalTask(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h4 className="modal-title">Tạo Task Mới cho Dự Án</h4>
              <button className="btn-modal-close" onClick={() => setHienModalTask(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={xuLyThemTaskMoi}>
              <div className="form-group">
                <label className="form-label">Tên công việc / Task</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="VD: Thiết kế API Đăng nhập OAuth2..."
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mô tả chi tiết</label>
                <textarea
                  className="form-textarea"
                  placeholder="Yêu cầu công việc, tài liệu tham khảo..."
                  value={taskForm.desc}
                  onChange={(e) => setTaskForm({ ...taskForm, desc: e.target.value })}
                />
              </div>

              <div className="modal-grid-two-col">
                <div className="form-group">
                  <label className="form-label">Mức độ ưu tiên</label>
                  <select
                    className="form-select"
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Người thực hiện</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="VD: Nguyễn Văn A"
                    value={taskForm.assignee}
                    onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Hạn hoàn thành (Deadline)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="VD: 25/10/2026"
                  value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                />
              </div>

              <div className="modal-footer-actions">
                <button 
                  type="button" 
                  className="btn-card-action view"
                  onClick={() => setHienModalTask(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-primary-custom">
                  Tạo Task ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}