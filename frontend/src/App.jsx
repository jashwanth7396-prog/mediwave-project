import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import PrivateRoute from './routes/PrivateRoute.jsx';
import AuthRoute from './routes/AuthRoute.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import DashboardPage from './pages/dashboard/DashboardPage.jsx';
import MedicinePage from './pages/inventory/MedicinePage.jsx';
import DamagedStockPage from './pages/damaged/DamagedStockPage.jsx';
import ReturnRequestsPage from './pages/returns/ReturnRequestsPage.jsx';
import ReportsPage from './pages/reports/ReportsPage.jsx';
import NotificationsPage from './pages/notifications/NotificationsPage.jsx';
import AuditLogsPage from './pages/audit/AuditLogsPage.jsx';
import Layout from './layouts/MainLayout.jsx';
import Toast from './components/Toast.jsx';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route element={<AuthRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<DashboardPage />} />
              <Route path="medicines" element={<MedicinePage />} />
              <Route path="damaged" element={<DamagedStockPage />} />
              <Route path="returns" element={<ReturnRequestsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="audit" element={<AuditLogsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toast />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
