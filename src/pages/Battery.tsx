import React, { useState, useEffect, useRef } from 'react';
import { PROJECTS, BATTERY_DATA, Battery as BatteryType } from '../data/mockData';
import { Chart, registerables } from 'chart.js';
import BatteryTelemetryModal from '../components/BatteryTelemetryModal';

Chart.register(...registerables);

const Battery: React.FC = () => {
  const [selectedProj, setSelectedProj] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;

  // Modal telemetry popup state
  const [telemetryBattery, setTelemetryBattery] = useState<BatteryType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBattery, setSelectedBattery] = useState<BatteryType | null>(null);

  const socChartRef = useRef<HTMLCanvasElement | null>(null);
  const tempChartRef = useRef<HTMLCanvasElement | null>(null);
  const socDistChartRef = useRef<HTMLCanvasElement | null>(null);
  const donutChartRef = useRef<HTMLCanvasElement | null>(null);

  const socChart = useRef<Chart | null>(null);
  const tempChart = useRef<Chart | null>(null);
  const socDistChart = useRef<Chart | null>(null);
  const donutChart = useRef<Chart | null>(null);

  // Filter battery data list
  const filteredBatteries = BATTERY_DATA.filter((b) => {
    const matchesProj = selectedProj === '' || b.project === selectedProj;
    const matchesStatus = statusFilter === '' || b.status === statusFilter;
    return matchesProj && matchesStatus;
  });

  // Calculate summaries
  const totalCount = filteredBatteries.length;
  const healthyCount = filteredBatteries.filter((b) => b.status === 'Healthy').length;
  const warningCount = filteredBatteries.filter((b) => b.status === 'Warning').length;
  const criticalCount = filteredBatteries.filter((b) => b.status === 'Critical').length;
  const offlineCount = filteredBatteries.filter((b) => b.status === 'Offline').length;

  const operationalCount = healthyCount + warningCount;
  const nonOperationalCount = criticalCount + offlineCount;

  const validBatteries = filteredBatteries.filter((b) => b.status !== 'Offline');
  const avgSoc =
    validBatteries.length > 0
      ? Math.round(validBatteries.reduce((sum, b) => sum + b.soc, 0) / validBatteries.length)
      : 0;

  const count3ah = filteredBatteries.filter((b) => b.size === '3Ah').length;
  const count6ah = filteredBatteries.filter((b) => b.size === '6Ah').length;

  const healthPct = totalCount > 0 ? Math.round((healthyCount / totalCount) * 100) : 0;

  // Pagination bounds
  const totalPages = Math.ceil(filteredBatteries.length / PAGE_SIZE);
  const displayBatteries = filteredBatteries.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePageClick = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleOpenTelemetry = (b: BatteryType) => {
    setTelemetryBattery(b);
    setIsModalOpen(true);
  };

  // Render summaries charts
  useEffect(() => {
    // 1. 7-Day SoC Area Chart (Min/Max/Avg)
    const socCanvas = socChartRef.current;
    if (socCanvas) {
      const ctx = socCanvas.getContext('2d');
      if (ctx) {
        if (socChart.current) socChart.current.destroy();

        const today = new Date();
        const dayLabels: string[] = [];
        const dayAvg: number[] = [];
        const dayMin: number[] = [];
        const dayMax: number[] = [];

        for (let d = 6; d >= 0; d--) {
          const dt = new Date(today);
          dt.setDate(dt.getDate() - d);
          dayLabels.push(dt.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' }));

          const daySocs = validBatteries.map((b) => {
            const drift = (Math.random() - 0.5) * 12;
            return Math.min(100, Math.max(0, b.soc + drift * (d / 6)));
          });

          dayAvg.push(daySocs.length > 0 ? parseFloat((daySocs.reduce((a, v) => a + v, 0) / daySocs.length).toFixed(1)) : 0);
          dayMin.push(daySocs.length > 0 ? parseFloat(Math.min(...daySocs).toFixed(1)) : 0);
          dayMax.push(daySocs.length > 0 ? parseFloat(Math.max(...daySocs).toFixed(1)) : 0);
        }

        const makeHLine = (val: number, color: string, label: string) => ({
          type: 'line' as const,
          label,
          data: dayLabels.map(() => val),
          borderColor: color,
          borderWidth: 1.5,
          borderDash: [5, 4],
          pointRadius: 0,
          fill: false,
          tension: 0,
          order: 0,
        });

        socChart.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: dayLabels,
            datasets: [
              makeHLine(60, '#13A34A', '▸ Green threshold'),
              makeHLine(30, '#FFB600', '▸ Yellow threshold'),
              makeHLine(15, '#FF4444', '▸ Red threshold'),
              {
                label: 'Max SoC',
                data: dayMax,
                borderColor: 'rgba(69,139,235,0)',
                backgroundColor: 'rgba(69,139,235,0.18)',
                borderWidth: 0,
                pointRadius: 0,
                fill: '+1',
                tension: 0.3,
                order: 1,
              },
              {
                label: 'Avg SoC (%)',
                data: dayAvg,
                borderColor: '#458BEB',
                backgroundColor: 'transparent',
                borderWidth: 2.5,
                pointRadius: 4,
                pointBackgroundColor: '#458BEB',
                tension: 0.3,
                fill: false,
                order: 2,
              },
              {
                label: 'Min SoC',
                data: dayMin,
                borderColor: 'rgba(69,139,235,0)',
                backgroundColor: 'rgba(69,139,235,0.18)',
                borderWidth: 0,
                pointRadius: 0,
                fill: '-1',
                tension: 0.3,
                order: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
              legend: {
                display: true,
                position: 'top',
                align: 'end',
                labels: {
                  color: '#9AA5AF',
                  font: { family: 'Oswald', size: 10 },
                  boxWidth: 20,
                  padding: 8,
                  filter: (item) => !item.text.startsWith('M'), // Hide Min/Max legend entries
                },
              },
              tooltip: {
                backgroundColor: '#091E30',
                borderColor: 'rgba(255,255,255,.1)',
                borderWidth: 1,
                bodyColor: '#fff',
                callbacks: {
                  label: (context) => {
                    const lbl = context.dataset.label;
                    if (lbl === 'Min SoC' || lbl === 'Max SoC') return;
                    return ` ${lbl}: ${context.parsed.y}%`;
                  },
                },
              },
            },
            scales: {
              x: {
                grid: { color: 'rgba(128,128,128,.07)' },
                ticks: { color: '#9AA5AF', font: { family: 'Oswald', size: 10 }, maxRotation: 30 },
              },
              y: {
                min: 0,
                max: 100,
                grid: { color: 'rgba(128,128,128,.07)' },
                ticks: {
                  color: '#9AA5AF',
                  font: { family: 'Oswald', size: 10 },
                  stepSize: 10,
                  callback: (v) => v + '%',
                },
                title: {
                  display: true,
                  text: 'State of Charge (%)',
                  color: '#9AA5AF',
                  font: { family: 'Oswald', size: 10 },
                },
              },
            },
          },
        });
      }
    }

    // 2. Temperature Histogram
    const tempCanvas = tempChartRef.current;
    if (tempCanvas) {
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        if (tempChart.current) tempChart.current.destroy();

        const allTemps = validBatteries.flatMap((b) => b.tempReadings);
        const buckets: Record<number, number> = {};
        for (let t = -20; t <= 45; t += 5) buckets[t] = 0;

        allTemps.forEach((t) => {
          const bucket = Math.floor(t / 5) * 5;
          if (buckets[bucket] !== undefined) {
            buckets[bucket] += 1; // 1 reading = 1 hour (hourly readings over 7 days)
          }
        });

        const bucketLabels = Object.keys(buckets).map((k) => `${k}°C`);
        const bucketVals = Object.values(buckets).map((v) => parseFloat(v.toFixed(1)));
        const maxVal = Math.max(...bucketVals);

        tempChart.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: bucketLabels,
            datasets: [
              {
                label: 'Hours at temperature',
                data: bucketVals,
                backgroundColor: bucketVals.map((v) => {
                  const ratio = v / (maxVal || 1);
                  return `rgba(69,139,235,${0.35 + ratio * 0.55})`;
                }),
                borderColor: '#458BEB',
                borderWidth: 1,
                borderRadius: 3,
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
                bodyColor: '#fff',
                callbacks: { label: (c) => ` ${c.parsed.y} hours` },
              },
            },
            scales: {
              x: {
                grid: { color: 'rgba(128,128,128,.07)' },
                ticks: { color: '#9AA5AF', font: { family: 'Oswald', size: 10 } },
                title: {
                  display: true,
                  text: 'Temperature (°C)',
                  color: '#9AA5AF',
                  font: { family: 'Oswald', size: 10 },
                },
              },
              y: {
                grid: { color: 'rgba(128,128,128,.07)' },
                ticks: { color: '#9AA5AF', font: { family: 'Oswald', size: 10 } },
                title: {
                  display: true,
                  text: 'Time (hours)',
                  color: '#9AA5AF',
                  font: { family: 'Oswald', size: 10 },
                },
              },
            },
          },
        });
      }
    }

    // 3. SoC Distribution Doughnut
    const socDistCanvas = socDistChartRef.current;
    if (socDistCanvas) {
      const ctx = socDistCanvas.getContext('2d');
      if (ctx) {
        if (socDistChart.current) socDistChart.current.destroy();

        const socBuckets: Record<string, number> = {
          '0-25%': 0,
          '25-50%': 0,
          '50-75%': 0,
          '75-100%': 0,
        };

        filteredBatteries.forEach((b) => {
          if (b.soc < 25) socBuckets['0-25%'] += 1;
          else if (b.soc < 50) socBuckets['25-50%'] += 1;
          else if (b.soc < 75) socBuckets['50-75%'] += 1;
          else socBuckets['75-100%'] += 1;
        });

        const socDistData = [
          { label: '0-25%', val: socBuckets['0-25%'], col: '#FF4444' },
          { label: '25-50%', val: socBuckets['25-50%'], col: '#FFB600' },
          { label: '50-75%', val: socBuckets['50-75%'], col: '#458BEB' },
          { label: '75-100%', val: socBuckets['75-100%'], col: '#13A34A' },
        ];

        socDistChart.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: socDistData.map((d) => d.label),
            datasets: [
              {
                data: socDistData.map((d) => d.val),
                backgroundColor: socDistData.map((d) => d.col),
                borderWidth: 0,
                hoverOffset: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '72%',
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#091E30',
                borderColor: 'rgba(255,255,255,.1)',
                borderWidth: 1,
                bodyColor: '#fff',
                bodyFont: { family: 'Oswald' },
              },
            },
          },
        });
      }
    }

    // 4. Donut Health share chart
    const donutCanvas = donutChartRef.current;
    if (donutCanvas) {
      const ctx = donutCanvas.getContext('2d');
      if (ctx) {
        if (donutChart.current) donutChart.current.destroy();

        const donutData = [
          { label: 'Healthy', val: healthyCount, col: '#13A34A' },
          { label: 'Warning', val: warningCount, col: '#FFB600' },
          { label: 'Critical', val: criticalCount, col: '#FF4444' },
          { label: 'Offline', val: offlineCount, col: '#9AA5AF' },
        ];

        donutChart.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: donutData.map((d) => d.label),
            datasets: [
              {
                data: donutData.map((d) => d.val),
                backgroundColor: donutData.map((d) => d.col),
                borderWidth: 0,
                hoverOffset: 4,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '72%',
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: '#091E30',
                borderColor: 'rgba(255,255,255,.1)',
                borderWidth: 1,
                bodyColor: '#fff',
                bodyFont: { family: 'Oswald' },
              },
            },
          },
        });
      }
    }

    return () => {
      if (socChart.current) socChart.current.destroy();
      if (tempChart.current) tempChart.current.destroy();
      if (socDistChart.current) socDistChart.current.destroy();
      if (donutChart.current) donutChart.current.destroy();
    };
  }, [selectedProj]); // Re-render when selected project filters change

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

  const getSocColor = (s: string) => {
    if (s === 'Healthy') return '#13A34A';
    if (s === 'Warning') return '#FFB600';
    if (s === 'Critical') return '#FF4444';
    return '#9AA5AF';
  };

  const getSocBg = (s: string) => {
    if (s === 'Healthy') return 'rgba(19,163,74,0.15)';
    if (s === 'Warning') return 'rgba(255,182,0,0.15)';
    if (s === 'Critical') return 'rgba(255,68,68,0.15)';
    return 'rgba(154,165,175,0.15)';
  };

  return (
    <div className="page active" id="page-battery">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <div className="sec-title">Battery Storage Monitoring</div>
          <div className="sec-sub">Track lithium battery storage metrics</div>
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

      {/* KPI Cards Grid */}
      <div className="g4" style={{ marginBottom: '14px' }}>
        <div className="kpi kpi-sky">
          <div className="kpi-bg">🔋</div>
          <div className="kpi-lbl">Total Batteries</div>
          <div className="kpi-val">{totalCount} units</div>
          <div className="kpi-delta up">▲ {count3ah} x 3Ah · {count6ah} x 6Ah</div>
        </div>
        <div className="kpi kpi-green">
          <div className="kpi-bg">⚡</div>
          <div className="kpi-lbl">Average SoC</div>
          <div className="kpi-val">
            {avgSoc}
            <span className="kpi-unit">%</span>
          </div>
          <div className="kpi-delta up">▲ Nominal charge levels</div>
        </div>
        <div className="kpi kpi-teal">
          <div className="kpi-bg">📈</div>
          <div className="kpi-lbl">Operational Batteries</div>
          <div className="kpi-val">
            {operationalCount}
            <span className="kpi-unit">/{totalCount}</span>
          </div>
        </div>
        <div className="kpi kpi-orange">
          <div className="kpi-bg">⚠️</div>
          <div className="kpi-lbl">Batteries Offline / Failing</div>
          <div className="kpi-val">
            {nonOperationalCount}
            <span className="kpi-unit"> warning</span>
          </div>
          <div className="kpi-delta dn">▼ {criticalCount} critical SoC level</div>
        </div>
      </div>

      <div className="g21">
        {/* State of Charge aggregate area chart */}
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">7-Day Aggregated SoC Chart</div>
          </div>
          <div className="card-body" style={{ height: '220px', position: 'relative' }}>
            <canvas ref={socChartRef}></canvas>
          </div>
        </div>

        {/* Health donut chart */}
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Battery Health Share</div>
          </div>
          <div className="card-body">
            <div className="donut-wrap">
              <canvas ref={donutChartRef} width="160" height="160"></canvas>
              <div className="donut-center">
                <div className="donut-pct">{healthPct}%</div>
                <div className="donut-sublbl">Healthy</div>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                flexWrap: 'wrap',
                marginTop: '16px',
                gap: '8px',
              }}
            >
              {[
                { label: 'Healthy', val: healthyCount, col: '#13A34A' },
                { label: 'Warning', val: warningCount, col: '#FFB600' },
                { label: 'Critical', val: criticalCount, col: '#FF4444' },
                { label: 'Offline', val: offlineCount, col: '#9AA5AF' },
              ].map((d) => (
                <div
                  key={d.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontFamily: 'var(--fs)',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.col, flexShrink: 0 }} />
                  {d.label}: {d.val}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="g21">
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Storage battery status registry</div>
            <select
              className="fsel"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="">All Statuses</option>
              <option value="Healthy">Healthy</option>
              <option value="Warning">Warning</option>
              <option value="Critical">Critical</option>
              <option value="Offline">Offline</option>
            </select>
          </div>
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Battery ID</th>
                  <th>Tracker ID</th>
                  <th>State of Charge (SoC)</th>
                  <th>Health Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayBatteries.map((b) => (
                  <tr
                    key={b.id}
                    onClick={() => setSelectedBattery(b)}
                    onDoubleClick={() => handleOpenTelemetry(b)}
                    title="Click to select (double-click to open telemetry)"
                    style={selectedBattery?.id === b.id ? { background: 'rgba(69,139,235,0.04)' } : undefined}
                  >
                    <td className="td-bold">{b.id}</td>
                    <td style={{ fontFamily: 'var(--fs)', fontSize: '12px', color: 'var(--sky)' }}>{b.trackerId}</td>
                    <td>
                      <span
                        style={{
                          background: getSocBg(b.status),
                          color: getSocColor(b.status),
                          fontFamily: 'var(--fh)',
                          fontSize: '12px',
                          padding: '3px 10px',
                          borderRadius: '10px',
                          display: 'inline-block',
                          minWidth: '44px',
                          textAlign: 'center',
                        }}
                      >
                        {b.soc}%
                      </span>
                    </td>
                    <td style={{ color: getSocColor(b.status), fontFamily: 'var(--fs)', fontSize: '12px' }}>
                      <span
                        style={{
                          background: getSocBg(b.status),
                          color: getSocColor(b.status),
                          fontFamily: 'var(--fh)',
                          fontSize: '12px',
                          padding: '3px 10px',
                          borderRadius: '10px',
                          display: 'inline-block',
                          minWidth: '44px',
                          textAlign: 'center',
                        }}
                      >
                        {b.soh || 0}%
                      </span>
                    </td>
                    
                    <td style={{ width: '72px', textAlign: 'center' }}>
                      <button
                        className="btn btn-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenTelemetry(b);
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderPaginationButtons()}
        </div>

        {/* Selected battery details (blank area elaboration) */}
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Battery Details</div>
          </div>
          <div className="card-body">
            {selectedBattery ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--ts)' }}>Battery ID</div>
                    <div className="td-bold">{selectedBattery.id}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--ts)' }}>Tracker</div>
                    <div style={{ fontFamily: 'var(--fs)', color: 'var(--sky)' }}>{selectedBattery.trackerId}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--ts)' }}>SoC</div>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>{selectedBattery.soc}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--ts)' }}>SoH</div>
                    <div style={{ fontSize: '18px', fontWeight: 700 }}>{selectedBattery.soh}%</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--ts)' }}>Size</div>
                    <div style={{ fontSize: '14px' }}>{selectedBattery.size}</div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '12px', color: 'var(--ts)', marginBottom: '6px' }}>Temperature (last 7 days)</div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {(() => {
                      const temps = selectedBattery.tempReadings || [];
                      const avg = temps.length ? Math.round((temps.reduce((a, v) => a + v, 0) / temps.length) * 10) / 10 : 0;
                      const min = temps.length ? Math.round(Math.min(...temps) * 10) / 10 : 0;
                      const max = temps.length ? Math.round(Math.max(...temps) * 10) / 10 : 0;
                      return (
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <div>
                            <div style={{ fontSize: '11px', color: 'var(--ts)' }}>Avg</div>
                            <div className="td-bold">{avg}°C</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', color: 'var(--ts)' }}>Min</div>
                            <div className="td-bold">{min}°C</div>
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', color: 'var(--ts)' }}>Max</div>
                            <div className="td-bold">{max}°C</div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-pri"
                    onClick={() => selectedBattery && handleOpenTelemetry(selectedBattery)}
                  >
                    Open Telemetry
                  </button>
                  <button
                    className="btn btn-sec"
                    onClick={() => setSelectedBattery(null)}
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ color: 'var(--ts)' }}>Select a battery from the table to view details here.</div>
            )}
          </div>
        </div>
      </div>

      <div className="g21">
        {/* Temperature histogram chart */}
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Battery Temperature Histogram</div>
          </div>
          <div className="card-body" style={{ height: '220px', position: 'relative' }}>
            <canvas ref={tempChartRef}></canvas>
          </div>
        </div>

        {/* SoC Distribution doughnut chart */}
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Battery SoC Distribution</div>
          </div>
          <div className="card-body">
            <div className="donut-wrap">
              <canvas ref={socDistChartRef} width="160" height="160"></canvas>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                flexWrap: 'wrap',
                marginTop: '16px',
                gap: '8px',
              }}
            >
              {[
                { label: '0-25%', val: filteredBatteries.filter((b) => b.soc < 25).length, col: '#FF4444' },
                { label: '25-50%', val: filteredBatteries.filter((b) => b.soc >= 25 && b.soc < 50).length, col: '#FFB600' },
                { label: '50-75%', val: filteredBatteries.filter((b) => b.soc >= 50 && b.soc < 75).length, col: '#458BEB' },
                { label: '75-100%', val: filteredBatteries.filter((b) => b.soc >= 75).length, col: '#13A34A' },
              ].map((d) => (
                <div
                  key={d.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontFamily: 'var(--fs)',
                    fontSize: '11px',
                  }}
                >
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.col, flexShrink: 0 }} />
                  {d.label}: {d.val}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry charts modal popups */}
      <BatteryTelemetryModal
        isOpen={isModalOpen}
        battery={telemetryBattery}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Battery;
