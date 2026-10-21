
import React, {
  useCallback,
  useEffect,
  useState
} from 'react';

import {
  Code2,
  GitBranch,
  GitCommit,
  Plus,
  Trash2,
  RefreshCw,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

const GITHUB_API = 'https://api.github.com';

function parseGithubUrl(input) {
  let url;

  try {
    url = new URL(input.trim());
  } catch {
    throw new Error('Link GitHub không hợp lệ.');
  }

  if (
    url.protocol !== 'https:' ||
    url.hostname.toLowerCase() !== 'github.com'
  ) {
    throw new Error(
      'Vui lòng nhập link repository GitHub, ví dụ: https://github.com/user/repo'
    );
  }

  const parts = url.pathname
    .replace(/\/+$/, '')
    .split('/')
    .filter(Boolean);

  if (parts.length !== 2) {
    throw new Error(
      'Link phải có dạng https://github.com/username/repository'
    );
  }

  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/i, '');

  const validName = /^[a-zA-Z0-9_.-]+$/;

  if (!validName.test(owner) || !validName.test(repo)) {
    throw new Error('Tên người dùng hoặc repository không hợp lệ.');
  }

  return {
    owner,
    repo,
    url: `https://github.com/${owner}/${repo}`
  };
}

async function githubRequest(url, signal) {
  const response = await fetch(url, {
    signal,
    headers: {
      Accept: 'application/vnd.github+json'
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(
        'Không tìm thấy repository. Hãy kiểm tra link hoặc quyền truy cập.'
      );
    }

    if (response.status === 403 || response.status === 429) {
      throw new Error(
        'GitHub đang giới hạn lượt truy cập API. Vui lòng thử lại sau.'
      );
    }

    throw new Error(
      `Không thể lấy dữ liệu GitHub (HTTP ${response.status}).`
    );
  }

  return response;
}

function getCommitCount(response, commits) {
  const linkHeader = response.headers.get('Link') || '';

  const lastPage = linkHeader.match(
    /[?&]page=(\d+)[^>]*>;\s*rel="last"/
  );

  if (lastPage) {
    // Chỉ là ước lượng khi trang cuối chưa được tải.
    return `≥ ${Number(lastPage[1]) - 1}00`;
  }

  // Nếu không có phân trang và trả về dưới 100 commit,
  // số lượng này là chính xác.
  return commits.length < 100
    ? String(commits.length)
    : '100+';
}

function formatTime(dateString) {
  if (!dateString) return 'Không rõ';

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return 'Không rõ';
  }

  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function loadGithubRepo(repoUrl, signal) {
  const parsed = parseGithubUrl(repoUrl);

  const repoResponse = await githubRequest(
    `${GITHUB_API}/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`,
    signal
  );

  const repoData = await repoResponse.json();

  const branch = repoData.default_branch;

  const commitsResponse = await githubRequest(
    `${GITHUB_API}/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}/commits?sha=${encodeURIComponent(branch)}&per_page=100`,
    signal
  );

  const commitsData = await commitsResponse.json();

  const commits = commitsData.map((item) => ({
    id: item.sha,
    shortSha: item.sha.slice(0, 7),
    msg: item.commit?.message || 'Không có nội dung',
    author:
      item.commit?.author?.name ||
      item.author?.login ||
      'Không rõ',
    time: item.commit?.author?.date || null,
    url: item.html_url,
    repoName: repoData.full_name
  }));

  return {
    repository: {
      id: repoData.id,
      name: repoData.name,
      fullName: repoData.full_name,
      url: repoData.html_url,
      branch,
      description: repoData.description || '',
      language: repoData.language || 'Chưa xác định',
      stars: repoData.stargazers_count,
      forks: repoData.forks_count,
      commitsCount: getCommitCount(
        commitsResponse,
        commitsData
      ),
      lastUpdate: repoData.pushed_at,
      owner: repoData.owner?.login || parsed.owner
    },
    commits
  };
}

export default function CodeManagement({
  projectId,
  role,
  showNotification
}) {
  const isOwner = role === 'owner';
  const [newRepoLink, setNewRepoLink] = useState('');
  const [repoUrls, setRepoUrls] = useState([]);
  const [repoList, setRepoList] = useState([]);
  const [commitList, setCommitList] = useState([]);

  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');

  const storageKey = `devtask:github-repos:${projectId}`;

  const notify = useCallback(
    (type, title, message) => {
      if (typeof showNotification === 'function') {
        showNotification(type, title, message);
      }
    },
    [showNotification]
  );

  // Đọc danh sách link đã lưu cho dự án hiện tại.
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem(storageKey) || '[]'
      );

      setRepoUrls(
        Array.isArray(saved)
          ? saved.filter(item => typeof item === 'string')
          : []
      );
    } catch {
      setRepoUrls([]);
    }

    setRepoList([]);
    setCommitList([]);
    setError('');
  }, [storageKey]);

  // Tải lại dữ liệu repository và commit thật từ GitHub.
  const refreshGithub = useCallback(
    async (urls, signal) => {
      if (!urls.length) {
        setRepoList([]);
        setCommitList([]);
        setError('');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const results = await Promise.allSettled(
          urls.map(url => loadGithubRepo(url, signal))
        );

        if (signal?.aborted) return;

        const successful = results
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value);

        const failures = results
          .filter(result => result.status === 'rejected');

        const repositories = successful.map(
          result => result.repository
        );

        const commits = successful
          .flatMap(result => result.commits)
          .sort(
            (a, b) =>
              new Date(b.time || 0) -
              new Date(a.time || 0)
          )
          .slice(0, 30);

        setRepoList(repositories);
        setCommitList(commits);

        if (failures.length > 0) {
          setError(
            `Không tải được ${failures.length} repository. ` +
            failures[0].reason.message
          );
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    []
  );

  // Tự đồng bộ khi mở tab hoặc thay đổi danh sách link.
  useEffect(() => {
    const controller = new AbortController();

    refreshGithub(repoUrls, controller.signal);

    return () => controller.abort();
  }, [repoUrls, refreshGithub]);

  const handleAddRepo = async (event) => {
    event.preventDefault();

    if (!isOwner) {
      setError('Chỉ Owner mới được phép liên kết GitHub Repository.');
      return;
    }

    if (adding) return;

    let parsed;

    try {
      parsed = parseGithubUrl(newRepoLink);
    } catch (err) {
      setError(err.message);
      return;
    }

    if (
      repoUrls.some(
        url => url.toLowerCase() === parsed.url.toLowerCase()
      )
    ) {
      setError('Repository này đã được liên kết.');
      return;
    }

    setAdding(true);
    setError('');

    try {
      // Kiểm tra repository tồn tại trước khi lưu.
      await loadGithubRepo(parsed.url);

      const updated = [...repoUrls, parsed.url];

      localStorage.setItem(
        storageKey,
        JSON.stringify(updated)
      );

      setRepoUrls(updated);
      setNewRepoLink('');

      notify(
        'thanh-cong',
        'Kết nối thành công',
        `Đã liên kết repository ${parsed.owner}/${parsed.repo}`
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveRepo = (url, name) => {
    if (!isOwner) return;
    const confirmed = window.confirm(
      `Bạn có chắc muốn ngắt kết nối "${name}"?`
    );

    if (!confirmed) return;

    const updated = repoUrls.filter(item => item !== url);

    localStorage.setItem(
      storageKey,
      JSON.stringify(updated)
    );

    setRepoUrls(updated);

    notify(
      'can-bao',
      'Đã ngắt kết nối',
      `Đã gỡ repository "${name}" khỏi dự án`
    );
  };

  const handleRefresh = async () => {
    try {
      await refreshGithub(repoUrls);

      notify(
        'thanh-cong',
        'Đã cập nhật',
        'Đã yêu cầu tải lại dữ liệu từ GitHub.'
      );
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="khung-quan-ly-code">

      {/* HEADER */}
      <div className="header-code-row">
        <h3>
          <Code2
            size={20}
            style={{ color: '#38bdf8' }}
          />
          Quản Lý Code & Repositories (Git)
        </h3>

        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}
        >
          <span className="nhan-ma-moi">
            {repoUrls.length} Repositories đã liên kết
          </span>

          <button
            type="button"
            className="nut-chinh"
            onClick={handleRefresh}
            disabled={loading || adding || !repoUrls.length}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <RefreshCw size={16} />
            {loading ? 'Đang cập nhật...' : 'Làm mới GitHub'}
          </button>
        </div>
      </div>

      {/* FORM NHẬP LINK - chỉ Owner */}
      {isOwner && (
      <div
        className="the-box-inline"
        style={{ marginBottom: '20px' }}
      >
        <h4>
          <Code2 size={16} />
          Liên kết Repository GitHub
        </h4>

        <form
          onSubmit={handleAddRepo}
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <div
            className="nhom-nhap-lieu"
            style={{
              flex: 1,
              minWidth: '240px'
            }}
          >
            <Code2
              size={18}
              className="bieu-tuong-input"
            />

            <input
              type="url"
              className="o-nhap-lieu"
              placeholder="https://github.com/username/repository"
              value={newRepoLink}
              onChange={e => setNewRepoLink(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="nut-chinh"
            disabled={adding}
          >
            <Plus size={16} />
            {adding ? 'Đang kiểm tra...' : 'Kết nối Repo'}
          </button>
        </form>

        <p
          style={{
            fontSize: '12px',
            color: '#94a3b8',
            marginTop: '10px'
          }}
        >
          Hỗ trợ repository GitHub công khai.
          Nhánh mặc định được lấy tự động từ GitHub.
        </p>
      </div>
      )}

      {/* THÔNG BÁO LỖI */}
      {error && (
        <div
          role="alert"
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'flex-start',
            padding: '12px',
            marginBottom: '16px',
            borderRadius: '8px',
            color: '#fca5a5',
            background: 'rgba(239,68,68,0.1)'
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* DANH SÁCH REPOSITORY */}
      <div className="luoi-repo-card">

        {repoList.length > 0 ? (
          repoList.map(repo => (
            <div
              key={repo.id}
              className="repo-card-item"
            >
              <div className="repo-card-header">
                <div className="repo-name-wrap">
                  <Code2
                    size={18}
                    style={{ color: '#818cf8' }}
                  />

                  <div>
                    <h5 className="repo-name-text">
                      {repo.fullName}
                    </h5>

                    <a
                      href={repo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: '11px',
                        color: '#38bdf8'
                      }}
                    >
                      Mở trên GitHub <ExternalLink size={11} />
                    </a>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <span className="huy-hieu-branch">
                    <GitBranch size={12} />
                    {repo.branch}
                  </span>

                  {isOwner && (
                  <button
                    type="button"
                    onClick={() =>
                      handleRemoveRepo(repo.url, repo.fullName)
                    }
                    title="Ngắt kết nối repository"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#f87171',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                  )}
                </div>
              </div>

              {repo.description && (
                <p
                  style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    marginTop: '10px'
                  }}
                >
                  {repo.description}
                </p>
              )}

              <div
                style={{
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  fontSize: '12px',
                  color: '#94a3b8',
                  marginTop: '12px'
                }}
              >
                <span>Ngôn ngữ: {repo.language}</span>
                <span>Stars: {repo.stars}</span>
                <span>Forks: {repo.forks}</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '10px',
                  flexWrap: 'wrap',
                  fontSize: '12px',
                  color: '#64748b',
                  marginTop: '10px',
                  borderTop: '1px solid #1e293b',
                  paddingTop: '8px'
                }}
              >
                <span>
                  Commits: {repo.commitsCount}
                </span>

                <span>
                  Push gần nhất: {formatTime(repo.lastUpdate)}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div
            className="trang-thai-trong"
            style={{
              gridColumn: '1 / -1',
              padding: '20px'
            }}
          >
            <p>
              {loading
                ? 'Đang lấy thông tin repository từ GitHub...'
                : 'Chưa có repository nào được tải.'}
            </p>
          </div>
        )}
      </div>

      {/* LỊCH SỬ COMMIT */}
      <div className="commit-box-container">
        <h4>
          <GitCommit
            size={16}
            style={{ color: '#34d399' }}
          />
          Nhật Ký Commits Gần Đây
        </h4>

        <div>
          {commitList.length > 0 ? (
            commitList.map(commit => (
              <div
                key={`${commit.repoName}-${commit.id}`}
                className="commit-row-item"
              >
                <div>
                  <p className="commit-msg-text">
                    {commit.msg}
                  </p>

                  <p className="commit-meta-text">
                    Repository:{' '}
                    <strong>{commit.repoName}</strong>
                    {' • '}
                    Tác giả:{' '}
                    <strong>{commit.author}</strong>
                    {' • '}
                    {formatTime(commit.time)}
                  </p>
                </div>

                <a
                  className="commit-hash-tag"
                  href={commit.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Xem commit trên GitHub"
                >
                  {commit.shortSha}
                </a>
              </div>
            ))
          ) : (
            <p
              style={{
                fontSize: '13px',
                color: '#64748b',
                textAlign: 'center',
                margin: '10px 0'
              }}
            >
              {loading
                ? 'Đang tải lịch sử commit...'
                : 'Chưa có lịch sử commit để hiển thị.'}
            </p>
          )}
        </div>
      </div>

    </div>
  );
}
