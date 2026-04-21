import React from "react";

const TopicNotesPopup = ({ onClose, onDownload, topicName, notesData, loading, error }) => {
  return (
    <div className="notes-popup-overlay" onClick={onClose}>
      <div className="notes-popup-panel" onClick={e => e.stopPropagation()}>
        <button className="notes-popup-close" onClick={onClose} aria-label="Close notes popup">
          ×
        </button>

        <div className="notes-popup-header">
          <div>
            <p className="notes-popup-label">Topic Notes</p>
            <h2>{topicName}</h2>
          </div>
          <button className="notes-download-button" onClick={onDownload} disabled={loading || notesData.length === 0}>
            Download as PDF
          </button>
        </div>

        {loading ? (
          <div className="notes-popup-loading">Loading notes...</div>
        ) : error ? (
          <div className="notes-popup-error">{error}</div>
        ) : notesData.length === 0 ? (
          <div className="notes-popup-empty">No notes available for this topic.</div>
        ) : (
          <div className="notes-popup-list">
            {notesData.map(note => (
              <div className="notes-card" key={note.id}>
                <div className="notes-card-subtopic">{note.subtopic}</div>
                <div className="notes-card-text">{note.notes}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TopicNotesPopup;
