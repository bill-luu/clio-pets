// SplashScreen.jsx
import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import './SplashScreen.css';

const SplashScreen = () => {
  const auth = getAuth();

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
        {[1, 2, 3].map((pet) => (
          <div
            key={pet}
            className="pet"
            onClick={() => handlePetClick(pet)}
          >
            {/* Placeholder pixel-art pets */}
            <div className={`pixel-pet pet-${pet}`} />
            {clickedPet === pet && <div className="heart">❤️</div>}
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
