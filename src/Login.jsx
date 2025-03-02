import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [mdp, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const loginResponse = await axios.post(
        "http://localhost:8000/Login",
        { email, mdp },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const { token, role, name } = loginResponse.data;
      
      if (token) {
        localStorage.setItem("token", token);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userRole", role);
        localStorage.setItem("userName", name);
        
        // Redirect based on role
        if (role === 'ADMIN') {
          navigate('/users/UserManagement');
        } else {
          navigate('/Login');
        }
      } else {
        setError("Authentication failed. Please try again.");
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error.message);
      setError(error.response?.data?.msg || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="containerr">
      <div className="form-container">
        <form onSubmit={handleLogin}>
          <h2 className='title'>Welcome Back!</h2>
          {error && <div className="error-message">{error}</div>}
          <div className="form-row">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-row">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={mdp}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button className='butt' type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
      <div className="welcome-section">
        <h1 className='tit'>Hello, Friend!</h1>
        <p>Enter your personal details and start your journey </p>
      </div>
    </div>
  );
};

export default Login;