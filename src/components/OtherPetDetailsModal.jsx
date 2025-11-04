import React, { useState, useMemo, useEffect } from "react";
import { getPetPixelArt } from "../utils/pixelArt";
import { subscribeToPetById, subscribeToUserPets } from "../services/petService";
import { getPetStatus } from "../services/petActionService";
import {
  performSharedPetAction,
  checkSharedCooldown,
  getInteractorId,
  getSharedActions,
} from "../services/sharedPetService";
import {
  performPlayDate,
  checkPlayDateCooldown,
} from "../services/playDateService";
import PlayDateModal from "./PlayDateModal";
import CustomSelect from "./CustomSelect";
import "./styles/OtherPetDetailsModal.css";

export default function OtherPetDetailsModal({ pet, onClose, user }) {
  const [currentPet, setCurrentPet] = useState(pet);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [userPets, setUserPets] = useState([]);
  const [selectedUserPet, setSelectedUserPet] = useState("");
  const [playDateCooldown, setPlayDateCooldown] = useState(0);
  const [playDateLoading, setPlayDateLoading] = useState(false);
  const [playDateResult, setPlayDateResult] = useState(null);
  const interactorId = getInteractorId();

  // Subscribe to user's pets for play date selection
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToUserPets(user.uid, (pets, err) => {
      if (err) {
        console.error("Error loading user pets:", err);
        return;
      }
      setUserPets(pets);
      // Auto-select first pet if available
      if (pets.length > 0 && !selectedUserPet) {
        setSelectedUserPet(pets[0].id);
      }
    });

    return () => unsubscribe();
  }, [user, selectedUserPet]);

  // Subscribe to real-time updates for this pet
  // Only subscribe if sharing is enabled to avoid permission issues
  useEffect(() => {
    if (!currentPet.sharingEnabled) {
      // No real-time updates for non-shared pets
      return;
    }

    // Use shareableId subscription for shared pets to respect permissions
    if (!currentPet.shareableId) {
      return;
    }

    const unsubscribe = subscribeToPetById(pet.id, (updatedPet, err) => {
      if (err) {
        console.error("Error subscribing to pet:", err);
        // Don't update state on error to avoid crashes
        return;
      }
      if (updatedPet) {
        setCurrentPet(updatedPet);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [pet.id, currentPet.sharingEnabled, currentPet.shareableId]);

  // Cooldown timer for shared actions
  useEffect(() => {
    if (!currentPet) return;

    const updateCooldown = async () => {
      if (currentPet.sharingEnabled) {
        const cooldownStatus = await checkSharedCooldown(currentPet.id, interactorId);
        setCooldownRemaining(cooldownStatus.remainingSeconds);
      }
    };

    // Update immediately
    updateCooldown();

    // Update every second if on cooldown
    const interval = setInterval(updateCooldown, 1000);

    return () => clearInterval(interval);
  }, [currentPet, interactorId, lastAction]);

  // Play date cooldown timer
  useEffect(() => {
    if (!user) return;

    const updatePlayDateCooldown = async () => {
      const cooldownStatus = await checkPlayDateCooldown(user.uid);
      setPlayDateCooldown(cooldownStatus.remainingSeconds);
    };

    // Update immediately
    updatePlayDateCooldown();

    // Update every second if on cooldown
    const interval = setInterval(updatePlayDateCooldown, 1000);

    return () => clearInterval(interval);
  }, [user, playDateResult]);

  const PixelArtComponent = getPetPixelArt(currentPet.species);
  const petStatus = useMemo(() => getPetStatus(currentPet), [currentPet]);
  const availableActions = getSharedActions();

  // Convert userPets to options format for CustomSelect
  const petOptions = useMemo(() => {
    return userPets.map((pet) => ({
      value: pet.id,
      label: `${pet.name} (${pet.species})`,
    }));
  }, [userPets]);

  const handleAction = async (actionType) => {
    if (!currentPet.sharingEnabled) {
      setError("Interactions are disabled for this pet.");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      setLastAction(null);

      // Use the shareableId to perform the action
      const result = await performSharedPetAction(
        currentPet.shareableId,
        interactorId,
        actionType
      );

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

  const handlePlayDate = async () => {
    if (!selectedUserPet) {
      setError("Please select one of your pets for the play date.");
      return;
    }

    if (!user) {
      setError("You must be logged in to go on a play date.");
      return;
    }

    try {
      setPlayDateLoading(true);
      setError(null);

      const result = await performPlayDate(
        selectedUserPet,
        currentPet.id,
        user.uid
      );

      setPlayDateResult(result);
    } catch (err) {
      console.error("Error performing play date:", err);
      setError(err.message || "Failed to go on play date. Please try again.");
    } finally {
      setPlayDateLoading(false);
    }
  };

  const formatCooldownTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content other-pet-details-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{currentPet.name}</h2>
            <p className="pet-species">{currentPet.species}</p>
            {currentPet.ownerEmail && (
              <p className="pet-owner">Owner: {currentPet.ownerEmail}</p>
            )}
          </div>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="pet-details-body">
          {/* Pet Avatar and Status */}
          <div className="pet-avatar-section">
            {PixelArtComponent && (
              <div className="pet-avatar">
                <PixelArtComponent stage={currentPet.stage || 1} />
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
              <strong>Thank you for interacting with {currentPet.name}!</strong>
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
            </div>
          </div>

          {/* Interactions Section */}
          {currentPet.sharingEnabled ? (
            <div className="actions-section">
              <div className="actions-header">
                <h3>Interact with {currentPet.name}</h3>
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
                You can interact with {currentPet.name} once every 10 minutes
              </p>
            </div>
          ) : (
            <div className="interactions-disabled">
              <p>Interactions are currently disabled for this pet.</p>
              <p>You can view {currentPet.name}'s stats, but cannot interact with them.</p>
            </div>
          )}

          {/* Play Date Section */}
          {user && currentPet.userId !== user.uid && (
            <div className="playdate-section">
              <h3>Go on a Play Date! 🎉</h3>
              <p className="playdate-description">
                Select one of your pets to go on an adventure with {currentPet.name}!
              </p>

              {userPets.length === 0 ? (
                <div className="no-pets-message">
                  <p>You need to add a pet first before going on a play date.</p>
                </div>
              ) : (
                <div className="playdate-controls">
                  <div className="pet-selector">
                    <label htmlFor="user-pet-select">Choose your pet:</label>
                    <CustomSelect
                      id="user-pet-select"
                      name="selectedPet"
                      value={selectedUserPet}
                      onChange={(e) => setSelectedUserPet(e.target.value)}
                      options={petOptions}
                      placeholder="Select your pet..."
                      disabled={playDateLoading || playDateCooldown > 0}
                    />
                  </div>

                  <button
                    className={`btn btn-playdate ${playDateCooldown > 0 ? "btn-cooldown" : ""}`}
                    onClick={handlePlayDate}
                    disabled={playDateLoading || playDateCooldown > 0 || !selectedUserPet}
                  >
                    {playDateLoading ? "Planning..." : "Go on Play Date! 🎈"}
                  </button>

                  {playDateCooldown > 0 && (
                    <div className="playdate-cooldown-info">
                      ⏱️ Next play date available in: {formatCooldownTime(playDateCooldown)}
                    </div>
                  )}

                  <p className="playdate-cooldown-note">
                    Play dates have a 6-hour cooldown
                  </p>
                </div>
              )}
            </div>
          )}

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
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>

      {playDateResult && (
        <PlayDateModal
          playDateResult={playDateResult}
          onClose={() => setPlayDateResult(null)}
        />
      )}
    </div>
  );
}

