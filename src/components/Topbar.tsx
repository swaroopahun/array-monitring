import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

interface TopbarProps {
  onToggleSidebar: () => void;
  onSearchChange?: (val: string) => void;
}

const Topbar: React.FC<TopbarProps> = ({ onToggleSidebar, onSearchChange }) => {
  const {
    theme,
    toggleTheme,
    page,
    currentProj,
    alarms,
    ackAllAlarms,
    setPage,
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const notifRef = useRef<HTMLDivElement | null>(null);

  const activeAlarms = alarms.filter((a) => a.status === 'active');
  const showNotifDot = activeAlarms.length > 0;

  // Breadcrumb logic
  const getBreadcrumb = () => {
    const labels: Record<string, string> = {
      dashboard: 'Dashboard',
      projects: 'Projects',
      fieldview: 'Field View',
      telemetry: 'Analytics',
      weather: 'Weather / RSU',
      battery: 'Battery Dashboard',
      alarms: 'Alarms',
      reports: 'DAS Reports',
      team: 'Team',
      settings: 'Settings',
    };

    const root = labels[page] || page;
    if (page === 'projects' && currentProj) {
      return (
        <>
          <span>{root}</span>
          <span className="bc-sep">›</span>
          <span className="bc-cur">{currentProj.name}</span>
        </>
      );
    }
    return <span>{root}</span>;
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);
    if (onSearchChange) onSearchChange(val);
  };

  const handleNotifClick = () => {
    setPage('alarms');
    setNotifOpen(false);
  };

  return (
    <header className="topbar">
      {/* Mobile Hamburger Menu Toggle */}
      <button className="hamburger" onClick={onToggleSidebar}>
        ☰
      </button>

      <div className="breadcrumb">{getBreadcrumb()}</div>

      <div className="search-box">
        <svg
          width="13"
          height="13"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ color: 'var(--tm)', flexShrink: 0 }}
        >
          <circle cx="6.5" cy="6.5" r="4.5" />
          <line x1="10" y1="10" x2="14" y2="14" />
        </svg>
        <input
          value={searchVal}
          onChange={handleSearchChange}
          placeholder="Search projects, devices…"
        />
      </div>

      <div className="topbar-right">
        {/* Notifications Dropdown */}
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button className="icon-btn" onClick={() => setNotifOpen(!notifOpen)}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M8 1a5 5 0 00-5 5v3L1.5 11h13L13 9V6A5 5 0 008 1z" />
              <path d="M6.5 13a1.5 1.5 0 003 0" />
            </svg>
            {showNotifDot && <div className="notif-badge-dot" />}
          </button>

          <div className={`notif-dd ${notifOpen ? 'open' : ''}`}>
            <div className="notif-dd-hdr">
              <span className="notif-title">Notifications</span>
              <span
                className="card-act fs11"
                onClick={() => {
                  ackAllAlarms();
                  setNotifOpen(false);
                }}
              >
                Mark all read
              </span>
            </div>
            {activeAlarms.slice(0, 5).map((a) => (
              <div
                key={a.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '10px 14px',
                  borderBottom: '1px solid var(--bd)',
                  cursor: 'pointer',
                  borderLeft: `3px solid ${
                    a.sev === 'critical'
                      ? 'var(--orange)'
                      : a.sev === 'warning'
                      ? 'var(--gold)'
                      : 'var(--sky)'
                  }`,
                }}
                onClick={handleNotifClick}
              >
                <span
                  className={`badge ${
                    a.sev === 'critical'
                      ? 'b-crit'
                      : a.sev === 'warning'
                      ? 'b-warning'
                      : 'b-info'
                  }`}
                  style={{ fontSize: '9px', padding: '2px 6px' }}
                >
                  {a.sev}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'var(--fs)', fontSize: '12px' }}>
                    {a.desc}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--ts)' }}>
                    {a.project} · {a.time}
                  </div>
                </div>
              </div>
            ))}
            <div style={{ padding: '10px', textAlign: 'center' }}>
              <span className="card-act fs11" onClick={handleNotifClick}>
                View all →
              </span>
            </div>
          </div>
        </div>

        {/* Theme Toggle */}
        <button className="theme-btn" onClick={toggleTheme} title="Toggle theme">
          <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
