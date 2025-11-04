import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
} from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "firebase.js";

import SplashScreen from "components/SplashScreen";
import Home from "components/Home";
import OtherPets from "components/OtherPets";
import "./App.css";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return <div>Loading...</div>;
  }

  // If not logged in, show splash screen
  if (!user) {
    return <SplashScreen />;
  }

  // If logged in, show the main app
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <div className="navbar-content">
            <div className="navbar-brand">
              <Link to="/" className="brand-link">
                🐾 Clio Pets
              </Link>
            </div>
            <ul className="navbar-menu">
              <li>
                <Link to="/" className="nav-link">Home</Link>
              </li>
              <li>
                <Link to="/about" className="nav-link">About</Link>
              </li>
              <li>
                <Link to="/users" className="nav-link">Other Clio-Pets</Link>
              </li>
            </ul>
            <div className="navbar-actions">
              <span className="user-email">{user.email}</span>
              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/about" element={<About />} />
            <Route path="/users" element={<OtherPets user={user} />} />
            <Route path="/" element={<Home user={user} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

function About() {
  return <h2>About</h2>;
}
