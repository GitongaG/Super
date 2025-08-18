import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (user.length === 0 || pass.length === 0) {
      setError("Please enter a username and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      // Make API call to your backend
     const response = await fetch(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: user,
          password: pass
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      
      // Save token to localStorage for future requests
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Call the onLogin function with user data
      onLogin(data.user);

    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-root">
      <div className="login-card">
        <h1 className="login-title">Supermarket POS</h1>
        <p className="login-sub">Sign in to your desktop POS</p>

        <label className="label">Username</label>
        <input 
          value={user} 
          onChange={(e) => setUser(e.target.value)} 
          className="input" 
          placeholder="admin" 
          disabled={loading}
        />
        
        <label className="label">Password</label>
        <input 
          type="password" 
          value={pass} 
          onChange={(e) => setPass(e.target.value)} 
          className="input" 
          placeholder="password"
          disabled={loading}
        />
        
        {error && (
          <p style={{ color: 'red', marginTop: '10px' }}>
            {error}
          </p>
        )}

        <button 
          className="primary-btn" 
          onClick={submit}
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        <small className="hint">
          Use: <b>admin</b> / <b>password</b> (if you ran the seed script)
        </small>
      </div>
    </div>
  );
}
