import React, { useState } from 'react';
import { MessageSquare, Send, Minus, Users } from 'lucide-react';
import './ProjectChat.css';

export default function ProjectChat({ groups = [], currentUserName = "Shut Heast" }) {
  const [moChat, setMoChat] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || "");
  
  // Lưu trữ tin nhắn riêng biệt theo ID của từng nhóm
  const [tinNhanTheoNhom, setTinNhanTheoNhom] = useState({
    101: [
      { id: 1, sender: 'Nguyễn Văn A', text: 'Chào mọi người, API backend đã sẵn sàng!', time: '10:30 AM' }
    ],
    102: [
      { id: 1, sender: 'Trần Thị B', text: 'Team Frontend check lại giao diện nhé.', time: '11:00 AM' }
    ]
  });
  const [tinNhanMoi, setTinNhanMoi] = useState('');

  // Lấy nhóm hiện tại dựa trên ID đang chọn trong dropdown
  const currentGroup = groups.find(g => g.id.toString() === selectedGroupId.toString()) || groups[0];
  const danhSachTinNhanHienTai = currentGroup ? (tinNhanTheoNhom[currentGroup.id] || []) : [];

  const guiTinNhan = (e) => {
    e.preventDefault();
    if (!tinNhanMoi.trim() || !currentGroup) return;

    const tinNhanMoiItem = {
      id: Date.now(),
      sender: currentUserName,
      text: tinNhanMoi.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setTinNhanTheoNhom((prev) => ({
      ...prev,
      [currentGroup.id]: [...(prev[currentGroup.id] || []), tinNhanMoiItem]
    }));

    setTinNhanMoi('');
  };

  return (
    <div className="khung-bong-bong-chat">
      {/* Cửa sổ Popup Chat */}
      {moChat && (
        <div className="cua-so-chat-popup">
          <div className="header-cua-so-chat">
            <div className="tieu-de-chat-nhom" style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={16} style={{ color: '#34d399' }} />
                  <span>Chat Nội Bộ Nhóm</span>
                </div>
                <button className="nut-thu-gon-chat" onClick={() => setMoChat(false)}>
                  <Minus size={14} />
                </button>
              </div>

              {/* Dropdown chọn nhóm ngay trong khung chat */}
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                style={{ background: '#1e293b', color: '#fff', border: '1px solid #334155', padding: '5px 8px', borderRadius: '6px', fontSize: '12px', outline: 'none', width: '100%', cursor: 'pointer' }}
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    📁 {g.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="than-noi-dung-chat">
            <div className="danh-sach-tin-nhan-scroll">
              {currentGroup && danhSachTinNhanHienTai.length > 0 ? (
                danhSachTinNhanHienTai.map((msg) => {
                  const laToi = msg.sender === currentUserName;
                  return (
                    <div key={msg.id} className={`dong-tin-nhan ${laToi ? 'cua-toi' : 'cua-nguoi-khac'}`}>
                      <span className="thong-tin-nguoi-gui">{msg.sender} • {msg.time}</span>
                      <div className="bong-bong-noi-dung">{msg.text}</div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', color: '#64748b', fontSize: '12px', marginTop: '40px', fontStyle: 'italic' }}>
                  Chưa có tin nhắn nào trong nhóm này. Hãy bắt đầu cuộc trò chuyện!
                </div>
              )}
            </div>

            <form onSubmit={guiTinNhan} className="form-nhap-tin-nhan">
              <input
                type="text"
                placeholder={currentGroup ? `Nhắn tin trong ${currentGroup.name}...` : "Chọn nhóm để chat..."}
                value={tinNhanMoi}
                onChange={(e) => setTinNhanMoi(e.target.value)}
                className="o-nhap-lieu-chat"
              />
              <button type="submit" className="nut-gui-chat">
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Nút bong bóng chat tròn nổi ở góc phải dưới */}
      {!moChat && (
        <button className="nut-bong-bong-chat" onClick={() => setMoChat(true)} title="Mở chat nội bộ nhóm">
          <MessageSquare size={22} />
          <span className="huy-hieu-so-tin-nhan">{groups.length}</span>
        </button>
      )}
    </div>
  );
}