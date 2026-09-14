import { Routes, Route, Navigate } from "react-router-dom";

import { LandingPage } from "../../pages/LandingPage/LandingPage";
import MortgageCalculator from "../../pages/MortgageCalculator/MortgageCalculator";
import { ProfilePage } from "../../pages/ProfilePage/ProfilePage";
import { ProjectsPage } from "../../pages/ProjectsPage/ProjectsPage";
import { AuthProvider } from "../../providers/AuthProvider";
import { ProtectedRoute } from "../ProtectedRoute";
import AppNavigation from "../Navigation/AppNavigation";
import { VerifyEmail } from "../../pages/VerifyEmail/VerifyEmail";
import { ResetPassword } from "../../pages/ResetPassword/ResetPassword";
import { AdminPage } from "../../pages/Admin/AdminPage/AdminPage";
import { DeveloperDashboard } from "../../pages/Developer/DeveloperDashboard";

const App = () => {
  return (
    <AuthProvider>
      <AppNavigation />
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route path="/verify-email" element={<VerifyEmail />} />
        {/*   <Route path="/forgot-password" element={<ForgotPassword />} /> */}
        <Route path="/reset-password" element={<ResetPassword />} />

        <Route
          path="/calculator"
          element={
            <ProtectedRoute>
              <MortgageCalculator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/projects"
          element={
            <ProtectedRoute>
              <ProjectsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        {/* 🔥 АДМИН ПАНЕЛЬ - ТОЛЬКО ДЛЯ АДМИНИСТРАТОРА ПРОЕКТА */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        {/* 🔥 ПАНЕЛЬ ЗАСТРОЙЩИКА - ДЛЯ АДМИНА И РАЗРАБОТЧИКА */}
        <Route
          path="/developer/*"
          element={
            <ProtectedRoute roles={["admin", "developer_admin"]}>
              <DeveloperDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
