import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnimatePresence } from 'framer-motion';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import JobMatcher from './pages/JobMatcher';
import Roadmap from './pages/Roadmap';
import MockInterview from './pages/MockInterview';
import ApplicationTracker from './pages/ApplicationTracker';
import ReadinessScore from './pages/ReadinessScore';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-dark flex items-center justify-center text-white">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="resume" element={<ResumeAnalyzer />} />
              <Route path="jobs" element={<JobMatcher />} />
              <Route path="roadmap" element={<Roadmap />} />
              <Route path="interview" element={<MockInterview />} />
              <Route path="applications" element={<ApplicationTracker />} />
              <Route path="readiness" element={<ReadinessScore />} />
            </Route>
          </Routes>
        </AnimatePresence>
      </Router>
    </AuthProvider>
 
    
  );
}
export default App;
