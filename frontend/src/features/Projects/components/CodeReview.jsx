import React, { useCallback, useEffect, useState } from 'react';
import { FileCode, Folder, MessageSquare, Send, RefreshCw, ExternalLink } from 'lucide-react';

const GITHUB_API = 'https://api.github.com';
const MAX_FILE_SIZE = 500_000;

async function getLinkedRepo(projectId, signal) {
  const token = localStorage.getItem('access_token');
  if (!token) throw new Error('Bạn chưa đăng nhập.');
  const response = await fetch(`http://127.0.0.1:8000/api/projects/${projectId}/repository`, {
    signal,
    headers: { Authorization: `Bearer ${token}` }
  });
  if (response.status === 404) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(typeof data?.detail === 'string' ? data.detail : `Lỗi HTTP ${response.status}`);
  return data.repository_url;
}

function parseRepo(url) {
  const parsed = new URL(url);
  const parts = parsed.pathname.replace(/\/+$/, '').split('/').filter(Boolean);
  if (parsed.protocol !== 'https:' || parsed.hostname !== 'github.com' || parts.length !== 2) {
    throw new Error('Link GitHub đã lưu không hợp lệ.');
  }
  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/i, '');
  if (!/^[a-zA-Z0-9_.-]+$/.test(owner) || !/^[a-zA-Z0-9_.-]+$/.test(repo)) {
    throw new Error('Tên Repository không hợp lệ.');
  }
  return { owner, repo };
}

async function githubGet(path, signal) {
  const response = await fetch(`${GITHUB_API}${path}`, {
    signal,
    headers: { Accept: 'application/vnd.github+json' }
  });
  if (!response.ok) {
    if (response.status === 404) throw new Error('Không tìm thấy Repository hoặc tệp trên GitHub.');
    if (response.status === 403 || response.status === 429) throw new Error('GitHub đang giới hạn lượt gọi API. Vui lòng thử lại sau.');
    throw new Error(`Không tải được dữ liệu GitHub (HTTP ${response.status}).`);
  }
  return response.json();
}

