import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaCalendarAlt, FaUserFriends, FaInfoCircle, FaChevronLeft } from 'react-icons/fa';

const API_URL = import.meta.env.VITE_API_URL;

export default function BookListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form Fields
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [nights, setNights] = useState(0);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // Fetch listing details for booking
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/listings/${id}`, { withCredentials: true });
        setListing(res.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching listing details for booking:', err);
        setError(err.response?.data?.error || 'Failed to load property details.');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  // Calculate nights difference when dates change
  useEffect(() => {
    if (checkIn && checkOut) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      const diffTime = end - start;
      if (diffTime > 0) {
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setNights(diffDays);
      } else {
        setNights(0);
      }
    } else {
      setNights(0);
    }
  }, [checkIn, checkOut]);

  // Price Calculations
  const pricePerNight = listing?.price || 0;
  const basePrice = pricePerNight * nights;
  const cleaningFee = nights > 0 ? 500 : 0;
  const serviceFee = nights > 0 ? 1200 : 0;
  const tax = basePrice * 0.18;
  const totalPrice = basePrice + cleaningFee + serviceFee + tax;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (nights <= 0) {
      setSubmitError('Check-out date must be after check-in date.');
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitError(null);

      await axios.post(
        `${API_URL}/bookings/listings/${id}`,
        {
          checkIn,
          checkOut,
          guests,
          totalPrice
        },
        { withCredentials: true }
      );

      alert('Reservation confirmed successfully! Enjoy your trip!');
      navigate('/bookings');
    } catch (err) {
      console.error('Booking failed:', err);
      setSubmitError(err.response?.data?.error || 'Failed to complete reservation. Make sure you are logged in.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        <p>Preparing checkout process...</p>
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

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <button 
        className="btn btn-secondary" 
        style={{ marginBottom: '20px', display: 'inline-flex', alignItems: 'center' }}
        onClick={() => navigate(`/listings/${id}`)}
      >
        <FaChevronLeft /> Back to property
      </button>

      <div className="detail-container">
        
        {/* Booking Form Card */}
        <div className="form-card" style={{ margin: 0, maxWidth: '100%' }}>
          <h2 className="form-title" style={{ textAlign: 'left', marginBottom: '8px' }}>Confirm your reservation</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>Review dates and guest tallies to finalize booking.</p>

          {submitError && <div className="alert alert-danger">{submitError}</div>}

          <form onSubmit={handleSubmit}>
            
            <div className="form-group-row">
              <div className="form-group">
                <label className="form-label"><FaCalendarAlt /> Check-in Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label"><FaCalendarAlt /> Check-out Date</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={checkOut}
                  min={checkIn ? new Date(new Date(checkIn).getTime() + 86400000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckOut(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label"><FaUserFriends /> Number of guests</label>
              <select 
                className="form-control" 
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                required
              >
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                ))}
              </select>
            </div>

            <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', marginTop: '24px', display: 'flex', gap: '10px', fontSize: '13px', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
              <FaInfoCircle style={{ marginTop: '2px', flexShrink: 0, color: 'var(--primary)' }} />
              <p>You will be protected by our comprehensive Travel Cover. Cancellations are free up to 24 hours before check-in!</p>
            </div>

            <button type="submit" className="form-btn-submit" style={{ marginTop: '24px' }} disabled={submitLoading || nights <= 0}>
              {submitLoading ? 'Securing your dates...' : 'Confirm & Reserve'}
            </button>
          </form>
        </div>

        {/* Property Invoice Details Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div className="price-card">
            {/* Property summary */}
            <div style={{ display: 'flex', gap: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border)' }}>
              <img 
                src={listing.image?.url} 
                alt={listing.title} 
                style={{ width: '80px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
              />
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{listing.title}</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{listing.location}, {listing.country}</p>
              </div>
            </div>

            {/* Price Calculations breakdown */}
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: '600', marginTop: '8px' }}>Price Details</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyBetween: 'space-between', justifyContent: 'space-between' }}>
                <span style={{ textDecoration: 'underline' }}>&#8377; {pricePerNight.toLocaleString('en-IN')} x {nights} night{nights > 1 ? 's' : ''}</span>
                <span>&#8377; {basePrice.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ textDecoration: 'underline' }}>Cleaning fee</span>
                <span>&#8377; {cleaningFee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ textDecoration: 'underline' }}>Service fee</span>
                <span>&#8377; {serviceFee}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ textDecoration: 'underline' }}>GST Tax (18%)</span>
                <span>&#8377; {tax.toLocaleString('en-IN')}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '700', borderTop: '1px solid var(--border)', paddingTop: '16px', marginTop: '4px' }}>
                <span>Total (INR)</span>
                <span>&#8377; {totalPrice.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
