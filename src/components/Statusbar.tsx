import React, { useState, useEffect } from 'react';

const Statusbar: React.FC = () => {
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const formatted = new Date().toLocaleTimeString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
      setTime(formatted);
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="statusbar">
      <div className="sb-item">
        <div className="sb-dot" style={{ background: 'var(--green-l)' }}></div>
        All systems operational
      </div>
      <div className="sb-item">
        <div className="sb-dot" style={{ background: 'var(--sky)' }}></div>
        Data stream live
      </div>
      <div className="sb-item">
        Last sync: <span style={{ color: '#fff', marginLeft: '4px' }}>just now</span>
      </div>
      <div className="sb-item" style={{ marginLeft: '12px' }}>
        São Paulo Time: <span id="clock" style={{ color: '#fff', marginLeft: '4px' }}>{time}</span>
      </div>
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px' }}>
        <span>© 2026 Portal</span>
        <span style={{ color: 'var(--gold)' }}>v1.0.0-MVP</span>
      </div>
    </div>
  );
};

export default Statusbar;
