export interface Project {
  id: number;
  name: string;
  loc: string;
  lat: number;
  lng: number;
  mw: number;
  gen: number;
  perf: number;
  devices: number;
  online: number;
  warning: number;
  offline: number;
  status: 'online' | 'warning' | 'offline';
  region: string;
}

export interface Alarm {
  id: number;
  sev: 'critical' | 'warning' | 'info';
  desc: string;
  project: string;
  device: string;
  time: string;
  status: 'active' | 'acknowledged';
}

export interface TeamMember {
  init: string;
  name: string;
  role: string;
  project: string;
  status: 'online' | 'away' | 'offline';
}

export interface Stow {
  name: string;
  sub: string;
  status: 'off' | 'active' | 'inactive';
}

export interface WeatherInfo {
  temp: string;
  irrad: string;
  wind: string;
  hum: string;
  tb: number;
  ib: number;
  wb: number;
  hb: number;
}

export interface Device {
  id: string;
  type: 'TCU' | 'NCU';
  status: 'online' | 'warning' | 'offline';
  angle: number;
  firmware: string;
  lastSeen: string;
  lat: number;
  lng: number;
  voltage: number;
  current: number;
  power: number;
  temp: number;
  serial: string;
  fault: string | null;
  faultTime: string | null;
  ncu: string;
  ncuSerial: string;
}

export interface Battery {
  id: string;
  trackerId: string;
  project: string;
  soc: number;
  soh: number;
  size: '3Ah' | '6Ah';
  status: 'Healthy' | 'Warning' | 'Critical' | 'Offline';
  tempReadings: number[];
}

export const PROJECTS: Project[] = [
  { id: 1, name: 'Cerrado I', loc: 'Goiás', lat: -16.6, lng: -49.3, mw: 120, gen: 18.4, perf: 98.1, devices: 148, online: 146, warning: 2, offline: 0, status: 'online', region: 'Central-West' },
  { id: 2, name: 'Bahia Norte', loc: 'Bahia', lat: -12.0, lng: -41.7, mw: 85, gen: 12.9, perf: 99.3, devices: 104, online: 104, warning: 0, offline: 0, status: 'online', region: 'Northeast' },
  { id: 3, name: 'Nordeste II', loc: 'Pernambuco', lat: -8.4, lng: -36.8, mw: 60, gen: 8.1, perf: 91.2, devices: 72, online: 60, warning: 10, offline: 2, status: 'warning', region: 'Northeast' },
  { id: 4, name: 'Mato Grosso', loc: 'Mato Grosso', lat: -13.0, lng: -55.9, mw: 200, gen: 30.2, perf: 97.8, devices: 248, online: 245, warning: 3, offline: 0, status: 'online', region: 'Central-West' },
  { id: 5, name: 'Triângulo', loc: 'Minas Gerais', lat: -18.5, lng: -47.8, mw: 45, gen: 5.8, perf: 87.4, devices: 56, online: 45, warning: 8, offline: 3, status: 'warning', region: 'Southeast' },
  { id: 6, name: 'Sul I', loc: 'Paraná', lat: -25.4, lng: -51.0, mw: 30, gen: 0, perf: 0, devices: 36, online: 0, warning: 0, offline: 36, status: 'offline', region: 'South' },
  { id: 7, name: 'Piauí', loc: 'Piauí', lat: -7.1, lng: -42.8, mw: 150, gen: 23.1, perf: 96.2, devices: 186, online: 182, warning: 3, offline: 1, status: 'online', region: 'Northeast' },
  { id: 8, name: 'Maranhão I', loc: 'Maranhão', lat: -5.5, lng: -44.3, mw: 90, gen: 13.7, perf: 95.1, devices: 112, online: 110, warning: 2, offline: 0, status: 'online', region: 'Northeast' },
  { id: 9, name: 'Tocantins', loc: 'Tocantins', lat: -10.1, lng: -48.3, mw: 75, gen: 11.2, perf: 93.8, devices: 92, online: 89, warning: 3, offline: 0, status: 'online', region: 'Central-West' },
  { id: 10, name: 'Pará Norte', loc: 'Pará', lat: -3.7, lng: -52.1, mw: 110, gen: 16.5, perf: 94.5, devices: 136, online: 133, warning: 2, offline: 1, status: 'online', region: 'North' },
  { id: 11, name: 'Rio Grande Norte', loc: 'RN', lat: -5.8, lng: -36.5, mw: 65, gen: 9.8, perf: 96.8, devices: 80, online: 79, warning: 1, offline: 0, status: 'online', region: 'Northeast' },
  { id: 12, name: 'Ceará I', loc: 'Ceará', lat: -5.2, lng: -39.3, mw: 80, gen: 12.1, perf: 95.4, devices: 98, online: 95, warning: 3, offline: 0, status: 'online', region: 'Northeast' },
  { id: 13, name: 'Minas Sul', loc: 'Minas Gerais', lat: -20.9, lng: -44.1, mw: 55, gen: 7.2, perf: 88.9, devices: 68, online: 60, warning: 6, offline: 2, status: 'warning', region: 'Southeast' },
  { id: 14, name: 'Sul II', loc: 'Santa Catarina', lat: -27.1, lng: -50.5, mw: 40, gen: 0, perf: 0, devices: 48, online: 0, warning: 0, offline: 48, status: 'offline', region: 'South' },
];

