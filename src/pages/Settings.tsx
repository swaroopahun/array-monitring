import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import ConfirmModal from '../components/ConfirmModal';

const Settings: React.FC = () => {
  const { theme, toggleTheme, addToast } = useApp();
  const [profileName, setProfileName] = useState('Operator');
  const [profileEmail, setProfileEmail] = useState('operator@portal.com');
  const [timezone, setTimezone] = useState('BRT (UTC-3) — Brasília');
  const [language, setLanguage] = useState('English');
  const [units, setUnits] = useState('MW / GWh');
  const [mapStyle, setMapStyle] = useState('OpenStreetMap');

  // Regenerate modal confirmation
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleCopyKey = () => {
    navigator.clipboard?.writeText('sk_prod_live_key_here_monitoring_portal_2026').then(() => {
      addToast('📋', 'API Key copied to clipboard', 'success');
    });
  };

  const handleRegenerateKey = () => {
    setConfirmOpen(false);
    addToast('🔑', 'New API Key generated successfully', 'success');
  };

  return (
    <div className="page active" id="page-settings">
      <div className="sec-title">Settings</div>

      <div className="g2" style={{ gap: '18px' }}>
        <div>
          {/* Profile Details */}
          <div className="card" style={{ marginBottom: '14px' }}>
            <div className="card-hdr">
              <div className="card-title">Profile Parameters</div>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  className="form-input"
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Timezone</label>
                <select
                  className="form-input"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                >
                  <option>BRT (UTC-3) — Brasília</option>
                  <option>BRT (UTC-4) — Amazônia</option>
                  <option>UTC</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Language</label>
                <select
                  className="form-input"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option>English</option>
                  <option>Português (BR)</option>
                  <option>Español</option>
                </select>
              </div>
              <button className="btn btn-pri" onClick={() => addToast('✅', 'Profile updated successfully', 'success')}>
                Save Changes
              </button>
            </div>
          </div>

          {/* API Access Details */}
          <div className="card">
            <div className="card-hdr">
              <div className="card-title">API Access Controls</div>
            </div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label">API Key</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    className="form-input"
                    value="sk_prod_●●●●●●●●●●●●●●"
                    readOnly
                    style={{ fontFamily: 'var(--fs)', fontSize: '12px' }}
                  />
                  <button className="btn btn-sec btn-sm" onClick={handleCopyKey}>
                    Copy
                  </button>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button className="btn btn-sky btn-sm" onClick={() => addToast('📄', 'Opening API developer documents...', 'info')}>
                  API Docs
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => setConfirmOpen(true)}>
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          {/* Notifications Toggles */}
          <div className="card" style={{ marginBottom: '14px' }}>
            <div className="card-hdr">
              <div className="card-title">Notifications Dispatches</div>
            </div>
            <div className="card-body">
              <div className="set-row">
                <div>
                  <div className="set-lbl">Critical Alarms</div>
                  <div className="set-desc">Email + SMS for critical hardware stalls</div>
                </div>
                <label className="pill-toggle">
                  <input type="checkbox" defaultChecked />
                  <div className="pill-track"></div>
                  <div className="pill-thumb"></div>
                </label>
              </div>
              <div className="set-row">
                <div>
                  <div className="set-lbl">Warning Alerts</div>
                  <div className="set-desc">Email triggers for telemetry deviations</div>
                </div>
                <label className="pill-toggle">
                  <input type="checkbox" defaultChecked />
                  <div className="pill-track"></div>
                  <div className="pill-thumb"></div>
                </label>
              </div>
              <div className="set-row">
                <div>
                  <div className="set-lbl">Daily Reports</div>
                  <div className="set-desc">Automated DAS PDF summaries in morning</div>
                </div>
                <label className="pill-toggle">
                  <input type="checkbox" />
                  <div className="pill-track"></div>
                  <div className="pill-thumb"></div>
                </label>
              </div>
              <div className="set-row">
                <div>
                  <div className="set-lbl">Wind Threshold Warnings</div>
                  <div className="set-desc">Notify operations when stowed by wind</div>
                </div>
                <label className="pill-toggle">
                  <input type="checkbox" defaultChecked />
                  <div className="pill-track"></div>
                  <div className="pill-thumb"></div>
                </label>
              </div>
              <div className="set-row">
                <div>
                  <div className="set-lbl">Mobile App Push</div>
                  <div className="set-desc">Sync alerts to iOS / Android device</div>
                </div>
                <label className="pill-toggle">
                  <input type="checkbox" defaultChecked />
                  <div className="pill-track"></div>
                  <div className="pill-thumb"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Theme & Display Toggles */}
          <div className="card">
            <div className="card-hdr">
              <div className="card-title">Display Settings</div>
            </div>
            <div className="card-body">
              <div className="set-row">
                <div>
                  <div className="set-lbl">Dark Mode Toggles</div>
                  <div className="set-desc">Switch dark/light theme variables</div>
                </div>
                <label className="pill-toggle">
                  <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} />
                  <div className="pill-track"></div>
                  <div className="pill-thumb"></div>
                </label>
              </div>
              <div className="set-row">
                <div>
                  <div className="set-lbl">Measurement Units</div>
                </div>
                <select
                  className="fsel"
                  value={units}
                  onChange={(e) => setUnits(e.target.value)}
                >
                  <option>MW / GWh</option>
                  <option>kW / MWh</option>
                </select>
              </div>
              <div className="set-row">
                <div>
                  <div className="set-lbl">Map Layout Theme</div>
                </div>
                <select
                  className="fsel"
                  value={mapStyle}
                  onChange={(e) => setMapStyle(e.target.value)}
                >
                  <option>OpenStreetMap</option>
                  <option>Satellite</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Confirm API Key Regeneration"
        body="Are you sure you want to regenerate your API access key? Any active scripts using the old key will fail immediately."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleRegenerateKey}
      />
    </div>
  );
};

export default Settings;
