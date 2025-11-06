import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { subscribeToPetById } from "../services/petService";
import { getPetPixelArt } from "../utils/pixelArt";
import { formatAgeDisplay } from "../utils/petAge";
import "./styles/PrintablePetQR.css";

// Poster style configurations
const POSTER_STYLES = {
  hello: {
    id: 'hello',
    name: 'Hello',
    title: 'SAY HELLO!',
    subtitle: 'Come meet me!',
    qrLabel: 'Scan to say hi',
    footer: '💝 Spread the love 💝',
    subfooter: '✨ Making friends one scan at a time ✨'
  },
  wanted: {
    id: 'wanted',
    name: 'Wanted',
    title: 'WANTED',
    subtitle: 'For Love & Treats!',
    qrLabel: 'Scan to Interact',
    footer: 'REWARD: Happiness & Joy',
    subfooter: '⚠️ May cause excessive cuteness ⚠️'
  },
  missing: {
    id: 'missing',
    name: 'Missing',
    title: 'HAVE YOU SEEN ME?',
    subtitle: 'Last seen looking adorable',
    qrLabel: 'Scan for updates',
    footer: '🔍 Help us connect! 🔍',
    subfooter: '📱 Scan the QR code to interact'
  }
};

export default function PrintablePetQR() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posterStyle, setPosterStyle] = useState('hello');

  useEffect(() => {
    if (!petId) {
      setError("No pet ID provided");
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToPetById(petId, (petData, err) => {
      if (err) {
        console.error("Error loading pet:", err);
        setError(err.message || "Failed to load pet data");
        setLoading(false);
        return;
      }
      
      if (!petData) {
        setError("Pet not found");
        setLoading(false);
        return;
      }

      // Check if sharing is enabled
      if (!petData.sharingEnabled) {
        setError("Sharing is not enabled for this pet");
        setLoading(false);
        return;
      }

      setPet(petData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [petId]);

  const handlePrint = () => {
    window.print();
  };

  const handleBack = () => {
    navigate(`/pet/${petId}`);
  };

  if (loading) {
    return (
      <div className="printable-loading">
        <p>Loading pet information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="printable-error">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className="btn btn-secondary">
          Go Back
        </button>
      </div>
    );
  }

  if (!pet) {
    return null;
  }

  const PixelArtComponent = getPetPixelArt(pet.species);
  const shareUrl = `${window.location.origin}/shared-pet/${pet.shareableId}`;
  const ageDisplay = formatAgeDisplay(pet.ageInYears || 0);
  const currentStyle = POSTER_STYLES[posterStyle];

  return (
    <div className="printable-page">
      {/* Action buttons - hidden during print */}
      <div className="print-actions no-print">
        <button onClick={handleBack} className="btn btn-secondary">
          ← Back to Pet
        </button>
        
        <div className="style-selector">
          <label htmlFor="poster-style">Poster Style:</label>
          <select 
            id="poster-style"
            value={posterStyle} 
            onChange={(e) => setPosterStyle(e.target.value)}
            className="style-select"
          >
            {Object.values(POSTER_STYLES).map(style => (
              <option key={style.id} value={style.id}>
                {style.name}
              </option>
            ))}
          </select>
        </div>
        
        <button onClick={handlePrint} className="btn btn-primary">
          🖨️ Print
        </button>
      </div>

      {/* Poster */}
      <div className={`poster poster-style-${posterStyle}`}>
        <div className="poster-border">
          <div className="poster-header">
            <h1 className="poster-title">{currentStyle.title}</h1>
            <div className="poster-subtitle">{currentStyle.subtitle}</div>
          </div>

          {/* Pet Graphic */}
          <div className="poster-image-section">
            {PixelArtComponent && (
              <div className="poster-pixel-art">
                <PixelArtComponent 
                  stage={pet.stage || 1} 
                  color={pet.color}
                  size={150}
                />
              </div>
            )}
          </div>

          {/* Pet Info */}
          <div className="poster-info">
            <div className="poster-name">{pet.name}</div>
            
            <div className="poster-details">
              <div className="detail-row">
                <span className="detail-label">Species:</span>
                <span className="detail-value">{pet.species}</span>
              </div>
              
              {pet.breed && (
                <div className="detail-row">
                  <span className="detail-label">Breed:</span>
                  <span className="detail-value">{pet.breed}</span>
                </div>
              )}
              
              <div className="detail-row">
                <span className="detail-label">Age:</span>
                <span className="detail-value">{ageDisplay}</span>
              </div>
            </div>
          </div>

          {/* QR Code Section */}
          <div className="poster-qr-section">
            <div className="qr-label">{currentStyle.qrLabel}</div>
            <div className="poster-qr-code">
              <QRCodeSVG
                value={shareUrl}
                size={140}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="poster-footer">
            <div className="poster-reward">
              {currentStyle.footer}
            </div>
            <div className="poster-warning">
              {currentStyle.subfooter}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

