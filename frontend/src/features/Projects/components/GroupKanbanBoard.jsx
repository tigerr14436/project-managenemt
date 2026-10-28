import React, { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Plus, Trash2, RefreshCw, Layers, Eye } from 'lucide-react';
import SubtaskDetail from './SubtaskDetail';

const COLUMNS = [
  ['todo', 'Cần làm', '#94a3b8'],
  ['in_progress', 'Đang làm', '#38bdf8'],
  ['review', 'Kiểm tra', '#fbbf24'],
  ['done', 'Hoàn thành', '#34d399'],
];
const API = 'http://127.0.0.1:8000';
async function request(projectId, groupId, suffix = '', options = {}) {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('Bạn cần đăng nhập lại');
  const response = await fetch(`${API}/api/projects/${encodeURIComponent(projectId)}/groups/${encodeURIComponent(groupId)}/kanban${suffix}`, {
    ...options,
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers },
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof data?.detail === 'string' ? data.detail : `HTTP ${response.status}`);
  return data;
}
const panel = { background: '#1e293b', border: '1px solid #334155', borderRadius: 14, padding: 16 };
const field = { width: '100%', background: '#0f172a', color: '#f8fafc', border: '1px solid #334155', padding: '10px', borderRadius: 8 };
const btn = { background: '#0284c7', color: 'white', border: 0, borderRadius: 8, padding: '9px 14px', cursor: 'pointer' };

