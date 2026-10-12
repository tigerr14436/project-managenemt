import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import AuthModal from "../features/Auth/components/AuthModal";
import "./Navigation.css";

export default function Navigation({ children, isAuthenticated, setIsAuthenticated }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(isAuthenticated);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    setIsAuthenticated(false);
    setIsSidebarOpen(false);
    navigate("/", { replace: true });
  };

  const handleOpenAuthModal = () => {
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setIsSidebarOpen(true);
    setIsAuthModalOpen(false);
    navigate("/du-an", { replace: true });
  };

  return (
    <div className="layout-wrapper">
      <Header
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        isAuthenticated={isAuthenticated}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={handleLogout}
      />

      <div className="main-body">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          isAuthenticated={isAuthenticated}
        />

        <main className={`main-content ${!isAuthenticated ? "no-sidebar" : ""} ${isSidebarOpen ? "sidebar-opened" : ""}`}>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                onOpenAuthModal: handleOpenAuthModal,
              });
            }
            return child;
          })}
        </main>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}