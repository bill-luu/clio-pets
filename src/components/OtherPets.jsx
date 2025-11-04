import React, { useState, useEffect } from "react";
import { getAllPets } from "../services/petService";
import { getPetPixelArt } from "../utils/pixelArt";
import { getStageLabelWithEmoji, getStageInfo } from "../utils/petStages";
import "./styles/Home.css";

export default function OtherPets({ user }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadAllPets = async () => {
      try {
        setLoading(true);
        setError(null);
        const allPets = await getAllPets();
        // Filter out the current user's pets
        const otherUsersPets = allPets.filter((pet) => pet.userId !== user.uid);
        setPets(otherUsersPets);
      } catch (err) {
        console.error("Error loading pets:", err);
        setError("Failed to load pets. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadAllPets();
  }, [user.uid]);

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading other pets...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h2>Other Clio-Pets</h2>
        <p className="welcome-text">Explore pets from the Clio community!</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {pets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-content">
            <h3>No other pets yet!</h3>
            <p>Be the first to add a pet to the community.</p>
          </div>
        </div>
      ) : (
        <div className="pets-section">
          <div className="pets-grid">
            {pets.map((pet) => {
              const PixelArtComponent = getPetPixelArt(pet.species);
              const stageInfo = getStageInfo(pet.stage);
              return (
                <div key={pet.id} className="pet-card">
                  <div className="pet-card-header">
                    <h3>{pet.name}</h3>
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
                    {pet.ownerEmail && (
                      <p>
                        <strong>Owner:</strong> {pet.ownerEmail}
                      </p>
                    )}
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
    </div>
  );
}

