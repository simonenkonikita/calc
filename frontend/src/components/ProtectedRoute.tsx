// frontend/src/components/ProtectedRoute.tsx

import React from "react";
import { Navigate } from "react-router-dom";
import { UserRole } from "../types/auth.types";
import { useAuth } from "../hooks/ui/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  roles,
}) => {
  const { isAuthenticated, user, loading } = useAuth();

  // 🔥 ЛОГИ ДЛЯ ДИАГНОСТИКИ
  console.log("🔍 ProtectedRoute - loading:", loading);
  console.log("🔍 ProtectedRoute - isAuthenticated:", isAuthenticated);
  console.log("🔍 ProtectedRoute - user:", user);
  console.log("🔍 ProtectedRoute - user role:", user?.role);
  console.log("🔍 ProtectedRoute - required roles:", roles);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("❌ Not authenticated, redirecting to /");
    return <Navigate to="/" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    console.log(
      `❌ Role ${user.role} not in ${roles}, redirecting to /calculator`,
    );
    return <Navigate to="/calculator" replace />;
  }

  console.log("✅ Access granted!");
  return <>{children}</>;
};
