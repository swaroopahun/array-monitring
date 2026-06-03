import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PROJECTS } from '../data/mockData';

const Alarms: React.FC = () => {
  const { alarms, ackAlarm, ackAllAlarms } = useApp();
  const [sevFilter, setSevFilter] = useState('all');
  const [projFilter, setProjFilter] = useState('');

  // Filter alarms list
  const filteredAlarms = alarms.filter((a) => {
    const matchesSev = sevFilter === 'all' || a.sev === sevFilter;
    const matchesProj = projFilter === '' || a.project === projFilter;
    return matchesSev && matchesProj;
  });

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      active: 'b-online',
      acknowledged: 'b-ack',
    };
    return (
      <span className={`badge ${badges[status] || 'b-info'}`}>
        <span className="bdot"></span>
        {status}
      </span>
    );
  };

  const getSevBadge = (sev: string) => {
    const badges: Record<string, string> = {
      critical: 'b-crit',
      warning: 'b-warning',
      info: 'b-info',
    };
    return (
      <span className={`badge ${badges[sev] || 'b-info'}`} style={{ fontSize: '9px', padding: '2px 6px' }}>
        {sev}
      </span>
    );
  };

  const activeAlarmsCount = alarms.filter((a) => a.status === 'active').length;

  return (
    <div className="page active" id="page-alarms">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <div className="sec-title">Alarms Console</div>
          <div className="sec-sub" id="alarm-count-lbl">
            — {activeAlarmsCount} active alerts
          </div>
        </div>
        <button className="btn btn-sec btn-sm" onClick={ackAllAlarms} disabled={activeAlarmsCount === 0}>
          Acknowledge All
        </button>
      </div>

      {/* Filters Bar */}
      <div className="filter-bar">
        <div className="view-toggle">
          {['all', 'critical', 'warning', 'info'].map((sev) => (
            <div
              key={sev}
              className={`vt-btn ${sevFilter === sev ? 'active' : ''}`}
              style={{ background: sevFilter === sev ? 'var(--bh)' : '' }}
              onClick={() => setSevFilter(sev)}
            >
              {sev.charAt(0).toUpperCase() + sev.slice(1)}
            </div>
          ))}
        </div>

        <select
          className="fsel"
          value={projFilter}
          onChange={(e) => setProjFilter(e.target.value)}
        >
          <option value="">All Projects</option>
          {PROJECTS.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Alarms Table */}
      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Severity</th>
                <th>Description</th>
                <th>Project</th>
                <th>Device</th>
                <th>Time</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlarms.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--ts)' }}>
                    No alerts matching criteria
                  </td>
                </tr>
              ) : (
                filteredAlarms.map((a) => (
                  <tr key={a.id}>
                    <td>{getSevBadge(a.sev)}</td>
                    <td className="td-bold">{a.desc}</td>
                    <td className="td-mono">{a.project}</td>
                    <td className="td-mono">{a.device}</td>
                    <td className="td-mono">{a.time}</td>
                    <td>{getStatusBadge(a.status)}</td>
                    <td>
                      {a.status === 'active' ? (
                        <button className="btn btn-sec btn-sm" onClick={() => ackAlarm(a.id)}>
                          Acknowledge
                        </button>
                      ) : (
                        <span style={{ fontSize: '11px', color: 'var(--tm)', fontFamily: 'var(--fs)' }}>
                          Resolved
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Alarms;
