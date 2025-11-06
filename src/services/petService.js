import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,
  onSnapshot,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase";
import { generateShareableId } from "./sharedPetService";

/**
 * Get all pets for a specific user
 * @param {string} userId - The user's UID
 * @returns {Promise<Array>} Array of pet objects with their IDs
 */
export const getUserPets = async (userId) => {
  try {
    const petsRef = collection(db, "pets");
    const q = query(
      petsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);

    const pets = [];
    querySnapshot.forEach((doc) => {
      pets.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return pets;
  } catch (error) {
    console.error("Error getting user pets:", error);
    throw error;
  }
};

/**
 * Get all pets in the system
 * @returns {Promise<Array>} Array of all pet objects with their IDs
 */
export const getAllPets = async () => {
  try {
    const petsRef = collection(db, "pets");
    const q = query(petsRef, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);

    const pets = [];
    querySnapshot.forEach((doc) => {
      pets.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return pets;
  } catch (error) {
    console.error("Error getting all pets:", error);
    throw error;
  }
};

/**
 * Get a single pet by ID
 * @param {string} petId - The pet's document ID
 * @returns {Promise<Object>} Pet object with ID
 */
export const getPetById = async (petId) => {
  try {
    const petRef = doc(db, "pets", petId);
    const petDoc = await getDoc(petRef);

    if (petDoc.exists()) {
      return {
        id: petDoc.id,
        ...petDoc.data(),
      };
    } else {
      throw new Error("Pet not found");
    }
  } catch (error) {
    console.error("Error getting pet:", error);
    throw error;
  }
};

/**
 * Add a new pet for a user
 * @param {string} userId - The user's UID
 * @param {Object} petData - Pet information (name, species, breed, age, etc.)
 * @param {string} ownerEmail - The user's email address
 * @returns {Promise<string>} The new pet's document ID
 */
export const addPet = async (userId, petData, ownerEmail = null) => {
  try {
    const petsRef = collection(db, "pets");
    const docRef = await addDoc(petsRef, {
      userId,
      ownerEmail,
      // Initialize pet stats with defaults (can be overridden by petData)
      fullness: 50,
      happiness: 50,
      cleanliness: 50,
      energy: 50,
      xp: 0,
      // Initialize economy
      coins: 100,
      items: [],
      // Initialize age tracking (ageInYears stores months)
      ageInYears: 0,
      lastAgeCheck: serverTimestamp(),
      stage: 1, // Default to Baby stage
      // Initialize streak tracking
      lastInteractionDate: null,
      currentStreak: 0,
      longestStreak: 0,
      // Initialize sharing defaults
      shareableId: generateShareableId(),
      sharingEnabled: false,
      // Spread petData AFTER defaults to allow overrides (for test pets)
      ...petData,
      // Always set these timestamps
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return docRef.id;
  } catch (error) {
    console.error("Error adding pet:", error);
    throw error;
  }
};

/**
 * Update an existing pet
 * @param {string} petId - The pet's document ID
 * @param {Object} petData - Updated pet information
 * @returns {Promise<void>}
 */
export const updatePet = async (petId, petData) => {
  try {
    const petRef = doc(db, "pets", petId);
    await updateDoc(petRef, {
      ...petData,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating pet:", error);
    throw error;
  }
};

/**
 * Purchase an item for a pet (atomic transaction)
 * @param {string} petId
 * @param {{name:string, icon?:string, desc?:string, price:number}} item
 */
export const purchaseItem = async (petId, item) => {
  if (!item || typeof item.price !== "number") {
    throw new Error("Invalid item");
  }

  const petRef = doc(db, "pets", petId);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(petRef);
    if (!snap.exists()) {
      throw new Error("Pet not found");
    }
    const data = snap.data();
    const currentCoins = data.coins || 0;
    if (currentCoins < item.price) {
      throw new Error("Not enough coins");
    }

    const newCoins = currentCoins - item.price;
    const currentItems = Array.isArray(data.items) ? data.items : [];

    // Merge by name; increment quantity if already owned
    const index = currentItems.findIndex((it) => {
      if (typeof it === "string") return it === item.name;
      return (it && it.name) === item.name;
    });

    let newItems;
    if (index >= 0) {
      const existing = currentItems[index];
      const existingObj =
        typeof existing === "string"
          ? { name: existing, icon: item.icon || "🎁", desc: item.desc || "", price: item.price }
          : existing;
      const updated = {
        ...existingObj,
        name: existingObj.name || item.name,
        icon: existingObj.icon || item.icon || "🎁",
        desc: existingObj.desc || item.desc || "",
        price: existingObj.price ?? item.price,
        quantity: (existingObj.quantity || 1) + 1,
      };
      newItems = [...currentItems];
      newItems[index] = updated;
    } else {
      const purchasedItem = {
        name: item.name,
        icon: item.icon || "🎁",
        desc: item.desc || "",
        price: item.price,
        quantity: 1,
      };
      newItems = [...currentItems, purchasedItem];
    }

    transaction.update(petRef, {
      coins: newCoins,
      items: newItems,
      updatedAt: serverTimestamp(),
    });
  });
};

/**
 * Delete a pet
 * @param {string} petId - The pet's document ID
 * @returns {Promise<void>}
 */
export const deletePet = async (petId) => {
  try {
    const petRef = doc(db, "pets", petId);
    await deleteDoc(petRef);
  } catch (error) {
    console.error("Error deleting pet:", error);
    throw error;
  }
};

/**
 * Enable or disable sharing for a pet
 * @param {string} petId - The pet's document ID
 * @param {boolean} enabled - Whether sharing should be enabled
 * @returns {Promise<void>}
 */
export const togglePetSharing = async (petId, enabled) => {
  try {
    const petRef = doc(db, "pets", petId);
    const petDoc = await getDoc(petRef);

    if (!petDoc.exists()) {
      throw new Error("Pet not found");
    }

    const petData = petDoc.data();
    const updateData = {
      sharingEnabled: enabled,
      updatedAt: serverTimestamp(),
    };

    // Generate a new shareable ID if one doesn't exist
    if (!petData.shareableId) {
      updateData.shareableId = generateShareableId();
    }

    await updateDoc(petRef, updateData);
  } catch (error) {
    console.error("Error toggling pet sharing:", error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates for all pets belonging to a specific user
 * @param {string} userId - The user's UID
 * @param {Function} callback - Callback function that receives (pets, error)
 * @returns {Function} Unsubscribe function to stop listening
 */
export const subscribeToUserPets = (userId, callback) => {
  try {
    const petsRef = collection(db, "pets");
    const q = query(
      petsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const pets = [];
        querySnapshot.forEach((doc) => {
          pets.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        callback(pets, null);
      },
      (error) => {
        console.error("Error in user pets subscription:", error);
        callback(null, error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up user pets subscription:", error);
    callback(null, error);
    return () => {}; // Return no-op unsubscribe function
  }
};

/**
 * Subscribe to real-time updates for all pets in the system
 * @param {Function} callback - Callback function that receives (pets, error)
 * @returns {Function} Unsubscribe function to stop listening
 */
export const subscribeToAllPets = (callback) => {
  try {
    const petsRef = collection(db, "pets");
    const q = query(petsRef, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const pets = [];
        querySnapshot.forEach((doc) => {
          pets.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        callback(pets, null);
      },
      (error) => {
        console.error("Error in all pets subscription:", error);
        callback(null, error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up all pets subscription:", error);
    callback(null, error);
    return () => {}; // Return no-op unsubscribe function
  }
};

/**
 * Subscribe to real-time updates for a single pet by ID
 * @param {string} petId - The pet's document ID
 * @param {Function} callback - Callback function that receives (pet, error)
 * @returns {Function} Unsubscribe function to stop listening
 */
export const subscribeToPetById = (petId, callback) => {
  try {
    const petRef = doc(db, "pets", petId);

    const unsubscribe = onSnapshot(
      petRef,
      (petDoc) => {
        if (petDoc.exists()) {
          callback(
            {
              id: petDoc.id,
              ...petDoc.data(),
            },
            null
          );
        } else {
          callback(null, new Error("Pet not found"));
        }
      },
      (error) => {
        console.error("Error in pet subscription:", error);
        callback(null, error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up pet subscription:", error);
    callback(null, error);
    return () => {}; // Return no-op unsubscribe function
  }
};
