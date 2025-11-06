import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "firebase.js";

import SplashScreen from "components/SplashScreen";
import Home from "components/Home";
import SharedPetView from "components/SharedPetView";
import Community from "components/Community";
import Leaderboard from "components/Leaderboard";
import TestPage from "components/TestPage";
import BackgroundMusic from "components/BackgroundMusic";
import PetDetailsPage from "components/PetDetailsPage";
import TutorialPage from "components/TutorialPage";
import PrintablePetQR from "components/PrintablePetQR";

import {
  NotificationProvider,
  useNotifications,
} from "contexts/NotificationContext";
import NotificationToast from "components/NotificationToast";
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

  // Always render Router to make shared pet route accessible
  return (
    <Router>
      <NotificationProvider user={user}>
        <Routes>
          {/* Public route for shared pets - no authentication required */}
          <Route path="/shared-pet/:shareableId" element={<SharedPetView />} />

          {/* Protected routes - require authentication */}
          <Route
            path="/*"
            element={
              user ? (
                <AuthenticatedApp user={user} handleLogout={handleLogout} />
              ) : (
                <SplashScreen />
              )
            }
          />
        </Routes>
      </NotificationProvider>
    </Router>
  );
}

function AuthenticatedApp({ user, handleLogout }) {
  const { toasts, removeToast } = useNotifications();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-brand">
            <Link to="/" className="brand-link" onClick={closeMenu}>
              🐾 Clio Pets
            </Link>
          </div>

          <button
            className="hamburger-menu"
            onClick={toggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span
              className={`hamburger-line ${isMenuOpen ? "open" : ""}`}
            ></span>
            <span
              className={`hamburger-line ${isMenuOpen ? "open" : ""}`}
            ></span>
            <span
              className={`hamburger-line ${isMenuOpen ? "open" : ""}`}
            ></span>
          </button>

          <ul className={`navbar-menu ${isMenuOpen ? "open" : ""}`}>
            <li>
              <Link to="/" className="nav-link" onClick={closeMenu}>
                Home
              </Link>
            </li>
            <li>
              <Link to="/tutorial" className="nav-link" onClick={closeMenu}>
                Tutorial
              </Link>
            </li>
            <li>
              <Link to="/community" className="nav-link" onClick={closeMenu}>
                Community
              </Link>
            </li>
            <li>
              <Link to="/leaderboard" className="nav-link" onClick={closeMenu}>
                Leaderboard
              </Link>
            </li>
            {process.env.NODE_ENV === "development" && (
              <li>
                <Link
                  to="/test"
                  className="nav-link"
                  style={{ color: "#ffc107" }}
                  onClick={closeMenu}
                >
                  🧪 Test
                </Link>
              </li>
            )}
            <li className="mobile-only">
              <div className="mobile-user-info">
                <span className="user-email-mobile">{user.email}</span>
                <button
                  className="logout-btn-mobile"
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                >
                  Logout
                </button>
              </div>
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
          <Route path="/tutorial" element={<TutorialPage />} />
          <Route path="/community" element={<Community user={user} />} />
          <Route path="/leaderboard" element={<Leaderboard user={user} />} />
          <Route path="/pet/:petId" element={<PetDetailsPage user={user} />} />
          <Route path="/pet/:petId/print-qr" element={<PrintablePetQR />} />
          {process.env.NODE_ENV === "development" && (
            <Route path="/test" element={<TestPage />} />
          )}
          <Route path="/" element={<Home user={user} />} />
        </Routes>
      </main>

      {/* Notification Toast Container */}
      <div className="notification-toast-container">
        {toasts.map((notification) => (
          <NotificationToast
            key={notification.id}
            notification={notification}
            onDismiss={removeToast}
          />
        ))}
      </div>

      {/* Background Music Controls */}
      <BackgroundMusic />
    </div>
  );
}
