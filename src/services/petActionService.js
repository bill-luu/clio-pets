import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { getPetById } from "./petService";
import { evaluatePetAge } from "../utils/petAge";
import { checkEvolution } from "../utils/petProgression";
import { createNotification } from "./notificationService";
import {
  calculateStreak,
  getTodayDateString,
  checkStreakMilestone,
} from "../utils/streakTracker";
import { calculateRemainingCooldown } from "../utils/cooldownCalculator";
import { getInteractionCount } from "./sharedPetService";
import { clamp } from "../utils/mathUtils";

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
 * Check if a pet is on cooldown (with dynamic cooldown reduction)
 * @param {Object} pet - The pet object
 * @param {number} uniqueInteractors - Number of unique interactors (optional, will fetch if not provided)
 * @returns {Object} Cooldown status with isOnCooldown and remainingSeconds
 */
export const checkCooldown = async (pet, uniqueInteractors = null) => {
  // If uniqueInteractors not provided, fetch it
  if (uniqueInteractors === null && pet.sharingEnabled) {
    try {
      const stats = await getInteractionCount(pet.id);
      uniqueInteractors = stats.uniqueInteractors;
    } catch (error) {
      console.error("Error fetching interaction count:", error);
      uniqueInteractors = 0;
    }
  } else if (uniqueInteractors === null) {
    uniqueInteractors = 0;
  }

  const streak = pet.currentStreak || 0;
  const cooldownStatus = calculateRemainingCooldown(
    pet.lastActionAt,
    streak,
    uniqueInteractors
  );

  return {
    isOnCooldown: cooldownStatus.isOnCooldown,
    remainingSeconds: cooldownStatus.remainingSeconds,
    effectiveCooldown: cooldownStatus.effectiveCooldown,
  };
};

/**
 * Perform an action on a pet
 * @param {string} petId - The pet's document ID
 * @param {string} actionType - Type of action (feed, play, clean, rest, exercise, treat)
 * @param {string} userId - The user performing the action (optional, for notification)
 * @returns {Promise<Object>} Updated pet stats, evolution, and age info
 */
export const performPetAction = async (petId, actionType, userId = null) => {
  try {
    // Validate action type
    if (!ACTION_EFFECTS[actionType]) {
      throw new Error(`Invalid action type: ${actionType}`);
    }

    // Get current pet data
    const pet = await getPetById(petId);

    // Get interaction count for cooldown calculation
    let uniqueInteractors = 0;
    if (pet.sharingEnabled) {
      try {
        const stats = await getInteractionCount(pet.id);
        uniqueInteractors = stats.uniqueInteractors;
      } catch (error) {
        console.error("Error fetching interaction count:", error);
      }
    }

    // Check cooldown with bonuses
    const cooldownStatus = await checkCooldown(pet, uniqueInteractors);
    if (cooldownStatus.isOnCooldown) {
      throw new Error(
        `Please wait ${cooldownStatus.remainingSeconds} seconds before performing another action.`
      );
    }

    // Calculate and update streak
    const streakResult = calculateStreak(
      pet.lastInteractionDate,
      pet.currentStreak || 0
    );
    const today = getTodayDateString();

    // Check for streak milestone
    const milestone = checkStreakMilestone(
      pet.currentStreak || 0,
      streakResult.newStreak
    );

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

    // Check for stage evolution based on new XP
    const currentStage = pet.stage || 1;
    const evolutionResult = checkEvolution(currentStage, newStats.xp);

    // Create a temporary pet object with new stats for age evaluation
    const petWithNewStats = {
      ...pet,
      ...newStats,
    };

    // Evaluate pet age (checks if 24+ hours passed and applies decay)
    const ageEvaluation = evaluatePetAge(petWithNewStats);

    // Prepare update data
    const updateData = {
      ...newStats,
      lastActionAt: serverTimestamp(),
      lastActionType: actionType,
      updatedAt: serverTimestamp(),
      // Update streak data
      lastInteractionDate: today,
      currentStreak: streakResult.newStreak,
      longestStreak: Math.max(pet.longestStreak || 0, streakResult.newStreak),
    };

    // If pet evolved, update stage
    if (evolutionResult.evolved) {
      updateData.stage = evolutionResult.newStage;
    }

    // If age evaluation happened, update age and stats after decay
    if (ageEvaluation.shouldUpdate) {
      updateData.ageInYears = ageEvaluation.newAge;
      updateData.lastAgeCheck = serverTimestamp();
      // Use decayed stats instead of pre-decay stats
      updateData.fullness = ageEvaluation.newStats.fullness;
      updateData.happiness = ageEvaluation.newStats.happiness;
      updateData.cleanliness = ageEvaluation.newStats.cleanliness;
      updateData.energy = ageEvaluation.newStats.energy;
    }

    // Update pet in database
    const petRef = doc(db, "pets", petId);
    await updateDoc(petRef, updateData);

    // Create notification for pet owner
    try {
      const statChanges = {};
      Object.keys(oldStats).forEach((stat) => {
        statChanges[stat] = {
          before: oldStats[stat],
          after: ageEvaluation.shouldUpdate
            ? ageEvaluation.newStats[stat]
            : newStats[stat],
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
      newStats: ageEvaluation.shouldUpdate ? ageEvaluation.newStats : newStats,
      evolution: evolutionResult.evolved ? evolutionResult : null,
      aging: ageEvaluation.aged ? ageEvaluation : null,
      streak: {
        current: streakResult.newStreak,
        isNewDay: streakResult.isNewDay,
        streakBroken: streakResult.streakBroken,
        milestone: milestone,
      },
      notifications: [
        ...(evolutionResult.evolved ? [evolutionResult.message] : []),
        ...(ageEvaluation.aged ? [ageEvaluation.message] : []),
        ...(ageEvaluation.decayed && ageEvaluation.decayAmount > 0
          ? [
              `Stats decayed by ${ageEvaluation.decayAmount} due to time passing.`,
            ]
          : []),
        ...(streakResult.message && streakResult.isNewDay
          ? [streakResult.message]
          : []),
        ...(milestone ? [milestone.message] : []),
      ],
    };
  } catch (error) {
    console.error("Error performing pet action:", error);
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
  getAvailableActions,
  getPetStatus,
  checkCooldown,
  ACTION_EFFECTS,
  ACTION_COOLDOWN_SECONDS,
};

export default petActionService;
