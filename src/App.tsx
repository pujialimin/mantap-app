// src/App.tsx
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import InputData from './pages/InputData';
import DailyMenu from './pages/DailyMenu';
import DailyReport from './pages/DailyReport';
import Abmp from './pages/Abmp';
import W301 from './pages/W301';
import W302 from './pages/W302';
import W303 from './pages/W303';
import W304 from './pages/W304';
import W305 from './pages/W305';
import DailyMenuBush4 from './pages/DailyMenuBush4';
import DailyMenuWS1 from './pages/DailyMenuWS1';
import Archived from './pages/Archived';
import Login from './pages/Login'; // ⬅️ pastikan ini ada

import { FaBars } from 'react-icons/fa';
import { supabase } from './supabaseClient'; // ⬅️ pastikan sudah diimpor
import { useNavigate } from 'react-router-dom'; // ⬅️ untuk redirect setelah logout
import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';

function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate(); // untuk redirect setelah logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const getTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/input':
        return 'Input Data';
      case '/daily-menu/bush4':
        return 'Daily Menu TBR BUSH 4';
      case '/daily-menu/ws1':
        return 'Daily Menu TBR WS 1';
      case '/archived':
        return 'Archived';
      case '/daily-report':
        return 'Daily Report';
      case '/daily-report/w301':
        return 'Daily Report Sheetmetal WS1 - W301';
      case '/daily-report/w302':
        return 'Daily Report Composite WS1 - W302';
      case '/daily-report/w303':
        return 'Daily Report Machining & Welding - W303';
      case '/daily-report/w304':
        return 'Daily Report Sheetmetal BUSH4 - W304';
      case '/daily-report/w305':
        return 'Daily Report Composite BUSH4 - W305';
      case '/abmp':
        return 'ABMP';
      default:
        return 'Home';
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login', { replace: true });
      }
    });
  }, []);
  
  
  
  return (
    <div className="flex">
      <Sidebar isCollapsed={isCollapsed} />
      <div
        className={`transition-all duration-300 h-full bg-gray-100 w-full ${
          isCollapsed ? 'ml-0' : 'ml-44'
        }`}
      >
        {/* Header */}
<div className="flex items-center justify-between bg-white px-4 py-3 shadow sticky top-0 z-10">
  <div className="flex items-center gap-4">
    <button
      className="text-gray-700 text-lg focus:outline-none"
      onClick={() => setIsCollapsed(!isCollapsed)}
      title="Toggle Sidebar"
    >
      <FaBars />
    </button>
    <h1 className="text-lg font-semibold text-gray-800">{getTitle()}</h1>
  </div>

  {/* Logout button */}
  <button
    onClick={handleLogout}
    className="bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
  >
    Logout
  </button>
</div>

        {/* Main Content */}
        <div className="p-4 w-full h-full overflow-x-hidden">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/input" element={<InputData />} />
            <Route path="/daily-menu" element={<DailyMenu />} />
            <Route path="/daily-menu/bush4" element={<DailyMenuBush4 />} />
            <Route path="/daily-menu/ws1" element={<DailyMenuWS1 />} />
            <Route path="/daily-report/w301" element={<W301 />} />
            <Route path="/daily-report/w302" element={<W302 />} />
            <Route path="/daily-report/w303" element={<W303 />} />
            <Route path="/daily-report/w304" element={<W304 />} />
            <Route path="/daily-report/w305" element={<W305 />} />
            <Route path="/abmp" element={<Abmp />} />
            <Route path="/archived" element={<Archived />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        {/* 🟨 Login tidak memakai sidebar/header */}
        <Route path="/login" element={<Login />} />

        {/* 🟩 Semua route lain dibungkus Sidebar/Header */}
        <Route path="*" element={<MainLayout />} />
      </Routes>
    </Router>
    </AuthProvider>
  );
}

