// Pet age calculation and stat decay utilities

/**
 * Calculate stat decay amount based on time elapsed
 * Formula: Base decay (5 per day)
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
  
  // Base decay: -5 per day
  const baseDecay = daysSinceLastCheck * 5;
  
  return baseDecay;
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
 * 4. If threshold met: age increases by 1 month per day
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
  
  // Calculate age increase (1 month per day)
  const monthsGained = meetsThreshold ? daysSinceLastCheck : 0;
  const newAge = (pet.ageInYears || 0) + monthsGained; // Note: ageInYears field stores months
  
  // Format message appropriately
  let ageMessage;
  if (meetsThreshold) {
    if (monthsGained === 1) {
      ageMessage = 'Your pet aged 1 month!';
    } else if (monthsGained < 12) {
      ageMessage = `Your pet aged ${monthsGained} months!`;
    } else {
      const years = Math.floor(monthsGained / 12);
      const months = monthsGained % 12;
      if (months === 0) {
        ageMessage = `Your pet aged ${years} year${years > 1 ? 's' : ''}!`;
      } else {
        ageMessage = `Your pet aged ${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}!`;
      }
    }
  } else {
    ageMessage = 'Your pet did not meet the care threshold to age.';
  }
  
  return {
    shouldUpdate: true,
    aged: monthsGained > 0,
    decayed: decayAmount > 0,
    yearsGained: monthsGained, // Keep field name for compatibility
    decayAmount,
    daysSinceLastCheck,
    averageStats,
    meetsThreshold,
    newStats: statsAfterDecay,
    newAge,
    message: ageMessage
  };
};

/**
 * Format age for display (converts months to years/months format)
 * 
 * @param {number} ageInMonths - Age in months (can be 0)
 * @returns {string} Formatted age string
 */
export const formatAgeDisplay = (ageInMonths) => {
  if (!ageInMonths || ageInMonths === 0) {
    return "Newborn";
  }
  
  // Less than 1 month (shouldn't happen but handle it)
  if (ageInMonths < 1) {
    return "Newborn";
  }
  
  // Less than 12 months: show in months
  if (ageInMonths < 12) {
    return ageInMonths === 1 ? "1 month old" : `${ageInMonths} months old`;
  }
  
  // 12+ months: show in years and months
  const years = Math.floor(ageInMonths / 12);
  const months = ageInMonths % 12;
  
  if (months === 0) {
    return years === 1 ? "1 year old" : `${years} years old`;
  }
  
  const yearsPart = years === 1 ? "1 year" : `${years} years`;
  const monthsPart = months === 1 ? "1 month" : `${months} months`;
  
  return `${yearsPart}, ${monthsPart} old`;
};

/**
 * Get age status message based on age in months
 * 
 * @param {number} ageInMonths - Age in months
 * @returns {string} Status message
 */
export const getAgeStatus = (ageInMonths) => {
  if (ageInMonths === 0) return "Just born!";
  if (ageInMonths <= 3) return "Just born!";
  if (ageInMonths <= 12) return "Very young";
  if (ageInMonths <= 24) return "Young";
  if (ageInMonths <= 84) return "Mature"; // 7 years
  if (ageInMonths <= 180) return "Senior"; // 15 years
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

