import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PROJECTS } from '../data/mockData';

const Reports: React.FC = () => {
  const { addToast } = useApp();
  const [reportType, setReportType] = useState('DAS Full Report');
  const [selectedProj, setSelectedProj] = useState('');
  const [startDate, setStartDate] = useState('2026-04-01');
  const [endDate, setEndDate] = useState('2026-04-28');
  
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);

  const handleGenerate = () => {
    // Generate mock table data
    const rows = [
      { metric: 'Total Generation', value: '312.4 GWh', vs: '+2.1%', status: 'online' },
      { metric: 'Peak Power', value: '168 MW', vs: '+1.2%', status: 'online' },
      { metric: 'Availability', value: '98.4%', vs: '+0.6%', status: 'online' },
      { metric: 'Performance Ratio', value: '82.3%', vs: '-1.1%', status: 'warning' },
      { metric: 'CO₂ Avoided', value: '187,440 t', vs: '+3.2%', status: 'online' },
      { metric: 'Active Alarms', value: '7', vs: '—', status: 'warning' },
      { metric: 'Devices Online', value: '847/876', vs: '—', status: 'online' },
      { metric: 'Uptime', value: '99.1%', vs: '+0.2%', status: 'online' },
    ];
    setGeneratedReport({ title: `${reportType} Preview`, rows });
    addToast('📊', 'Report generated successfully', 'success');
  };

  const handleExportCSV = () => {
    const csvContent =
      'Metric,Value,vs Target\n' +
      'Total Generation,312.4 GWh,+2.1%\n' +
      'Availability,98.4%,+0.6%\n' +
      'Performance Ratio,82.3%,-1.1%';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${reportType.toLowerCase().replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('⬇️', 'CSV exported successfully', 'success');
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      online: 'b-online',
      warning: 'b-warning',
    };
    return (
      <span className={`badge ${badges[status] || 'b-info'}`}>
        <span className="bdot"></span>
        {status}
      </span>
    );
  };

  const recentReports = [
    { name: 'DAS Full Report — April 2026', proj: 'All Projects', type: 'DAS', date: 'Apr 28' },
    { name: 'Performance Summary — Cerrado I', proj: 'Cerrado I', type: 'Perf', date: 'Apr 27' },
    { name: 'Alarm History — Q1 2026', proj: 'All Projects', type: 'Alarm', date: 'Apr 1' },
  ];

  return (
    <div className="page active" id="page-reports">
      <div className="sec-title">DAS Reports</div>
      
      <div className="g21">
        {/* Configuration card */}
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Report Configuration</div>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Report Type</label>
              <select
                className="form-input"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option>DAS Full Report</option>
                <option>Performance Summary</option>
                <option>Availability Report</option>
                <option>Alarm History</option>
                <option>Device Status Report</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Project</label>
              <select
                className="form-input"
                value={selectedProj}
                onChange={(e) => setSelectedProj(e.target.value)}
              >
                <option value="">All Projects</option>
                {PROJECTS.map((p) => (
                  <option key={p.id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="g2" style={{ gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Granularity</label>
              <select className="form-input">
                <option>Hourly</option>
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-pri" onClick={handleGenerate}>
                Generate Report
              </button>
              <button className="btn btn-sec" onClick={() => addToast('📅', 'Report distribution scheduled', 'info')}>
                Schedule
              </button>
            </div>
          </div>
        </div>

        {/* Recent reports list card */}
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Recent Reports</div>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {recentReports.map((r) => (
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
                    {r.proj} · {r.date}
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
      </div>

      {/* Report Preview Results */}
      {generatedReport && (
        <div className="card mt14" id="rpt-result-card">
          <div className="card-hdr">
            <div className="card-title" id="rpt-result-title">
              {generatedReport.title}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-sec btn-sm" onClick={() => addToast('🖨️', 'Printing report document...', 'info')}>
                Print
              </button>
              <button className="btn btn-pri btn-sm" onClick={handleExportCSV}>
                ⬇ Export CSV
              </button>
            </div>
          </div>
          <div className="card-body" id="rpt-result-body" style={{ padding: 0 }}>
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Value</th>
                    <th>vs Target</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {generatedReport.rows.map((row: any, idx: number) => (
                    <tr key={idx}>
                      <td>{row.metric}</td>
                      <td className="td-gold" style={{ fontFamily: 'var(--fh)' }}>
                        {row.value}
                      </td>
                      <td style={{ color: row.vs.startsWith('-') ? 'var(--orange)' : 'var(--green-l)' }}>
                        {row.vs}
                      </td>
                      <td>{getStatusBadge(row.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
