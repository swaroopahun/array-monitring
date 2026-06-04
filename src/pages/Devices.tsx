import React, { useState } from 'react';
import { PROJECTS } from '../data/mockData';
import { genDevices } from '../data/mockData';

const Devices: React.FC = () => {
  const [selectedProj, setSelectedProj] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Generate all devices
  const allProjects = selectedProj === '' 
    ? PROJECTS 
    : PROJECTS.filter((p) => p.name === selectedProj);

  const allDevices = allProjects.flatMap((p) => genDevices(p).map((d) => ({ ...d, project: p.name })));

  // Filter devices
  const filteredDevices = allDevices.filter((d) => {
    const matchesStatus = statusFilter === '' || d.status === statusFilter;
    return matchesStatus;
  });

  const totalPages = Math.ceil(filteredDevices.length / PAGE_SIZE);
  const displayDevices = filteredDevices.slice(
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

    const arrowStyle = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '28px',
      height: '28px',
      borderRadius: '6px',
      fontFamily: 'var(--fs)',
      fontSize: '13px',
      cursor: 'pointer',
      border: '1px solid var(--bd)',
      background: 'var(--bc)',
      color: 'var(--ts)',
      margin: '0 2px',
    };

    return (
      <div style={{ display: 'flex', alignItems: 'center', marginTop: '14px', justifyContent: 'center' }}>
        <button style={arrowStyle} onClick={() => handlePageClick(currentPage - 1)} disabled={currentPage === 1}>
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
        <button style={arrowStyle} onClick={() => handlePageClick(currentPage + 1)} disabled={currentPage === totalPages}>
          ›
        </button>
      </div>
    );
  };

  const getStatusColor = (s: string) => {
    if (s === 'online') return '#13A34A';
    if (s === 'warning') return '#FFB600';
    return '#FF4444';
  };

  const getStatusBg = (s: string) => {
    if (s === 'online') return 'rgba(19,163,74,0.15)';
    if (s === 'warning') return 'rgba(255,182,0,0.15)';
    return 'rgba(255,68,68,0.15)';
  };

  return (
    <div className="page active" id="page-devices">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <div className="sec-title">Device Management</div>
          <div className="sec-sub">Monitor and manage all tracking and control units</div>
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
      </div>

      {/* Summary KPI Cards */}
      <div className="g4" style={{ marginBottom: '14px' }}>
        <div className="kpi kpi-sky">
          <div className="kpi-bg">📡</div>
          <div className="kpi-lbl">Total Devices</div>
          <div className="kpi-val">{filteredDevices.length}</div>
          <div className="kpi-delta up">▲ TCU & NCU units</div>
        </div>
        <div className="kpi kpi-green">
          <div className="kpi-bg">✓</div>
          <div className="kpi-lbl">Online</div>
          <div className="kpi-val">{filteredDevices.filter((d) => d.status === 'online').length}</div>
        </div>
        <div className="kpi kpi-orange">
          <div className="kpi-bg">⚠️</div>
          <div className="kpi-lbl">Warning</div>
          <div className="kpi-val">{filteredDevices.filter((d) => d.status === 'warning').length}</div>
        </div>
        <div className="kpi kpi-teal">
          <div className="kpi-bg">⛔</div>
          <div className="kpi-lbl">Offline</div>
          <div className="kpi-val">{filteredDevices.filter((d) => d.status === 'offline').length}</div>
        </div>
      </div>

      {/* Device Table */}
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Device Registry</div>
          <select
            className="fsel"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="online">Online</option>
            <option value="warning">Warning</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Device ID</th>
                <th>Type</th>
                <th>Status</th>
                <th>Project</th>
                <th>Power (W)</th>
                <th>Temp (°C)</th>
                <th>Voltage (V)</th>
                <th>Firmware</th>
                <th>Last Seen</th>
              </tr>
            </thead>
            <tbody>
              {displayDevices.map((d) => (
                <tr key={d.id}>
                  <td className="td-bold">{d.id}</td>
                  <td style={{ fontFamily: 'var(--fs)', fontSize: '12px', color: 'var(--sky)' }}>
                    {d.type}
                  </td>
                  <td>
                    <span
                      style={{
                        background: getStatusBg(d.status),
                        color: getStatusColor(d.status),
                        fontFamily: 'var(--fh)',
                        fontSize: '12px',
                        padding: '3px 10px',
                        borderRadius: '10px',
                        display: 'inline-block',
                        minWidth: '50px',
                        textAlign: 'center',
                      }}
                    >
                      {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--ts)' }}>{d.project}</td>
                  <td style={{ fontSize: '12px', fontWeight: 600 }}>{d.power} W</td>
                  <td style={{ fontSize: '12px', fontWeight: 600 }}>{d.temp}°C</td>
                  <td style={{ fontSize: '12px' }}>{d.voltage} V</td>
                  <td style={{ fontSize: '11px', color: 'var(--ts)' }}>{d.firmware}</td>
                  <td style={{ fontSize: '12px', color: 'var(--ts)' }}>{d.lastSeen}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {renderPaginationButtons()}
      </div>
    </div>
  );
};

export default Devices;
