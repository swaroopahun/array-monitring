import React, { useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PROJECTS } from '../data/mockData';
import MapWidget from '../components/MapWidget';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const Dashboard: React.FC = () => {
  const { alarms, ackAlarm, setCurrentProj, setPage } = useApp();
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  const activeAlarms = alarms.filter((a) => a.status === 'active');
  const activeAlarmsCount = activeAlarms.length;

  const totalCapacity = PROJECTS.reduce((sum, p) => sum + p.mw, 0);
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

  // Render Power Chart
  useEffect(() => {
    const canvas = chartRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const hrs = Array.from({ length: 14 }, (_, i) => `${(i + 5).toString().padStart(2, '0')}:00`);
    const pw = [0, 4, 28, 72, 118, 148, 162, 168, 164, 150, 132, 108, 78, 45];

    const gradient = ctx.createLinearGradient(0, 0, 0, 125);
    gradient.addColorStop(0, 'rgba(255,182,0,.3)');
    gradient.addColorStop(1, 'rgba(255,182,0,0)');

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: hrs,
        datasets: [
          {
            label: 'Power (MW)',
            data: pw,
            borderColor: '#FFB600',
            backgroundColor: gradient,
            borderWidth: 2,
            pointRadius: 2,
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#091E30',
            borderColor: 'rgba(255,255,255,.1)',
            borderWidth: 1,
            titleColor: '#9AA5AF',
            bodyColor: '#fff',
            titleFont: { family: 'Oswald', size: 10 },
            bodyFont: { family: 'Oswald', size: 11 },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(128,128,128,.08)' },
            ticks: {
              color: '#9AA5AF',
              font: { family: 'Oswald', size: 10 },
            },
          },
          y: {
            grid: { color: 'rgba(128,128,128,.08)' },
            ticks: {
              color: '#FFB600',
              font: { family: 'Oswald', size: 10 },
              callback: (v) => v + ' MW',
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

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

  return (
    <div className="page active" id="page-dashboard">
      {/* KPI Cards Grid */}
      <div className="g4" style={{ marginBottom: '14px' }}>
        <div className="kpi kpi-sky">
          <div className="kpi-bg">📋</div>
          <div className="kpi-lbl">Active Projects</div>
          <div className="kpi-val">
            12<span className="kpi-unit">/ 14</span>
          </div>
          <div className="kpi-delta up">▲ 2 online this week</div>
        </div>
        <div className="kpi kpi-green">
          <div className="kpi-bg">✅</div>
          <div className="kpi-lbl">System Availability</div>
          <div className="kpi-val">
            {systemAvailability}
            <span className="kpi-unit">%</span>
          </div>
          <div className="kpi-delta up">▲ 0.6% vs last week</div>
        </div>
        <div className="kpi kpi-teal">
          <div className="kpi-bg">🔌</div>
          <div className="kpi-lbl">Devices Online</div>
          <div className="kpi-val">
            {totalOnline}
            <span className="kpi-unit">/{totalDevices}</span>
          </div>
          <div className="kpi-delta up">▲ {((totalOnline / totalDevices) * 100).toFixed(1)}%</div>
        </div>
        <div className="kpi kpi-orange">
          <div className="kpi-bg">🔔</div>
          <div className="kpi-lbl">Active Alarms</div>
          <div className="kpi-val">
            <span id="kpi-alarms">{activeAlarmsCount}</span>
            <span className="kpi-unit"> alerts</span>
          </div>
          <div className="kpi-delta dn">▼ {activeAlarms.filter((a) => a.sev === 'critical').length} critical</div>
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

      {/* Generation Chart and Project Tables */}
      <div className="g21 mt14">
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Power Generation — Today</div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', fontFamily: 'var(--fs)', color: 'var(--gold)' }}>
                ● Power MW
              </span>
              <span className="card-act" onClick={() => setPage('telemetry')}>
                Analytics →
              </span>
            </div>
          </div>
          <div className="card-body" style={{ padding: '12px 14px', height: '180px', position: 'relative' }}>
            <canvas ref={chartRef}></canvas>
          </div>
        </div>

        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Project Performance</div>
          </div>
          <div className="tbl-wrap" style={{ maxHeight: '180px', overflowY: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Project</th>
                  <th>MW</th>
                  <th>Perf</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {PROJECTS.map((p) => (
                  <tr key={p.id} onClick={() => setCurrentProj(p)}>
                    <td className="td-bold">{p.name}</td>
                    <td className="td-mono">{p.mw} MW</td>
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--fs)',
                          fontSize: '12px',
                          color:
                            p.perf > 95
                              ? 'var(--green-l)'
                              : p.perf > 85
                              ? 'var(--gold)'
                              : 'var(--orange)',
                        }}
                      >
                        {p.perf > 0 ? `${p.perf}%` : '—'}
                      </span>
                    </td>
                    <td>{getStatusBadge(p.status)}</td>
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
