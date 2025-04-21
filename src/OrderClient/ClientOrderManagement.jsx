import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './ClientOrderManagement.css';
import { FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import Select from 'react-select';

const ClientOrderManagement = () => {
  const [clientOrders, setClientOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const navigate = useNavigate();

  // Add these new state variables at the top of your component
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editedClientId, setEditedClientId] = useState('');
  const [editedItems, setEditedItems] = useState([]);

  // Add this new state at the top of your component with other states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState(null);

  // Add this state at the top with other state declarations
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch clients
  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/getclients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClients(response.data);
    } catch (error) {
      toast.error('Failed to fetch clients');
    }
  };

  // Fetch products
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/getproducts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (error) {
      toast.error('Failed to fetch products');
    }
  };

  // Fetch orders
  const fetchClientOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/client-orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setClientOrders(response.data);
    } catch (error) {
      toast.error('Failed to fetch orders');
    }
  };

  // Add product to order
  const handleAddProduct = () => {
    const product = products.find(p => p.id === parseInt(selectedProduct));
    if (!product) {
      toast.error('Please select a product first');
      return;
    }

    if (quantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    const newItem = {
      productId: product.id,
      productName: product.name,
      quantity: parseInt(quantity),
      price: product.price,
      total: product.price * parseInt(quantity)
    };

    setOrderItems([...orderItems, newItem]);
    setSelectedProduct('');
    setQuantity(1);
    toast.success('Product added to order');
  };

  // Remove product from order
  const handleRemoveProduct = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  // Calculate total order amount
  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.total, 0);
  };

  // Submit order
  const handleSubmitOrder = async () => {
    if (!selectedClient || orderItems.length === 0) {
      toast.error('Please select a client and add products');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const orderData = {
        clientId: selectedClient,
        totalAmount: calculateTotal(),
        items: orderItems
      };

      await axios.post('http://localhost:5000/save-client-orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success('Order created successfully');
      setSelectedClient(null);
      setOrderItems([]);
      fetchClientOrders();
    } catch (error) {
      toast.error('Failed to create order');
    }
  };

  // Add this function with the other state management functions
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/client-orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      toast.success('Order status updated successfully');
      fetchClientOrders(); // Refresh the orders list
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  // Update the handleEditOrder function
  const handleEditOrder = async (order) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/client-orders/${order.id}/items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Map the items with proper type conversion and validation
      const formattedItems = response.data.map(item => {
        // Find the corresponding product to get the current price
        const product = products.find(p => p.id === parseInt(item.product_id));
        const quantity = parseInt(item.quantity) || 0;
        const price = parseFloat(product?.price) || 0;
        
        return {
          productId: parseInt(item.product_id),
          productName: product?.name || item.product_name,
          quantity: quantity,
          price: price,
          total: parseFloat((price * quantity).toFixed(2))
        };
      });

      setEditingOrder(order);
      setEditedClientId(order.client_id);
      setEditedItems(formattedItems);
      setIsEditModalOpen(true);
    } catch (error) {
      console.error('Error fetching order items:', error);
      toast.error('Failed to fetch order items');
    }
  };

  // Add function to handle item removal
  const handleRemoveEditedItem = (index) => {
    setEditedItems(editedItems.filter((_, i) => i !== index));
  };

  // Update the handleEditedItemQuantityChange function
  const handleEditedItemQuantityChange = (index, newQuantity) => {
    const quantity = Math.max(1, parseInt(newQuantity) || 0);
    const updatedItems = [...editedItems];
    const price = parseFloat(updatedItems[index].price) || 0;
    
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: quantity,
      total: parseFloat((price * quantity).toFixed(2))
    };
    setEditedItems(updatedItems);
  };

  // Add this new function to handle the edit save
  const handleSaveEdit = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/client-orders/${editingOrder.id}`,
        {
          clientId: editedClientId,
          items: editedItems,
          totalAmount: editedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Order updated successfully');
      setIsEditModalOpen(false);
      fetchClientOrders();
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/client-orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order deleted successfully');
      fetchClientOrders(); 
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
  };

  // Add this function with your other handler functions
  const handleEditedProductChange = (index, productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    if (product) {
      const updatedItems = [...editedItems];
      const quantity = parseInt(updatedItems[index].quantity) || 1;
      const price = parseFloat(product.price);
      
      updatedItems[index] = {
        ...updatedItems[index],
        productId: product.id,
        productName: product.name,
        price: price,
        quantity: quantity,
        total: parseFloat((price * quantity).toFixed(2))
      };
      setEditedItems(updatedItems);
    }
  };

  // Add this function to add new items to the edit form
  const handleAddEditedProduct = () => {
    const defaultProduct = products[0];
    if (defaultProduct) {
      const newItem = {
        productId: defaultProduct.id,
        productName: defaultProduct.name,
        quantity: 1,
        price: parseFloat(defaultProduct.price),
        total: parseFloat(defaultProduct.price)
      };
      setEditedItems([...editedItems, newItem]);
    }
  };

  // Update the handleViewOrder function
  const handleViewOrder = async (order) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/client-orders/${order.id}/items`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Get order items with proper price calculations
      const orderItems = response.data.map(item => {
        // Find the corresponding product
        const product = products.find(p => p.id === parseInt(item.product_id));
        const quantity = parseInt(item.quantity);
        const price = product ? parseFloat(product.price) : parseFloat(item.price);
        const total = price * quantity;

        return {
          productName: item.product_name,
          quantity: quantity,
          price: price,
          total: total
        };
      });

      // Calculate total amount
      const totalAmount = orderItems.reduce((sum, item) => sum + item.total, 0);

      setViewingOrder({
        ...order,
        items: orderItems,
        total_amount: totalAmount
      });
      setIsViewModalOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast.error('Failed to fetch order details');
    }
  };

  // Add this function to filter orders
  const filteredOrders = clientOrders.filter(order => 
    `${order.first_name} ${order.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchClients();
    fetchProducts();
    fetchClientOrders();
  }, []);

  return (
    <div className="client-order-container">
      {/* Add ToastContainer at the top of your JSX */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Client Order Management</h1>
        <p className="page-subtitle">Create and manage client orders</p>
      </div>

      {/* Client Selection */}
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Select Client</h2>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={clients.find(c => c.id === selectedClient) ? {
              value: selectedClient,
              label: clients.find(c => c.id === selectedClient)?.email
            } : null}
            onChange={(option) => setSelectedClient(option ? option.value : null)}
            options={clients.map(client => ({
              value: client.id,
              label: `${client.email} `
            }))}
            className="flex-1 max-w-[70%]"
            isClearable
            isSearchable
            placeholder="Search or select a client..."
            noOptionsMessage={() => "No clients found"}
            theme={(theme) => ({
              ...theme,
              colors: {
                ...theme.colors,
                primary: '#3b82f6',
                primary25: '#eff6ff',
                primary50: '#dbeafe',
              },
            })}
          />
          <button
            onClick={() => navigate('/ClientManagement')}
            className="btn btn-primary ml-auto"
          >
            <span>👤</span>
            <span>Add New Client</span>
          </button>
        </div>
      </div>

      {/* Product Selection */}
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Add Products</h2>
        </div>
        <div className="product-selection-container">
          <div className="product-row">
            <Select
              value={products.find(p => p.id === parseInt(selectedProduct)) ? {
                value: selectedProduct,
                label: `${products.find(p => p.id === parseInt(selectedProduct))?.name} - ${products.find(p => p.id === parseInt(selectedProduct))?.price}dt`
              } : null}
              onChange={(option) => setSelectedProduct(option ? option.value : '')}
              options={products.map(product => ({
                value: product.id,
                label: `${product.name} - ${product.price}dt`
              }))}
              className="select-product"
              classNamePrefix="select"
              isClearable
              isSearchable
              placeholder="Search or select a product..."
              noOptionsMessage={() => "No products found"}
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary: '#3b82f6',
                  primary25: '#eff6ff',
                  primary50: '#dbeafe',
                },
              })}
            />
            <div className="quantity-container">
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="quantity-input"
              />
              <button
                onClick={handleAddProduct}
                className="btn btn-primary whitespace-nowrap"
                disabled={!selectedProduct}
              >
                <span>🛒</span>
                <span>Add Product</span>
              </button>
            </div>
          </div>
        </div>
        {/* Order Items Table */}
        <table className="data-table">
          <thead className="table-header">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody>
            {orderItems.map((item, index) => (
              <tr key={index} className="table-row">
                <td className="table-cell">{item.productName}</td>
                <td className="table-cell">{item.quantity}</td>
                <td className="table-cell">{item.price}dt</td>
                <td className="table-cell">{item.total}dt</td>
                <td className="table-cell">
                  <button
                    onClick={() => handleRemoveProduct(index)}
                    className="btn btn-danger"
                  >
                    <span>🗑️</span>
                    <span>Remove</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan="3" className="px-6 py-4 text-right font-bold text-lg">Total Order Amount:</td>
              <td className="px-6 py-4 font-bold text-lg text-blue-600">{calculateTotal()}dt</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        
        <div className="flex justify-end mt-6 gap-4">
          <button
            onClick={() => {
              // Save current order data to localStorage before navigating
              const quoteData = {
                clientId: selectedClient,
                items: orderItems
              };
              localStorage.setItem('pendingQuote', JSON.stringify(quoteData));
              navigate('/QuoteManagement');
            }}
            disabled={!selectedClient || orderItems.length === 0}
            className={`btn btn-secondary ${(!selectedClient || orderItems.length === 0) ? 'disabled' : ''}`}
          >
            <span>📝</span>
            <span>Create Quote</span>
          </button>
          <button
            onClick={handleSubmitOrder}
            disabled={!selectedClient || orderItems.length === 0}
            className={`btn btn-primary ${(!selectedClient || orderItems.length === 0) ? 'disabled' : ''}`}
          >
            <span>📦</span>
            <span>Submit Order</span>
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Client Orders</h2>
        </div>
        
        {/* Add search bar here */}
        <div className="mb-4 px-6">
          <input
            type="text"
            placeholder="Search by client name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors duration-150">
                <td className="px-6 py-4">{order.id}</td>
                <td className="px-6 py-4">{`${order.first_name} ${order.last_name}`}</td>
                <td className="px-6 py-4">{order.total_amount}dt</td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
          
                  </select>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleViewOrder(order)}
                      className="icon"
                      title="View Order Details"
                    >
                      <FaEye size={20} style={{ color: '#4B5563', marginRight:'20px' }} />
                    </button>
                    <button
                      onClick={() => handleEditOrder(order)}
                      className="icon"
                      title="Edit Order"
                    >
                      <FaEdit size={20} style={{ color: '#2563eb', marginRight:'15px' }} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this order?')) {
                          handleDeleteOrder(order.id);
                        }
                      }}
                      className="icon"
                      title="Delete Order"
                    >
                      <FaTrash size={20} style={{ color: '#dc2626', marginLeft:'10px' }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add the Edit Modal component to your JSX, just before the closing div of client-order-container */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="text-xl font-bold mb-4">Edit Order</h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <div className="modal-body">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client
                </label>
                <select
                  value={editedClientId}
                  onChange={(e) => setEditedClientId(e.target.value)}
                  className="form-select w-full"
                >
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>
                      {`${client.first_name} ${client.last_name}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Items
                </label>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2">Product</th>
                      <th className="px-4 py-2">Quantity</th>
                      <th className="px-4 py-2">Price</th>
                      <th className="px-4 py-2" >Total</th>
                      <th className="px-4 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editedItems.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <select
                            value={item.productId}
                            onChange={(e) => handleEditedProductChange(index, e.target.value)}
                            className="form-select w-full"
                          >
                            {products.map(product => (
                              <option key={product.id} value={product.id}>
                                {`${product.name} - ${parseFloat(product.price).toFixed(2)}dt`}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleEditedItemQuantityChange(index, e.target.value)}
                            className="form-input w-20"
                          />
                        </td>
                        <td className="px-4 py-2">{parseFloat(item.price).toFixed(2)}dt</td>
                        <td className="px-4 py-2">{parseFloat(item.total).toFixed(2)}dt</td>
                        <td className="px-4 py-2">
                          <button
                            onClick={() => handleRemoveEditedItem(index)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Remove Item"
                          >
                            <FaTrash size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan="3" className="px-4 py-2 text-right font-bold">
                        Total Order Amount:
                      </td>
                      <td className="px-4 py-2 font-bold text-blue-600">
                        {parseFloat(editedItems.reduce((sum, item) => sum + (item.total || 0), 0)).toFixed(2)}dt
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            
              <div className="mt-4">
                <button
                  onClick={handleAddEditedProduct}
                  className="btn btn-secondary"
                >
                  <span>🛒</span>
                  <span>Add Product</span>
                </button>
              </div>
            </div>

            <div className="modal-footer flex justify-end gap-4 mt-6 pt-4 border-t">
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="btn btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add the View Modal component just before the closing div of client-order-container */}
      {isViewModalOpen && viewingOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="text-xl font-bold mb-4">Order Details</h2>
              
            </div>
            
            <div className="modal-body">
              {/* Order Information */}
              <div className="info-grid mb-6">
                <div className="info-row">
                  <span className="info-label">Order ID:</span>
                  <span className="info-value">#{viewingOrder.id}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Client Name:</span>
                  <span className="info-value">
                    {`${viewingOrder.first_name} ${viewingOrder.last_name}`}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Order Date:</span>
                  <span className="info-value">
                    {new Date(viewingOrder.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="info-row">
                  <span className="info-label">Status:</span>
                  <span className={`status-badge ${viewingOrder.status}`}>
                    {viewingOrder.status}
                  </span>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Unit Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td>{item.productName}</td>
                        <td>{item.quantity}</td>
                        <td>{parseFloat(item.price).toFixed(2)}dt</td>
                        <td>{parseFloat(item.total).toFixed(2)}dt</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="text-right font-bold">Total Order Amount:</td>
                      <td className="font-bold text-blue-600">
                        {parseFloat(viewingOrder.total_amount).toFixed(2)}dt
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="modal-footer flex justify-end gap-4 mt-6 pt-4 border-t">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientOrderManagement;