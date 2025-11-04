# Notification System

This notification system uses Firebase real-time listeners to display toast notifications whenever pets are interacted with.

## Overview

The notification system consists of:

1. **Notification Service** - Handles creating, reading, and subscribing to notifications
2. **Notification Context** - React context that manages real-time notification state
3. **Notification Toast Component** - UI component that displays notifications

## How It Works

### 1. Creating Notifications

Notifications are automatically created when:

- A pet owner performs an action on their pet (feed, play, clean, rest, exercise, treat)
- A visitor interacts with a shared pet (pet, treat)

The notification includes:

- Pet information (ID, name)
- Action type and who performed it (owner/visitor)
- Stat changes (before/after values for all stats)
- Timestamp

### 2. Real-Time Listening

The `NotificationContext` subscribes to Firebase notifications for the authenticated user using `onSnapshot`. When a new notification is created:

- It's added to the notifications list
- If it's unread and recent (within 5 seconds), a toast notification is displayed
- The toast auto-dismisses after 5 seconds

### 3. Toast Display

Toast notifications appear at the top-right of the screen and show:

- Pet name and action performed
- Who performed the action (You/Someone)
- Stat changes with before/after values
- Color-coded stat differences (green for positive, red for negative)

## Usage

### In Components

The notification system is already integrated into the app. To use notifications in a component:

```javascript
import { useNotifications } from "../contexts/NotificationContext";

function MyComponent() {
  const { notifications, toasts, unreadCount } = useNotifications();

  // notifications: all notifications for the user
  // toasts: currently displayed toast notifications
  // unreadCount: number of unread notifications
}
```

### Creating Notifications Manually

If you need to create a notification manually:

```javascript
import { createNotification } from "../services/notificationService";

await createNotification({
  userId: "user-uid",
  petId: "pet-id",
  petName: "Fluffy",
  actionType: "feed",
  actionPerformedBy: "owner", // or "visitor"
  interactorId: "user-or-interactor-id",
  statChanges: {
    fullness: { before: 30, after: 50 },
    happiness: { before: 50, after: 50 },
  },
});
```

## Firestore Structure

### Notifications Collection

```
notifications/
  {notificationId}/
    userId: string           // Owner of the pet
    petId: string           // Pet document ID
    petName: string         // Pet name
    actionType: string      // Action performed
    actionPerformedBy: string // "owner" or "visitor"
    interactorId: string    // ID of who performed action
    statChanges: object     // Before/after stat values
    timestamp: timestamp    // When action occurred
    read: boolean          // Whether notification has been read
```

## Security Rules

Users can:

- Read their own notifications
- Update their own notifications (mark as read)
- Delete their own notifications

Anyone can create notifications (system-generated).

## Indexes Required

The following Firestore index is required (already configured in `firestore.indexes.json`):

- Collection: `notifications`
- Fields: `userId` (Ascending), `timestamp` (Descending)

## Deployment

To deploy the updated Firestore rules and indexes:

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## Future Enhancements

Potential improvements:

- Notification center/dropdown to view all notifications
- Mark all as read functionality in UI
- Notification preferences (enable/disable certain types)
- Push notifications for mobile
- Notification history with pagination
