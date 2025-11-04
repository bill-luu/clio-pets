import {
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

/**
 * Create a notification for a pet interaction
 * @param {Object} notificationData - Notification details
 * @returns {Promise<string>} The notification document ID
 */
export const createNotification = async (notificationData) => {
  try {
    const notificationsRef = collection(db, "notifications");
    const docRef = await addDoc(notificationsRef, {
      ...notificationData,
      timestamp: serverTimestamp(),
      read: false,
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Get notifications for a specific user
 * @param {string} userId - The user's UID
 * @param {number} limitCount - Maximum number of notifications to fetch
 * @returns {Promise<Array>} Array of notification objects
 */
export const getUserNotifications = async (userId, limitCount = 50) => {
  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);

    const notifications = [];
    querySnapshot.forEach((doc) => {
      notifications.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return notifications;
  } catch (error) {
    console.error("Error getting user notifications:", error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - The notification document ID
 * @returns {Promise<void>}
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, {
      read: true,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read for a user
 * @param {string} userId - The user's UID
 * @returns {Promise<void>}
 */
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      where("read", "==", false)
    );
    const querySnapshot = await getDocs(q);

    const updatePromises = [];
    querySnapshot.forEach((doc) => {
      updatePromises.push(
        updateDoc(doc.ref, {
          read: true,
        })
      );
    });

    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * Subscribe to real-time notifications for a user
 * @param {string} userId - The user's UID
 * @param {Function} callback - Callback function that receives (notifications, changes, error)
 * @returns {Function} Unsubscribe function to stop listening
 */
export const subscribeToUserNotifications = (userId, callback) => {
  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(
      notificationsRef,
      where("userId", "==", userId),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const notifications = [];
        const changes = [];

        querySnapshot.forEach((doc) => {
          notifications.push({
            id: doc.id,
            ...doc.data(),
          });
        });

        // Track changes for new notifications
        querySnapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            changes.push({
              type: "added",
              notification: {
                id: change.doc.id,
                ...change.doc.data(),
              },
            });
          }
        });

        callback(notifications, changes, null);
      },
      (error) => {
        console.error("Error in notifications subscription:", error);
        callback(null, null, error);
      }
    );

    return unsubscribe;
  } catch (error) {
    console.error("Error setting up notifications subscription:", error);
    callback(null, null, error);
    return () => {}; // Return no-op unsubscribe function
  }
};

/**
 * Get action icon for notification display
 * @param {string} actionType - The action type
 * @returns {string} Emoji icon
 */
export const getActionIcon = (actionType) => {
  const icons = {
    feed: "🍖",
    play: "🎾",
    clean: "🛁",
    rest: "😴",
    exercise: "🏃",
    treat: "🦴",
    pet: "❤️",
  };
  return icons[actionType] || "🐾";
};

/**
 * Format notification message
 * @param {Object} notification - The notification object
 * @returns {string} Formatted message
 */
export const formatNotificationMessage = (notification) => {
  const actor = notification.actionPerformedBy === "owner" ? "You" : "Someone";
  const actionName = notification.actionType;
  return `${actor} ${actionName === "pet" ? "petted" : `${actionName}ed`} ${
    notification.petName
  }`;
};

const notificationService = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToUserNotifications,
  getActionIcon,
  formatNotificationMessage,
};

export default notificationService;
