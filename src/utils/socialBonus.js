/**
 * Social Bonus Calculator
 * Calculates cooldown reduction based on unique interactors
 */

/**
 * Get cooldown reduction bonus based on unique interactors
 * @param {number} uniqueInteractors - Number of unique people who interacted
 * @returns {Object} Bonus information
 */
export const getSocialBonus = (uniqueInteractors) => {
  let reductionSeconds = 0;
  let tier = "none";
  let nextMilestone = null;

  if (uniqueInteractors >= 100) {
    reductionSeconds = 300; // 5 minutes
    tier = "viral";
    nextMilestone = null;
  } else if (uniqueInteractors >= 50) {
    reductionSeconds = 240; // 4 minutes
    tier = "popular";
    nextMilestone = { count: 100, bonus: 300 };
  } else if (uniqueInteractors >= 20) {
    reductionSeconds = 180; // 3 minutes
    tier = "social";
    nextMilestone = { count: 50, bonus: 240 };
  } else if (uniqueInteractors >= 10) {
    reductionSeconds = 120; // 2 minutes
    tier = "friendly";
    nextMilestone = { count: 20, bonus: 180 };
  } else if (uniqueInteractors >= 5) {
    reductionSeconds = 60; // 1 minute
    tier = "shared";
    nextMilestone = { count: 10, bonus: 120 };
  } else {
    reductionSeconds = 0;
    tier = "none";
    nextMilestone = { count: 5, bonus: 60 };
  }

  return {
    reductionSeconds,
    reductionMinutes: Math.floor(reductionSeconds / 60),
    tier,
    nextMilestone,
  };
};

/**
 * Get social tier display information
 * @param {string} tier - Social tier
 * @returns {Object} Display information
 */
export const getSocialTierInfo = (tier) => {
  const tiers = {
    viral: {
      name: "Viral",
      emoji: "🌟",
      color: "#E74C3C",
      description: "100+ friends!",
    },
    popular: {
      name: "Popular",
      emoji: "✨",
      color: "#9B59B6",
      description: "50+ friends",
    },
    social: {
      name: "Social",
      emoji: "🎉",
      color: "#3498DB",
      description: "20+ friends",
    },
    friendly: {
      name: "Friendly",
      emoji: "👥",
      color: "#2ECC71",
      description: "10+ friends",
    },
    shared: {
      name: "Shared",
      emoji: "🤝",
      color: "#F39C12",
      description: "5+ friends",
    },
    none: {
      name: "Private",
      emoji: "🔒",
      color: "#95A5A6",
      description: "Not shared yet",
    },
  };

  return tiers[tier] || tiers.none;
};

/**
 * Format social bonus message for display
 * @param {number} uniqueInteractors - Number of unique interactors
 * @returns {string} Formatted message
 */
export const formatSocialBonusMessage = (uniqueInteractors) => {
  if (uniqueInteractors === 0) {
    return "Share your pet to unlock social bonuses!";
  }

  const bonus = getSocialBonus(uniqueInteractors);

  if (bonus.nextMilestone) {
    const remaining = bonus.nextMilestone.count - uniqueInteractors;
    return `${uniqueInteractors} friends! ${remaining} more for next bonus.`;
  }

  return `${uniqueInteractors} friends! Maximum social bonus unlocked!`;
};

const socialBonus = {
  getSocialBonus,
  getSocialTierInfo,
  formatSocialBonusMessage,
};

export default socialBonus;
