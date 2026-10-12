import React, { useState } from 'react';
import { Code2, GitBranch, GitCommit, Plus, Trash2 } from 'lucide-react';

export default function CodeManagement({ repoList, setRepoList, commitList, showNotification }) {
  const [newRepoLink, setNewRepoLink] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('main');

  const handleAddRepo = (e) => {
    e.preventDefault();
    if (!newRepoLink.trim()) return;

    const cleanUrl = newRepoLink.trim().replace(/.git$/, '');
    const repoName = cleanUrl.split('/').pop() || 'repository-moi';

    const newRepo = {
      id: Date.now(),
      name: repoName,
      url: newRepoLink.trim(),
      branch: defaultBranch,
      commits_count: 1,
      last_update: 'Vừa xong'
    };

    setRepoList((prev) => [...prev, newRepo]);
    setNewRepoLink('');
    showNotification('thanh-cong', 'Kết nối thành công', `Đã liên kết repository "${repoName}" vào dự án`);
  };

  const handleRemoveRepo = (id, repoName) => {
    if (window.confirm(`Bạn có chắc chắn muốn ngắt kết nối repository "${repoName}"?`)) {
      setRepoList((prev) => prev.filter((repo) => repo.id !== id));
      showNotification('can-bao', 'Đã ngắt kết nối', `Đã gỡ bỏ repository "${repoName}"`);
    }
  };

  return (
    <div className="khung-quan-ly-code">
      <div className="header-code-row">
        <h3><Code2 size={20} style={{ color: '#38bdf8' }} /> Quản Lý Code & Repositories (Git)</h3>
        <span className="nhan-ma-moi">{repoList.length} Repositories đã kết nối</span>
      </div>

      <div className="the-box-inline" style={{ marginBottom: '20px' }}>
        <h4><Code2 size={16} /> Liên Kết Repository Mới (GitHub / GitLab)</h4>
        <form onSubmit={handleAddRepo} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <div className="nhom-nhap-lieu" style={{ flex: 1, minWidth: '240px' }}>
            <Code2 size={18} className="bieu-tuong-input" />
            <input
              type="text"
              placeholder="URL Repository (VD: https://github.com/username/repo)..."
              value={newRepoLink}
              onChange={(e) => setNewRepoLink(e.target.value)}
              className="o-nhap-lieu"
              required
            />
          </div>

          <select
            className="select-form"
            style={{ width: '130px' }}
            value={defaultBranch}
            onChange={(e) => setDefaultBranch(e.target.value)}
          >
            <option value="main">Branch: main</option>
            <option value="master">Branch: master</option>
            <option value="dev">Branch: dev</option>
          </select>

          <button type="submit" className="nut-chinh">
            <Plus size={16} /> Kết Nối Repo
          </button>
        </form>
      </div>

      <div className="luoi-repo-card">
        {repoList.length > 0 ? (
          repoList.map((repo) => (
            <div key={repo.id} className="repo-card-item">
              <div className="repo-card-header">
                <div className="repo-name-wrap">
                  <Code2 size={18} style={{ color: '#818cf8' }} />
                  <div>
                    <h5 className="repo-name-text">{repo.name}</h5>
                    {repo.url && <a href={repo.url} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: '#64748b', textDecoration: 'none' }}>Mở link gốc ↗</a>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="huy-hieu-branch">
                    <GitBranch size={12} /> {repo.branch}
                  </span>
                  <button
                    onClick={() => handleRemoveRepo(repo.id, repo.name)}
                    style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                    title="Ngắt kết nối repository"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#64748b', marginTop: '10px', borderTop: '1px solid #1e293b', paddingTop: '8px' }}>
                <span>{repo.commits_count} Commits</span>
                <span>Cập nhật {repo.last_update}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="trang-thai-trong" style={{ gridColumn: '1 / -1', padding: '20px' }}>
            <p>Chưa có repository nào được kết nối. Hãy thêm link Git ở phía trên!</p>
          </div>
        )}
      </div>

      <div className="commit-box-container">
        <h4><GitCommit size={16} style={{ color: '#34d399' }} /> Nhật Ký Commits Gần Đây</h4>
        <div>
          {commitList && commitList.length > 0 ? (
            commitList.map((commit) => (
              <div key={commit.id} className="commit-row-item">
                <div>
                  <p className="commit-msg-text">{commit.msg}</p>
                  <p className="commit-meta-text">Tác giả: <strong>{commit.author}</strong> • {commit.time}</p>
                </div>
                <span className="commit-hash-tag">{commit.id}</span>
              </div>
            ))
          ) : (
            <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', margin: '10px 0' }}>Chưa có lịch sử commit nào.</p>
          )}
        </div>
      </div>
    </div>
  );
}