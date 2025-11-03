// Pet life stage constants and utilities

export const PET_STAGES = {
  BABY: 1,
  TEEN: 2,
  ADULT: 3,
};

export const STAGE_INFO = {
  1: {
    name: "Baby",
    emoji: "🍼",
    label: "Baby",
    color: "#74b9ff", // Light blue
  },
  2: {
    name: "Teen",
    emoji: "🧒",
    label: "Teen",
    color: "#55efc4", // Light green
  },
  3: {
    name: "Adult",
    emoji: "👨",
    label: "Adult",
    color: "#6c5ce7", // Purple
  },
};

/**
 * Get stage information by stage number
 * @param {number} stage - Stage number (1, 2, or 3)
 * @returns {Object} Stage info object with name, emoji, label, and color
 */
export const getStageInfo = (stage) => {
  // Default to baby if stage is not set or invalid
  return STAGE_INFO[stage] || STAGE_INFO[PET_STAGES.BABY];
};

/**
 * Get stage label with emoji
 * @param {number} stage - Stage number (1, 2, or 3)
 * @returns {string} Formatted stage label (e.g., "🍼 Baby")
 */
export const getStageLabelWithEmoji = (stage) => {
  const info = getStageInfo(stage);
  return `${info.emoji} ${info.label}`;
};

/**
 * Get the next stage number
 * @param {number} currentStage - Current stage number
 * @returns {number|null} Next stage number or null if already at max stage
 */
export const getNextStage = (currentStage) => {
  if (currentStage < PET_STAGES.ADULT) {
    return currentStage + 1;
  }
  return null; // Already at adult stage
};

/**
 * Check if pet can evolve to next stage
 * @param {number} currentStage - Current stage number
 * @returns {boolean} True if can evolve, false otherwise
 */
export const canEvolve = (currentStage) => {
  return getNextStage(currentStage) !== null;
};

