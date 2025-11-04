import React, { useState, useMemo, useEffect } from "react";
import { getPetPixelArt } from "../utils/pixelArt";
import { subscribeToPetById } from "../services/petService";
import {
  performPetAction,
  getAvailableActions,
  getPetStatus,
  checkCooldown,
} from "../services/petActionService";
import { getInteractionCount } from "../services/sharedPetService";
import SharePetModal from "./SharePetModal";
import "./styles/PetDetailsModal.css";

export default function PetDetailsModal({ pet, onClose, onPetUpdated }) {
  const [currentPet, setCurrentPet] = useState(pet);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [interactionStats, setInteractionStats] = useState(null);

  // Subscribe to real-time updates for this pet
  useEffect(() => {
    const unsubscribe = subscribeToPetById(pet.id, (updatedPet, err) => {
      if (err) {
        console.error("Error subscribing to pet:", err);
        return;
      }
      setCurrentPet(updatedPet);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [pet.id]);

  // Load interaction stats
  useEffect(() => {
    const loadStats = async () => {
      if (currentPet.sharingEnabled) {
        try {
          const stats = await getInteractionCount(currentPet.id);
          setInteractionStats(stats);
        } catch (err) {
          console.error("Error loading interaction stats:", err);
        }
      }
    };

    loadStats();
  }, [currentPet.id, currentPet.sharingEnabled]);

  // Cooldown timer
  useEffect(() => {
    const updateCooldown = () => {
      const cooldownStatus = checkCooldown(currentPet);
      setCooldownRemaining(cooldownStatus.remainingSeconds);
    };

    // Update immediately
    updateCooldown();

    // Update every second if on cooldown
    const interval = setInterval(updateCooldown, 1000);

    return () => clearInterval(interval);
  }, [currentPet, currentPet.lastActionAt]);

  // Use useMemo to ensure these recalculate when currentPet changes
  const PixelArtComponent = getPetPixelArt(currentPet.species);
  const availableActions = useMemo(() => getAvailableActions(currentPet), [currentPet]);
  const petStatus = useMemo(() => getPetStatus(currentPet), [currentPet]);

  const handleClose = () => {
    // Notify parent to refresh pet list when modal closes
    if (onPetUpdated) {
      onPetUpdated();
    }
    onClose();
  };

  const handleSharingToggled = async () => {
    // Real-time listener will update currentPet automatically
    // Just reload interaction stats
    if (currentPet.sharingEnabled) {
      const stats = await getInteractionCount(currentPet.id);
      setInteractionStats(stats);
    }
  };

  const handleAction = async (actionType) => {
    try {
      setLoading(true);
      setError(null);
      setLastAction(null);

      const result = await performPetAction(currentPet.id, actionType);

      // Real-time listener will update currentPet automatically
      setLastAction({
        type: actionType,
        effects: result.effects,
      });
    } catch (err) {
      console.error("Error performing action:", err);
      setError(err.message || "Failed to perform action. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatColor = (value) => {
    if (value >= 70) return "stat-good";
    if (value >= 40) return "stat-okay";
    if (value >= 20) return "stat-low";
    return "stat-critical";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "excellent":
        return "status-excellent";
      case "happy":
        return "status-happy";
      case "okay":
        return "status-okay";
      case "unhappy":
        return "status-unhappy";
      case "critical":
        return "status-critical";
      default:
        return "";
    }
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content pet-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{currentPet.name}</h2>
            <p className="pet-species">{currentPet.species}</p>
          </div>
          <button className="modal-close" onClick={handleClose}>
            ×
          </button>
        </div>

        <div className="pet-details-body">
          {/* Pet Avatar and Status */}
          <div className="pet-avatar-section">
            {PixelArtComponent && (
              <div className="pet-avatar">
                <PixelArtComponent />
              </div>
            )}
            <div className={`pet-status-badge ${getStatusColor(petStatus.status)}`}>
              {petStatus.message}
            </div>
          </div>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Last Action Feedback */}
          {lastAction && (
            <div className="action-feedback">
              <strong>Action performed!</strong>
              <div className="action-effects">
                {Object.entries(lastAction.effects).map(([stat, value]) => (
                  <span key={stat} className={value > 0 ? "effect-positive" : "effect-negative"}>
                    {stat}: {value > 0 ? "+" : ""}{value}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stats Section */}
          <div className="stats-section">
            <h3>Stats</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <div className="stat-header">
                  <span className="stat-icon">🍖</span>
                  <span className="stat-name">Fullness</span>
                  <span className="stat-value">{currentPet.fullness || 50}/100</span>
                </div>
                <div className="stat-bar">
                  <div
                    className={`stat-bar-fill ${getStatColor(currentPet.fullness || 50)}`}
                    style={{ width: `${currentPet.fullness || 50}%` }}
                  ></div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-header">
                  <span className="stat-icon">😊</span>
                  <span className="stat-name">Happiness</span>
                  <span className="stat-value">{currentPet.happiness || 50}/100</span>
                </div>
                <div className="stat-bar">
                  <div
                    className={`stat-bar-fill ${getStatColor(currentPet.happiness || 50)}`}
                    style={{ width: `${currentPet.happiness || 50}%` }}
                  ></div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-header">
                  <span className="stat-icon">✨</span>
                  <span className="stat-name">Cleanliness</span>
                  <span className="stat-value">{currentPet.cleanliness || 50}/100</span>
                </div>
                <div className="stat-bar">
                  <div
                    className={`stat-bar-fill ${getStatColor(currentPet.cleanliness || 50)}`}
                    style={{ width: `${currentPet.cleanliness || 50}%` }}
                  ></div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-header">
                  <span className="stat-icon">⚡</span>
                  <span className="stat-name">Energy</span>
                  <span className="stat-value">{currentPet.energy || 50}/100</span>
                </div>
                <div className="stat-bar">
                  <div
                    className={`stat-bar-fill ${getStatColor(currentPet.energy || 50)}`}
                    style={{ width: `${currentPet.energy || 50}%` }}
                  ></div>
                </div>
              </div>

              <div className="stat-item xp-stat">
                <div className="stat-header">
                  <span className="stat-icon">⭐</span>
                  <span className="stat-name">Experience</span>
                  <span className="stat-value">{currentPet.xp || 0} XP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="actions-section">
            <div className="actions-header">
              <h3>Actions</h3>
              {cooldownRemaining > 0 && (
                <div className="cooldown-indicator">
                  ⏱️ Cooldown: {cooldownRemaining}s
                </div>
              )}
            </div>
            <div className="actions-grid">
              {availableActions.map((action) => (
                <button
                  key={action.type}
                  className={`action-btn ${action.urgent ? "action-urgent" : ""} ${cooldownRemaining > 0 ? "action-cooldown" : ""}`}
                  onClick={() => handleAction(action.type)}
                  disabled={loading || action.disabled || cooldownRemaining > 0}
                  title={
                    cooldownRemaining > 0
                      ? `Please wait ${cooldownRemaining} seconds`
                      : action.disabled
                      ? "Cannot perform this action right now"
                      : action.description
                  }
                >
                  <span className="action-icon">{action.icon}</span>
                  <span className="action-name">{action.name}</span>
                  {action.urgent && cooldownRemaining === 0 && <span className="urgent-indicator">!</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Pet Info Section */}
          <div className="pet-info-section">
            <h3>Details</h3>
            <div className="pet-info-grid">
              {currentPet.breed && (
                <div className="info-item">
                  <strong>Breed:</strong> {currentPet.breed}
                </div>
              )}
              {currentPet.age && (
                <div className="info-item">
                  <strong>Age:</strong> {currentPet.age}
                </div>
              )}
              {currentPet.color && (
                <div className="info-item">
                  <strong>Color:</strong> {currentPet.color}
                </div>
              )}
              {currentPet.notes && (
                <div className="info-item full-width">
                  <strong>Notes:</strong> {currentPet.notes}
                </div>
              )}
            </div>
          </div>

          {/* Sharing Section */}
          <div className="sharing-section">
            <button
              className="btn btn-primary share-btn"
              onClick={() => setShowShareModal(true)}
            >
              🔗 Share Pet
            </button>
            {interactionStats && interactionStats.uniqueInteractors > 0 && (
              <p className="interaction-count">
                {interactionStats.uniqueInteractors} {interactionStats.uniqueInteractors === 1 ? 'person has' : 'people have'} interacted with {currentPet.name}
              </p>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>
            Close
          </button>
        </div>
      </div>

      {showShareModal && (
        <SharePetModal
          pet={currentPet}
          onClose={() => setShowShareModal(false)}
          onSharingToggled={handleSharingToggled}
        />
      )}
    </div>
  );
}

