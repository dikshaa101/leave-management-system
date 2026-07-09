import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/employee/Dashboard';
import ApplyLeave from './pages/employee/ApplyLeave';
import MyLeaves from './pages/employee/MyLeaves';
import EmployeeProfile from './pages/employee/Profile';
import ManagerDashboard from './pages/manager/Dashboard';
import PendingLeaves from './pages/manager/PendingLeaves';
import AllLeaves from './pages/manager/AllLeaves';
import Employees from './pages/manager/Employees';
import TeamAvailability from './pages/manager/TeamAvailability';
import ManagerProfile from './pages/manager/Profile';
import './styles/global.css';
import OAuth2Success from './pages/OAuth2Success';

function RootRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'MANAGER' ? '/manager' : '/employee'} replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/oauth2/success"element={<OAuth2Success />}/>
          <Route path="/register" element={<Register />} />

          <Route
            path="/employee"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/apply"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <ApplyLeave />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/leaves"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE']}>
                <MyLeaves />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/profile"
            element={
              <ProtectedRoute allowedRoles={['EMPLOYEE', 'MANAGER']}>
                <EmployeeProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/manager"
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/pending"
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <PendingLeaves />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/leaves"
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <AllLeaves />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/employees"
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <Employees />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/availability"
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <TeamAvailability />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manager/profile"
            element={
              <ProtectedRoute allowedRoles={['MANAGER']}>
                <ManagerProfile />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
