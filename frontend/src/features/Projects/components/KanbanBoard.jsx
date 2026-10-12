import React from 'react';
import { Plus, User, Clock, ArrowLeft, ChevronRight, Loader2, Edit3, Trash2 } from 'lucide-react';

const COLUMN_LIST = [
  { key: 'todo', label: 'Cần làm', dot: '#60a5fa' },
  { key: 'in_progress', label: 'Đang làm', dot: '#f59e0b' },
  { key: 'review', label: 'Kiểm thử / Review', dot: '#a855f7' },
  { key: 'done', label: 'Hoàn thành', dot: '#10b981' },
];

function formatDate(isoString) {
  if (!isoString) return 'Chưa đặt hạn';
  return new Date(isoString).toLocaleDateString('vi-VN');
}

export default function KanbanBoard({
  projectTasks,
  isLoadingTasks,
  changeTaskStatus,
  openTaskModal,
  editTask,
  deleteTask
}) {
  if (isLoadingTasks) {
    return (
      <div className="trang-thai-trong">
        <Loader2 size={32} className="icon-quay" />
        <p>Đang tải công việc...</p>
      </div>
    );
  }

  return (
    <div className="luoi-bang-kanban">
      {COLUMN_LIST.map((column) => {
        const tasksInColumn = projectTasks.filter((t) => t.status === column.key);

        return (
          <div className="cot-kanban" key={column.key}>
            <div className="header-cot-kanban">
              <div className="nhom-tieu-de-cot">
                <div className="cham-mau-cot" style={{ background: column.dot }}></div>
                <h4>{column.label}</h4>
              </div>
              <span className="huy-hieu-so-luong-task">{tasksInColumn.length}</span>
            </div>

            <div className="danh-sach-task-kanban">
              {tasksInColumn.map((task) => {
                const columnIndex = COLUMN_LIST.findIndex((c) => c.key === column.key);
                const prevColumn = COLUMN_LIST[columnIndex - 1];
                const nextColumn = COLUMN_LIST[columnIndex + 1];

                return (
                  <div key={task.id} className="the-task-item">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className={`nhan-muc-do ${task.priority === 'high' ? 'cao' : task.priority === 'medium' ? 'trung-binh' : 'thap'}`}>
                        {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                      </span>

                      <div className="nhom-nut-thao-tac-task">
                        <button
                          className="nut-icon-sub"
                          title="Chỉnh sửa công việc"
                          onClick={() => editTask(task)}
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          className="nut-icon-sub nut-xoa"
                          title="Xóa công việc"
                          onClick={() => deleteTask(task.id, task.title)}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <h5 className="tieu-de-task">{task.title}</h5>
                    <p className="mo-ta-task">{task.description || 'Chưa có mô tả chi tiết'}</p>

                    <div className="chan-task">
                      <span className="nguoi-thuc-hien"><User size={12} /> {task.assignee || 'Chưa phân công'}</span>
                      <span className="han-chot-task"><Clock size={12} /> {formatDate(task.deadline)}</span>
                    </div>

                    <div className="khung-hanh-dong-task">
                      {prevColumn && (
                        <button className="nut-chuyen-trang-thai" onClick={() => changeTaskStatus(task.id, prevColumn.key)}>
                          <ArrowLeft size={12} /> {prevColumn.label}
                        </button>
                      )}
                      {nextColumn && (
                        <button className="nut-chuyen-trang-thai" onClick={() => changeTaskStatus(task.id, nextColumn.key)}>
                          {nextColumn.label} <ChevronRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <button className="nut-them-task-trong-cot" onClick={() => openTaskModal(column.key)}>
                <Plus size={14} /> Thêm task mới
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}