import React, { useState } from 'react';
import Header from './dashboard/Header';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import UserManagement from './users/UserManagement';
import EmployeManagement from './Employe/EmployeManagement';
import Login from './Login';
import ClientManagement from './Clients/ClientManagement';
import ProductManagement from './Produits/ProductManagement';
import SupplierManagement from './supplier/SupplierManagement';
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');
  return !!token && !!userRole;
};

function App() {
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(isAuthenticated());

  const handleLogin = () => {
    setIsAuthenticatedState(true);
  };

  const handleLogout = () => {
    setIsAuthenticatedState(false);
  };

  return (
    <Router>
      <div className="app-wrapper">
        {isAuthenticatedState && <Header className="header" onLogout={handleLogout} />}
        <main className="main-content">
          <div style={{ height: "1000px", background: "rgb(255, 255, 255)" }}>
            <Routes>
              <Route 
                path="/" 
                element={
                  isAuthenticatedState ? 
                  <Navigate to="/UserManagement" /> : 
                  <Navigate to="/login" />
                } 
              />
              <Route 
                path="/login" 
                element={
                  !isAuthenticatedState ? 
                  <Login onLogin={handleLogin} /> : 
                  <Navigate to="/UserManagement" />
                } 
              />
              <Route 
                path="/UserManagement" 
                element={
                  isAuthenticatedState ? 
                  <UserManagement /> : 
                  <Navigate to="/login" />
                } 
              />
              <Route 
                path="/EmployeManagement" 
                element={
                  isAuthenticatedState ? 
                  <EmployeManagement /> : 
                  <Navigate to="/login" />
                } 
              />
              <Route 
                path="/ClientManagement" 
                element={
                  isAuthenticatedState ? 
                  <ClientManagement /> : 
                  <Navigate to="/login" />
                }
              />
              <Route 
                path="/ProductManagement" 
                element={
                  isAuthenticatedState ? 
                  <ProductManagement /> : 
                  <Navigate to="/login" />
                }/>
                <Route 
  path="/SupplierManagement" 
  element={
    isAuthenticatedState ? 
    <SupplierManagement /> : 
    <Navigate to="/login" />
  }
/>
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

export default App;
