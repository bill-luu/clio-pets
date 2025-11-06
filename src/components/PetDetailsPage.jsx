import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { getPetPixelArt } from "../utils/pixelArt";
import { subscribeToPetById, purchaseItem, useItem as consumeInventoryItem, togglePetSharing, toggleAccessoryEquip } from "../services/petService";
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
import "./styles/PetDetailsPage.css";

export default function PetDetailsPage({ user }) {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [currentPet, setCurrentPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastAction, setLastAction] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [interactionStats, setInteractionStats] = useState(null);
  const [storeLoadingItem, setStoreLoadingItem] = useState(null);
  const [usingItemName, setUsingItemName] = useState(null);
  const [equippingAccessory, setEquippingAccessory] = useState(null);
  const [activeStoreTab, setActiveStoreTab] = useState('supplies'); // 'supplies' | 'accessories'
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'items' | 'share' | 'store'
  const [sharingEnabled, setSharingEnabled] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareError, setShareError] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null); // For mobile tap-to-toggle tooltips

  // Subscribe to real-time updates for this pet
  useEffect(() => {
    const unsubscribe = subscribeToPetById(petId, (updatedPet, err) => {
      if (err) {
        console.error("Error subscribing to pet:", err);
        setError("Failed to load pet details");
        setLoading(false);
        return;
      }
      setCurrentPet(updatedPet);
      setSharingEnabled(updatedPet.sharingEnabled || false);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [petId]);

  // Load interaction stats
  useEffect(() => {
    const loadStats = async () => {
      if (currentPet?.sharingEnabled) {
        try {
          const stats = await getInteractionCount(currentPet.id);
          setInteractionStats(stats);
        } catch (err) {
          console.error("Error loading interaction stats:", err);
        }
      }
    };

    if (currentPet) {
      loadStats();
    }
  }, [currentPet]);

  // Cooldown timer
  useEffect(() => {
    if (!currentPet) return;

    const updateCooldown = async () => {
      const cooldownStatus = await checkCooldown(currentPet, interactionStats?.uniqueInteractors || 0);
      setCooldownRemaining(cooldownStatus.remainingSeconds);
    };

    // Update immediately
    updateCooldown();

    // Update every second if on cooldown
    const interval = setInterval(updateCooldown, 1000);

    return () => clearInterval(interval);
  }, [currentPet, currentPet?.lastActionAt, interactionStats]);

  // Use useMemo to ensure these recalculate when currentPet changes
  const PixelArtComponent = currentPet ? getPetPixelArt(currentPet.species) : null;
  const availableActions = useMemo(() => currentPet ? getAvailableActions(currentPet) : [], [currentPet]);
  const petStatus = useMemo(() => currentPet ? getPetStatus(currentPet) : { status: 'okay', message: 'Loading...' }, [currentPet]);
  const progressInfo = useMemo(() => currentPet ? getProgressToNextStage(currentPet.xp || 0) : { percentage: 0, isMaxStage: false }, [currentPet]);
  const stageInfo = useMemo(() => currentPet ? getStageInfo(currentPet.stage || 1) : { color: '#667eea' }, [currentPet]);
  const ageDisplay = currentPet ? formatAgeDisplay(currentPet.ageInYears || 0) : '0 months';

  // Streak and bonus information
  const streakBonus = useMemo(() => currentPet ? getStreakBonus(currentPet.currentStreak || 0) : { reductionSeconds: 0, reductionMinutes: 0, tier: 0 }, [currentPet]);
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
    if (!currentPet) return;
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

  const handleBack = () => {
    navigate('/');
  };

  const handleToggleSharing = async () => {
    if (!currentPet) return;
    try {
      setLoading(true);
      setShareError(null);
      const newState = !sharingEnabled;
      await togglePetSharing(currentPet.id, newState);
      setSharingEnabled(newState);

      // Reload interaction stats
      if (newState) {
        const stats = await getInteractionCount(currentPet.id);
        setInteractionStats(stats);
      }
    } catch (err) {
      console.error("Error toggling sharing:", err);
      setShareError("Failed to toggle sharing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!currentPet) return;
    const shareUrl = `${window.location.origin}/shared-pet/${currentPet.shareableId}`;

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

  const handleAction = async (actionType) => {
    if (!currentPet) return;
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
    } catch (err) {
      console.error("Error performing action:", err);
      setError(err.message || "Failed to perform action. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const handleToggleAccessory = async (accessoryName) => {
    if (!currentPet) return;
    try {
      setEquippingAccessory(accessoryName);
      await toggleAccessoryEquip(currentPet.id, accessoryName);
    } catch (err) {
      console.error("Error toggling accessory:", err);
      setError(err.message || "Failed to toggle accessory. Please try again.");
    } finally {
      setEquippingAccessory(null);
    }
  };

  const handleUseItem = async (itemName) => {
    if (!currentPet) return;
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

  // Toggle tooltip on mobile (tap-to-toggle)
  const handleTooltipToggle = (tooltipId) => {
    setActiveTooltip(activeTooltip === tooltipId ? null : tooltipId);
  };

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeTooltip && !e.target.closest('.info-icon-wrapper')) {
        setActiveTooltip(null);
      }
    };

    if (activeTooltip) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [activeTooltip]);

  if (loading) {
    return (
      <div className="pet-details-page">
        <div className="pet-details-loading">Loading pet details...</div>
      </div>
    );
  }

  if (error || !currentPet) {
    return (
      <div className="pet-details-page">
        <div className="pet-details-error">
          <p>{error || "Pet not found"}</p>
          <button className="btn btn-primary" onClick={handleBack}>
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pet-details-page">
      <div className="pet-details-container">
        {/* Back Link */}
        <div className="pet-details-header">
          <a href="/" onClick={(e) => { e.preventDefault(); handleBack(); }} className="back-link">
            ← Back to Home
          </a>
        </div>

        {/* Pet Header Section with Avatar and Stats */}
        <div className="pet-header-section">
          <div className="pet-header-left">
            {PixelArtComponent && (
              <div className="pet-header-avatar">
                <PixelArtComponent
                  stage={currentPet.stage || 1}
                  color={currentPet.color}
                  equippedAccessories={currentPet.equippedAccessories || []}
                />
              </div>
            )}
            <div className="pet-header-info">
              <h2 className="pet-header-name">{currentPet.name}</h2>
              <p className="pet-header-species">{currentPet.species}</p>
              <div className={`pet-header-status ${getStatusColor(petStatus.status)}`}>
                {petStatus.message}
              </div>
            </div>
          </div>
          <div className="pet-header-right">
            <div className="pet-header-stats">
              <div className="pet-header-stat">
                <span className="pet-header-stat-label">
                  <span className="pet-header-stat-icon">🍖</span>
                  Fullness
                </span>
                <span className={`pet-header-stat-value ${getStatColor(currentPet.fullness || 50)}`}>
                  {currentPet.fullness || 50}/100
                </span>
              </div>
              <div className="pet-header-stat">
                <span className="pet-header-stat-label">
                  <span className="pet-header-stat-icon">😊</span>
                  Happiness
                </span>
                <span className={`pet-header-stat-value ${getStatColor(currentPet.happiness || 50)}`}>
                  {currentPet.happiness || 50}/100
                </span>
              </div>
              <div className="pet-header-stat">
                <span className="pet-header-stat-label">
                  <span className="pet-header-stat-icon">✨</span>
                  Cleanliness
                </span>
                <span className={`pet-header-stat-value ${getStatColor(currentPet.cleanliness || 50)}`}>
                  {currentPet.cleanliness || 50}/100
                </span>
              </div>
              <div className="pet-header-stat">
                <span className="pet-header-stat-label">
                  <span className="pet-header-stat-icon">⚡</span>
                  Energy
                </span>
                <span className={`pet-header-stat-value ${getStatColor(currentPet.energy || 50)}`}>
                  {currentPet.energy || 50}/100
                </span>
              </div>
            </div>
          </div>
          <div className="pet-header-coins-display">
            💰 {currentPet.coins ?? 0} coins
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="pet-tabs-navigation">
          <button
            className={`pet-tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`pet-tab-button ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            Items
          </button>
          <button
            className={`pet-tab-button ${activeTab === 'store' ? 'active' : ''}`}
            onClick={() => setActiveTab('store')}
          >
            Store
          </button>
          <button
            className={`pet-tab-button ${activeTab === 'share' ? 'active' : ''}`}
            onClick={() => setActiveTab('share')}
          >
            Social
          </button>
        </div>

        {/* Tab Content */}
        <div className="pet-tab-content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
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

              {/* Progression Section */}
              <div className="progression-section">
                <div className="section-header-with-info">
                  <h3>Progression</h3>
                  <div className="info-icon-wrapper" onClick={() => handleTooltipToggle('progression')}>
                    <span className="info-icon">ℹ️</span>
                    <div className={`info-tooltip ${activeTooltip === 'progression' ? 'tooltip-visible' : ''}`}>
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

              {/* Cooldown Bonuses Section */}
              {(streakBonus.reductionSeconds > 0 || socialBonus.reductionSeconds > 0) && (
                <div className="bonuses-section">
                  <div className="section-header-with-info">
                    <h3>Cooldown Bonuses</h3>
                    <div className="info-icon-wrapper" onClick={() => handleTooltipToggle('bonuses')}>
                      <span className="info-icon">ℹ️</span>
                      <div className={`info-tooltip ${activeTooltip === 'bonuses' ? 'tooltip-visible' : ''}`}>
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
                    <div className="info-icon-wrapper tooltip-right" onClick={() => handleTooltipToggle('actions')}>
                      <span className="info-icon">ℹ️</span>
                      <div className={`info-tooltip info-tooltip-large ${activeTooltip === 'actions' ? 'tooltip-visible' : ''}`}>
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
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <button
                        key={action.type}
                        className={`action-btn ${action.urgent ? 'action-urgent' : ''} ${cooldownRemaining > 0 ? 'action-cooldown' : ''}`}
                        onClick={() => handleAction(action.type)}
                        disabled={loading || action.disabled || cooldownRemaining > 0}
                        title={
                          cooldownRemaining > 0
                            ? `Please wait ${cooldownRemaining} seconds`
                            : action.disabled
                            ? (action.type === 'work' && currentPet.stage < 2 ? 'Unlock at Teen Level' : 'Cannot perform this action right now')
                            : action.description
                        }
                        style={{ width: '100%', height: 'auto', position: 'relative', zIndex: 1 }}
                      >
                        <span className="action-icon">{action.icon}</span>
                        <span className="action-name">{action.name}</span>
                        {action.urgent && cooldownRemaining === 0 && <span className="urgent-indicator">!</span>}
                      </button>
                      {action.type === 'work' && currentPet.stage < 2 && (
                        <span style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          color: 'red',
                          fontWeight: 'bold',
                          fontSize: '2em', // Further increased size for the emoji
                          zIndex: 2,
                          pointerEvents: 'none',
                          textAlign: 'center'
                        }}>
                          🔒
                        </span>
                      )}
                    </div>
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
            </>
          )}

          {/* Items Tab */}
          {activeTab === 'items' && (
            <>
              <div className="items-header">
                <h3>Items</h3>
              </div>
              <div className="store-items">
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
                    {/* Equip/Unequip on owned items (Items tab) */}
                    <div className="store-item-cta">
                      {itemName === 'Hat' && (() => {
                        const isEquipped = Array.isArray(currentPet.equippedAccessories) && currentPet.equippedAccessories.includes(itemName);
                        const locked = (currentPet.stage || 1) < 3;
                        const disabled = locked || equippingAccessory === itemName;
                        const title = locked
                          ? 'Locked until Adult stage'
                          : isEquipped
                            ? 'Unequip accessory'
                            : 'Equip accessory';
                        return (
                          <button
                            className="btn btn-secondary"
                            disabled={disabled}
                            onClick={() => handleToggleAccessory(itemName)}
                            title={title}
                            style={{ marginLeft: 8 }}
                          >
                            {isEquipped ? 'Unequip' : 'Equip'}
                          </button>
                        );
                      })()}
                    </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="items-empty">Your pet has no items...</div>
                )}
              </div>
            </>
          )}

          {/* Social Tab */}
          {activeTab === 'share' && (
            <div className="share-pet-content">
              {shareError && <div className="error-message">{shareError}</div>}

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
                        value={`${window.location.origin}/shared-pet/${currentPet.shareableId}`}
                        size={200}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <p className="qr-code-description">
                      Scan this QR code to interact with {currentPet.name}
                    </p>
                  </div>

                  <div className="share-link-section">
                    <label className="share-link-label">Shareable Link:</label>
                    <div className="share-link-input-group">
                      <input
                        type="text"
                        value={`${window.location.origin}/shared-pet/${currentPet.shareableId}`}
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

                  <div className="print-qr-section">
                    <a
                      href={`/pet/${currentPet.id}/print-qr`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary print-qr-btn"
                    >
                      🖨️ Print QR Code Poster
                    </a>
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
          )}

          {/* Store Tab */}
          {activeTab === 'store' && (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}

