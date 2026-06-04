import React, { useState, useEffect } from 'react';
import { PROJECTS } from '../data/mockData';
import { genDevices } from '../data/mockData';

interface CommunicationLog {
  id: number;
  timestamp: string;
  deviceId: string;
  type: 'connect' | 'disconnect' | 'error' | 'sync' | 'update';
  message: string;
  status: 'success' | 'failed' | 'pending';
  signal: number; // 0-100
  latency: number; // ms
}

const CommunicationHub: React.FC = () => {
  const [selectedProj, setSelectedProj] = useState('');
  const [logFilter, setLogFilter] = useState<'all' | 'success' | 'failed' | 'pending'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const PAGE_SIZE = 8;

  // Generate communication logs on mount
  useEffect(() => {
    const allProjects = selectedProj === '' 
      ? PROJECTS 
      : PROJECTS.filter((p) => p.name === selectedProj);

    const generatedLogs: CommunicationLog[] = [];
    let id = 1;

    const eventTypes: Array<'connect' | 'disconnect' | 'error' | 'sync' | 'update'> = ['connect', 'disconnect', 'error', 'sync', 'update'];
    const messages = {
      connect: 'Device connected successfully',
      disconnect: 'Device disconnected',
      error: 'Communication error detected',
      sync: 'Data synchronization completed',
      update: 'Firmware update initiated',
    };

    allProjects.forEach((p) => {
      const devices = genDevices(p).slice(0, 8);
      devices.forEach((d) => {
        for (let i = 0; i < 6; i++) {
          const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
          const now = new Date();
          now.setMinutes(now.getMinutes() - Math.floor(Math.random() * 60));
          
          let status: 'success' | 'failed' | 'pending' = 'success';
          if (type === 'error') status = 'failed';
          else if (type === 'update') status = 'pending';

          generatedLogs.push({
            id: id++,
            timestamp: now.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            deviceId: d.id,
            type,
            message: messages[type],
            status,
            signal: Math.round(30 + Math.random() * 70),
            latency: Math.round(10 + Math.random() * 200),
          });
        }
      });
    });

    setLogs(generatedLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
  }, [selectedProj]);

  const filteredLogs = logFilter === 'all' 
    ? logs 
    : logs.filter((l) => l.status === logFilter);

  const totalPages = Math.ceil(filteredLogs.length / PAGE_SIZE);
  const displayLogs = filteredLogs.slice(
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
    if (s === 'success') return '#13A34A';
    if (s === 'pending') return '#FFB600';
    return '#FF4444';
  };

  const getStatusBg = (s: string) => {
    if (s === 'success') return 'rgba(19,163,74,0.15)';
    if (s === 'pending') return 'rgba(255,182,0,0.15)';
    return 'rgba(255,68,68,0.15)';
  };

  const getTypeIcon = (t: string) => {
    if (t === 'connect') return '🔗';
    if (t === 'disconnect') return '🔌';
    if (t === 'error') return '❌';
    if (t === 'sync') return '🔄';
    if (t === 'update') return '⬆️';
    return '📡';
  };

  const getSignalColor = (s: number) => {
    if (s >= 70) return '#13A34A';
    if (s >= 40) return '#FFB600';
    return '#FF4444';
  };

  const successCount = logs.filter((l) => l.status === 'success').length;
  const failedCount = logs.filter((l) => l.status === 'failed').length;
  const pendingCount = logs.filter((l) => l.status === 'pending').length;

  return (
    <div className="page active" id="page-comhub">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <div className="sec-title">Communication Hub</div>
          <div className="sec-sub">Monitor device connectivity, signal quality, and communication events</div>
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
        <div className="kpi kpi-green">
          <div className="kpi-bg">✓</div>
          <div className="kpi-lbl">Successful Events</div>
          <div className="kpi-val">{successCount}</div>
        </div>
        <div className="kpi kpi-orange">
          <div className="kpi-bg">⏳</div>
          <div className="kpi-lbl">Pending Operations</div>
          <div className="kpi-val">{pendingCount}</div>
        </div>
        <div className="kpi kpi-teal">
          <div className="kpi-bg">📊</div>
          <div className="kpi-lbl">Avg Signal Strength</div>
          <div className="kpi-val">
            {logs.length > 0
              ? Math.round(logs.reduce((sum, l) => sum + l.signal, 0) / logs.length)
              : 0}
            <span className="kpi-unit">%</span>
          </div>
        </div>
        <div className="kpi kpi-orange">
          <div className="kpi-bg">❌</div>
          <div className="kpi-lbl">Failed Events</div>
          <div className="kpi-val">{failedCount}</div>
        </div>
      </div>

      {/* Communication Log Table */}
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Communication Event Log</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              className="fsel"
              value={logFilter}
              onChange={(e) => {
                setLogFilter(e.target.value as any);
                setCurrentPage(1);
              }}
            >
              <option value="all">All Events</option>
              <option value="success">Success</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Device ID</th>
                <th>Event Type</th>
                <th>Message</th>
                <th>Status</th>
                <th>Signal (%)</th>
                <th>Latency (ms)</th>
              </tr>
            </thead>
            <tbody>
              {displayLogs.map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '12px', color: 'var(--ts)', fontFamily: 'monospace' }}>{log.timestamp}</td>
                  <td className="td-bold">{log.deviceId}</td>
                  <td style={{ fontSize: '14px' }}>{getTypeIcon(log.type)}</td>
                  <td style={{ fontSize: '12px' }}>{log.message}</td>
                  <td>
                    <span
                      style={{
                        background: getStatusBg(log.status),
                        color: getStatusColor(log.status),
                        fontFamily: 'var(--fh)',
                        fontSize: '11px',
                        padding: '3px 10px',
                        borderRadius: '10px',
                        display: 'inline-block',
                        minWidth: '50px',
                        textAlign: 'center',
                      }}
                    >
                      {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', fontWeight: 600 }}>
                    <span style={{ color: getSignalColor(log.signal) }}>
                      {log.signal}%
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--ts)' }}>{log.latency} ms</td>
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

export default CommunicationHub;
