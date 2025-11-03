/**
 * Cloud Functions for Clio Pets
 *
 * Scheduled functions for pet stat decay and maintenance
 */

const {setGlobalOptions} = require("firebase-functions/v2");
const {onSchedule} = require("firebase-functions/v2/scheduler");
const {logger} = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();

// For cost control, set maximum instances
setGlobalOptions({maxInstances: 10});

/**
 * Configuration
 */
const DECAY_AMOUNT = 5; // Points to decay per stat per run
const MIN_STAT_VALUE = 0; // Minimum value stats can reach

/**
 * Scheduled function to decay pet stats
 * Runs every hour
 * Cron schedule: "0 * * * *" (at minute 0 of every hour)
 */
exports.decayPetStats = onSchedule(
    {
      schedule: "0 * * * *", // Every hour
      timeZone: "America/Los_Angeles", // Change to your timezone
      memory: "256MiB",
      timeoutSeconds: 540,
    },
    async (event) => {
      logger.info("Starting pet stat decay process...");

      const db = admin.firestore();
      const petsRef = db.collection("pets");

      try {
      // Get all pets
        const snapshot = await petsRef.get();

        if (snapshot.empty) {
          logger.info("No pets found to decay.");
          return null;
        }

        logger.info(`Processing ${snapshot.size} pets...`);

        // Batch updates for better performance
        const batch = db.batch();
        let updateCount = 0;
        let batchCount = 0;

        for (const doc of snapshot.docs) {
          const pet = doc.data();

          // Calculate new stat values (clamped to minimum)
          const newStats = {
            fullness: Math.max(
                MIN_STAT_VALUE,
                (pet.fullness || 50) - DECAY_AMOUNT,
            ),
            happiness: Math.max(
                MIN_STAT_VALUE,
                (pet.happiness || 50) - DECAY_AMOUNT,
            ),
            cleanliness: Math.max(
                MIN_STAT_VALUE,
                (pet.cleanliness || 50) - DECAY_AMOUNT,
            ),
            energy: Math.max(MIN_STAT_VALUE, (pet.energy || 50) - DECAY_AMOUNT),
            xp: pet.xp || 0, // XP doesn't decay
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          };

          batch.update(doc.ref, newStats);
          updateCount++;

          // Firestore batch limit is 500 operations
          if (updateCount % 500 === 0) {
            await batch.commit();
            batchCount++;
            const msg = `Committed batch ${batchCount}`;
            logger.info(`${msg} (${updateCount} pets updated)`);
          }
        }

        // Commit any remaining updates
        if (updateCount % 500 !== 0) {
          await batch.commit();
          batchCount++;
        }

        const successMsg = "Pet stat decay completed successfully.";
        logger.info(
            `${successMsg} Updated ${updateCount} pets ` +
          `in ${batchCount} batch(es).`,
        );
        return {
          success: true,
          petsUpdated: updateCount,
          batches: batchCount,
        };
      } catch (error) {
        logger.error("Error during pet stat decay:", error);
        throw error;
      }
    },
);
