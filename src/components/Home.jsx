import React, { useState, useEffect, useCallback } from "react";
import { getUserPets, deletePet } from "../services/petService";
import { getPetPixelArt } from "../utils/pixelArt";
import { getStageLabelWithEmoji, getStageInfo } from "../utils/petStages";
import { formatAgeDisplay } from "../utils/petAge";
import { getProgressToNextStage } from "../utils/petProgression";
import AddPetModal from "./AddPetModal";
import PetDetailsModal from "./PetDetailsModal";
import ConfirmModal from "./ConfirmModal";
import "./styles/Home.css";

export default function Home({ user }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedPet, setSelectedPet] = useState(null);
  const [error, setError] = useState(null);
  const [petToDelete, setPetToDelete] = useState(null);

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

  const handleDeletePet = async () => {
    if (!petToDelete) return;

    try {
      await deletePet(petToDelete.id);
      setPets(pets.filter((pet) => pet.id !== petToDelete.id));
      setPetToDelete(null);
    } catch (err) {
      console.error("Error deleting pet:", err);
      setError("Failed to delete pet. Please try again.");
      setPetToDelete(null);
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
              const stageInfo = getStageInfo(pet.stage);
              const progressInfo = getProgressToNextStage(pet.xp || 0);
              const ageDisplay = formatAgeDisplay(pet.ageInYears || 0);
              
              return (
                <div key={pet.id} className="pet-card" onClick={() => handlePetClick(pet)}>
                  <div className="pet-card-header">
                    <h3>{pet.name}</h3>
                    <button
                      className="btn-delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPetToDelete(pet);
                      }}
                      title="Delete pet"
                    >
                      ×
                    </button>
                  </div>
                  <div className="pet-stage-badge" style={{ backgroundColor: stageInfo.color }}>
                    {getStageLabelWithEmoji(pet.stage)}
                  </div>
                  {PixelArtComponent && (
                    <div className="pet-card-pixel-art">
                      <PixelArtComponent stage={pet.stage || 1} />
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
                    <p>
                      <strong>Age:</strong> {ageDisplay}
                    </p>
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
                  <div className="pet-card-progress">
                    <div className="progress-label">
                      <span>⭐ {pet.xp || 0} XP</span>
                      {!progressInfo.isMaxStage && (
                        <span className="progress-next">{progressInfo.message}</span>
                      )}
                      {progressInfo.isMaxStage && (
                        <span className="progress-max">Max Stage!</span>
                      )}
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill" 
                        style={{ 
                          width: `${progressInfo.percentage}%`,
                          backgroundColor: stageInfo.color 
                        }}
                      />
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
      <ConfirmModal
        isOpen={!!petToDelete}
        title="Delete Pet"
        message={`Are you sure you want to delete ${petToDelete?.name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="btn-danger"
        onConfirm={handleDeletePet}
        onCancel={() => setPetToDelete(null)}
      />
    </div>
  );
}

