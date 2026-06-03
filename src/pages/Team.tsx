import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { TEAM } from '../data/mockData';
import InviteModal from '../components/InviteModal';

const Team: React.FC = () => {
  const { addToast } = useApp();
  const [inviteOpen, setInviteOpen] = useState(false);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      online: 'b-online',
      away: 'b-warning',
      offline: 'b-offline',
    };
    return (
      <span className={`badge ${badges[status] || 'b-info'}`} style={{ marginTop: '8px' }}>
        <span className="bdot"></span>
        {status}
      </span>
    );
  };

  return (
    <div className="page active" id="page-team">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div className="sec-title">Team</div>
        <button className="btn btn-pri" onClick={() => setInviteOpen(true)}>
          + Invite Member
        </button>
      </div>

      <div className="team-grid">
        {TEAM.map((t) => (
          <div className="team-card" key={t.name}>
            <div className="team-av">{t.init}</div>
            <div className="team-name">{t.name}</div>
            <div className="team-role">{t.role}</div>
            <div className="team-proj">{t.project}</div>
            <div>{getStatusBadge(t.status)}</div>
            <div style={{ marginTop: '12px', display: 'flex', gap: '6px', justifyContent: 'center' }}>
              <button
                className="btn btn-sec btn-sm"
                onClick={() => addToast('💬', `Messaging ${t.name}...`, 'info')}
              >
                Message
              </button>
              <button
                className="btn btn-sky btn-sm"
                onClick={() => addToast('👤', `Opening Profile: ${t.name}`, 'info')}
              >
                Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      <InviteModal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
};

export default Team;