export const ALARMS: Alarm[] = [
  { id: 1, sev: 'critical', desc: 'NCU-042 communication lost', project: 'Nordeste II', device: 'NCU-042', time: '08:14', status: 'active' },
  { id: 2, sev: 'critical', desc: 'Tracker stow failed — wind event', project: 'Sul I', device: 'NCU-003', time: '07:52', status: 'active' },
  { id: 3, sev: 'warning', desc: 'Voltage deviation >5% detected', project: 'Triângulo', device: 'TCU-018', time: '06:30', status: 'active' },
  { id: 4, sev: 'warning', desc: 'Temperature sensor offline', project: 'Minas Sul', device: 'RSU-02', time: '05:45', status: 'active' },
  { id: 5, sev: 'info', desc: 'Firmware update available (v4.2.1)', project: 'Cerrado I', device: '3 devices', time: '05:00', status: 'active' },
  { id: 6, sev: 'critical', desc: 'NCU-017 angle tracking error', project: 'Nordeste II', device: 'NCU-017', time: '04:30', status: 'active' },
  { id: 7, sev: 'warning', desc: 'Wind speed approaching stow limit', project: 'Sul I', device: 'RSU-01', time: '03:15', status: 'active' },
  { id: 8, sev: 'info', desc: 'Daily calibration complete', project: 'Bahia Norte', device: 'All NCUs', time: '01:00', status: 'acknowledged' },
  { id: 9, sev: 'warning', desc: 'Performance ratio below target', project: 'Triângulo', device: 'Device-B', time: 'Yesterday', status: 'acknowledged' },
];

export const TEAM: TeamMember[] = [
  { init: 'OP', name: 'Operator', role: 'Operations Manager', project: 'All Projects', status: 'online' },
  { init: 'MS', name: 'Maria Santos', role: 'Field Engineer', project: 'Cerrado I', status: 'online' },
  { init: 'CF', name: 'Carlos Ferreira', role: 'Analyst', project: 'Bahia Norte', status: 'online' },
  { init: 'LA', name: 'Luciana Alves', role: 'Field Engineer', project: 'Nordeste II', status: 'away' },
  { init: 'RP', name: 'Rafael Pereira', role: 'Maintenance Tech', project: 'Sul I', status: 'offline' },
  { init: 'BG', name: 'Beatriz Gomes', role: 'Read Only', project: 'All Projects', status: 'online' },
];

export const STOWS: Stow[] = [
  { name: 'Hail Stow', sub: '(auto)', status: 'off' },
  { name: 'Hurricane / Typhoon Stow', sub: '(auto)', status: 'off' },
  { name: 'Wind Stow', sub: '(auto)', status: 'active' },
  { name: 'Flood Stow', sub: '(auto)', status: 'inactive' },
];

