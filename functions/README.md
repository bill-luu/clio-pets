# Cloud Functions for Clio Pets

This directory contains Firebase Cloud Functions for automated backend tasks.

## Current Status

⚠️ **No Cloud Functions Currently Deployed**

Pet stat decay is handled **client-side** in the application to provide a better user experience and reduce server costs.

## Pet Stat Decay System

### How It Works (Client-Side)

Pet decay is calculated when a user performs an action after being away:

- **Decay Rate**: 5 points per day (per stat)
- **Trigger**: Evaluated when you interact with your pet after 24+ hours
- **Implementation**: `src/utils/petAge.js` → `evaluatePetAge()`

**Example:**
```
Day 0: All stats at 80
Day 3 (first interaction): Stats decay by 15 (3 days × 5) → Stats now at 65
```

### Why Client-Side?

**Benefits:**
1. ✅ **Zero server costs** - No hourly Cloud Function executions
2. ✅ **Player-friendly** - "Schrödinger's pet" mechanic (decay happens on check-in)
3. ✅ **Forgiving design** - Busy players aren't excessively punished
4. ✅ **Simpler architecture** - One source of truth, no sync issues
5. ✅ **Already balanced** - 5 points/day aligns with 10-minute cooldowns

**Trade-offs:**
- Pets don't decay in "real-time" while you're offline
- This is intentional! It matches the casual, Tamagotchi-inspired design

### The "Schrödinger's Pet" Feature

Your pet exists in a superposition of states until you check on it:
- When you return after days away, appropriate decay is calculated
- The averaging system ensures well-cared pets can still age
- This turns potential frustration into a gentler game mechanic

## Future Cloud Functions

This infrastructure is ready for future enhancements:

### Potential Features

1. **Push Notifications**
   - Remind users to check on their pets
   - Alert when pets reach milestones

2. **Analytics & Insights**
   - Track engagement patterns
   - Generate weekly pet reports

3. **Social Features**
   - Pet interactions between users
   - Leaderboards and achievements

4. **Data Maintenance**
   - Cleanup inactive accounts
   - Backup automation

## Development Setup

### Install Dependencies

```bash
cd functions
npm install
```

### Deploy Functions

When you add new functions:

```bash
firebase deploy --only functions
```

### Local Development

Test functions locally with the emulator:

```bash
firebase emulators:start --only functions
```

## Cost Considerations

**Current Setup**: $0/month (no Cloud Functions deployed)

**If Adding Functions:**
- First 2M invocations/month: Free
- First 400K GB-seconds compute: Free
- Main costs typically come from Firestore operations

## Documentation

For more details on the pet system:
- **Age System**: `src/utils/petAge.js`
- **Action System**: `src/services/petActionService.js`
- **Progression Guide**: `PROGRESSION_SYSTEM.md`

## Migration Note

**Previous Implementation** (removed):
- Hourly Cloud Function that decayed stats by 5 points/hour
- This was 24× too aggressive and conflicted with client-side logic
- Removed to simplify architecture and improve player experience
