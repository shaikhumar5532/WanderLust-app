import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Setup API endpoint constant
const API_URL = import.meta.env.VITE_API_URL;

export default function CreateListing() {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [imageFile, setImageFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      setError('Please upload an image for your property.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Construct FormData for multipart uploading
      const formData = new FormData();
      formData.append('listing[title]', title);
      formData.append('listing[description]', description);
      formData.append('listing[price]', price);
      formData.append('listing[location]', location);
      formData.append('listing[country]', country);
      formData.append('listing[image]', imageFile);

      const res = await axios.post(`${API_URL}/listings`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true // send cookies
      });

      alert('Listing created successfully!');
      navigate(`/listings/${res.data.listing._id}`);
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err.response?.data?.error || 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="form-card">
        <h2 className="form-title">Airbnb your home</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit} encType="multipart/form-data">
          
          <div className="form-group">
            <label className="form-label">Title</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Cozy Beachfront Villa" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea 
              className="form-control" 
              placeholder="Describe what makes your space special, the rooms, views, and surroundings..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Upload Image</label>
            <input 
              type="file" 
              className="form-control" 
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
              required
            />
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Choose a gorgeous landscape photo.</span>
          </div>

          <div className="form-group-row">
            <div className="form-group">
              <label className="form-label">Price per night (&#8377;)</label>
              <input 
                type="number" 
                className="form-control" 
                placeholder="1200" 
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
                placeholder="India" 
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
              placeholder="e.g. Goa, Maharashtra" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="form-btn-submit" disabled={loading}>
            {loading ? 'Publishing your home...' : 'Publish Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}
