import React from 'react';

const GanttChart: React.FC = () => {
  const segs = [
    {
      lbl: 'Autotracking',
      segs: [
        { s: 0.0, e: 0.35, cls: 'auto' },
        { s: 0.38, e: 0.65, cls: 'auto' },
        { s: 0.7, e: 1.0, cls: 'auto' },
      ],
    },
    {
      lbl: 'Wind Stow',
      segs: [
        { s: 0.35, e: 0.38, cls: 'wind' },
        { s: 0.65, e: 0.7, cls: 'wind' },
      ],
    },
  ];

  const mrows = [
    { lbl: 'Cleaning', dots: [0.62] },
    { lbl: 'Mowing', dots: [0.4] },
    { lbl: 'Snow Shed', dots: [0.18] },
  ];

  return (
    <div className="gantt-wrap">
      {/* Tracker Activity Timeline */}
      <div style={{ marginBottom: '16px' }}>
        {segs.map((row) => (
          <div key={row.lbl} className="gantt-row">
            <div className="gantt-lbl">{row.lbl}</div>
            <div className="gantt-track">
              {row.segs.map((s, idx) => (
                <div
                  key={idx}
                  className={`gantt-seg gantt-seg-${s.cls}`}
                  style={{ left: `${s.s * 100}%`, width: `${(s.e - s.s) * 100}%` }}
                />
              ))}
            </div>
          </div>
        ))}
        <div className="gantt-tick" id="gantt-ticks">
          {Array.from({ length: 13 }, (_, i) => (
            <span key={i}>{(i * 2).toString().padStart(2, '0')}:00</span>
          ))}
        </div>
      </div>

      <div className="divider" />

      {/* Maintenance Activities */}
      <div style={{ marginTop: '10px' }}>
        <div
          style={{
            fontFamily: 'var(--fs)',
            fontSize: '10px',
            letterSpacing: '1px',
            color: 'var(--ts)',
            textTransform: 'uppercase',
            marginBottom: '10px',
          }}
        >
          Scheduled Maintenance Events
        </div>
        {mrows.map((row) => (
          <div key={row.lbl} className="gantt-row">
            <div className="gantt-lbl">{row.lbl}</div>
            <div className="gantt-track">
              {row.dots.map((d, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    left: `${d * 100}%`,
                    top: '50%',
                    transform: 'translate(-50%,-50%)',
                    width: '10px',
                    height: '10px',
                    background: '#7C5CBF',
                    borderRadius: '50%',
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GanttChart;
