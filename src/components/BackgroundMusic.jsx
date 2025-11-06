import React, { useState, useEffect, useRef } from "react";
import "./styles/BackgroundMusic.css";

export default function BackgroundMusic() {
  // Load saved preferences from localStorage
  const [isPlaying, setIsPlaying] = useState(() => {
    const savedIsPlaying = localStorage.getItem('backgroundMusicIsPlaying');
    return savedIsPlaying === 'true';
  });
  
  const [volume, setVolume] = useState(() => {
    const savedVolume = localStorage.getItem('backgroundMusicVolume');
    return savedVolume !== null ? parseFloat(savedVolume) : 0.3;
  });
  
  const audioRef = useRef(null);

  // Initialize audio element and restore playing state
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.loop = true;
      
      // If music was playing before, resume it
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.log("Audio play failed:", error);
          // If autoplay fails (browser restriction), update state
          setIsPlaying(false);
        });
      }
    }
  }, []); // Only run once on mount

  // Save isPlaying to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('backgroundMusicIsPlaying', isPlaying.toString());
  }, [isPlaying]);

  // Save volume to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('backgroundMusicVolume', volume.toString());
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // Play and handle the promise to avoid console warnings
        audioRef.current.play().catch(error => {
          console.log("Audio play failed:", error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  return (
    <div className="background-music-control">
      <audio 
        ref={audioRef} 
        src={process.env.PUBLIC_URL + "/background-music.mp3"}
        preload="auto"
      />
      
      <button 
        className={`nes-btn is-primary music-btn ${isPlaying ? 'playing' : ''}`}
        onClick={togglePlay}
        title={isPlaying ? "Pause Music" : "Play Music"}
      >
        <span className="music-icon">♪</span>
      </button>
      
      <div className="volume-control">
        <progress 
          className="nes-progress is-primary" 
          value={volume * 100} 
          max="100"
        />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="volume-slider-hidden"
          title="Volume"
        />
      </div>
    </div>
  );
}

