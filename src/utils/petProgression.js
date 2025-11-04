// Pet stage progression and XP-based evolution utilities

/**
 * Stage threshold configuration
 * Defines XP ranges for each life stage
 * 
 * Thresholds designed to align with age progression (1 month/day):
 * - Teen at 200 XP (~6 days) = 6 months old
 * - Adult at 600 XP (~16 days) = 16-18 months old
 */
export const STAGE_THRESHOLDS = {
  BABY: {
    id: 1,
    name: "Baby",
    emoji: "🍼",
    minXP: 0,
    maxXP: 199,
    label: "Baby"
  },
  TEEN: {
    id: 2,
    name: "Teen",
    emoji: "🧒",
    minXP: 200,
    maxXP: 599,
    label: "Teen"
  },
  ADULT: {
    id: 3,
    name: "Adult",
    emoji: "👨",
    minXP: 600,
    maxXP: Infinity,
    label: "Adult"
  }
};

/**
 * Get stage configuration by stage ID
 * 
 * @param {number} stageId - Stage ID (1, 2, or 3)
 * @returns {Object} Stage configuration object
 */
export const getStageConfig = (stageId) => {
  switch (stageId) {
    case 1:
      return STAGE_THRESHOLDS.BABY;
    case 2:
      return STAGE_THRESHOLDS.TEEN;
    case 3:
      return STAGE_THRESHOLDS.ADULT;
    default:
      return STAGE_THRESHOLDS.BABY;
  }
};

/**
 * Calculate stage from XP amount
 * 
 * @param {number} xp - Current XP
 * @returns {number} Stage ID (1 = Baby, 2 = Teen, 3 = Adult)
 * 
 * Thresholds:
 * - Baby: 0-199 XP
 * - Teen: 200-599 XP
 * - Adult: 600+ XP
 */
export const getStageFromXP = (xp) => {
  if (xp >= STAGE_THRESHOLDS.ADULT.minXP) {
    return STAGE_THRESHOLDS.ADULT.id;
  } else if (xp >= STAGE_THRESHOLDS.TEEN.minXP) {
    return STAGE_THRESHOLDS.TEEN.id;
  } else {
    return STAGE_THRESHOLDS.BABY.id;
  }
};

/**
 * Check if pet should evolve to next stage
 * 
 * @param {number} currentStage - Current stage ID
 * @param {number} newXP - New XP amount after action
 * @returns {Object} Evolution check result
 */
export const checkEvolution = (currentStage, newXP) => {
  const newStage = getStageFromXP(newXP);
  const evolved = newStage > currentStage;
  
  return {
    evolved,
    oldStage: currentStage,
    newStage,
    stageConfig: evolved ? getStageConfig(newStage) : null,
    message: evolved 
      ? `🎉 Your pet evolved to ${getStageConfig(newStage).name}!`
      : null
  };
};

/**
 * Get XP required to reach next stage
 * 
 * @param {number} currentXP - Current XP
 * @returns {number|null} XP needed for next stage, or null if at max stage
 */
export const getXPForNextStage = (currentXP) => {
  const currentStage = getStageFromXP(currentXP);
  
  if (currentStage === STAGE_THRESHOLDS.BABY.id) {
    return STAGE_THRESHOLDS.TEEN.minXP;
  } else if (currentStage === STAGE_THRESHOLDS.TEEN.id) {
    return STAGE_THRESHOLDS.ADULT.minXP;
  } else {
    return null; // Already at max stage (Adult)
  }
};

/**
 * Calculate progress percentage to next stage
 * 
 * @param {number} currentXP - Current XP
 * @returns {number} Percentage (0-100), or 100 if at max stage
 */
export const getProgressPercentage = (currentXP) => {
  const currentStage = getStageFromXP(currentXP);
  const currentConfig = getStageConfig(currentStage);
  
  // If at max stage (Adult), return 100%
  if (currentStage === STAGE_THRESHOLDS.ADULT.id) {
    return 100;
  }
  
  // Calculate progress within current stage range
  const stageStartXP = currentConfig.minXP;
  const stageEndXP = currentConfig.maxXP + 1; // +1 because maxXP is inclusive
  const xpInStage = currentXP - stageStartXP;
  const xpNeededForStage = stageEndXP - stageStartXP;
  
  return Math.min(100, Math.round((xpInStage / xpNeededForStage) * 100));
};

/**
 * Get detailed progress information to next stage
 * 
 * @param {number} currentXP - Current XP
 * @returns {Object} Detailed progress information
 */
export const getProgressToNextStage = (currentXP) => {
  const currentStage = getStageFromXP(currentXP);
  const currentConfig = getStageConfig(currentStage);
  const nextStageXP = getXPForNextStage(currentXP);
  const percentage = getProgressPercentage(currentXP);
  
  // If at max stage
  if (!nextStageXP) {
    return {
      currentStage,
      currentStageName: currentConfig.name,
      currentXP,
      nextStageXP: null,
      xpNeeded: 0,
      percentage: 100,
      isMaxStage: true,
      message: "Max stage reached!"
    };
  }
  
  const xpNeeded = nextStageXP - currentXP;
  const nextStage = currentStage + 1;
  const nextConfig = getStageConfig(nextStage);
  
  return {
    currentStage,
    currentStageName: currentConfig.name,
    currentXP,
    nextStage,
    nextStageName: nextConfig.name,
    nextStageXP,
    xpNeeded,
    percentage,
    isMaxStage: false,
    message: `${xpNeeded} XP to ${nextConfig.name}`
  };
};

/**
 * Get stage label with emoji
 * (Wrapper for compatibility with existing petStages.js function)
 * 
 * @param {number} stageId - Stage ID
 * @returns {string} Formatted label with emoji
 */
export const getStageLabelWithEmoji = (stageId) => {
  const config = getStageConfig(stageId);
  return `${config.emoji} ${config.label}`;
};

/**
 * Check if pet can evolve to next stage
 * 
 * @param {number} currentStage - Current stage ID
 * @returns {boolean} True if can evolve, false if at max stage
 */
export const canEvolve = (currentStage) => {
  return currentStage < STAGE_THRESHOLDS.ADULT.id;
};

const petProgressionUtils = {
  STAGE_THRESHOLDS,
  getStageConfig,
  getStageFromXP,
  checkEvolution,
  getXPForNextStage,
  getProgressPercentage,
  getProgressToNextStage,
  getStageLabelWithEmoji,
  canEvolve
};

export default petProgressionUtils;

