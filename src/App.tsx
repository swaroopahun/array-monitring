import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import Statusbar from './components/Statusbar';

import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import FieldView from './pages/FieldView';
import DigitalTwin from './pages/DigitalTwin';
import Analytics from './pages/Analytics';
import Weather from './pages/Weather';
import Battery from './pages/Battery';
import Devices from './pages/Devices';
import TrackerDetails from './pages/TrackerDetails';
import CommunicationHub from './pages/CommunicationHub';
import FirmwareControl from './pages/FirmwareControl';
import SystemDiagnostics from './pages/SystemDiagnostics';
import Alarms from './pages/Alarms';
import Reports from './pages/Reports';
import Team from './pages/Team';
import Settings from './pages/Settings';

const AppContent: React.FC = () => {
  const { page, toasts, removeToast, canAccess } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Render the current active page
  const renderPage = () => {
    if (!canAccess(page)) {
      return (
        <div className="page active" style={{ padding: '28px' }}>
          <div className="sec-title">Access Restricted</div>
          <div className="sec-sub">Your current role does not have permission to view this section.</div>
        </div>
      );
    }

    switch (page) {
      case 'dashboard':
        return <Dashboard />;
      case 'projects':
        return <Projects />;
      case 'fieldview':
        return <FieldView />;
      case 'digitaltwin':
        return <DigitalTwin />;
      case 'telemetry':
        return <Analytics />;
      case 'weather':
        return <Weather />;
      case 'battery':
        return <Battery />;
      case 'devices':
        return <Devices />;
      case 'trackers':
        return <TrackerDetails />;
      case 'comhub':
        return <CommunicationHub />;
      case 'firmware':
        return <FirmwareControl />;
      case 'diagnostics':
        return <SystemDiagnostics />;
      case 'alarms':
        return <Alarms />;
      case 'reports':
        return <Reports />;
      case 'team':
        return <Team />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  const getToastBorderColor = (type: string) => {
    const colors: Record<string, string> = {
      success: 'var(--green-l)',
      error: 'var(--orange)',
      info: 'var(--sky)',
      warning: 'var(--gold)',
    };
    return colors[type] || 'var(--sky)';
  };

  return (
    <div className="shell">
      {/* Sidebar Backdrop Overlay on Mobile */}
      {sidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Layout Container */}
      <div className="main">
        {/* Top Header Bar */}
        <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        {/* Dynamic Inner Page Content */}
        <main className="content">{renderPage()}</main>

        {/* Footer Status Bar */}
        <Statusbar />
      </div>

      {/* Dynamic Toast Container */}
      <div id="toast-ct">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast"
            style={{ borderLeft: `3px solid ${getToastBorderColor(t.type)}` }}
          >
            <span style={{ fontSize: '15px' }}>{t.icon}</span>
            <span className="toast-msg">{t.msg}</span>
            <span className="toast-x" onClick={() => removeToast(t.id)}>
              ✕
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