function decodeBase64Utf8(value) {
  const binary = atob(value.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
}

function readComments(projectId, filePath) {
  try {
    const value = JSON.parse(localStorage.getItem(`devtask:review-comments:${projectId}:${filePath}`) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export default function CodeReview({ projectId, showNotification }) {
  const [repository, setRepository] = useState(null);
  const [branch, setBranch] = useState('');
  const [fileList, setFileList] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [commentList, setCommentList] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [error, setError] = useState('');

  const refreshFiles = useCallback(async (signal) => {
    setLoading(true);
    setError('');
    setSelectedFile(null);
    setFileContent('');
    setFileList([]);
    setRepository(null);
    try {
      const link = await getLinkedRepo(projectId, signal);
      if (!link) { setError('Dự án chưa liên kết GitHub Repository.'); return; }
      const { owner, repo } = parseRepo(link);
      const base = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
      const info = await githubGet(base, signal);
      const currentBranch = info.default_branch;
      const tree = await githubGet(`${base}/git/trees/${encodeURIComponent(currentBranch)}?recursive=1`, signal);
      if (signal?.aborted) return;
      const files = (tree.tree || [])
        .filter(item => item.type === 'blob')
        .sort((a, b) => a.path.localeCompare(b.path))
        .map(item => ({ id: item.sha + ':' + item.path, name: item.path, sha: item.sha, size: item.size }));
      setRepository({ owner, repo, url: info.html_url, fullName: info.full_name, base });
      setBranch(currentBranch);
      setFileList(files);
      if (tree.truncated) setError('Repository quá lớn: GitHub chỉ trả về một phần danh sách tệp.');
    } catch (err) {
      if (err.name !== 'AbortError' && !signal?.aborted) setError(err.message);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    const controller = new AbortController();
    refreshFiles(controller.signal);
    return () => controller.abort();
  }, [refreshFiles]);

  useEffect(() => {
    if (!selectedFile || !repository) {
      setFileContent('');
      setCommentList([]);
      return;
    }
    const controller = new AbortController();
    setCommentList(readComments(projectId, selectedFile.name));
    setFileContent('');
    setLoadingFile(true);
    const load = async () => {
      try {
        if (selectedFile.size > MAX_FILE_SIZE) {
          setFileContent('Tệp lớn hơn 500 KB nên không hiển thị trực tiếp. Hãy mở trên GitHub.');
          return;
        }
        const blob = await githubGet(`${repository.base}/git/blobs/${encodeURIComponent(selectedFile.sha)}`, controller.signal);
        if (controller.signal.aborted) return;
        if (blob.encoding !== 'base64' || !blob.content) {
          setFileContent('Không thể hiển thị nội dung tệp này.');
          return;
        }
        const content = decodeBase64Utf8(blob.content);
        if (content.includes('\u0000')) {
          setFileContent('Đây là tệp nhị phân, không thể xem dưới dạng mã nguồn.');
        } else {
          setFileContent(content);
        }
      } catch (err) {
        if (err.name !== 'AbortError' && !controller.signal.aborted) setFileContent(`Lỗi tải tệp: ${err.message}`);
      } finally {
        if (!controller.signal.aborted) setLoadingFile(false);
      }
    };
    load();
    return () => controller.abort();
  }, [selectedFile, repository, projectId]);

  const handleSendComment = (e) => {
    e.preventDefault();
    if (!selectedFile || !newComment.trim()) return;
    const comment = {
      id: Date.now(),
      author: 'Thành viên dự án',
      content: newComment.trim(),
      time: new Date().toLocaleString('vi-VN')
    };
    const updated = [...commentList, comment];
    localStorage.setItem(`devtask:review-comments:${projectId}:${selectedFile.name}`, JSON.stringify(updated));
    setCommentList(updated);
    setNewComment('');
    showNotification?.('thanh-cong', 'Thành công', 'Đã lưu bình luận trên trình duyệt này');
  };

  const fileUrl = selectedFile && repository
    ? `${repository.url}/blob/${encodeURIComponent(branch)}/${selectedFile.name.split('/').map(encodeURIComponent).join('/')}`
    : null;

  return (
    <div className="khung-quan-ly-code" style={{ marginTop: '24px' }}>
      <div className="header-code-row">
        <h3><FileCode size={20} style={{ color: '#38bdf8' }} /> Xem Code & Bình Luận (Code Review)</h3>
        <button type="button" className="nut-chinh" onClick={() => refreshFiles()} disabled={loading}>
          <RefreshCw size={15} /> {loading ? 'Đang tải...' : 'Làm mới code'}
        </button>
      </div>

      {repository && (
        <p style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '12px' }}>
          Repository: <a href={repository.url} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>{repository.fullName}</a>
          {' • '}Nhánh: {branch}
        </p>
      )}
      {error && <p role="alert" style={{ color: '#fca5a5', marginBottom: '12px' }}>{error}</p>}
      {!loading && !repository && !error && (
        <p style={{ color: '#94a3b8', marginBottom: '12px' }}>
          Chưa tìm thấy link GitHub của dự án trên trình duyệt này. Hãy liên kết Repository trong tab Quản Lý Code trước.
        </p>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 260px) minmax(0, 1fr)', gap: '16px' }}>
        <div className="the-box-inline" style={{ margin: 0, padding: '12px' }}>
          <h4 style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '10px' }}><Folder size={14} /> Cấu trúc Tệp ({fileList.length})</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: 550, overflowY: 'auto' }}>
            {fileList.map(file => (
              <button key={file.id} type="button" onClick={() => setSelectedFile(file)}
                style={{ background: selectedFile?.id === file.id ? '#1e293b' : 'transparent', border: 'none', color: selectedFile?.id === file.id ? '#38bdf8' : '#cbd5e1', padding: '8px 10px', borderRadius: '8px', textAlign: 'left', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', overflowWrap: 'anywhere' }}>
                <FileCode size={14} style={{ flexShrink: 0 }} /> {file.name}
              </button>
            ))}
            {loading && <p style={{ color: '#94a3b8' }}>Đang tải danh sách tệp...</p>}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 }}>
          <div style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '13px', color: '#818cf8', fontWeight: 600, marginBottom: '8px', borderBottom: '1px solid #1e293b', paddingBottom: '8px', display: 'flex', justifyContent: 'space-between', gap: 12 }}>
              <span>📁 {selectedFile?.name || 'Chọn tệp để xem mã nguồn'}</span>
              {fileUrl && <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}><ExternalLink size={15} /></a>}
            </div>
            <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '13px', color: '#e2e8f0', overflowX: 'auto', lineHeight: '1.5', maxHeight: 550, overflowY: 'auto' }}>
              {loadingFile ? 'Đang tải nội dung tệp...' : fileContent || 'Chưa chọn tệp.'}
            </pre>
          </div>

          <div className="commit-box-container">
            <h4><MessageSquare size={16} style={{ color: '#38bdf8' }} /> Thảo luận / Bình luận về mã nguồn ({commentList.length})</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
              {commentList.map(comment => (
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
              <input type="text" placeholder={selectedFile ? 'Viết bình luận cho mã nguồn này...' : 'Chọn tệp trước khi bình luận'}
                value={newComment} onChange={e => setNewComment(e.target.value)} className="o-nhap-lieu" style={{ flex: 1 }} disabled={!selectedFile} required />
              <button type="submit" className="nut-chinh" disabled={!selectedFile}><Send size={14} /> Gửi</button>
            </form>
            <p style={{ color: '#64748b', fontSize: '11px', marginTop: '10px' }}>Bình luận được lưu trên trình duyệt này, chưa đồng bộ lên GitHub hoặc giữa các tài khoản.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
