import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../firebase";
import { createNotification } from "./notificationService";

/**
 * Cooldown duration in seconds for shared pet interactions
 */
const SHARED_ACTION_COOLDOWN_SECONDS = 600;

/**
 * Action effects for shared pet interactions (limited actions only)
 */
const SHARED_ACTION_EFFECTS = {
  pet: {
    happiness: 15,
    xp: 5,
  },
  treat: {
    happiness: 15,
    fullness: 10,
    xp: 5,
  },
};

/**
 * Clamp a value between min and max
 */
const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Generate a unique shareable ID for a pet
 * @returns {string} Unique shareable ID
 */
export const generateShareableId = () => {
  // Generate a random 12-character alphanumeric string
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Get or create an interactor ID for the current device/browser
 * @returns {string} Interactor ID
 */
export const getInteractorId = () => {
  const storageKey = "clio_pets_interactor_id";
  let interactorId = localStorage.getItem(storageKey);

  if (!interactorId) {
    interactorId = `interactor_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    localStorage.setItem(storageKey, interactorId);
  }

  return interactorId;
};

/**
 * Get a pet by its shareable ID (no authentication required)
 * @param {string} shareableId - The pet's shareable ID
 * @returns {Promise<Object>} Pet object with ID
 */
export const getPetByShareableId = async (shareableId) => {
  try {
    const petsRef = collection(db, "pets");
    const q = query(petsRef, where("shareableId", "==", shareableId), limit(1));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Pet not found or sharing is disabled");
    }

    const petDoc = querySnapshot.docs[0];
    const petData = petDoc.data();

    // Check if sharing is enabled
    if (!petData.sharingEnabled) {
      throw new Error("Sharing is disabled for this pet");
    }

    return {
      id: petDoc.id,
      ...petData,
    };
  } catch (error) {
    console.error("Error getting pet by shareable ID:", error);
    throw error;
  }
};

/**
 * Check cooldown for a specific interactor on a shared pet
 * @param {string} petId - The pet's document ID
 * @param {string} interactorId - The interactor's ID
 * @returns {Promise<Object>} Cooldown status
 */
export const checkSharedCooldown = async (petId, interactorId) => {
  try {
    const interactionsRef = collection(db, "petInteractions");
    const q = query(
      interactionsRef,
      where("petId", "==", petId),
      where("interactorId", "==", interactorId),
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
      SHARED_ACTION_COOLDOWN_SECONDS - timeSinceLastAction
    );

    return {
      isOnCooldown: remainingSeconds > 0,
      remainingSeconds: Math.ceil(remainingSeconds),
    };
  } catch (error) {
    console.error("Error checking shared cooldown:", error);
    // If there's an error (e.g., index not created yet), allow the action
    return { isOnCooldown: false, remainingSeconds: 0 };
  }
};

/**
 * Perform an action on a shared pet
 * @param {string} shareableId - The pet's shareable ID
 * @param {string} interactorId - The interactor's ID
 * @param {string} actionType - Type of action (pet or treat)
 * @returns {Promise<Object>} Action result
 */
export const performSharedPetAction = async (
  shareableId,
  interactorId,
  actionType
) => {
  try {
    // Validate action type
    if (!SHARED_ACTION_EFFECTS[actionType]) {
      throw new Error(`Invalid action type: ${actionType}`);
    }

    // Get pet data
    const pet = await getPetByShareableId(shareableId);

    // Check cooldown for this interactor
    const cooldownStatus = await checkSharedCooldown(pet.id, interactorId);
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
    const effects = SHARED_ACTION_EFFECTS[actionType];
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
    const petRef = doc(db, "pets", pet.id);
    await updateDoc(petRef, {
      ...newStats,
      updatedAt: serverTimestamp(),
    });

    // Record the interaction
    const interactionsRef = collection(db, "petInteractions");
    await addDoc(interactionsRef, {
      petId: pet.id,
      interactorId,
      actionType,
      timestamp: serverTimestamp(),
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
        actionPerformedBy: "visitor",
        interactorId,
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
    console.error("Error performing shared pet action:", error);
    throw error;
  }
};

/**
 * Get interaction count for a pet
 * @param {string} petId - The pet's document ID
 * @returns {Promise<Object>} Interaction statistics
 */
export const getInteractionCount = async (petId) => {
  try {
    const interactionsRef = collection(db, "petInteractions");
    const q = query(interactionsRef, where("petId", "==", petId));
    const querySnapshot = await getDocs(q);

    // Count unique interactors
    const uniqueInteractors = new Set();
    querySnapshot.forEach((doc) => {
      uniqueInteractors.add(doc.data().interactorId);
    });

    return {
      totalInteractions: querySnapshot.size,
      uniqueInteractors: uniqueInteractors.size,
    };
  } catch (error) {
    console.error("Error getting interaction count:", error);
    // Return 0 if there's an error
    return {
      totalInteractions: 0,
      uniqueInteractors: 0,
    };
  }
};

/**
 * Get available actions for shared pets
 * @returns {Array} Array of available shared actions
 */
export const getSharedActions = () => {
  return [
    {
      type: "pet",
      name: "Pet",
      description: "Give the pet some love and attention",
      icon: "❤️",
    },
    {
      type: "treat",
      name: "Treat",
      description: "Give the pet a tasty treat",
      icon: "🦴",
    },
  ];
};

/**
 * Subscribe to real-time updates for a pet by its shareable ID
 * @param {string} shareableId - The pet's shareable ID
 * @param {Function} callback - Callback function that receives (pet, error)
 * @returns {Function} Unsubscribe function to stop listening
 */
export const subscribeToPetByShareableId = (shareableId, callback) => {
  try {
    const petsRef = collection(db, "pets");
    const q = query(petsRef, where("shareableId", "==", shareableId), limit(1));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        if (querySnapshot.empty) {
          callback(null, new Error("Pet not found or sharing is disabled"));
          return;
        }

        const petDoc = querySnapshot.docs[0];
        const petData = petDoc.data();

        // Check if sharing is enabled
        if (!petData.sharingEnabled) {
          callback(null, new Error("Sharing is disabled for this pet"));
          return;
        }

        callback(
          {
            id: petDoc.id,
            ...petData,
          },
          null
        );
      },
      (error) => {
        console.error("Error in shared pet subscription:", error);
        callback(null, error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up shared pet subscription:", error);
    callback(null, error);
    return () => {}; // Return no-op unsubscribe function
  }
};

const sharedPetService = {
  generateShareableId,
  getInteractorId,
  getPetByShareableId,
  performSharedPetAction,
  checkSharedCooldown,
  getInteractionCount,
  getSharedActions,
  subscribeToPetByShareableId,
  SHARED_ACTION_COOLDOWN_SECONDS,
};

export default sharedPetService;
