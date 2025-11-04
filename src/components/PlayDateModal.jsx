import React from "react";
import { getPetPixelArt } from "../utils/pixelArt";
import "./styles/PlayDateModal.css";

export default function PlayDateModal({ playDateResult, onClose }) {
  const { activity, userPet, otherPet } = playDateResult;

  const UserPetPixelArt = getPetPixelArt(userPet.species);
  const OtherPetPixelArt = getPetPixelArt(otherPet.species);

  const getStatChange = (oldStat, newStat) => {
    const change = newStat - oldStat;
    if (change === 0) return null;
    return {
      value: change,
      positive: change > 0,
      text: `${change > 0 ? "+" : ""}${change}`,
    };
  };

  const renderStatChanges = (pet) => {
    const stats = [
      { name: "Fullness", icon: "🍖", key: "fullness" },
      { name: "Happiness", icon: "😊", key: "happiness" },
      { name: "Cleanliness", icon: "✨", key: "cleanliness" },
      { name: "Energy", icon: "⚡", key: "energy" },
      { name: "XP", icon: "⭐", key: "xp" },
    ];

    const changes = stats
      .map((stat) => ({
        ...stat,
        change: getStatChange(pet.oldStats[stat.key], pet.newStats[stat.key]),
      }))
      .filter((stat) => stat.change !== null);

    if (changes.length === 0) return null;

    return (
      <div className="playdate-stat-changes">
        {changes.map((stat) => (
          <div
            key={stat.key}
            className={`stat-change ${stat.change.positive ? "positive" : "negative"}`}
          >
            <span className="stat-icon">{stat.icon}</span>
            <span className="stat-name">{stat.name}</span>
            <span className="stat-value">{stat.change.text}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="modal-overlay playdate-overlay" onClick={onClose}>
      <div
        className="modal-content playdate-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header playdate-header">
          <h2>Play Date Success!</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="playdate-body">
          {/* Activity Information */}
          <div className="playdate-activity">
            <div className="activity-emoji">{activity.emoji}</div>
            <h3 className="activity-name">{activity.name}</h3>
            <p className="activity-description">{activity.description}</p>
          </div>

          {/* Both Pets Display */}
          <div className="playdate-pets">
            {/* User's Pet */}
            <div className="playdate-pet">
              <div className="pet-header">
                <h4>{userPet.name}</h4>
                <span className="pet-species">{userPet.species}</span>
              </div>
              {UserPetPixelArt && (
                <div className="pet-pixel-art">
                  <UserPetPixelArt stage={userPet.stage || 1} />
                </div>
              )}
              {renderStatChanges(userPet)}
            </div>

            {/* Heart Divider */}
            <div className="playdate-divider">
              <span className="heart-icon">💕</span>
            </div>

            {/* Other Pet */}
            <div className="playdate-pet">
              <div className="pet-header">
                <h4>{otherPet.name}</h4>
                <span className="pet-species">{otherPet.species}</span>
              </div>
              {OtherPetPixelArt && (
                <div className="pet-pixel-art">
                  <OtherPetPixelArt stage={otherPet.stage || 1} />
                </div>
              )}
              {renderStatChanges(otherPet)}
            </div>
          </div>

          {/* Summary */}
          <div className="playdate-summary">
            <p>
              Both pets had a great time and gained experience from their adventure
              together!
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Awesome!
          </button>
        </div>
      </div>
    </div>
  );
}

