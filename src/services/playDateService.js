import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { createNotification } from "./notificationService";

/**
 * Cooldown duration in seconds for play dates (6 hours)
 */
const PLAYDATE_COOLDOWN_SECONDS = 21600; // 6 hours

/**
 * Play date activity definitions with their effects
 */
const PLAYDATE_ACTIVITIES = {
  parkVisit: {
    id: "parkVisit",
    name: "Park Visit",
    description: "The pets had a wonderful time playing together at the park!",
    emoji: "🌳",
    effects: {
      happiness: 15,
      energy: 10,
      xp: 10,
    },
  },
  restaurant: {
    id: "restaurant",
    name: "Restaurant",
    description: "The pets enjoyed a delicious meal together at a pet-friendly restaurant!",
    emoji: "🍽️",
    effects: {
      happiness: 10,
      fullness: 15,
      xp: 10,
    },
  },
  officeVisit: {
    id: "officeVisit",
    name: "Office Visit",
    description: "The pets visited Clio's office and met lots of people!",
    emoji: "🏢",
    effects: {
      happiness: 5,
      energy: -10,
      xp: 10,
    },
  },
  spar: {
    id: "spar",
    name: "Spar",
    description: "The pets had an energetic sparring session and learned new moves!",
    emoji: "🥊",
    effects: {
      happiness: 20,
      energy: -15,
      xp: 15,
    },
  },
  grooming: {
    id: "grooming",
    name: "Grooming",
    description: "The pets got pampered together at a grooming spa!",
    emoji: "✨",
    effects: {
      happiness: 10,
      cleanliness: 20,
      xp: 15,
    },
  },
  racecarDriving: {
    id: "racecarDriving",
    name: "Racecar Driving",
    description: "The pets went racecar driving and had an adrenaline-pumping adventure!",
    emoji: "🏎️",
    effects: {
      happiness: 25,
      energy: -10,
      xp: 50,
    },
  },
};

/**
 * Clamp a value between min and max
 */
const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Get a random play date activity
 * @returns {Object} Random activity object
 */
export const getRandomActivity = () => {
  const activities = Object.values(PLAYDATE_ACTIVITIES);
  const randomIndex = Math.floor(Math.random() * activities.length);
  return activities[randomIndex];
};

/**
 * Get all play date activities
 * @returns {Array} Array of activity objects
 */
export const getAllActivities = () => {
  return Object.values(PLAYDATE_ACTIVITIES);
};

/**
 * Check play date cooldown for a user
 * @param {string} userId - The user's ID initiating the play date
 * @returns {Promise<Object>} Cooldown status
 */
export const checkPlayDateCooldown = async (userId) => {
  try {
    const interactionsRef = collection(db, "petInteractions");
    const q = query(
      interactionsRef,
      where("initiatorUserId", "==", userId),
      where("actionType", "==", "playdate"),
      orderBy("timestamp", "desc"),
      limit(1)
    );

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { isOnCooldown: false, remainingSeconds: 0 };
    }

    const lastInteraction = querySnapshot.docs[0].data();
    const now = Date.now();
    const lastActionTime = lastInteraction.timestamp.toMillis
      ? lastInteraction.timestamp.toMillis()
      : lastInteraction.timestamp;
    const timeSinceLastAction = (now - lastActionTime) / 1000;
    const remainingSeconds = Math.max(
      0,
      PLAYDATE_COOLDOWN_SECONDS - timeSinceLastAction
    );

    return {
      isOnCooldown: remainingSeconds > 0,
      remainingSeconds: Math.ceil(remainingSeconds),
    };
  } catch (error) {
    console.error("Error checking play date cooldown:", error);
    // If there's an error (e.g., index not created yet), allow the action
    return { isOnCooldown: false, remainingSeconds: 0 };
  }
};

/**
 * Perform a play date between two pets
 * @param {string} userPetId - The initiating user's pet ID
 * @param {string} otherPetId - The other user's pet ID
 * @param {string} userId - The initiating user's ID
 * @returns {Promise<Object>} Play date result with activity and stat changes
 */
