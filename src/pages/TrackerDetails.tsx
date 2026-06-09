import React, { useState } from 'react';
import { PROJECTS, BATTERY_DATA, genDevices, Project, Device, Battery } from '../data/mockData';

const familyNames = ['Atlas', 'Orion', 'Helios', 'Astra', 'Phoenix'];

const TrackerDetails: React.FC = () => {
  const [selectedProj, setSelectedProj] = useState('');
  const [trackerFamily, setTrackerFamily] = useState('');
  const [selectedNcu, setSelectedNcu] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTracker, setSelectedTracker] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 8;

  // Get all trackers from all projects
  const allProjects = selectedProj === '' 
    ? PROJECTS 
    : PROJECTS.filter((p) => p.name === selectedProj);

  const trackerSet = new Set<string>();
  const trackerDetails: Record<string, any> = {};

  // Collect all tracker IDs and their associated data
  allProjects.forEach((_p: Project) => {
    genDevices(_p).forEach((d: Device, i: number) => {
      const trackerId = `T-${String(Math.floor(i / 3) + 1).padStart(3, '0')}`;
      const family = familyNames[Math.floor(i / 3) % familyNames.length];
      if (!trackerSet.has(trackerId)) {
        trackerSet.add(trackerId);
        trackerDetails[trackerId] = {
          id: trackerId,
          project: _p.name,
          devices: [],
          batteries: [],
          status: d.status,
          lastSeen: d.lastSeen,
          family,
          ncu: d.ncu,
        };
      }
      trackerDetails[trackerId].devices.push(d);
    });
  });

  // Also get trackers from battery data
  BATTERY_DATA.forEach((b: Battery) => {
    if (!trackerSet.has(b.trackerId)) {
      trackerSet.add(b.trackerId);
      trackerDetails[b.trackerId] = {
        id: b.trackerId,
        project: b.project,
        devices: [],
        batteries: [b],
        status: b.status === 'Offline' ? 'offline' : 'online',
        lastSeen: 'just now',
        family: familyNames[0],
        ncu: 'NCU 001',
      };
    } else if (trackerDetails[b.trackerId]) {
      trackerDetails[b.trackerId].batteries.push(b);
    }
  });

  const trackers = Array.from(trackerSet).map((id) => trackerDetails[id]).sort((a, b) => a.id.localeCompare(b.id));
  const uniqueNcus = Array.from(new Set(trackers.map((t) => t.ncu))).sort();
  const filteredTrackers = trackers.filter((t) => {
    const matchesProject = selectedProj === '' || t.project === selectedProj;
    const matchesFamily = trackerFamily === '' || t.family === trackerFamily;
    const matchesNcu = selectedNcu === '' || t.ncu === selectedNcu;
    const matchesSearch = searchTerm === '' || t.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProject && matchesFamily && matchesNcu && matchesSearch;
  });

  const totalPages = Math.ceil(filteredTrackers.length / PAGE_SIZE);
  const displayTrackers = filteredTrackers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPaginationButtons = () => {
    const pageNums: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pageNums.push(i);
    } else {
      pageNums.push(1);
      if (currentPage > 3) pageNums.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pageNums.push(i);
      }
      if (currentPage < totalPages - 2) pageNums.push('...');
      pageNums.push(totalPages);
    }

    const btnStyle = (active: boolean) => ({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '28px',
      height: '28px',
      borderRadius: '6px',
      fontFamily: 'var(--fs)',
      fontSize: '11px',
      cursor: 'pointer',
      border: `1px solid ${active ? 'var(--sky)' : 'var(--bd)'}`,
      background: active ? 'var(--sky)' : 'var(--bc)',
      color: active ? '#fff' : 'var(--ts)',
      margin: '0 2px',
    });

    return (
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '14px', justifyContent: 'center' }}>
        <button style={btnStyle(false)} onClick={() => handlePageClick(currentPage - 1)} disabled={currentPage === 1}>
          ‹
        </button>
        {pageNums.map((n, idx) =>
          n === '...' ? (
            <span key={idx} style={{ fontFamily: 'var(--fs)', fontSize: '12px', color: 'var(--ts)', padding: '0 4px' }}>
              ...
            </span>
          ) : (
            <button key={idx} style={btnStyle(n === currentPage)} onClick={() => handlePageClick(n as number)}>
              {n}
            </button>
          )
        )}
        <button style={btnStyle(false)} onClick={() => handlePageClick(currentPage + 1)} disabled={currentPage === totalPages}>
          ›
        </button>
      </div>
    );
  };

  const getStatusColor = (s: string) => {
    if (s === 'online' || s === 'Healthy') return '#13A34A';
    if (s === 'warning' || s === 'Warning') return '#FFB600';
    return '#FF4444';
  };

  const getStatusBg = (s: string) => {
    if (s === 'online' || s === 'Healthy') return 'rgba(19,163,74,0.15)';
    if (s === 'warning' || s === 'Warning') return 'rgba(255,182,0,0.15)';
    return 'rgba(255,68,68,0.15)';
  };

  const currentTracker = selectedTracker ? trackerDetails[selectedTracker] : null;

  return (
    <div className="page active" id="page-trackers">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="sec-title">Tracker Details & Analytics</div>
          <div className="sec-sub">View tracker specifications and associated devices/batteries</div>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <div className="fi" style={{ minWidth: '220px' }}>
            <svg
              width="13"
              height="13"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ color: 'var(--tm)' }}
            >
              <circle cx="6.5" cy="6.5" r="4.5" />
              <line x1="10" y1="10" x2="14" y2="14" />
            </svg>
            <input
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search trackers…"
            />
          </div>
          <select
            className="fsel"
            value={selectedProj}
            onChange={(e) => {
              setSelectedProj(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Projects</option>
            {PROJECTS.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            className="fsel"
            value={trackerFamily}
            onChange={(e) => {
              setTrackerFamily(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Tracker Families</option>
            {familyNames.map((family) => (
              <option key={family} value={family}>
                {family}
              </option>
            ))}
          </select>
          <select
            className="fsel"
            value={selectedNcu}
            onChange={(e) => {
              setSelectedNcu(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All NCU / Gateways</option>
            {uniqueNcus.map((ncu) => (
              <option key={ncu} value={ncu}>
                {ncu}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="g4" style={{ marginBottom: '14px' }}>
        <div className="kpi kpi-sky">
          <div className="kpi-bg">🎯</div>
          <div className="kpi-lbl">Total Trackers</div>
          <div className="kpi-val">{filteredTrackers.length}</div>
        </div>
        <div className="kpi kpi-green">
          <div className="kpi-bg">✓</div>
          <div className="kpi-lbl">Active</div>
          <div className="kpi-val">{filteredTrackers.filter((t) => t.status === 'online').length}</div>
        </div>
        <div className="kpi kpi-orange">
          <div className="kpi-bg">🔋</div>
          <div className="kpi-lbl">With Batteries</div>
          <div className="kpi-val">{filteredTrackers.filter((t) => t.batteries.length > 0).length}</div>
        </div>
        <div className="kpi kpi-teal">
          <div className="kpi-bg">📡</div>
          <div className="kpi-lbl">Avg Devices/Tracker</div>
          <div className="kpi-val">
            {filteredTrackers.length > 0
              ? Math.round(filteredTrackers.reduce((sum, t) => sum + t.devices.length, 0) / filteredTrackers.length)
              : 0}
          </div>
        </div>
      </div>

      <div className="g21">
        {/* Tracker Table */}
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Tracker Inventory</div>
          </div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Tracker ID</th>
                  <th>Project</th>
                  <th>Family</th>
                  <th>NCU / Gateway</th>
                  <th>Status</th>
                  <th>Devices</th>
                  <th>Batteries</th>
                  <th>Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {displayTrackers.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTracker(t.id)}
                    style={selectedTracker === t.id ? { background: 'rgba(69,139,235,0.04)' } : undefined}
                  >
                    <td className="td-bold">{t.id}</td>
                    <td style={{ fontSize: '12px', color: 'var(--ts)' }}>{t.project}</td>
                    <td style={{ fontSize: '12px', color: 'var(--sky)' }}>{t.family}</td>
                    <td style={{ fontSize: '12px', color: 'var(--ts)' }}>{t.ncu}</td>
                    <td>
                      <span
                        style={{
                          background: getStatusBg(t.status),
                          color: getStatusColor(t.status),
                          fontFamily: 'var(--fh)',
                          fontSize: '12px',
                          padding: '3px 10px',
                          borderRadius: '10px',
                          display: 'inline-block',
                          minWidth: '50px',
                          textAlign: 'center',
                        }}
                      >
                        {t.status.charAt(0).toUpperCase() + t.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ fontSize: '12px', fontWeight: 600 }}>{t.devices.length}</td>
                    <td style={{ fontSize: '12px', fontWeight: 600 }}>{t.batteries.length}</td>
                    <td style={{ fontSize: '12px', color: 'var(--ts)' }}>{t.lastSeen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPaginationButtons()}
        </div>

        {/* Tracker Details Panel */}
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Connected Devices & Batteries</div>
          </div>
          <div className="card-body">
            {currentTracker ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Connected Devices List */}
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--ts)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1.2px' }}>📡 Devices ({currentTracker.devices.length})</div>
                  {currentTracker.devices.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                      {currentTracker.devices.slice(0, 5).map((d: Device) => (
                        <div
                          key={d.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '11px',
                            padding: '6px 8px',
                            background: 'rgba(69,139,235,0.05)',
                            borderRadius: '6px',
                            border: `1px solid ${getStatusColor(d.status) === '#13A34A' ? 'rgba(19,163,74,0.3)' : getStatusColor(d.status) === '#FFB600' ? 'rgba(255,182,0,0.3)' : 'rgba(255,68,68,0.3)'}`,
                          }}
                        >
                          <span style={{ fontWeight: 600, color: 'var(--fg)' }}>{d.id}</span>
                          <span
                            style={{
                              color: getStatusColor(d.status),
                              fontWeight: 700,
                            }}
                          >
                            {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                          </span>
                        </div>
                      ))}
                      {currentTracker.devices.length > 5 && (
                        <div style={{ fontSize: '10px', color: 'var(--ts)', fontStyle: 'italic', padding: '4px 0' }}>
                          + {currentTracker.devices.length - 5} more devices
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: 'var(--ts)' }}>No devices connected</div>
                  )}
                </div>

                {/* Batteries List */}
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--ts)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1.2px' }}>🔋 Batteries ({currentTracker.batteries.length})</div>
                  {currentTracker.batteries.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
                      {currentTracker.batteries.slice(0, 5).map((b: Battery) => (
                        <div
                          key={b.id}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontSize: '11px',
                            padding: '6px 8px',
                            background: 'rgba(69,139,235,0.05)',
                            borderRadius: '6px',
                            border: `1px solid ${
                              b.soc >= 60 ? 'rgba(19,163,74,0.3)' : b.soc >= 30 ? 'rgba(255,182,0,0.3)' : 'rgba(255,68,68,0.3)'
                            }`,
                          }}
                        >
                          <span style={{ fontWeight: 600, color: 'var(--fg)' }}>{b.id}</span>
                          <span
                            style={{
                              color:
                                b.soc >= 60 ? '#13A34A' : b.soc >= 30 ? '#FFB600' : '#FF4444',
                              fontWeight: 700,
                            }}
                          >
                            {b.soc}%
                          </span>
                        </div>
                      ))}
                      {currentTracker.batteries.length > 5 && (
                        <div style={{ fontSize: '10px', color: 'var(--ts)', fontStyle: 'italic', padding: '4px 0' }}>
                          + {currentTracker.batteries.length - 5} more batteries
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={{ fontSize: '11px', color: 'var(--ts)' }}>No batteries connected</div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--ts)' }}>Select a tracker from the table to view connected devices and batteries.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackerDetails;
