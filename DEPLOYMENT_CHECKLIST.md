# Notification System Deployment Checklist

## Pre-Deployment

- [x] All notification service files created
- [x] All components created and styled
- [x] Context provider implemented
- [x] App.js updated with notification provider
- [x] Pet action services updated to create notifications
- [x] Firestore rules updated for notifications collection
- [x] Firestore indexes configured
- [x] No linter errors
- [x] Documentation created

## Deployment Steps

Follow these steps in order:

### 1. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

**Expected Output:**

```
✔ Deploy complete!
```

### 2. Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

**Expected Output:**

```
✔ Deploy complete!
```

**Note:** Index creation may take several minutes. You can check the status in the Firebase Console under Firestore > Indexes.

### 3. Build the Application

```bash
npm run build
```

**Expected Output:**

```
Creating an optimized production build...
Compiled successfully.
```

### 4. Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

**Expected Output:**

```
✔ Deploy complete!
```

### 5. Verify Deployment

1. **Check Firestore Rules:**

   - Open Firebase Console
   - Go to Firestore Database > Rules
   - Verify `notifications` collection rules are present

2. **Check Firestore Indexes:**

   - Go to Firestore Database > Indexes
   - Verify `notifications` index is created (may show "Building" initially)
   - Wait until status shows "Enabled"

3. **Test the Application:**
   - Open your deployed app URL
   - Log in
   - Perform an action on a pet
   - Verify toast notification appears
   - Check Firestore Database > notifications collection for new documents

## Post-Deployment Testing

### Test Case 1: Owner Actions

- [ ] Log in to your account
- [ ] Click on a pet to open details modal
- [ ] Perform "Feed" action
- [ ] Verify toast notification appears in top-right
- [ ] Verify notification says "You" as the actor
- [ ] Verify stat changes are displayed correctly
- [ ] Verify toast auto-dismisses after 5 seconds
- [ ] Check Firestore console for notification document

### Test Case 2: Visitor Actions (Shared Pets)

- [ ] Enable sharing for a pet
- [ ] Copy the shareable link
- [ ] Open link in incognito/private window
- [ ] Perform "Pet" or "Treat" action
- [ ] Return to your logged-in window
- [ ] Verify toast notification appears
- [ ] Verify notification says "Someone" as the actor
- [ ] Check Firestore console for notification document

### Test Case 3: Multiple Notifications

- [ ] Perform 3-4 actions quickly (if cooldown allows)
- [ ] Verify maximum of 3 toasts display at once
- [ ] Verify toasts stack vertically
- [ ] Verify older toasts dismiss as new ones appear

### Test Case 4: Mobile Responsiveness

- [ ] Open app on mobile device or use browser dev tools
- [ ] Verify toasts display correctly on small screens
- [ ] Verify toasts are readable and properly positioned
- [ ] Test click-to-dismiss functionality on mobile

## Rollback Plan

If issues occur after deployment:

### Rollback Hosting

```bash
firebase hosting:rollback
```

### Rollback Firestore Rules

1. Go to Firebase Console > Firestore > Rules
2. Click "History" tab
3. Select previous version
4. Click "Restore"

### Disable Notifications Temporarily

If you need to disable notifications without rolling back:

1. Comment out the notification creation in services:

   - `src/services/petActionService.js` (lines 143-165)
   - `src/services/sharedPetService.js` (lines 227-249)

2. Rebuild and redeploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## Monitoring

After deployment, monitor:

1. **Firebase Console > Firestore > Usage**

   - Check for increased read/write operations (expected)
   - Verify operations are within quota

2. **Browser Console**

   - Check for JavaScript errors
   - Verify no Firebase permission errors

3. **Firebase Console > Firestore > notifications**

   - Verify notifications are being created
   - Check data structure is correct

4. **User Feedback**
   - Ask users if they see notifications
   - Check if toasts are displaying correctly
   - Verify no performance issues

## Troubleshooting

### Issue: "Missing or insufficient permissions"

**Solution:** Ensure Firestore rules are deployed and indexes are enabled.

### Issue: Notifications not appearing

**Solution:**

- Check browser console for errors
- Verify user is authenticated
- Check that notification was created in Firestore
- Verify real-time listener is active (check Network tab for websocket connection)

### Issue: Index not ready

**Solution:** Wait for index creation to complete (can take 5-10 minutes). Check Firebase Console > Firestore > Indexes.

### Issue: Too many toasts appearing

**Solution:** The system limits to 3 toasts and only shows recent notifications. If this is an issue, adjust the logic in `NotificationContext.jsx`.

## Success Criteria

Deployment is successful when:

- ✅ Firestore rules deployed without errors
- ✅ Firestore indexes created and enabled
- ✅ Application builds without errors
- ✅ Application deploys to hosting successfully
- ✅ Toast notifications appear for owner actions
- ✅ Toast notifications appear for visitor actions on shared pets
- ✅ Notifications are stored in Firestore
- ✅ No console errors in browser
- ✅ No permission errors in Firestore
- ✅ Mobile display works correctly

## Contact

If you encounter issues not covered in this checklist, check:

- `NOTIFICATION_SYSTEM_SUMMARY.md` - Implementation overview
- `src/services/NOTIFICATIONS_README.md` - Detailed documentation
- Firebase Console logs
- Browser console errors
