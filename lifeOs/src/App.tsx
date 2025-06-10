import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import OrbitalDemoPage from './experimental/orbital-navigation/OrbitalDemoPage';
import CircularMenuDemo from './experimental/circular-menu/CircularMenuDemo';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route path="/orbital-demo" element={<OrbitalDemoPage />} />
        <Route path="/circular-menu-demo" element={<CircularMenuDemo />} />
      </Routes>
    </Router>
  );
}

export default App;
