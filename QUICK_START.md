# Quick Start Guide - Notification System

## 🚀 Get Started in 3 Steps

### Step 1: Deploy to Firebase (5 minutes)

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes (this may take a few minutes)
firebase deploy --only firestore:indexes

# Build and deploy the app
npm run build
firebase deploy --only hosting
```

### Step 2: Wait for Indexes (5-10 minutes)

While waiting, check the Firebase Console:

1. Go to Firebase Console → Firestore Database → Indexes
2. Wait until the `notifications` index status shows "Enabled"
3. Once enabled, you're ready to test!

### Step 3: Test It Out (2 minutes)

**Test Owner Actions:**

1. Open your deployed app
2. Log in with your account
3. Click on any pet
4. Click "Feed" button
5. 🎉 Watch the toast notification appear in the top-right!

**Test Visitor Actions:**

1. Click "Share Pet" button
2. Copy the shareable link
3. Open the link in an incognito window
4. Click "Pet" or "Treat" button
5. Go back to your logged-in window
6. 🎉 Watch the notification appear saying "Someone" interacted with your pet!

## ✨ What You'll See

When a notification appears, you'll see:

- 🐾 Pet name and action performed
- 👤 Who did it ("You" or "Someone")
- 📊 Stat changes with before/after values
- 🎨 Color-coded changes (green ↑, red ↓)
- ⏱️ Auto-dismisses after 5 seconds

## 📱 Features

- ⚡ Real-time updates (no refresh needed)
- 🎯 Works for both your actions and visitor actions
- 💾 All notifications saved in Firestore
- 📱 Mobile-friendly
- 🖱️ Click to dismiss manually
- 🎨 Beautiful slide-in animation

## 🔧 Customization

Want to change the behavior? Edit these files:

**Auto-dismiss time (default: 5 seconds)**

- File: `src/components/NotificationToast.jsx`
- Line: 12
- Change: `setTimeout(() => { onDismiss(notification.id); }, 5000);`

**Max toasts shown (default: 3)**

- File: `src/contexts/NotificationContext.jsx`
- Line: 41
- Change: `const newToasts = [notification, ...prev].slice(0, 3);`

**Toast position**

- File: `src/components/styles/NotificationToast.css`
- Lines: 1-8
- Change: `top`, `right`, `left`, `bottom` values

## 📚 Need More Info?

- **Full documentation**: `NOTIFICATION_SYSTEM_SUMMARY.md`
- **Deployment checklist**: `DEPLOYMENT_CHECKLIST.md`
- **Technical details**: `src/services/NOTIFICATIONS_README.md`
- **Implementation status**: `IMPLEMENTATION_COMPLETE.md`

## ❓ Troubleshooting

**Notifications not appearing?**

- Check Firebase Console → Firestore → Indexes (must be "Enabled")
- Check browser console for errors
- Verify you're logged in
- Try performing another action

**Permission errors?**

- Ensure Firestore rules are deployed: `firebase deploy --only firestore:rules`
- Check Firebase Console → Firestore → Rules

**Still having issues?**

- See detailed troubleshooting in `DEPLOYMENT_CHECKLIST.md`

## 🎉 That's It!

You now have a fully functional real-time notification system! Every time you or someone else interacts with your pets, you'll get instant notifications with full details.

Enjoy! 🐾
