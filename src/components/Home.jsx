import React, { useState, useEffect } from "react";
import { getUserPets, deletePet } from "../services/petService";
import AddPetModal from "./AddPetModal";
import "./styles/Home.css";

export default function Home({ user }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPets();
  }, [user]);

  const loadPets = async () => {
    try {
      setLoading(true);
      setError(null);
      const userPets = await getUserPets(user.uid);
      setPets(userPets);
    } catch (err) {
      console.error("Error loading pets:", err);
      setError("Failed to load pets. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePet = async (petId) => {
    if (window.confirm("Are you sure you want to delete this pet?")) {
      try {
        await deletePet(petId);
        setPets(pets.filter((pet) => pet.id !== petId));
      } catch (err) {
        console.error("Error deleting pet:", err);
        alert("Failed to delete pet. Please try again.");
      }
    }
  };

  const handlePetAdded = () => {
    setShowAddModal(false);
    loadPets();
  };

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading your pets...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h2>My Pets</h2>
        <p className="welcome-text">Welcome, {user.email}!</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {pets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-content">
            <h3>No pets yet!</h3>
            <p>Start by adding your first pet to keep track of their information.</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              Add Your First Pet
            </button>
          </div>
        </div>
      ) : (
        <div className="pets-section">
          <button
            className="btn btn-primary add-pet-btn"
            onClick={() => setShowAddModal(true)}
          >
            + Add Pet
          </button>

          <div className="pets-grid">
            {pets.map((pet) => (
              <div key={pet.id} className="pet-card">
                <div className="pet-card-header">
                  <h3>{pet.name}</h3>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeletePet(pet.id)}
                    title="Delete pet"
                  >
                    ×
                  </button>
                </div>
                <div className="pet-card-body">
                  <p>
                    <strong>Species:</strong> {pet.species || "Not specified"}
                  </p>
                  {pet.breed && (
                    <p>
                      <strong>Breed:</strong> {pet.breed}
                    </p>
                  )}
                  {pet.age && (
                    <p>
                      <strong>Age:</strong> {pet.age}
                    </p>
                  )}
                  {pet.color && (
                    <p>
                      <strong>Color:</strong> {pet.color}
                    </p>
                  )}
                  {pet.notes && (
                    <p className="pet-notes">
                      <strong>Notes:</strong> {pet.notes}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showAddModal && (
        <AddPetModal
          userId={user.uid}
          onClose={() => setShowAddModal(false)}
          onPetAdded={handlePetAdded}
        />
      )}
    </div>
  );
}

