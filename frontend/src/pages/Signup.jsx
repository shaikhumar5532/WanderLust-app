import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// Setup API endpoint constant
const API_URL = import.meta.env.VITE_API_URL;

export default function Signup({ onSignupSuccess }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(`${API_URL}/signup`, {
        username,
        email,
        password
      }, {
        withCredentials: true // capture session cookies
      });

      if (res.data.success) {
        alert(res.data.message || 'Account created successfully!');
        onSignupSuccess(res.data.user);
        navigate('/');
      } else {
        setError('Signup failed. Please try again.');
      }
    } catch (err) {
      console.error('Error signing up:', err);
      setError(err.response?.data?.error || 'Failed to register account. Username or email might be already taken.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="form-card">
        <h2 className="form-title">Create an account</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. wanderer_johndoe" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="name@example.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Minimum 6 characters" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength="6"
              required
            />
          </div>

          <button type="submit" className="form-btn-submit" disabled={loading}>
            {loading ? 'Registering your account...' : 'Create Account'}
          </button>
        </form>

        <div className="form-footer">
          Already have an account?{' '}
          <Link to="/login" className="form-footer-link">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
}
