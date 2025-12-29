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
import { HiArchiveBox } from 'react-icons/hi2';
import { GiHotMeal } from 'react-icons/gi';
import { FaPlaneDeparture } from "react-icons/fa";
import { RiMailSendLine } from "react-icons/ri";


const menuItems = [
  { label: 'Home', icon: <FaHome />, path: '/' },
  { label: 'Dashboard', icon: <FaChartBar />, path: '/dashboard' },
  { label: 'Input Data', icon: <FaEdit />, path: '/input' },
  { label: 'Daily Menu', icon: <GiHotMeal />, path: null },
  { label: 'Daily Report', icon: <FaFileAlt />, path: null },
  { label: 'ABMP', icon: <FaPlaneDeparture />, path: '/abmp' },
  { label: 'SP-AJA', icon: <RiMailSendLine />, path: '/spaja' },
  
];

const dailyReportSubmenu = [
  { label: 'TJK SHEETMETAL', path: '/daily-report/w304' },
  { label: 'TJK COMPOSITE', path: '/daily-report/w305' },
  
  { label: 'TCR MACHINING', path: '/daily-report/w303' },
];

const dailyMenuSubmenu = [
  { label: 'TJK BUSH4', path: '/daily-menu/bush4' },
  
  { label: 'TCR MACHINING', path: '/daily-menu/WS1' },
  { label: 'Archived', path: '/archived' },
];

export default function Sidebar({ isCollapsed }: { isCollapsed: boolean }) {
  const location = useLocation();
  const [isReportExpanded, setIsReportExpanded] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const { email } = useAuth();

  // Aturan blokir menu & submenu
  const blockedMenus: Record<string, string[]> = {
    'tbr1dashboard@gmail.com': ['Daily Report', 'Daily Menu', 'Input Data'], // PO/CUSTOMER
    'tbr.narrowbody@gmail.com': ['Daily Report'], // PE BUSH4
    'tbr.structureshop@gmail.com': ['Daily Report'], // PE WS1
    'sheetmetalbush4@gmail.com': ['Daily Menu', 'Input Data'], // SM BUSH4
    'asmorodoro@gmail.com': ['Daily Menu', 'Input Data'], // COMP BUSH4
    'tbr6composite.garuda@gmail.com': ['Daily Menu', 'Input Data'], // COMP BUSH4
    'tbr3majujayasentosa@gmail.com': ['Daily Menu', 'Input Data'],
    'composite1945@gmail.com': ['Daily Menu', 'Input Data'],
    'toolstorews.1@gmail.com': ['Daily Menu', 'Input Data'],
  };

  const blockedSubmenus: Record<string, string[]> = {
    'tbr.narrowbody@gmail.com': [
      ...dailyReportSubmenu.map((sub) => sub.label),
      'TBR WS1',
    ], // PE BUSH4
    'tbr.structureshop@gmail.com': [
      ...dailyReportSubmenu.map((sub) => sub.label),
      'TBR BUSH4',
    ], // PE WS1

    'sheetmetalbush4@gmail.com': ['W301', 'W302', 'W303', 'W305'], // SM BUSH4
    'asmorodoro@gmail.com': ['W301', 'W302', 'W303', 'W304'], // COMP BUSH4
    'tbr6composite.garuda@gmail.com': ['W301', 'W302', 'W303', 'W304'], // COMP BUSH4
    'tbr3majujayasentosa@gmail.com': ['W301', 'W302', 'W305', 'W304'], // COMP BUSH4
    'composite1945@gmail.com': ['W301', 'W303', 'W305', 'W304'],
    'toolstorews.1@gmail.com': ['W303', 'W302', 'W305', 'W304'],
  };

  // Filter menu utama
  const filteredMenuItems = menuItems.filter(
    (item) => !blockedMenus[email]?.includes(item.label)
  );

  // Filter submenu
  const filterSubmenu = (submenu: { label: string; path: string }[]) =>
    submenu.filter((sub) => !blockedSubmenus[email]?.includes(sub.label));

  return (
    <div
      className={`
        ${isCollapsed ? 'w-0 overflow-hidden p-0' : 'w-44 p-2'}
        bg-gradient-to-t from-[#00838F] to-[#00838F]
        text-white h-screen space-y-2 fixed
        transition-all duration-300 overflow-y-auto text-sm
      `}
    >
      {!isCollapsed && (
        <div className="flex flex-col items-center">
          <img src="/putih.png" alt="App Logo" className="w-150 h-15" />
        </div>
      )}

      <ul className="space-y-1">
        {filteredMenuItems.map((item) => (
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
                    <span className="ml-auto text-sm">
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
                  {filterSubmenu(dailyReportSubmenu).map((sub) => (
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
                {filterSubmenu(dailyMenuSubmenu).map((sub) => (
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
      {/* Version Info di pojok kiri bawah */}
      {!isCollapsed && (
        <div className="absolute bottom-6 left-2 text-xs text-[#f0f0f0]">
          Contact: Puji.Ali.08
        </div>
      )}
    </div>
  );
}
