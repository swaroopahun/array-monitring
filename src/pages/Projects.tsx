import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PROJECTS } from '../data/mockData';
import ProjectDetail from './ProjectDetail';

const Projects: React.FC = () => {
  const { currentProj, setCurrentProj, addToast } = useApp();
  const [searchVal, setSearchVal] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [regionFilter, setRegionFilter] = useState('All Regions');

  // Filter projects list
  const filteredProjects = PROJECTS.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchVal.toLowerCase()) ||
      p.loc.toLowerCase().includes(searchVal.toLowerCase());
    const matchesStatus = statusFilter === '' || p.status === statusFilter;
    const matchesRegion = regionFilter === 'All Regions' || p.region === regionFilter;

    return matchesSearch && matchesStatus && matchesRegion;
  });

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

  const getPerfColor = (perf: number) => {
    if (perf > 95) return 'var(--green-l)';
    if (perf > 85) return 'var(--gold)';
    return 'var(--orange)';
  };

  // If a project is selected, render details view
  if (currentProj) {
    return <ProjectDetail />;
  }

  return (
    <div className="page active" id="page-projects">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <div className="sec-title">Projects</div>
          <div className="sec-sub">14 total · 12 active</div>
        </div>
        <button
          className="btn btn-pri"
          onClick={() => addToast('➕', 'New project creation modal coming soon', 'info')}
        >
          + New Project
        </button>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="fi" style={{ maxWidth: '260px' }}>
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
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            placeholder="Search projects…"
          />
        </div>

        <select
          className="fsel"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="online">Online</option>
          <option value="warning">Warning</option>
          <option value="offline">Offline</option>
        </select>

        <select
          className="fsel"
          value={regionFilter}
          onChange={(e) => setRegionFilter(e.target.value)}
        >
          <option value="All Regions">All Regions</option>
          <option value="Southeast">Southeast</option>
          <option value="Northeast">Northeast</option>
          <option value="Central-West">Central-West</option>
          <option value="South">South</option>
          <option value="North">North</option>
        </select>
      </div>

      {/* Projects List Table */}
      <div className="card">
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Project</th>
                <th>Location</th>
                <th>Capacity</th>
                <th>Performance</th>
                <th>Devices Ratio</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((p) => (
                <tr key={p.id} onClick={() => setCurrentProj(p)}>
                  <td className="td-bold">{p.name}</td>
                  <td className="td-mono">{p.loc}</td>
                  <td className="td-gold" style={{ fontFamily: 'var(--fh)' }}>
                    {p.mw} MW
                  </td>
                  <td>
                    {p.perf > 0 ? (
                      <>
                        <span style={{ fontFamily: 'var(--fs)', fontSize: '12px', color: getPerfColor(p.perf) }}>
                          {p.perf}%
                        </span>
                        <div className="pbar" style={{ width: '80px', marginTop: '3px' }}>
                          <div
                            className="pbar-fill"
                            style={{ width: `${p.perf}%`, background: getPerfColor(p.perf) }}
                          />
                        </div>
                      </>
                    ) : (
                      <span style={{ fontFamily: 'var(--fs)', fontSize: '12px', color: 'var(--orange)' }}>
                        —
                      </span>
                    )}
                  </td>
                  <td className="td-mono">
                    {p.devices} ·{' '}
                    <span style={{ color: 'var(--green-l)' }}>{p.online}</span>/
                    <span style={{ color: 'var(--orange)' }}>{p.offline}</span>
                  </td>
                  <td>{getStatusBadge(p.status)}</td>
                  <td>
                    <button
                      className="btn btn-sec btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentProj(p);
                      }}
                    >
                      Details →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Projects;
