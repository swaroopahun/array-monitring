import React from 'react';
import { useApp } from '../context/AppContext';
import { PROJECTS } from '../data/mockData';
import MapWidget from '../components/MapWidget';

const Dashboard: React.FC = () => {
  const { alarms, ackAlarm, setCurrentProj, setPage } = useApp();

  const activeAlarms = alarms.filter((a) => a.status === 'active');
  const activeAlarmsCount = activeAlarms.length;

  const totalDevices = PROJECTS.reduce((sum, p) => sum + p.devices, 0);
  const totalOnline = PROJECTS.reduce((sum, p) => sum + (p.status !== 'offline' ? p.online : 0), 0);
  const totalWarning = PROJECTS.reduce((sum, p) => sum + (p.status !== 'offline' ? p.warning : 0), 0);
  const totalOffline = totalDevices - totalOnline - totalWarning;

  const systemAvailability = (totalOnline / totalDevices * 100).toFixed(1);

  // Map markers from projects list
  const mapMarkers = PROJECTS.map((p) => ({
    id: p.id,
    lat: p.lat,
    lng: p.lng,
    name: p.name,
    info: `${p.loc} · ${p.mw} MW · Perf: ${p.perf}%`,
    status: p.status,
  }));

  const handleMapMarkerClick = (id: number) => {
    const proj = PROJECTS.find((p) => p.id === id);
    if (proj) {
      setCurrentProj(proj);
    }
  };

  return (
    <div className="page active" id="page-dashboard">
      {/* KPI Cards Grid */}
      <div className="g4" style={{ marginBottom: '14px' }}>
        <div className="kpi kpi-sky">
          <div className="kpi-bg">�</div>
          <div className="kpi-lbl">Communication Status</div>
          <div className="kpi-val">
            {totalOnline + totalWarning}
            <span className="kpi-unit"> devices</span>
          </div>
          <div className="kpi-delta up">Tracked across all live nodes</div>
        </div>
        <div className="kpi kpi-orange">
          <div className="kpi-bg">🔔</div>
          <div className="kpi-lbl">Active Alarms</div>
          <div className="kpi-val">
            {activeAlarmsCount}
          </div>
          <div className="kpi-delta dn">{activeAlarms.filter((a) => a.sev === 'critical').length} critical</div>
        </div>
        <div className="kpi kpi-green">
          <div className="kpi-bg">✅</div>
          <div className="kpi-lbl">Devices Online</div>
          <div className="kpi-val">
            {totalOnline}
            <span className="kpi-unit">/{totalDevices}</span>
          </div>
          <div className="kpi-delta up">{((totalOnline / totalDevices) * 100).toFixed(1)}%</div>
        </div>
        <div className="kpi kpi-teal">
          <div className="kpi-bg">⚠️</div>
          <div className="kpi-lbl">Devices Offline</div>
          <div className="kpi-val">
            {totalOffline}
          </div>
          <div className="kpi-delta dn">{totalWarning} warnings</div>
        </div>
      </div>

      {/* Map and Side Panels */}
      <div className="g21 mt14">
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Project Map — Brazil</div>
            <span className="card-act" onClick={() => setPage('projects')}>
              All projects →
            </span>
          </div>
          <MapWidget center={[-12, -50]} zoom={4} markers={mapMarkers} onMarkerClick={handleMapMarkerClick} />
        </div>

        <div className="flex-col gap12">
          {/* Active Alarms Widget */}
          <div className="card f1" style={{ overflow: 'hidden' }}>
            <div className="card-hdr">
              <div className="card-title">Active Alarms</div>
              <span className="card-act" onClick={() => setPage('alarms')}>
                View all →
              </span>
            </div>
            <div id="dash-alarms" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {activeAlarms.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">✅</div>
                  <div className="empty-txt">No active alarms</div>
                </div>
              ) : (
                activeAlarms.slice(0, 4).map((a) => (
                  <div
                    key={a.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '10px',
                      padding: '9px 12px',
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
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'var(--fs)', fontSize: '11px', fontWeight: 600 }}>
                        {a.desc}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--ts)', marginTop: '2px' }}>
                        {a.device} · {a.project} · {a.time}
                      </div>
                    </div>
                    <button className="btn btn-sec btn-xs" onClick={() => ackAlarm(a.id)}>
                      Ack
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Connectivity Summary */}
          <div className="card">
            <div className="card-hdr">
              <div className="card-title">Device Connectivity</div>
              <span className="card-act" onClick={() => setPage('fieldview')}>
                Field view →
              </span>
            </div>
            <div className="card-body">
              <div className="g3" style={{ gap: '8px', marginBottom: '10px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--fh)', fontSize: '22px', color: 'var(--green-l)' }}>
                    {totalOnline}
                  </div>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--fs)', color: 'var(--ts)', letterSpacing: '1px' }}>
                    ONLINE
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--fh)', fontSize: '22px', color: 'var(--gold)' }}>
                    {totalWarning}
                  </div>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--fs)', color: 'var(--ts)', letterSpacing: '1px' }}>
                    WARNING
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--fh)', fontSize: '22px', color: 'var(--orange)' }}>
                    {totalOffline}
                  </div>
                  <div style={{ fontSize: '10px', fontFamily: 'var(--fs)', color: 'var(--ts)', letterSpacing: '1px' }}>
                    OFFLINE
                  </div>
                </div>
              </div>
              <div className="pbar">
                <div
                  className="pbar-fill"
                  style={{ width: `${(totalOnline / totalDevices) * 100}%`, background: 'var(--green-l)' }}
                ></div>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '4px',
                  fontSize: '10px',
                  color: 'var(--tm)',
                  fontFamily: 'var(--fs)',
                }}
              >
                <span>{totalDevices} total</span>
                <span style={{ color: 'var(--green-l)' }}>
                  {((totalOnline / totalDevices) * 100).toFixed(1)}% online
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="g21 mt14">
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Hardware Status Overview</div>
            <span className="card-act" onClick={() => setPage('devices')}>
              View devices →
            </span>
          </div>
          <div className="card-body" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '14px' }}>
              <div style={{ padding: '16px', borderRadius: 'var(--r)', background: 'rgba(16,119,87,.05)' }}>
                <div className="metric-lbl">Communicating Devices</div>
                <div className="metric-val">{totalOnline + totalWarning}</div>
                <div className="metric-unit">Includes all devices with active telemetry</div>
              </div>
              <div style={{ padding: '16px', borderRadius: 'var(--r)', background: 'rgba(255,182,0,.08)' }}>
                <div className="metric-lbl">Active Alarms</div>
                <div className="metric-val">{activeAlarmsCount}</div>
                <div className="metric-unit">{activeAlarms.filter((a) => a.sev === 'critical').length} critical</div>
              </div>
              <div style={{ padding: '16px', borderRadius: 'var(--r)', background: 'rgba(19,163,74,.08)' }}>
                <div className="metric-lbl">Online / Offline</div>
                <div className="metric-val">{totalOnline} / {totalOffline}</div>
                <div className="metric-unit">System availability {systemAvailability}%</div>
              </div>
              <div style={{ padding: '16px', borderRadius: 'var(--r)', background: 'rgba(69,139,235,.08)' }}>
                <div className="metric-lbl">Reporting Devices</div>
                <div className="metric-val">{totalDevices}</div>
                <div className="metric-unit">Across {PROJECTS.length} sites</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Health Snapshot</div>
          </div>
          <div className="tbl-wrap" style={{ maxHeight: '180px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Devices</th>
                  <th>Online</th>
                  <th>Offline</th>
                </tr>
              </thead>
              <tbody>
                {PROJECTS.map((p) => (
                  <tr key={p.id}>
                    <td className="td-bold">{p.name}</td>
                    <td className="td-mono">{p.devices}</td>
                    <td className="td-green">{p.online}</td>
                    <td className="td-orange">{p.offline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