export default function GroupKanbanBoard({ projectId, group, projectTasks = [], currentUserId, isProjectOwner, onBack, showNotification }) {
  const [data, setData] = useState({ tasks: [], subtasks: [] });
  const [detailId, setDetailId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [taskToAssign, setTaskToAssign] = useState('');
  const [form, setForm] = useState({ task_id: '', title: '', description: '', priority: 'medium', assignee_id: '' });
  const canManage = isProjectOwner || (!!currentUserId && group.leader_id === currentUserId);
  const members = group.members || [];
  const refresh = useCallback(async () => {
    setLoading(true);
    try { setData(await request(projectId, group.id)); setError(''); }
    catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [projectId, group.id]);
  useEffect(() => { refresh(); }, [refresh]);
  const execute = async (work, success) => {
    if (busy) return;
    setBusy(true);
    try { await work(); await refresh(); showNotification?.('thanh-cong', 'Thành công', success); }
    catch (e) { setError(e.message); showNotification?.('loi', 'Không thực hiện được', e.message); }
    finally { setBusy(false); }
  };
  const assign = () => {
    if (!taskToAssign) return;
    execute(async () => { await request(projectId, group.id, '/tasks', { method: 'POST', body: JSON.stringify({ task_id: taskToAssign }) }); setTaskToAssign(''); }, 'Đã giao Task cho nhóm');
  };
  const create = (e) => {
    e.preventDefault();
    if (!form.task_id || !form.title.trim()) return;
    execute(async () => {
      await request(projectId, group.id, '/subtasks', { method: 'POST', body: JSON.stringify({ ...form, title: form.title.trim(), assignee_id: form.assignee_id || null }) });
      setForm(prev => ({ ...prev, title: '', description: '' }));
    }, 'Đã tạo Subtask');
  };
  const changeStatus = (subtask, status) => execute(
    () => request(projectId, group.id, `/subtasks/${subtask.id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    'Đã cập nhật trạng thái'
  );
  const remove = (subtask) => {
    if (!window.confirm(`Xóa Subtask "${subtask.title}"?`)) return;
    execute(() => request(projectId, group.id, `/subtasks/${subtask.id}`, { method: 'DELETE' }), 'Đã xóa Subtask');
  };
  const unassign = (task) => {
    if (!window.confirm(`Gỡ Task "${task.title}" khỏi nhóm?`)) return;
    execute(() => request(projectId, group.id, `/tasks/${task.id}`, { method: 'DELETE' }), 'Đã gỡ Task');
  };
  const availableTasks = projectTasks.filter(t => !data.tasks.some(x => x.id === t.id));
  const detailSubtask = data.subtasks.find(s => s.id === detailId);
  if (detailSubtask) return <SubtaskDetail projectId={projectId} group={group} subtask={detailSubtask} parentTask={data.tasks.find(t=>t.id===detailSubtask.task_id)} currentUserId={currentUserId} isProjectOwner={isProjectOwner} onBack={()=>setDetailId(null)} onStatusChange={async(s,status)=>{await changeStatus(s,status)}} />;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, color: '#f8fafc' }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <button type="button" onClick={onBack} style={{ ...btn, background: '#334155' }}><ArrowLeft size={15} style={{ verticalAlign: 'middle' }} /> Chi tiết nhóm</button>
        <h3 style={{ margin: 0, fontSize: 20 }}><Layers size={19} style={{ verticalAlign: 'middle', color: '#38bdf8' }} /> Kanban nhóm: {group.name}</h3>
        <button type="button" onClick={refresh} style={{ ...btn, background: '#334155' }}><RefreshCw size={15} style={{ verticalAlign: 'middle' }} /> Tải lại</button>
      </div>
      {error && <div role="alert" style={{ padding: 12, borderRadius: 8, background: '#451a1a', color: '#fecaca' }}>{error}</div>}
      {isProjectOwner && <div style={panel}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Owner giao Task dự án cho nhóm</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <select aria-label="Chọn Task dự án" style={{ ...field, flex: 1 }} value={taskToAssign} onChange={e => setTaskToAssign(e.target.value)}>
            <option value="">-- Chọn Task chưa giao --</option>
            {availableTasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
          <button type="button" style={btn} disabled={busy || !taskToAssign} onClick={assign}>Giao Task</button>
        </div>
      </div>}
      <div style={panel}>
        <div style={{ fontWeight: 700, marginBottom: 10 }}>Task dự án được giao ({data.tasks.length})</div>
        {data.tasks.length === 0 ? <div style={{ color: '#94a3b8' }}>Chưa có Task nào được Owner giao cho nhóm.</div> :
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{data.tasks.map(t => <div key={t.id} style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center', padding: 10, background: '#0f172a', borderRadius: 8 }}>
            <div><strong>{t.title}</strong><div style={{ fontSize: 12, color: '#94a3b8' }}>{data.subtasks.filter(s => s.task_id === t.id).length} Subtask · {t.status}</div></div>
            {isProjectOwner && <button type="button" title="Gỡ Task khỏi nhóm" disabled={busy} onClick={() => unassign(t)} style={{ ...btn, background: '#7f1d1d' }}><Trash2 size={15} /></button>}
          </div>)}</div>}
      </div>
      {canManage && data.tasks.length > 0 && <form onSubmit={create} style={panel}>
        <div style={{ fontWeight: 700, marginBottom: 12 }}>Tạo Subtask mới</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 10 }}>
          <select required aria-label="Task cha" style={field} value={form.task_id} onChange={e => setForm(p => ({ ...p, task_id: e.target.value }))}>
            <option value="">-- Thuộc Task dự án --</option>
            {data.tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
          <input required maxLength={255} placeholder="Tên Subtask" style={field} value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          <select aria-label="Người thực hiện" style={field} value={form.assignee_id} onChange={e => setForm(p => ({ ...p, assignee_id: e.target.value }))}>
            <option value="">-- Chưa phân công --</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <select aria-label="Độ ưu tiên" style={field} value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
            <option value="low">Thấp</option><option value="medium">Trung bình</option><option value="high">Cao</option>
          </select>
        </div>
        <textarea placeholder="Mô tả Subtask (không bắt buộc)" style={{ ...field, marginTop: 10, minHeight: 64 }} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
        <button disabled={busy} style={{ ...btn, marginTop: 10 }} type="submit"><Plus size={15} style={{ verticalAlign: 'middle' }} /> Tạo Subtask</button>
      </form>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(235px, 1fr))', gap: 12, overflowX: 'auto', paddingBottom: 8 }}>
        {COLUMNS.map(([status, label, color]) => <section key={status} style={{ ...panel, padding: 12, minWidth: 235, alignSelf: 'start' }}>
          <h4 style={{ margin: '0 0 14px', color }}>{label} ({data.subtasks.filter(s => s.status === status).length})</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.subtasks.filter(s => s.status === status).map(s => {
              const allowed = canManage || s.assignee_id === currentUserId;
              return <article key={s.id} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: 12 }}>
                <strong style={{ fontSize: 14 }}>{s.title}</strong>
                <button type="button" onClick={()=>setDetailId(s.id)} style={{...btn,marginTop:10,background:'#334155',width:'100%',justifyContent:'center',display:'flex',gap:7,alignItems:'center'}}><Eye size={15}/> Xem chi tiết</button>
                {s.description && <p style={{ color: '#94a3b8', fontSize: 12, whiteSpace: 'pre-wrap' }}>{s.description}</p>}
                <div style={{ color: '#94a3b8', fontSize: 12, marginTop: 7 }}>Task: {data.tasks.find(t => t.id === s.task_id)?.title || '—'}</div>
                <div style={{ color: '#94a3b8', fontSize: 12 }}>Người làm: {s.assignee_name || 'Chưa phân công'}</div>
                <div style={{ color: '#94a3b8', fontSize: 12 }}>Ưu tiên: {s.priority}</div>
                {allowed && <select aria-label={`Đổi trạng thái ${s.title}`} disabled={busy} style={{ ...field, marginTop: 10 }} value={s.status} onChange={e => changeStatus(s, e.target.value)}>
                  {COLUMNS.map(([value, name]) => <option key={value} value={value}>{name}</option>)}
                </select>}
                {canManage && <button type="button" disabled={busy} onClick={() => remove(s)} style={{ marginTop: 8, background: 'transparent', border: 0, color: '#f87171', cursor: 'pointer' }}><Trash2 size={13} style={{ verticalAlign: 'middle' }} /> Xóa</button>}
              </article>;
            })}
            {!loading && data.subtasks.every(s => s.status !== status) && <div style={{ color: '#64748b', fontSize: 12 }}>Chưa có Subtask</div>}
          </div>
        </section>)}
      </div>
    </div>
  );
}
