import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PROJECTS, genDevices, Device } from '../data/mockData';
import MapWidget from '../components/MapWidget';
import DevicePanel from '../components/DevicePanel';
import ConfirmModal from '../components/ConfirmModal';

const FieldView: React.FC = () => {
  const { addToast } = useApp();
  const [selectedProjName, setSelectedProjName] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Drawer slider state
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Command state
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; title: string; body: string; onConfirm: () => void } | null>(null);

  // Load devices for selected project (or first project as default if all)
  const currentProjects = selectedProjName
    ? PROJECTS.filter((p) => p.name === selectedProjName)
    : PROJECTS;

  // Flatten devices for the map markers
  const allDevices: Device[] = currentProjects.flatMap((p) => genDevices(p));

  const mapMarkers = [
    ...currentProjects.map((p) => ({
      id: `P-${p.id}`,
      lat: p.lat,
      lng: p.lng,
      name: p.name,
      info: `${p.loc} · ${p.mw} MW Capacity`,
      status: p.status,
    })),
    ...allDevices.slice(0, 50).map((d) => ({
      id: `D-${d.id}`,
      lat: d.lat,
      lng: d.lng,
      name: d.id,
      info: `Type: ${d.type} · Angle: ${d.angle}° · ${d.status}`,
      status: d.status,
    })),
  ];

  const handleMarkerClick = (markerId: string) => {
    if (markerId.startsWith('D-')) {
      const devId = markerId.slice(2);
      const dev = allDevices.find((d) => d.id === devId);
      if (dev) {
        setSelectedDevice(dev);
        setIsDrawerOpen(true);
      }
    }
  };

  const handleCommandTrigger = (cmd: string, target: string) => {
    setConfirmModal({
      isOpen: true,
      title: `Confirm: ${cmd}`,
      body: `Confirm command "${cmd}" on target device ${target}?`,
      onConfirm: () => {
        addToast('⚡', `${cmd} executed successfully on ${target}`, 'success');
        setConfirmModal(null);
      },
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      online: 'b-online',
      warning: 'b-warning',
      offline: 'b-offline',
    };
    return (
      <span className={`badge ${badges[status] || 'b-info'}`}>
        <span className="bdot"></span>
        {status}
      </span>
    );
  };

  return (
    <div className="page active" id="page-fieldview">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <div className="sec-title">Global Field View</div>
          <div className="sec-sub">Track active nodes topology mapping</div>
        </div>
        
        {/* Toggle between map and list */}
        <div className="view-toggle">
          <div
            className={`vt-btn ${viewMode === 'map' ? 'active' : ''}`}
            onClick={() => setViewMode('map')}
          >
            Map Grid
          </div>
          <div
            className={`vt-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            Hardware List
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <select
          className="fsel"
          value={selectedProjName}
          onChange={(e) => setSelectedProjName(e.target.value)}
        >
          <option value="">All Projects</option>
          {PROJECTS.map((p) => (
            <option key={p.id} value={p.name}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Content views */}
      {viewMode === 'map' ? (
        <div className="card" id="fv-map-view">
          <MapWidget
            center={[-12, -50]}
            zoom={4}
            markers={mapMarkers}
            onMarkerClick={handleMarkerClick}
            height="420px"
          />
        </div>
      ) : (
        <div className="card" id="fv-list-view">
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Device ID</th>
                  <th>Serial Key</th>
                  <th>Device Type</th>
                  <th>Last Seen</th>
                  <th>Current Angle</th>
                  <th>Connected NCU</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {allDevices.slice(0, 100).map((d) => (
                  <tr key={d.id} onClick={() => { setSelectedDevice(d); setIsDrawerOpen(true); }}>
                    <td className="td-bold" style={{ color: 'var(--sky)' }}>
                      {d.id}
                    </td>
                    <td className="td-mono">{d.serial}</td>
                    <td className="td-mono">{d.type}</td>
                    <td className="td-mono">{d.lastSeen}</td>
                    <td className="td-gold" style={{ fontFamily: 'var(--fh)' }}>
                      {d.angle}°
                    </td>
                    <td className="td-mono">{d.ncu}</td>
                    <td>{getStatusBadge(d.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drawer and Commands Confirm modals */}
      {selectedDevice && (
        <DevicePanel
          isOpen={isDrawerOpen}
          device={selectedDevice}
          onClose={() => setIsDrawerOpen(false)}
          onCommand={handleCommandTrigger}
        />
      )}

      {confirmModal && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          body={confirmModal.body}
          onCancel={() => setConfirmModal(null)}
          onConfirm={confirmModal.onConfirm}
        />
      )}
    </div>
  );
};

export default FieldView;
