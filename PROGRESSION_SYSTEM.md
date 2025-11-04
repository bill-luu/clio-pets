# 🎮 Pet Progression System

Complete documentation for the pet age, stage evolution, and stat decay system.

---

## 📊 Overview

The pet progression system consists of three interconnected mechanics:

1. **Stats System** - Four core stats that represent pet health
2. **Age System** - Performance-based aging (1 real day = 1 pet year if cared for)
3. **Stage Evolution** - XP-based evolution through life stages (Baby → Teen → Adult)

---

## 🎯 Core Stats

Every pet has **four primary stats** (range: 0-100):

| Stat | Icon | Description | Critical Below |
|------|------|-------------|----------------|
| **Fullness** | 🍖 | How fed/hungry the pet is | < 20 |
| **Happiness** | 😊 | Pet's mood and joy level | < 20 |
| **Cleanliness** | ✨ | How clean the pet is | < 20 |
| **Energy** | ⚡ | Pet's stamina and energy | < 20 |

### **Additional Stats:**

- **XP** (Experience Points): 0+ with no maximum, never decays
- **Age**: In years, determined by daily care quality
- **Stage**: Life stage based on XP (Baby, Teen, or Adult)

### **Starting Values:**

All new pets start with:
- Stats: 50 (all four core stats)
- XP: 0
- Age: 0 years (Newborn)
- Stage: 1 (Baby)

---

## 🎮 Actions System

### **Available Actions:**

| Action | Cooldown | Effects | XP Gained | Notes |
|--------|----------|---------|-----------|-------|
| **Feed** 🍖 | 10 min | Fullness +20 | +5 | Basic feeding |
| **Play** 🎾 | 10 min | Happiness +20, Energy -10 | +10 | Fun but tiring |
| **Clean** 🛁 | 10 min | Cleanliness +25 | +5 | Bath/grooming |
| **Rest** 😴 | 10 min | Energy +30 | +5 | Sleep/nap |
| **Exercise** 🏃 | 10 min | Happiness +10, Energy -15, Fullness -10 | +15 | Best XP, demanding |
| **Treat** 🦴 | 10 min | Fullness +10, Happiness +15 | +5 | Special snack |

### **Cooldown System:**

- **Duration**: 10 minutes (600 seconds) between ANY actions
- **Global**: One cooldown applies to all actions
- **Purpose**: Prevents spam and encourages strategic play

### **Action Rules:**

- Stats are **clamped** at 0 minimum, 100 maximum
- Actions that would exceed 100 simply cap at 100
- Some actions have **prerequisites** (e.g., Exercise requires Energy ≥ 20)
- XP **never decreases** - it only accumulates

---

## 📉 Stat Decay System

### **Decay Mechanics:**

Stats naturally decay over time to create gameplay pressure and reward consistent care.

**Formula:**
```
Decay Amount = days_elapsed × 5

Example:
- 1 day passed: -5 to all stats
- 3 days passed: -15 to all stats
- 5 days passed: -25 to all stats
```

### **When Decay Happens:**

Decay is evaluated when:
1. User performs any action on the pet
2. At least 24 hours have passed since `lastAgeCheck`

### **What Decays:**

- ✅ Fullness: Decreases
- ✅ Happiness: Decreases  
- ✅ Cleanliness: Decreases
- ✅ Energy: Decreases
- ❌ XP: **Never decays**
- ❌ Stage: **Never regresses**

### **Decay Rules:**

- Decay is calculated from `lastAgeCheck` timestamp
- Stats cannot go below 0 (clamped)
- Decay happens AFTER age evaluation (see Age System)
- All four stats decay by the same amount

---

## 🎂 Age System

### **How Aging Works:**

Your pet ages **1 year per real-life day** - but only if you take good care of it!

**Growth Formula:**
```
IF (3 out of 4 stats ≥ 45) THEN:
    age increases by 1 year per day elapsed
ELSE:
    no aging occurs
```

