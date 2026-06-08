import React, { useState, useMemo } from 'react';
import { PROJECTS, genDevices } from '../data/mockData';
import { useApp } from '../context/AppContext';

const FirmwareControl: React.FC = () => {
  const [selectedProj, setSelectedProj] = useState('');
  const { addToast } = useApp();

  const selectedProjects = useMemo(
    () => (selectedProj === '' ? PROJECTS : PROJECTS.filter((p) => p.name === selectedProj)),
    [selectedProj]
  );

  const devices = useMemo(
    () => selectedProjects.flatMap((project) => genDevices(project).map((d) => ({ ...d, project: project.name }))),
    [selectedProjects]
  );

  const firmwareVersions = Array.from(new Set(devices.map((d) => d.firmware))).sort();

  const handleUpdateClick = (deviceId: string) => {
    addToast('⬆️', `Firmware update scheduled for ${deviceId}`, 'success');
  };

  return (
    <div className="page active" id="page-firmware">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <div className="sec-title">Firmware Control</div>
          <div className="sec-sub">Manage firmware inventories, deploy package updates, and monitor device rollout status.</div>
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

      <div className="g3" style={{ marginBottom: '14px' }}>
        <div className="kpi kpi-sky">
          <div className="kpi-bg">⚙️</div>
          <div className="kpi-lbl">Tracked Firmware Builds</div>
          <div className="kpi-val">{firmwareVersions.length}</div>
        </div>
        <div className="kpi kpi-green">
          <div className="kpi-bg">🚀</div>
          <div className="kpi-lbl">Devices Ready</div>
          <div className="kpi-val">{devices.filter((d) => d.status === 'online').length}</div>
        </div>
        <div className="kpi kpi-orange">
          <div className="kpi-bg">🕒</div>
          <div className="kpi-lbl">Pending Updates</div>
          <div className="kpi-val">{Math.max(0, devices.length - Math.floor(devices.length * 0.72))}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Firmware Deployment Queue</div>
          <div className="chip">{selectedProjects.length} Project(s)</div>
        </div>
        <div className="tbl-wrap">
          <table>
            <thead>
              <tr>
                <th>Device ID</th>
                <th>Project</th>
                <th>Status</th>
                <th>Firmware</th>
                <th>Last Seen</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {devices.slice(0, 10).map((device) => (
                <tr key={device.id}>
                  <td className="td-bold">{device.id}</td>
                  <td style={{ fontSize: '12px', color: 'var(--ts)' }}>{device.project}</td>
                  <td style={{ fontSize: '12px', color: device.status === 'online' ? '#13A34A' : device.status === 'warning' ? '#FFB600' : '#FF4444' }}>
                    {device.status}
                  </td>
                  <td style={{ fontSize: '12px' }}>{device.firmware}</td>
                  <td style={{ fontSize: '12px', color: 'var(--ts)' }}>{device.lastSeen}</td>
                  <td>
                    <button
                      className="btn btn-sm"
                      onClick={() => handleUpdateClick(device.id)}
                    >
                      Push Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FirmwareControl;
