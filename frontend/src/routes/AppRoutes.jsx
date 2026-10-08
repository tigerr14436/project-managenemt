import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navigation from '../components/Navigation';
import TrangChu from '../features/DashBoard/components/TrangChu';
import TrangDuAn from '../features/Projects/components/TrangDuAn';
import TrangWorkspace from '../features/Workspaces/components/TrangWorkspace';

export default function AppRoutes() {
  const [daDangNhap, setDaDangNhap] = useState(() => 
    Boolean(localStorage.getItem('access_token'))
  );

  return (
    <Navigation daDangNhap={daDangNhap} setDaDangNhap={setDaDangNhap}>
      <Routes>
        <Route 
          path="/" 
          element={daDangNhap ? <Navigate to="/du-an" replace /> : <TrangChu />} 
        />
        
        <Route 
          path="/du-an" 
          element={daDangNhap ? <TrangDuAn /> : <Navigate to="/" replace />} 
        />

        <Route 
          path="/workspace" 
          element={daDangNhap ? <TrangWorkspace /> : <Navigate to="/" replace />} 
        />

        <Route 
          path="*" 
          element={<Navigate to={daDangNhap ? "/du-an" : "/"} replace />} 
        />
      </Routes>
    </Navigation>
  );
}