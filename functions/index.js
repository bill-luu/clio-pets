/**
 * Cloud Functions for Clio Pets
 *
 * This file is a placeholder for future cloud functions.
 * 
 * Note: Pet stat decay is handled CLIENT-SIDE in the app.
 * See src/utils/petAge.js for the decay implementation.
 */

const {setGlobalOptions} = require("firebase-functions/v2");
const {logger} = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize Firebase Admin
admin.initializeApp();

// For cost control, set maximum instances
setGlobalOptions({maxInstances: 10});

// Placeholder - no functions currently deployed
// Add future cloud functions here as needed

logger.info("Cloud Functions initialized - no scheduled functions active");
