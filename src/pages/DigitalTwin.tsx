import React, { useState, useMemo } from 'react';
import { PROJECTS, genDevices } from '../data/mockData';
import MapWidget from '../components/MapWidget';
import { useApp } from '../context/AppContext';

const DigitalTwin: React.FC = () => {
  const { addToast } = useApp();
  const [selectedProj, setSelectedProj] = useState('');

  const selectedProjects = useMemo(
    () => (selectedProj === '' ? PROJECTS : PROJECTS.filter((p) => p.name === selectedProj)),
    [selectedProj]
  );

  const markers = useMemo(
    () =>
      selectedProjects.flatMap((project) =>
        genDevices(project).map((device) => ({
          id: device.id,
          lat: device.lat,
          lng: device.lng,
          name: device.id,
          info: `${device.type} • ${device.status}`,
          status: device.status as 'online' | 'warning' | 'offline',
        }))
      ),
    [selectedProjects]
  );

  return (
    <div className="page active" id="page-digitaltwin">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <div className="sec-title">Map / Digital Twin</div>
          <div className="sec-sub">View live device locations, operational status, and asset relationships on a unified map.</div>
        </div>
        <select
          className="fsel"
          value={selectedProj}
          onChange={(e) => setSelectedProj(e.target.value)}
        >
          <option value="">All Projects</option>
          {PROJECTS.map((project) => (
            <option key={project.id} value={project.name}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <div className="g2" style={{ gap: '14px', marginBottom: '14px' }}>
        <div className="kpi kpi-sky">
          <div className="kpi-bg">🛰️</div>
          <div className="kpi-lbl">Assets Tracked</div>
          <div className="kpi-val">{markers.length}</div>
          <div className="kpi-delta up">Realtime location updates</div>
        </div>
        <div className="kpi kpi-green">
          <div className="kpi-bg">📍</div>
          <div className="kpi-lbl">Active Sites</div>
          <div className="kpi-val">{selectedProjects.length}</div>
          <div className="kpi-delta up">Digitally modeled</div>
        </div>
      </div>

      <div className="card" style={{ padding: '0' }}>
        <MapWidget
          center={[-12, -50]}
          zoom={4}
          markers={markers}
          height="520px"
          onMarkerClick={(id) => addToast('📌', `Viewed digital twin marker ${id}`, 'info')}
        />
      </div>

      <div className="card" style={{ marginTop: '14px' }}>
        <div className="card-hdr">
          <div className="card-title">Digital Twin Summary</div>
        </div>
        <div className="grid-3" style={{ gap: '12px' }}>
          <div className="info-card">
            <div className="info-title">Mapped Devices</div>
            <div className="info-value">{markers.length}</div>
            <div className="info-meta">Includes TCU/NCU, sensors, and gateway nodes.</div>
          </div>
          <div className="info-card">
            <div className="info-title">Fastest Sync</div>
            <div className="info-value">{markers.length ? '5 sec' : 'N/A'}</div>
            <div className="info-meta">Latest asset updates reflected on the map.</div>
          </div>
          <div className="info-card">
            <div className="info-title">Model Fidelity</div>
            <div className="info-value">High</div>
            <div className="info-meta">Topology and operational layers enabled.</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalTwin;
