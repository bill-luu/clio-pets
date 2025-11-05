import React, { useState, useEffect, useRef } from "react";
import { addPet } from "../services/petService";
import { PET_SPECIES, getPetPixelArt } from "../utils/pixelArt";
import CustomSelect from "./CustomSelect";
import "./styles/AddPetModal.css";

const COLOR_OPTIONS = [
  { value: "brown", label: "Brown" },
  { value: "yellow", label: "Yellow" },
  { value: "green", label: "Green" },
  { value: "purple", label: "Purple" },
  { value: "white", label: "White" },
  { value: "orange", label: "Orange" },
];

export default function AddPetModal({ userId, userEmail, onClose, onPetAdded }) {
  const [formData, setFormData] = useState({
    name: "",
    species: "",
    breed: "",
    color: "brown",
    notes: "",
    stage: 1, // Default to baby stage
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userChangedColor, setUserChangedColor] = useState(false);
  const prevSpeciesRef = useRef(formData.species);

  // Ensure Bird never uses brown; coerce to yellow if selected
  useEffect(() => {
    if (formData.species === "Bird" && formData.color === "brown") {
      setFormData((prev) => ({ ...prev, color: "yellow" }));
    }
  }, [formData.species, formData.color]);

  // Default colors on species change without overriding user's explicit choice
  useEffect(() => {
    const prev = prevSpeciesRef.current;
    // If switching to Bird and color hasn't been explicitly chosen, default to yellow from brown
    if (
      formData.species === "Bird" &&
      prev !== "Bird" &&
      !userChangedColor &&
      formData.color === "brown"
    ) {
      setFormData((prevState) => ({ ...prevState, color: "yellow" }));
    }

    // If switching from Bird (default yellow) to Dog, and user hasn't explicitly chosen color, default to brown
    if (
      formData.species === "Dog" &&
      prev === "Bird" &&
      !userChangedColor &&
      formData.color === "yellow"
    ) {
      setFormData((prevState) => ({ ...prevState, color: "brown" }));
    }

    prevSpeciesRef.current = formData.species;
  }, [formData.species, formData.color, userChangedColor]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "color") {
      setUserChangedColor(true);
    }
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
          // Keep stage as a number
          if (key === 'stage') {
            petData[key] = parseInt(formData[key], 10);
          } else {
            petData[key] = formData[key].toString().trim();
          }
        }
      });

      await addPet(userId, petData, userEmail);
      onPetAdded();
    } catch (err) {
      console.error("Error adding pet:", err);
      setError("Failed to add pet. Please try again.");
      setLoading(false);
    }
  };

  const PixelArtComponent = formData.species ? getPetPixelArt(formData.species) : null;
  const colorOptions = formData.species === "Bird"
    ? COLOR_OPTIONS.filter((opt) => opt.value !== "brown")
    : COLOR_OPTIONS;

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
              <PixelArtComponent stage={formData.stage} color={formData.color} />
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
            <CustomSelect
              id="species"
              name="species"
              value={formData.species}
              onChange={handleChange}
              options={PET_SPECIES}
              placeholder="Select a species..."
              required
              disabled={loading}
            />
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
            <label htmlFor="color">Color</label>
            <CustomSelect
              id="color"
              name="color"
              value={formData.color}
              onChange={handleChange}
            options={colorOptions}
              placeholder="Select a color..."
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

