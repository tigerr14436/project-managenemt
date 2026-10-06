import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import FormDangNhap from '../features/Auth/components/FormDangNhap';
import FormDangKy from '../features/Auth/components/FormDangKy';
import TrangChu from '../features/DashBoard/components/TrangChu';
export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/trang-chu" replace />} />
      <Route path="/dang-nhap" element={<FormDangNhap />} />
      <Route path="/dang-ky" element={<FormDangKy />} />
      <Route path="/trang-chu" element={<TrangChu />} />
    </Routes>
  );
}