### **Age Evaluation Process:**

The system evaluates age daily using the **Average Decay Method**:

```
1. Check if 24+ hours have passed since lastAgeCheck
2. Get current stats (before decay)
3. Calculate what stats will be after decay
4. Calculate AVERAGE: (current_stats + decayed_stats) / 2
5. Check threshold on AVERAGE stats: 3/4 ≥ 45?
6. If YES: age += days_elapsed
7. Apply decay to stats
8. Update lastAgeCheck timestamp
```

### **Example Scenarios:**

**Scenario 1: Well-Cared Pet**
```
Day 0: Stats [70, 70, 70, 60]
Day 1 evaluation:
  - Current: [70, 70, 70, 60]
  - After decay (-5): [65, 65, 65, 55]
  - Average: [67.5, 67.5, 67.5, 57.5]
  - Threshold check: 4/4 ≥ 45 ✅
  - Result: Age 0 → 1 year old
  - Stats become: [65, 65, 65, 55]
```

**Scenario 2: Neglected Pet**
```
Day 2: Stats [40, 35, 35, 30]
Day 3 evaluation:
  - Current: [40, 35, 35, 30]
  - After decay (-5): [35, 30, 30, 25]
  - Average: [37.5, 32.5, 32.5, 27.5]
  - Threshold check: 0/4 ≥ 45 ❌
  - Result: No aging
  - Stats become: [35, 30, 30, 25]
```

**Scenario 3: Gone for 3 Days**
```
Day 0: Stats [80, 80, 80, 80]
Day 3 evaluation (no actions for 3 days):
  - Current: [80, 80, 80, 80]
  - After decay (-15): [65, 65, 65, 65]
  - Average: [72.5, 72.5, 72.5, 72.5]
  - Threshold check: 4/4 ≥ 45 ✅
  - Result: Age += 3 years (catches up!)
  - Stats become: [65, 65, 65, 65]
```

### **Age Threshold Breakdown:**

**Why 3 out of 4 stats?**
- Forgiving: One stat can be low
- Realistic: Pets can be dirty but still grow
- Strategic: Must balance care across stats
- Achievable: With 5 actions/day, easy to maintain

**Why ≥ 45?**
- Below starting value (50) but achievable
- Requires some care but not perfection
- Works well with 5-point daily decay
- Casual-friendly threshold

### **Age Display:**

```javascript
0 years → "Newborn"
1 year → "1 year old"
2+ years → "X years old"

Age Status Messages:
0 years: "Just born!"
1-2 years: "Very young"
3-5 years: "Young"
6-10 years: "Mature"
11-15 years: "Senior"
16+ years: "Elder"
```

---

## ⭐ Stage Evolution System

### **Stage Thresholds:**

Evolution is based purely on **XP accumulated** (not age or stats):

| Stage | ID | XP Range | Name | Emoji | Color |
|-------|----|---------:|------|-------|-------|
| Baby | 1 | 0-99 | Baby | 🍼 | Light Blue |
| Teen | 2 | 100-299 | Teen | 🧒 | Light Green |
| Adult | 3 | 300+ | Adult | 👨 | Purple |

### **Evolution Mechanics:**

- **Automatic**: Checks after every action that grants XP
- **Instant**: Evolution happens immediately when XP crosses threshold
- **Irreversible**: Cannot regress to previous stage
- **Independent**: Not affected by age, stats, or decay

### **XP Requirements:**

```
Baby → Teen: Need 100 XP
Teen → Adult: Need 300 XP total (200 more from Teen)

Average XP per action: ~7.5 XP
Actions needed for Adult: ~40 actions
```

### **Evolution Timeline:**

**Active Player (10 actions/day):**
- Day 1-2: Reach Teen (~13 actions)
- Day 3-4: Reach Adult (~40 total actions)

**Casual Player (5 actions/day):**
- Day 2-3: Reach Teen
- Day 7-8: Reach Adult

