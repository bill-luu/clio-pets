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
} from "firebase/firestore";
import { db } from "../firebase";

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
 * @returns {Promise<string>} The new pet's document ID
 */
export const addPet = async (userId, petData) => {
  try {
    const petsRef = collection(db, "pets");
    const docRef = await addDoc(petsRef, {
      userId,
      ...petData,
      // Initialize pet stats
      fullness: 50,
      happiness: 50,
      cleanliness: 50,
      energy: 50,
      xp: 0,
      // Initialize age tracking
      ageInYears: 0,
      lastAgeCheck: serverTimestamp(),
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
