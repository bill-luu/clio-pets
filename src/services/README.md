# Pet Service API

This service provides helper functions to interact with the Firestore `pets` collection.

> 📚 **For complete system documentation** including age progression, stage evolution, and stat decay mechanics, see [PROGRESSION_SYSTEM.md](../../PROGRESSION_SYSTEM.md) in the root directory.

## Data Structure

Each pet document has the following structure:

```javascript
{
  userId: string,        // Required: The UID of the user who owns the pet
  name: string,          // Required: Pet's name
  species: string,       // Optional: e.g., "Dog", "Cat", "Bird"
  breed: string,         // Optional: e.g., "Golden Retriever"
  age: string,           // Optional: e.g., "3 years", "6 months"
  color: string,         // Optional: e.g., "Brown and white"
  notes: string,         // Optional: Additional notes
  // Pet stats (auto-initialized on creation)
  fullness: number,      // 0-100: How full/fed the pet is
  happiness: number,     // 0-100: Pet's happiness level
  cleanliness: number,   // 0-100: How clean the pet is
  energy: number,        // 0-100: Pet's energy level
  xp: number,            // 0+: Experience points earned
  stage: number,         // 1=Baby, 2=Teen, 3=Adult (XP-based)
  ageInYears: number,    // 0+: Pet age in months (care-based, grows 1 month/day)
  lastActionAt: Timestamp,  // Last time an action was performed
  lastActionType: string,   // Type of last action performed
  lastAgeCheck: Timestamp,  // Last time age was evaluated
  createdAt: Timestamp,  // Auto-generated
  updatedAt: Timestamp   // Auto-generated
}
```

## Available Functions

### `getUserPets(userId)`

Retrieves all pets for a specific user, ordered by creation date (newest first).

**Parameters:**

- `userId` (string): The user's UID

**Returns:**

- Promise<Array>: Array of pet objects with their IDs

**Example:**

```javascript
import { getUserPets } from "./services/petService";

const pets = await getUserPets(user.uid);
console.log(pets);
// [{ id: 'abc123', name: 'Fluffy', species: 'Cat', ... }]
```

---

### `getPetById(petId)`

Retrieves a single pet by its document ID.

**Parameters:**

- `petId` (string): The pet's document ID

**Returns:**

- Promise<Object>: Pet object with ID

**Example:**

```javascript
import { getPetById } from "./services/petService";

const pet = await getPetById("abc123");
console.log(pet);
// { id: 'abc123', name: 'Fluffy', species: 'Cat', ... }
```

---

### `addPet(userId, petData)`

Creates a new pet for a user. All pets are automatically initialized with:

**Stats:**
- fullness: 50
- happiness: 50
- cleanliness: 50
- energy: 50

**Progression:**
- xp: 0
- stage: 1 (Baby)
- ageInYears: 0 (stores age in months, displays as "Newborn")
- lastAgeCheck: serverTimestamp()

**Parameters:**

- `userId` (string): The user's UID
- `petData` (Object): Pet information

**Returns:**

- Promise<string>: The new pet's document ID

**Example:**

```javascript
import { addPet } from "./services/petService";

const petId = await addPet(user.uid, {
  name: "Fluffy",
  species: "Cat",
  breed: "Persian",
  age: "2 years",
  color: "White",
  notes: "Very playful and loves treats",
});
console.log("Pet added with ID:", petId);
```

---

### `updatePet(petId, petData)`

Updates an existing pet's information.

**Parameters:**

- `petId` (string): The pet's document ID
- `petData` (Object): Updated pet information (only include fields to update)

**Returns:**

- Promise<void>

**Example:**

```javascript
import { updatePet } from "./services/petService";

await updatePet("abc123", {
  age: "3 years",
  notes: "Now prefers outdoor activities",
});
```

---

### `deletePet(petId)`

Deletes a pet from the database.

**Parameters:**

- `petId` (string): The pet's document ID

**Returns:**

- Promise<void>

**Example:**

```javascript
import { deletePet } from "./services/petService";

await deletePet("abc123");
```

## Error Handling

All functions throw errors if the operation fails. Always wrap calls in try-catch blocks:

```javascript
try {
  const pets = await getUserPets(user.uid);
  // Handle success
} catch (error) {
  console.error("Error loading pets:", error);
  // Handle error
}
```

## Security Rules

The Firestore security rules ensure that:

