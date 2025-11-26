import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: ReactNode;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const token = localStorage.getItem('jwtToken');
  
  console.log('PrivateRoute 확인:', { token }); // 이 로그가 보이나?
  
  if (!token) {
    console.log('토큰 없음 - 로그인 페이지로 리다이렉트');
    return <Navigate to="/login" replace />;
  }

  console.log('토큰 있음 - 페이지 렌더링');
  return <>{children}</>;
};