import React, { useCallback, useEffect, useState } from 'react';
import {
  Code2, GitBranch, GitCommit, Plus, Trash2,
  RefreshCw, ExternalLink, AlertCircle, Lock
} from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000/api';

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('access_token');
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(
      typeof data?.detail === 'string'
        ? data.detail
        : `Yêu cầu thất bại (HTTP ${response.status})`
    );
    error.status = response.status;
    throw error;
  }
  return data;
}

function formatTime(value) {
  if (!value) return 'Không rõ';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Không rõ'
    : date.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
}

export default function CodeManagement({ projectId, role, showNotification }) {
  const isOwner = role === 'owner';
  const [newRepoLink, setNewRepoLink] = useState('');
  const [repository, setRepository] = useState(null);
  const [githubInfo, setGithubInfo] = useState(null);
  const [commitList, setCommitList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const notify = (type, title, message) => {
    if (typeof showNotification === 'function') {
      showNotification(type, title, message);
    }
  };

  const loadRepository = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError('');
    try {
      const repo = await apiRequest(`/projects/${projectId}/repository`);
      setRepository(repo);
      try {
        const result = await apiRequest(`/projects/${projectId}/repository/commits`);
        setGithubInfo(result.repository || null);
        setCommitList(result.commits || []);
      } catch (err) {
        setGithubInfo(null);
        setCommitList([]);
        setError(`Đã tải Repository nhưng chưa lấy được commit: ${err.message}`);
      }
    } catch (err) {
      setRepository(null);
      setGithubInfo(null);
      setCommitList([]);
      if (err.status !== 404) setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    setRepository(null);
    setGithubInfo(null);
    setCommitList([]);
    setNewRepoLink('');
    loadRepository();
  }, [loadRepository]);

  const handleAddRepo = async (event) => {
    event.preventDefault();
    if (!isOwner || !projectId || saving || loading || repository) return;
    if (!newRepoLink.trim()) return;

    setSaving(true);
    setError('');
    try {
      await apiRequest(`/projects/${projectId}/repository`, {
        method: 'POST',
        body: JSON.stringify({ repository_url: newRepoLink.trim() }),
      });
      setNewRepoLink('');
      await loadRepository();
      notify('thanh-cong', 'Kết nối thành công', 'Đã liên kết GitHub Repository với dự án.');
    } catch (err) {
      setError(err.message);
      // Nếu người khác vừa liên kết, tải lại để khóa form.
      if (err.status === 409) await loadRepository();
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveRepo = async () => {
    if (!isOwner || !repository || saving) return;
    if (!window.confirm(`Bạn muốn gỡ liên kết "${repository.github_owner}/${repository.github_repo}"?`)) return;
    setSaving(true);
    setError('');
    try {
      await apiRequest(`/projects/${projectId}/repository`, { method: 'DELETE' });
      setRepository(null);
      setGithubInfo(null);
      setCommitList([]);
      notify('can-bao', 'Đã gỡ liên kết', 'Repository đã được gỡ khỏi dự án.');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRefresh = async () => {
    if (!repository || refreshing) return;
    setRefreshing(true);
    setError('');
    try {
      const result = await apiRequest(`/projects/${projectId}/repository/commits`);
      setGithubInfo(result.repository || null);
      setCommitList(result.commits || []);
      notify('thanh-cong', 'Đã cập nhật', 'Đã tải commit mới nhất từ GitHub.');
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="khung-quan-ly-code">
      <div className="header-code-row">
        <h3><Code2 size={20} style={{ color: '#38bdf8' }} /> Quản Lý Code & Repositories (Git)</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <span className="nhan-ma-moi">{repository ? '1 Repository đã liên kết' : 'Chưa liên kết Repository'}</span>
          {repository && (
            <button type="button" className="nut-chinh" onClick={handleRefresh} disabled={refreshing || loading}
              style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={16} /> {refreshing ? 'Đang cập nhật...' : 'Làm mới GitHub'}
            </button>
          )}
        </div>
      </div>

      <div className="the-box-inline" style={{ marginBottom: 20 }}>
        <h4><Code2 size={16} /> Liên kết Repository GitHub</h4>
        {loading ? (
          <p style={{ color: '#94a3b8' }}>Đang tải thông tin Repository...</p>
        ) : repository ? (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
            <a href={repository.repository_url} target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8' }}>
              {repository.github_owner}/{repository.github_repo} <ExternalLink size={13} />
            </a>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>Dự án đã có Repository, không thể thêm link thứ hai.</span>
            {isOwner && (
              <button type="button" onClick={handleRemoveRepo} disabled={saving}
                style={{ background: 'transparent', border: '1px solid #f87171', borderRadius: 8, color: '#f87171', padding: '8px 12px', cursor: 'pointer' }}>
                <Trash2 size={14} /> Gỡ liên kết
              </button>
            )}
          </div>
        ) : isOwner ? (
          <form onSubmit={handleAddRepo} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
            <div className="nhom-nhap-lieu" style={{ flex: 1, minWidth: 240 }}>
              <Code2 size={18} className="bieu-tuong-input" />
              <input type="url" className="o-nhap-lieu"
                placeholder="https://github.com/username/repository"
                value={newRepoLink} onChange={(e) => setNewRepoLink(e.target.value)} required />
            </div>
            <button type="submit" className="nut-chinh" disabled={saving}>
              <Plus size={16} /> {saving ? 'Đang liên kết...' : 'Kết nối Repo'}
            </button>
          </form>
        ) : (
          <p style={{ display: 'flex', gap: 8, alignItems: 'center', color: '#94a3b8', marginTop: 12 }}>
            <Lock size={16} /> Chỉ Owner mới được liên kết Repository cho dự án này.
          </p>
        )}
      </div>

      {error && (
        <div role="alert" style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 12, marginBottom: 16, borderRadius: 8, color: '#fca5a5', background: 'rgba(239,68,68,0.1)' }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      <div className="luoi-repo-card">
        {repository && githubInfo ? (
          <div className="repo-card-item">
            <div className="repo-card-header">
              <div className="repo-name-wrap">
                <Code2 size={18} style={{ color: '#818cf8' }} />
                <div>
                  <h5 className="repo-name-text">{githubInfo.full_name}</h5>
                  <a href={githubInfo.url} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 11, color: '#38bdf8' }}>Mở trên GitHub <ExternalLink size={11} /></a>
                </div>
              </div>
              <span className="huy-hieu-branch"><GitBranch size={12} /> {githubInfo.default_branch}</span>
            </div>
            {githubInfo.description && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 10 }}>{githubInfo.description}</p>}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: '#94a3b8', marginTop: 12 }}>
              <span>Ngôn ngữ: {githubInfo.language || 'Không rõ'}</span>
              <span>Stars: {githubInfo.stars ?? 0}</span>
              <span>Forks: {githubInfo.forks ?? 0}</span>
            </div>
            <div style={{ marginTop: 10, borderTop: '1px solid #1e293b', paddingTop: 8, fontSize: 12, color: '#64748b' }}>
              Push gần nhất: {formatTime(githubInfo.pushed_at)}
            </div>
          </div>
        ) : (
          <div className="trang-thai-trong" style={{ gridColumn: '1 / -1', padding: 20 }}>
            <p>{loading ? 'Đang tải Repository...' : repository ? 'Không tải được thông tin GitHub.' : 'Dự án chưa liên kết Repository.'}</p>
          </div>
        )}
      </div>

      <div className="commit-box-container">
        <h4><GitCommit size={16} style={{ color: '#34d399' }} /> Nhật Ký Commits Gần Đây</h4>
        {commitList.length > 0 ? commitList.map((commit) => (
          <div key={commit.sha} className="commit-row-item">
            <div>
              <p className="commit-msg-text">{commit.message}</p>
              <p className="commit-meta-text">Tác giả: <strong>{commit.author}</strong> • {formatTime(commit.date)}</p>
            </div>
            <a className="commit-hash-tag" href={commit.url} target="_blank" rel="noopener noreferrer"
              title="Xem commit trên GitHub">{commit.short_sha}</a>
          </div>
        )) : (
          <p style={{ fontSize: 13, color: '#64748b', textAlign: 'center', margin: '10px 0' }}>
            {loading || refreshing ? 'Đang tải lịch sử commit...' : 'Chưa có lịch sử commit nào.'}
          </p>
        )}
      </div>
    </div>
  );
}
