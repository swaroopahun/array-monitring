import React from 'react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { page, setPage, alarms } = useApp();

  const activeAlarmsCount = alarms.filter((a) => a.status === 'active').length;

  const handleNavClick = (newPage: string) => {
    setPage(newPage);
    onClose();
  };

  const navItem = (targetPage: string, icon: React.ReactNode, label: string, showBadge = false) => {
    const isActive = page === targetPage || (targetPage === 'projects' && page === 'projects');
    return (
      <div
        className={`nav-item ${isActive ? 'active' : ''}`}
        onClick={() => handleNavClick(targetPage)}
      >
        {icon}
        {label}
        {showBadge && activeAlarmsCount > 0 && (
          <span className="nav-badge" id="alarm-badge">
            {activeAlarmsCount}
          </span>
        )}
      </div>
    );
  };

  return (
    <>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-mark"></div>
          <div>
            <div className="logo-text">Device</div>
            <div className="logo-sub">Monitoring Portal</div>
          </div>
        </div>

        <div className="nav-group">
          <div className="nav-label">Overview</div>
          {navItem(
            'dashboard',
            <svg className="nav-icon" viewBox="0 0 16 16" fill="currentColor">
              <rect x="1" y="1" width="6" height="6" rx="1" />
              <rect x="9" y="1" width="6" height="6" rx="1" />
              <rect x="1" y="9" width="6" height="6" rx="1" />
              <rect x="9" y="9" width="6" height="6" rx="1" />
            </svg>,
            'Dashboard'
          )}
        </div>

        <div className="nav-group">
          <div className="nav-label">Monitoring</div>
          {navItem(
            'projects',
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="2" width="12" height="12" rx="2" />
              <path d="M5 8h6M5 5h6M5 11h4" />
            </svg>,
            'Projects'
          )}
          {navItem(
            'fieldview',
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="5" width="14" height="2" rx=".5" />
              <rect x="1" y="9" width="14" height="2" rx=".5" />
              <path d="M8 1v14" />
            </svg>,
            'Field View'
          )}
          {navItem(
            'telemetry',
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="1,12 4,7 7,9 10,4 13,6 15,3" />
            </svg>,
            'Analytics'
          )}
          {navItem(
            'weather',
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="7" r="3" />
              <path d="M8 1v1M8 13v1M1 7h1M13 7h1M3 3l1 1M11 11l1 1M3 11l1-1M11 3l1-1" />
            </svg>,
            'Weather / RSU'
          )}
        </div>

        <div className="nav-group">
          <div className="nav-label">Operations</div>
          {navItem(
            'battery',
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="1" y="4" width="12" height="8" rx="1.5"/>
              <path d="M13 6.5v3" strokeWidth="2.5" strokeLinecap="round"/>
              <rect x="2.5" y="5.5" width="5" height="5" rx=".5" fill="currentColor" stroke="none" opacity=".5"/>
            </svg>,
            'Battery'
          )}
          {navItem(
            'devices',
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="2" y="3" width="12" height="10" rx="1.5" />
              <path d="M5 14h6" strokeWidth="1" />
            </svg>,
            'Device Table View'
          )}
          {navItem(
            'trackers',
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="5" />
              <path d="M8 4v8M4 8h8" />
            </svg>,
            'Tracker Details'
          )}
          {navItem(
            'comhub',
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="4" cy="5" r="1.5" />
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="8" cy="12" r="1.5" />
              <path d="M5 6.5L7 10.5M11 6.5L9 10.5M4 5L8 11.5M12 5L8 11.5" />
            </svg>,
            'Communication Hub'
          )}
          {navItem(
            'alarms',
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 1a5 5 0 00-5 5v3L1.5 11h13L13 9V6A5 5 0 008 1z" />
              <path d="M6.5 13a1.5 1.5 0 003 0" />
            </svg>,
            'Alarms',
            true
          )}
          {navItem(
            'reports',
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="1" width="10" height="14" rx="1" />
              <path d="M6 5h4M6 8h4M6 11h2" />
            </svg>,
            'DAS Reports'
          )}
        </div>

        <div className="nav-group">
          <div className="nav-label">Admin</div>
          {navItem(
            'team',
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="6" cy="5" r="2.5" />
              <path d="M1 14c0-2.8 2.2-5 5-5s5 2.2 5 5" />
              <circle cx="12" cy="5" r="2" />
              <path d="M12 9c1.7 0 3 1.3 3 3" />
            </svg>,
            'Team'
          )}
          {navItem(
            'settings',
            <svg className="nav-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="8" cy="8" r="2" />
              <path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6l1.4 1.4M3 13l1.4-1.4M11.6 4.4l1.4-1.4" />
            </svg>,
            'Settings'
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-pill">
            <div className="avatar">OP</div>
            <div>
              <div className="user-name">Operator</div>
              <div className="user-role">Operations Manager</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