**Power Leveler (Exercise spam):**
- ~7 actions to Teen (7 × 15 XP = 105 XP)
- ~20 actions to Adult (20 × 15 XP = 300 XP)

### **Stage-Based Features:**

Each stage has:
- Unique emoji icon (🍼 🧒 👨)
- Unique color theme
- Different pixel art appearance (if implemented)
- Stage badge display on pet cards

---

## 🔄 Combined System Flow

### **What Happens When You Perform an Action:**

```
Step 1: Validate action type
Step 2: Check cooldown (fail if < 10 min)
Step 3: Calculate new stats from action effects
Step 4: Calculate new XP from action
Step 5: Check for evolution (XP threshold crossed?)
Step 6: Check for age evaluation (24+ hours passed?)
        ↓ If yes:
        6a. Calculate decay amount
        6b. Calculate average stats
        6c. Check age threshold (3/4 ≥ 45?)
        6d. Age increases if threshold met
        6e. Apply decay to stats
Step 7: Update database with:
        - New stats (possibly decayed)
        - New XP
        - New stage (if evolved)
        - New age (if aged)
        - lastActionAt timestamp
        - lastAgeCheck (if evaluated)
Step 8: Return result with notifications
```

### **Example: Complete Flow**

```
Scenario: User hasn't played in 2 days, returns and feeds pet

Initial State:
- Age: 3 years
- Stage: Teen (XP: 150)
- Stats: [70, 70, 70, 60]
- Last check: 2 days ago

Action: Feed (+20 fullness, +5 XP)

Process:
1. New stats calculated: [90, 70, 70, 60]
2. New XP: 155
3. Evolution check: 155 XP = Teen (no change)
4. Age evaluation triggered (2 days passed):
   - Decay: 2 × 5 = -10
   - Before decay: [90, 70, 70, 60]
   - After decay: [80, 60, 60, 50]
   - Average: [85, 65, 65, 55]
   - Threshold: 4/4 ≥ 45 ✅
   - Age: 3 → 5 years (catches up 2 years!)
5. Database updated with:
   - Stats: [80, 60, 60, 50]
   - XP: 155
   - Stage: 2 (Teen)
   - Age: 5 years
   - lastAgeCheck: now

Notifications shown:
- "Your pet aged 2 years!"
- "Stats decayed by 10 due to time passing."
```

---

## 🎯 Gameplay Balance

### **Daily Care Requirements:**

To maintain aging (3/4 stats ≥ 45):

**Minimum Daily Routine (4-5 actions):**
```
Day starts: [50, 50, 50, 50]
1. Feed → [70, 50, 50, 50]
2. Play → [70, 70, 50, 40]
3. Clean → [70, 70, 75, 40]
4. Rest → [70, 70, 75, 70]
End of day: All 4 stats above 45 ✅
XP gained: ~25 XP
```

**After decay next day:**
```
Stats become: [65, 65, 70, 65]
Still healthy, ready for next day
```

### **Progression Rates:**

| Play Style | Actions/Day | Age Gain/Day | Days to Teen | Days to Adult |
|------------|-------------|--------------|--------------|---------------|
| Casual | 3-5 | ~1 year | 3 days | 8 days |
| Active | 6-10 | ~1 year | 2 days | 4 days |
| Power | 10+ | ~1 year | 1-2 days | 3-4 days |
| Neglect | 0-2 | 0 years | Never | Never |

### **Stat Decay Pressure:**

```
Day 0: Stats [70, 70, 70, 70] → Average 70 ✅
Day 1: No actions → Decay to [65, 65, 65, 65] → Average 65 ✅
Day 2: No actions → Decay to [60, 60, 60, 60] → Average 60 ✅
Day 3: No actions → Decay to [55, 55, 55, 55] → Average 55 ✅
Day 4: No actions → Decay to [50, 50, 50, 50] → Average 50 ✅
Day 5: No actions → Decay to [45, 45, 45, 45] → Average 45 ✅
Day 6: No actions → Decay to [40, 40, 40, 40] → Average 40 ❌ FAIL
```

