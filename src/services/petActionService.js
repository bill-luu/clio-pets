import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { getPetById } from "./petService";
import { createNotification } from "./notificationService";

/**
 * Cooldown duration in seconds
 */
const ACTION_COOLDOWN_SECONDS = 600;

/**
 * Pet action types and their effects on stats
 */
const ACTION_EFFECTS = {
  feed: {
    fullness: 20,
    xp: 5,
  },
  play: {
    happiness: 20,
    energy: -10,
    xp: 10,
  },
  clean: {
    cleanliness: 25,
    xp: 5,
  },
  rest: {
    energy: 30,
    xp: 5,
  },
  exercise: {
    energy: -15,
    happiness: 10,
    fullness: -10,
    xp: 15,
  },
  treat: {
    fullness: 10,
    happiness: 15,
    xp: 5,
  },
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
 * Check if a pet is on cooldown
 * @param {Object} pet - The pet object
 * @returns {Object} Cooldown status with isOnCooldown and remainingSeconds
 */
export const checkCooldown = (pet) => {
  if (!pet.lastActionAt) {
    return { isOnCooldown: false, remainingSeconds: 0 };
  }

  const now = Date.now();
  const lastActionTime = pet.lastActionAt.toMillis
    ? pet.lastActionAt.toMillis()
    : pet.lastActionAt;
  const timeSinceLastAction = (now - lastActionTime) / 1000; // Convert to seconds
  const remainingSeconds = Math.max(
    0,
    ACTION_COOLDOWN_SECONDS - timeSinceLastAction
  );

  return {
    isOnCooldown: remainingSeconds > 0,
    remainingSeconds: Math.ceil(remainingSeconds),
  };
};

/**
 * Perform an action on a pet
 * @param {string} petId - The pet's document ID
 * @param {string} actionType - Type of action (feed, play, clean, rest, exercise, treat)
 * @param {string} userId - The user performing the action (optional, for notification)
 * @returns {Promise<Object>} Updated pet stats
 */
export const performPetAction = async (petId, actionType, userId = null) => {
  try {
    // Validate action type
    if (!ACTION_EFFECTS[actionType]) {
      throw new Error(`Invalid action type: ${actionType}`);
    }

    // Get current pet data
    const pet = await getPetById(petId);

    // Check cooldown
    const cooldownStatus = checkCooldown(pet);
    if (cooldownStatus.isOnCooldown) {
      throw new Error(
        `Please wait ${cooldownStatus.remainingSeconds} seconds before performing another action.`
      );
    }

    // Store old stats for notification
    const oldStats = {
      fullness: pet.fullness || 50,
      happiness: pet.happiness || 50,
      cleanliness: pet.cleanliness || 50,
      energy: pet.energy || 50,
      xp: pet.xp || 0,
    };

    // Calculate new stats
    const effects = ACTION_EFFECTS[actionType];
    const newStats = {
      fullness: clamp((pet.fullness || 50) + (effects.fullness || 0), 0, 100),
      happiness: clamp(
        (pet.happiness || 50) + (effects.happiness || 0),
        0,
        100
      ),
      cleanliness: clamp(
        (pet.cleanliness || 50) + (effects.cleanliness || 0),
        0,
        100
      ),
      energy: clamp((pet.energy || 50) + (effects.energy || 0), 0, 100),
      xp: (pet.xp || 0) + (effects.xp || 0),
    };

    // Update pet in database
    const petRef = doc(db, "pets", petId);
    await updateDoc(petRef, {
      ...newStats,
      lastActionAt: serverTimestamp(),
      lastActionType: actionType,
      updatedAt: serverTimestamp(),
    });

    // Create notification for pet owner
    try {
      const statChanges = {};
      Object.keys(oldStats).forEach((stat) => {
        statChanges[stat] = {
          before: oldStats[stat],
          after: newStats[stat],
        };
      });

      await createNotification({
        userId: pet.userId,
        petId: pet.id,
        petName: pet.name,
        actionType,
        actionPerformedBy: "owner",
        interactorId: userId || pet.userId,
        statChanges,
      });
    } catch (notificationError) {
      // Don't fail the action if notification creation fails
      console.error("Error creating notification:", notificationError);
    }

    return {
      success: true,
      actionType,
      effects,
      newStats,
    };
  } catch (error) {
    console.error("Error performing pet action:", error);
    throw error;
  }
};

/**
 * Apply natural decay to pet stats over time
 * @param {string} petId - The pet's document ID
 * @param {number} decayAmount - Amount to decay each stat (default: 5)
 * @returns {Promise<Object>} Updated pet stats
 */
export const applyStatDecay = async (petId, decayAmount = 5) => {
  try {
    // Get current pet data
    const pet = await getPetById(petId);

    // Calculate decayed stats (all stats except xp decrease)
    const newStats = {
      fullness: clamp((pet.fullness || 50) - decayAmount, 0, 100),
      happiness: clamp((pet.happiness || 50) - decayAmount, 0, 100),
      cleanliness: clamp((pet.cleanliness || 50) - decayAmount, 0, 100),
      energy: clamp((pet.energy || 50) - decayAmount, 0, 100),
      xp: pet.xp || 0, // XP doesn't decay
    };

    // Update pet in database
    const petRef = doc(db, "pets", petId);
    await updateDoc(petRef, {
      ...newStats,
      updatedAt: serverTimestamp(),
    });

    return {
      success: true,
      newStats,
    };
  } catch (error) {
    console.error("Error applying stat decay:", error);
    throw error;
  }
};

/**
 * Get available actions for a pet based on current stats
 * @param {Object} pet - The pet object with current stats
 * @returns {Array} Array of available actions with recommendations
 */
export const getAvailableActions = (pet) => {
  const actions = [
    {
      type: "feed",
      name: "Feed",
      description: "Give your pet food to increase fullness",
      icon: "🍖",
      urgent: pet.fullness < 30,
      disabled: pet.fullness >= 95,
    },
    {
      type: "play",
      name: "Play",
      description: "Play with your pet to increase happiness",
      icon: "🎾",
      urgent: pet.happiness < 30,
      disabled: pet.energy < 15,
    },
    {
      type: "clean",
      name: "Clean",
      description: "Clean your pet to increase cleanliness",
      icon: "🛁",
      urgent: pet.cleanliness < 30,
      disabled: pet.cleanliness >= 95,
    },
    {
      type: "rest",
      name: "Rest",
      description: "Let your pet rest to restore energy",
      icon: "😴",
      urgent: pet.energy < 30,
      disabled: pet.energy >= 95,
    },
    {
      type: "exercise",
      name: "Exercise",
      description: "Exercise your pet for fitness and happiness",
      icon: "🏃",
      urgent: false,
      disabled: pet.energy < 20 || pet.fullness < 15,
    },
    {
      type: "treat",
      name: "Treat",
      description: "Give your pet a treat for happiness and fullness",
      icon: "🦴",
      urgent: false,
      disabled: pet.fullness >= 95,
    },
  ];

  return actions;
};

/**
 * Get pet status based on stats
 * @param {Object} pet - The pet object with current stats
 * @returns {Object} Status information
 */
export const getPetStatus = (pet) => {
  const avgStat =
    (pet.fullness + pet.happiness + pet.cleanliness + pet.energy) / 4;

  let status = "happy";
  let message = "Your pet is doing great!";

  if (avgStat < 25) {
    status = "critical";
    message = "Your pet needs immediate attention!";
  } else if (avgStat < 40) {
    status = "unhappy";
    message = "Your pet needs some care.";
  } else if (avgStat < 60) {
    status = "okay";
    message = "Your pet is doing okay.";
  } else if (avgStat >= 80) {
    status = "excellent";
    message = "Your pet is thriving!";
  }

  // Check for critical individual stats
  const criticalStats = [];
  if (pet.fullness < 20) criticalStats.push("hungry");
  if (pet.happiness < 20) criticalStats.push("sad");
  if (pet.cleanliness < 20) criticalStats.push("dirty");
  if (pet.energy < 20) criticalStats.push("exhausted");

  if (criticalStats.length > 0) {
    status = "critical";
    message = `Your pet is ${criticalStats.join(", ")}!`;
  }

  return {
    status,
    message,
    avgStat: Math.round(avgStat),
    criticalStats,
  };
};

const petActionService = {
  performPetAction,
  applyStatDecay,
  getAvailableActions,
  getPetStatus,
  checkCooldown,
  ACTION_EFFECTS,
  ACTION_COOLDOWN_SECONDS,
};

export default petActionService;
