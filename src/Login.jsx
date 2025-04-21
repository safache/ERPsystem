import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if employee is already authenticated
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/Dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(
        "http://localhost:5000/login",
        { email, mdp },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const employeeData = response.data;
      
      if (employeeData) {
        console.log('Login successful:', employeeData);
        // Store employee data in localStorage
        localStorage.setItem("token", employeeData.token);
        localStorage.setItem("id", employeeData.id.toString());
        localStorage.setItem("userEmail", employeeData.email);
        localStorage.setItem("userRole", employeeData.role);
        localStorage.setItem("userName", `${employeeData.first_name} ${employeeData.last_name}`);
        localStorage.setItem("department", employeeData.department);
        localStorage.setItem("position", employeeData.position);

        if (onLogin) {
          onLogin();
        }

        navigate('/Dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || 'Invalid email or password');
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
              onChange={(e) => setMdp(e.target.value)}
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