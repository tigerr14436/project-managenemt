import React from "react";
import { CheckSquare, Copy, Check, ExternalLink, Trash2, CalendarDays, Pencil, CheckCircle2 } from "lucide-react";

function formatDate(value) {
  if (!value) return "Chưa đặt";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : "Chưa đặt";
}

function ProjectDetails({ project, compact = false }) {
  return (
    <div style={{ marginTop: 10, marginBottom: 12, minWidth: 0 }}>
      <p style={{
        color: "#cbd5e1", fontSize: 13, lineHeight: 1.6, margin: "0 0 10px",
        overflowWrap: "anywhere", display: "-webkit-box",
        WebkitLineClamp: compact ? 2 : 3, WebkitBoxOrient: "vertical", overflow: "hidden"
      }} title={project.description || ""}>
        {project.description || "Chưa có mô tả dự án"}
      </p>
      <div style={{
        display: "flex", flexWrap: "wrap", gap: "8px 16px",
        color: "#94a3b8", fontSize: 12, alignItems: "center"
      }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <CalendarDays size={14} /> Bắt đầu: <strong style={{ color: "#e2e8f0" }}>{formatDate(project.start_date)}</strong>
        </span>
        <span>
          Kết thúc: <strong style={{ color: "#e2e8f0" }}>{formatDate(project.end_date)}</strong>
        </span>
      </div>
    </div>
  );
}

export default function ProjectCard({
  project, viewMode, copiedId, copyJoinCode, setSelectedProject, handleDeleteProject, onEditProject, onCompleteProject
}) {
  const completionPercent = project.tasks?.total > 0
    ? Math.round((project.tasks.completed / project.tasks.total) * 100)
    : 0;

  if (viewMode === "list") {
    return (
      <div className="dong-du-an-item">
        <div className="trai-dong-du-an" style={{ minWidth: 0, flex: 1 }}>
          <div className="avatar-du-an">{project.name.charAt(0).toUpperCase()}</div>
          <div style={{ minWidth: 0 }}>
            <h4 className="ten-du-an-item">{project.name}</h4>
            <span className={`huy-hieu-vai-tro ${project.role?.toLowerCase() === "owner" ? "chu-so-huu" : "thanh-vien"}`}>
              {project.role === "owner" ? "Owner" : "Member"}
            </span>
            <ProjectDetails project={project} compact />
          </div>
        </div>
        <div className="phai-dong-du-an">
          <div className="khung-ma-moi">
            <code className="gia-tri-ma-moi">{project.join_code}</code>
            <button className="nut-sao-chep" onClick={() => copyJoinCode(project.join_code, project.id)}
              title="Sao chép mã mời" aria-label="Sao chép mã mời">
              {copiedId === project.id ? <Check size={14} style={{ color: "#34d399" }} /> : <Copy size={14} />}
            </button>
          </div>
          <button className="nut-hanh-dong-the xem" onClick={() => setSelectedProject(project)}>
            <span>Truy cập</span><ExternalLink size={14} />
          </button>
          {project.role === "owner" && (
            <>
              <button className="nut-hanh-dong-the xem" onClick={() => onEditProject(project)} title="Chỉnh sửa dự án">
                <Pencil size={14} /> <span>Sửa</span>
              </button>
              {project.status !== "completed" && (
                <button className="nut-hanh-dong-the xem" onClick={() => onCompleteProject(project)} title="Đánh dấu hoàn thành dự án">
                  <CheckCircle2 size={14} /> <span>Hoàn thành</span>
                </button>
              )}
            </>
          )}
          {project.role === "owner" && (
            <>
              <button className="nut-hanh-dong-the xem" onClick={() => onEditProject?.(project)} title="Chỉnh sửa dự án">
                <Pencil size={14} /><span>Sửa</span>
              </button>
              {project.status !== "completed" && (
                <button className="nut-hanh-dong-the xem" onClick={() => onCompleteProject?.(project)} title="Đánh dấu hoàn thành dự án">
                  <CheckCircle2 size={14} /><span>Hoàn thành</span>
                </button>
              )}
            </>
          )}
          <button className="nut-hanh-dong-the xoa" onClick={() => handleDeleteProject(project.id, project.name)}
            title={project.role === "owner" ? "Xóa dự án" : "Rời dự án"}>
            <Trash2 size={14} /><span>{project.role === "owner" ? "Xóa dự án" : "Rời dự án"}</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="the-du-an-item">
      <div className="phan-dau-the">
        <div className="avatar-du-an">{project.name.charAt(0).toUpperCase()}</div>
        <div className="thong-tin-the">
          <h4 className="ten-du-an-item">{project.name}</h4>
          <div className="nhom-huy-hieu">
            <span className={`huy-hieu-vai-tro ${project.role?.toLowerCase() === "owner" ? "chu-so-huu" : "thanh-vien"}`}>
              {project.role === "owner" ? "Owner" : "Member"}
            </span>
            <span className={`huy-hieu-trang-thai ${project.status === "completed" ? "hoan-thanh" : "dang-lam"}`}>
              {project.status === "completed" ? "Hoàn thành" : "Đang làm"}
            </span>
          </div>
        </div>
      </div>
      <div className="phan-than-the">
        <ProjectDetails project={project} />
        {project.tasks && (
          <div className="phan-tien-do">
            <div className="thong-tin-tien-do">
              <span><CheckSquare size={12} /> Tiến độ</span>
              <span>{project.tasks.completed}/{project.tasks.total} Task ({completionPercent}%)</span>
            </div>
            <div className="thanh-nen-tien-do">
              <div className="thanh-lap-tien-do" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>
        )}
        <div className="khung-ma-moi">
          <span className="nhan-ma-moi">Mã mời:</span>
          <code className="gia-tri-ma-moi">{project.join_code}</code>
          <button className="nut-sao-chep"
            onClick={() => copyJoinCode(project.join_code, project.id)}
            title="Sao chép mã" aria-label="Sao chép mã mời">
            {copiedId === project.id ? <Check size={14} style={{ color: "#34d399" }} /> : <Copy size={14} />}
          </button>
        </div>
      </div>
      <div className="chan-the-du-an">
        <button type="button" className="nut-hanh-dong-the xem" onClick={() => setSelectedProject(project)}>
          <ExternalLink size={15} /><span>Truy cập dự án</span>
        </button>
        {project.role === "owner" && (
          <>
            <button type="button" className="nut-hanh-dong-the xem" onClick={() => onEditProject?.(project)} title="Chỉnh sửa dự án">
              <Pencil size={15} /><span>Sửa dự án</span>
            </button>
            {project.status !== "completed" && (
              <button type="button" className="nut-hanh-dong-the xem" onClick={() => onCompleteProject?.(project)} title="Đánh dấu hoàn thành dự án">
                <CheckCircle2 size={15} /><span>Hoàn thành</span>
              </button>
            )}
          </>
        )}
        <button type="button" className="nut-hanh-dong-the xoa"
          onClick={() => handleDeleteProject(project.id, project.name)}
          title={project.role === "owner" ? "Xóa dự án" : "Rời dự án"}>
          <Trash2 size={15} /><span>{project.role === "owner" ? "Xóa dự án" : "Rời dự án"}</span>
        </button>
      </div>
    </div>
  );
}
