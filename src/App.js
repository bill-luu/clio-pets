import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { auth } from "firebase.js";

import SplashScreen from "components/SplashScreen";
import Home from "components/Home";
import SharedPetView from "components/SharedPetView";
import OtherPets from "components/OtherPets";
import Leaderboard from "components/Leaderboard";
import TestPage from "components/TestPage";

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

  return (
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
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="nav-link">
                About
              </Link>
            </li>
            <li>
              <Link to="/other-pets" className="nav-link">
                Other Clio-Pets
              </Link>
            </li>
            <li>
              <Link to="/leaderboard" className="nav-link">
                Leaderboard
              </Link>
            </li>
            {process.env.NODE_ENV === "development" && (
              <li>
                <Link
                  to="/test"
                  className="nav-link"
                  style={{ color: "#ffc107" }}
                >
                  🧪 Test
                </Link>
              </li>
            )}
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
          <Route path="/other-pets" element={<OtherPets user={user} />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
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
    </div>
  );
}

function About() {
  return <h2>About</h2>;
}
