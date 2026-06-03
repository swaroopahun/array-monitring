import React from 'react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  body: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  body,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay open" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{title}</div>
        <div className="modal-body">{body}</div>
        <div className="modal-footer">
          <button className="btn btn-sec" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Execute
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