- Users can only read their own pets
- Users can only create pets with their own userId
- Users can only update/delete their own pets
- All operations require authentication

See `firestore.rules` for the complete security configuration.

---

# Pet Action Service API

This service provides functions to perform actions on pets and manage their stats.

## Available Actions

- **feed**: Increases fullness (+20), grants XP (+5)
- **play**: Increases happiness (+20), decreases energy (-10), grants XP (+10)
- **clean**: Increases cleanliness (+25), grants XP (+5)
- **rest**: Increases energy (+30), grants XP (+5)
- **exercise**: Decreases energy (-15), increases happiness (+10), decreases fullness (-10), grants XP (+15)
- **treat**: Increases fullness (+10), increases happiness (+15), grants XP (+5)

All stats are clamped between 0-100 (except XP which only increases).

**Cooldown:** There is a 10-minute (600 second) cooldown between actions to prevent spam. Attempting to perform an action during cooldown will throw an error.

**Progression Integration:** Actions now also trigger:
- **Age Evaluation**: Checks if 24+ hours passed, applies decay, evaluates age threshold
- **Stage Evolution**: Checks if XP crosses evolution thresholds (200 XP → Teen, 600 XP → Adult)
- See [PROGRESSION_SYSTEM.md](../../PROGRESSION_SYSTEM.md) for complete details

## Available Functions

### `performPetAction(petId, actionType, userId)`

Performs an action on a pet, updating its stats accordingly and creating a notification.

**Parameters:**

- `petId` (string): The pet's document ID
- `actionType` (string): Type of action ('feed', 'play', 'clean', 'rest', 'exercise', 'treat')
- `userId` (string, optional): The user performing the action (for notifications)

**Returns:**

- Promise<Object>: Result object with success, stats, evolution, aging, and notifications

**Example:**

```javascript
import { performPetAction } from "./services/petActionService";

const result = await performPetAction("abc123", "feed", user.uid);
console.log(result);
// {
//   success: true,
//   actionType: 'feed',
//   effects: { fullness: 20, xp: 5 },
//   newStats: { fullness: 70, happiness: 50, cleanliness: 50, energy: 50, xp: 5 },
//   evolution: null,  // or { evolved: true, newStage: 2, message: "🎉 Your pet evolved to Teen!" }
//   aging: null,      // or { aged: true, yearsGained: 1, message: "Your pet aged 1 year!" }
//   notifications: [] // array of notification messages
// }
```

**Note:** This function now automatically creates a notification for the pet owner when an action is performed.

**Stat Decay:** Decay is handled automatically within `performPetAction` using the `evaluatePetAge` function. See `src/utils/petAge.js` for decay implementation details.

---

### `checkCooldown(pet)`

Checks if a pet is currently on cooldown from the last action.

**Parameters:**

- `pet` (Object): The pet object with lastActionAt timestamp

**Returns:**

- Object: Cooldown status with `isOnCooldown` (boolean) and `remainingSeconds` (number)

**Example:**

```javascript
import { checkCooldown } from "./services/petActionService";

const cooldownStatus = checkCooldown(pet);
console.log(cooldownStatus);
// { isOnCooldown: true, remainingSeconds: 7 }

if (cooldownStatus.isOnCooldown) {
  console.log(`Please wait ${cooldownStatus.remainingSeconds} seconds`);
}
```

---

### `getAvailableActions(pet)`

Returns a list of available actions for a pet with UI information.

**Parameters:**

- `pet` (Object): The pet object with current stats

**Returns:**

- Array: Array of action objects with type, name, description, icon, urgent flag, and disabled state

**Example:**

```javascript
import { getAvailableActions } from "./services/petActionService";

const actions = getAvailableActions(pet);
// [
//   {
//     type: 'feed',
//     name: 'Feed',
//     description: 'Give your pet food to increase fullness',
//     icon: '🍖',
//     urgent: false,
//     disabled: false
//   },
//   ...
// ]
```

---

### `getPetStatus(pet)`

Evaluates the overall health and status of a pet based on its stats.

**Parameters:**

- `pet` (Object): The pet object with current stats

**Returns:**

- Object: Status information with status level, message, average stat, and critical stats

**Example:**

```javascript
import { getPetStatus } from "./services/petActionService";

const status = getPetStatus(pet);
console.log(status);
// {
//   status: 'happy',
//   message: 'Your pet is doing great!',
//   avgStat: 65,
//   criticalStats: []
// }
```