export const WEATHER_DATA: Record<string, WeatherInfo> = {
  'Cerrado I': { temp: '38°', irrad: '824', wind: '14', hum: '62', tb: 76, ib: 82, wb: 28, hb: 62 },
  'Bahia Norte': { temp: '35°', irrad: '910', wind: '18', hum: '55', tb: 70, ib: 91, wb: 36, hb: 55 },
  'Mato Grosso': { temp: '41°', irrad: '756', wind: '9', hum: '72', tb: 82, ib: 75, wb: 18, hb: 72 },
  'Nordeste II': { temp: '33°', irrad: '950', wind: '22', hum: '48', tb: 66, ib: 95, wb: 44, hb: 48 },
};

// Device list generator helper function
export function genDevices(proj: Project): Device[] {
  const statuses: Array<'online' | 'warning' | 'offline'> = ['online', 'online', 'online', 'online', 'online', 'online', 'warning', 'offline'];
  const faults = ['Tracker Stall', 'Battery Over Voltage', 'Low Battery', 'Angle Error', 'Comm Lost'];
  const count = Math.min(proj.devices, 30);
  
  return Array.from({ length: count }, (_, i) => {
    let s: 'online' | 'warning' | 'offline' = 'online';
    if (proj.status === 'offline') {
      s = 'offline';
    } else if (proj.status === 'warning' && i < Math.ceil(count * 0.18)) {
      s = i % 4 === 0 ? 'offline' : 'warning';
    } else {
      s = statuses[Math.floor(Math.random() * statuses.length)];
    }
    
    const type = i % 3 === 0 ? 'TCU' : 'NCU';
    const ang = s === 'offline' ? 0 : Math.round(Math.random() * 60 - 30);
    const fault = s === 'offline' || s === 'warning' ? faults[Math.floor(Math.random() * faults.length)] : null;
    
    return {
      id: `${type}-${String(i + 1).padStart(3, '0')}`,
      type,
      status: s,
      angle: ang,
      firmware: `4.1.${Math.floor(Math.random() * 5)}`,
      lastSeen: s === 'offline' ? '2h ago' : s === 'warning' ? '5m ago' : 'just now',
      lat: proj.lat + (Math.random() * 0.06 - 0.03),
      lng: proj.lng + (Math.random() * 0.06 - 0.03),
      voltage: s === 'offline' ? 0 : Math.round(680 + Math.random() * 20),
      current: s === 'offline' ? 0 : Math.round(200 + Math.random() * 15),
      power: s === 'offline' ? 0 : Math.round(130 + Math.random() * 30),
      temp: s === 'offline' ? 0 : Math.round(38 + Math.random() * 8),
      serial: `SPC${String(20162700300 + i)}`,
      fault,
      faultTime: fault ? Math.floor(Math.random() * 60) + ' minutes ago' : null,
      ncu: `NCU ${Math.floor(i / 3) + 1}`,
      ncuSerial: `NCUAE20161600${300 + Math.floor(i / 3)}`
    };
  });
}

// Generate the 200 battery pack telemetry entries
export const BATTERY_DATA: Battery[] = (() => {
  return Array.from({ length: 200 }, (_, i) => {
    const proj = PROJECTS[i % PROJECTS.length];
    const soc = Math.round(5 + Math.random() * 90);
    const size = (i % 7 === 0) ? '6Ah' : '3Ah';
    
    let status: 'Healthy' | 'Warning' | 'Critical' | 'Offline';
    if (soc >= 60) {
      status = 'Healthy';
    } else if (soc >= 30) {
      status = 'Warning';
    } else if (soc >= 10) {
      status = 'Critical';
    } else {
      status = 'Offline';
    }
    
    if (i % 13 === 0) {
      status = 'Offline';
    }
    
    const trackerNum = String(Math.floor(i / 2) + 1).padStart(3, '0');
    return {
      id: `B-${String(i + 1).padStart(3, '0')}`,
      trackerId: `T-${trackerNum}`,
      project: proj.name,
      soc: status === 'Offline' ? 0 : soc,
      soh: status === 'Offline' ? 0 : Math.round(75 + Math.random() * 24),
      size,
      status,
      tempReadings: Array.from({ length: 168 }, () => 15 + Math.random() * 25),
    };
  });
})();
