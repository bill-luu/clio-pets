/**
 * Cooldown Calculator
 * Centralized cooldown calculation with bonus reductions
 */

import { getStreakBonus } from "./streakTracker";
import { getSocialBonus } from "./socialBonus";

/**
 * Base cooldown duration in seconds
 */
export const BASE_COOLDOWN_SECONDS = 600; // 10 minutes

/**
 * Calculate effective cooldown with all bonuses applied
 * @param {number} streak - Current daily streak
 * @param {number} uniqueInteractors - Number of unique interactors
 * @returns {Object} Cooldown information with breakdown
 */
export const calculateEffectiveCooldown = (
  streak = 0,
  uniqueInteractors = 0
) => {
  const streakBonus = getStreakBonus(streak);
  const socialBonus = getSocialBonus(uniqueInteractors);

  const totalReduction =
    streakBonus.reductionSeconds + socialBonus.reductionSeconds;
  const effectiveCooldown = Math.max(0, BASE_COOLDOWN_SECONDS - totalReduction);

  return {
    baseCooldown: BASE_COOLDOWN_SECONDS,
    streakBonus: {
      seconds: streakBonus.reductionSeconds,
      minutes: streakBonus.reductionMinutes,
      tier: streakBonus.tier,
    },
    socialBonus: {
      seconds: socialBonus.reductionSeconds,
      minutes: socialBonus.reductionMinutes,
      tier: socialBonus.tier,
    },
    totalReduction,
    effectiveCooldown,
    effectiveCooldownMinutes: Math.floor(effectiveCooldown / 60),
    hasNoCooldown: effectiveCooldown === 0,
  };
};

/**
 * Calculate remaining cooldown time with bonuses
 * @param {number|Date} lastActionTime - Timestamp of last action
 * @param {number} streak - Current daily streak
 * @param {number} uniqueInteractors - Number of unique interactors
 * @returns {Object} Cooldown status with remaining time
 */
export const calculateRemainingCooldown = (
  lastActionTime,
  streak = 0,
  uniqueInteractors = 0
) => {
  if (!lastActionTime) {
    return {
      isOnCooldown: false,
      remainingSeconds: 0,
      effectiveCooldown: calculateEffectiveCooldown(streak, uniqueInteractors),
    };
  }

  const now = Date.now();
  const lastActionTimestamp =
    typeof lastActionTime === "number"
      ? lastActionTime
      : lastActionTime.toMillis
      ? lastActionTime.toMillis()
      : lastActionTime;

  const timeSinceLastAction = (now - lastActionTimestamp) / 1000; // Convert to seconds
  const cooldownInfo = calculateEffectiveCooldown(streak, uniqueInteractors);
  const remainingSeconds = Math.max(
    0,
    cooldownInfo.effectiveCooldown - timeSinceLastAction
  );

  return {
    isOnCooldown: remainingSeconds > 0,
    remainingSeconds: Math.ceil(remainingSeconds),
    effectiveCooldown: cooldownInfo,
  };
};

/**
 * Format cooldown time for display
 * @param {number} seconds - Seconds remaining
 * @returns {string} Formatted time string
 */
export const formatCooldownTime = (seconds) => {
  if (seconds <= 0) {
    return "Ready!";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  if (minutes === 0) {
    return `${remainingSeconds}s`;
  }

  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }

  return `${minutes}m ${remainingSeconds}s`;
};

/**
 * Get cooldown breakdown message for display
 * @param {Object} cooldownInfo - Cooldown information from calculateEffectiveCooldown
 * @returns {string} Formatted breakdown message
 */
export const getCooldownBreakdown = (cooldownInfo) => {
  if (cooldownInfo.hasNoCooldown) {
    return "🎉 No cooldown!";
  }

  const hasAnyBonus =
    cooldownInfo.streakBonus.seconds > 0 ||
    cooldownInfo.socialBonus.seconds > 0;

  if (!hasAnyBonus) {
    // No bonuses active - don't show breakdown
    return null;
  }

  const parts = [];
  const totalReduction =
    cooldownInfo.streakBonus.minutes + cooldownInfo.socialBonus.minutes;

  if (cooldownInfo.streakBonus.seconds > 0) {
    parts.push(`🔥 -${cooldownInfo.streakBonus.minutes}m`);
  }

  if (cooldownInfo.socialBonus.seconds > 0) {
    parts.push(`👥 -${cooldownInfo.socialBonus.minutes}m`);
  }

  return `Reduced by ${totalReduction}m (${parts.join(", ")})`;
};

const cooldownCalculator = {
  BASE_COOLDOWN_SECONDS,
  calculateEffectiveCooldown,
  calculateRemainingCooldown,
  formatCooldownTime,
  getCooldownBreakdown,
};

export default cooldownCalculator;
