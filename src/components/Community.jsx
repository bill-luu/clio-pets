import React, { useState, useEffect } from "react";
import { subscribeToAllPets } from "../services/petService";
import { getPetPixelArt } from "../utils/pixelArt";
import { getStageLabelWithEmoji, getStageInfo } from "../utils/petStages";
import OtherPetDetailsModal from "./OtherPetDetailsModal";
import Pagination from "./Pagination";
import "./styles/Home.css";

export default function Community({ user }) {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPet, setSelectedPet] = useState(null);
  
  // Filter states
  const [filterSpecies, setFilterSpecies] = useState("all");
  const [filterStage, setFilterStage] = useState("all");
  const [filterOwner, setFilterOwner] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Show 9 pets per page (3x3 grid)

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Subscribe to real-time updates for all pets
    const unsubscribe = subscribeToAllPets((allPets, err) => {
      if (err) {
        console.error("Error loading pets:", err);
        setError("Failed to load pets. Please try again.");
        setLoading(false);
        return;
      }
      // Filter out the current user's pets
      const otherUsersPets = allPets.filter((pet) => pet.userId !== user.uid);
      setPets(otherUsersPets);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [user.uid]);

  // Get unique owners for filter dropdown
  const uniqueOwners = [...new Set(pets.map(pet => pet.ownerEmail).filter(Boolean))].sort();

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

    // Filter by owner
    if (filterOwner !== "all" && pet.ownerEmail !== filterOwner) {
      return false;
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
  }, [filterSpecies, filterStage, filterOwner]);

  // Reset filters
  const resetFilters = () => {
    setFilterSpecies("all");
    setFilterStage("all");
    setFilterOwner("all");
  };

  // Check if any filters are active
  const hasActiveFilters = filterSpecies !== "all" || filterStage !== "all" || filterOwner !== "all";

  if (loading) {
    return (
      <div className="home-container">
        <div className="loading">Loading community...</div>
      </div>
    );
  }

  return (
    <div className="home-container">
      <div className="home-header">
        <h2>Community</h2>
        <p className="welcome-text">Explore pets from the Clio community!</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {pets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-content">
            <h3>No pets in the community yet!</h3>
            <p>Be the first to add a pet to the community.</p>
          </div>
        </div>
      ) : (
        <div className="pets-section">
          <div className="action-buttons">
            <div></div>
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
                <label htmlFor="filter-owner">Owner:</label>
                <select
                  id="filter-owner"
                  value={filterOwner}
                  onChange={(e) => setFilterOwner(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Owners</option>
                  {uniqueOwners.map((owner) => (
                    <option key={owner} value={owner}>
                      {owner}
                    </option>
                  ))}
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
                return (
                <div
                  key={pet.id}
                  className="pet-card clickable-pet-card"
                  onClick={() => setSelectedPet(pet)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="pet-card-header">
                    <h3>{pet.name}</h3>
                    {pet.sharingEnabled && (
                      <span className="sharing-badge" title="Interactions enabled">
                        🤝
                      </span>
                    )}
                  </div>
                  <div className="pet-stage-badge" style={{ backgroundColor: stageInfo.color }}>
                    {getStageLabelWithEmoji(pet.stage)}
                  </div>
                  {PixelArtComponent && (
                    <div className="pet-card-pixel-art">
                      <PixelArtComponent stage={pet.stage || 1} color={pet.color} />
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

      {selectedPet && (
        <OtherPetDetailsModal
          pet={selectedPet}
          user={user}
          onClose={() => setSelectedPet(null)}
        />
      )}
    </div>
  );
}

