import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { genDevices, Device, STOWS, Stow } from '../data/mockData';
import MapWidget from '../components/MapWidget';
import SolarViz from '../components/SolarViz';
import DevicePanel from '../components/DevicePanel';
import ConfirmModal from '../components/ConfirmModal';

const ProjectDetail: React.FC = () => {
  const { currentProj, setCurrentProj, alarms, ackAlarm, addToast } = useApp();

  if (!currentProj) return null;

  const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'pfield' | 'palarms' | 'preports'>('overview');
  
  // Generate project-specific devices once when project changes
  const [devices, setDevices] = useState<Device[]>([]);
  useEffect(() => {
    setDevices(genDevices(currentProj));
  }, [currentProj]);

  // Autotracking state
  const [isAuto, setIsAuto] = useState(true);
  const [manualAngle, setManualAngle] = useState(-28.4);
  const [currentDialAngle, setCurrentDialAngle] = useState(-28.4);

  // Safety Stows state
  const [stowsList, setStowsList] = useState<Stow[]>(() => [...STOWS]);

  // Drawer slider state
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; body: string; onConfirm: () => void } | null>(null);

  // Filters for Devices Tab
  const [devSearch, setDevSearch] = useState('');
  const [devType, setDevType] = useState('');
  const [devStatus, setDevStatus] = useState('');
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);

  // Derived statistics
  const activeAlarms = alarms.filter((a) => a.project === currentProj.name && a.status === 'active');
  const trackersOk = Math.round(currentProj.online * 0.974);
  const battFailing = Math.max(0, activeAlarms.filter(a => a.desc.toLowerCase().includes('battery') || a.sev === 'warning').length);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      online: 'b-online',
      warning: 'b-warning',
      offline: 'b-offline',
    };
    return (
      <span className={`badge ${badges[status] || 'b-info'}`}>
        <span className="bdot"></span>
        {status}
      </span>
    );
  };

  const handleCommandTrigger = (cmd: string, target: string) => {
    setConfirmModal({
      isOpen: true,
      title: `Confirm: ${cmd}`,
      body: `Are you sure you want to execute "${cmd}" on ${target}? This action will be logged in the terminal system.`,
      onConfirm: () => {
        addToast('⚡', `${cmd} command sent to ${target}`, 'success');
        setConfirmModal(null);
      },
    });
  };

  // Toggle safety stow checkbox
  const handleStowToggle = (index: number, val: boolean) => {
    setStowsList((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, status: val ? 'active' : 'off' } : s))
    );
    addToast(val ? '⚠️' : '✅', `${stowsList[index].name} ${val ? 'Activated' : 'Deactivated'}`, val ? 'warning' : 'success');
  };

  // Filter devices list
  const filteredDevices = devices.filter((d) => {
    const matchesSearch = d.id.toLowerCase().includes(devSearch.toLowerCase()) || d.serial.toLowerCase().includes(devSearch.toLowerCase());
    const matchesType = devType === '' || d.type === devType;
    const matchesStatus = devStatus === '' || d.status === devStatus;
    const matchesAlerts = !showAlertsOnly || d.status !== 'online';

    return matchesSearch && matchesType && matchesStatus && matchesAlerts;
  });

  const handleDeviceClick = (d: Device) => {
    setSelectedDevice(d);
    setIsDrawerOpen(true);
  };

  return (
    <div className="page active" id="page-projects">
      {/* Title block */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
        <button className="btn btn-sec btn-sm" onClick={() => setCurrentProj(null)}>
          ← Back
        </button>
        <div>
          <div className="sec-title" style={{ marginBottom: 0 }}>
            {currentProj.name}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--ts)', fontFamily: 'var(--fs)' }}>
            {currentProj.loc} · {currentProj.mw} MW Capacity
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>{getStatusBadge(currentProj.status)}</div>
      </div>

      {/* Tabs Menu */}
      <div className="tabs" id="pd-tabs">
        <div
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </div>
        <div
          className={`tab ${activeTab === 'devices' ? 'active' : ''}`}
          onClick={() => setActiveTab('devices')}
        >
          Devices
        </div>
        <div
          className={`tab ${activeTab === 'pfield' ? 'active' : ''}`}
          onClick={() => setActiveTab('pfield')}
        >
          Field View
        </div>
        <div
          className={`tab ${activeTab === 'palarms' ? 'active' : ''}`}
          onClick={() => setActiveTab('palarms')}
        >
          Alarms ({activeAlarms.length})
        </div>
        <div
          className={`tab ${activeTab === 'preports' ? 'active' : ''}`}
          onClick={() => setActiveTab('preports')}
        >
          Reports
        </div>
      </div>

      {/* OVERVIEW PANEL */}
      {activeTab === 'overview' && (
        <div className="tab-panel active">
          {/* Specific KPIs */}
          <div className="g4" style={{ marginBottom: '14px' }}>
            <div className="kpi kpi-green">
              <div className="kpi-lbl">Devices Communicating</div>
              <div className="kpi-val">
                {currentProj.online}
                <span className="kpi-unit">/{currentProj.devices}</span>
              </div>
              <div className={`kpi-delta ${currentProj.offline > 0 ? 'dn' : 'up'}`}>
                {currentProj.offline > 0 ? `▼ ${currentProj.offline} offline` : '▲ All nominal'}
              </div>
            </div>
            <div className="kpi kpi-sky">
              <div className="kpi-lbl">Trackers On Setpoint</div>
              <div className="kpi-val">
                {trackersOk}
                <span className="kpi-unit">/{currentProj.online}</span>
              </div>
              <div className="kpi-delta up">
                ▲ {currentProj.online > 0 ? ((trackersOk / currentProj.online) * 100).toFixed(1) : 0}% on setpoint
              </div>
            </div>
            <div className="kpi kpi-orange">
              <div className="kpi-lbl">Active Alarms</div>
              <div className="kpi-val">
                {activeAlarms.length}
                <span className="kpi-unit"> active</span>
              </div>
            </div>
            <div className="kpi kpi-pur">
              <div className="kpi-lbl">Failing Batteries</div>
              <div className="kpi-val">
                {battFailing}
                <span className="kpi-unit"> units</span>
              </div>
              <div className={`kpi-delta ${battFailing > 0 ? 'dn' : 'up'}`}>
                {battFailing > 0 ? '▼ Low SoC / Needs review' : '▲ Batteries nominal'}
              </div>
            </div>
          </div>

          <div className="g21">
            <div className="flex-col gap14">
              {/* Project Map */}
              <div className="card">
                <div className="card-hdr">
                  <div className="card-title">Project Coordinates & Devices Map</div>
                </div>
                <MapWidget
                  center={[currentProj.lat, currentProj.lng]}
                  zoom={10}
                  markers={devices.map((d) => ({
                    id: d.id,
                    lat: d.lat,
                    lng: d.lng,
                    name: d.id,
                    info: `${d.type} · ${d.status} · ${d.angle}°`,
                    status: d.status,
                  }))}
                  onMarkerClick={(id) => {
                    const dev = devices.find((d) => d.id === id);
                    if (dev) handleDeviceClick(dev);
                  }}
                  height="280px"
                />
              </div>

              {/* Solar tracker panel */}
              <div className="card">
                <div className="card-hdr">
                  <div className="card-title">Sun Tracker Dial & Angles</div>
                  <div className="toggle-wrap">
                    <div
                      className={`toggle-opt ${isAuto ? 'active' : ''}`}
                      onClick={() => {
                        setIsAuto(true);
                        addToast('⚡', 'Autotracking controls active', 'success');
                      }}
                    >
                      ⚡ Autotracking
                    </div>
                    <div
                      className={`toggle-opt ${!isAuto ? 'active' : ''}`}
                      onClick={() => {
                        setIsAuto(false);
                        addToast('⚠️', 'Manual controls active — set panel angle overrides', 'warning');
                      }}
                    >
                      Manual
                    </div>
                  </div>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                  <div className="g2" style={{ gap: 0, alignItems: 'stretch' }}>
                    <SolarViz
                      isAuto={isAuto}
                      manualAngle={manualAngle}
                      onAngleUpdate={setCurrentDialAngle}
                    />

                    {/* Controls adjustments list */}
                    <div style={{ padding: '16px 18px' }}>
                      <div
                        style={{
                          fontFamily: 'var(--fs)',
                          fontSize: '10px',
                          letterSpacing: '1.5px',
                          textTransform: 'uppercase',
                          color: 'var(--ts)',
                          marginBottom: '10px',
                        }}
                      >
                        SAFETY STOW CONSOLES
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {stowsList.map((stow, idx) => (
                          <div key={stow.name} className="stow-row">
                            <div>
                              <div className="stow-name">
                                {stow.name}{' '}
                                <span style={{ fontSize: '10px', color: 'var(--tm)' }}>
                                  {stow.sub}
                                </span>
                              </div>
                            </div>
                            <div>
                              {stow.status === 'active' ? (
                                <span className="stow-badge stow-active">Active</span>
                              ) : stow.status === 'inactive' ? (
                                <span className="stow-badge stow-inactive">Inactive</span>
                              ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <label className="pill-toggle">
                                    <input
                                      type="checkbox"
                                      onChange={(e) => handleStowToggle(idx, e.target.checked)}
                                    />
                                    <div className="pill-track"></div>
                                    <div className="pill-thumb"></div>
                                  </label>
                                  <span style={{ fontSize: '11px', color: 'var(--tm)', fontFamily: 'var(--fs)' }}>
                                    Off
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: '14px' }}>
                        <div
                          style={{
                            fontFamily: 'var(--fs)',
                            fontSize: '10px',
                            letterSpacing: '1.5px',
                            textTransform: 'uppercase',
                            color: 'var(--ts)',
                            marginBottom: '10px',
                          }}
                        >
                          MAINTENANCE TRIGGERS
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyBetween: 'space-between', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: 'var(--fs)', fontSize: '12px' }}>Snow Shed</span>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button
                                className="btn btn-sec btn-xs"
                                onClick={() => handleCommandTrigger('Snow Shed', 'All NCUs')}
                              >
                                Start
                              </button>
                              <button
                                className="btn btn-sec btn-xs"
                                onClick={() => addToast('📅', 'Snow shed scheduler initialized', 'info')}
                              >
                                Schedule
                              </button>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: 'var(--fs)', fontSize: '12px' }}>Mowing mode</span>
                            <button
                              className="btn btn-sec btn-xs"
                              onClick={() => addToast('🌿', 'Select NCU node for vegetation mowing', 'info')}
                            >
                              Select NCU
                            </button>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontFamily: 'var(--fs)', fontSize: '12px' }}>Cleaning mode</span>
                            <button
                              className="btn btn-sec btn-xs"
                              onClick={() => addToast('🧹', 'Select panel row for robotic water clean', 'info')}
                            >
                              Select NCU
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side parameters details */}
            <div className="flex-col gap12">
              <div className="card">
                <div className="card-hdr">
                  <div className="card-title">Project parameters</div>
                </div>
                <div className="card-body">
                  <div className="set-row">
                    <div className="set-lbl">Capacity</div>
                    <div className="fw5">{currentProj.mw} MW</div>
                  </div>
                  <div className="set-row">
                    <div className="set-lbl">Region</div>
                    <div className="fw5">{currentProj.region}</div>
                  </div>
                  <div className="set-row">
                    <div className="set-lbl">Total Devices</div>
                    <div className="fw5">{currentProj.devices} units</div>
                  </div>
                  <div className="set-row">
                    <div className="set-lbl">Coordinates</div>
                    <div className="td-mono">
                      {currentProj.lat.toFixed(4)}, {currentProj.lng.toFixed(4)}
                    </div>
                  </div>
                  <div className="set-row">
                    <div className="set-lbl">Firmware version</div>
                    <div className="td-mono">v4.1.3 (latest)</div>
                  </div>
                </div>
              </div>

              {/* Devices operational list details */}
              <div className="card">
                <div className="card-hdr">
                  <div className="card-title">Hardware Connectivity</div>
                </div>
                <div className="card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="td-mono">Communicating</span>
                      <span className="td-bold" style={{ color: 'var(--green-l)' }}>
                        {currentProj.online}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="td-mono">Warnings / Errors</span>
                      <span className="td-bold" style={{ color: 'var(--gold)' }}>
                        {currentProj.warning}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="td-mono">Lost Connection</span>
                      <span className="td-bold" style={{ color: 'var(--orange)' }}>
                        {currentProj.offline}
                      </span>
                    </div>
                    <div className="divider" style={{ margin: '6px 0' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span className="fw5">Availability score</span>
                      <span className="fw5" style={{ color: 'var(--green-l)' }}>
                        {((currentProj.online / currentProj.devices) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DEVICES TABLE PANEL */}
      {activeTab === 'devices' && (
        <div className="tab-panel active">
          {/* Filters */}
          <div className="filter-bar">
            <div className="fi" style={{ maxWidth: '240px' }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="6.5" cy="6.5" r="4.5" />
                <line x1="10" y1="10" x2="14" y2="14" />
              </svg>
              <input
                value={devSearch}
                onChange={(e) => setDevSearch(e.target.value)}
                placeholder="Search device ID or Serial…"
              />
            </div>
            <select
              className="fsel"
              value={devType}
              onChange={(e) => setDevType(e.target.value)}
            >
              <option value="">All Types</option>
              <option value="NCU">NCU (Network Control)</option>
              <option value="TCU">TCU (Tracker Control)</option>
            </select>
            <select
              className="fsel"
              value={devStatus}
              onChange={(e) => setDevStatus(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="online">Online</option>
              <option value="warning">Warning</option>
              <option value="offline">Offline</option>
            </select>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--fs)' }}>
              <input
                type="checkbox"
                checked={showAlertsOnly}
                onChange={(e) => setShowAlertsOnly(e.target.checked)}
              />
              Show Alerts Only
            </label>
          </div>

          {/* List */}
          <div className="card">
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Device ID</th>
                    <th>Type</th>
                    <th>Serial Number</th>
                    <th>Last Seen</th>
                    <th>Tracker Angle</th>
                    <th>Parent NCU</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDevices.map((d) => (
                    <tr key={d.id} onClick={() => handleDeviceClick(d)}>
                      <td className="td-bold" style={{ color: 'var(--sky)' }}>
                        {d.id}
                      </td>
                      <td className="td-mono">{d.type}</td>
                      <td className="td-mono">{d.serial}</td>
                      <td className="td-mono">{d.lastSeen}</td>
                      <td className="td-gold" style={{ fontFamily: 'var(--fh)' }}>
                        {d.angle}°
                      </td>
                      <td className="td-mono">{d.ncu}</td>
                      <td>
                        {getStatusBadge(d.status)}{' '}
                        {d.fault && <span style={{ color: 'var(--orange)', marginLeft: '6px' }} title={d.fault}>⚠</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* NCU FIELD VIEW PANEL */}
      {activeTab === 'pfield' && (
        <div className="tab-panel active">
          <div className="card">
            <div className="card-hdr">
              <div className="card-title">Solar NCU Grid Topology Overview</div>
            </div>
            {/* Renders a nice nested interactive grid of NCU cards */}
            <div className="card-body">
              <div className="g3">
                {Array.from({ length: 6 }).map((_, idx) => {
                  const ncuNum = idx + 1;
                  const ncuDevices = devices.filter((d) => d.ncu === `NCU ${ncuNum}`);
                  const onlineCount = ncuDevices.filter((d) => d.status === 'online').length;
                  const warningCount = ncuDevices.filter((d) => d.status === 'warning').length;
                  const offlineCount = ncuDevices.filter((d) => d.status === 'offline').length;
                  
                  let gridCol = 'var(--green-l)';
                  if (offlineCount > 0) gridCol = 'var(--orange)';
                  else if (warningCount > 0) gridCol = 'var(--gold)';

                  return (
                    <div
                      key={ncuNum}
                      className="card"
                      style={{ borderLeft: `4px solid ${gridCol}`, padding: '12px' }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontFamily: 'var(--fs)',
                          marginBottom: '8px',
                        }}
                      >
                        <span className="td-bold">NCU-00{ncuNum} Block</span>
                        <span style={{ color: gridCol, fontWeight: 600 }}>
                          {onlineCount}/{ncuDevices.length} Ok
                        </span>
                      </div>
                      {/* Sub-grid block representation */}
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(5, 1fr)',
                          gap: '6px',
                          background: 'var(--bi)',
                          padding: '10px',
                          borderRadius: 'var(--r)',
                        }}
                      >
                        {ncuDevices.map((d) => {
                          const stateCol =
                            d.status === 'online'
                              ? 'var(--green-l)'
                              : d.status === 'warning'
                              ? 'var(--gold)'
                              : 'var(--orange)';
                          return (
                            <div
                              key={d.id}
                              style={{
                                width: '100%',
                                paddingBottom: '100%',
                                height: 0,
                                background: stateCol,
                                borderRadius: '3px',
                                opacity: 0.85,
                                cursor: 'pointer',
                              }}
                              title={`${d.id} : ${d.status} (${d.angle}°)`}
                              onClick={() => handleDeviceClick(d)}
                            />
                          );
                        })}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '11px',
                          color: 'var(--ts)',
                          marginTop: '8px',
                          fontFamily: 'var(--fs)',
                        }}
                      >
                        <span>Serial: NCUAE20161600{300 + idx}</span>
                        <span
                          className="card-act"
                          onClick={() => handleCommandTrigger('Calibration check', `NCU ${ncuNum}`)}
                        >
                          Calibrate
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ALARMS PANEL */}
      {activeTab === 'palarms' && (
        <div className="tab-panel active">
          <div className="card">
            <div className="card-hdr">
              <div className="card-title">Active project alarms log</div>
            </div>
            <div id="proj-alarm-list">
              {activeAlarms.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">✅</div>
                  <div className="empty-txt">No alarms for this project</div>
                </div>
              ) : (
                activeAlarms.map((a) => (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '11px 14px',
                      borderBottom: '1px solid var(--bd)',
                      borderLeft: `3px solid ${
                        a.sev === 'critical'
                          ? 'var(--orange)'
                          : a.sev === 'warning'
                          ? 'var(--gold)'
                          : 'var(--sky)'
                      }`,
                    }}
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
                      <div style={{ fontFamily: 'var(--fs)', fontSize: '12px' }}>{a.desc}</div>
                      <div style={{ fontSize: '10px', color: 'var(--ts)', marginTop: '2px' }}>
                        {a.device} · {a.time}
                      </div>
                    </div>
                    <button className="btn btn-sec btn-sm" onClick={() => ackAlarm(a.id)}>
                      Ack
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* REPORTS PANEL */}
      {activeTab === 'preports' && (
        <div className="tab-panel active">
          <div className="g2">
            <div className="card">
              <div className="card-hdr">
                <div className="card-title">Recent Downloadable Reports</div>
              </div>
              <div className="card-body" style={{ padding: 0 }}>
                {[
                  { name: 'DAS Full Report — April 2026', type: 'DAS', date: 'Apr 28' },
                  { name: 'Performance Summary — Cerrado I', type: 'Perf', date: 'Apr 27' },
                  { name: 'Alarm History — Q1 2026', type: 'Alarm', date: 'Apr 1' },
                ].map((r) => (
                  <div
                    key={r.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '11px 14px',
                      borderBottom: '1px solid var(--bd)',
                      cursor: 'pointer',
                    }}
                    onClick={() => addToast('📄', `Opening ${r.name}`, 'info')}
                  >
                    <span className="badge b-info" style={{ fontSize: '9px', padding: '2px 6px' }}>
                      {r.type}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--fs)', fontSize: '12px' }}>{r.name}</div>
                      <div style={{ fontSize: '10px', color: 'var(--ts)', marginTop: '2px' }}>
                        {currentProj.name} · {r.date}
                      </div>
                    </div>
                    <button
                      className="btn btn-sec btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        addToast('⬇️', 'Downloading report...', 'info');
                      }}
                    >
                      ⬇
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-hdr">
                <div className="card-title">Generate custom analytics report</div>
              </div>
              <div className="card-body">
                <div className="form-group">
                  <label className="form-label">Report type</label>
                  <select className="form-input">
                    <option>DAS Generation Report</option>
                    <option>Availability Log</option>
                    <option>Hardware Failure log</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Granularity</label>
                  <select className="form-input">
                    <option>Daily</option>
                    <option>Hourly</option>
                    <option>Monthly</option>
                  </select>
                </div>
                <button
                  className="btn btn-pri"
                  onClick={() => addToast('📊', 'Report rendering complete', 'success')}
                >
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm command modal dialog */}
      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          body={confirmModal.body}
          onCancel={() => setConfirmModal(null)}
          onConfirm={confirmModal.onConfirm}
        />
      )}

      {/* Device Detail Slider Panel */}
      <DevicePanel
        isOpen={isDrawerOpen}
        device={selectedDevice}
        onClose={() => setIsDrawerOpen(false)}
        onCommand={handleCommandTrigger}
      />
    </div>
  );
};

export default ProjectDetail;
