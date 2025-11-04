import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { togglePetSharing } from "../services/petService";
import { getInteractionCount } from "../services/sharedPetService";
import "./styles/SharePetModal.css";

export default function SharePetModal({ pet, onClose, onSharingToggled }) {
  const [sharingEnabled, setSharingEnabled] = useState(pet.sharingEnabled || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [interactionStats, setInteractionStats] = useState(null);

  const shareUrl = `${window.location.origin}/shared-pet/${pet.shareableId}`;

  useEffect(() => {
    // Load interaction stats
    const loadStats = async () => {
      try {
        const stats = await getInteractionCount(pet.id);
        setInteractionStats(stats);
      } catch (err) {
        console.error("Error loading interaction stats:", err);
      }
    };

    if (pet.sharingEnabled) {
      loadStats();
    }
  }, [pet.id, pet.sharingEnabled]);

  const handleToggleSharing = async () => {
    try {
      setLoading(true);
      setError(null);
      const newState = !sharingEnabled;
      await togglePetSharing(pet.id, newState);
      setSharingEnabled(newState);
      
      if (onSharingToggled) {
        onSharingToggled();
      }
    } catch (err) {
      console.error("Error toggling sharing:", err);
      setError("Failed to toggle sharing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      // Try modern clipboard API first
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for older browsers or non-HTTPS contexts
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error('Fallback copy failed:', err);
          alert('Unable to copy. Please copy the link manually.');
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Unable to copy. Please copy the link manually.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content share-pet-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Share {pet.name}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="share-modal-body">
          {error && <div className="error-message">{error}</div>}

          <div className="sharing-toggle-section">
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={sharingEnabled}
                onChange={handleToggleSharing}
                disabled={loading}
              />
              <span className="toggle-text">
                {sharingEnabled ? "Sharing Enabled" : "Sharing Disabled"}
              </span>
            </label>
            <p className="toggle-description">
              {sharingEnabled
                ? "Anyone with the link or QR code can interact with your pet"
                : "Enable sharing to generate a QR code and shareable link"}
            </p>
          </div>

          {sharingEnabled && (
            <>
              <div className="qr-code-section">
                <div className="qr-code-container">
                  <QRCodeSVG
                    value={shareUrl}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p className="qr-code-description">
                  Scan this QR code to interact with {pet.name}
                </p>
              </div>

              <div className="share-link-section">
                <label className="share-link-label">Shareable Link:</label>
                <div className="share-link-input-group">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="share-link-input"
                  />
                  <button
                    className="btn btn-primary copy-btn"
                    onClick={handleCopyLink}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>
              </div>

              {interactionStats && (
                <div className="interaction-stats">
                  <h3>Interaction Stats</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <span className="stat-icon">👥</span>
                      <span className="stat-value">{interactionStats.uniqueInteractors}</span>
                      <span className="stat-label">Unique Visitors</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-icon">🎯</span>
                      <span className="stat-value">{interactionStats.totalInteractions}</span>
                      <span className="stat-label">Total Interactions</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="sharing-info">
                <p className="info-text">
                  <strong>Note:</strong> Visitors can give your pet love (❤️) and treats (🦴).
                  Each person has their own 10-minute cooldown between interactions.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

