import React from 'react';

function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, type = 'delete' }) {
    if (!isOpen) return null;

    const getButtonClass = () => {
        switch (type) {
            case 'done':
                return 'confirm-button-done';
            case 'progress':
                return 'confirm-button-progress';
            default:
                return '';
        }
    };

    return (
        <div className="confirm-dialog-overlay">
            <div className="confirm-dialog">
                <h3>{title}</h3>
                <p>{message}</p>
                <div className="confirm-dialog-actions">
                    <button onClick={onClose} className="cancel-button">Cancel</button>
                    <button
                        onClick={onConfirm}
                        className={`confirm-button ${getButtonClass()}`}
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmDialog; 