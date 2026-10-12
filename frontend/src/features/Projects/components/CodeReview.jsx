import React, { useState } from 'react';
import { FileCode, Folder, MessageSquare, Send, CheckCircle2 } from 'lucide-react';

export default function CodeReview({ showNotification }) {
  const [fileList] = useState([
    { id: 1, name: 'src/App.js', content: "import React from 'react';\n\nfunction App() {\n  return (\n    <div className='App'>\n      <h1>DevTask Dashboard</h1>\n    </div>\n  );\n}\n\nexport default App;" },
    { id: 2, name: 'src/api/auth.js', content: "export async function login(credentials) {\n  const res = await fetch('/api/login', { method: 'POST', body: JSON.stringify(credentials) });\n  return res.json();\n}" }
  ]);

  const [selectedFile, setSelectedFile] = useState(fileList[0]);
  const [commentList, setCommentList] = useState([
    { id: 1, author: 'Shut Heast', content: 'Đoạn này cần thêm kiểm tra token trước khi gọi API.', time: '12 phút trước', line: 2 }
  ]);
  const [newComment, setNewComment] = useState('');

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newCommentItem = {
      id: Date.now(),
      author: 'Shut Heast',
      content: newComment.trim(),
      time: 'Vừa xong',
      line: 1
    };

    setCommentList((prev) => [...prev, newCommentItem]);
    setNewComment('');
    showNotification('thanh-cong', 'Thành công', 'Đã gửi bình luận mã nguồn');
  };

  return (
    <div className="khung-quan-ly-code" style={{ marginTop: '24px' }}>
      <div className="header-code-row">
        <h3><FileCode size={20} style={{ color: '#38bdf8' }} /> Xem Code & Bình Luận (Code Review)</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '16px' }}>
        <div className="the-box-inline" style={{ margin: 0, padding: '12px' }}>
          <h4 style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '10px' }}><Folder size={14} /> Cấu trúc Tệp</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {fileList.map((file) => (
              <button
                key={file.id}
                onClick={() => setSelectedFile(file)}
                style={{
                  background: selectedFile.id === file.id ? '#1e293b' : 'transparent',
                  border: 'none',
                  color: selectedFile.id === file.id ? '#38bdf8' : '#cbd5e1',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <FileCode size={14} /> {file.name}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '13px', color: '#818cf8', fontWeight: 600, marginBottom: '8px', borderBottom: '1px solid #1e293b', paddingBottom: '8px' }}>
              📁 {selectedFile.name}
            </div>
            <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '13px', color: '#e2e8f0', overflowX: 'auto', lineHeight: '1.5' }}>
              {selectedFile.content}
            </pre>
          </div>

          <div className="commit-box-container">
            <h4><MessageSquare size={16} style={{ color: '#38bdf8' }} /> Thảo luận / Bình luận về mã nguồn ({commentList.length})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              {commentList.map((comment) => (
                <div key={comment.id} style={{ background: '#1e293b', padding: '10px 14px', borderRadius: '8px', border: '1px solid #334155' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <strong style={{ color: '#818cf8' }}>{comment.author}</strong>
                    <span style={{ color: '#64748b' }}>{comment.time}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '13px', color: '#f8fafc' }}>{comment.content}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendComment} style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Viết bình luận cho mã nguồn này..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="o-nhap-lieu"
                style={{ flex: 1 }}
                required
              />
              <button type="submit" className="nut-chinh">
                <Send size={14} /> Gửi
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}