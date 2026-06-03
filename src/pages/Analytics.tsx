import React, { useEffect, useRef, useState } from 'react';
import { useApp } from '../context/AppContext';
import GanttChart from '../components/GanttChart';
import WindChart from '../components/WindChart';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const Analytics: React.FC = () => {
  const { addToast } = useApp();
  const [timeRange, setTimeRange] = useState('24h');
  
  const donutRef = useRef<HTMLCanvasElement | null>(null);
  const powerRef = useRef<HTMLCanvasElement | null>(null);

  const donutChart = useRef<Chart | null>(null);
  const powerChart = useRef<Chart | null>(null);

  const handleTimeRangeChange = (range: string, label: string) => {
    setTimeRange(range);
    addToast('📅', `Time range updated to: ${label}`, 'info');
  };

  // Render charts on mount
  useEffect(() => {
    // 1. Donut Chart
    const donutCanvas = donutRef.current;
    if (donutCanvas) {
      const ctx = donutCanvas.getContext('2d');
      if (ctx) {
        if (donutChart.current) donutChart.current.destroy();

        const data = [
          { label: 'Autotracking', val: 69.3, col: '#13A34A' },
          { label: 'Safety Stows', val: 19.3, col: '#458BEB' },
          { label: 'Maintenance', val: 11.4, col: '#7C5CBF' },
        ];

        donutChart.current = new Chart(ctx, {
          type: 'doughnut',
          data: {
            labels: data.map((d) => d.label),
            datasets: [
              {
                data: data.map((d) => d.val),
                backgroundColor: data.map((d) => d.col),
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

    // 2. Power Line Chart
    const powerCanvas = powerRef.current;
    if (powerCanvas) {
      const ctx = powerCanvas.getContext('2d');
      if (ctx) {
        if (powerChart.current) powerChart.current.destroy();

        const hrs = Array.from({ length: 14 }, (_, i) => `${(i + 5).toString().padStart(2, '0')}:00`);
        const pw = [0, 4, 28, 72, 118, 148, 162, 168, 164, 150, 132, 108, 78, 45];

        const gradient = ctx.createLinearGradient(0, 0, 0, 120);
        gradient.addColorStop(0, 'rgba(255,182,0,.3)');
        gradient.addColorStop(1, 'rgba(255,182,0,0)');

        powerChart.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: hrs,
            datasets: [
              {
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
                bodyColor: '#fff',
                bodyFont: { family: 'Oswald' },
              },
            },
            scales: {
              x: {
                grid: { color: 'rgba(128,128,128,.07)' },
                ticks: {
                  color: '#9AA5AF',
                  font: { family: 'Oswald', size: 10 },
                },
              },
              y: {
                grid: { color: 'rgba(128,128,128,.07)' },
                ticks: {
                  color: '#FFB600',
                  font: { family: 'Oswald', size: 10 },
                  callback: (v) => v + ' MW',
                },
              },
            },
          },
        });
      }
    }

    return () => {
      if (donutChart.current) donutChart.current.destroy();
      if (powerChart.current) powerChart.current.destroy();
    };
  }, []);

  return (
    <div className="page active" id="page-telemetry">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <div className="sec-title">System Analytics & Telemetry</div>
          <div className="sec-sub">Track real-time energy patterns</div>
        </div>

        {/* Time filters */}
        <div className="view-toggle">
          <div
            className={`vt-btn ${timeRange === '24h' ? 'active' : ''}`}
            onClick={() => handleTimeRangeChange('24h', 'Last 24 Hours')}
          >
            24h
          </div>
          <div
            className={`vt-btn ${timeRange === '7d' ? 'active' : ''}`}
            onClick={() => handleTimeRangeChange('7d', 'Last 7 Days')}
          >
            7d
          </div>
          <div
            className={`vt-btn ${timeRange === '30d' ? 'active' : ''}`}
            onClick={() => handleTimeRangeChange('30d', 'Last 30 Days')}
          >
            30d
          </div>
        </div>
      </div>

      {/* Gantt Timelines */}
      <div className="g21">
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Autotracking & Wind Stow Timeline</div>
          </div>
          <div className="card-body">
            <GanttChart />
          </div>
        </div>

        {/* State distribution Donut */}
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Tracking State Share</div>
          </div>
          <div className="card-body">
            <div className="donut-wrap">
              <canvas ref={donutRef} width="200" height="200"></canvas>
              <div className="donut-center">
                <div className="donut-pct">69.3%</div>
                <div className="donut-sublbl">Autotracking</div>
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginTop: '16px',
              }}
            >
              {[
                { lbl: 'Autotracking', pct: '69.3%', col: '#13A34A' },
                { lbl: 'Safety Stows', pct: '19.3%', col: '#458BEB' },
                { lbl: 'Maintenance', pct: '11.4%', col: '#7C5CBF' },
              ].map((d) => (
                <div key={d.lbl} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.col }} />
                    <span style={{ fontFamily: 'var(--fs)', fontSize: '12px' }}>{d.lbl}</span>
                  </div>
                  <span style={{ fontFamily: 'var(--fh)', fontSize: '16px' }}>{d.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Wind and Power lines */}
      <div className="g21 mt14">
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Power curves history</div>
          </div>
          <div className="card-body" style={{ height: '200px', position: 'relative' }}>
            <canvas ref={powerRef}></canvas>
          </div>
        </div>

        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Wind Speed & Vector Headings</div>
          </div>
          <div className="card-body">
            <WindChart />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
