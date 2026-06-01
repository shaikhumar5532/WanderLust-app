import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Setup API endpoint constant
const API_URL = 'http://localhost:8080';

export default function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch current listing values
  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/listings/${id}/edit`, { withCredentials: true });
        const { listing, originalImageUrl } = res.data;
        
        setTitle(listing.title);
        setDescription(listing.description);
        setPrice(listing.price);
        setLocation(listing.location);
        setCountry(listing.country);
        setOriginalImageUrl(originalImageUrl);
        setError(null);
      } catch (err) {
        console.error('Error fetching listing details for edit:', err);
        setError(err.response?.data?.error || 'Failed to fetch listing data.');
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('listing[title]', title);
      formData.append('listing[description]', description);
      formData.append('listing[price]', price);
      formData.append('listing[location]', location);
      formData.append('listing[country]', country);
      if (imageFile) {
        formData.append('listing[image]', imageFile);
      }

      const res = await axios.put(`${API_URL}/listings/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      alert('Listing updated successfully!');
      navigate(`/listings/${id}`);
    } catch (err) {
      console.error('Error updating listing:', err);
      setError(err.response?.data?.error || 'Failed to update listing.');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>
        <p>Loading property details for editing...</p>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="form-card">
        <h2 className="form-title">Edit Listing Details</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          
          <div className="form-group">
            <label className="form-label">Title</label>
            <input 
              type="text" 
              className="form-control" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-control" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {originalImageUrl && (
            <div className="form-group" style={{ alignItems: 'center' }}>
              <label className="form-label">Original Property Image</label>
              <img 
                src={originalImageUrl} 
                alt="Original" 
                style={{ width: '150px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border)', marginTop: '8px' }}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Upload New Image (Optional)</label>
            <input 
              type="file" 
              className="form-control" 
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Leave empty to keep the original image.</span>
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label className="form-label">Price per night (&#8377;)</label>
              <input 
                type="number" 
                className="form-control" 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Country</label>
              <input 
                type="text" 
                className="form-control" 
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location / City</label>
            <input 
              type="text" 
              className="form-control" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <div className="action-buttons" style={{ marginTop: '24px' }}>
            <button type="submit" className="form-btn-submit" style={{ margin: 0, flex: 2 }} disabled={submitLoading}>
              {submitLoading ? 'Saving updates...' : 'Save Updates'}
            </button>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => navigate(`/listings/${id}`)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
