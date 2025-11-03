import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

import { auth } from "firebase.js";
import { PixelDog, PixelCat, PixelLizard } from "../utils/pixelArt";

import './styles/SplashScreen.css';

const PETS = [
  { id: 1, Component: PixelDog, label: "Dog", name: "Muffy" },
  { id: 2, Component: PixelCat, label: "Cat", name: "Mittens" },
  { id: 3, Component: PixelLizard, label: "Lizard", name: "Nardo" },
];

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
    <div className="splash-container">
      <h1 className="title">Welcome to Clio Pets!</h1>

      <div className="pets-container">
        {PETS.map(({ id, Component, label, name }) => (
          <div key={id} className="pet" onClick={() => handlePetClick(id)}>
            <div className="pet-art" role="img" aria-label={label} title={label}>
              <Component />
              {clickedPet === id && <div className="heart">❤️</div>}
            </div>
            <div className="pet-name">{name}</div>
          </div>
        ))}
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
    </div>
  );
};

export default SplashScreen;
