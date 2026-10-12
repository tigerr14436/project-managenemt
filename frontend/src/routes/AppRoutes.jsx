import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import DashboardPage from "../features/DashBoard/components/DashboardPage";
import ProjectManagement from "../features/Projects/components/ProjectManagement";
import WorkspacePage from "../features/Workspaces/components/WorkspacePage";
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
          element={isAuthenticated ? <DashboardPage /> : <Navigate to="/" replace />}
        />

        <Route
          path="/project"
          element={isAuthenticated ? <ProjectManagement /> : <Navigate to="/" replace />}
        />

        <Route
          path="/workspace"
          element={
            isAuthenticated ? <WorkspacePage /> : <Navigate to="/" replace />
          }
        />

        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? "/" : "/"} replace />}
        />
        <Route
          path="/profile"
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/" replace />}
        />
      </Routes>
    </Navigation>
  );
}