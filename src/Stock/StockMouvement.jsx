import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './StockMouvement.css';

const StockMovement = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [movementFilter, setMovementFilter] = useState('all');

  useEffect(() => {
    fetchStockMovements();
  }, []);

  const fetchStockMovements = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/stock-movements', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMovements(response.data);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
      toast.error('Failed to fetch stock movements');
    } finally {
      setLoading(false);
    }
  };

  const getMovementTypeIcon = (type) => {
    switch (type) {
      case 'IN':
        return <FaArrowUp className="movement-icon in" />;
      case 'OUT':
        return <FaArrowDown className="movement-icon out" />;
      default:
        return null;
    }
  };

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.product_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movement.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = movementFilter === 'all' || movement.movement_type.toLowerCase() === movementFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="stock-movement">
      <h1>Stock Movements</h1>
      
      <div className="top-controls">
        <input
          type="text"
          placeholder="Search movements..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="filter-buttons">
          <button
            className={`filter-btn ${movementFilter === 'all' ? 'active' : ''}`}
            onClick={() => setMovementFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn entry ${movementFilter === 'entry' ? 'active' : ''}`}
            onClick={() => setMovementFilter('entry')}
          >
            <FaArrowUp /> Entry
          </button>
          <button
            className={`filter-btn exit ${movementFilter === 'exit' ? 'active' : ''}`}
            onClick={() => setMovementFilter('exit')}
          >
            <FaArrowDown /> Exit
          </button>
        </div>
      </div>

      <div className="table-container">
        <table className="movement-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Type</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="loading">Loading movements...</td>
              </tr>
            ) : filteredMovements.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">No movements found.</td>
              </tr>
            ) : (
              filteredMovements.map((movement) => (
                <tr key={movement.id}>
                  <td>{new Date(movement.movement_date).toLocaleString()}</td>
                  <td>{movement.product_name}</td>
                  <td>
                    <span className={`movement-type ${movement.movement_type.toLowerCase()}`}>
                      {getMovementTypeIcon(movement.movement_type)}
                      {movement.movement_type}
                    </span>
                  </td>
                  <td className={`quantity ${movement.movement_type.toLowerCase()}`}>
                    {movement.movement_type === 'OUT' ? '-' : '+'}{movement.quantity}
                  </td>
                  <td>{movement.description}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockMovement;