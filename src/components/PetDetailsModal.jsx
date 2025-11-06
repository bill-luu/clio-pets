import React, { useState, useMemo, useEffect } from "react";
import { getPetPixelArt } from "../utils/pixelArt";
import { subscribeToPetById, purchaseItem, useItem as consumeInventoryItem } from "../services/petService";
import {
  performPetAction,
  getAvailableActions,
  getPetStatus,
  checkCooldown,
} from "../services/petActionService";
import { formatAgeDisplay } from "../utils/petAge";
import { getProgressToNextStage, getStageLabelWithEmoji } from "../utils/petProgression";
import { getStageInfo } from "../utils/petStages";
import { getInteractionCount } from "../services/sharedPetService";
import { getStreakBonus, getStreakTierInfo } from "../utils/streakTracker";
import { getSocialBonus, getSocialTierInfo } from "../utils/socialBonus";
import { getCooldownBreakdown, formatCooldownTime } from "../utils/cooldownCalculator";
import SharePetModal from "./SharePetModal";
import "./styles/PetDetailsModal.css";

export default function PetDetailsModal({ pet, onClose, onPetUpdated, user }) {
  const [currentPet, setCurrentPet] = useState(pet);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [interactionStats, setInteractionStats] = useState(null);
  const [storeLoadingItem, setStoreLoadingItem] = useState(null);
  const [usingItemName, setUsingItemName] = useState(null);
  const [activeStoreTab, setActiveStoreTab] = useState('supplies'); // 'supplies' | 'accessories'

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
    const updateCooldown = async () => {
      const cooldownStatus = await checkCooldown(currentPet, interactionStats?.uniqueInteractors || 0);
      setCooldownRemaining(cooldownStatus.remainingSeconds);
    };

    // Update immediately
    updateCooldown();

    // Update every second if on cooldown
    const interval = setInterval(updateCooldown, 1000);

    return () => clearInterval(interval);
  }, [currentPet, currentPet.lastActionAt, interactionStats]);

  // Use useMemo to ensure these recalculate when currentPet changes
  const PixelArtComponent = getPetPixelArt(currentPet.species);
  const availableActions = useMemo(() => getAvailableActions(currentPet), [currentPet]);
  const petStatus = useMemo(() => getPetStatus(currentPet), [currentPet]);
  const progressInfo = useMemo(() => getProgressToNextStage(currentPet.xp || 0), [currentPet.xp]);
  const stageInfo = useMemo(() => getStageInfo(currentPet.stage || 1), [currentPet.stage]);
  const ageDisplay = formatAgeDisplay(currentPet.ageInYears || 0);

  // Streak and bonus information
  const streakBonus = useMemo(() => getStreakBonus(currentPet.currentStreak || 0), [currentPet.currentStreak]);
  const streakTierInfo = useMemo(() => getStreakTierInfo(streakBonus.tier), [streakBonus.tier]);
  const socialBonus = useMemo(() => getSocialBonus(interactionStats?.uniqueInteractors || 0), [interactionStats?.uniqueInteractors]);
  const socialTierInfo = useMemo(() => getSocialTierInfo(socialBonus.tier), [socialBonus.tier]);
  const cooldownBreakdown = useMemo(() => {
    if (cooldownRemaining === 0) return null;
    const effectiveCooldown = 600 - streakBonus.reductionSeconds - socialBonus.reductionSeconds;
    return getCooldownBreakdown({
      baseCooldown: 600,
      streakBonus: { seconds: streakBonus.reductionSeconds, minutes: streakBonus.reductionMinutes },
      socialBonus: { seconds: socialBonus.reductionSeconds, minutes: socialBonus.reductionMinutes },
      effectiveCooldown: effectiveCooldown,
      effectiveCooldownMinutes: Math.floor(effectiveCooldown / 60),
      hasNoCooldown: effectiveCooldown === 0,
    });
  }, [streakBonus, socialBonus, cooldownRemaining]);

  // Basic store catalog (UI only for now)
  const STORE_ITEMS = [
    { name: "Food", price: 10, icon: "🍖", desc: "Boosts fullness" },
    { name: "Toy", price: 15, icon: "🧸", desc: "Increases happiness" },
    { name: "Soap", price: 12, icon: "🧼", desc: "Improves cleanliness" },
    { name: "Energy Drink", price: 20, icon: "⚡", desc: "Restores energy" },
  ];

  // Accessories (locked unless Adult stage)
  const ACCESSORY_ITEMS = [
    { name: "Hat", price: 50, icon: "🎩", desc: "Stylish hat for your pet" },
    { name: "Umbrella", price: 40, icon: "⛱️", desc: "Keep dry in style" },
  ];

  // Items that can be consumed/used from inventory
  const USABLE_ITEM_NAMES = new Set(STORE_ITEMS.map((i) => i.name));

  const handleBuy = async (item) => {
    try {
      setStoreLoadingItem(item.name);
      setError(null);
      await purchaseItem(currentPet.id, item);
      setNotifications([`Purchased ${item.name} for ${item.price} coins!`]);
      setTimeout(() => setNotifications([]), 3000);
    } catch (err) {
      console.error("Error purchasing item:", err);
      setError(err.message || "Failed to purchase item. Please try again.");
    } finally {
      setStoreLoadingItem(null);
    }
  };

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

      const userId = user?.uid || null;
      const result = await performPetAction(currentPet.id, actionType, userId);

      // Real-time listener will update currentPet automatically
      setLastAction({
        type: actionType,
        effects: result.effects,
      });

      // Set notifications from the action result
      if (result.notifications && result.notifications.length > 0) {
        setNotifications(result.notifications);
        // Clear notifications after 5 seconds
        setTimeout(() => setNotifications([]), 5000);
      }

      // Don't notify parent immediately - it will reload and overwrite our state
      // Parent will be notified when modal closes
    } catch (err) {
      console.error("Error performing action:", err);
      setError(err.message || "Failed to perform action. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUseItem = async (itemName) => {
    try {
      setUsingItemName(itemName);
      setError(null);
      const result = await consumeInventoryItem(currentPet.id, itemName);
      const effectParts = Object.entries(result.effects)
        .filter(([_, delta]) => delta !== 0 && delta !== undefined)
        .map(([stat, delta]) => `${stat} ${delta > 0 ? "+" : ""}${delta}`);
      const details = effectParts.length ? ` (${effectParts.join(", ")})` : "";
      setNotifications([`Used ${itemName}!${details}`]);
      setTimeout(() => setNotifications([]), 3000);
    } catch (err) {
      console.error("Error using item:", err);
      setError(err.message || "Failed to use item. Please try again.");
    } finally {
      setUsingItemName(null);
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
          {/* Items Sidebar (left) */}
          <aside className="items-sidebar">
            <div className="items-header">
              <h3>Items</h3>
            </div>
            <div className="store-items">
              {/* Pet House at top */}
              <div className="store-item">
                <div className="store-item-info">
                  <span className="store-item-icon">🏠</span>
                  <div className="store-item-text">
                    <div className="store-item-name">House</div>
                    <div className="store-item-desc">Your pet's house</div>
                  </div>
                </div>
              </div>

              {/* Pet's actual items */}
              {Array.isArray(currentPet.items) && currentPet.items.length > 0 ? (
                currentPet.items.map((item, idx) => {
                  const itemName = typeof item === 'string' ? item : (item?.name || 'Unknown');
                  const itemIcon = typeof item === 'object' && item?.icon ? item.icon : '🎁';
                  const itemDesc = typeof item === 'object' && item?.desc ? item.desc : '';
                  const quantity = typeof item === 'object' && item?.quantity ? item.quantity : 1;
                  const isUsable = USABLE_ITEM_NAMES.has(itemName);
                  return (
                    <div
                      key={`${itemName}-${idx}`}
                      className="store-item"
                      onClick={isUsable && !usingItemName ? () => handleUseItem(itemName) : undefined}
                      title={isUsable ? (usingItemName === itemName ? "Using..." : `Use ${itemName}`) : "Accessory"}
                      style={{ cursor: isUsable && !usingItemName ? 'pointer' : 'default', opacity: usingItemName === itemName ? 0.6 : 1 }}
                    >
                      <div className="store-item-info">
                        <span className="store-item-icon">{itemIcon}</span>
                        <div className="store-item-text">
                          <div className="store-item-name">{itemName}{quantity > 1 ? ` x ${quantity}` : ''}</div>
                          {itemDesc && <div className="store-item-desc">{itemDesc}</div>}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="items-empty">Your pet has no items...</div>
              )}
            </div>
          </aside>

          <div className="pet-main-column">
          {/* Pet Avatar and Status */}
          <div className="pet-avatar-section">
            {PixelArtComponent && (
              <div className="pet-avatar">
                <PixelArtComponent stage={currentPet.stage || 1} color={currentPet.color} />
              </div>
            )}
            <div className={`pet-status-badge ${getStatusColor(petStatus.status)}`}>
              {petStatus.message}
            </div>
          </div>



          {/* Progression Section */}
          <div className="progression-section">
            <div className="section-header-with-info">
              <h3>Progression</h3>
              <div className="info-icon-wrapper">
                <span className="info-icon">ℹ️</span>
                <div className="info-tooltip">
                  <strong>📊 Progression Info:</strong>
                  <p><strong>Age:</strong> 1 real day = 1 pet month (if well cared for)</p>
                  <p><strong>Stage:</strong> Baby (0-199 XP) → Teen (200-599 XP) → Adult (600+ XP)</p>
                  <p><strong>Streak:</strong> Consecutive days of interaction</p>
                  <p><strong>Social:</strong> Unique visitors who interact with your pet</p>
                </div>
              </div>
            </div>
            <div className="progression-grid">
              <div className="progression-item">
                <span className="progression-label">Age</span>
                <span className="progression-value">{ageDisplay}</span>
              </div>
              <div className="progression-item">
                <span className="progression-label">Stage</span>
                <span className="progression-value" style={{ color: stageInfo.color }}>
                  {getStageLabelWithEmoji(currentPet.stage || 1)}
                </span>
              </div>
              <div className="progression-item">
                <span className="progression-label">Streak</span>
                <span className="progression-value" style={{ color: streakTierInfo.color }}>
                  {streakTierInfo.emoji} {currentPet.currentStreak || 0} days
                </span>
              </div>
              <div className="progression-item">
                <span className="progression-label">Social</span>
                <span className="progression-value" style={{ color: socialTierInfo.color }}>
                  {socialTierInfo.emoji} {interactionStats?.uniqueInteractors || 0} friends
                </span>
              </div>
              {currentPet.longestStreak > 0 && (
                <div className="progression-item">
                  <span className="progression-label">Best Streak</span>
                  <span className="progression-value">🏆 {currentPet.longestStreak} days</span>
                </div>
              )}
            </div>
            <div className="xp-progress">
              <div className="xp-progress-header">
                <span>⭐ {currentPet.xp || 0} XP</span>
                {!progressInfo.isMaxStage && (
                  <span className="xp-next-stage">{progressInfo.message}</span>
                )}
                {progressInfo.isMaxStage && (
                  <span className="xp-max-stage">Max Stage!</span>
                )}
              </div>
              <div className="xp-progress-bar">
                <div
                  className="xp-progress-fill"
                  style={{
                    width: `${progressInfo.percentage}%`,
                    backgroundColor: stageInfo.color
                  }}
                />
              </div>
              {!progressInfo.isMaxStage && (
                <div className="xp-progress-text">
                  {progressInfo.percentage}% to {progressInfo.nextStageName}
                </div>
              )}
            </div>
          </div>



          {/* Notifications */}
          {notifications.length > 0 && (
            <div className="notifications-container">
              {notifications.map((notification, index) => (
                <div key={index} className="notification">
                  {notification}
                </div>
              ))}
            </div>
          )}

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

          {/* Cooldown Bonuses Section */}
          {(streakBonus.reductionSeconds > 0 || socialBonus.reductionSeconds > 0) && (
            <div className="bonuses-section">
              <div className="section-header-with-info">
                <h3>Cooldown Bonuses</h3>
                <div className="info-icon-wrapper">
                  <span className="info-icon">ℹ️</span>
                  <div className="info-tooltip">
                    <strong>🔥 Streak Tiers:</strong>
                    <ul>
                      <li>1-2 days: Starting (0 min)</li>
                      <li>3-6 days: Common (-2 min)</li>
                      <li>7-13 days: Uncommon (-4 min)</li>
                      <li>14-29 days: Rare (-6 min)</li>
                      <li>30-59 days: Epic (-8 min)</li>
                      <li>60+ days: Legendary (-10 min)</li>
                    </ul>
                    <strong>👥 Social Tiers:</strong>
                    <ul>
                      <li>0-4 people: Private (0 min)</li>
                      <li>5-9 people: Shared (-1 min)</li>
                      <li>10-19 people: Friendly (-2 min)</li>
                      <li>20-49 people: Social (-3 min)</li>
                      <li>50-99 people: Popular (-4 min)</li>
                      <li>100+ people: Viral (-5 min)</li>
                    </ul>
                  </div>
                </div>
              </div>
              <div className="bonuses-grid">
                {streakBonus.reductionSeconds > 0 && (
                  <div className="bonus-item" style={{ borderColor: streakTierInfo.color }}>
                    <span className="bonus-icon">{streakTierInfo.emoji}</span>
                    <div className="bonus-info">
                      <span className="bonus-label">{streakTierInfo.name} Streak</span>
                      <span className="bonus-value">-{streakBonus.reductionMinutes} min</span>
                    </div>
                  </div>
                )}
                {socialBonus.reductionSeconds > 0 && (
                  <div className="bonus-item" style={{ borderColor: socialTierInfo.color }}>
                    <span className="bonus-icon">{socialTierInfo.emoji}</span>
                    <div className="bonus-info">
                      <span className="bonus-label">{socialTierInfo.name}</span>
                      <span className="bonus-value">-{socialBonus.reductionMinutes} min</span>
                    </div>
                  </div>
                )}
              </div>
              {streakBonus.nextMilestone && (
                <p className="bonus-hint">
                  🎯 {streakBonus.nextMilestone.days - (currentPet.currentStreak || 0)} more days for next streak bonus!
                </p>
              )}
              {socialBonus.nextMilestone && (
                <p className="bonus-hint">
                  🎯 {socialBonus.nextMilestone.count - (interactionStats?.uniqueInteractors || 0)} more friends for next social bonus!
                </p>
              )}
            </div>
          )}

          {/* Actions Section */}
          <div className="actions-section">
            <div className="actions-header">
              <div className="section-header-with-info">
                <h3>Actions</h3>
                <div className="info-icon-wrapper tooltip-right">
                  <span className="info-icon">ℹ️</span>
                  <div className="info-tooltip info-tooltip-large">
                    <strong>⏱️ Cooldown Reduction System:</strong>
                    <p>Reduce the 10-minute cooldown between actions by building streaks and sharing your pet!</p>

                    <strong style={{ marginTop: '1rem' }}>🔥 Streak Tier Bonuses:</strong>
                    <ul style={{ fontSize: '0.8rem' }}>
                      <li>1-2 days: Starting (0 min)</li>
                      <li>3-6 days: Common (-2 min)</li>
                      <li>7-13 days: Uncommon (-4 min)</li>
                      <li>14-29 days: Rare (-6 min)</li>
                      <li>30-59 days: Epic (-8 min)</li>
                      <li>60+ days: Legendary (-10 min)</li>
                    </ul>

                    <strong>👥 Social Tier Bonuses:</strong>
                    <ul style={{ fontSize: '0.8rem' }}>
                      <li>0-4 people: Private (0 min)</li>
                      <li>5-9 people: Shared (-1 min)</li>
                      <li>10-19 people: Friendly (-2 min)</li>
                      <li>20-49 people: Social (-3 min)</li>
                      <li>50-99 people: Popular (-4 min)</li>
                      <li>100+ people: Viral (-5 min)</li>
                    </ul>

                    <p style={{ marginTop: '0.75rem', fontSize: '0.8rem', fontStyle: 'italic' }}>
                      💡 Bonuses stack! Max reduction: 15 min = instant interactions!
                    </p>
                  </div>
                </div>
              </div>
              {cooldownRemaining > 0 ? (
                <div className="cooldown-indicator">
                  ⏱️ {formatCooldownTime(cooldownRemaining)}
                  {cooldownBreakdown && <div className="cooldown-breakdown">{cooldownBreakdown}</div>}
                </div>
              ) : (
                <div className="cooldown-indicator ready">
                  ✅ Ready!
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
              <div className="info-item">
                <strong>Coins:</strong> {currentPet.coins ?? 0}
              </div>
              {currentPet.breed && (
                <div className="info-item">
                  <strong>Breed:</strong> {currentPet.breed}
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

          {/* Store Sidebar */}
          <aside className="store-section">
            <div className="store-header">
              <h3>Pet Store</h3>
              <div className="store-balance">💰 {currentPet.coins ?? 0} coins</div>
            </div>
            <div className="store-tabs">
              <button
                className={`store-tab ${activeStoreTab === 'supplies' ? 'active' : ''}`}
                onClick={() => setActiveStoreTab('supplies')}
              >
                Pet Supplies
              </button>
              <div className="store-tab-with-tooltip">
                <button
                  className={`store-tab ${activeStoreTab === 'accessories' ? 'active' : ''} ${(currentPet.stage || 1) < 3 ? 'locked' : ''}`}
                  onClick={() => {
                    if ((currentPet.stage || 1) >= 3) setActiveStoreTab('accessories');
                  }}
                  title={(currentPet.stage || 1) < 3 ? 'Locked until Adult stage' : 'Pet Accessories'}
                >
                  Pet Accessories {(currentPet.stage || 1) < 3 ? '🔒' : ''}
                </button>
                {(currentPet.stage || 1) < 3 && (
                  <div className="tab-tooltip">Accessories are locked until your pet becomes an Adult.</div>
                )}
              </div>
            </div>
            {activeStoreTab === 'accessories' && (currentPet.stage || 1) < 3 && (
              <div className="store-locked-note">Reach Adult stage to unlock accessories.</div>
            )}
            <div className="store-items">
              {(activeStoreTab === 'supplies' ? STORE_ITEMS : ACCESSORY_ITEMS).map((item) => (
                <div key={item.name} className="store-item">
                  <div className="store-item-info">
                    <span className="store-item-icon">{item.icon}</span>
                    <div className="store-item-text">
                      <div className="store-item-name">{item.name}</div>
                      <div className="store-item-desc">{item.desc}</div>
                    </div>
                  </div>
                  <div className="store-item-cta">
                    <span className="store-item-price">{item.price}c</span>
                    <button
                      className="btn btn-secondary buy-btn"
                      disabled={
                        storeLoadingItem === item.name ||
                        (currentPet.coins ?? 0) < item.price ||
                        (activeStoreTab === 'accessories' && (currentPet.stage || 1) < 3)
                      }
                      onClick={() => handleBuy(item)}
                      title={
                        (activeStoreTab === 'accessories' && (currentPet.stage || 1) < 3)
                          ? 'Locked until Adult stage'
                          : (currentPet.coins ?? 0) < item.price
                          ? 'Not enough coins'
                          : 'Buy item'
                      }
                    >
                      Buy
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </aside>
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

