// src/components/ui/Sidebar.tsx
import {
  FaHome,
  FaChartBar,
  FaEdit,
  FaCalendarAlt,
  FaFileAlt,
  FaCogs,
} from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const menuItems = [
  { label: 'Home', icon: <FaHome />, path: '/' },
  { label: 'Dashboard', icon: <FaChartBar />, path: '/dashboard' },
  { label: 'Input Data', icon: <FaEdit />, path: '/input' },
  { label: 'Daily Menu', icon: <FaCalendarAlt />, path: null }, // jadi dropdown
  { label: 'Daily Report', icon: <FaFileAlt />, path: null }, // jadi dropdown
  { label: 'ABMP', icon: <FaCogs />, path: '/abmp' },
];

const dailyReportSubmenu = [
  { label: 'W301', path: '/daily-report/w301' },
  { label: 'W302', path: '/daily-report/w302' },
  { label: 'W303', path: '/daily-report/w303' },
  { label: 'W304', path: '/daily-report/w304' },
  { label: 'W305', path: '/daily-report/w305' },
];

const dailyMenuSubmenu = [
  { label: 'TBR BUSH4', path: '/daily-menu/bush4' },
  { label: 'TBR WS1', path: '/daily-menu/ws1' },
  { label: 'TBR Archived', path: '/archived' },
];

export default function Sidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const location = useLocation();
  const [isReportExpanded, setIsReportExpanded] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);

  return (
    <div
      className={`${
        isCollapsed ? 'w-16' : 'w-48'
      } bg-gradient-to-t from-[#00838F] to-[#00838F] text-white h-screen p-4 space-y-4 fixed transition-all duration-300 overflow-y-auto`}
    >
      {!isCollapsed && (
        <div className="flex flex-col items-center">
          <img
            src="/public/logo.png" // Ganti dengan path file gambar kamu
            alt="App Logo"
            className="w-150 h-15" // Ukuran logo (bisa disesuaikan)
          />
        </div>
      )}
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.label}>
            {/* Dropdown menu check */}
            {item.label === 'Daily Report' || item.label === 'Daily Menu' ? (
              <div
                onClick={() =>
                  item.label === 'Daily Report'
                    ? setIsReportExpanded(!isReportExpanded)
                    : setIsMenuExpanded(!isMenuExpanded)
                }
                className="flex items-center gap-2 px-2 py-2 rounded cursor-pointer hover:bg-[#00707A] text-[#f0f0f0] transition-colors duration-200"
              >
                <span className="text-lg">{item.icon}</span>
                {!isCollapsed && (
                  <>
                    <span>{item.label}</span>
                    <span className="ml-auto text-xs">
                      {(
                        item.label === 'Daily Report'
                          ? isReportExpanded
                          : isMenuExpanded
                      )
                        ? '▾'
                        : '▸'}
                    </span>
                  </>
                )}
              </div>
            ) : (
              <Link
                to={item.path!}
                className={`flex items-center gap-2 px-2 py-2 rounded hover:bg-[#00707A] transition-colors duration-200 ${
                  location.pathname === item.path ? 'bg-[#00636B]' : ''
                } text-[#f0f0f0]`}
              >
                <span className="text-lg">{item.icon}</span>
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            )}

            {/* Daily Report Submenu */}
            {!isCollapsed &&
              item.label === 'Daily Report' &&
              isReportExpanded && (
                <ul className="ml-6 mt-0 space-y-1 text-xs">
                  {dailyReportSubmenu.map((sub) => (
                    <li key={sub.label}>
                      <Link
                        to={sub.path}
                        className={`block px-2 py-1 rounded hover:bg-[#00707A] transition-colors duration-200 ${
                          location.pathname === sub.path ? 'bg-[#00636B]' : ''
                        } text-[#f0f0f0]`}
                      >
                        {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

            {/* Daily Menu Submenu */}
            {!isCollapsed && item.label === 'Daily Menu' && isMenuExpanded && (
              <ul className="ml-6 mt-1 space-y-1 text-xs">
                {dailyMenuSubmenu.map((sub) => (
                  <li key={sub.label}>
                    <Link
                      to={sub.path}
                      className={`block px-2 py-1 rounded hover:bg-[#00707A] transition-colors duration-200 ${
                        location.pathname === sub.path ? 'bg-[#00636B]' : ''
                      } text-[#f0f0f0]`}
                    >
                      {sub.label}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
