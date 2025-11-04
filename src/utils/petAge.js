// Pet age calculation and stat decay utilities

/**
 * Calculate stat decay amount based on time elapsed
 * Formula: Base decay (10 per day) + Inactivity decay (5 per day since last action)
 * 
 * @param {Object} pet - The pet object with timestamps
 * @param {number} now - Current timestamp in milliseconds
 * @returns {number} Total decay amount to subtract from each stat
 */
export const calculateStatDecay = (pet, now) => {
  const lastCheck = pet.lastAgeCheck?.toMillis 
    ? pet.lastAgeCheck.toMillis() 
    : pet.lastAgeCheck || pet.createdAt?.toMillis?.() || now;
  
  const daysSinceLastCheck = Math.floor((now - lastCheck) / (1000 * 60 * 60 * 24));
  
  if (daysSinceLastCheck === 0) {
    return 0; // No decay on same day
  }
  
  // Base decay: -10 per day
  const baseDecay = daysSinceLastCheck * 10;
  
  // Calculate inactivity decay
  const lastAction = pet.lastActionAt?.toMillis 
    ? pet.lastActionAt.toMillis() 
    : pet.lastActionAt || pet.createdAt?.toMillis?.() || now;
  
  const daysSinceAction = Math.floor((now - lastAction) / (1000 * 60 * 60 * 24));
  
  // Extra -5 per day of inactivity
  const inactivityDecay = daysSinceAction > 0 ? daysSinceAction * 5 : 0;
  
  return baseDecay + inactivityDecay;
};

/**
 * Check if pet meets the stats threshold for aging
 * Threshold: 3 out of 4 stats must be >= 45
 * 
 * @param {Object} stats - Object with fullness, happiness, cleanliness, energy
 * @returns {boolean} True if threshold met, false otherwise
 */
export const checkStatsThreshold = (stats) => {
  const statValues = [
    stats.fullness || 50,
    stats.happiness || 50,
    stats.cleanliness || 50,
    stats.energy || 50
  ];
  
  const statsAboveThreshold = statValues.filter(stat => stat >= 45).length;
  return statsAboveThreshold >= 3;
};

/**
 * Clamp a value between min and max
 * @param {number} value - The value to clamp
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Clamped value
 */
const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Evaluate pet age and apply stat decay (using average decay system)
 * 
 * Process:
 * 1. Calculate decay amount
 * 2. Calculate stats before and after decay
 * 3. Use AVERAGE of before/after stats to check threshold
 * 4. If threshold met: age increases
 * 5. Apply decay to stats
 * 
 * @param {Object} pet - The pet object with all stats and timestamps
 * @returns {Object} Evaluation result with aging and decay info
 */
export const evaluatePetAge = (pet) => {
  const now = Date.now();
  const lastCheck = pet.lastAgeCheck?.toMillis 
    ? pet.lastAgeCheck.toMillis() 
    : pet.lastAgeCheck || pet.createdAt?.toMillis?.() || now;
  
  const daysSinceLastCheck = Math.floor((now - lastCheck) / (1000 * 60 * 60 * 24));
  
  // No evaluation needed if less than 1 day has passed
  if (daysSinceLastCheck < 1) {
    return {
      shouldUpdate: false,
      aged: false,
      decayed: false,
      yearsGained: 0,
      decayAmount: 0,
      newStats: {
        fullness: pet.fullness || 50,
        happiness: pet.happiness || 50,
        cleanliness: pet.cleanliness || 50,
        energy: pet.energy || 50
      },
      newAge: pet.ageInYears || 0
    };
  }
  
  // Get current stats (before decay)
  const currentStats = {
    fullness: pet.fullness || 50,
    happiness: pet.happiness || 50,
    cleanliness: pet.cleanliness || 50,
    energy: pet.energy || 50
  };
  
  // Calculate decay amount
  const decayAmount = calculateStatDecay(pet, now);
  
  // Calculate stats after decay
  const statsAfterDecay = {
    fullness: clamp(currentStats.fullness - decayAmount, 0, 100),
    happiness: clamp(currentStats.happiness - decayAmount, 0, 100),
    cleanliness: clamp(currentStats.cleanliness - decayAmount, 0, 100),
    energy: clamp(currentStats.energy - decayAmount, 0, 100)
  };
  
  // Calculate AVERAGE stats (before + after) / 2
  const averageStats = {
    fullness: (currentStats.fullness + statsAfterDecay.fullness) / 2,
    happiness: (currentStats.happiness + statsAfterDecay.happiness) / 2,
    cleanliness: (currentStats.cleanliness + statsAfterDecay.cleanliness) / 2,
    energy: (currentStats.energy + statsAfterDecay.energy) / 2
  };
  
  // Check threshold with AVERAGE stats
  const meetsThreshold = checkStatsThreshold(averageStats);
  
  // Calculate age increase
  const yearsGained = meetsThreshold ? daysSinceLastCheck : 0;
  const newAge = (pet.ageInYears || 0) + yearsGained;
  
  return {
    shouldUpdate: true,
    aged: yearsGained > 0,
    decayed: decayAmount > 0,
    yearsGained,
    decayAmount,
    daysSinceLastCheck,
    averageStats,
    meetsThreshold,
    newStats: statsAfterDecay,
    newAge,
    message: meetsThreshold 
      ? `Your pet aged ${yearsGained} year${yearsGained > 1 ? 's' : ''}!`
      : 'Your pet did not meet the care threshold to age.'
  };
};

/**
 * Format age in years for display
 * 
 * @param {number} ageInYears - Age in years (can be 0)
 * @returns {string} Formatted age string
 */
export const formatAgeDisplay = (ageInYears) => {
  if (!ageInYears || ageInYears === 0) {
    return "Newborn";
  }
  
  if (ageInYears === 1) {
    return "1 year old";
  }
  
  return `${ageInYears} years old`;
};

/**
 * Get age status message based on age
 * 
 * @param {number} ageInYears - Age in years
 * @returns {string} Status message
 */
export const getAgeStatus = (ageInYears) => {
  if (ageInYears === 0) return "Just born!";
  if (ageInYears <= 2) return "Very young";
  if (ageInYears <= 5) return "Young";
  if (ageInYears <= 10) return "Mature";
  if (ageInYears <= 15) return "Senior";
  return "Elder";
};

const petAgeUtils = {
  calculateStatDecay,
  checkStatsThreshold,
  evaluatePetAge,
  formatAgeDisplay,
  getAgeStatus
};

export default petAgeUtils;

