# 🎮 Pet Progression System

Quick reference guide for the pet age and stage progression mechanics.

---

## 📊 Core Stats

Every pet has four stats (0-100 range):

| Stat | Icon | Description |
|------|------|-------------|
| **Fullness** | 🍖 | How fed the pet is |
| **Happiness** | 😊 | Pet's mood level |
| **Cleanliness** | ✨ | How clean the pet is |
| **Energy** | ⚡ | Pet's stamina level |

**Starting values:** All stats start at 50  
**XP:** Starts at 0, gained from actions, never decays

---

## 🎯 Actions & XP

**Cooldown:** 10 minutes between any actions

| Action | Stats Changed | XP Gained |
|--------|---------------|-----------|
| **Feed** 🍖 | Fullness +20 | +5 |
| **Play** 🎾 | Happiness +20, Energy -10 | +10 |
| **Clean** 🛁 | Cleanliness +25 | +5 |
| **Rest** 😴 | Energy +30 | +5 |
| **Exercise** 🏃 | Happiness +10, Energy -15, Fullness -10 | +15 (best!) |
| **Treat** 🦴 | Fullness +10, Happiness +15 | +5 |

**Average XP per action:** ~7.5 XP

---

## 📉 Stat Decay

**Rate:** Stats decay by **5 points per day**

- Evaluated when you perform an action after 24+ hours
- All four stats decay equally
- XP never decays
- Stats capped at 0 minimum, 100 maximum

---

## 🎂 Age System

**Growth Rate:** **1 month per real-life day** (if well-cared for)

### **Age Threshold:**
Your pet ages **1 month per day** IF **3 out of 4 stats are ≥ 45**

**Evaluation Method:**
1. Check if 24+ hours passed since last check
2. Calculate stat decay
3. Check threshold using **average** of (current stats + decayed stats) / 2
4. If threshold met: age += days elapsed (in months)
5. Apply decay to stats

**Display Format:**
- 0 months → "Newborn"
- 1-11 months → "X months old"
- 12+ months → "X years old" or "X years, Y months old"

---

## ⭐ Stage Evolution (XP-Based)

Evolution is based purely on XP accumulated:

| Stage | XP Range | Emoji | Evolution Requirement |
|-------|----------|-------|----------------------|
| **Baby** | 0-199 | 🍼 | Starting stage |
| **Teen** | 200-599 | 🧒 | Reach 200 XP |
| **Adult** | 600+ | 👨 | Reach 600 XP |

**Key Points:**
- Evolution is automatic when XP threshold is reached
- Evolution is irreversible
- Independent of age (but designed to align naturally)

---

## 📊 Progression Examples

### **Active Player (5 actions/day, ~37.5 XP/day):**

| Day | Age | XP | Stage | Notes |
|-----|-----|-----|-------|-------|
| 1 | 1 month | 37 | Baby 🍼 | Just starting |
| 3 | 3 months | 112 | Baby 🍼 | Growing |
| 6 | 6 months | 225 | **Teen 🧒** | First evolution! |
| 12 | 1 year | 450 | Teen 🧒 | Teenager |
| 16 | 1 year, 4 months | 600 | **Adult 👨** | Fully grown! |
| 30 | 2.5 years | 1125 | Adult 👨 | Mature pet |

### **Casual Player (3 actions/day, ~22.5 XP/day):**

| Day | Age | XP | Stage | Notes |
|-----|-----|-----|-------|-------|
| 1 | 1 month | 22 | Baby 🍼 | Starting |
| 7 | 7 months | 157 | Baby 🍼 | Still young |
| 9 | 9 months | 202 | **Teen 🧒** | Evolution! |
| 20 | 1 year, 8 months | 450 | Teen 🧒 | Growing steadily |
| 27 | 2 years, 3 months | 607 | **Adult 👨** | Adult! |

### **Neglected Pet (0-1 action/day):**

