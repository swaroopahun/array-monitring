import React, { useEffect, useState, useRef } from 'react';

interface SolarVizProps {
  isAuto: boolean;
  manualAngle: number;
  onAngleUpdate?: (angle: number) => void;
}

const SolarViz: React.FC<SolarVizProps> = ({ isAuto, manualAngle, onAngleUpdate }) => {
  const [angle, setAngle] = useState(-28.4);
  const animRef = useRef<number | null>(null);

  // If in manual mode, mirror the manualAngle prop.
  useEffect(() => {
    if (!isAuto) {
      setAngle(manualAngle);
      if (onAngleUpdate) onAngleUpdate(manualAngle);
    }
  }, [isAuto, manualAngle, onAngleUpdate]);

  // If in auto mode, animate the dial tracking.
  useEffect(() => {
    if (!isAuto) return;

    let currentAngle = angle;
    const animate = () => {
      currentAngle += 0.05;
      if (currentAngle > 45) currentAngle = -45;
      
      const rounded = Math.round(currentAngle * 10) / 10;
      setAngle(rounded);
      if (onAngleUpdate) onAngleUpdate(rounded);
      
      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isAuto, onAngleUpdate]);

  // Calculations for SVG elements
  const t = (angle + 45) / 90; // normalize to 0..1 (West to East)
  const sunX = 20 + t * 180;
  const sunY = 148 - Math.sin(t * Math.PI) * 118;
  const targetAngle = -25; // Simulated perfect setpoint angle at current time
  const isOnSetpoint = isAuto || Math.abs(angle - targetAngle) < 5;

  const displayAngle = `${angle > 0 ? '+' : ''}${angle.toFixed(1)}° ${
    angle < 0 ? 'W' : angle > 0 ? 'E' : 'N'
  }`;

  return (
    <div className="dial-wrap" style={{ padding: '16px 8px 20px' }}>
      <svg
        id="solar-viz"
        viewBox="0 0 220 180"
        style={{
          width: '100%',
          maxWidth: '340px',
          height: 'auto',
          display: 'block',
          borderRadius: '8px',
        }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d3a5c" />
            <stop offset="100%" stopColor="#1a5c8a" />
          </linearGradient>
          <radialGradient id="sunGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFD166" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FFD166" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sky */}
        <rect width="220" height="180" fill="url(#skyGrad)" rx="8" />

        {/* Horizon */}
        <line
          x1="10"
          y1="148"
          x2="210"
          y2="148"
          stroke="rgba(255,255,255,0.15)"
          strokeWidth="1"
        />
        <rect x="10" y="148" width="200" height="24" fill="rgba(16,119,57,0.2)" rx="2" />
        <text x="18" y="144" fontFamily="Oswald,sans-serif" fontSize="8" fill="rgba(255,255,255,0.35)">
          W
        </text>
        <text x="200" y="144" fontFamily="Oswald,sans-serif" fontSize="8" fill="rgba(255,255,255,0.35)">
          E
        </text>

        {/* Sun Path */}
        <path
          d="M 20 148 Q 110 20 200 148"
          fill="none"
          stroke="rgba(255,210,50,0.2)"
          strokeWidth="1.5"
          strokeDasharray="4,4"
        />

        {/* Sun */}
        <circle id="sun-glow" cx={sunX} cy={sunY} r="22" fill="url(#sunGlow)" />
        <circle id="sun-pos" cx={sunX} cy={sunY} r="10" fill="#FFD166" />
        <g id="sun-rays" transform={`translate(${sunX},${sunY})`}>
          <line x1="0" y1="-14" x2="0" y2="-17" stroke="#FFD166" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="10" y1="-10" x2="12" y2="-12" stroke="#FFD166" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="14" y1="0" x2="17" y2="0" stroke="#FFD166" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="-10" y1="-10" x2="-12" y2="-12" stroke="#FFD166" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="-14" y1="0" x2="-17" y2="0" stroke="#FFD166" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Sunlight Angle ray */}
        <line
          id="sun-angle-line"
          x1={sunX}
          y1={sunY}
          x2="110"
          y2="130"
          stroke="rgba(255,210,50,0.3)"
          strokeWidth="1"
          strokeDasharray="3,3"
        />

        {/* Center post */}
        <line
          x1="110"
          y1="130"
          x2="110"
          y2="148"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Rotated Tracker Panel */}
        <g id="panel-group" transform={`rotate(${angle},110,130)`}>
          <rect
            x="70"
            y="125.5"
            width="80"
            height="11"
            rx="2"
            fill="#0E4A7A"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="1"
          />
          <rect x="72" y="127" width="17" height="8" rx="1" fill="#1565a8" />
          <rect x="91" y="127" width="17" height="8" rx="1" fill="#1565a8" />
          <rect x="110" y="127" width="17" height="8" rx="1" fill="#1565a8" />
          <rect x="129" y="127" width="17" height="8" rx="1" fill="#1565a8" />
          <rect x="72" y="127" width="74" height="3.5" rx="1" fill="rgba(255,255,255,0.05)" />
        </g>

        {/* Readout label */}
        <rect x="75" y="96" width="70" height="18" rx="4" fill="rgba(0,0,0,0.5)" />
        <text
          id="viz-angle-lbl"
          x="110"
          y="109"
          fontFamily="Oswald,sans-serif"
          fontSize="11"
          fill="#FFB600"
          textAnchor="middle"
          fontWeight="600"
        >
          {displayAngle}
        </text>

        {/* Target alignment status chip */}
        <rect
          id="ontarget-bg"
          x="58"
          y="12"
          width="104"
          height="16"
          rx="4"
          fill={isOnSetpoint ? 'rgba(19,163,74,0.25)' : 'rgba(255,182,0,0.2)'}
        />
        <text
          id="ontarget-lbl"
          x="110"
          y="24"
          fontFamily="Oswald,sans-serif"
          fontSize="9"
          fill={isOnSetpoint ? '#13A34A' : '#FFB600'}
          textAnchor="middle"
          letterSpacing="1"
        >
          {isOnSetpoint ? '● ON SETPOINT' : '⚠ MANUAL OVERRIDE'}
        </text>
      </svg>
      <div className="dial-label" style={{ marginTop: '12px' }}>
        Panel vs Sun Angle
      </div>
      <div className="dial-angle" id="dial-angle-val">
        {displayAngle}
      </div>
      <div className="dial-pct" id="dial-pct-val">
        {isAuto ? '97.4% Trackers On Target' : 'Manual Angle Control Active'}
      </div>
    </div>
  );
};

export default SolarViz;
