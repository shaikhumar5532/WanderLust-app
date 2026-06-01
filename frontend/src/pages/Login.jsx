import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

// Setup API endpoint constant
const API_URL = 'http://localhost:8080';

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError(null);

      const res = await axios.post(`${API_URL}/login`, {
        username,
        password
      }, {
        withCredentials: true // send/receive cookies
      });

      if (res.data.success) {
        alert(res.data.message || 'Logged in successfully!');
        onLoginSuccess(res.data.user);
        navigate('/');
      } else {
        setError('Incorrect username or password.');
      }
    } catch (err) {
      console.error('Error logging in:', err);
      setError(err.response?.data?.error || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div className="form-card">
        <h2 className="form-title">Welcome back</h2>
        
        {error && <div className="alert alert-danger">{error}</div>}

        <form onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Enter your username" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '24px' }}>
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="Enter your password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="form-btn-submit" disabled={loading}>
            {loading ? 'Authenticating...' : 'Log In'}
          </button>
        </form>

        <div className="form-footer">
          Don't have an account?{' '}
          <Link to="/signup" className="form-footer-link">
            Sign up now
          </Link>
        </div>
      </div>
    </div>
  );
}
