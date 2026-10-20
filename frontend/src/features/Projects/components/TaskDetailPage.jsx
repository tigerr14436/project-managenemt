import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, User, GitCommit, FileCode, MessageSquare, Send, Timer, Play, Pause, RotateCcw } from 'lucide-react';

export default function TaskDetailPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();

  // Dữ liệu mẫu của task (Trong thực tế bạn có thể gọi API lấy thông tin task dựa vào taskId)
  const [task, setTask] = useState({
    id: taskId,
    title: "Thiết kế API Đăng nhập OAuth2",
    description: "Xây dựng luồng xác thực người dùng sử dụng JWT token và tích hợp đăng nhập mạng xã hội.",
    priority: "high",
    assignee: "Shut Heast",
    deadline: "2026-06-30",
    status: "in_progress"
  });

  const [taskComments, setTaskComments] = useState([
    { id: 1, author: "Shut Heast", content: "Đã liên kết nhánh dev vào task này.", time: "15 phút trước" },
  ]);
  const [newTaskComment, setNewTaskComment] = useState("");

  // State Pomodoro Thông Minh
  const [pomoMode, setPomoMode] = useState("work"); 
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isPomoRunning, setIsPomoRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  useEffect(() => {
    let timer = null;
    if (isPomoRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPomoRunning) {
      setIsPomoRunning(false);
      if (pomoMode === "work") {
        setCompletedPomodoros((prev) => prev + 1);
        alert("Hoàn thành phiên Pomodoro! Đã ghi nhận 1 phiên làm việc cho task này.");
      }
    }
    return () => clearInterval(timer);
  }, [isPomoRunning, timeLeft, pomoMode]);

  const switchPomoMode = (mode) => {
    setIsPomoRunning(false);
    setPomoMode(mode);
    if (mode === "work") setTimeLeft(25 * 60);
    else if (mode === "shortBreak") setTimeLeft(5 * 60);
    else if (mode === "longBreak") setTimeLeft(15 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!newTaskComment.trim()) return;
    setTaskComments((prev) => [
      ...prev,
      { id: Date.now(), author: "Shut Heast", content: newTaskComment.trim(), time: "Vừa xong" }
    ]);
    setNewTaskComment("");
  };

  return (
    <div className="khung-quan-ly-du-an" style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/project')} 
        style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', marginBottom: '20px' }}
      >
        <ArrowLeft size={16} /> Quay lại Dự án / Kanban
      </button>

      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
        
        {/* Tiêu đề & Mức độ ưu tiên */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
          <span className={`nhan-muc-do ${task.priority === 'high' ? 'cao' : task.priority === 'medium' ? 'trung-binh' : 'thap'}`}>
            {task.priority === 'high' ? 'Cao' : task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
          </span>
          <h2 style={{ color: '#f8fafc', fontSize: '20px', margin: 0 }}>{task.title}</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px' }}>
          
          {/* Cột bên trái: Mô tả, Code & Thảo luận */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '6px' }}>Mô tả chi tiết</label>
              <p style={{ background: '#0f172a', padding: '14px', borderRadius: '8px', border: '1px solid #334155', color: '#f8fafc', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
                {task.description}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', background: '#0f172a', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Người thực hiện</span>
                <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <User size={14} style={{ color: '#38bdf8' }} /> {task.assignee}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '11px', color: '#64748b', display: 'block', marginBottom: '2px' }}>Hạn hoàn thành</span>
                <span style={{ fontSize: '13px', color: '#cbd5e1', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} style={{ color: '#fbbf24' }} /> {task.deadline}
                </span>
              </div>
            </div>

            {/* Thảo luận */}
            <div style={{ background: '#0f172a', padding: '16px', borderRadius: '12px', border: '1px solid #334155' }}>
              <h5 style={{ fontSize: '13px', color: '#34d399', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MessageSquare size={14} /> Thảo luận về Task ({taskComments.length})
              </h5>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                {taskComments.map((c) => (
                  <div key={c.id} style={{ background: '#1e293b', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                      <strong style={{ color: '#818cf8' }}>{c.author}</strong>
                      <span style={{ color: '#64748b' }}>{c.time}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#f8fafc' }}>{c.content}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendComment} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Viết bình luận..."
                  value={newTaskComment}
                  onChange={(e) => setNewTaskComment(e.target.value)}
                  className="o-nhap-lieu"
                  style={{ flex: 1, fontSize: '13px', padding: '8px 12px' }}
                  required
                />
                <button type="submit" className="nut-chinh" style={{ padding: '8px 14px', fontSize: '13px' }}>
                  <Send size={12} /> Gửi
                </button>
              </form>
            </div>
          </div>

          {/* Cột bên phải: Đồng hồ Pomodoro Thông Minh */}
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '16px', textAlign: 'center', height: 'fit-content' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '13px', color: '#38bdf8', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Timer size={16} /> Pomodoro
              </span>
              <span style={{ fontSize: '11px', color: '#34d399', background: 'rgba(52, 211, 153, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                Đã xong: <strong>{completedPomodoros}</strong>
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '14px' }}>
              <button
                onClick={() => switchPomoMode("work")}
                style={{ background: pomoMode === "work" ? '#6366f1' : '#1e293b', color: '#fff', border: '1px solid #334155', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
              >
                Tập trung
              </button>
              <button
                onClick={() => switchPomoMode("shortBreak")}
                style={{ background: pomoMode === "shortBreak" ? '#10b981' : '#1e293b', color: '#fff', border: '1px solid #334155', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
              >
                Nghỉ ngắn
              </button>
              <button
                onClick={() => switchPomoMode("longBreak")}
                style={{ background: pomoMode === "longBreak" ? '#f59e0b' : '#1e293b', color: '#fff', border: '1px solid #334155', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 600 }}
              >
                Nghỉ dài
              </button>
            </div>

            <div style={{ fontSize: '36px', fontWeight: 800, color: '#f8fafc', fontFamily: 'monospace', marginBottom: '14px' }}>
              {formatTime(timeLeft)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <button
                onClick={() => setIsPomoRunning(!isPomoRunning)}
                style={{ background: isPomoRunning ? '#ef4444' : '#10b981', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                {isPomoRunning ? <><Pause size={12} /> Tạm dừng</> : <><Play size={12} /> Bắt đầu</>}
              </button>
              <button
                onClick={() => {
                  setIsPomoRunning(false);
                  if (pomoMode === "work") setTimeLeft(25 * 60);
                  else if (pomoMode === "shortBreak") setTimeLeft(5 * 60);
                  else setTimeLeft(15 * 60);
                }}
                style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', padding: '8px 10px', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}
                title="Đặt lại"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}