| Day | Age | XP | Stage | Notes |
|-----|-----|-----|-------|-------|
| 1 | 1 month | 5 | Baby 🍼 | Poor care |
| 7 | 1 month | 35 | Baby 🍼 | Not aging (stats too low) |
| 14 | 1 month | 70 | Baby 🍼 | Still not aging |
| 30 | 1 month | 150 | Baby 🍼 | Stuck as baby |

**Note:** Without consistent care, pets won't age even if they gain some XP!

---

## 🎯 Age & Stage Alignment

The system is designed so age and stage naturally align:

| Stage | Typical Age Range | Real Pet Equivalent |
|-------|------------------|---------------------|
| **Baby 🍼** | 0-6 months | Puppy/Kitten |
| **Teen 🧒** | 6-18 months | Adolescent |
| **Adult 👨** | 18+ months | Mature pet |

**Example Outcomes:**
- **Active + Caring**: 18-month-old Adult ✅ Perfect!
- **Active + Neglectful**: 8-month-old Adult (high XP, low age)
- **Casual + Caring**: 2-year-old Teen (low XP, high age)
- **Neglectful**: Newborn Baby (no progression)

---

## 🔄 Daily Care Example

**Day 1 Morning:**
```
Pet: Fluffy, Newborn Baby, 0 XP
Stats: [50, 50, 50, 50]
```

**Actions Throughout Day:**
```
1. Feed → Stats: [70, 50, 50, 50], XP: 5
2. Play → Stats: [70, 70, 50, 40], XP: 15
3. Rest → Stats: [70, 70, 50, 70], XP: 20
4. Clean → Stats: [70, 70, 75, 70], XP: 25
5. Treat → Stats: [80, 85, 75, 70], XP: 30
```

**Day 2 Morning (24 hours later):**
```
Age evaluation:
- Current stats: [80, 85, 75, 70]
- After decay (-5): [75, 80, 70, 65]
- Average: [77.5, 82.5, 72.5, 67.5]
- Threshold: 4/4 ≥ 45 ✅
- Result: Aged to 1 month old!
- Stats now: [75, 80, 70, 65]
- XP: 30 (unchanged)
- Stage: Baby (needs 200 XP for Teen)
```

---

## 📋 Quick Reference

### **To Age Your Pet:**
1. Keep **3 out of 4 stats ≥ 45** daily
2. Perform actions regularly (4-5 actions/day recommended)

### **To Evolve Your Pet:**
1. **Baby → Teen**: Gain 200 XP (~27 actions, 5-6 days)
2. **Teen → Adult**: Gain 600 XP total (~80 actions, 16-18 days)

### **Typical Timeline (Active Player):**
- **Week 1**: Baby (0-6 months, 0-200 XP)
- **Week 2-3**: Teen (6-18 months, 200-600 XP)
- **Week 3+**: Adult (18+ months, 600+ XP)

---

## 🔧 Technical Details

### **Database Fields:**
- `ageInYears` (number): Stores age in months (name kept for compatibility)
- `xp` (number): Total XP accumulated
- `stage` (number): 1=Baby, 2=Teen, 3=Adult
- `fullness`, `happiness`, `cleanliness`, `energy` (numbers 0-100)
- `lastAgeCheck` (timestamp): Last age evaluation time

### **Key Formulas:**
```javascript
// Decay
decay = days_since_last_check × 5

// Age Check
average_stats = (current_stats + decayed_stats) / 2
threshold_met = count(average_stats >= 45) >= 3
if (threshold_met) age_in_months += days_elapsed

// Stage
if (xp < 200) stage = Baby
else if (xp < 600) stage = Teen
else stage = Adult
```

---

## 💡 Tips

**For Faster Evolution:**
- Focus on Exercise (+15 XP per action)
- Play frequently (maximize actions per day)

**For Healthy Aging:**
- Keep stats balanced (don't let any drop below 30)
- Play at least 4-5 times per day
- Check on your pet daily

**Avoid:**
- Letting all stats decay below 45 (won't age)
- Skipping multiple days (stats will decay)
- Focusing only on one stat (need 3/4 above threshold)

