import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

// Component Imports
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Page Imports
import ListingsIndex from './pages/ListingsIndex';
import ListingDetail from './pages/ListingDetail';
import CreateListing from './pages/CreateListing';
import EditListing from './pages/EditListing';
import BookListing from './pages/BookListing';
import MyBookings from './pages/MyBookings';
import Login from './pages/Login';
import Signup from './pages/Signup';

// Setup API endpoint constant
const API_URL = 'http://localhost:8080';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if a session already exists on page mount
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const res = await axios.get(`${API_URL}/current-user`, { withCredentials: true });
        if (res.data && res.data.user) {
          setCurrentUser(res.data.user);
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setLoading(false);
      }
    };
    checkUserSession();
  }, []);

  // Handle Logout
  const handleLogout = async () => {
    try {
      const res = await axios.get(`${API_URL}/logout`, { withCredentials: true });
      alert(res.data.message || 'Logged out successfully!');
      setCurrentUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      alert('Failed to log out. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: 'Inter, sans-serif',
        color: 'var(--text-muted)'
      }}>
        <h2>Wanderlust</h2>
        <p style={{ marginTop: '8px' }}>Initializing explore state...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        {/* Navigation Bar */}
        <Navbar currentUser={currentUser} onLogout={handleLogout} />

        {/* Main Content Area */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ListingsIndex />} />
            <Route path="/listings/:id" element={<ListingDetail currentUser={currentUser} />} />
            
            {/* Protected Routes */}
            <Route 
              path="/listings/new" 
              element={currentUser ? <CreateListing /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/listings/:id/edit" 
              element={currentUser ? <EditListing /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/listings/:id/book" 
              element={currentUser ? <BookListing /> : <Navigate to="/login" replace />} 
            />
            <Route 
              path="/bookings" 
              element={currentUser ? <MyBookings /> : <Navigate to="/login" replace />} 
            />

            {/* Auth Routes */}
            <Route 
              path="/login" 
              element={!currentUser ? <Login onLoginSuccess={setCurrentUser} /> : <Navigate to="/" replace />} 
            />
            <Route 
              path="/signup" 
              element={!currentUser ? <Signup onSignupSuccess={setCurrentUser} /> : <Navigate to="/" replace />} 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}
