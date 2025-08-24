// src/routes/ProtectedRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: JSX.Element;
  allowedRoles?: ('user' | 'admin')[];
}

const ProtectedRoute: React.FC<Props> = ({ children, allowedRoles = ['user', 'admin'] }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="text-center p-8">Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  return children;
};

export default ProtectedRoute;