**Takeaway**: Can skip 5 days with perfect stats before losing age growth

---

## 📈 Possible Pet Outcomes

The dual progression system creates diverse outcomes:

### **Outcome Matrix:**

| Care Pattern | XP (Stage) | Age | Result |
|--------------|------------|-----|--------|
| Active + Caring | High (Adult) | High | **Ideal**: Old Adult pet |
| Active + Neglectful | High (Adult) | Low | **Power Leveler**: Young Adult |
| Casual + Caring | Low (Teen) | High | **Caretaker**: Old Teen |
| Neglectful | Low (Baby) | Low | **Abandoned**: Newborn Baby |

### **Example Pets:**

**🏆 Master Caretaker:**
```
After 10 days of daily care:
- Age: 10 years old
- Stage: Adult (350 XP)
- Stats: [80, 85, 80, 85]
- Description: Mature, thriving adult pet
```

**⚡ Speed Runner:**
```
After 3 days of intense play:
- Age: 1 year old
- Stage: Adult (300 XP)
- Stats: [50, 55, 50, 50]
- Description: Young adult, rapid evolution
```

**💎 Patient Casual Player:**
```
After 20 days of light play:
- Age: 18 years old
- Stage: Teen (180 XP)
- Stats: [60, 60, 65, 60]
- Description: Elder teen, slow and steady
```

**😢 Neglected Pet:**
```
After 7 days of no care:
- Age: 0 years old
- Stage: Baby (10 XP)
- Stats: [15, 15, 15, 15]
- Description: Critical condition, needs rescue
```

---

## 🔧 Technical Implementation

### **Database Fields:**

