import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { IniciativasPage } from './pages/IniciativasPage';
import { TareasPage } from './pages/TareasPage';
import { SprintsPage } from './pages/SprintsPage';
import { ReportesPage } from './pages/ReportesPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

function App() {
  // Check localStorage for previous session
  useEffect(() => {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        if (authData.isAuthenticated) {
          // Auth is automatically restored from localStorage by AuthProvider
        }
      } catch (error) {
        console.error('Error loading auth from localStorage:', error);
      }
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/iniciativas"
          element={
            <ProtectedRoute>
              <IniciativasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tareas"
          element={
            <ProtectedRoute>
              <TareasPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/sprints"
          element={
            <ProtectedRoute>
              <SprintsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reportes"
          element={
            <ProtectedRoute>
              <ReportesPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
