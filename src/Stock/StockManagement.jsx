import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaBoxes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import './StockManagement.css';

const StockManagement = () => {
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/stock', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStock(response.data);
    } catch (error) {
      console.error('Error fetching stock:', error);
      toast.error('Failed to fetch stock information');
    } finally {
      setLoading(false);
    }
  };

  const filteredStock = stock.filter(item =>
    item.product_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStockStatus = (quantity, minimumStock) => {
    if (quantity <= 0) return 'out-of-stock';
    if (quantity <= minimumStock) return 'low-stock';
    return 'in-stock';
  };

  return (
    <div className="stock-management">
      <h1>Stock Management</h1>
      
      <div className="top-controls">
        <input
          type="text"
          placeholder="Search products..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="table-container">
        <table className="stock-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Current Stock</th>
              <th></th>
              <th>Status</th>
              <th>Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="loading">Loading stock information...</td>
              </tr>
            ) : filteredStock.length === 0 ? (
              <tr>
                <td colSpan="5" className="no-data">No products found.</td>
              </tr>
            ) : (
              filteredStock.map((item) => (
                <tr key={item.product_id} className={item.quantity <= 0 ? 'out-of-stock-row' : ''}>
                  <td>{item.product_name}</td>
                  <td className="quantity">{item.quantity}</td>
                  <td>{item.minimum_stock}</td>
                  <td>
                    <span className={`status-badge ${getStockStatus(item.quantity, item.minimum_stock)}`}>
                      {item.quantity <= 0 ? (
                        <>
                          <FaTimesCircle /> Out of Stock
                        </>
                      ) : item.quantity <= item.minimum_stock ? (
                        <>
                          <FaBoxes /> Low Stock
                        </>
                      ) : (
                        <>
                          <FaCheckCircle /> In Stock
                        </>
                      )}
                    </span>
                  </td>
                  <td>{new Date(item.updated_at).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockManagement;