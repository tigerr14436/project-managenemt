import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import AuthModal from "../features/Auth/components/AuthModal";
import "./Navigation.css";

export default function Navigation({ children, daDangNhap, setDaDangNhap }) {
  const [moSidebar, setMoSidebar] = useState(daDangNhap);
  const [moAuthModal, setMoAuthModal] = useState(false);
  const dieuHuong = useNavigate();

  const xulyDangXuat = () => {
    localStorage.removeItem("access_token");
    setDaDangNhap(false);
    setMoSidebar(false);
    dieuHuong("/", { replace: true });
  };

  const xulyMoAuthModal = () => {
    setMoAuthModal(true);
  };

  const handleAuthSuccess = () => {
    setDaDangNhap(true);
    setMoSidebar(true);
    setMoAuthModal(false);
    dieuHuong("/du-an", { replace: true });
  };

  return (
    <div className="layout-wrapper">
      <Header
        moSidebar={moSidebar}
        setMoSidebar={setMoSidebar}
        daDangNhap={daDangNhap}
        xulyMoAuthModal={xulyMoAuthModal}
        xulyDangXuat={xulyDangXuat}
      />

      <div className="main-body">
        <Sidebar
          moSidebar={moSidebar}
          setMoSidebar={setMoSidebar}
          daDangNhap={daDangNhap}
        />

        <main className={`main-content ${!daDangNhap ? "no-sidebar" : ""}`}>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                xulyMoAuthModal: xulyMoAuthModal,
              });
            }
            return child;
          })}
        </main>
      </div>

      <AuthModal
        isOpen={moAuthModal}
        onClose={() => setMoAuthModal(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
}