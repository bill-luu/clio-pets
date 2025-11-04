import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { getPetPixelArt } from "../utils/pixelArt";
import { getPetStatus } from "../services/petActionService";
import {
  subscribeToPetByShareableId,
  performSharedPetAction,
  checkSharedCooldown,
  getInteractorId,
  getSharedActions,
} from "../services/sharedPetService";
import "./styles/SharedPetView.css";

export default function SharedPetView() {
  const { shareableId } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [lastAction, setLastAction] = useState(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const interactorId = getInteractorId();

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Subscribe to real-time updates for this shared pet
    const unsubscribe = subscribeToPetByShareableId(shareableId, (petData, err) => {
      if (err) {
        console.error("Error loading pet:", err);
        setError(err.message || "Failed to load pet. The link may be invalid or sharing may be disabled.");
        setLoading(false);
        return;
      }
      setPet(petData);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [shareableId]);

  // Cooldown timer
  useEffect(() => {
    if (!pet) return;

    const updateCooldown = async () => {
      const cooldownStatus = await checkSharedCooldown(pet.id, interactorId);
      setCooldownRemaining(cooldownStatus.remainingSeconds);
    };

    // Update immediately
    updateCooldown();

    // Update every second if on cooldown
    const interval = setInterval(updateCooldown, 1000);

    return () => clearInterval(interval);
  }, [pet, interactorId, lastAction]);

  const PixelArtComponent = pet ? getPetPixelArt(pet.species) : null;
  const petStatus = useMemo(() => pet ? getPetStatus(pet) : null, [pet]);
  const availableActions = getSharedActions();

  const handleAction = async (actionType) => {
    try {
      setActionLoading(true);
      setError(null);
      setLastAction(null);

      const result = await performSharedPetAction(shareableId, interactorId, actionType);

      // Real-time listener will update pet automatically
      setLastAction({
        type: actionType,
        effects: result.effects,
      });
    } catch (err) {
      console.error("Error performing action:", err);
      setError(err.message || "Failed to perform action. Please try again.");
    } finally {
      setActionLoading(false);
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

  if (loading) {
    return (
      <div className="shared-pet-container">
        <div className="loading">Loading pet...</div>
      </div>
    );
  }

  if (error && !pet) {
    return (
      <div className="shared-pet-container">
        <div className="error-state">
          <h2>Oops!</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shared-pet-container">
      <div className="shared-pet-card">
        <div className="shared-pet-header">
          <div className="header-content">
            <h1>{pet.name}</h1>
            <p className="pet-species">{pet.species}</p>
            <div className="shared-badge">Shared Pet</div>
          </div>
        </div>

        <div className="shared-pet-body">
          {/* Pet Avatar and Status */}
          <div className="pet-avatar-section">
            {PixelArtComponent && (
              <div className="pet-avatar">
                <PixelArtComponent stage={pet.stage || 1} />
              </div>
            )}
            {petStatus && (
              <div className={`pet-status-badge ${getStatusColor(petStatus.status)}`}>
                {petStatus.message}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Last Action Feedback */}
          {lastAction && (
            <div className="action-feedback">
              <strong>Thank you for interacting with {pet.name}!</strong>
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
                  <span className="stat-value">{pet.fullness || 50}/100</span>
                </div>
                <div className="stat-bar">
                  <div
                    className={`stat-bar-fill ${getStatColor(pet.fullness || 50)}`}
                    style={{ width: `${pet.fullness || 50}%` }}
                  ></div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-header">
                  <span className="stat-icon">😊</span>
                  <span className="stat-name">Happiness</span>
                  <span className="stat-value">{pet.happiness || 50}/100</span>
                </div>
                <div className="stat-bar">
                  <div
                    className={`stat-bar-fill ${getStatColor(pet.happiness || 50)}`}
                    style={{ width: `${pet.happiness || 50}%` }}
                  ></div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-header">
                  <span className="stat-icon">✨</span>
                  <span className="stat-name">Cleanliness</span>
                  <span className="stat-value">{pet.cleanliness || 50}/100</span>
                </div>
                <div className="stat-bar">
                  <div
                    className={`stat-bar-fill ${getStatColor(pet.cleanliness || 50)}`}
                    style={{ width: `${pet.cleanliness || 50}%` }}
                  ></div>
                </div>
              </div>

              <div className="stat-item">
                <div className="stat-header">
                  <span className="stat-icon">⚡</span>
                  <span className="stat-name">Energy</span>
                  <span className="stat-value">{pet.energy || 50}/100</span>
                </div>
                <div className="stat-bar">
                  <div
                    className={`stat-bar-fill ${getStatColor(pet.energy || 50)}`}
                    style={{ width: `${pet.energy || 50}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions Section */}
          <div className="actions-section">
            <div className="actions-header">
              <h3>Interact with {pet.name}</h3>
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
                  className={`action-btn ${cooldownRemaining > 0 ? "action-cooldown" : ""}`}
                  onClick={() => handleAction(action.type)}
                  disabled={actionLoading || cooldownRemaining > 0}
                  title={
                    cooldownRemaining > 0
                      ? `Please wait ${cooldownRemaining} seconds`
                      : action.description
                  }
                >
                  <span className="action-icon">{action.icon}</span>
                  <span className="action-name">{action.name}</span>
                </button>
              ))}
            </div>
            <p className="cooldown-info">
              You can interact with {pet.name} once every 10 minutes
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

