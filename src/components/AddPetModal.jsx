import React, { useState } from "react";
import { addPet } from "../services/petService";
import { PET_SPECIES, getPetPixelArt } from "../utils/pixelArt";
import "./styles/AddPetModal.css";

export default function AddPetModal({ userId, onClose, onPetAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    age: "",
    color: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError("Pet name is required");
      return;
    }

    if (!formData.species) {
      setError("Please select a species");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Only include non-empty fields
      const petData = {};
      Object.keys(formData).forEach((key) => {
        if (formData[key] && formData[key].toString().trim()) {
          petData[key] = formData[key].toString().trim();
        }
      });

      await addPet(userId, petData);
      onPetAdded();
    } catch (err) {
      console.error("Error adding pet:", err);
      setError("Failed to add pet. Please try again.");
      setLoading(false);
    }
  };

  const PixelArtComponent = formData.species ? getPetPixelArt(formData.species) : null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add New Pet</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">{error}</div>}

          {PixelArtComponent && (
            <div className="pixel-art-preview">
              <PixelArtComponent />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="name">
              Pet Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Fluffy"
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="species">
              Species <span className="required">*</span>
            </label>
            <select
              id="species"
              name="species"
              value={formData.species}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Select a species...</option>
              {PET_SPECIES.map((pet) => (
                <option key={pet.value} value={pet.value}>
                  {pet.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="breed">Breed</label>
            <input
              type="text"
              id="breed"
              name="breed"
              value={formData.breed}
              onChange={handleChange}
              placeholder="e.g., Golden Retriever"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="age">Age</label>
            <input
              type="text"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              placeholder="e.g., 3 years, 6 months"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="color">Color</label>
            <input
              type="text"
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
              placeholder="e.g., Brown and white"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information about your pet..."
              rows="4"
              disabled={loading}
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Pet"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

