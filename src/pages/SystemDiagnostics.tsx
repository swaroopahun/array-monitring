import React from 'react';

const testCases = [
  {
    id: 'rtc-sync',
    name: 'RTC System Clock Sync Phase Validation',
    detail: 'Drift variance calculation across mesh system node components',
    status: 'PASSED',
    tag: '0.1s',
  },
  {
    id: 'inclinometer',
    name: 'Inclinometer Primary/Secondary Cross Check',
    detail: 'Dual internal tracking hardware comparison validation sequence',
    status: 'PASSED MATRIX',
    tag: 'Stable',
  },
  {
    id: 'flash-crc',
    name: 'Flash Storage CRC Memory Integrity Block Test',
    detail: 'Internal memory corruption sector validation sequence scans',
    status: 'PASSED BLOCK',
    tag: 'Completed',
  },
  {
    id: 'sensor-hail',
    name: 'Ultrasonic Anemometer Wind Velocity Readout',
    detail: 'Environmental sensor health and wind velocity stability check',
    status: 'ACTIVE',
    tag: '24.2 km/h',
  },
];

const SystemDiagnostics: React.FC = () => {
  return (
    <div className="page active" id="page-diagnostics">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <div className="sec-title">System Diagnostics</div>
          <div className="sec-sub">Access low-level hardware and operational validation tests for device fleet management.</div>
        </div>
      </div>

      <div className="g3" style={{ marginBottom: '14px' }}>
        <div className="kpi kpi-sky">
          <div className="kpi-bg">🧪</div>
          <div className="kpi-lbl">Diagnostic Checks</div>
          <div className="kpi-val">{testCases.length}</div>
        </div>
        <div className="kpi kpi-green">
          <div className="kpi-bg">✅</div>
          <div className="kpi-lbl">Healthy Systems</div>
          <div className="kpi-val">3</div>
        </div>
        <div className="kpi kpi-orange">
          <div className="kpi-bg">⏱️</div>
          <div className="kpi-lbl">Last Scan</div>
          <div className="kpi-val">03 min ago</div>
        </div>
      </div>

      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Isolation Test Layer</div>
          <div className="chip">NX Controller Board</div>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Test</th>
                <th>Description</th>
                <th>Status</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {testCases.map((test) => (
                <tr key={test.id}>
                  <td className="td-bold">{test.name}</td>
                  <td style={{ fontSize: '12px', color: 'var(--ts)' }}>{test.detail}</td>
                  <td style={{ fontSize: '12px', color: '#13A34A', fontWeight: 600 }}>{test.status}</td>
                  <td style={{ fontSize: '12px', fontWeight: 600 }}>{test.tag}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SystemDiagnostics;
