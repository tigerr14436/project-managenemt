import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  LayoutGrid,
  List,
  CheckSquare,
  ArrowLeft,
  Plus,
  Clock,
  X,
  Info,
  AlertTriangle,
  BarChart2,
  FileCode,
  Layers
} from "lucide-react";
import "../ProjectManagement.css";

import ProjectCard from "./ProjectCard";
import KanbanBoard from "./KanbanBoard";
import CodeManagement from "./CodeManagement";
import CodeReview from "./CodeReview";
import ProjectChat from "./ProjectChat";

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

export default function ProjectManagement() {
  const navigate = useNavigate();

  const [projectList, setProjectList] = useState([]);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  const [selectedProject, setSelectedProject] = useState(null);
  const [projectTasks, setProjectTasks] = useState([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);

  // State quản lý Tab trong chi tiết dự án ('kanban', 'code', 'review')
  const [activeTab, setActiveTab] = useState('kanban');

  const [repoList, setRepoList] = useState([
    { id: 1, name: "devtask-frontend-react", branch: "main", commits_count: 142, last_update: "10 phút trước" },
    { id: 2, name: "devtask-backend-fastapi", branch: "dev", commits_count: 98, last_update: "1 giờ trước" },
  ]);
  const [commitList] = useState([
    { id: "a1b2c3d", msg: "feat(auth): integrate OAuth2 & JWT token authentication", author: "Shut Heast", time: "10 phút trước" },
    { id: "e5f6g7h", msg: "fix(kanban): resolve drag and drop status delay issue", author: "Trần Thị B", time: "1 giờ trước" },
  ]);
  const [newRepoLink, setNewRepoLink] = useState("");

  const [newProjectName, setNewProjectName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [currentTaskColumn, setCurrentTaskColumn] = useState("todo");
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    assignee: "",
    deadline: "",
  });

  const [toastList, setToastList] = useState([]);
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [isJoiningProject, setIsJoiningProject] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchProjectList();
  }, []);

  useEffect(() => {
    if (selectedProject) fetchProjectTasks(selectedProject.id);
  }, [selectedProject?.id]);

  const showNotification = (type, title, message) => {
    const id = Date.now();
    setToastList((prev) => [...prev, { id, type, title, message }]);
    setTimeout(
      () => setToastList((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  };

  const removeToast = (id) =>
    setToastList((prev) => prev.filter((t) => t.id !== id));

  const fetchProjectList = async () => {
    setIsLoadingProjects(true);
    try {
      const data = await sendAuthenticatedRequest("/projects");
      setProjectList(data || []);
    } catch (error) {
      if (error.message.includes("chưa đăng nhập")) {
        navigate("/");
        return;
      }
      showNotification("loi", "Không tải được dự án", error.message);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const fetchProjectTasks = async (projectId) => {
    setIsLoadingTasks(true);
    try {
      const data = await sendAuthenticatedRequest(`/tasks?project_id=${projectId}`);
      setProjectTasks(data || []);
    } catch (error) {
      showNotification("loi", "Không tải được công việc", error.message);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    setIsCreatingProject(true);
    try {
      const newProject = await sendAuthenticatedRequest("/projects", {
        method: "POST",
        body: JSON.stringify({ name: newProjectName.trim() }),
      });
      setProjectList((prev) => [newProject, ...prev]);
      showNotification("thanh-cong", "Thành công", `Đã khởi tạo dự án "${newProject.name}"`);
      setNewProjectName("");
    } catch (error) {
      showNotification("loi", "Không tạo được dự án", error.message);
    } finally {
      setIsCreatingProject(false);
    }
  };

  const handleJoinProject = async (e) => {
    e.preventDefault();
    if (!joinCode.trim()) return;
    setIsJoiningProject(true);
    try {
      const joinedProject = await sendAuthenticatedRequest("/projects/join", {
        method: "POST",
        body: JSON.stringify({ join_code: joinCode.trim() }),
      });
      setProjectList((prev) => [joinedProject, ...prev]);
      showNotification("thanh-cong", "Tham gia thành công", `Bạn đã vào dự án "${joinedProject.name}"`);
      setJoinCode("");
    } catch (error) {
      showNotification("loi", "Lỗi tham gia", error.message);
    } finally {
      setIsJoiningProject(false);
    }
  };

  const copyJoinCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    showNotification("thong-tin", "Đã sao chép", `Mã tham gia ${code} đã lưu vào bộ nhớ tạm`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteProject = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa/rời khỏi dự án "${name}"?`)) return;
    try {
      await sendAuthenticatedRequest(`/projects/${id}`, { method: "DELETE" });
      setProjectList((prev) => prev.filter((item) => item.id !== id));
      if (selectedProject?.id === id) setSelectedProject(null);
      showNotification("can-bao", "Đã xóa dự án", `Đã gỡ bỏ "${name}" khỏi danh sách`);
    } catch (error) {
      showNotification("loi", "Không xóa được dự án", error.message);
    }
  };

  const changeTaskStatus = async (taskId, targetStatus) => {
    const originalTask = projectTasks.find((t) => t.id === taskId);
    if (!originalTask) return;
    setProjectTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: targetStatus } : t)),
    );
    try {
      await sendAuthenticatedRequest(`/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify({ status: targetStatus }),
      });
      showNotification("thong-tin", "Cập nhật tiến độ", "Đã lưu thay đổi vào hệ thống");
    } catch (error) {
      setProjectTasks((prev) =>
        prev.map((t) => (t.id === taskId ? originalTask : t)),
      );
      showNotification("loi", "Không lưu được", error.message);
    }
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title.trim() || !selectedProject) return;

    try {
      if (editingTaskId) {
        const updatedTask = await sendAuthenticatedRequest(`/tasks/${editingTaskId}`, {
          method: "PUT",
          body: JSON.stringify({
            title: taskForm.title.trim(),
            description: taskForm.description || null,
            status: currentTaskColumn,
            priority: taskForm.priority,
            assignee: taskForm.assignee || null,
            deadline: taskForm.deadline ? new Date(taskForm.deadline).toISOString() : null,
          }),
        });
        setProjectTasks((prev) =>
          prev.map((t) =>
            t.id === editingTaskId ? updatedTask || { ...t, ...taskForm } : t,
          ),
        );
        showNotification("thanh-cong", "Cập nhật công việc", `Đã lưu thay đổi cho "${taskForm.title}"`);
      } else {
        const newTask = await sendAuthenticatedRequest("/tasks", {
          method: "POST",
          body: JSON.stringify({
            project_id: selectedProject.id,
            title: taskForm.title.trim(),
            description: taskForm.description || null,
            status: currentTaskColumn,
            priority: taskForm.priority,
            assignee: taskForm.assignee || null,
            deadline: taskForm.deadline ? new Date(taskForm.deadline).toISOString() : null,
          }),
        });
        setProjectTasks((prev) => [newTask, ...prev]);
        showNotification("thanh-cong", "Thêm công việc", `Đã tạo "${taskForm.title}"`);
      }

      setIsTaskModalOpen(false);
      setEditingTaskId(null);
      setTaskForm({ title: "", description: "", priority: "medium", assignee: "", deadline: "" });
    } catch (error) {
      showNotification("loi", "Không lưu được task", error.message);
    }
  };

  const openEditTaskModal = (task) => {
    setEditingTaskId(task.id);
    setCurrentTaskColumn(task.status);
    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      priority: task.priority || "medium",
      assignee: task.assignee || "",
      deadline: task.deadline ? task.deadline.split("T")[0] : "",
    });
    setIsTaskModalOpen(true);
  };

  const openCreateTaskModal = (columnKey) => {
    setEditingTaskId(null);
    setCurrentTaskColumn(columnKey);
    setTaskForm({ title: "", description: "", priority: "medium", assignee: "", deadline: "" });
    setIsTaskModalOpen(true);
  };

  const handleDeleteTask = async (taskId, title) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa task "${title}"?`)) return;
    try {
      await sendAuthenticatedRequest(`/tasks/${taskId}`, { method: "DELETE" });
      setProjectTasks((prev) => prev.filter((t) => t.id !== taskId));
      showNotification("can-bao", "Đã xóa", `Đã xóa task "${title}"`);
    } catch (error) {
      showNotification("loi", "Không xóa được", error.message);
    }
  };

  const handleAddRepoInline = (e) => {
    e.preventDefault();
    if (!newRepoLink.trim()) return;
    const repoName = newRepoLink.split("/").pop().replace(".git", "") || newRepoLink;
    setRepoList((prev) => [
      ...prev,
      { id: Date.now(), name: repoName, branch: "main", commits_count: 1, last_update: "Vừa xong" },
    ]);
    setNewRepoLink("");
    showNotification("thanh-cong", "Kết nối thành công", "Đã liên kết Repository mới");
  };

  const filteredProjects = projectList.filter((project) => {
    const matchesKeyword =
      project.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      project.join_code.toLowerCase().includes(searchKeyword.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesKeyword && matchesStatus;
  });

  return (
    <div className="khung-quan-ly-du-an">
      <div className="khung-chua-toast">
        {toastList.map((toast) => (
          <div key={toast.id} className={`thong-bao-item ${toast.type}`}>
            <div className="bieu-tuong-toast">
              {toast.type === "thanh-cong" && <CheckCircle2 size={20} />}
              {toast.type === "loi" && <AlertCircle size={20} />}
              {toast.type === "thong-tin" && <Info size={20} />}
              {toast.type === "can-bao" && <AlertTriangle size={20} />}
            </div>
            <div className="noi-dung-toast">
              <div className="tieu-de-thong-bao">{toast.title}</div>
              <div className="chi-tiet-thong-bao">{toast.message}</div>
            </div>
            <button className="nut-dong-toast" onClick={() => removeToast(toast.id)}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>

      {selectedProject ? (
        <div>
          <div className="phan-header-kanban" style={{ marginBottom: '16px' }}>
            <button className="nut-quay-lai" onClick={() => setSelectedProject(null)}>
              <ArrowLeft size={16} />
              <span>Quay lại Danh sách Dự án</span>
            </button>
            <div className="khung-tieu-de-kanban">
              <div className="avatar-du-an">
                {selectedProject.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="tieu-de-du-an-kanban">{selectedProject.name}</h3>
                <span className="nhan-ma-moi">
                  Mã tham gia:{" "}
                  <strong style={{ color: "#38bdf8" }}>{selectedProject.join_code}</strong>
                </span>
              </div>
            </div>
            {activeTab === 'kanban' && (
              <button className="nut-chinh" onClick={() => openCreateTaskModal("todo")}>
                <Plus size={16} />
                <span>Tạo Task Mới</span>
              </button>
            )}
          </div>

          {/* THANH TAB CHUYỂN ĐỔI GIAO DIỆN TRONG DỰ ÁN */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #334155', paddingBottom: '12px', marginBottom: '20px' }}>
            <button
              onClick={() => setActiveTab('kanban')}
              style={{
                background: activeTab === 'kanban' ? '#4f46e5' : '#1e293b',
                color: '#fff',
                border: '1px solid #334155',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FolderKanban size={15} /> Bảng Kanban công việc
            </button>
            <button
              onClick={() => setActiveTab('code')}
              style={{
                background: activeTab === 'code' ? '#4f46e5' : '#1e293b',
                color: '#fff',
                border: '1px solid #334155',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Code2 size={15} /> Quản lý Code & Repositories
            </button>
            <button
              onClick={() => setActiveTab('review')}
              style={{
                background: activeTab === 'review' ? '#4f46e5' : '#1e293b',
                color: '#fff',
                border: '1px solid #334155',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FileCode size={15} /> Code Review & Bình luận
            </button>
          </div>

          {/* NỘI DUNG HIỂN THỊ THEO TAB ĐANG CHỌN */}
          {activeTab === 'kanban' && (
            <>
              <div className="thanh-thong-ke-kanban">
                <div className="the-thong-ke">
                  <div className="nen-icon-thong-ke" style={{ background: "rgba(99, 102, 241, 0.2)", color: "#818cf8" }}>
                    <FolderKanban size={20} />
                  </div>
                  <div className="thong-tin-thong-ke">
                    <h5>Tổng công việc</h5>
                    <p>{projectTasks.length} Tasks</p>
                  </div>
                </div>
                <div className="the-thong-ke">
                  <div className="nen-icon-thong-ke" style={{ background: "rgba(245, 158, 11, 0.2)", color: "#fbbf24" }}>
                    <Clock size={20} />
                  </div>
                  <div className="thong-tin-thong-ke">
                    <h5>Đang thực hiện</h5>
                    <p>{projectTasks.filter((t) => t.status === "in_progress").length} Tasks</p>
                  </div>
                </div>
                <div className="the-thong-ke">
                  <div className="nen-icon-thong-ke" style={{ background: "rgba(52, 211, 153, 0.2)", color: "#34d399" }}>
                    <CheckSquare size={20} />
                  </div>
                  <div className="thong-tin-thong-ke">
                    <h5>Hoàn thành</h5>
                    <p>{projectTasks.filter((t) => t.status === "done").length} Tasks</p>
                  </div>
                </div>
                <div className="the-thong-ke">
                  <div className="nen-icon-thong-ke" style={{ background: "rgba(56, 189, 248, 0.2)", color: "#38bdf8" }}>
                    <BarChart2 size={20} />
                  </div>
                  <div className="thong-tin-thong-ke">
                    <h5>Tiến độ dự án</h5>
                    <p>
                      {projectTasks.length > 0
                        ? Math.round(
                            (projectTasks.filter((t) => t.status === "done").length /
                              projectTasks.length) *
                              100,
                          )
                        : 0}
                      %
                    </p>
                  </div>
                </div>
              </div>

              <KanbanBoard
                projectTasks={projectTasks}
                isLoadingTasks={isLoadingTasks}
                changeTaskStatus={changeTaskStatus}
                openTaskModal={openCreateTaskModal}
                editTask={openEditTaskModal}
                deleteTask={handleDeleteTask}
              />
            </>
          )}

          {activeTab === 'code' && (
            <CodeManagement
              repoList={repoList}
              setRepoList={setRepoList}
              commitList={commitList}
              newRepoLink={newRepoLink}
              setNewRepoLink={setNewRepoLink}
              handleAddRepo={handleAddRepoInline}
            />
          )}

          {activeTab === 'review' && (
            <CodeReview showNotification={showNotification} />
          )}

          <ProjectChat showNotification={showNotification} />
        </div>
      ) : (
        <>
          <div className="tieu-de-trang-quan-ly">
            <h2 className="tieu-de-chinh">Quản lý Dự án</h2>
            <p className="tieu-de-phu">
              Khởi tạo dự án mới, theo dõi tiến độ và làm việc nhóm hiệu quả
            </p>
          </div>

          <div className="luoi-hanh-dong-du-an">
            <div className="the-hanh-dong">
              <div className="bieu-tuong-the">
                <FolderPlus size={22} />
              </div>
              <h3>Tạo Dự Án Mới</h3>
              <p className="mo-ta-the">
                Thiết lập không gian quản lý tiến độ và công việc riêng cho đội ngũ của bạn
              </p>
              <form onSubmit={handleCreateProject} className="form-hanh-dong">
                <div className="nhom-nhap-lieu">
                  <Code2 size={18} className="bieu-tuong-input" />
                  <input
                    type="text"
                    placeholder="Nhập tên dự án..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="o-nhap-lieu"
                    required
                  />
                </div>
                <button type="submit" disabled={isCreatingProject} className="nut-chinh">
                  {isCreatingProject ? <Loader2 size={16} className="icon-quay" /> : <FolderPlus size={16} />}
                  <span>{isCreatingProject ? "Đang tạo..." : "Tạo Dự Án"}</span>
                </button>
              </form>
            </div>

            <div className="the-hanh-dong">
              <div className="bieu-tuong-the phu">
                <UserPlus size={22} />
              </div>
              <h3>Tham Gia Dự Án</h3>
              <p className="mo-ta-the">
                Nhập mã mời (Join Code) được chia sẻ từ quản trị viên để tham gia
              </p>
              <form onSubmit={handleJoinProject} className="form-hanh-dong">
                <div className="nhom-nhap-lieu">
                  <KeyRound size={18} className="bieu-tuong-input" />
                  <input
                    type="text"
                    placeholder="Nhập mã tham gia (VD: DEV-8892)..."
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    className="o-nhap-lieu"
                    required
                  />
                </div>
                <button type="submit" disabled={isJoiningProject} className="nut-phu">
                  {isJoiningProject ? <Loader2 size={16} className="icon-quay" /> : <ArrowRight size={16} />}
                  <span>{isJoiningProject ? "Đang tham gia..." : "Tham Gia Ngay"}</span>
                </button>
              </form>
            </div>
          </div>

          <div className="khung-danh-sach-du-an">
            <div className="thanh-tieu-de-section">
              <div className="nhom-tieu-de">
                <FolderKanban size={20} className="icon-tieu-de" />
                <h3>Dự án của bạn ({filteredProjects.length})</h3>
              </div>
              <div className="nhom-cong-cu">
                <div className="khung-tim-kiem">
                  <Search size={16} className="icon-tim-kiem" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm dự án hoặc mã..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                  />
                </div>
                <select
                  className="bo-loc-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang thực hiện</option>
                  <option value="completed">Đã hoàn thành</option>
                </select>
                <div className="chuyen-che-do-xem">
                  <button
                    className={`nut-che-do ${viewMode === "grid" ? "dang-chon" : ""}`}
                    onClick={() => setViewMode("grid")}
                    title="Chế độ Lưới"
                  >
                    <LayoutGrid size={16} />
                  </button>
                  <button
                    className={`nut-che-do ${viewMode === "list" ? "dang-chon" : ""}`}
                    onClick={() => setViewMode("list")}
                    title="Chế độ Danh sách"
                  >
                    <List size={16} />
                  </button>
                </div>
              </div>
            </div>

            {isLoadingProjects ? (
              <div className="trang-thai-trong">
                <Loader2 size={48} className="icon-quay" />
                <p>Đang tải danh sách dự án...</p>
              </div>
            ) : filteredProjects.length > 0 ? (
              viewMode === "grid" ? (
                <div className="luoi-the-du-an">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      viewMode="grid"
                      copiedId={copiedId}
                      copyJoinCode={copyJoinCode}
                      setSelectedProject={setSelectedProject}
                      handleDeleteProject={handleDeleteProject}
                    />
                  ))}
                </div>
              ) : (
                <div className="danh-sach-dang-dong">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      viewMode="list"
                      copiedId={copiedId}
                      copyJoinCode={copyJoinCode}
                      setSelectedProject={setSelectedProject}
                      handleDeleteProject={handleDeleteProject}
                    />
                  ))}
                </div>
              )
            ) : (
              <div className="trang-thai-trong">
                <FolderKanban size={48} className="icon-trong" />
                <p>
                  {searchKeyword
                    ? `Không tìm thấy dự án nào khớp với "${searchKeyword}"`
                    : "Chưa có dự án nào trong danh sách. Hãy khởi tạo hoặc tham gia dự án ngay!"}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {isTaskModalOpen && (
        <div className="lop-phu-modal" onClick={() => setIsTaskModalOpen(false)}>
          <div className="noi-dung-modal" onClick={(e) => e.stopPropagation()}>
            <div className="header-modal">
              <h4 className="tieu-de-modal">
                {editingTaskId ? "Chỉnh Sửa Công Việc" : "Tạo Task Mới cho Dự Án"}
              </h4>
              <button className="nut-dong-modal" onClick={() => setIsTaskModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveTask}>
              <div className="nhom-form-group">
                <label className="nhan-form">Tên công việc / Task</label>
                <input
                  type="text"
                  className="input-form"
                  placeholder="VD: Thiết kế API Đăng nhập OAuth2..."
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="nhom-form-group">
                <label className="nhan-form">Mô tả chi tiết</label>
                <textarea
                  className="textarea-form"
                  placeholder="Yêu cầu công việc, tài liệu tham khảo..."
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                />
              </div>
              <div className="luoi-hai-cot-modal">
                <div className="nhom-form-group">
                  <label className="nhan-form">Mức độ ưu tiên</label>
                  <select
                    className="select-form"
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                  </select>
                </div>
                <div className="nhom-form-group">
                  <label className="nhan-form">Người thực hiện</label>
                  <input
                    type="text"
                    className="input-form"
                    placeholder="VD: Nguyễn Văn A"
                    value={taskForm.assignee}
                    onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                  />
                </div>
              </div>
              <div className="nhom-form-group">
                <label className="nhan-form">Hạn hoàn thành (Deadline)</label>
                <input
                  type="date"
                  className="input-form"
                  value={taskForm.deadline}
                  onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                />
              </div>
              <div className="chan-modal">
                <button
                  type="button"
                  className="nut-hanh-dong-the xem"
                  onClick={() => setIsTaskModalOpen(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="nut-chinh">
                  {editingTaskId ? "Lưu Thay Đổi" : "Tạo Task ngay"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}