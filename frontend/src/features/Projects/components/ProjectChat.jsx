import React, { useState } from 'react';
import { MessageSquare, Send, X, Users, Minus } from 'lucide-react';
import './ProjectChat.css';

export default function ProjectChat({ hienThongBao }) {
  const [moChat, setMoChat] = useState(false);
  const [danhSachTinNhan, setDanhSachTinNhan] = useState([
    { id: 1, sender: 'Nguyễn Văn A', text: 'Chào mọi người, API backend đã sẵn sàng trên branch dev nhé!', time: '10:30 AM' },
    { id: 2, sender: 'Trần Thị B', text: 'Tuyệt vời, để mình pull code về kiểm thử giao diện Kanban.', time: '10:32 AM' }
  ]);
  const [tinNhanMoi, setTinNhanMoi] = useState('');

  const guiTinNhan = (e) => {
    e.preventDefault();
    if (!tinNhanMoi.trim()) return;

    const tinNhanMoiItem = {
      id: Date.now(),
      sender: 'Shut Heast',
      text: tinNhanMoi.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setDanhSachTinNhan((prev) => [...prev, tinNhanMoiItem]);
    setTinNhanMoi('');
  };

  return (
    <div className="khung-bong-bong-chat">
      {/* Cửa sổ Popup Chat khi bấm vào bong bóng */}
      {moChat && (
        <div className="cua-so-chat-popup">
          <div className="header-cua-so-chat">
            <div className="tieu-de-chat-nhom">
              <MessageSquare size={16} style={{ color: '#34d399' }} />
              <span>Thảo Luận Nhóm Dự Án</span>
            </div>
            <div className="nhom-nut-header-chat">
              <button className="nut-thu-gon-chat" onClick={() => setMoChat(false)}>
                <Minus size={14} />
              </button>
            </div>
          </div>

          <div className="than-noi-dung-chat">
            <div className="danh-sach-tin-nhan-scroll">
              {danhSachTinNhan.map((msg) => {
                const laToi = msg.sender === 'Shut Heast';
                return (
                  <div key={msg.id} className={`dong-tin-nhan ${laToi ? 'cua-toi' : 'cua-nguoi-khac'}`}>
                    <span className="thong-tin-nguoi-gui">{msg.sender} • {msg.time}</span>
                    <div className="bong-bong-noi-dung">{msg.text}</div>
                  </div>
                );
              })}
            </div>

            <form onSubmit={guiTinNhan} className="form-nhap-tin-nhan">
              <input
                type="text"
                placeholder="Nhập tin nhắn..."
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
        <button className="nut-bong-bong-chat" onClick={() => setMoChat(true)} title="Mở chat nhóm dự án">
          <MessageSquare size={22} />
          <span className="huy-hieu-so-tin-nhan">{danhSachTinNhan.length}</span>
        </button>
      )}
    </div>
  );
}