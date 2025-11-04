/**
 * Streak Tracking Utility
 * Handles daily streak calculation and cooldown bonuses
 */

/**
 * Get current date in UTC as YYYY-MM-DD string
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const getTodayDateString = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Calculate difference in days between two date strings
 * @param {string} dateString1 - First date (YYYY-MM-DD)
 * @param {string} dateString2 - Second date (YYYY-MM-DD)
 * @returns {number} Difference in days
 */
export const getDaysDifference = (dateString1, dateString2) => {
  const date1 = new Date(dateString1 + "T00:00:00Z");
  const date2 = new Date(dateString2 + "T00:00:00Z");
  const diffTime = Math.abs(date2 - date1);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Calculate current streak based on last interaction date
 * @param {string|null} lastInteractionDate - Last interaction date (YYYY-MM-DD)
 * @param {number} currentStreak - Current streak count
 * @returns {Object} Updated streak information
 */
export const calculateStreak = (lastInteractionDate, currentStreak = 0) => {
  const today = getTodayDateString();

  // First interaction ever
  if (!lastInteractionDate) {
    return {
      newStreak: 1,
      isNewDay: true,
      streakBroken: false,
      message: "🔥 Streak started! Come back tomorrow to keep it going!",
    };
  }

  const daysSinceLastInteraction = getDaysDifference(
    lastInteractionDate,
    today
  );

  // Same day - maintain current streak
  if (daysSinceLastInteraction === 0) {
    return {
      newStreak: currentStreak,
      isNewDay: false,
      streakBroken: false,
      message: null,
    };
  }

  // Next day - increment streak
  if (daysSinceLastInteraction === 1) {
    const newStreak = currentStreak + 1;
    return {
      newStreak,
      isNewDay: true,
      streakBroken: false,
      message: `🔥 ${newStreak} day streak! Keep it up!`,
    };
  }

  // Missed days - reset streak
  return {
    newStreak: 1,
    isNewDay: true,
    streakBroken: true,
    message: `💔 Streak broken! Starting fresh at day 1.`,
  };
};

/**
 * Get cooldown reduction bonus based on streak
 * @param {number} streak - Current streak count
 * @returns {Object} Bonus information
 */
export const getStreakBonus = (streak) => {
  let reductionSeconds = 0;
  let tier = "none";
  let nextMilestone = null;

  if (streak >= 60) {
    reductionSeconds = 600; // 10 minutes - no cooldown!
    tier = "legendary";
    nextMilestone = null;
  } else if (streak >= 30) {
    reductionSeconds = 480; // 8 minutes
    tier = "epic";
    nextMilestone = { days: 60, bonus: 600 };
  } else if (streak >= 14) {
    reductionSeconds = 360; // 6 minutes
    tier = "rare";
    nextMilestone = { days: 30, bonus: 480 };
  } else if (streak >= 7) {
    reductionSeconds = 240; // 4 minutes
    tier = "uncommon";
    nextMilestone = { days: 14, bonus: 360 };
  } else if (streak >= 3) {
    reductionSeconds = 120; // 2 minutes
    tier = "common";
    nextMilestone = { days: 7, bonus: 240 };
  } else if (streak >= 1) {
    reductionSeconds = 0;
    tier = "starting";
    nextMilestone = { days: 3, bonus: 120 };
  } else {
    reductionSeconds = 0;
    tier = "none";
    nextMilestone = { days: 3, bonus: 120 };
  }

  return {
    reductionSeconds,
    reductionMinutes: Math.floor(reductionSeconds / 60),
    tier,
    nextMilestone,
  };
};

/**
 * Get streak tier display information
 * @param {string} tier - Streak tier
 * @returns {Object} Display information
 */
export const getStreakTierInfo = (tier) => {
  const tiers = {
    legendary: {
      name: "Legendary",
      emoji: "🏆",
      color: "#FFD700",
      description: "No cooldown!",
    },
    epic: {
      name: "Epic",
      emoji: "💎",
      color: "#9B59B6",
      description: "8 min cooldown reduction",
    },
    rare: {
      name: "Rare",
      emoji: "⭐",
      color: "#3498DB",
      description: "6 min cooldown reduction",
    },
    uncommon: {
      name: "Uncommon",
      emoji: "🌟",
      color: "#2ECC71",
      description: "4 min cooldown reduction",
    },
    common: {
      name: "Common",
      emoji: "🔥",
      color: "#E67E22",
      description: "2 min cooldown reduction",
    },
    starting: {
      name: "Starting",
      emoji: "🔥",
      color: "#F39C12",
      description: "Keep going for bonuses!",
    },
    none: {
      name: "No Streak",
      emoji: "⚪",
      color: "#95A5A6",
      description: "No cooldown reduction",
    },
  };

  return tiers[tier] || tiers.none;
};

/**
 * Check if streak milestone was reached
 * @param {number} oldStreak - Previous streak
 * @param {number} newStreak - New streak
 * @returns {Object|null} Milestone information if reached
 */
export const checkStreakMilestone = (oldStreak, newStreak) => {
  const milestones = [3, 7, 14, 30, 60];

  for (const milestone of milestones) {
    if (oldStreak < milestone && newStreak >= milestone) {
      const bonus = getStreakBonus(milestone);
      return {
        days: milestone,
        bonus: bonus.reductionSeconds,
        tier: bonus.tier,
        message: `🎉 ${milestone}-day streak milestone! Cooldown reduced by ${bonus.reductionMinutes} minutes!`,
      };
    }
  }

  return null;
};

const streakTracker = {
  getTodayDateString,
  getDaysDifference,
  calculateStreak,
  getStreakBonus,
  getStreakTierInfo,
  checkStreakMilestone,
};

export default streakTracker;
