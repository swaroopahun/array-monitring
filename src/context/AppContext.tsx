import React, { createContext, useContext, useState, useEffect } from 'react';
import { ALARMS, TEAM } from '../data/mockData';
import type { Project, Alarm, TeamMember } from '../data/mockData';

export type Theme = 'dark' | 'light';

export interface ToastItem {
  id: number;
  icon: string;
  msg: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface AppContextType {
  theme: Theme;
  toggleTheme: () => void;
  page: string;
  setPage: (page: string) => void;
  currentProj: Project | null;
  setCurrentProj: (proj: Project | null) => void;
  currentUser: TeamMember;
  setCurrentUser: (user: TeamMember) => void;
  canAccess: (page: string) => boolean;
  alarms: Alarm[];
  ackAlarm: (id: number) => void;
  ackAllAlarms: () => void;
  toasts: ToastItem[];
  addToast: (icon: string, msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  removeToast: (id: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  const [page, setPageInternal] = useState<string>('dashboard');
  const [currentProj, setCurrentProjInternal] = useState<Project | null>(null);
  const [currentUser, setCurrentUserInternal] = useState<TeamMember>(() => TEAM[0]);
  const [alarms, setAlarms] = useState<Alarm[]>(() => [...ALARMS]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const rolePermissions: Record<string, string[]> = {
    'Operations Manager': ['dashboard', 'projects', 'fieldview', 'digitaltwin', 'telemetry', 'weather', 'battery', 'devices', 'trackers', 'comhub', 'firmware', 'diagnostics', 'alarms', 'reports', 'team', 'settings'],
    'Field Engineer': ['dashboard', 'projects', 'fieldview', 'digitaltwin', 'telemetry', 'weather', 'battery', 'devices', 'trackers', 'comhub', 'alarms', 'reports', 'team', 'settings'],
    'Analyst': ['dashboard', 'projects', 'fieldview', 'digitaltwin', 'telemetry', 'weather', 'battery', 'devices', 'trackers', 'comhub', 'alarms', 'reports', 'team', 'settings'],
    'Maintenance Tech': ['dashboard', 'projects', 'fieldview', 'digitaltwin', 'weather', 'battery', 'devices', 'trackers', 'comhub', 'firmware', 'diagnostics', 'alarms', 'team', 'settings'],
    'Read Only': ['dashboard', 'projects', 'fieldview', 'digitaltwin', 'telemetry', 'weather', 'devices', 'trackers', 'comhub', 'alarms', 'reports', 'team', 'settings'],
  };

  const canAccess = (pageKey: string) => {
    const allowed = rolePermissions[currentUser.role] || [];
    return allowed.includes(pageKey);
  };

  // Apply theme class to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setPage = (newPage: string) => {
    setPageInternal(newPage);
    if (newPage !== 'projects') {
      setCurrentProjInternal(null);
    }
  };

  const setCurrentProj = (proj: Project | null) => {
    setCurrentProjInternal(proj);
    if (proj) {
      setPageInternal('projects');
    }
  };

  const setCurrentUser = (user: TeamMember) => {
    setCurrentUserInternal(user);
  };

  const ackAlarm = (id: number) => {
    setAlarms((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'acknowledged' } : a))
    );
    const alarm = alarms.find((a) => a.id === id);
    if (alarm) {
      addToast('✅', `Acknowledged: ${alarm.desc}`, 'success');
    }
  };

  const ackAllAlarms = () => {
    setAlarms((prev) => prev.map((a) => ({ ...a, status: 'acknowledged' })));
    addToast('✅', 'All alarms acknowledged', 'success');
  };

  const addToast = (
    icon: string,
    msg: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info'
  ) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, icon, msg, type }]);
    
    // Auto remove after 3.5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 3500);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Welcome message
  useEffect(() => {
    const timer = setTimeout(() => {
      addToast('👋', 'Welcome to Monitoring Portal', 'info');
    }, 900);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        page,
        setPage,
        currentProj,
        setCurrentProj,
        currentUser,
        setCurrentUser,
        canAccess,
        alarms,
        ackAlarm,
        ackAllAlarms,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
