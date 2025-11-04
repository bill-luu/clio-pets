import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";
import { addPet } from "../services/petService";
import "./styles/TestPage.css";

export default function TestPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    species: "Dog",
    breed: "",
    color: "",
    notes: "",
    stage: 1,
    ageInMonths: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "stage" || name === "ageInMonths" ? parseInt(value) : value,
    }));
  };

  const getXPForStage = (stage) => {
    switch (stage) {
      case 1: // Baby
        return 50; // Mid-range of 0-199
      case 2: // Teen
        return 350; // Mid-range of 200-599
      case 3: // Adult
        return 650; // Well into adult range (600+)
      default:
        return 0;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Pet name is required");
      return;
    }

    try {
      setLoading(true);
      const user = auth.currentUser;

      if (!user) {
        setError("You must be logged in to create a test pet");
        return;
      }

      // Prepare pet data with auto-populated fields
      const petData = {
        name: formData.name.trim(),
        species: formData.species,
        breed: formData.breed.trim() || null,
        color: formData.color.trim() || null,
        notes: formData.notes.trim() || null,
        stage: formData.stage,
        ageInYears: formData.ageInMonths, // Note: field name is ageInYears but stores months
        // Auto-populated stats (healthy state)
        fullness: 75,
        happiness: 75,
        cleanliness: 75,
        energy: 75,
        xp: getXPForStage(formData.stage),
      };

      await addPet(user.uid, petData);
      navigate("/"); // Navigate back to home after creation
    } catch (err) {
      console.error("Error creating test pet:", err);
      setError("Failed to create test pet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="test-page">
      <div className="test-container">
        <div className="test-header">
          <h1>🧪 Test Pet Creator</h1>
          <p className="dev-only-badge">DEVELOPMENT ONLY</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="test-form">
          <div className="form-section">
            <h3>Basic Information</h3>

            <div className="form-group">
              <label htmlFor="name">Pet Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter pet name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="species">Species *</label>
              <select
                id="species"
                name="species"
                value={formData.species}
                onChange={handleInputChange}
                required
              >
                <option value="Dog">Dog</option>
                <option value="Cat">Cat</option>
                <option value="Bird">Bird</option>
                <option value="Bunny">Bunny</option>
                <option value="Lizard">Lizard</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="breed">Breed</label>
              <input
                type="text"
                id="breed"
                name="breed"
                value={formData.breed}
                onChange={handleInputChange}
                placeholder="Optional"
              />
            </div>

            <div className="form-group">
              <label htmlFor="color">Color</label>
              <input
                type="text"
                id="color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="Optional"
              />
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Optional notes"
                rows="3"
              />
            </div>
          </div>

          <div className="form-section">
            <h3>Progression Settings</h3>

            <div className="warning-box">
              <strong>⚠️ Typical Progression:</strong>
              <ul>
                <li>🍼 Baby: 0-6 months old (0-199 XP)</li>
                <li>🧒 Teen: 6-18 months old (200-599 XP)</li>
                <li>👨 Adult: 18+ months old (600+ XP)</li>
              </ul>
            </div>

            <div className="form-group">
              <label htmlFor="stage">Stage *</label>
              <select
                id="stage"
                name="stage"
                value={formData.stage}
                onChange={handleInputChange}
                required
              >
                <option value={1}>🍼 Baby</option>
                <option value={2}>🧒 Teen</option>
                <option value={3}>👨 Adult</option>
              </select>
              <small className="form-help">
                XP will be auto-set: Baby (50 XP), Teen (350 XP), Adult (650 XP)
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="ageInMonths">Age (months) *</label>
              <input
                type="number"
                id="ageInMonths"
                name="ageInMonths"
                value={formData.ageInMonths}
                onChange={handleInputChange}
                min="0"
                max="300"
                required
              />
              <small className="form-help">
                1 real-life day = 1 pet month
              </small>
            </div>
          </div>

          <div className="form-section auto-populated">
            <h3>Auto-Populated Fields</h3>
            <p className="form-help">
              These values will be set automatically:
            </p>
            <ul className="auto-list">
              <li><strong>Stats:</strong> All set to 75 (healthy state)</li>
              <li><strong>XP:</strong> {getXPForStage(formData.stage)} (based on stage)</li>
              <li><strong>Last Action:</strong> None (ready for first action)</li>
            </ul>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Test Pet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

