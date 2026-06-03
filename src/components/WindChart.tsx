import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

const WindChart: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    const windSpeed = [
      8, 9, 10, 9, 8, 9, 10, 11, 12, 10, 9, 10, 11, 12, 15, 10, 8, 9, 10, 11, 9, 8, 7, 9,
    ];
    const windDir = [
      45, 60, 75, 90, 120, 140, 160, 180, 200, 220, 240, 260, 280, 300, 320, 340, 10, 30, 50, 70,
      90, 110, 130, 150,
    ];

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            data: windSpeed,
            borderColor: '#4FC3F7',
            borderWidth: 3,
            tension: 0.45,
            pointRadius: 0,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        layout: {
          padding: { left: 10, right: 10, top: 10, bottom: 0 },
        },
        scales: {
          y: {
            min: 6,
            max: 16,
            ticks: {
              color: 'rgba(255,255,255,0.6)',
              font: { size: 10 },
            },
            title: {
              display: true,
              text: 'Speed (mph)',
              color: 'rgba(255,255,255,0.6)',
              font: { size: 11 },
            },
            grid: {
              color: 'rgba(255,255,255,0.05)',
            },
          },
          x: {
            ticks: {
              color: 'rgba(255,255,255,0.5)',
              font: { size: 10 },
              maxRotation: 45,
              minRotation: 45,
            },
            grid: {
              display: false,
            },
          },
        },
      },
      plugins: [
        {
          id: 'windArrows',
          afterDatasetsDraw(chart) {
            const { ctx } = chart;
            const meta = chart.getDatasetMeta(0);

            ctx.save();
            ctx.fillStyle = '#4FC3F7';

            meta.data.forEach((point, i) => {
              const angle = (windDir[i] * Math.PI) / 180;

              ctx.save();
              ctx.translate(point.x, point.y);
              ctx.rotate(angle);

              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(-6, -4);
              ctx.lineTo(-6, 4);
              ctx.closePath();
              ctx.fill();

              ctx.restore();
            });

            ctx.restore();
          },
        },
      ],
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div style={{ height: '180px', position: 'relative' }}>
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default WindChart;
