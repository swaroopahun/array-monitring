import React, { useState, useEffect, useRef } from 'react';
import { WEATHER_DATA } from '../data/mockData';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const Weather: React.FC = () => {
  const [selectedProj, setSelectedProj] = useState('Cerrado I');
  
  const windBarRef = useRef<HTMLCanvasElement | null>(null);
  const rsuRef = useRef<HTMLCanvasElement | null>(null);

  const windChart = useRef<Chart | null>(null);
  const rsuChart = useRef<Chart | null>(null);

  const weather = WEATHER_DATA[selectedProj] || WEATHER_DATA['Cerrado I'];

  // Render charts on change
  useEffect(() => {
    // 1. Wind Speed Hourly Bar Chart
    const windCanvas = windBarRef.current;
    if (windCanvas) {
      const ctx = windCanvas.getContext('2d');
      if (ctx) {
        if (windChart.current) windChart.current.destroy();

        const hrs = Array.from({ length: 12 }, (_, i) => `${(i * 2).toString().padStart(2, '0')}:00`);
        const data = [8, 10, 12, 14, 16, 18, 14, 12, 10, 8, 11, 13];

        windChart.current = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: hrs,
            datasets: [
              {
                data,
                backgroundColor: data.map((v) =>
                  v > 15 ? 'rgba(255,116,36,.7)' : 'rgba(69,139,235,.6)'
                ),
                borderRadius: 4,
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
                grid: { display: false },
                ticks: {
                  color: '#9AA5AF',
                  font: { family: 'Oswald', size: 10 },
                },
              },
              y: {
                suggestedMax: 25,
                grid: { color: 'rgba(128,128,128,.07)' },
                ticks: {
                  color: '#9AA5AF',
                  font: { family: 'Oswald', size: 10 },
                },
              },
            },
          },
        });
      }
    }

    // 2. Irradiance (RSU) line chart
    const rsuCanvas = rsuRef.current;
    if (rsuCanvas) {
      const ctx = rsuCanvas.getContext('2d');
      if (ctx) {
        if (rsuChart.current) rsuChart.current.destroy();

        const hrs = Array.from({ length: 14 }, (_, i) => `${(i + 5).toString().padStart(2, '0')}:00`);
        const ir = [0, 45, 280, 580, 820, 960, 1020, 1060, 990, 880, 750, 600, 420, 220];

        const gradient = ctx.createLinearGradient(0, 0, 0, 100);
        gradient.addColorStop(0, 'rgba(255,182,0,.4)');
        gradient.addColorStop(1, 'rgba(255,182,0,0)');

        rsuChart.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: hrs,
            datasets: [
              {
                data: ir,
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
                  color: '#9AA5AF',
                  font: { family: 'Oswald', size: 10 },
                },
              },
            },
          },
        });
      }
    }

    return () => {
      if (windChart.current) windChart.current.destroy();
      if (rsuChart.current) rsuChart.current.destroy();
    };
  }, [selectedProj]);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const icons = ['☀️', '🌤️', '⛅', '☀️', '🌧️', '⛅', '☀️'];
  const temps = [38, 36, 34, 40, 28, 32, 37];
  const irrs = [824, 760, 620, 900, 180, 540, 810];
  const today = new Date().getDay();

  return (
    <div className="page active" id="page-weather">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <div className="sec-title">Weather & Solar Irradiance</div>
          <div className="sec-sub">Review solar resource conditions</div>
        </div>
        <select
          className="fsel"
          value={selectedProj}
          onChange={(e) => setSelectedProj(e.target.value)}
        >
          {Object.keys(WEATHER_DATA).map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="g21">
        {/* Weekly Forecast strip */}
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">7-Day Solar Forecast</div>
          </div>
          <div className="card-body">
            <div className="forecast-strip">
              {days.map((d, i) => (
                <div key={d} className={`fc-day ${i === today ? 'fc-today' : ''}`}>
                  <div className="fc-dow">{i === today ? 'Today' : d}</div>
                  <div className="fc-icon">{icons[i]}</div>
                  <div className="fc-temp">{temps[i]}°</div>
                  <div className="fc-ir">{irrs[i]} W/m²</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Project parameters detail */}
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Live Weather Indexes</div>
          </div>
          <div className="card-body">
            <div className="set-row">
              <div className="set-lbl">Temperature</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '60%' }}>
                <div className="pbar" style={{ flex: 1 }}>
                  <div className="pbar-fill" style={{ width: `${weather.tb}%`, background: 'var(--orange)' }}></div>
                </div>
                <span className="fw5" style={{ minWidth: '32px', textAlign: 'right' }}>
                  {weather.temp}
                </span>
              </div>
            </div>
            <div className="set-row">
              <div className="set-lbl">Wind Speed</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '60%' }}>
                <div className="pbar" style={{ flex: 1 }}>
                  <div className="pbar-fill" style={{ width: `${weather.wb}%`, background: 'var(--sky)' }}></div>
                </div>
                <span className="fw5" style={{ minWidth: '32px', textAlign: 'right' }}>
                  {weather.wind} mph
                </span>
              </div>
            </div>
            <div className="set-row">
              <div className="set-lbl">Humidity</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '60%' }}>
                <div className="pbar" style={{ flex: 1 }}>
                  <div className="pbar-fill" style={{ width: `${weather.hb}%`, background: 'var(--green-l)' }}></div>
                </div>
                <span className="fw5" style={{ minWidth: '32px', textAlign: 'right' }}>
                  {weather.hum}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="g21 mt14">
        {/* RSU chart */}
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Reference Irradiance (RSU) — Today</div>
            <span style={{ fontSize: '10px', fontFamily: 'var(--fs)', color: 'var(--gold)' }}>
              ● Irradiance (W/m²)
            </span>
          </div>
          <div className="card-body" style={{ height: '180px', position: 'relative' }}>
            <canvas ref={rsuRef}></canvas>
          </div>
        </div>

        {/* Wind speed bar chart */}
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Hourly Wind Speeds (mph)</div>
          </div>
          <div className="card-body" style={{ height: '180px', position: 'relative' }}>
            <canvas ref={windBarRef}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Weather;
