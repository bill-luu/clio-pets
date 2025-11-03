import React, { useState, useEffect, useCallback } from "react";
import { getUserPets, deletePet } from "../services/petService";
import { getPetPixelArt } from "../utils/pixelArt";
import AddPetModal from "./AddPetModal";
import PetDetailsModal from "./PetDetailsModal";
import "./styles/Home.css";

export default function Home({ user }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [error, setError] = useState(null);

  const loadPets = useCallback(async () => {
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
  }, [user.uid]);

  useEffect(() => {
    loadPets();
  }, [loadPets]);

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

  const handlePetClick = (pet) => {
    setSelectedPet(pet);
  };

  const handlePetUpdated = () => {
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
            {pets.map((pet) => {
              const PixelArtComponent = getPetPixelArt(pet.species);
              return (
                <div key={pet.id} className="pet-card" onClick={() => handlePetClick(pet)}>
                  <div className="pet-card-header">
                    <h3>{pet.name}</h3>
                    <button
                      className="btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePet(pet.id);
                      }}
                      title="Delete pet"
                    >
                      ×
                    </button>
                  </div>
                  {PixelArtComponent && (
                    <div className="pet-card-pixel-art">
                      <PixelArtComponent />
                    </div>
                  )}
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
                  <div className="pet-card-stats">
                    <div className="mini-stat">
                      <span>🍖</span>
                      <span>{pet.fullness || 50}</span>
                    </div>
                    <div className="mini-stat">
                      <span>😊</span>
                      <span>{pet.happiness || 50}</span>
                    </div>
                    <div className="mini-stat">
                      <span>✨</span>
                      <span>{pet.cleanliness || 50}</span>
                    </div>
                    <div className="mini-stat">
                      <span>⚡</span>
                      <span>{pet.energy || 50}</span>
                    </div>
                  </div>
                </div>
              );
            })}
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

      {selectedPet && (
        <PetDetailsModal
          pet={selectedPet}
          onClose={() => setSelectedPet(null)}
          onPetUpdated={handlePetUpdated}
        />
      )}
    </div>
  );
}