export const performPlayDate = async (userPetId, otherPetId, userId) => {
  try {
    // Check cooldown
    const cooldownStatus = await checkPlayDateCooldown(userId);
    if (cooldownStatus.isOnCooldown) {
      throw new Error(
        `Please wait ${Math.floor(cooldownStatus.remainingSeconds / 3600)} hours and ${Math.floor((cooldownStatus.remainingSeconds % 3600) / 60)} minutes before going on another play date.`
      );
    }

    // Get both pets
    const userPetRef = doc(db, "pets", userPetId);
    const otherPetRef = doc(db, "pets", otherPetId);

    const [userPetDoc, otherPetDoc] = await Promise.all([
      getDoc(userPetRef),
      getDoc(otherPetRef),
    ]);

    if (!userPetDoc.exists() || !otherPetDoc.exists()) {
      throw new Error("One or both pets not found");
    }

    const userPet = { id: userPetDoc.id, ...userPetDoc.data() };
    const otherPet = { id: otherPetDoc.id, ...otherPetDoc.data() };

    // Select random activity
    const activity = getRandomActivity();

    // Calculate new stats for user's pet
    const userPetOldStats = {
      fullness: userPet.fullness || 50,
      happiness: userPet.happiness || 50,
      cleanliness: userPet.cleanliness || 50,
      energy: userPet.energy || 50,
      xp: userPet.xp || 0,
    };

    const userPetNewStats = {
      fullness: clamp(
        userPetOldStats.fullness + (activity.effects.fullness || 0),
        0,
        100
      ),
      happiness: clamp(
        userPetOldStats.happiness + (activity.effects.happiness || 0),
        0,
        100
      ),
      cleanliness: clamp(
        userPetOldStats.cleanliness + (activity.effects.cleanliness || 0),
        0,
        100
      ),
      energy: clamp(
        userPetOldStats.energy + (activity.effects.energy || 0),
        0,
        100
      ),
      xp: userPetOldStats.xp + (activity.effects.xp || 0),
    };

    // Calculate new stats for other pet
    const otherPetOldStats = {
      fullness: otherPet.fullness || 50,
      happiness: otherPet.happiness || 50,
      cleanliness: otherPet.cleanliness || 50,
      energy: otherPet.energy || 50,
      xp: otherPet.xp || 0,
    };

    const otherPetNewStats = {
      fullness: clamp(
        otherPetOldStats.fullness + (activity.effects.fullness || 0),
        0,
        100
      ),
      happiness: clamp(
        otherPetOldStats.happiness + (activity.effects.happiness || 0),
        0,
        100
      ),
      cleanliness: clamp(
        otherPetOldStats.cleanliness + (activity.effects.cleanliness || 0),
        0,
        100
      ),
      energy: clamp(
        otherPetOldStats.energy + (activity.effects.energy || 0),
        0,
        100
      ),
      xp: otherPetOldStats.xp + (activity.effects.xp || 0),
    };

    // Update both pets in database
    await Promise.all([
      updateDoc(userPetRef, {
        ...userPetNewStats,
        updatedAt: serverTimestamp(),
      }),
      updateDoc(otherPetRef, {
        ...otherPetNewStats,
        updatedAt: serverTimestamp(),
      }),
    ]);

    // Record the interaction
    const interactionsRef = collection(db, "petInteractions");
    await addDoc(interactionsRef, {
      petId: userPetId,
      otherPetId: otherPetId,
      initiatorUserId: userId,
      actionType: "playdate",
      activityId: activity.id,
      timestamp: serverTimestamp(),
    });

    // Create notifications for both pet owners
    try {
      // Notification for initiating user
      const userStatChanges = {};
      Object.keys(userPetOldStats).forEach((stat) => {
        userStatChanges[stat] = {
          before: userPetOldStats[stat],
          after: userPetNewStats[stat],
        };
      });

      await createNotification({
        userId: userPet.userId,
        petId: userPet.id,
        petName: userPet.name,
        actionType: "playdate",
        actionPerformedBy: "playdate",
        interactorId: userId,
        statChanges: userStatChanges,
        metadata: {
          activityName: activity.name,
          otherPetName: otherPet.name,
        },
      });

      // Notification for other pet owner
      const otherStatChanges = {};
      Object.keys(otherPetOldStats).forEach((stat) => {
        otherStatChanges[stat] = {
          before: otherPetOldStats[stat],
          after: otherPetNewStats[stat],
        };
      });

      await createNotification({
        userId: otherPet.userId,
        petId: otherPet.id,
        petName: otherPet.name,
        actionType: "playdate",
        actionPerformedBy: "playdate",
        interactorId: userId,
        statChanges: otherStatChanges,
        metadata: {
          activityName: activity.name,
          otherPetName: userPet.name,
        },
      });
    } catch (notificationError) {
      // Don't fail the play date if notification creation fails
      console.error("Error creating play date notifications:", notificationError);
    }

    return {
      success: true,
      activity,
      userPet: {
        ...userPet,
        oldStats: userPetOldStats,
        newStats: userPetNewStats,
      },
      otherPet: {
        ...otherPet,
        oldStats: otherPetOldStats,
        newStats: otherPetNewStats,
      },
    };
  } catch (error) {
    console.error("Error performing play date:", error);
    throw error;
  }
};

const playDateService = {
  performPlayDate,
  checkPlayDateCooldown,
  getRandomActivity,
  getAllActivities,
  PLAYDATE_COOLDOWN_SECONDS,
  PLAYDATE_ACTIVITIES,
};

export default playDateService;

