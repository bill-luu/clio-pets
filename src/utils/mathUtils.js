/**
 * Math utility functions
 */

/**
 * Clamp a value between min and max
 * @param {number} value - The value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
export const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Round to a specific number of decimal places
 * @param {number} value - The value to round
 * @param {number} decimals - Number of decimal places
 * @returns {number} Rounded value
 */
export const roundToDecimal = (value, decimals = 2) => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

/**
 * Calculate percentage between two values
 * @param {number} current - Current value
 * @param {number} max - Maximum value
 * @returns {number} Percentage (0-100)
 */
export const calculatePercentage = (current, max) => {
  if (max === 0) return 0;
  return Math.min(100, Math.max(0, (current / max) * 100));
};

const mathUtils = {
  clamp,
  roundToDecimal,
  calculatePercentage,
};

export default mathUtils;

