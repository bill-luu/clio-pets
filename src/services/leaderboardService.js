import {
  collection,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Get top pets by XP (proxy for owner interactions)
 * @param {number} limitCount - Number of top pets to fetch (default 5)
 * @returns {Promise<Array>} Array of top pets with their IDs
 */
export const getTopPetsByXP = async (limitCount = 5) => {
  try {
    const petsRef = collection(db, "pets");
    const q = query(petsRef, orderBy("xp", "desc"), limit(limitCount));
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
    console.error("Error getting top pets by XP:", error);
    throw error;
  }
};

/**
 * Get top pets by total interactions from other users
 * @param {number} limitCount - Number of top pets to fetch (default 5)
 * @returns {Promise<Array>} Array of top pets with their interaction counts
 */
export const getTopPetsByInteractions = async (limitCount = 5) => {
  try {
    // Get all interactions
    const interactionsRef = collection(db, "petInteractions");
    const querySnapshot = await getDocs(interactionsRef);

    // Aggregate interactions by petId
    const interactionCounts = {};
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const petId = data.petId;
      if (petId) {
        interactionCounts[petId] = (interactionCounts[petId] || 0) + 1;
      }
    });

    // Sort by interaction count and get top N
    const sortedPetIds = Object.entries(interactionCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, limitCount)
      .map(([petId, count]) => ({ petId, count }));

    // Fetch pet details for top pets
    const petsRef = collection(db, "pets");
    const allPetsSnapshot = await getDocs(petsRef);
    
    const petsMap = {};
    allPetsSnapshot.forEach((doc) => {
      petsMap[doc.id] = {
        id: doc.id,
        ...doc.data(),
      };
    });

    // Combine pet data with interaction counts
    const topPets = sortedPetIds
      .map(({ petId, count }) => {
        const pet = petsMap[petId];
        if (pet) {
          return {
            ...pet,
            interactionCount: count,
          };
        }
        return null;
      })
      .filter((pet) => pet !== null);

    return topPets;
  } catch (error) {
    console.error("Error getting top pets by interactions:", error);
    throw error;
  }
};

/**
 * Get random featured pets
 * @param {number} count - Number of random pets to fetch (default 5)
 * @returns {Promise<Array>} Array of random pets
 */
export const getRandomFeaturedPets = async (count = 5) => {
  try {
    const petsRef = collection(db, "pets");
    const querySnapshot = await getDocs(petsRef);

    const allPets = [];
    querySnapshot.forEach((doc) => {
      allPets.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    // Shuffle array and get first N items
    const shuffled = allPets.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, allPets.length));
  } catch (error) {
    console.error("Error getting random featured pets:", error);
    throw error;
  }
};

const leaderboardService = {
  getTopPetsByXP,
  getTopPetsByInteractions,
  getRandomFeaturedPets,
};

export default leaderboardService;

