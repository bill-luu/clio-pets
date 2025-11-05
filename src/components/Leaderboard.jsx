import React, { useState, useEffect } from "react";
import {
  getTopPetsByXP,
  getTopPetsByInteractions,
  getRandomFeaturedPets,
} from "../services/leaderboardService";
import { getPetPixelArt } from "../utils/pixelArt";
import { getStageLabelWithEmoji } from "../utils/petStages";
import { formatAgeDisplay } from "../utils/petAge";
import "./styles/Leaderboard.css";

export default function Leaderboard() {
  const [topByXP, setTopByXP] = useState([]);
  const [topByInteractions, setTopByInteractions] = useState([]);
  const [featuredPets, setFeaturedPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const [xpPets, interactionPets, randomPets] = await Promise.all([
          getTopPetsByXP(5),
          getTopPetsByInteractions(5),
          getRandomFeaturedPets(5),
        ]);

        setTopByXP(xpPets);
        setTopByInteractions(interactionPets);
        setFeaturedPets(randomPets);
      } catch (err) {
        console.error("Error loading leaderboard data:", err);
        setError("Failed to load leaderboard. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
  }, []);

  const renderPetCard = (pet, rank, showStat = null) => {
    const PixelArtComponent = getPetPixelArt(pet.species);
    const isPodium = rank <= 3;
    const ageDisplay = formatAgeDisplay(pet.ageInYears || 0);

    return (
      <div
        key={pet.id}
        className={`leaderboard-pet-card ${isPodium ? `podium-${rank}` : ""}`}
      >
        <div className="pet-rank">
          {rank === 1 && "🥇"}
          {rank === 2 && "🥈"}
          {rank === 3 && "🥉"}
          {rank > 3 && `#${rank}`}
        </div>
        <div className="pet-info">
          {PixelArtComponent && (
            <div className="pet-pixel-art">
              <PixelArtComponent stage={pet.stage || 1} color={pet.color} />
            </div>
          )}
          <div className="pet-details">
            <h3 className="pet-name">{pet.name}</h3>
            <p className="pet-species">
              {pet.species} {getStageLabelWithEmoji(pet.stage || 1)}
            </p>
            <p className="pet-age">Age: {ageDisplay}</p>
            <p className="pet-owner">Owner: {pet.ownerEmail || "Unknown"}</p>
            {showStat && (
              <p className="pet-stat">
                <strong>{showStat.label}:</strong> {showStat.value}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCategory = (title, description, pets, statLabel = null) => {
    return (
      <div className="leaderboard-category">
        <div className="category-header">
          <h2>{title}</h2>
          <p className="category-description">{description}</p>
        </div>

        {pets.length === 0 ? (
          <div className="no-pets">No pets yet in this category!</div>
        ) : (
          <div className="pets-list">
            {pets.map((pet, index) => {
              const rank = index + 1;
              const showStat = statLabel
                ? {
                    label: statLabel,
                    value:
                      statLabel === "XP"
                        ? pet.xp || 0
                        : pet.interactionCount || 0,
                  }
                : null;
              return renderPetCard(pet, rank, showStat);
            })}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="leaderboard-container">
        <div className="loading">Loading leaderboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-header">
        <h1>Leaderboard & Featured Pets</h1>
        <p className="header-subtitle">
          See the top pets across the Clio-Pets community!
        </p>
      </div>

      {renderCategory(
        "🏆 Most XP (Owner Interactions)",
        "Pets with the most experience gained from owner care",
        topByXP,
        "XP"
      )}

      {renderCategory(
        "💝 Most Loved by Community",
        "Pets with the most interactions from other users",
        topByInteractions,
        "Interactions"
      )}

      {renderCategory(
        "⭐ Featured Pets",
        "Random selection of pets from the community",
        featuredPets
      )}
    </div>
  );
}