```javascript
// Pet Document Structure
{
  // Basic info
  userId: string,
  name: string,
  species: string,
  // ... other basic fields
  
  // Core stats (0-100)
  fullness: number,
  happiness: number,
  cleanliness: number,
  energy: number,
  
  // Progression
  xp: number,              // Never decays, 0+
  stage: number,           // 1=Baby, 2=Teen, 3=Adult
  ageInYears: number,      // 0+ years
  
  // Timestamps
  lastActionAt: Timestamp, // For cooldown
  lastAgeCheck: Timestamp, // For decay calculation
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### **Key Functions:**

**Age System** (`src/utils/petAge.js`):
```javascript
calculateStatDecay(pet, now) → decay amount
checkStatsThreshold(stats) → boolean (3/4 ≥ 45)
evaluatePetAge(pet) → { aged, decayed, newStats, newAge, ... }
formatAgeDisplay(ageInYears) → "X years old"
```

**Progression System** (`src/utils/petProgression.js`):
```javascript
getStageFromXP(xp) → stage ID (1, 2, or 3)
checkEvolution(currentStage, newXP) → { evolved, newStage, message }
getProgressPercentage(currentXP) → 0-100%
getProgressToNextStage(currentXP) → detailed progress info
```

**Action System** (`src/services/petActionService.js`):
```javascript
performPetAction(petId, actionType) → {
  success,
  newStats,
  evolution,      // null or evolution result
  aging,          // null or aging result
  notifications   // array of messages
}
```

---

## 🎨 UI Display Recommendations

### **Pet Card Display:**

```
╔═══════════════════════════════════════╗
║  Fluffy                         [×]   ║
║  🧒 Teen                               ║
║                                        ║
║       [Pixel Art Cat]                 ║
║                                        ║
║  Species: Cat                         ║
║  Age: 5 years old                     ║
║                                        ║
║  🍖 70  😊 65  ✨ 80  ⚡ 60            ║
║                                        ║
║  XP: 150 / 300 to Adult               ║
║  [██████████░░░░░░░░] 50%             ║
╚═══════════════════════════════════════╝
```

### **Notifications:**

Show notifications when:
- ✅ Pet evolves: "🎉 Your pet evolved to Teen!"
- ✅ Pet ages: "Your pet aged 2 years!"
- ⚠️ Stats decay: "Stats decayed by 10 due to time passing."
- ❌ Age threshold not met: "Your pet needs better care to age."

### **Progress Indicators:**

- **XP Progress Bar**: Show progress to next stage
- **Age Display**: Always visible ("5 years old")
- **Stage Badge**: Prominent display with emoji and color
- **Stat Bars**: Color-coded (green ≥ 70, yellow ≥ 40, red < 40)

---

## 📚 Design Philosophy

### **Goals:**

1. **Reward Consistency**: Daily care = steady aging
2. **Reward Activity**: More actions = faster evolution
3. **Forgiving System**: Can miss days without disaster
4. **Clear Feedback**: Players understand cause and effect
5. **Dual Progression**: Two paths (age vs stage) for variety
6. **Strategic Depth**: Must balance stats and manage resources

### **Key Decisions:**

- **Average decay method**: Balances fairness and pressure
- **3/4 threshold**: Forgiving but requires effort
- **5-point decay**: Slow enough to be manageable
- **10-minute cooldown**: Prevents spam, encourages sessions
- **XP-based stages**: Rewards engagement, independent of care quality
- **No stat decay for XP**: Progress never lost

---

## 🐛 Edge Cases & Handling

### **New Users:**

- Pets start with stats at 50 (immediately pass threshold)
- First day always allows aging if any actions performed
- Default stage and age fields use fallbacks (0 and 1)

### **Existing Pets (Migration):**

Code uses fallbacks for missing fields:
```javascript
pet.ageInYears || 0
pet.lastAgeCheck || pet.createdAt
pet.stage || 1
```

### **Multiple Day Skips:**

- Decay calculated: `days_elapsed × 5`
- Age catches up if average stats meet threshold
- Example: 3 days away with good stats = age +3 years

### **Stat Capping:**

- Stats cannot go below 0 or above 100
- Decay stops at 0 (won't go negative)
- Actions cap at 100 (no overflow)

### **Time Manipulation:**

- System uses server timestamps (`serverTimestamp()`)
- Clock changes on device don't affect calculations
- `lastAgeCheck` compared to server time

---

## 📊 Formulas Reference

```javascript
// Decay Amount
decay = days_since_last_check × 5

// Age Evaluation (Average Decay System)
current_stats = [fullness, happiness, cleanliness, energy]
decayed_stats = current_stats - decay (clamped 0-100)
average_stats = (current_stats + decayed_stats) / 2
threshold_met = count(average_stats >= 45) >= 3
if (threshold_met) {
  age += days_since_last_check
}

// Stage Evolution
if (xp < 100) stage = 1    // Baby
else if (xp < 300) stage = 2   // Teen
else stage = 3                  // Adult

// XP Progress Percentage
if (stage == 1) progress = (xp / 100) × 100%
if (stage == 2) progress = ((xp - 100) / 200) × 100%
if (stage == 3) progress = 100%
```

---

## 🚀 Future Enhancements

Potential additions to the system:

- **Stat-specific decay rates** (e.g., fullness decays faster)
- **Stage-based multipliers** (adults need more care)
- **Happiness affects decay** (happy pets decay slower)
- **Milestones/achievements** (first evolution, age 10, etc.)
- **Level system** (separate from stages, based on total XP)
- **Seasonal events** (double XP, reduced decay)
- **Pet mood system** (based on recent care patterns)
- **Health score** (composite metric for pet wellness)

---

## 📞 Support

For questions or issues with the progression system:

1. Check this documentation first
2. Review `src/utils/petAge.js` for age logic
3. Review `src/utils/petProgression.js` for stage logic
4. Review `src/services/petActionService.js` for action integration
5. Test edge cases in development environment

---

**Last Updated**: November 2025  
**System Version**: 1.0  
**Decay System**: Simplified (5 per day)

