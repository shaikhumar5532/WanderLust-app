import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import mapboxgl from 'mapbox-gl';
import { FaTrash, FaStar, FaEdit, FaMapMarkerAlt, FaUser } from 'react-icons/fa';

// Setup API endpoint constant
const API_URL = import.meta.env.VITE_API_URL;

export default function ListingDetail({ currentUser }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  // Fetch listing details
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        // Include credentials for session compatibility
        const res = await axios.get(`${API_URL}/listings/${id}`, { withCredentials: true });
        setListing(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching listing details:', err);
        setError(err.response?.data?.error || 'Failed to load listing details.');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  // Mapbox load
  useEffect(() => {
    if (!listing || !listing.geometry || !listing.geometry.coordinates) return;

    // Dynamically inject Mapbox CSS
    const cssId = 'mapbox-gl-css';
    if (!document.getElementById(cssId)) {
      const link = document.createElement('link');
      link.id = cssId;
      link.href = 'https://api.mapbox.com/mapbox-gl-js/v2.15.0/mapbox-gl.css';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }

    // Set Access Token
    // We try to read MAP_TOKEN. Since it's on client, we can fallback to standard public token if none provided in env,
    // or let it read from system. Let's use standard default mapbox public token as fallback so it always renders beautifully!
    const token = listing.mapToken || import.meta.env.VITE_MAPBOX_TOKEN || "";
    mapboxgl.accessToken = token;

    const coords = listing.geometry.coordinates; // [lng, lat]
    
    try {
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: coords,
        zoom: 9
      });

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add custom marker
      new mapboxgl.Marker({ color: '#fe424d' })
        .setLngLat(coords)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            `<h4>${listing.title}</h4><p>Exact location provided after booking.</p>`
          )
        )
        .addTo(map);

      return () => map.remove();
    } catch (err) {
      console.error('Mapbox initialization error:', err);
    }
  }, [listing]);

  // Handle delete listing
  const handleDeleteListing = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;

    try {
      await axios.delete(`${API_URL}/listings/${id}`, { withCredentials: true });
      alert('Listing deleted successfully!');
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete listing.');
    }
  };

  // Handle submit review
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setReviewError('Please write a comment.');
      return;
    }

    try {
      setReviewSubmitLoading(true);
      setReviewError(null);
      
      const res = await axios.post(
        `${API_URL}/listings/${id}/reviews`, 
        { review: { rating, comment } }, 
        { withCredentials: true }
      );

      // Append new review with populated user to the listing state locally
      setListing(prev => ({
        ...prev,
        reviews: [...prev.reviews, res.data.review]
      }));

      // Reset form
      setComment('');
      setRating(5);
      alert('Review posted!');
    } catch (err) {
      console.error('Error posting review:', err);
      setReviewError(err.response?.data?.error || 'Failed to post review. Make sure you are logged in.');
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  // Handle delete review
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;

    try {
      await axios.delete(`${API_URL}/listings/${id}/reviews/${reviewId}`, { withCredentials: true });
      
      // Filter out deleted review from state
      setListing(prev => ({
        ...prev,
        reviews: prev.reviews.filter(r => r._id !== reviewId)
      }));
      
      alert('Review deleted!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete review.');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        <p>Loading property details...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="alert alert-danger" style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Error Loading Property</h2>
        <p>{error || 'Property not found.'}</p>
        <button className="btn btn-secondary" style={{ marginTop: '20px', marginInline: 'auto' }} onClick={() => navigate('/')}>
          Return to Explore
        </button>
      </div>
    );
  }

  const isOwner = currentUser && listing.owner && currentUser._id === listing.owner._id;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease-out' }}>
      {/* Header Info */}
      <div className="detail-header">
        <h1 className="detail-title">{listing.title}</h1>
        <div className="detail-subtitle">
          <FaMapMarkerAlt style={{ color: 'var(--primary)' }} />
          <span>{listing.location}, {listing.country}</span>
        </div>
      </div>

      {/* Grid Layout (Main Content + Sidebar Card) */}
      <div className="detail-container">
        
        {/* Main Details Area */}
        <div>
          <div className="detail-image-box">
            <img 
              src={
                typeof listing.image === 'string' 
                  ? listing.image 
                  : (listing.image?.url || 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=cover&w=1200&q=80')
              } 
              alt={listing.title} 
              className="detail-image" 
              onError={(e) => {
                e.target.src = 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-4.0.3&auto=format&fit=cover&w=1200&q=80';
              }}
            />
          </div>

          <div className="owner-info">
            <div className="avatar logged-in" style={{ width: '40px', height: '40px', fontSize: '18px' }}>
              {listing.owner?.username ? listing.owner.username[0].toUpperCase() : <FaUser />}
            </div>
            <div>
              <div className="owner-name">Entire home hosted by {listing.owner?.username || 'Owner'}</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Professional host &bull; 4.8★ rating</div>
            </div>
          </div>

          <div className="listing-desc">
            <h3>About this space</h3>
            <p style={{ marginTop: '12px' }}>{listing.description}</p>
          </div>

          {/* Action controls for Owner */}
          {isOwner && (
            <div className="action-buttons" style={{ borderTop: '1px solid var(--border)', paddingTop: '24px', marginTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => navigate(`/listings/${id}/edit`)}>
                <FaEdit /> Edit Property Details
              </button>
              <button className="btn btn-danger" onClick={handleDeleteListing}>
                <FaTrash /> Delete This Listing
              </button>
            </div>
          )}

          {/* Reviews section */}
          <div className="reviews-section">
            <h3 className="reviews-title">Guest Reviews</h3>
            
            {listing.reviews.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '24px' }}>
                No reviews yet. Be the first to share your experience!
              </p>
            ) : (
              <div className="reviews-grid">
                {listing.reviews.map(review => {
                  const isReviewAuthor = currentUser && review.author && currentUser._id === review.author._id;
                  return (
                    <div key={review._id} className="review-card">
                      <div className="review-header">
                        <div>
                          <div className="review-author">{review.author?.username || 'Anonymous'}</div>
                          <div className="review-stars" style={{ marginTop: '2px' }}>
                            {[...Array(5)].map((_, i) => (
                              <FaStar key={i} style={{ color: i < review.rating ? '#ffb400' : '#ddd' }} />
                            ))}
                          </div>
                        </div>
                        {isReviewAuthor && (
                          <button 
                            onClick={() => handleDeleteReview(review._id)}
                            style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: '4px' }}
                            title="Delete Review"
                          >
                            <FaTrash size={12} />
                          </button>
                        )}
                      </div>
                      <p className="review-comment">{review.comment}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Leave a Review (if user logged in) */}
            {currentUser ? (
              <form className="review-form" onSubmit={handleSubmitReview}>
                <h4 style={{ fontFamily: 'var(--font-heading)' }}>Leave a Review</h4>
                {reviewError && <div className="alert alert-danger">{reviewError}</div>}
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600' }}>Rating:</span>
                  <div className="rating-input">
                    {[1, 2, 3, 4, 5].map(num => (
                      <FaStar 
                        key={num} 
                        className={num <= rating ? 'active' : ''} 
                        onClick={() => setRating(num)} 
                      />
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Your comments</label>
                  <textarea 
                    className="form-control" 
                    placeholder="Describe your stay, the location, amenities..." 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: 'fit-content' }} disabled={reviewSubmitLoading}>
                  {reviewSubmitLoading ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center' }}>
                <p>Please <span style={{ color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }} onClick={() => navigate('/login')}>log in</span> to submit a review.</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Pricing & Booking + Map Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Price details card */}
          <div className="price-card">
            <div>
              <span className="price-tag">&#8377; {(listing.price || 0).toLocaleString('en-IN')}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '15px' }}> / night</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Cleanliness fee</span>
                <span>&#8377; 500</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Wanderlust service fee</span>
                <span>&#8377; 1,200</span>
              </div>
            </div>
            <button className="form-btn-submit" style={{ margin: 0 }} onClick={() => navigate(`/listings/${id}/book`)}>
              Reserve Now
            </button>
            <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>You won't be charged yet</div>
          </div>

          {/* Map Location Card */}
          <div className="map-section" style={{ borderTop: 'none' }}>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>Where you'll be</h3>
            <div ref={mapContainerRef} className="map-container" />
          </div>

        </div>

      </div>
    </div>
  );
}
