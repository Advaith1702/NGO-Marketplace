import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import NgoDashboard from './pages/NgoDashboard';
import Marketplace from './pages/Marketplace';
import MyListings from './pages/MyListings';
import CreateListing from './pages/CreateListing';
import DonorDashboard from './pages/DonorDashboard';
import DonorExplore from './pages/DonorExplore';
import NgoProfile from './pages/NgoProfile';
import './index.css';

const HomeRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;
  if (!user) return <Navigate to="/login" />;
  switch (user.role) {
    case 'admin': return <Navigate to="/admin" />;
    case 'ngo': return <Navigate to="/ngo/dashboard" />;
    case 'donor': return <Navigate to="/donor/dashboard" />;
    default: return <Navigate to="/login" />;
  }
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/ngo/dashboard" element={<ProtectedRoute roles={['ngo']}><NgoDashboard /></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute roles={['ngo']}><Marketplace /></ProtectedRoute>} />
            <Route path="/ngo/listings" element={<ProtectedRoute roles={['ngo']}><MyListings /></ProtectedRoute>} />
            <Route path="/ngo/create-listing" element={<ProtectedRoute roles={['ngo']}><CreateListing /></ProtectedRoute>} />
            <Route path="/donor/dashboard" element={<ProtectedRoute roles={['donor']}><DonorDashboard /></ProtectedRoute>} />
            <Route path="/donor/explore" element={<ProtectedRoute roles={['donor']}><DonorExplore /></ProtectedRoute>} />
            <Route path="/ngo/:id" element={<ProtectedRoute roles={['donor', 'ngo', 'admin']}><NgoProfile /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;
