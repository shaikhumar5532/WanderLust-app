import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaUserFriends, FaReceipt, FaTrash, FaCompass } from 'react-icons/fa';

const API_URL = 'http://localhost:8080';

export default function MyBookings() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/bookings`, { withCredentials: true });
        setBookings(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching bookings:', err);
        setError(err.response?.data?.error || 'Failed to load bookings. Please make sure you are logged in.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? You will receive a 100% refund.')) return;

    try {
      await axios.delete(`${API_URL}/bookings/${bookingId}`, { withCredentials: true });
      
      // Remove cancelled booking from state
      setBookings(prev => prev.filter(b => b._id !== bookingId));
      alert('Booking cancelled successfully!');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking.');
    }
  };

  // Formatter for Dates
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        <p>Loading your reservations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Error Loading Bookings</h2>
        <p>{error}</p>
        <button className="btn btn-secondary" style={{ marginTop: '20px', marginInline: 'auto' }} onClick={() => navigate('/login')}>
          Go to Login Page
        </button>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <h1 className="form-title" style={{ textAlign: 'left', marginBottom: '8px', fontSize: '32px', fontFamily: 'var(--font-heading)' }}>My Bookings</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: '15px', marginBottom: '32px' }}>Manage your booked Wanderlust getaways and properties.</p>

      {bookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: '16px' }}>
          <FaCompass style={{ fontSize: '48px', color: 'var(--primary)', marginBottom: '16px', animation: 'float 3s ease-in-out infinite' }} />
          <h2 style={{ marginBottom: '8px' }}>No properties booked yet</h2>
          <p>Explore gorgeous properties and make your first reservation!</p>
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '24px', marginInline: 'auto' }}
            onClick={() => navigate('/')}
          >
            Start Exploring
          </button>
        </div>
      ) : (
        <div className="listings-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))' }}>
          {bookings.map(booking => {
            const listing = booking.listing;
            if (!listing) return null; // safety fallback

            return (
              <div 
                key={booking._id} 
                className="listing-card"
                style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '16px', cursor: 'default' }}
              >
                {/* Image */}
                <div 
                  className="listing-image-container" 
                  style={{ aspectRatio: '16/10', cursor: 'pointer' }}
                  onClick={() => navigate(`/listings/${listing._id}`)}
                >
                  <img 
                    src={listing.image?.url} 
                    alt={listing.title} 
                    className="listing-card-image"
                  />
                </div>

                {/* Details */}
                <div className="listing-card-info" style={{ paddingInline: '4px' }}>
                  <h3 
                    className="listing-card-title" 
                    style={{ fontSize: '18px', cursor: 'pointer' }}
                    onClick={() => navigate(`/listings/${listing._id}`)}
                  >
                    {listing.title}
                  </h3>
                  <p className="listing-card-location">{listing.location}, {listing.country}</p>

                  <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBlock: '12px', paddingBlock: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaCalendarAlt style={{ color: 'var(--primary)' }} />
                      <span>{formatDate(booking.checkIn)} &mdash; {formatDate(booking.checkOut)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaUserFriends style={{ color: 'var(--primary)' }} />
                      <span>{booking.guests} guest{booking.guests > 1 ? 's' : ''} booked</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}><FaReceipt /> Total Paid</div>
                      <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-main)' }}>&#8377; {booking.totalPrice?.toLocaleString('en-IN')}</div>
                    </div>
                    
                    <button 
                      className="btn btn-danger" 
                      style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '13px' }}
                      onClick={() => handleCancelBooking(booking._id)}
                    >
                      <FaTrash size={12} /> Cancel
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
