import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context';
import { LanguageProvider } from './context';
import { ErrorBoundary, ToastContainer } from './components';
import { Login, Register, ResetPassword, Dashboard, VerifyEmail } from './pages';

// Helper to determine the dashboard path based on user role
export const getRoleDashboardPath = (role) => {
  switch (role) {
    case 'UNION_ADMIN': return '/dashboard/union-admin';
    case 'FIELD_SECRETARY': return '/dashboard/field-secretary';
    case 'PASTOR': return '/dashboard/pastor';
    case 'ELDER': return '/dashboard/elder';
    case 'TRAINER': return '/dashboard/trainer';
    default: return '/login';
  }
};

// Protected Route Component with role restriction
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={getRoleDashboardPath(user.role)} replace />;
  }
  
  return children;
};

// Redirect route for the base dashboard path
const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  return <Navigate to={getRoleDashboardPath(user.role)} replace />;
};

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <AuthProvider>
          <ToastContainer />
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              
              {/* Role-Specific Dashboard Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardRedirect />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/union-admin" 
                element={
                  <ProtectedRoute allowedRoles={['UNION_ADMIN']}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/field-secretary" 
                element={
                  <ProtectedRoute allowedRoles={['FIELD_SECRETARY']}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/pastor" 
                element={
                  <ProtectedRoute allowedRoles={['PASTOR']}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/elder" 
                element={
                  <ProtectedRoute allowedRoles={['ELDER']}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/dashboard/trainer" 
                element={
                  <ProtectedRoute allowedRoles={['TRAINER']}>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />

              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </Router>
        </AuthProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
