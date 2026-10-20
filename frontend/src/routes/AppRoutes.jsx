import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import LandingPage from "../features/LandingPage/components/LandingPage";
import DashboardPage from "../features/DashBoard/components/DashboardPage";
import ProjectManagement from "../features/Projects/components/ProjectManagement";
import GroupManagement from "../features/Groups/components/GroupManagement";
import TaskDetailPage from "../features/Projects/components/TaskDetailPage"; // Trang chi tiết task mới
import ProfilePage from "../features/Profile/components/ProfilePage";

export default function AppRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    Boolean(localStorage.getItem("access_token")),
  );

  return (
    <Navigation isAuthenticated={isAuthenticated} setIsAuthenticated={setIsAuthenticated}>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <DashboardPage />
            ) : (
              <LandingPage />
            )
          }
        />

        <Route
          path="/project"
          element={isAuthenticated ? <ProjectManagement /> : <Navigate to="/" replace />}
        />

        {/* Thêm route cho trang chi tiết task dựa theo ID */}
        <Route
          path="/task/:taskId"
          element={isAuthenticated ? <TaskDetailPage /> : <Navigate to="/" replace />}
        />

        <Route
          path="/group-management"
          element={isAuthenticated ? <GroupManagement /> : <Navigate to="/" replace />}
        />

        <Route
          path="/profile"
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />
      </Routes>
    </Navigation>
  );
}