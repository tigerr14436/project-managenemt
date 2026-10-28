import React, { useState } from 'react';
import { DollarSign, Plus, Trash2, Calculator, PieChart, Layers, Calendar, Clock, CheckSquare } from 'lucide-react';

export default function ProjectCostCalculator({ projectTasks = [], showNotification }) {
  // 3. Ước lượng chi phí (Chi phí cố định, hạ tầng, nhân sự,...)
  const [costItems, setCostItems] = useState([
    { id: 1, name: 'Thuê Hosting & Domain (Năm 2026)', category: 'Dịch vụ hạ tầng', amount: 2500000 },
    { id: 2, name: 'Nhân sự Backend (Lương tháng)', category: 'Nhân sự', amount: 15000000 },
    { id: 3, name: 'Bản quyền công cụ / API bên thứ 3', category: 'Công cụ', amount: 1200000 }
  ]);

  const [newItem, setNewItem] = useState({ name: '', category: 'Nhân sự', amount: '' });
  const [budgetLimit, setBudgetLimit] = useState(30000000); // Ngân sách dự kiến

  // 4. Lịch trình dự án (Thời gian bắt đầu & kết thúc tổng quan)
  const [projectSchedule, setProjectSchedule] = useState({
    startDate: '2026-06-01',
    endDate: '2026-08-30',
    phase: 'Giai đoạn phát triển tính năng cốt lõi'
  });

  const totalCost = costItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const remainingBudget = budgetLimit - totalCost;

  const handleAddCost = (e) => {
    e.preventDefault();
    if (!newItem.name.trim() || !newItem.amount) {
      showNotification?.("loi", "Lỗi", "Vui lòng nhập đầy đủ tên khoản phí và số tiền!");
      return;
    }

    const item = {
      id: Date.now(),
      name: newItem.name.trim(),
      category: newItem.category,
      amount: parseFloat(newItem.amount)
    };

    setCostItems(prev => [...prev, item]);
    setNewItem({ name: '', category: 'Nhân sự', amount: '' });
    showNotification?.("thanh-cong", "Thành công", "Đã thêm khoản chi phí mới.");
  };

  const handleDeleteCost = (id) => {
    setCostItems(prev => prev.filter(item => item.id !== id));
    showNotification?.("can-bao", "Đã xóa", "Đã xóa khoản chi phí khỏi danh sách.");
  };

  const formatVND = (num) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(num);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '30px' }}>
      
      {/* 4. & 5. LỊCH TRÌNH DỰ ÁN & THỜI GIAN */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '44px', height: '44px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calendar size={22} />
          </div>
          <div>
            <h4 style={{ color: '#f8fafc', fontSize: '16px', margin: '0 0 4px 0' }}>4. Lịch Trình Dự Án & Thời Gian</h4>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>Giai đoạn: <strong>{projectSchedule.phase}</strong></span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', background: '#0f172a', padding: '10px 16px', borderRadius: '10px', border: '1px solid #334155' }}>
          <div>
            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Bắt đầu</span>
            <input 
              type="date" 
              value={projectSchedule.startDate}
              onChange={(e) => setProjectSchedule({ ...projectSchedule, startDate: e.target.value })}
              style={{ background: 'transparent', color: '#38bdf8', border: 'none', fontSize: '13px', outline: 'none', fontWeight: 'bold' }}
            />
          </div>
          <span style={{ color: '#64748b' }}>➔</span>
          <div>
            <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>Kết thúc (Deadline)</span>
            <input 
              type="date" 
              value={projectSchedule.endDate}
              onChange={(e) => setProjectSchedule({ ...projectSchedule, endDate: e.target.value })}
              style={{ background: 'transparent', color: '#38bdf8', border: 'none', fontSize: '13px', outline: 'none', fontWeight: 'bold' }}
            />
          </div>
        </div>
      </div>

      {/* 3. ƯỚC LƯỢNG CHI PHÍ & NGÂN SÁCH (TỔNG QUAN) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Calculator size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Tổng Ngân Sách Dự Kiến</div>
            <input 
              type="number" 
              value={budgetLimit} 
              onChange={(e) => setBudgetLimit(Number(e.target.value))}
              style={{ background: '#0f172a', color: '#38bdf8', border: '1px solid #334155', padding: '4px 8px', borderRadius: '6px', fontSize: '16px', fontWeight: 'bold', width: '150px', outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DollarSign size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Tổng Chi Phí Thực Tế</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f8fafc' }}>{formatVND(totalCost)}</div>
          </div>
        </div>

        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', background: remainingBudget >= 0 ? 'rgba(52, 211, 153, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: remainingBudget >= 0 ? '#34d399' : '#ef4444', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PieChart size={24} />
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>Ngân Sách Còn Lại</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold', color: remainingBudget >= 0 ? '#34d399' : '#ef4444' }}>
              {formatVND(remainingBudget)}
            </div>
          </div>
        </div>

      </div>

      {/* 1. & 5. BẢNG CÔNG VIỆC & LỊCH TRÌNH CÔNG VIỆC (TỪ KANBAN) */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px' }}>
        <h4 style={{ color: '#f8fafc', fontSize: '16px', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckSquare size={18} style={{ color: '#38bdf8' }} /> 1. & 5. Bảng Công Việc & Lịch Trình Công Việc (Từ Kanban)
        </h4>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', color: '#f8fafc' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '10px' }}>Tên Task / Công việc</th>
                <th style={{ padding: '10px' }}>Trạng thái</th>
                <th style={{ padding: '10px' }}>Ưu tiên</th>
                <th style={{ padding: '10px' }}>Người thực hiện</th>
                <th style={{ padding: '10px' }}>Deadline (Lịch trình công việc)</th>
              </tr>
            </thead>
            <tbody>
              {projectTasks && projectTasks.length > 0 ? (
                projectTasks.map((task) => (
                  <tr key={task.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '12px', fontWeight: 500 }}>{task.title}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: task.status === 'done' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(56, 189, 248, 0.1)', color: task.status === 'done' ? '#34d399' : '#38bdf8', padding: '3px 8px', borderRadius: '6px', fontSize: '11px' }}>
                        {task.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', color: task.priority === 'high' ? '#ef4444' : '#fbbf24' }}>{task.priority}</td>
                    <td style={{ padding: '12px' }}>{task.assignee || 'Chưa gán'}</td>
                    <td style={{ padding: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} /> {task.deadline ? task.deadline.split('T')[0] : 'Không có'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '25px', color: '#64748b', fontStyle: 'italic' }}>
                    Chưa có công việc nào trong bảng Kanban của dự án.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FORM & BẢNG ƯỚC LƯỢNG CHI PHÍ */}
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '16px', padding: '20px' }}>
        <h4 style={{ color: '#f8fafc', fontSize: '16px', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={18} style={{ color: '#38bdf8' }} /> 3. Ước Lượng Chi Phí (Thêm / Quản lý khoản phí)
        </h4>

        <form onSubmit={handleAddCost} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', alignItems: 'end', marginBottom: '20px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Tên khoản phí</label>
            <input
              type="text"
              placeholder="VD: Tiền server AWS..."
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '9px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Danh mục</label>
            <select
              value={newItem.category}
              onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '9px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
            >
              <option value="Nhân sự">Nhân sự</option>
              <option value="Dịch vụ hạ tầng">Dịch vụ hạ tầng</option>
              <option value="Công cụ">Công cụ & Phần mềm</option>
              <option value="Phát sinh">Phát sinh khác</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>Số tiền (VNĐ)</label>
            <input
              type="number"
              placeholder="VD: 1500000"
              value={newItem.amount}
              onChange={(e) => setNewItem({ ...newItem, amount: e.target.value })}
              style={{ width: '100%', background: '#0f172a', color: '#fff', border: '1px solid #334155', padding: '9px 12px', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
              required
            />
          </div>

          <button
            type="submit"
            style={{ background: '#38bdf8', color: '#0f172a', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', height: '39px' }}
          >
            <Plus size={16} /> Thêm Khoản Phí
          </button>
        </form>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px', color: '#f8fafc' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94a3b8' }}>
                <th style={{ padding: '10px' }}>Khoản chi phí</th>
                <th style={{ padding: '10px' }}>Danh mục</th>
                <th style={{ padding: '10px' }}>Số tiền</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {costItems.length > 0 ? (
                costItems.map((item) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '12px', fontWeight: 500 }}>{item.name}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{ background: '#0f172a', border: '1px solid #334155', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', color: '#38bdf8' }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontWeight: 'bold', color: '#34d399' }}>{formatVND(item.amount)}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteCost(item.id)}
                        style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                        title="Xóa khoản phí"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontStyle: 'italic' }}>
                    Chưa có khoản chi phí nào được ghi nhận.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}