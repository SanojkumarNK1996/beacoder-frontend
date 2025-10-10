import React from 'react';

const ToastNotification = ({ message, isVisible, onClose }) => {
    if (!isVisible) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#367cfe',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'opacity 0.5s',
            opacity: isVisible ? 1 : 0,
            zIndex: 1000,
        }}>
            {message}
            <button onClick={onClose} style={{
                marginLeft: '10px',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
            }}>
                Close
            </button>
        </div>
    );
};

export default ToastNotification;