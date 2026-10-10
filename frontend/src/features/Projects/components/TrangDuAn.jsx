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
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  const res = await fetch(`http://127.0.0.1:8000/api${url}`, { ...options, headers });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.detail || 'Đã có lỗi xảy ra');
  }
  return data;
}

const CAC_COT = [
  { key: 'todo', label: 'Cần làm', dot: '#60a5fa' },
  { key: 'in_progress', label: 'Đang làm', dot: '#f59e0b' },
  { key: 'review', label: 'Kiểm thử / Review', dot: '#a855f7' },
  { key: 'done', label: 'Hoàn thành', dot: '#10b981' },
];

function dinhDangNgay(iso) {
  if (!iso) return 'Chưa đặt hạn';
  const d = new Date(iso);
  return d.toLocaleDateString('vi-VN');
}

export default function TrangDuAn() {
  const dieuHuong = useNavigate();

  // Dữ liệu LUÔN bắt đầu rỗng, không còn danh sách cứng giả lập —
  // toàn bộ được tải từ database qua API khi component mount.
  const [danhSachDuAn, setDanhSachDuAn] = useState([]);
  const [dangTaiDuAn, setDangTaiDuAn] = useState(true);

  const [duAnDangChon, setDuAnDangChon] = useState(null);
  const [taskCuaDuAn, setTaskCuaDuAn] = useState([]);
  const [dangTaiTask, setDangTaiTask] = useState(false);

  const [tenDuAnMoi, setTenDuAnMoi] = useState('');
  const [maThamGia, setMaThamGia] = useState('');
  const [tuKhoaTimKiem, setTuKhoaTimKiem] = useState('');
  const [boLocTrangThai, setBoLocTrangThai] = useState('all');
  const [cheDoXem, setCheDoXem] = useState('grid');

  const [hienModalTask, setHienModalTask] = useState(false);
  const [cotTaskHienTai, setCotTaskHienTai] = useState('todo');
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', priority: 'medium', assignee: '', deadline: '',
  });

  const [toasts, setToasts] = useState([]);
  const [dangTaoDuAn, setDangTaoDuAn] = useState(false);
  const [dangThamGia, setDangThamGia] = useState(false);
  const [daSaoChep, setDaSaoChep] = useState(null);

  useEffect(() => {
    taiDanhSachDuAn();
  }, []);

  useEffect(() => {
    if (duAnDangChon) {
      taiTaskCuaDuAn(duAnDangChon.id);
    }
  }, [duAnDangChon?.id]);

  const showToast = (type, title, message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  };
  const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  // ===== Tải dữ liệu thật từ database =====

  const taiDanhSachDuAn = async () => {
    setDangTaiDuAn(true);
    try {
      const duLieu = await guiYeuCauXacThuc('/projects');
      setDanhSachDuAn(duLieu || []);
    } catch (loi) {
      if (loi.message.includes('chưa đăng nhập')) {
        dieuHuong('/');
        return;
      }
      showToast('error', 'Không tải được dự án', loi.message);
    } finally {
      setDangTaiDuAn(false);
    }
  };

  const taiTaskCuaDuAn = async (projectId) => {
    setDangTaiTask(true);
    try {
      const duLieu = await guiYeuCauXacThuc(`/tasks?project_id=${projectId}`);
      setTaskCuaDuAn(duLieu || []);
    } catch (loi) {
      showToast('error', 'Không tải được công việc', loi.message);
    } finally {
      setDangTaiTask(false);
    }
  };

  // ===== Tạo / tham gia / xóa dự án — gọi API thật, không còn fallback giả =====

  const xuLyTaoDuAn = async (e) => {
    e.preventDefault();
    if (!tenDuAnMoi.trim()) return;

    setDangTaoDuAn(true);
    try {
      const duAnMoi = await guiYeuCauXacThuc('/projects', {
        method: 'POST',
        body: JSON.stringify({ name: tenDuAnMoi.trim() }),
      });
      setDanhSachDuAn((prev) => [duAnMoi, ...prev]);
      showToast('success', 'Thành công', `Đã khởi tạo dự án "${duAnMoi.name}"`);
      setTenDuAnMoi('');
    } catch (loi) {
      showToast('error', 'Không tạo được dự án', loi.message);
    } finally {
      setDangTaoDuAn(false);
    }
  };

  const xuLyThamGiaDuAn = async (e) => {
    e.preventDefault();
    if (!maThamGia.trim()) return;

    setDangThamGia(true);
    try {
      const duAnDaThamGia = await guiYeuCauXacThuc('/projects/join', {
        method: 'POST',
        body: JSON.stringify({ join_code: maThamGia.trim() }),
      });
      setDanhSachDuAn((prev) => [duAnDaThamGia, ...prev]);
      showToast('success', 'Tham gia thành công', `Bạn đã vào dự án "${duAnDaThamGia.name}"`);
      setMaThamGia('');
    } catch (loi) {
      showToast('error', 'Lỗi tham gia', loi.message);
    } finally {
      setDangThamGia(false);
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
      setDanhSachDuAn((prev) => prev.filter((item) => item.id !== id));
      if (duAnDangChon?.id === id) setDuAnDangChon(null);
      showToast('warning', 'Đã xóa dự án', `Đã gỡ bỏ "${name}" khỏi danh sách`);
    } catch (loi) {
      showToast('error', 'Không xóa được dự án', loi.message);
    }
  };

  // ===== Task: kéo-thả đổi trạng thái và tạo mới — đều gọi API thật =====

  const chuyenTrangThaiTask = async (taskId, targetStatus) => {
    const taskGoc = taskCuaDuAn.find((t) => t.id === taskId);
    if (!taskGoc) return;

    // Cập nhật giao diện trước cho mượt (optimistic update)
    setTaskCuaDuAn((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t)));

    try {
      await guiYeuCauXacThuc(`/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: targetStatus }),
      });
      showToast('info', 'Cập nhật tiến độ', 'Đã lưu thay đổi vào hệ thống');
      // Đồng bộ lại số liệu tổng (completed/total) trên thẻ dự án
      taiDanhSachDuAn();
    } catch (loi) {
      // Lưu thất bại -> hoàn tác lại giao diện, không giữ trạng thái sai
      setTaskCuaDuAn((prev) => prev.map((t) => (t.id === taskId ? taskGoc : t)));
      showToast('error', 'Không lưu được', loi.message);
    }
  };

  const xuLyThemTaskMoi = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !duAnDangChon) return;

    try {
      const taskMoi = await guiYeuCauXacThuc('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          project_id: duAnDangChon.id,
          title: taskForm.title.trim(),
          description: taskForm.description || null,
          status: cotTaskHienTai,
          priority: taskForm.priority,
          assignee: taskForm.assignee || null,
          deadline: taskForm.deadline ? new Date(taskForm.deadline).toISOString() : null,
        }),
      });

      setTaskCuaDuAn((prev) => [taskMoi, ...prev]);
      showToast('success', 'Thêm công việc', `Đã tạo "${taskMoi.title}"`);
      setHienModalTask(false);
      setTaskForm({ title: '', description: '', priority: 'medium', assignee: '', deadline: '' });
      taiDanhSachDuAn();
    } catch (loi) {
      showToast('error', 'Không tạo được task', loi.message);
    }
  };

  const danhSachLoc = danhSachDuAn.filter((duAn) => {
    const khopTuKhoa =
      duAn.name.toLowerCase().includes(tuKhoaTimKiem.toLowerCase()) ||
      duAn.join_code.toLowerCase().includes(tuKhoaTimKiem.toLowerCase());
    const khopTrangThai = boLocTrangThai === 'all' || duAn.status === boLocTrangThai;
    return khopTuKhoa && khopTrangThai;
  });

  return (
    <div className="projects-container">
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
                <span className="code-label">
                  Mã tham gia: <strong style={{ color: '#38bdf8' }}>{duAnDangChon.join_code}</strong>
                </span>
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

          <div className="kanban-stats-bar">
            <div className="stat-card">
              <div className="stat-icon-bg" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' }}>
                <FolderKanban size={20} />
              </div>
              <div className="stat-info">
                <h5>Tổng công việc</h5>
                <p>{taskCuaDuAn.length} Tasks</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-bg" style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24' }}>
                <Clock size={20} />
              </div>
              <div className="stat-info">
                <h5>Đang thực hiện</h5>
                <p>{taskCuaDuAn.filter((t) => t.status === 'in_progress').length} Tasks</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-bg" style={{ background: 'rgba(52, 211, 153, 0.2)', color: '#34d399' }}>
                <CheckSquare size={20} />
              </div>
              <div className="stat-info">
                <h5>Hoàn thành</h5>
                <p>{taskCuaDuAn.filter((t) => t.status === 'done').length} Tasks</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon-bg" style={{ background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8' }}>
                <BarChart2 size={20} />
              </div>
              <div className="stat-info">
                <h5>Tiến độ dự án</h5>
                <p>
                  {taskCuaDuAn.length > 0
                    ? Math.round((taskCuaDuAn.filter((t) => t.status === 'done').length / taskCuaDuAn.length) * 100)
                    : 0}%
                </p>
              </div>
            </div>
          </div>

          {dangTaiTask ? (
            <div className="empty-project-state">
              <Loader2 size={32} className="spin-icon" />
              <p>Đang tải công việc...</p>
            </div>
          ) : (
            <div className="kanban-board-grid">
              {CAC_COT.map((cot) => (
                <div className="kanban-column" key={cot.key}>
                  <div className="kanban-column-header">
                    <div className="column-title-wrap">
                      <div className="column-dot" style={{ background: cot.dot }}></div>
                      <h4>{cot.label}</h4>
                    </div>
                    <span className="task-count-badge">
                      {taskCuaDuAn.filter((t) => t.status === cot.key).length}
                    </span>
                  </div>

                  <div className="kanban-tasks-list">
                    {taskCuaDuAn.filter((t) => t.status === cot.key).map((task) => {
                      const idxCot = CAC_COT.findIndex((c) => c.key === cot.key);
                      const cotTruoc = CAC_COT[idxCot - 1];
                      const cotSau = CAC_COT[idxCot + 1];

                      return (
                        <div key={task.id} className="kanban-task-card">
                          <span className={`task-priority-tag priority-${task.priority}`}>
                            {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                          </span>
                          <h5 className="task-title">{task.title}</h5>
                          <p className="task-desc">{task.description || 'Chưa có mô tả chi tiết'}</p>

                          <div className="task-footer">
                            <span className="task-assignee"><User size={12} /> {task.assignee || 'Chưa phân công'}</span>
                            <span className="task-due"><Clock size={12} /> {dinhDangNgay(task.deadline)}</span>
                          </div>

                          <div className="task-actions-overlay">
                            {cotTruoc && (
                              <button className="btn-move-status" onClick={() => chuyenTrangThaiTask(task.id, cotTruoc.key)}>
                                <ArrowLeft size={12} /> {cotTruoc.label}
                              </button>
                            )}
                            {cotSau && (
                              <button className="btn-move-status" onClick={() => chuyenTrangThaiTask(task.id, cotSau.key)}>
                                {cotSau.label} <ChevronRight size={12} />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    <button
                      className="btn-add-task-col"
                      onClick={() => { setCotTaskHienTai(cot.key); setHienModalTask(true); }}
                    >
                      <Plus size={14} /> Thêm task mới
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
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
                <button type="submit" disabled={dangTaoDuAn} className="btn-primary-custom">
                  {dangTaoDuAn ? <Loader2 size={16} className="spin-icon" /> : <FolderPlus size={16} />}
                  <span>{dangTaoDuAn ? 'Đang tạo...' : 'Tạo Dự Án'}</span>
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
                <button type="submit" disabled={dangThamGia} className="btn-secondary-custom">
                  {dangThamGia ? <Loader2 size={16} className="spin-icon" /> : <ArrowRight size={16} />}
                  <span>{dangThamGia ? 'Đang tham gia...' : 'Tham Gia Ngay'}</span>
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

            {dangTaiDuAn ? (
              <div className="empty-project-state">
                <Loader2 size={48} className="spin-icon" />
                <p>Đang tải danh sách dự án...</p>
              </div>
            ) : danhSachLoc.length > 0 ? (
              cheDoXem === 'grid' ? (
                <div className="project-cards-grid">
                  {danhSachLoc.map((duAn) => {
                    const phanTram = duAn.tasks?.total > 0
                      ? Math.round((duAn.tasks.completed / duAn.tasks.total) * 100)
                      : 0;

                    return (
                      <div key={duAn.id} className="project-item-card">
                        <div className="project-card-top">
                          <div className="project-avatar">{duAn.name.charAt(0).toUpperCase()}</div>
                          <div className="project-info">
                            <h4 className="project-item-name">{duAn.name}</h4>
                            <div className="project-badges">
                              <span className={`role-badge ${duAn.role?.toLowerCase() === 'owner' ? 'owner' : 'member'}`}>
                                {duAn.role === 'owner' ? 'Owner' : 'Member'}
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
                            onClick={() => setDuAnDangChon(duAn)}
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
                            {duAn.role === 'owner' ? 'Owner' : 'Member'}
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
                        <button className="btn-card-action view" onClick={() => setDuAnDangChon(duAn)}>
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
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
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
                  type="date"
                  className="form-input"
                  value={taskForm.deadline}
                  onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                />
              </div>

              <div className="modal-footer-actions">
                <button type="button" className="btn-card-action view" onClick={() => setHienModalTask(false)}>
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