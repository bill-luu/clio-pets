# 🔥 Cooldown Reduction System

## Overview

The cooldown reduction system allows users to lower the interaction cooldown (default: 10 minutes) through two dynamic mechanisms:

1. **Daily Streak System** - Rewards consecutive days of interaction
2. **Social Interaction Bonus** - Rewards based on unique visitors interacting with shared pets

Both systems are **conditional** and **dynamic**, meaning bonuses can expire or change based on current conditions.

---

## 🔥 Daily Streak System

### How It Works

- Each day you interact with your pet, your streak increases
- If you miss a day (24+ hours without interaction), your streak resets to 1
- Interacting multiple times in the same day maintains your current streak

### Streak Tiers & Bonuses

| Streak Days | Tier      | Emoji | Cooldown Reduction          |
| ----------- | --------- | ----- | --------------------------- |
| 0-2 days    | None      | ⚪    | 0 minutes                   |
| 3-6 days    | Common    | 🔥    | -2 minutes (8 min cooldown) |
| 7-13 days   | Uncommon  | 🌟    | -4 minutes (6 min cooldown) |
| 14-29 days  | Rare      | ⭐    | -6 minutes (4 min cooldown) |
| 30-59 days  | Epic      | 💎    | -8 minutes (2 min cooldown) |
| 60+ days    | Legendary | 🏆    | -10 minutes (NO COOLDOWN!)  |

### Key Features

- **Automatic Tracking**: Streak is calculated automatically on each interaction
- **Timezone Safe**: Uses UTC dates to avoid timezone issues
- **Visual Indicators**: See your current streak and tier in the pet details modal
- **Milestone Notifications**: Get notified when you reach new streak milestones
- **Best Streak Tracking**: Your longest streak is saved and displayed

---

## 👥 Social Interaction Bonus

### How It Works

- When you enable sharing for your pet, others can interact with it
- Each unique visitor who interacts adds to your social bonus
- The bonus is **dynamic** - it updates in real-time as more people interact

### Social Tiers & Bonuses

| Unique Interactors | Tier     | Emoji | Cooldown Reduction          |
| ------------------ | -------- | ----- | --------------------------- |
| 0-4 people         | Private  | 🔒    | 0 minutes                   |
| 5-9 people         | Shared   | 🤝    | -1 minute (9 min cooldown)  |
| 10-19 people       | Friendly | 👥    | -2 minutes (8 min cooldown) |
| 20-49 people       | Social   | 🎉    | -3 minutes (7 min cooldown) |
| 50-99 people       | Popular  | ✨    | -4 minutes (6 min cooldown) |
| 100+ people        | Viral    | 🌟    | -5 minutes (5 min cooldown) |

### Key Features

- **Leverages Existing System**: Uses the existing pet sharing and interaction tracking
- **Real-time Updates**: Bonus updates as new people interact with your pet
- **Encourages Sharing**: Incentivizes users to share their pets with friends
- **No Penalty**: Disabling sharing doesn't remove the bonus (based on historical interactions)

---

## 🎯 Combined Bonuses

### Maximum Reduction

Streak and social bonuses **stack**! Maximum possible reduction:

