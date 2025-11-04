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
      ...petData,
      // Initialize pet stats
      fullness: 50,
      happiness: 50,
      cleanliness: 50,
      energy: 50,
      xp: 0,
      // Initialize sharing
      shareableId: generateShareableId(),
      sharingEnabled: false,
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
