import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaCompass, FaBars, FaUserCircle, FaSun, FaMoon, FaSearch } from 'react-icons/fa';

export default function Navbar({ currentUser, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = (e) => {
    e.stopPropagation();
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand/Logo */}
        <div className="navbar-brand" onClick={() => { setSearchQuery(''); navigate('/'); }}>
          <FaCompass />
          <span>Wanderlust</span>
        </div>

        {/* Search Bar */}
        <form className="search-bar" onSubmit={handleSearchSubmit}>
          <input 
            type="text" 
            placeholder="Search destinations..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="search-icon-btn">
            <FaSearch size={12} />
          </button>
        </form>

        {/* Navigation Menu */}
        <div className="navbar-menu">
          <span 
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            onClick={() => navigate('/')}
          >
            Explore
          </span>
          {currentUser && (
            <span 
              className={`nav-link ${location.pathname === '/listings/new' ? 'active' : ''}`}
              onClick={() => navigate('/listings/new')}
            >
              Airbnb your home
            </span>
          )}

          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme} 
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-main)',
              fontSize: '18px',
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              borderRadius: '50%',
              transition: 'var(--transition)'
            }}
            title="Toggle Theme"
          >
            {theme === 'light' ? <FaMoon /> : <FaSun style={{ color: '#ffb400' }} />}
          </button>

          {/* User Profile Menu with Dropdown */}
          <div 
            className="user-profile-menu" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 200)}
            tabIndex={0}
          >
            <FaBars className="menu-icon" />
            <div className={`avatar ${currentUser ? 'logged-in' : ''}`}>
              {currentUser ? currentUser.username[0].toUpperCase() : <FaUserCircle size={22} />}
            </div>

            {dropdownOpen && (
              <div className="dropdown-menu">
                {currentUser ? (
                  <>
                    <div className="dropdown-item" style={{ fontWeight: '600', borderBottom: '1px solid var(--border)' }}>
                      Hi, {currentUser.username}!
                    </div>
                    <div className="dropdown-item" onClick={() => navigate('/listings/new')}>
                      Create Listing
                    </div>
                    <div className="dropdown-item" onClick={() => navigate('/bookings')}>
                      My Bookings
                    </div>
                    <div className="dropdown-item" onClick={() => navigate('/')}>
                      Manage Listings
                    </div>
                    <div className="dropdown-divider" />
                    <div className="dropdown-item" onClick={onLogout} style={{ color: 'var(--primary)', fontWeight: '600' }}>
                      Log Out
                    </div>
                  </>
                ) : (
                  <>
                    <div className="dropdown-item" onClick={() => navigate('/login')} style={{ fontWeight: '600' }}>
                      Log In
                    </div>
                    <div className="dropdown-item" onClick={() => navigate('/signup')}>
                      Sign Up
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
