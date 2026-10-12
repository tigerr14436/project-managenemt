import React from 'react';
import { CheckSquare, Copy, Check, ExternalLink, Trash2 } from 'lucide-react';

export default function ProjectCard({ project, viewMode, copiedId, copyJoinCode, setSelectedProject, handleDeleteProject }) {
  const completionPercent = project.tasks?.total > 0
    ? Math.round((project.tasks.completed / project.tasks.total) * 100)
    : 0;

  if (viewMode === 'list') {
    return (
      <div className="dong-du-an-item">
        <div className="trai-dong-du-an">
          <div className="avatar-du-an">{project.name.charAt(0).toUpperCase()}</div>
          <div>
            <h4 className="ten-du-an-item">{project.name}</h4>
            <span className={`huy-hieu-vai-tro ${project.role?.toLowerCase() === 'owner' ? 'chu-so-huu' : 'thanh-vien'}`}>
              {project.role === 'owner' ? 'Owner' : 'Member'}
            </span>
          </div>
        </div>
        <div className="phai-dong-du-an">
          <div className="khung-ma-moi">
            <code className="gia-tri-ma-moi">{project.join_code}</code>
            <button className="nut-sao-chep" onClick={() => copyJoinCode(project.join_code, project.id)}>
              {copiedId === project.id ? <Check size={14} style={{ color: '#34d399' }} /> : <Copy size={14} />}
            </button>
          </div>
          <button className="nut-hanh-dong-the xem" onClick={() => setSelectedProject(project)}>
            <span>Truy cập</span>
            <ExternalLink size={14} />
          </button>
          <button className="nut-hanh-dong-the xoa" onClick={() => handleDeleteProject(project.id, project.name)}>
            <Trash2 size={14} />
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
            <span className={`huy-hieu-vai-tro ${project.role?.toLowerCase() === 'owner' ? 'chu-so-huu' : 'thanh-vien'}`}>
              {project.role === 'owner' ? 'Owner' : 'Member'}
            </span>
            <span className={`huy-hieu-trang-thai ${project.status === 'completed' ? 'hoan-thanh' : 'dang-lam'}`}>
              {project.status === 'completed' ? 'Hoàn thành' : 'Đang làm'}
            </span>
          </div>
        </div>
      </div>

      <div className="phan-than-the">
        {project.tasks && (
          <div className="phan-tien-do">
            <div className="thong-tin-tien-do">
              <span><CheckSquare size={12} /> Tiến độ</span>
              <span>{project.tasks.completed}/{project.tasks.total} Task ({completionPercent}%)</span>
            </div>
            <div className="thanh-nen-tien-do">
              <div className="thanh-lap-tien-do" style={{ width: `${completionPercent}%` }}></div>
            </div>
          </div>
        )}

        <div className="khung-ma-moi">
          <span className="nhan-ma-moi">Mã mời:</span>
          <code className="gia-tri-ma-moi">{project.join_code}</code>
          <button
            className="nut-sao-chep"
            onClick={() => copyJoinCode(project.join_code, project.id)}
            title="Sao chép mã"
          >
            {copiedId === project.id ? <Check size={14} style={{ color: '#34d399' }} /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      <div className="chan-the-du-an">
        <button className="nut-hanh-dong-the xem" onClick={() => setSelectedProject(project)}>
          <span>Truy cập Dự án & Workspace</span>
          <ExternalLink size={14} />
        </button>
        <button className="nut-hanh-dong-the xoa" onClick={() => handleDeleteProject(project.id, project.name)} title="Xóa dự án">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}