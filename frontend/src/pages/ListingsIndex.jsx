import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { 
  FaFire, FaBed, FaCity, FaFortAwesome, 
  FaCampground, FaSwimmer, FaTractor, 
  FaSnowflake, FaShip, FaHeart, FaChevronRight 
} from 'react-icons/fa';

// Setup API endpoint constant
const API_URL = import.meta.env.VITE_API_URL;

const CATEGORIES = [
  { id: 'all', label: 'All', icon: FaCompass => <FaFire /> },
  { id: 'trending', label: 'Trending', icon: FaFire },
  { id: 'rooms', label: 'Rooms', icon: FaBed },
  { id: 'cities', label: 'Iconic Cities', icon: FaCity },
  { id: 'castles', label: 'Castles', icon: FaFortAwesome },
  { id: 'camping', label: 'Camping', icon: FaCampground },
  { id: 'pools', label: 'Amazing Pools', icon: FaSwimmer },
  { id: 'farms', label: 'Farms', icon: FaTractor },
  { id: 'arctic', label: 'Arctic', icon: FaSnowflake },
  { id: 'boats', label: 'Boats', icon: FaShip }
];

export default function ListingsIndex() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showTaxes, setShowTaxes] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/listings`);
        setListings(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError('Failed to fetch listings. Please make sure the backend server is running on port 8080.');
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  // Filter listings by search query and selected category
  const filteredListings = listings.filter(listing => {
    // 1. Search Query filter (matches title, location, or country)
    const matchesSearch = searchQuery.trim() === '' || 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.country.toLowerCase().includes(searchQuery.toLowerCase());

    // 2. Category tag filter (Simulated locally or fallback to all)
    // In Apnacollage, category filtering is simulated. We will do local category assignment 
    // for a gorgeous premium feel: assign listings categories based on their titles or prices!
    if (selectedCategory === 'all') return matchesSearch;
    
    // Intelligent category assignment based on keywords or a 9-category modulo fallback
    let category = 'trending';
    const titleLower = listing.title.toLowerCase();
    const descLower = (listing.description || '').toLowerCase();
    
    if (titleLower.includes('boat') || titleLower.includes('yacht') || titleLower.includes('ship') || titleLower.includes('cruise') || titleLower.includes('lake')) {
      category = 'boats';
    } else if (titleLower.includes('pool') || titleLower.includes('villa') || titleLower.includes('beach') || descLower.includes('pool')) {
      category = 'pools';
    } else if (titleLower.includes('castle') || titleLower.includes('palace') || titleLower.includes('fort') || titleLower.includes('manor')) {
      category = 'castles';
    } else if (titleLower.includes('camp') || titleLower.includes('tent') || titleLower.includes('forest') || titleLower.includes('cabin') || titleLower.includes('treehouse')) {
      category = 'camping';
    } else if (titleLower.includes('farm') || titleLower.includes('cottage') || titleLower.includes('rural') || titleLower.includes('barn')) {
      category = 'farms';
    } else if (titleLower.includes('arctic') || titleLower.includes('snow') || titleLower.includes('winter') || titleLower.includes('ice') || titleLower.includes('mountain')) {
      category = 'arctic';
    } else if (titleLower.includes('room') || titleLower.includes('apartment') || titleLower.includes('studio') || titleLower.includes('loft')) {
      category = 'rooms';
    } else if (titleLower.includes('city') || titleLower.includes('downtown') || titleLower.includes('town') || titleLower.includes('penthouse')) {
      category = 'cities';
    } else {
      // Balanced 9-way modulo fallback so both "trending" and "boats" are fully populated!
      const idNum = parseInt(listing._id.toString().slice(-4), 16) || 0;
      const mod = idNum % 9;
      if (mod === 0) category = 'trending';
      else if (mod === 1) category = 'rooms';
      else if (mod === 2) category = 'cities';
      else if (mod === 3) category = 'castles';
      else if (mod === 4) category = 'camping';
      else if (mod === 5) category = 'pools';
      else if (mod === 6) category = 'farms';
      else if (mod === 7) category = 'arctic';
      else if (mod === 8) category = 'boats';
    }

    return matchesSearch && category === selectedCategory;
  });

  return (
    <div>
      {/* Category filters bar */}
      <div className="filter-bar">
        <div className="categories-container">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <div 
                key={cat.id} 
                className={`category-item ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                <Icon className="category-icon" />
                <span>{cat.label}</span>
              </div>
            );
          })}
        </div>

        {/* Tax Toggle */}
        <div className="tax-toggle-box" onClick={() => setShowTaxes(!showTaxes)}>
          <span>Display total before taxes</span>
          <label className="switch" onClick={(e) => e.stopPropagation()}>
            <input 
              type="checkbox" 
              checked={showTaxes}
              onChange={() => setShowTaxes(!showTaxes)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          <div className="avatar" style={{ margin: '0 auto 16px', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}>Explore</div>
          <p>Loading wanderlust destinations...</p>
        </div>
      )}

      {error && (
        <div className="alert alert-danger" style={{ textAlign: 'center', padding: '24px' }}>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && filteredListings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '16px' }}>
          <h2 style={{ marginBottom: '8px' }}>No properties found</h2>
          <p>Try resetting your filters or adjusting your search parameters.</p>
          <button 
            className="btn btn-secondary" 
            style={{ marginTop: '16px', marginInline: 'auto' }}
            onClick={() => { setSelectedCategory('all'); navigate('/'); }}
          >
            Clear all filters
          </button>
        </div>
      )}

      {!loading && !error && filteredListings.length > 0 && (
        <div className="listings-grid">
          {filteredListings.map(listing => {
            const price = listing.price || 0;
            const tax = price * 0.18;
            const totalPrice = price + tax;

            return (
              <div 
                key={listing._id} 
                className="listing-card"
                onClick={() => navigate(`/listings/${listing._id}`)}
              >
                <div className="listing-image-container">
                  <img 
                    src={listing.image?.url || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=cover&w=800&q=80'} 
                    alt={listing.title} 
                    className="listing-card-image"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=cover&w=800&q=80';
                    }}
                  />
                  <div className="listing-heart-btn" onClick={(e) => { e.stopPropagation(); alert('Added to favorites!'); }}>
                    <FaHeart />
                  </div>
                </div>
                <div className="listing-card-info">
                  <h3 className="listing-card-title">{listing.title}</h3>
                  <p className="listing-card-location">{listing.location}, {listing.country}</p>
                  <p className="listing-card-price">
                    {showTaxes ? (
                      <>
                        &#8377; {totalPrice.toLocaleString('en-IN')}{' '}
                        <span className="listing-card-tax">incl. 18% GST</span>
                      </>
                    ) : (
                      <>
                        &#8377; {price.toLocaleString('en-IN')}{' '}
                        <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-muted)' }}>/ night</span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
