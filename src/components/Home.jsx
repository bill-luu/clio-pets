import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { subscribeToUserPets, deletePet } from "../services/petService";
import { getPetPixelArt } from "../utils/pixelArt";
import { getStageLabelWithEmoji, getStageInfo } from "../utils/petStages";
import { formatAgeDisplay } from "../utils/petAge";
import { getProgressToNextStage } from "../utils/petProgression";
import { getStreakBonus, getStreakTierInfo } from "../utils/streakTracker";
import { getSocialBonus, getSocialTierInfo } from "../utils/socialBonus";
import { getInteractionCount } from "../services/sharedPetService";
import AddPetModal from "./AddPetModal";
import ConfirmModal from "./ConfirmModal";
import Pagination from "./Pagination";
import "./styles/Home.css";

export default function Home({ user }) {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState(null);
  const [petToDelete, setPetToDelete] = useState(null);
  const [interactionStats, setInteractionStats] = useState({});

  // Filter states
  const [filterSpecies, setFilterSpecies] = useState("all");
  const [filterStage, setFilterStage] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Show 9 pets per page (3x3 grid)

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Subscribe to real-time updates for user's pets
    const unsubscribe = subscribeToUserPets(user.uid, async (userPets, err) => {
      if (err) {
        console.error("Error loading pets:", err);
        setError("Failed to load pets. Please try again.");
        setLoading(false);
        return;
      }
      setPets(userPets);

      // Load interaction stats for all pets
      const stats = {};
      for (const pet of userPets) {
        if (pet.sharingEnabled) {
          try {
            const petStats = await getInteractionCount(pet.id);
            stats[pet.id] = petStats;
          } catch (err) {
            console.error(`Error loading stats for pet ${pet.id}:`, err);
            stats[pet.id] = { uniqueInteractors: 0 };
          }
        } else {
          stats[pet.id] = { uniqueInteractors: 0 };
        }
      }
      setInteractionStats(stats);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user.uid]);

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
    // No need to manually reload - real-time listener will update automatically
  };

  const handlePetClick = (pet) => {
    navigate(`/pet/${pet.id}`);
  };

  // Calculate average stat for a pet
  const calculateAveStat = (pet) => {
    const fullness = pet.fullness || 50;
    const happiness = pet.happiness || 50;
    const cleanliness = pet.cleanliness || 50;
    const energy = pet.energy || 50;
    return (fullness + happiness + cleanliness + energy) / 4;
  };

  // Filter pets based on selected filters
  const filteredPets = pets.filter((pet) => {
    // Filter by species
    if (filterSpecies !== "all" && pet.species !== filterSpecies) {
      return false;
    }

    // Filter by stage
    if (filterStage !== "all" && pet.stage !== parseInt(filterStage)) {
      return false;
    }

    // Filter by status (needs attention if aveStat < 40)
    if (filterStatus !== "all") {
      const aveStat = calculateAveStat(pet);
      if (filterStatus === "needs-attention" && aveStat >= 40) {
        return false;
      }
      if (filterStatus === "doing-okay" && aveStat < 40) {
        return false;
      }
    }

    return true;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredPets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPets = filteredPets.slice(startIndex, endIndex);
  const showingStart = filteredPets.length > 0 ? startIndex + 1 : 0;
  const showingEnd = Math.min(endIndex, filteredPets.length);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterSpecies, filterStage, filterStatus]);

  // Reset filters
  const resetFilters = () => {
    setFilterSpecies("all");
    setFilterStage("all");
    setFilterStatus("all");
  };

  // Check if any filters are active
  const hasActiveFilters = filterSpecies !== "all" || filterStage !== "all" || filterStatus !== "all";

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
          <div className="action-buttons">
            <button
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              + Add Pet
            </button>
            <button
              className={`btn ${showFilters ? 'btn-secondary' : 'btn-primary'}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              {showFilters ? "Hide Filters" : "Show Filters"}
            </button>
          </div>

          {/* Filter Section */}
          {showFilters && (
          <div className="filter-section">
            <h3 className="filter-title">Filter Pets</h3>
            <div className="filter-controls">
              <div className="filter-group">
                <label htmlFor="filter-species">Species:</label>
                <select
                  id="filter-species"
                  value={filterSpecies}
                  onChange={(e) => setFilterSpecies(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Species</option>
                  <option value="Dog">Dog</option>
                  <option value="Cat">Cat</option>
                  <option value="Bird">Bird</option>
                  <option value="Bunny">Bunny</option>
                  <option value="Lizard">Lizard</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="filter-stage">Stage:</label>
                <select
                  id="filter-stage"
                  value={filterStage}
                  onChange={(e) => setFilterStage(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Stages</option>
                  <option value="1">🍼 Baby</option>
                  <option value="2">🐾 Teen</option>
                  <option value="3">👑 Adult</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="filter-status">Status:</label>
                <select
                  id="filter-status"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Statuses</option>
                  <option value="doing-okay">😊 Doing Okay</option>
                  <option value="needs-attention">⚠️ Needs Attention</option>
                </select>
              </div>

              {hasActiveFilters && (
                <button
                  className="btn btn-secondary reset-filters-btn"
                  onClick={resetFilters}
                >
                  Reset Filters
                </button>
              )}
            </div>

            <div className="filter-results">
              Showing {filteredPets.length} of {pets.length} pets
            </div>
          </div>
          )}

          {/* No Results Message */}
          {filteredPets.length === 0 ? (
            <div className="no-results">
              <p>No pets match the selected filters.</p>
              <button className="btn btn-secondary" onClick={resetFilters}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="pets-grid">
                {paginatedPets.map((pet) => {
                const PixelArtComponent = getPetPixelArt(pet.species);
                const stageInfo = getStageInfo(pet.stage);
                const progressInfo = getProgressToNextStage(pet.xp || 0);
                const ageDisplay = formatAgeDisplay(pet.ageInYears || 0);
                const isSad = (pet.happiness || 50) < 40;
                const isDirty = (pet.cleanliness || 50) < 40;
                const isExhausted = (pet.energy || 50) < 40;

                // Calculate tier info
                const streakBonus = getStreakBonus(pet.currentStreak || 0);
                const streakTierInfo = getStreakTierInfo(streakBonus.tier);
                const uniqueInteractors = interactionStats[pet.id]?.uniqueInteractors || 0;
                const socialBonus = getSocialBonus(uniqueInteractors);
                const socialTierInfo = getSocialTierInfo(socialBonus.tier);

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
                  <div className="pet-badges">
                    <div className="pet-stage-badge" style={{ backgroundColor: stageInfo.color }}>
                      {getStageLabelWithEmoji(pet.stage)}
                    </div>
                    <div className="pet-tier-badge" style={{ backgroundColor: streakTierInfo.color }}>
                      {streakTierInfo.emoji} {streakTierInfo.name}
                    </div>
                    <div className="pet-tier-badge" style={{ backgroundColor: socialTierInfo.color }}>
                      {socialTierInfo.emoji} {socialTierInfo.name}
                    </div>
                  </div>
                  {PixelArtComponent && (
                    <div className="pet-card-pixel-art">
                      <PixelArtComponent stage={pet.stage || 1} color={pet.color} isSad={isSad} isDirty={isDirty} isExhausted={isExhausted} />
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
              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredPets.length}
                  showingStart={showingStart}
                  showingEnd={showingEnd}
                />
              )}
            </>
          )}
        </div>
      )}

      {showAddModal && (
        <AddPetModal
          userId={user.uid}
          userEmail={user.email}
          onClose={() => setShowAddModal(false)}
          onPetAdded={handlePetAdded}
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

