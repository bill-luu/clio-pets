import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "firebase.js";
import { PixelCat, PixelDog, PixelLizard } from "../utils/pixelArt";
import BackgroundMusic from "./BackgroundMusic";

import './styles/SplashScreen.css';

// Splash shows only the adult cat

const SplashScreen = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // "login" or "signup"
  const [clickedPet, setClickedPet] = useState(null);

  const handlePetClick = (id) => {
    setClickedPet(id);
    setTimeout(() => setClickedPet(null), 800); // heart disappears after 0.8s
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Signed up:", userCredential.user);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Signed in:", userCredential.user);
      }
    } catch (error) {
      console.error(error.code, error.message);
      alert(error.message);
    }
  };

  return (
    <div className="splash-container" style={{ backgroundImage: `url(${process.env.PUBLIC_URL + '/background.png'})` }}>
      <h1 className="title">Welcome to Clio Pets!</h1>

      <div className="pets-container">
        <div className="pet" onClick={() => handlePetClick(2)}>
          <div className="pet-art" style={{ width: 170, height: 170 }} role="img" aria-label="Cat" title="Cat">
            <PixelCat stage={3} />
            {clickedPet === 2 && <div className="heart">❤️</div>}
          </div>
          <div className="pet-name">Mittens</div>
        </div>
        <div className="pet" onClick={() => handlePetClick(1)}>
          <div className="pet-art" style={{ width: 170, height: 170 }} role="img" aria-label="Dog" title="Dog">
            <PixelDog stage={3} />
            {clickedPet === 1 && <div className="heart">❤️</div>}
          </div>
          <div className="pet-name">Muffy</div>
        </div>
        <div className="pet" onClick={() => handlePetClick(3)}>
          <div className="pet-art" style={{ width: 170, height: 170 }} role="img" aria-label="Lizard" title="Lizard">
            <PixelLizard stage={3} />
            {clickedPet === 3 && <div className="heart">❤️</div>}
          </div>
          <div className="pet-name">Nardo</div>
        </div>
      </div>

      <div className="auth-form">
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{mode === "signup" ? "Sign Up" : "Login"}</button>
        </form>
        <p onClick={() => setMode(mode === "signup" ? "login" : "signup")}>
          {mode === "signup" ? "Already have an account? Login" : "New user? Sign Up"}
        </p>
      </div>

      {/* Background Music Controls */}
      <BackgroundMusic />
    </div>
  );
};

export default SplashScreen;
