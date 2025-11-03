# Cloud Functions for Clio Pets

This directory contains Firebase Cloud Functions for automated backend tasks.

## Functions

### `decayPetStats`

Scheduled function that automatically decays pet stats over time to encourage regular user engagement.

**Schedule:** Every hour (`0 * * * *`)

**Configuration:**

- `DECAY_AMOUNT`: 5 points per stat per hour
- `MIN_STAT_VALUE`: 0 (stats won't go below this)
- Grace period: 24 hours after pet creation (no decay)

**What it does:**

1. Fetches all pets from Firestore
2. Skips pets created within the last 24 hours
3. Decreases fullness, happiness, cleanliness, and energy by 5 points each
4. XP is never decreased
5. Stats are clamped to minimum value of 0
6. Updates are batched for performance (500 pets per batch)

**Stat Decay Timeline** (starting from 50):

- After 4 hours: Stats at ~30 (low)
- After 6 hours: Stats at ~20 (critical)
- After 10 hours: Stats at 0 (minimum)

## Deployment

### Prerequisites

1. Make sure you're logged into Firebase CLI:

```bash
firebase login
```

2. Select your Firebase project:

```bash
firebase use <project-id>
```

### Deploy Functions

Deploy all functions:

```bash
firebase deploy --only functions
```

Deploy specific function:

```bash
firebase deploy --only functions:decayPetStats
```

### First Time Setup

When deploying scheduled functions for the first time, you may need to:

1. Enable Cloud Scheduler API in Google Cloud Console
2. Grant necessary permissions to the service account

Firebase will prompt you with instructions if needed.

## Local Development

### Install Dependencies

```bash
cd functions
npm install
```

### Run Functions Locally

Start the Firebase emulator:

```bash
firebase emulators:start --only functions
```

### Test Scheduled Function Locally

You can manually trigger the scheduled function using the Firebase console or by calling it directly in the emulator.

## Monitoring

### View Logs

Real-time logs:

```bash
firebase functions:log
```

View logs in Firebase Console:

1. Go to Firebase Console
2. Navigate to Functions
3. Click on `decayPetStats`
4. View logs and execution history

### Metrics to Monitor

- **Execution count**: Should run once per hour
- **Execution time**: Should complete in < 10 seconds for < 1000 pets
- **Errors**: Should be 0 under normal operation
- **Pets updated**: Number of pets processed each run

## Configuration

### Change Decay Schedule

Edit the `schedule` parameter in `index.js`:

```javascript
exports.decayPetStats = onSchedule({
  schedule: "0 */6 * * *", // Every 6 hours
  // ... rest of config
```

Common schedules:

- `"*/30 * * * *"` - Every 30 minutes
- `"0 * * * *"` - Every hour (current)
- `"0 */6 * * *"` - Every 6 hours
- `"0 */12 * * *"` - Every 12 hours

### Change Decay Amount

Edit the `DECAY_AMOUNT` constant in `index.js`:

```javascript
const DECAY_AMOUNT = 10; // Increase to 10 points per run
```

### Change Timezone

Edit the `timeZone` parameter in `index.js`:

```javascript
exports.decayPetStats = onSchedule({
  schedule: "0 * * * *",
  timeZone: "America/New_York", // Change timezone
  // ... rest of config
```

[List of valid timezones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

## Cost Considerations

### Estimated Costs

Firebase Cloud Functions pricing:

- **Invocations**: First 2M/month free, then $0.40 per million
- **Compute time**: First 400K GB-seconds free
- **Network egress**: First 5GB/month free

**Example calculation** (1000 pets):

- Runs per month: 720 (24 hours × 30 days)
- Invocations: 720 (well within free tier)
- Compute time: ~7 seconds × 720 = ~5,040 seconds (within free tier)
- Firestore reads: 720 (to get pets)
- Firestore writes: 720,000 (1000 pets × 720 runs)

**Firestore costs** (main expense):

- Writes: $0.18 per 100K writes
- For 720K writes/month: ~$1.30/month

### Optimization Tips

1. **Batch updates**: Already implemented (500 pets per batch)
2. **Skip unnecessary updates**: Grace period already implemented
3. **Adjust schedule**: Run less frequently (every 6 hours instead of hourly)
4. **Conditional updates**: Only update pets that have stats > 0

## Troubleshooting

### Function not running

1. Check if Cloud Scheduler is enabled
2. Verify function deployed successfully: `firebase functions:list`
3. Check logs for errors: `firebase functions:log`

### Permission errors

Grant necessary permissions:

```bash
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member serviceAccount:YOUR_PROJECT_ID@appspot.gserviceaccount.com \
  --role roles/cloudscheduler.admin
```

### Timeout errors

Increase timeout in function config:

```javascript
exports.decayPetStats = onSchedule({
  // ...
  timeoutSeconds: 540, // Max 9 minutes
```

## Future Enhancements

Potential features to add:

1. **Notification system**: Send push notifications when stats are critical
2. **Offline protection**: Pause decay after 48 hours of inactivity
3. **Variable decay rates**: Decay faster based on pet level or type
4. **Stat recovery**: Slowly recover stats when at 0 (like passive regeneration)
5. **Analytics**: Track decay patterns and user engagement
