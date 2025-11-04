import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { subscribeToUserNotifications } from "../services/notificationService";

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children, user }) => {
  const [notifications, setNotifications] = useState([]);
  const [toasts, setToasts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setToasts([]);
      setUnreadCount(0);
      return;
    }

    // Subscribe to real-time notifications
    const unsubscribe = subscribeToUserNotifications(
      user.uid,
      (allNotifications, changes, error) => {
        if (error) {
          console.error("Error in notification subscription:", error);
          return;
        }

        setNotifications(allNotifications);

        // Count unread notifications
        const unread = allNotifications.filter((n) => !n.read).length;
        setUnreadCount(unread);

        // Show toast for new notifications
        if (changes) {
          changes.forEach((change) => {
            if (change.type === "added" && !change.notification.read) {
              // Check if this is a brand new notification (not from initial load)
              // We check if the notification was created in the last 5 seconds
              const notificationTime = change.notification.timestamp?.toMillis?.() || Date.now();
              const timeDiff = Date.now() - notificationTime;
              
              // Only show toast if notification is very recent (within 5 seconds)
              if (timeDiff < 5000) {
                addToast(change.notification);
              }
            }
          });
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addToast = useCallback((notification) => {
    setToasts((prev) => {
      // Limit to 3 toasts at a time
      const newToasts = [notification, ...prev].slice(0, 3);
      return newToasts;
    });
  }, []);

  const removeToast = useCallback((notificationId) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== notificationId));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const value = {
    notifications,
    toasts,
    unreadCount,
    addToast,
    removeToast,
    clearAllToasts,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

