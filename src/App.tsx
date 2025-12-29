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
import Spaja from './pages/Spaja';
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
import { useRef } from 'react';

import { GiHotMeal } from 'react-icons/gi';
import { MdLogout } from 'react-icons/md';
import { FaUserCircle } from 'react-icons/fa';

function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const idleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const displayName = userEmail ? userEmail.split('@')[0] : '';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // 🕒 Fungsi reset idle timer
  const resetIdleTimer = () => {
    if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
    idleTimeoutRef.current = setTimeout(() => {
      handleLogout();
    }, 30 * 60 * 1000); // 30 menit
  };

  useEffect(() => {
    // Cek jika tidak ada session, arahkan ke login
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/login', { replace: true });
      } else {
        setUserEmail(session.user.email ?? null); // simpan email user
      }
    });

    // 🟡 Tambahkan event listener untuk aktifitas user
    const events = [
      'mousemove',
      'keydown',
      'mousedown',
      'touchstart',
      'scroll',
    ];
    events.forEach((event) => window.addEventListener(event, resetIdleTimer));

    // 🟢 Set idle timer awal
    resetIdleTimer();

    // 🧹 Cleanup saat unmount
    return () => {
      if (idleTimeoutRef.current) clearTimeout(idleTimeoutRef.current);
      events.forEach((event) =>
        window.removeEventListener(event, resetIdleTimer)
      );
    };
  }, []);

  const getTitle = () => {
    switch (location.pathname) {
      case '/dashboard':
        return 'Dashboard';
      case '/input':
        return 'Input Data';
      case '/daily-menu/bush4':
        return (
          <span className="flex items-center space-x-2">
            <GiHotMeal className="w-5 h-5 text-white" />
            <span>Daily Menu TJK BUSH4</span>
          </span>
        );
      case '/daily-menu/ws1':
        return (
          <span className="flex items-center space-x-2">
            <GiHotMeal className="w-5 h-5 text-white" />
            <span>Daily Menu TCR WS 1</span>
          </span>
        );
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
        case '/spaja':
          return 'SP-AJA';
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
        <div className="flex items-center justify-between bg-[#00717a] px-4 py-2 shadow sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              className="text-white text-lg focus:outline-none"
              onClick={() => setIsCollapsed(!isCollapsed)}
              title="Toggle Sidebar"
            >
              <FaBars />
            </button>
            <h1 className="text-lg font-semibold text-white">{getTitle()}</h1>
          </div>

          <div className="flex items-center gap-3">
            {userEmail && (
              <div className="flex items-center gap-2 text-sm text-white">
                <FaUserCircle className="w-5 h-5 text-white" />
                <span>{displayName}</span>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 bg-white text-[#004d53] px-2 py-1 rounded text-xs hover:bg-red-600"
            >
              <MdLogout className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
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
            <Route path="/spaja" element={<Spaja />} />
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
