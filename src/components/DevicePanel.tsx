import React from 'react';
import { Device } from '../data/mockData';

interface DevicePanelProps {
  isOpen: boolean;
  device: Device | null;
  onClose: () => void;
  onCommand: (cmd: string, target: string) => void;
}

const DevicePanel: React.FC<DevicePanelProps> = ({
  isOpen,
  device,
  onClose,
  onCommand,
}) => {
  if (!device) return null;

  const sbadge = (s: string) => {
    const m: Record<string, string> = {
      online: 'b-online',
      warning: 'b-warning',
      offline: 'b-offline',
    };
    return (
      <span className={`badge ${m[s] || 'b-info'}`}>
        <span className="bdot"></span>
        {s}
      </span>
    );
  };

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={onClose}
          style={{ zIndex: 290 }}
        />
      )}
      <div className={`slide-panel ${isOpen ? 'open' : ''}`} style={{ zIndex: 990 }}>
        <div className="panel-hdr">
          <div>
            <div style={{ fontFamily: 'var(--fh)', fontSize: '16px' }}>
              {device.id}
            </div>
            <div style={{ marginTop: '4px' }}>{sbadge(device.status)}</div>
          </div>
          <button className="panel-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="panel-body">
          <div style={{ marginBottom: '14px' }}>
            <div
              style={{
                fontFamily: 'var(--fs)',
                fontSize: '10px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: 'var(--ts)',
                marginBottom: '8px',
              }}
            >
              LIVE TELEMETRY
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div className="metric-card">
                <div className="metric-lbl">Power</div>
                <div className="metric-val">
                  {device.power}
                  <span className="metric-unit"> W</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-lbl">Voltage</div>
                <div className="metric-val">
                  {device.voltage}
                  <span className="metric-unit"> V</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-lbl">Current</div>
                <div className="metric-val">
                  {device.current}
                  <span className="metric-unit"> A</span>
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-lbl">Temperature</div>
                <div className="metric-val">
                  {device.temp}
                  <span className="metric-unit"> °C</span>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              background: 'var(--bi)',
              border: '1px solid var(--bd)',
              borderRadius: 'var(--r)',
              padding: '14px',
              textAlign: 'center',
              marginBottom: '14px',
            }}
          >
            <div
              style={{
                fontFamily: 'var(--fs)',
                fontSize: '10px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: 'var(--ts)',
                marginBottom: '6px',
              }}
            >
              TRACKER ANGLE
            </div>
            <div style={{ fontFamily: 'var(--fh)', fontSize: '44px', color: 'var(--gold)', lineHeight: 1 }}>
              {device.angle}°
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ts)', fontFamily: 'var(--fs)', marginTop: '4px' }}>
              {device.angle < 0
                ? 'East tilt'
                : device.angle > 0
                ? 'West tilt'
                : 'Flat — Stowed'}
            </div>
            {device.fault && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '6px 10px',
                  background: 'rgba(255,116,36,.1)',
                  border: '1px solid var(--orange)',
                  borderRadius: '6px',
                  fontFamily: 'var(--fs)',
                  fontSize: '11px',
                  color: 'var(--orange)',
                }}
              >
                ⚠ {device.fault} · {device.faultTime}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <div
              style={{
                fontFamily: 'var(--fs)',
                fontSize: '10px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: 'var(--ts)',
                marginBottom: '8px',
              }}
            >
              DEVICE INFO
            </div>
            <div className="set-row" style={{ padding: '7px 0' }}>
              <div className="set-lbl fs11">Firmware</div>
              <div className="td-mono">v{device.firmware}</div>
            </div>
            <div className="set-row" style={{ padding: '7px 0' }}>
              <div className="set-lbl fs11">Last Seen</div>
              <div className="td-mono">{device.lastSeen}</div>
            </div>
            <div className="set-row" style={{ padding: '7px 0' }}>
              <div className="set-lbl fs11">Serial</div>
              <div className="td-mono">{device.serial}</div>
            </div>
            <div className="set-row" style={{ padding: '7px 0' }}>
              <div className="set-lbl fs11">NCU</div>
              <div className="fw5">{device.ncu}</div>
            </div>
            <div className="set-row" style={{ padding: '7px 0' }}>
              <div className="set-lbl fs11">Location</div>
              <div className="td-mono">
                {device.lat.toFixed(4)}, {device.lng.toFixed(4)}
              </div>
            </div>
          </div>

          <div>
            <div
              style={{
                fontFamily: 'var(--fs)',
                fontSize: '10px',
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                color: 'var(--ts)',
                marginBottom: '8px',
              }}
            >
              RECENT COMMANDS
            </div>
            {['Resume Tracking', 'Calibration Check', 'Angle Reset'].map((c, i) => (
              <div
                key={c}
                style={{
                  display: 'flex',
                  gap: '10px',
                  padding: '8px 0',
                  borderBottom: '1px solid var(--bd)',
                }}
              >
                <div style={{ fontFamily: 'var(--fs)', fontSize: '10px', color: 'var(--tm)', flexShrink: 0 }}>
                  {['08:00', '06:30', '05:00'][i]}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--ts)' }}>{c}</div>
                <div style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--green-l)' }}>✓</div>
              </div>
            ))}
          </div>
        </div>
        <div className="panel-footer">
          <button
            className="btn btn-sec btn-sm f1"
            onClick={() => onCommand('Reboot', device.id)}
          >
            ⟳ Reboot
          </button>
          <button
            className="btn btn-danger btn-sm f1"
            onClick={() => onCommand('Emergency Stow', device.id)}
          >
            ⬇ Stow
          </button>
          <button
            className="btn btn-sky btn-sm f1"
            onClick={() => {
              const val = prompt('Enter target override angle (degrees, -45 to 45):');
              if (val !== null && !isNaN(parseFloat(val))) {
                onCommand(`Angle Override (${parseFloat(val)}°)`, device.id);
              }
            }}
          >
            ⟲ Override
          </button>
        </div>
      </div>
    </>
  );
};

export default DevicePanel;
