import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Play, Pause, Square, RotateCcw, Clock3, Volume2, VolumeX } from 'lucide-react';
const base='http://127.0.0.1:8000';
const panel={background:'#1e293b',border:'1px solid #334155',borderRadius:14,padding:18};
const button={background:'#0284c7',border:0,borderRadius:8,color:'#fff',padding:'10px 14px',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:7};
const statuses={todo:'Cần làm',in_progress:'Đang làm',review:'Kiểm tra',done:'Hoàn thành'};
const priorities={low:'Thấp',medium:'Trung bình',high:'Cao'};
const fmt=n=>{n=Math.max(0,Math.floor(n));return `${String(Math.floor(n/3600)).padStart(2,'0')}:${String(Math.floor(n%3600/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`};
export default function SubtaskDetail({projectId,group,subtask,parentTask,currentUserId,isProjectOwner,onBack,onStatusChange}){
 const audioRef=useRef(null);
 const [soundOn,setSoundOn]=useState(()=>localStorage.getItem('devtask_focus_sound')!=='off');
 const [soundType,setSoundType]=useState(()=>localStorage.getItem('devtask_focus_tone')||'gentle');
 const [focus,setFocus]=useState({active:null,total_seconds:0,sessions:[]});
 const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [now,setNow]=useState(Date.now());const [reminder,setReminder]=useState(45);const [notified,setNotified]=useState(false);
 const canWork=isProjectOwner||group.leader_id===currentUserId||subtask.assignee_id===currentUserId;
 const path=`/api/projects/${projectId}/groups/${group.id}/kanban/subtasks/${subtask.id}/focus`;
 const call=async(suffix='',method='GET')=>{const res=await fetch(base+path+suffix,{method,headers:{Authorization:`Bearer ${localStorage.getItem('access_token')}`}});const json=await res.json().catch(()=>null);if(!res.ok)throw new Error(json?.detail||`HTTP ${res.status}`);return json};
 const load=async()=>{try{setFocus(await call());setError('')}catch(e){setError(e.message)}};
 useEffect(()=>{load();setNotified(false)},[subtask.id]);
 useEffect(()=>{const id=setInterval(()=>setNow(Date.now()),1000);return()=>clearInterval(id)},[]);
 // Web Audio tạo chuông ngay trong trình duyệt, không cần tải file âm thanh.
 const playBell=()=>{
  try {
   const AudioContextClass=window.AudioContext||window.webkitAudioContext;
   if(!AudioContextClass)return;
   const ctx=audioRef.current||new AudioContextClass();audioRef.current=ctx;
   if(ctx.state==='suspended')ctx.resume();
   const notes=soundType==='double'?[[0,784,.18],[.28,988,.24]]:soundType==='digital'?[[0,880,.12],[.17,880,.12],[.34,1174,.2]]:[[0,659,.25],[.32,784,.35]];
   const t=ctx.currentTime+.03;
   notes.forEach(([delay,freq,duration])=>{
    const osc=ctx.createOscillator(),gain=ctx.createGain();
    osc.type=soundType==='digital'?'square':'sine';osc.frequency.value=freq;
    gain.gain.setValueAtTime(.0001,t+delay);
    gain.gain.exponentialRampToValueAtTime(soundType==='digital'?.035:.12,t+delay+.02);
    gain.gain.exponentialRampToValueAtTime(.0001,t+delay+duration);
    osc.connect(gain);gain.connect(ctx.destination);osc.start(t+delay);osc.stop(t+delay+duration+.02);
   });
  }catch(e){setError('Trình duyệt không phát được âm báo: '+e.message)}
 };
 useEffect(()=>{localStorage.setItem('devtask_focus_sound',soundOn?'on':'off')},[soundOn]);
 useEffect(()=>{localStorage.setItem('devtask_focus_tone',soundType)},[soundType]);
 const a=focus.active;
 const live=a?.status==='running'&&a.resumed_at?Math.max(0,Math.floor((now-Date.parse(a.resumed_at))/1000)):0;
 const seconds=(a?.elapsed_seconds||0)+live;
 useEffect(()=>{if(a?.status==='running'&&seconds>=reminder*60&&!notified){setNotified(true);if(soundOn)playBell()}},[seconds,reminder,a?.status,notified,soundOn]);
 const action=async(suffix)=>{if(busy)return;setBusy(true);try{await call(suffix,'POST');await load();if(suffix==='/start')setNotified(false)}catch(e){setError(e.message)}finally{setBusy(false)}};
 return <div style={{display:'flex',flexDirection:'column',gap:16,color:'#f8fafc'}}>
  <button onClick={onBack} style={{...button,background:'#334155',alignSelf:'flex-start'}}><ArrowLeft size={16}/> Quay lại Kanban nhóm</button>
  <div style={panel}><div style={{fontSize:12,color:'#38bdf8',marginBottom:5}}>CHI TIẾT SUBTASK · {group.name}</div><h2 style={{margin:0,fontSize:22}}>{subtask.title}</h2></div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(330px,1fr))',gap:16,alignItems:'start'}}>
   <div style={{display:'flex',flexDirection:'column',gap:16}}>
    <section style={panel}><h3 style={{margin:'0 0 16px'}}>Thông tin công việc</h3>
     {[['Task dự án',parentTask?.title||'—'],['Nhóm chịu trách nhiệm',group.name],['Người thực hiện',subtask.assignee_name||'Chưa phân công'],['Độ ưu tiên',priorities[subtask.priority]||subtask.priority],['Ngày tạo',subtask.created_at?new Date(subtask.created_at).toLocaleString('vi-VN'):'—']].map(([k,v])=><div key={k} style={{display:'flex',justifyContent:'space-between',gap:12,padding:'10px 0',borderBottom:'1px solid #334155'}}><span style={{color:'#94a3b8'}}>{k}</span><strong style={{textAlign:'right'}}>{v}</strong></div>)}
     <div style={{marginTop:16}}><label style={{color:'#94a3b8',display:'block',marginBottom:8}}>Trạng thái</label><select disabled={!canWork} value={subtask.status} onChange={e=>onStatusChange(subtask,e.target.value)} style={{width:'100%',padding:10,background:'#0f172a',color:'#fff',border:'1px solid #334155',borderRadius:8}}>{Object.entries(statuses).map(([v,t])=><option key={v} value={v}>{t}</option>)}</select></div>
    </section>
    <section style={panel}><h3 style={{margin:'0 0 12px'}}>Mô tả Subtask</h3><p style={{whiteSpace:'pre-wrap',color:'#cbd5e1',margin:0}}>{subtask.description||'Chưa có mô tả.'}</p></section>
   </div>
   <section style={panel}><h3 style={{margin:'0 0 8px',display:'flex',alignItems:'center',gap:8}}><Clock3 size={20} color="#38bdf8"/> Pomodoro / Focus Timer</h3><p style={{color:'#94a3b8',fontSize:13}}>Đếm tăng theo thời gian làm việc thực tế. Đồng hồ không tự dừng khi đến giờ nhắc nghỉ.</p>
    <div style={{fontSize:46,fontWeight:800,textAlign:'center',fontVariantNumeric:'tabular-nums',padding:'22px 0'}}>{fmt(seconds)}</div>
    <div style={{textAlign:'center',color:'#94a3b8',fontSize:13,marginBottom:16}}>Trạng thái: {a?.status==='running'?'Đang chạy':a?.status==='paused'?'Tạm dừng':'Chưa bắt đầu'}</div>
    <label style={{fontSize:13,color:'#94a3b8'}}>Nhắc nghỉ sau</label><select value={reminder} onChange={e=>{setReminder(Number(e.target.value));setNotified(false)}} style={{width:'100%',background:'#0f172a',color:'#fff',border:'1px solid #334155',padding:10,borderRadius:8,margin:'8px 0 16px'}}><option value={30}>30 phút</option><option value={45}>45 phút (mặc định)</option><option value={60}>60 phút</option></select>
    <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:14}}>
     <button type="button" onClick={()=>setSoundOn(v=>!v)} style={{...button,background:'#334155'}}>{soundOn?<Volume2 size={16}/>:<VolumeX size={16}/>} {soundOn?'Âm báo: Bật':'Âm báo: Tắt'}</button>
     <select aria-label="Chọn tiếng chuông" value={soundType} onChange={e=>setSoundType(e.target.value)} style={{flex:1,minWidth:140,background:'#0f172a',color:'#fff',border:'1px solid #334155',padding:10,borderRadius:8}}><option value="gentle">Chuông nhẹ</option><option value="double">Chuông đôi</option><option value="digital">Âm điện tử</option></select>
     <button type="button" onClick={playBell} style={{...button,background:'#475569'}}>Nghe thử</button>
    </div>
    <p style={{fontSize:12,color:'#94a3b8',marginTop:-4}}>Hãy bấm “Nghe thử” một lần để cho phép trình duyệt phát âm thanh. Âm báo có thể không phát khi tab bị hệ thống đưa vào chế độ ngủ.</p>
    {notified&&a?.status==='running'&&<div role="status" style={{padding:12,background:'#78350f',borderRadius:8,marginBottom:12}}>Đã đến mốc nhắc nghỉ {reminder} phút. Bạn có thể nghỉ ngắn khi thuận tiện; đồng hồ vẫn chạy.</div>}
    <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{!a&&<button disabled={!canWork||busy} style={button} onClick={()=>action('/start')}><Play size={16}/> Bắt đầu</button>}{a?.status==='running'&&<button disabled={busy} style={button} onClick={()=>action(`/${a.id}/pause`)}><Pause size={16}/> Tạm dừng</button>}{a?.status==='paused'&&<button disabled={busy} style={button} onClick={()=>action(`/${a.id}/resume`)}><RotateCcw size={16}/> Tiếp tục</button>}{a&&<button disabled={busy} style={{...button,background:'#b91c1c'}} onClick={()=>action(`/${a.id}/stop`)}><Square size={16}/> Kết thúc & lưu</button>}</div>
    {error&&<p role="alert" style={{color:'#fca5a5'}}>{error}</p>}
    <div style={{marginTop:20,borderTop:'1px solid #334155',paddingTop:16}}><strong>Tổng thời gian đã kết thúc: {fmt(focus.total_seconds)}</strong><div style={{fontSize:12,color:'#94a3b8',marginTop:6}}>Phiên đang chạy/tạm dừng được lưu trên máy chủ. Tải lại trang không làm mất phiên.</div></div>
    {focus.sessions?.length>0&&<div style={{marginTop:14}}><strong style={{fontSize:13}}>Lịch sử phiên gần đây</strong>{focus.sessions.slice(0,5).map(s=><div key={s.id} style={{display:'flex',justifyContent:'space-between',color:'#94a3b8',fontSize:12,marginTop:8}}><span>{new Date(s.started_at).toLocaleString('vi-VN')}</span><span>{fmt(s.elapsed_seconds)} · {s.status==='stopped'?'Đã lưu':s.status==='paused'?'Tạm dừng':'Đang chạy'}</span></div>)}</div>}
   </section>
  </div>
 </div>
}
