import React, { useEffect } from "react";
import { getActionIcon } from "../services/notificationService";
import "./styles/NotificationToast.css";

export default function NotificationToast({ notification, onDismiss }) {
  useEffect(() => {
    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      onDismiss(notification.id);
    }, 5000);

    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  const actor =
    notification.actionPerformedBy === "owner" ? "You" : "Someone";
  const actionIcon = getActionIcon(notification.actionType);

  // Format stat changes
  const statChanges = notification.statChanges || {};
  const changedStats = Object.entries(statChanges).filter(
    ([key, value]) => value.before !== value.after
  );

  return (
    <div className="notification-toast" onClick={() => onDismiss(notification.id)}>
      <div className="notification-toast-header">
        <span className="notification-icon">{actionIcon}</span>
        <div className="notification-content">
          <div className="notification-title">
            <strong>{notification.petName}</strong> was {notification.actionType}
            {notification.actionType === "pet" ? "ted" : "ed"}!
          </div>
          <div className="notification-actor">
            {actor} performed this action
          </div>
        </div>
        <button
          className="notification-close"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(notification.id);
          }}
        >
          ×
        </button>
      </div>
      {changedStats.length > 0 && (
        <div className="notification-stats">
          {changedStats.map(([stat, values]) => (
            <div key={stat} className="stat-change">
              <span className="stat-name">{getStatIcon(stat)} {capitalize(stat)}:</span>
              <span className="stat-values">
                {values.before} → {values.after}
                <span
                  className={`stat-diff ${
                    values.after > values.before ? "positive" : "negative"
                  }`}
                >
                  ({values.after > values.before ? "+" : ""}
                  {values.after - values.before})
                </span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getStatIcon(stat) {
  const icons = {
    fullness: "🍖",
    happiness: "😊",
    cleanliness: "✨",
    energy: "⚡",
    xp: "⭐",
  };
  return icons[stat] || "📊";
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

