import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { AuthProvider } from './store/authStore';
import { TareasProvider } from './store/tareasStore';
import { IniciativasProvider } from './store/iniciativasStore';
import { SprintsProvider } from './store/sprintsStore';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { IniciativasPage } from './pages/IniciativasPage';
import { TareasPage } from './pages/TareasPage';
import { SprintsPage } from './pages/SprintsPage';
import { ReportesPage } from './pages/ReportesPage';

// Logger utility
const Logger = {
  info: (msg: string) => console.log(`[INFO] ${msg}`),
  error: (msg: string) => console.error(`[ERROR] ${msg}`),
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const AppRoutes = () => {
  // Check localStorage for previous session
  useEffect(() => {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      try {
        const authData = JSON.parse(savedAuth);
        if (authData.isAuthenticated) {
          Logger.info('[App] Auth restored from localStorage');
        }
      } catch (error) {
        Logger.error('Error loading auth from localStorage');
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
};

function App() {
  Logger.info('[App] App rendered');

  return (
    <AuthProvider>
      <TareasProvider>
        <IniciativasProvider>
          <SprintsProvider>
            <AppRoutes />
          </SprintsProvider>
        </IniciativasProvider>
      </TareasProvider>
    </AuthProvider>
  );
}

export default App;
