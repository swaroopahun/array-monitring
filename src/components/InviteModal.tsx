import React, { useState } from 'react';
import { PROJECTS } from '../data/mockData';
import { useApp } from '../context/AppContext';

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InviteModal: React.FC<InviteModalProps> = ({ isOpen, onClose }) => {
  const { addToast } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Operations Manager');
  const [assignedProj, setAssignedProj] = useState(PROJECTS[0]?.name || '');

  if (!isOpen) return null;

  const handleSend = () => {
    if (!name || !email) {
      addToast('❌', 'Please fill in Name and Email fields', 'warning');
      return;
    }
    addToast('📧', `Invitation sent to ${email}`, 'success');
    setName('');
    setEmail('');
    onClose();
  };

  return (
    <div className="modal-overlay open" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">Invite Team Member</div>
        <div className="modal-body" style={{ marginBottom: 0 }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maria Santos"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Role</label>
            <select
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option>Operations Manager</option>
              <option>Field Engineer</option>
              <option>Analyst</option>
              <option>Read Only</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Assign Project</label>
            <select
              className="form-input"
              value={assignedProj}
              onChange={(e) => setAssignedProj(e.target.value)}
            >
              {PROJECTS.map((p) => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="modal-footer" style={{ marginTop: '16px' }}>
          <button className="btn btn-sec" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-pri" onClick={handleSend}>
            Send Invite
          </button>
        </div>
      </div>
    </div>
  );
};

export default InviteModal;
