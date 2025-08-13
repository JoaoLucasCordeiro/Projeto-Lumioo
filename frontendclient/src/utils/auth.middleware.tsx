// Função para proteger rotas com base no token JWT
import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = localStorage.getItem('jwt');
  if (!token) {
    return <Navigate to="/signin" replace />;
  }
  return <>{children}</>;
}

// Exemplo de uso:
// <Route path="/feed" element={
//   <ProtectedRoute>
//     <FeedPage />
//   </ProtectedRoute>
// } />
