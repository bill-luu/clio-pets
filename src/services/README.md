# Pet Service API

This service provides helper functions to interact with the Firestore `pets` collection.

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

Creates a new pet for a user.

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