- **Legendary Streak** (60+ days): -10 minutes
- **Viral Social** (100+ interactors): -5 minutes
- **Total**: -15 minutes (but cooldown can't go below 0)

**Result**: With both maxed out, you have **NO COOLDOWN** at all!

### Example Combinations

| Streak  | Social     | Total Reduction | Effective Cooldown   |
| ------- | ---------- | --------------- | -------------------- |
| 0 days  | 0 people   | 0 min           | 10 minutes           |
| 3 days  | 5 people   | 3 min           | 7 minutes            |
| 7 days  | 10 people  | 6 min           | 4 minutes            |
| 14 days | 20 people  | 9 min           | 1 minute             |
| 30 days | 50 people  | 12 min          | 0 minutes (instant!) |
| 60 days | 100 people | 15 min          | 0 minutes (instant!) |

---

## 🎨 UI Features

### Pet Details Modal Updates

1. **Progression Section**

   - Displays current streak with colored emoji
   - Shows best streak achieved (if > 0)

2. **Cooldown Bonuses Section** (appears when bonuses are active)

   - Visual cards showing each active bonus
   - Tier name, emoji, and reduction amount
   - Progress hints for next milestone
   - Color-coded borders matching tier colors

3. **Actions Section**

   - Enhanced cooldown indicator showing time remaining
   - Breakdown of cooldown calculation (Base - Streak - Social = Effective)
   - "Ready!" indicator when no cooldown

4. **Notifications**
   - Streak messages when starting or maintaining streaks
   - Milestone notifications when reaching new tiers
   - Streak broken warnings when missing a day

---

## 🔧 Technical Implementation

### New Database Fields (pets collection)

```javascript
{
  lastInteractionDate: "2025-11-04",  // YYYY-MM-DD format (UTC)
  currentStreak: 7,                    // Current consecutive days
  longestStreak: 14                    // Best streak achieved
}
```

### New Utility Files

1. **`src/utils/streakTracker.js`**

   - Streak calculation logic
   - Date handling (UTC)
   - Tier and bonus calculations
   - Milestone checking

2. **`src/utils/socialBonus.js`**

   - Social bonus calculations
   - Tier information
   - Display formatting

3. **`src/utils/cooldownCalculator.js`**
   - Centralized cooldown calculation
   - Combines all bonuses
   - Remaining time calculations
   - Display formatting

### Modified Services

1. **`src/services/petActionService.js`**

   - `checkCooldown()` now async, accepts uniqueInteractors
   - `performPetAction()` updates streak on each action
   - Returns streak information in action result

2. **`src/services/petService.js`**
   - `addPet()` initializes streak fields

### Modified Components

1. **`src/components/PetDetailsModal.jsx`**
   - Displays streak and bonus information
   - Shows cooldown breakdown
   - Real-time cooldown updates with bonuses

---

## 📊 Testing Checklist

### Streak System Tests

- [x] ✅ First interaction creates 1-day streak
- [x] ✅ Same-day interactions maintain streak
- [x] ✅ Next-day interaction increments streak
- [x] ✅ Missing a day resets streak to 1
- [x] ✅ Streak milestones trigger notifications
- [x] ✅ Longest streak is tracked correctly
- [x] ✅ Cooldown reduces based on streak tier
- [x] ✅ UI displays streak with correct tier colors

### Social Bonus Tests

- [x] ✅ Bonus is 0 when no interactors
- [x] ✅ Bonus increases with unique interactors
- [x] ✅ Bonus updates in real-time
- [x] ✅ UI displays social tier correctly
- [x] ✅ Progress hints show correctly

### Combined System Tests

- [x] ✅ Bonuses stack correctly
- [x] ✅ Cooldown never goes below 0
- [x] ✅ Cooldown breakdown displays correctly
- [x] ✅ Real-time updates work properly
- [x] ✅ No linter errors
- [x] ✅ All imports resolved correctly

---

## 🎮 User Experience

### For New Users

1. Start with 10-minute cooldown
2. First interaction creates 1-day streak
3. Come back tomorrow to reach 2-day streak
4. At 3 days, unlock first bonus (-2 minutes)
5. Use social features to start earning social bonuses

### For Active Users

1. Maintain daily streak for increasing bonuses
2. Share link with friends for social bonuses
3. Watch cooldown decrease as bonuses stack
4. Aim for 30+ day streak for major reduction
5. Reach 60 days + 100 friends for instant interactions!

### For Returning Users

1. If streak is broken, start fresh at day 1
2. Social bonuses remain based on historical interactions
3. Previous longest streak is still displayed
4. Can rebuild streak by daily interactions

---

## 💡 Tips for Players

### Maximize Streak Bonus

- Set a daily reminder to interact with your pet
- Even one quick action per day maintains your streak
- Don't let your streak break - it resets to 1!
- Aim for the 60-day legendary tier for no cooldown

### Maximize Social Bonus

- Enable sharing in the pet details modal
- Share your pet link on social media
- Ask friends to interact with your pet
- Each unique visitor counts (tracked by device)
- 100+ unique visitors = maximum social bonus

### Optimal Strategy

- Maintain a daily streak (most important)
- Share your pet to unlock social bonuses
- Combined bonuses can eliminate cooldown entirely
- Focus on consistency over intensity

---

## 🔮 Future Enhancements (Ideas)

- **Streak Freeze Items**: Allow users to "freeze" their streak for a day
- **Social Milestones**: Special rewards at 50, 100, 500 interactors
- **Leaderboards**: Show top streaks and most popular pets
- **Achievements**: Badges for reaching specific milestones
- **Streak Recovery**: Grace period to recover broken streaks
- **Premium Bonuses**: Additional tiers for premium users

---

## 📝 Notes

- All dates use UTC to avoid timezone issues
- Streak is calculated on each action attempt
- Social bonus fetches real-time interaction count
- Cooldown calculation is centralized for consistency
- UI updates happen in real-time via subscriptions
- System is fully backward compatible with existing pets
