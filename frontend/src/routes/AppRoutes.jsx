import { Routes, Route } from 'react-router-dom';
import Navigation from '../components/Navigation';
import FormDangNhap from '../features/Auth/components/FormDangNhap';
import FormDangKy from '../features/Auth/components/FormDangKy';
import TrangChu from '../features/DashBoard/components/TrangChu';
import TrangDuAn from '../features/Projects/components/TrangDuAn';
import TrangWorkspace from '../features/Workspaces/components/TrangWorkspace';

export default function AppRoutes() {
  return (
    <Navigation>
      <Routes>
        <Route path="/" element={<TrangChu />} />
        <Route path="/dang-nhap" element={<FormDangNhap />} />
        <Route path="/dang-ky" element={<FormDangKy />} />
        <Route path="/du-an" element={<TrangDuAn />} />
        <Route path="/workspace" element={<TrangWorkspace />} />
      </Routes>
    </Navigation>
  );
}