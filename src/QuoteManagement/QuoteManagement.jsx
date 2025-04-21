import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { FaEye, FaEdit, FaTrash, FaDownload } from 'react-icons/fa';
import './QuoteManagement.css';
import html2pdf from 'html2pdf.js';

const QuoteManagement = () => {
  const [quotes, setQuotes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [editedItems, setEditedItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [clients, setClients] = useState([]);

  const fetchQuotes = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/quotes', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setQuotes(response.data);
    } catch (error) {
      toast.error('Failed to fetch quotes');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/getproducts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    }
  };

  const handleCreateQuote = React.useCallback(async (quoteData) => {
    try {
      setLoading(true);
      const { data } = await axios.post('http://localhost:5000/api/quotes', quoteData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      await fetchQuotes();
      toast.success('Quote created successfully');
      return data;
    } catch (error) {
      console.error('Error creating quote:', error);
      toast.error('Failed to create quote');
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);  // Empty dependency array since it doesn't depend on any props or state

  useEffect(() => {
    fetchQuotes();
  }, []);

  useEffect(() => {
    const checkPendingQuote = async () => {
      const pendingQuote = localStorage.getItem('pendingQuote');
      const hasProcessed = localStorage.getItem('pendingQuoteProcessed');
  
      if (pendingQuote && !hasProcessed) {
        try {
          // Set the flag to indicate processing has started
          localStorage.setItem('pendingQuoteProcessed', 'true');
  
          const quoteData = JSON.parse(pendingQuote);
          await handleCreateQuote(quoteData);
        } catch (error) {
          console.error('Error processing pending quote:', error);
        } finally {
          localStorage.removeItem('pendingQuote');
          localStorage.removeItem('pendingQuoteProcessed');
        }
      }
    };
  
    checkPendingQuote();
  }, [handleCreateQuote]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDownload = async (quote) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/quotes/${quote.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Format the quote details with proper number parsing
      const quoteWithDetails = {
        ...response.data,
        items: response.data.items.map(item => ({
          ...item,
          unit_price: parseFloat(item.unit_price) || 0,
          total_price: parseFloat(item.total_price) || 0
        })),
        total_amount: parseFloat(response.data.total_amount) || 0
      };

      // Create the PDF content using HTML
      const content = document.createElement('div');
      content.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
        
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <h3>Quote #${quoteWithDetails.quote_number}</h3>
              <p>Client: ${quoteWithDetails.client_name}</p>
            </div>
            <div>
              <p>Date: ${new Date(quoteWithDetails.created_at).toLocaleDateString()}</p>
              <p>Valid Until: ${new Date(quoteWithDetails.valid_until).toLocaleDateString()}</p>
            </div>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f3f4f6;">
                <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: left;">Product</th>
                <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: center;">Quantity</th>
                <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: right;">Unit Price</th>
                <th style="padding: 12px; border: 1px solid #e5e7eb; text-align: right;">Total HT</th>
              </tr>
            </thead>
            <tbody>
              ${quoteWithDetails.items.map(item => `
                <tr>
                  <td style="padding: 12px; border: 1px solid #e5e7eb;">${item.product_name}</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: right;">${item.unit_price.toFixed(3)} DT</td>
                  <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: right;">${item.total_price.toFixed(3)}DT</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 12px; border: 1px solid #e5e7eb; text-align: right; font-weight: bold;">Total:</td>
                <td style="padding: 12px; border: 1px solid #e5e7eb; text-align: right; font-weight: bold;">${quoteWithDetails.total_amount.toFixed(3)} DT</td>
              </tr>
            </tfoot>
          </table>

          <div style="margin-top: 40px;">
<div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: center;">
  <p style="color: #666;">Bon Pour Acceptation</p>
  <p style="color: #666;">SIGNATURE</p>
</div>
            <p style="color: #666;">This quote is valid until ${new Date(quoteWithDetails.valid_until).toLocaleDateString()}</p>
          </div>
        </div>
      `;

      const opt = {
        margin: 1,
        filename: `Quote-${quoteWithDetails.quote_number}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      html2pdf().from(content).set(opt).save();
    } catch (error) {
      console.error('Error downloading quote:', error);
      toast.error('Failed to download quote');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (quoteId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/quotes/${quoteId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      toast.success('Quote status updated successfully');
      fetchQuotes();
    } catch (error) {
      console.error('Error updating quote status:', error);
      toast.error('Failed to update quote status');
    }
  };

  const handleView = (quote) => {
    // Ensure total_amount is a number
    const formattedQuote = {
      ...quote,
      total_amount: parseFloat(quote.total_amount) || 0
    };
    setSelectedQuote(formattedQuote);
    setShowViewModal(true);
  };

  const handleEdit = async (quote) => {
    try {
      const [quoteResponse, clientsResponse] = await Promise.all([
        axios.get(`http://localhost:5000/quotes/${quote.id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        axios.get('http://localhost:5000/getclients', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      setSelectedQuote({
        ...quoteResponse.data,
        valid_until: quoteResponse.data.valid_until ? 
          new Date(quoteResponse.data.valid_until).toISOString().split('T')[0] : ''
      });
      setEditedItems(quoteResponse.data.items.map(item => ({
        ...item,
        quantity: parseInt(item.quantity),
        unit_price: parseFloat(item.unit_price),
        total_price: parseFloat(item.total_price)
      })));
      setClients(clientsResponse.data);
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching quote details:', error);
      toast.error('Failed to fetch quote details');
    }
  };

  const handleDelete = async (quoteId) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      try {
        await axios.delete(`http://localhost:5000/quotes/${quoteId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        toast.success('Quote deleted successfully');
        fetchQuotes();
      } catch (error) {
        console.error('Error deleting quote:', error);
        toast.error('Failed to delete quote');
      }
    }
  };

  const handleRemoveEditedItem = (index) => {
    setEditedItems(editedItems.filter((_, i) => i !== index));
  };

  const handleAddEditedItem = () => {
    setEditedItems([
      ...editedItems,
      {
        product_id: '',
        product_name: '',
        quantity: 1,
        unit_price: 0,
        total_price: 0
      }
    ]);
  };

  const handleEditedItemChange = (index, field, value) => {
    const newItems = [...editedItems];
    const item = { ...newItems[index] };
    
    if (field === 'product_id') {
      const selectedProduct = products.find(p => p.id === parseInt(value));
      item.product_id = selectedProduct.id;
      item.product_name = selectedProduct.name;
      item.unit_price = parseFloat(selectedProduct.price);
    } else {
      item[field] = value;
    }
    
    item.total_price = item.quantity * item.unit_price;
    newItems[index] = item;
    setEditedItems(newItems);
  };

  const handleSaveEdit = async () => {
    try {
      const updatedQuote = {
        clientId: selectedQuote.client_id,
        validUntil: selectedQuote.valid_until || null,
        notes: selectedQuote.notes || null,
        items: editedItems.map(item => ({
          productId: item.product_id,
          quantity: parseInt(item.quantity),
          price: parseFloat(item.unit_price)
        }))
      };

      const { data } = await axios.put(
        `http://localhost:5000/api/quotes/${selectedQuote.id}`,
        updatedQuote,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );

      if (data) {
        toast.success('Quote updated successfully');
        setShowEditModal(false);
        fetchQuotes();
      }
    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error('Failed to update quote');
    }
  };

  const filteredQuotes = quotes.filter(quote =>
    quote.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="quote-management-container">
      <ToastContainer />
      <h1>Quote Management</h1>

      {loading ? (
        <div className="loading-spinner">Loading...</div>
      ) : (
        <>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by client name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <table className="quotes-table">
            <thead>
              <tr>
                <th>Quote Number</th>
                <th>Client</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Valid Until</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((quote) => (
                <tr key={quote.id}>
                  <td>{quote.quote_number}</td>
                  <td>{quote.client_name}</td>
                  <td>${parseFloat(quote.total_amount).toFixed(3)} DT</td>
                  <td>
                    <select
                      value={quote.status}
                      onChange={(e) => handleStatusChange(quote.id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                  <td>{new Date(quote.created_at).toLocaleDateString()}</td>
                  <td>{new Date(quote.valid_until).toLocaleDateString()}</td>
                  <td>
                    <div className="action-buttons">
                      <button onClick={() => handleDownload(quote)} className="action-btn">
                        <FaDownload />
                      </button>
                      <button onClick={() => handleView(quote)} className="action-btn">
                        <FaEye />
                      </button>
                      <button onClick={() => handleEdit(quote)} className="action-btn">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDelete(quote.id)} className="action-btn">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {showViewModal && selectedQuote && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="text-xl font-bold mb-4">Quote Details</h2>
             
            </div>
            
            <div className="modal-body">
              <div className="info-grid mb-6">
                <div className="info-row">
                  <span className="info-label">Quote Number:</span>
                  <span className="info-value">#{selectedQuote.quote_number}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Client:</span>
                  <span className="info-value">{selectedQuote.client_name}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Created Date:</span>
                  <span className="info-value">
                    {new Date(selectedQuote.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Valid Until:</span>
                  <span className="info-value">
                    {new Date(selectedQuote.valid_until).toLocaleDateString()}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Status:</span>
                  <span className={`status-badge ${selectedQuote.status}`}>
                    {selectedQuote.status}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Quote Items</h3>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">Product</th>
                      <th className="px-4 py-2 text-center">Quantity</th>
                      <th className="px-4 py-2 text-right">Unit Price</th>
                      <th className="px-4 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedQuote.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">{item.product_name}</td>
                        <td className="px-4 py-2 text-center">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">{parseFloat(item.unit_price).toFixed(3)} DT</td>
                        <td className="px-4 py-2 text-right">{parseFloat(item.total_price).toFixed(3)} DT</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan="3" className="px-4 py-2 text-right font-bold">Total Amount:</td>
                      <td className="px-4 py-2 text-right font-bold text-blue-600">
                        {parseFloat(selectedQuote.total_amount).toFixed(3)} DT
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="modal-footer flex justify-end gap-4 mt-6 pt-4 border-t">
              <button
                onClick={() => setShowViewModal(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedQuote && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="text-xl font-bold">Edit Quote</h2>
            </div>
            
            <div className="modal-body">
              <div className="info-section mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600">Quote Number</label>
                    <p className="font-medium">#{selectedQuote.quote_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Client</label>
                    <select
                      value={selectedQuote.client_id}
                      onChange={(e) => setSelectedQuote({ ...selectedQuote, client_id: parseInt(e.target.value) })}
                      className="form-select w-full"
                    >
                      <option value="">Select Client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.first_name} {client.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Valid Until</label>
                    <input
                      type="date"
                      value={selectedQuote.valid_until}
                      onChange={(e) => setSelectedQuote({ ...selectedQuote, valid_until: e.target.value })}
                      className="form-input w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600">Notes</label>
                    <textarea
                      value={selectedQuote.notes || ''}
                      onChange={(e) => setSelectedQuote({ ...selectedQuote, notes: e.target.value })}
                      className="form-input w-full"
                      rows="3"
                    />
                  </div>
                </div>
              </div>

              <div className="items-section">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Quote Items</h3>
                  <button onClick={handleAddEditedItem} className="btn btn-primary">
                    Add Item
                  </button>
                </div>
                
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2">Product</th>
                      <th className="px-4 py-2">Quantity</th>
                      <th className="px-4 py-2">Unit Price (DT)</th>
                      <th className="px-4 py-2">Total (DT)</th>
                      <th className="px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {editedItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2">
                          <select
                            value={item.product_id}
                            onChange={(e) => handleEditedItemChange(index, 'product_id', e.target.value)}
                            className="form-select w-full"
                          >
                            <option value="">Select Product</option>
                            {products.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleEditedItemChange(index, 'quantity', parseInt(e.target.value))}
                            className="form-input w-20"
                          />
                        </td>
                        <td className="px-4 py-2 text-right">
                          {parseFloat(item.unit_price).toFixed(3)}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {parseFloat(item.total_price).toFixed(3)}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleRemoveEditedItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan="3" className="px-4 py-2 text-right font-bold">Total:</td>
                      <td className="px-4 py-2 text-right font-bold text-blue-600">
                        {editedItems.reduce((sum, item) => sum + (item.total_price || 0), 0).toFixed(3)} DT
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowEditModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="btn btn-primary">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteManagement;