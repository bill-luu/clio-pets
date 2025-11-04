# Decay System Changes

## Summary

Removed the Cloud Function-based hourly decay system in favor of client-side decay calculation for a better player experience and reduced costs.

## Changes Made

### 1. Removed Cloud Function Decay (`functions/index.js`)

**Before:**
- Scheduled Cloud Function running every hour (`0 * * * *`)
- Decayed stats by 5 points per hour
- Would result in pets losing 120 points per day (24× too aggressive)

**After:**
- Placeholder file with no active scheduled functions
- Ready for future cloud function additions

### 2. Updated Documentation (`functions/README.md`)

**Changes:**
- Documented that decay is now client-side
- Explained the "Schrödinger's Pet" mechanic
- Listed benefits of client-side approach
- Added migration note about previous implementation

### 3. Clarified Decay Mechanics (`PROGRESSION_SYSTEM.md`)

**Added:**
- Explicit note that decay is calculated client-side
- Description of when decay is evaluated
- Explanation of the "Schrödinger's Pet" feature

## Current Decay System

### Implementation Location
- **File**: `src/utils/petAge.js`
- **Function**: `evaluatePetAge()`
- **Service**: `src/services/petActionService.js` (calls evaluatePetAge)

### How It Works

```javascript
// Triggered when user performs an action
// 1. Calculate days since last check
const daysSinceLastCheck = Math.floor((now - lastCheck) / (1000 * 60 * 60 * 24));

// 2. Calculate decay amount
const decayAmount = daysSinceLastCheck * 5; // 5 points per day

// 3. Apply to each stat (except XP)
const statsAfterDecay = {
  fullness: clamp(currentStats.fullness - decayAmount, 0, 100),
  happiness: clamp(currentStats.happiness - decayAmount, 0, 100),
  cleanliness: clamp(currentStats.cleanliness - decayAmount, 0, 100),
  energy: clamp(currentStats.energy - decayAmount, 0, 100)
};
```

### Decay Rate

**5 points per day** per stat

### Examples

| Time Away | Decay Applied | Starting Stats | Final Stats |
|-----------|---------------|----------------|-------------|
| 1 day | -5 points | 80 | 75 |
| 3 days | -15 points | 80 | 65 |
| 7 days | -35 points | 80 | 45 |
| 20 days | -100 points | 80 | 0 (capped) |

## Benefits of Client-Side Decay

### 1. **Cost Savings**
- **Before**: 720 Cloud Function executions/month = ~$1.30/month (Firestore writes)
- **After**: $0/month

### 2. **Player-Friendly Design**
- Pets don't die while you're away
- Forgiving for busy players
- Still maintains progression and challenge

### 3. **Simplified Architecture**
- One source of truth for decay logic
- No sync issues between client and server
- Easier to test and debug

### 4. **Aligned Game Design**
- Matches the casual, Tamagotchi-inspired gameplay
- 10-minute action cooldown indicates casual pace
- 16-27 day progression timeline supports weekly check-ins

## The "Schrödinger's Pet" Mechanic

Your pet exists in a superposition until you check on it:

- **Quantum State**: While away, your pet is simultaneously healthy and decayed
- **Wave Function Collapse**: When you interact, the exact decay is calculated
- **Observer Effect**: Your check-in determines the outcome

This isn't a bug—it's a feature that:
- Reduces anxiety about forgetting your pet
- Maintains engagement without demanding daily play
- Provides retroactive consequence without permanent loss

## Migration Notes

### For Users
- No action required
- Pets will continue to work exactly as before
- If you haven't interacted in a while, appropriate decay will be applied on next action

### For Developers

If the Cloud Function was previously deployed, you may want to delete it:

```bash
# List deployed functions
firebase functions:list

# Delete the old function (if it exists)
firebase functions:delete decayPetStats
```

Or, if you redeploy, the new placeholder won't run any decay since there's no scheduled function.

## Testing

### Verify Client-Side Decay Works

1. Create/load a pet
2. Note the current stats
3. Manually change `lastAgeCheck` in Firestore to 3 days ago
4. Perform an action (feed, play, etc.)
5. Verify stats decreased by 15 points (3 days × 5)

### Test Cases

```javascript
// Test 1: No decay same day
lastCheck: now - 12 hours
expected decay: 0

// Test 2: One day decay
lastCheck: now - 25 hours
expected decay: 5

// Test 3: Multiple day decay
lastCheck: now - 72 hours (3 days)
expected decay: 15

// Test 4: Stats clamped at 0
lastCheck: now - 30 days
stats: 50
expected decay: 150, but clamped to: stats = 0
```

## Future Considerations

If you decide to add real-time decay in the future:

### Option A: Daily Cloud Function
- Schedule: `"0 0 * * *"` (once daily at midnight)
- Decay amount: 5 points per day
- Cost: ~30 executions/month (negligible)

### Option B: Hybrid System
- Cloud Function for abandoned pets (no interaction for 7+ days)
- Client-side for active players
- Best of both worlds

### Option C: Progressive Decay
- First 3 days: No decay (vacation mode)
- Days 4-7: 2 points per day (slow decay)
- Days 8+: 5 points per day (normal decay)

## Documentation Updated

- ✅ `functions/index.js` - Removed decay function, added placeholder
- ✅ `functions/README.md` - Documented client-side approach
- ✅ `PROGRESSION_SYSTEM.md` - Clarified decay mechanics
- ✅ `DECAY_SYSTEM_CHANGES.md` - This document

## Questions?

See:
- **Decay Logic**: `src/utils/petAge.js`
- **Action Service**: `src/services/petActionService.js`
- **Progression Guide**: `PROGRESSION_SYSTEM.md`
- **Functions Setup**: `functions/README.md`

