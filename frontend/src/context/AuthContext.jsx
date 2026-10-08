import React, { createContext, useContext, useState } from 'react';
import AuthModal from '../features/Auth/components/AuthModal';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [moAuthModal, setMoAuthModal] = useState(false);

  const xulyMoAuthModal = () => setMoAuthModal(true);
  const xulyDongAuthModal = () => setMoAuthModal(false);

  return (
    <AuthContext.Provider value={{ xulyMoAuthModal, xulyDongAuthModal }}>
      {children}
      
      {/* AuthModal quản lý tập trung toàn ứng dụng tại đây */}
      <AuthModal
        isOpen={moAuthModal}
        onClose={xulyDongAuthModal}
        onSuccess={() => {
          window.location.reload();
        }}
      />
    </AuthContext.Provider>
  );
}

export const useAuthModal = () => useContext(AuthContext);