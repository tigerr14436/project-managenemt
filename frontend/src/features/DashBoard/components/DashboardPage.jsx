
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  CheckSquare,
  Building2,
  Users,
  TrendingUp,
  Clock,
  PlusCircle,
  ArrowRight,
  Activity,
  CheckCircle2,
  BarChart3,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

import './DashboardPage.css';

const API_BASE = 'http://127.0.0.1:8000/api';

const initialStatistics = {
  totalProjects: 0,
  completedTasks: 0,
  workspaces: null,
  members: 0
};

const chartColors = [
  'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)',
  'linear-gradient(90deg, #0ea5e9 0%, #38bdf8 100%)',
  'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
  'linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%)',
  'linear-gradient(90deg, #ec4899 0%, #f472b6 100%)'
];

function formatDateTime(value) {
  if (!value) return 'Không xác định';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Không xác định';
  }

  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export default function DashboardPage() {
  const navigate = useNavigate();

  // ==========================================
  // 1. STATE QUẢN LÝ DỮ LIỆU DASHBOARD
  // ==========================================

  const [statistics, setStatistics] = useState(
    initialStatistics
  );

  const [projectProgressChart, setProjectProgressChart] =
    useState([]);

  const [recentActivities, setRecentActivities] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [reloadKey, setReloadKey] = useState(0);

  // ==========================================
  // 2. GỌI API LẤY DỮ LIỆU TỪ DATABASE
  // ==========================================

  useEffect(() => {
    const controller = new AbortController();

    async function fetchDashboardData() {
      setLoading(true);
      setError('');

      try {
        const token = localStorage.getItem('access_token');

        if (!token) {
          throw new Error(
            'Bạn chưa đăng nhập. Vui lòng đăng nhập để xem Dashboard.'
          );
        }

        const response = await fetch(
          `${API_BASE}/dashboard`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            signal: controller.signal
          }
        );

        if (response.status === 401) {
          localStorage.removeItem('access_token');

          throw new Error(
            'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
          );
        }

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => null);

          throw new Error(
            typeof errorData?.detail === 'string'
              ? errorData.detail
              : `Không thể tải Dashboard (HTTP ${response.status})`
          );
        }

        const data = await response.json();

        if (controller.signal.aborted) return;

        // Cập nhật 4 thẻ thống kê
        setStatistics({
          totalProjects:
            Number(data.statistics?.totalProjects) || 0,

          completedTasks:
            Number(data.statistics?.completedTasks) || 0,

          workspaces:
            data.statistics?.workspaces ?? null,

          members:
            Number(data.statistics?.members) || 0
        });

        // Cập nhật biểu đồ tiến độ
        setProjectProgressChart(
          Array.isArray(data.projectProgressChart)
            ? data.projectProgressChart
            : []
        );

        // Cập nhật hoạt động gần đây
        setRecentActivities(
          Array.isArray(data.recentActivities)
            ? data.recentActivities
            : []
        );

      } catch (err) {
        if (err.name === 'AbortError') return;

        console.error(
          'Lỗi tải dữ liệu Dashboard:',
          err
        );

        if (!controller.signal.aborted) {
          setError(
            err.message || 'Đã xảy ra lỗi khi tải dữ liệu.'
          );
        }

      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchDashboardData();

    return () => controller.abort();

  }, [reloadKey]);

  // ==========================================
  // 3. TẢI LẠI DASHBOARD
  // ==========================================

  const handleRefresh = () => {
    setReloadKey(prev => prev + 1);
  };

  // ==========================================
  // 4. GIAO DIỆN LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2 className="dashboard-title">
            Tổng quan Dashboard
          </h2>
          <p className="dashboard-subtitle">
            Đang đồng bộ dữ liệu từ hệ thống...
          </p>
        </div>

        <div
          className="dashboard-card"
          style={{
            padding: '48px',
            textAlign: 'center'
          }}
        >
          <RefreshCw
            size={32}
            className="dashboard-loading-icon"
            style={{
              color: '#818cf8',
              marginBottom: '12px'
            }}
          />

          <p>Đang tải dữ liệu Dashboard...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // 5. GIAO DIỆN KHI API BỊ LỖI
  // ==========================================

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2 className="dashboard-title">
            Tổng quan Dashboard
          </h2>
        </div>

        <div
          className="dashboard-card"
          role="alert"
          style={{
            padding: '32px',
            textAlign: 'center'
          }}
        >
          <AlertCircle
            size={36}
            color="#ef4444"
            style={{ marginBottom: '12px' }}
          />

          <h3>Không thể tải dữ liệu</h3>

          <p style={{ margin: '12px 0' }}>
            {error}
          </p>

          <button
            className="quick-action-btn"
            onClick={handleRefresh}
            style={{
              maxWidth: '200px',
              margin: '20px auto'
            }}
          >
            <RefreshCw size={18} />
            <span>Thử lại</span>
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // 6. GIAO DIỆN DASHBOARD CHÍNH
  // ==========================================

  return (
    <div className="dashboard-container">

      {/* HEADER DASHBOARD */}
      <div className="dashboard-header">
        <div>
          <h2 className="dashboard-title">
            Tổng quan Dashboard
          </h2>

          <p className="dashboard-subtitle">
            Chào mừng bạn trở lại hệ thống quản lý
            công việc DevTask
          </p>
        </div>

        <button
          onClick={handleRefresh}
          title="Làm mới dữ liệu"
          aria-label="Làm mới dữ liệu Dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid #334155',
            background: 'transparent',
            color: 'inherit',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={16} />
          Làm mới
        </button>
      </div>

      {/* ===================================== */}
      {/* 4 THẺ THỐNG KÊ TỔNG QUAN */}
      {/* ===================================== */}

      <div className="stats-grid">

        {/* TỔNG SỐ DỰ ÁN */}
        <div className="stat-card-box">
          <div
            className="stat-icon-wrapper"
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#818cf8'
            }}
          >
            <FolderKanban size={24} />
          </div>

          <div className="stat-content">
            <h5>Tổng số dự án</h5>
            <h3>{statistics.totalProjects}</h3>
          </div>
        </div>

        {/* TASK HOÀN THÀNH */}
        <div className="stat-card-box">
          <div
            className="stat-icon-wrapper"
            style={{
              background: 'rgba(52, 211, 153, 0.15)',
              color: '#34d399'
            }}
          >
            <CheckSquare size={24} />
          </div>

          <div className="stat-content">
            <h5>Task hoàn thành</h5>
            <h3>{statistics.completedTasks}</h3>
          </div>
        </div>

        {/* WORKSPACE */}
        <div className="stat-card-box">
          <div
            className="stat-icon-wrapper"
            style={{
              background: 'rgba(14, 165, 233, 0.15)',
              color: '#38bdf8'
            }}
          >
            <Building2 size={24} />
          </div>

          <div className="stat-content">
            <h5>Workspace</h5>
            <h3>
              {statistics.workspaces ?? '—'}
            </h3>
          </div>
        </div>

        {/* THÀNH VIÊN */}
        <div className="stat-card-box">
          <div
            className="stat-icon-wrapper"
            style={{
              background: 'rgba(245, 158, 11, 0.15)',
              color: '#fbbf24'
            }}
          >
            <Users size={24} />
          </div>

          <div className="stat-content">
            <h5>Thành viên nhóm</h5>
            <h3>{statistics.members}</h3>
          </div>
        </div>

      </div>

      {/* ===================================== */}
      {/* BIỂU ĐỒ TIẾN ĐỘ CÁC DỰ ÁN */}
      {/* ===================================== */}

      <div
        className="dashboard-card"
        style={{ marginBottom: '24px' }}
      >
        <h3 className="dashboard-card-title">
          <BarChart3
            size={20}
            style={{ color: '#38bdf8' }}
          />
          Sơ đồ tiến độ các dự án hiện tại
        </h3>

        <div className="chart-container">

          {projectProgressChart.length === 0 ? (
            <div
              style={{
                padding: '32px',
                textAlign: 'center',
                color: '#94a3b8'
              }}
            >
              <FolderKanban
                size={32}
                style={{ marginBottom: '12px' }}
              />

              <p>Chưa có dữ liệu dự án.</p>

              <p>
                Hãy tạo dự án và thêm công việc
                để theo dõi tiến độ.
              </p>
            </div>
          ) : (
            projectProgressChart.map((item, index) => {

              const progress = Math.min(
                100,
                Math.max(0, Number(item.progress) || 0)
              );

              return (
                <div
                  key={item.id}
                  className="chart-item"
                >
                  <div className="chart-info-row">
                    <span>{item.name}</span>

                    <span>
                      {progress}%
                    </span>
                  </div>

                  <div className="chart-bar-bg">
                    <div
                      className="chart-bar-fill"
                      style={{
                        width: `${progress}%`,
                        background:
                          chartColors[
                            index % chartColors.length
                          ]
                      }}
                    />
                  </div>

                  <p
                    style={{
                      fontSize: '12px',
                      color: '#94a3b8',
                      marginTop: '6px'
                    }}
                  >
                    {item.completedTasks ?? 0}
                    {' / '}
                    {item.totalTasks ?? 0}
                    {' công việc hoàn thành'}
                  </p>
                </div>
              );
            })
          )}

        </div>
      </div>

      {/* ===================================== */}
      {/* LƯỚI NỘI DUNG CHÍNH */}
      {/* ===================================== */}

      <div className="dashboard-grid-main">

        {/* CỘT TRÁI: HOẠT ĐỘNG GẦN ĐÂY */}
        <div className="dashboard-card">

          <h3 className="dashboard-card-title">
            <Activity
              size={20}
              style={{ color: '#818cf8' }}
            />
            Hoạt động gần đây của hệ thống
          </h3>

          <div className="activity-list">

            {recentActivities.length === 0 ? (
              <div
                style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: '#94a3b8'
                }}
              >
                <Activity
                  size={28}
                  style={{ marginBottom: '10px' }}
                />

                <p>Chưa có hoạt động gần đây.</p>
              </div>
            ) : (
              recentActivities.map((item) => (
                <div
                  key={item.id}
                  className="activity-item"
                >
                  <div className="activity-icon">
                    <CheckCircle2 size={18} />
                  </div>

                  <div className="activity-details">

                    <p className="activity-text">
                      <strong>
                        {item.action}
                      </strong>

                      {' trong dự án '}

                      <em>{item.project}</em>
                    </p>

                    <p className="activity-time">
                      <Clock
                        size={12}
                        style={{
                          display: 'inline',
                          marginRight: 4
                        }}
                      />

                      {formatDateTime(item.timestamp)}
                    </p>

                  </div>
                </div>
              ))
            )}

          </div>
        </div>

        {/* CỘT PHẢI: TRUY CẬP NHANH */}
        <div className="dashboard-card">

          <h3 className="dashboard-card-title">
            <TrendingUp
              size={20}
              style={{ color: '#38bdf8' }}
            />
            Truy cập nhanh
          </h3>

          <div className="quick-actions-list">

            {/* QUẢN LÝ DỰ ÁN */}
            <button
              className="quick-action-btn"
              onClick={() => navigate('/project')}
            >
              <div className="quick-action-btn-left">
                <FolderKanban
                  size={18}
                  style={{ color: '#818cf8' }}
                />

                <span>
                  Quản lý & Tạo Dự Án
                </span>
              </div>

              <ArrowRight
                size={16}
                style={{ color: '#64748b' }}
              />
            </button>

            {/* MỞ KANBAN */}
            <button
              className="quick-action-btn"
              onClick={() => navigate('/project')}
            >
              <div className="quick-action-btn-left">
                <PlusCircle
                  size={18}
                  style={{ color: '#34d399' }}
                />

                <span>
                  Mở Bảng Kanban Tiến Độ
                </span>
              </div>

              <ArrowRight
                size={16}
                style={{ color: '#64748b' }}
              />
            </button>

          </div>
        </div>

      </div>
    </div>
  );
}
