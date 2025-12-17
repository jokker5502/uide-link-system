import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ScanPage from './pages/ScanPage';
import AdminPage from './pages/AdminPage';
import SchedulePage from './pages/SchedulePage';
import './index.css';

function App() {
  return (
    <div className="app-container" style={{ width: '100%', minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '2rem' }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scan" element={<ScanPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/schedules" element={<SchedulePage />} />
      </Routes>
    </div>
  );
}

export default App;
