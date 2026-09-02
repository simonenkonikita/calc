import { Routes, Route, Navigate } from "react-router-dom";
import { AdminPage } from "../../pages/Admin/AdminPage";
import { LandingPage } from "../../pages/LandingPage/LandingPage";
import MortgageCalculator from "../../pages/MortgageCalculator/MortgageCalculator";
import { ProfilePage } from "../../pages/ProfilePage/ProfilePage";
import { ProjectsPage } from "../../pages/ProjectsPage/ProjectsPage";
import { AuthProvider } from "../../providers/AuthProvider";
import { ProtectedRoute } from "../ProtectedRoute";
import AppNavigation from "../Navigation/AppNavigation";

const App = () => {
  return (
    <AuthProvider>
      <AppNavigation />
      <Routes>
        <Route path="/" element={<LandingPage />} />
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
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute roles={["admin"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;
