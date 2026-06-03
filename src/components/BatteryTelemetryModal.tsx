import React, { useEffect, useRef } from 'react';
import { Battery } from '../data/mockData';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

interface BatteryTelemetryModalProps {
  isOpen: boolean;
  battery: Battery | null;
  onClose: () => void;
}

const BatteryTelemetryModal: React.FC<BatteryTelemetryModalProps> = ({
  isOpen,
  battery,
  onClose,
}) => {
  const socRef = useRef<HTMLCanvasElement | null>(null);
  const sohRef = useRef<HTMLCanvasElement | null>(null);
  const tempRef = useRef<HTMLCanvasElement | null>(null);
  const voltRef = useRef<HTMLCanvasElement | null>(null);
  const currRef = useRef<HTMLCanvasElement | null>(null);

  const charts = useRef<Record<string, Chart | null>>({});

  useEffect(() => {
    if (!isOpen || !battery) return;

    // Sparse labels: last 168 hours (7 days), label every 24 hours
    const sparseLabels: string[] = [];
    const today = new Date();
    for (let h = 167; h >= 0; h--) {
      if (h % 24 === 0) {
        const d = new Date(today);
        d.setHours(d.getHours() - h);
        sparseLabels.push(
          d.toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })
        );
      } else {
        sparseLabels.push('');
      }
    }

    const makeSeries = (base: number, amp: number, noise: number) =>
      Array.from({ length: 168 }, (_, i) => {
        const value = base + amp * Math.sin((i / 24) * Math.PI * 2) + (Math.random() - 0.5) * noise;
        return parseFloat(value.toFixed(1));
      });

    const socSeries = makeSeries(battery.soc, 8, 4).map((v) => Math.min(100, Math.max(0, v)));
    const sohSeries = makeSeries(battery.soh || 88, 3, 1).map((v) => Math.min(100, Math.max(70, v)));
    const tempSeries = makeSeries(25, 6, 2);
    const voltSeries = makeSeries(battery.size === '6Ah' ? 12.4 : 3.7, 0.3, 0.1);
    const currSeries = makeSeries(0.8, 1.2, 0.5).map((v) => Math.max(0, v));

    const drawChart = (
      canvas: HTMLCanvasElement,
      key: string,
      data: number[],
      color: string,
      unit: string,
      yMin: number | null,
      yMax: number | null
    ) => {
      // Destroy existing chart
      if (charts.current[key]) {
        charts.current[key]?.destroy();
        charts.current[key] = null;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      charts.current[key] = new Chart(ctx, {
        type: 'line',
        data: {
          labels: sparseLabels,
          datasets: [
            {
              data,
              borderColor: color,
              backgroundColor: 'transparent',
              borderWidth: 1.5,
              pointRadius: 0,
              tension: 0.3,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: { duration: 400 },
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#091E30',
              borderColor: 'rgba(255,255,255,.1)',
              borderWidth: 1,
              bodyColor: '#fff',
              callbacks: {
                label: (context) => ` ${context.parsed.y} ${unit}`,
              },
            },
          },
          scales: {
            x: {
              grid: { color: 'rgba(128,128,128,.05)' },
              ticks: {
                color: '#9AA5AF',
                font: { family: 'Oswald', size: 9 },
                callback: (val) => sparseLabels[val as number] || '',
                maxRotation: 0,
              },
            },
            y: {
              min: yMin !== null ? yMin : undefined,
              max: yMax !== null ? yMax : undefined,
              grid: { color: 'rgba(128,128,128,.07)' },
              ticks: {
                color: '#9AA5AF',
                font: { family: 'Oswald', size: 9 },
              },
              title: {
                display: true,
                text: unit,
                color: '#9AA5AF',
                font: { family: 'Oswald', size: 9 },
              },
            },
          },
        },
      });
    };

    // Render charts asynchronously to ensure modals DOM is loaded
    const timeout = setTimeout(() => {
      if (socRef.current) drawChart(socRef.current, 'soc', socSeries, '#458BEB', '%', 0, 100);
      if (sohRef.current) drawChart(sohRef.current, 'soh', sohSeries, '#13A34A', '%', 70, 100);
      if (tempRef.current) drawChart(tempRef.current, 'temp', tempSeries, '#FFB600', '°C', 5, 50);
      if (voltRef.current) drawChart(voltRef.current, 'volt', voltSeries, 'V', null, null);
      if (currRef.current) drawChart(currRef.current, 'curr', currSeries, 'A', null, null);
    }, 50);

    return () => {
      clearTimeout(timeout);
      // Clean up charts on unmount/close
      Object.keys(charts.current).forEach((key) => {
        if (charts.current[key]) {
          charts.current[key]?.destroy();
          charts.current[key] = null;
        }
      });
    };
  }, [isOpen, battery]);

  if (!isOpen || !battery) return null;

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div
        className="modal"
        style={{ maxWidth: '640px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div className="modal-title" style={{ marginBottom: '2px' }}>
              Battery {battery.id} Telemetry
            </div>
            <div style={{ fontSize: '11px', color: 'var(--ts)' }}>
              Project: {battery.project} · Tracker: {battery.trackerId} · Size: {battery.size} · Status:{' '}
              <span
                style={{
                  color:
                    battery.status === 'Healthy'
                      ? 'var(--green-l)'
                      : battery.status === 'Warning'
                      ? 'var(--gold)'
                      : 'var(--orange)',
                }}
              >
                {battery.status}
              </span>
            </div>
          </div>
          <button className="panel-close" onClick={onClose} style={{ fontSize: '20px' }}>
            ✕
          </button>
        </div>

        <div className="divider" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <div style={{ fontFamily: 'var(--fs)', fontSize: '10px', color: 'var(--ts)', marginBottom: '4px' }}>
              STATE OF CHARGE (%) - LAST 7 DAYS
            </div>
            <div style={{ height: '110px', background: 'var(--bi)', padding: '6px', borderRadius: 'var(--r)' }}>
              <canvas ref={socRef}></canvas>
            </div>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--fs)', fontSize: '10px', color: 'var(--ts)', marginBottom: '4px' }}>
              STATE OF HEALTH (%) - LAST 7 DAYS
            </div>
            <div style={{ height: '110px', background: 'var(--bi)', padding: '6px', borderRadius: 'var(--r)' }}>
              <canvas ref={sohRef}></canvas>
            </div>
          </div>

          <div>
            <div style={{ fontFamily: 'var(--fs)', fontSize: '10px', color: 'var(--ts)', marginBottom: '4px' }}>
              TEMPERATURE (°C) - LAST 7 DAYS
            </div>
            <div style={{ height: '110px', background: 'var(--bi)', padding: '6px', borderRadius: 'var(--r)' }}>
              <canvas ref={tempRef}></canvas>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <div style={{ fontFamily: 'var(--fs)', fontSize: '10px', color: 'var(--ts)', marginBottom: '4px' }}>
                VOLTAGE (V)
              </div>
              <div style={{ height: '90px', background: 'var(--bi)', padding: '6px', borderRadius: 'var(--r)' }}>
                <canvas ref={voltRef}></canvas>
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'var(--fs)', fontSize: '10px', color: 'var(--ts)', marginBottom: '4px' }}>
                CURRENT (A)
              </div>
              <div style={{ height: '90px', background: 'var(--bi)', padding: '6px', borderRadius: 'var(--r)' }}>
                <canvas ref={currRef}></canvas>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ marginTop: '20px' }}>
          <button className="btn btn-sec" onClick={onClose}>
            Close Telemetry
          </button>
        </div>
      </div>
    </div>
  );
};

export default BatteryTelemetryModal;
