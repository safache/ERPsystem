import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './OrderManagement.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaPlus, FaEye, FaEdit, FaTrash, FaDownload } from 'react-icons/fa';
import Select from 'react-select';import html2pdf from 'html2pdf.js';
const PurchaseOrderManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingOrder, setViewingOrder] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [editedItems, setEditedItems] = useState([]);
  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
    fetchPurchaseOrders();
  }, []);

  const fetchSuppliers = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/getsuppliers', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setSuppliers(response.data);
  };

  const fetchProducts = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/getproducts', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setProducts(response.data);
  };

  const fetchPurchaseOrders = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:5000/purchase-orders', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setPurchaseOrders(response.data);
  };

  const handleAddToOrder = (productId, quantity) => {
    const existingItem = orderItems.find(item => item.productId === productId);
    if (existingItem) {
      setOrderItems(orderItems.map(item =>
        item.productId === productId ? { ...item, quantity: parseInt(quantity) || 1 } : item
      ));
    } else {
      setOrderItems([...orderItems, { productId, quantity: parseInt(quantity) || 1 }]);
    }
  };

  const handleRemoveFromOrder = (productId) => {
    setOrderItems(orderItems.filter(item => item.productId !== productId));
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found. Please log in.');

      if (!selectedSupplier || orderItems.length === 0) {
        throw new Error('Please select a supplier and at least one product.');
      }

      const products = orderItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const response = await axios.post(
        'http://localhost:5000/purchase-orders',
        { supplierId: selectedSupplier, products },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 201) {
        // Reset form
        setSelectedSupplier('');
        setOrderItems([]);
        // Reset input fields
        const inputs = document.querySelectorAll('input[type="number"]');
        inputs.forEach(input => input.value = '');
        // Show success message
        toast.success('Purchase order placed successfully!');
        // Refresh orders list
        fetchPurchaseOrders();
      } else {
        throw new Error('Unexpected response status: ' + response.status);
      }
    } catch (error) {
      console.error('Error placing purchase order:', error);
      toast.error(error.message || 'Failed to place purchase order');
    } finally {
      setLoading(false);
    }
  };
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/purchase-orders/${orderId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` }
      });

      if (response.status === 200) {
        toast.success('Purchase order status updated successfully!', {
          position: 'top-right',
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: '✅'
        });
        fetchPurchaseOrders();
      } else {
        throw new Error('Unexpected response status: ' + response.status);
      }
    } catch (error) {
      console.error('Error updating purchase order status:', error);
      toast.error(error.message || 'Failed to update purchase order status', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        icon: '⚠️'
      });
    }
  };


  // Add after other handler functions
const handleViewOrder = async (order) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:5000/purchase-orders/${order.id}/items`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    setViewingOrder({
      ...order,
      items: response.data.map(item => ({
        productName: item.product_name,
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
        total: parseFloat(item.price * item.quantity)
      }))
    });
    setIsViewModalOpen(true);
  } catch (error) {
    toast.error('Failed to fetch order details');
  }
};

const handleEditOrder = async (order) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`http://localhost:5000/purchase-orders/${order.id}/items`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    setEditingOrder(order);
    setEditedItems(response.data.map(item => ({
      productId: item.product_id,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity
    })));
    setIsEditModalOpen(true);
  } catch (error) {
    toast.error('Failed to fetch order details');
  }
};
const handleSaveEdit = async () => {
  try {
    const token = localStorage.getItem('token');
    await axios.put(
      `http://localhost:5000/purchase-orders/${editingOrder.id}`,
      {
        supplierId: editingOrder.supplier_id,
        items: editedItems.map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity)
        })),
        totalAmount: editedItems.reduce((sum, item) => sum + (item.total || 0), 0)
      },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    toast.success('Order updated successfully');
    setIsEditModalOpen(false);
    fetchPurchaseOrders();
  } catch (error) {
    console.error('Error updating order:', error);
    toast.error('Failed to update order');
  }
};
const handleDeleteOrder = async (orderId) => {
  if (window.confirm('Are you sure you want to delete this order?')) {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/purchase-orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order deleted successfully');
      fetchPurchaseOrders();
    } catch (error) {
      toast.error('Failed to delete order');
    }
  }
};

  // Add this before the return statement
  const filteredOrders = purchaseOrders.filter(order =>
    order.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="order-management">
      <ToastContainer />
      <h2 className='manage'>Manage Purchase Orders</h2>
      <div className="order-layout">
        <div className="order-form-section">
          <form onSubmit={handleSubmitOrder}>
            <div className="form-group">
              <label>Select Supplier:</label>
              <div className="select-with-action">
                <Select
                  value={suppliers.find(s => s.id === selectedSupplier) ? {
                    value: selectedSupplier,
                    label: `${suppliers.find(s => s.id === selectedSupplier)?.name} (${suppliers.find(s => s.id === selectedSupplier)?.email})`
                  } : null}
                  onChange={(option) => setSelectedSupplier(option ? option.value : '')}
                  options={suppliers.map(supplier => ({
                    value: supplier.id,
                    label: `${supplier.name} (${supplier.email})`
                  }))}
                  className="supplier-select"
                  classNamePrefix="select"
                  isClearable
                  isSearchable
                  placeholder="Search or select a supplier..."
                  noOptionsMessage={() => "No suppliers found"}
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
                <a href="./SupplierManagement" className="add-supplier-link">
                  <FaPlus /> Add New Supplier
                </a>
              </div>
            </div>
            <div className="form-group">
              <label>Select Products:</label>
              {products.map(product => {
  const isInOrder = orderItems.some(item => item.productId === product.id);
  return (
    <div key={product.id} className="product-item">
      <span>{product.name} - dt{product.price}</span>
      <input
        type="number"
        min="1"
        placeholder="Quantity"
        onChange={(e) => handleAddToOrder(product.id, e.target.value)}
        disabled={isInOrder}
      />
      {!isInOrder ? (
        <button
          type="button"
          onClick={() => handleAddToOrder(product.id, 1)}
          className="btn-add"
        >
          Add to Order
        </button>
      ) : (
        <button
          type="button"
          onClick={() => handleRemoveFromOrder(product.id)}
          className="btn-remove"
        >
          Remove
        </button>
      )}
    </div>
  );
})}
            </div>
            <div className="order-summary">
              <h3>Order Summary</h3>
              <ul>
                {orderItems.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  return (
                    <li key={item.productId}>
                      {product?.name} - Quantity: {item.quantity} - Subtotal: dt{(product?.price * item.quantity).toFixed(2)}
                    </li>
                  );
                })}
              </ul>
              <p>Total: dt{orderItems.reduce((sum, item) => {
                const product = products.find(p => p.id === item.productId);
                return sum + (product?.price * item.quantity || 0);
              }, 0).toFixed(2)}</p>
            </div>
            <button type="submit" disabled={loading || !selectedSupplier || orderItems.length === 0}>
              {loading ? 'Processing...' : 'Place Purchase Order'}
            </button>
          </form>
        </div>
        
        <div className="orders-section">
  <h3>Purchase Orders</h3>
  
  <div className="search-bar">
    <input
      type="text"
      placeholder="Search by supplier name..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="search-input"
    />
  </div>

  <div className="orders-table-container">
    <table className="orders-table">
      <thead>
        <tr>
          <th>Order #</th>
          <th>Supplier</th>
          <th>Date</th>
          <th>Items</th>
          <th>Total Amount</th>
          <th>Status</th>
          <th>Actions</th>

        </tr>
      </thead>
      <tbody>
        {filteredOrders.map(order => (
          <tr key={order.id}>
            <td>PO-{order.id}</td>
            <td>{order.supplier_name}</td>
            <td>{new Date(order.created_at).toLocaleDateString()}</td>
            <td>{order.items_count} items</td>
            <td>dt{Number(order.total_amount).toFixed(2)}</td>
            <td>
              <select
                value={order.status}
                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                className="status-select"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              
              </select>
            </td>
            <td>
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
                  onClick={() => handleDeleteOrder(order.id)}
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
</div>

      </div>
      {/* View Modal */}
{isViewModalOpen && viewingOrder && (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">
        <h2 className="text-xl font-bold mb-4">Purchase Order Details</h2>
      </div>
      
      <div className="modal-body">
        <div className="info-grid mb-6">
          <div className="info-row">
            <span className="info-label">Order ID:</span>
            <span className="info-value">PO-{viewingOrder.id}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Supplier:</span>
            <span className="info-value">{viewingOrder.supplier_name}</span>
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
                  <td>dt{item.price.toFixed(2)}</td>
                  <td>dt{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" className="text-right font-bold">Total Order Amount:</td>
                <td className="font-bold text-blue-600">
                  dt{Number(viewingOrder.total_amount).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="modal-footer">
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

{/* Edit Modal */}
{isEditModalOpen && (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">
        <h2 className="text-xl font-bold mb-4">Edit Purchase Order</h2>
      </div>
      
      <div className="modal-body">
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
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {editedItems.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    {products.find(p => p.id === item.productId)?.name}
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...editedItems];
                        newItems[index].quantity = parseInt(e.target.value);
                        newItems[index].total = newItems[index].price * parseInt(e.target.value);
                        setEditedItems(newItems);
                      }}
                      className="form-input w-20"
                    />
                  </td>
                  <td className="px-4 py-2">dt{parseFloat(item.price).toFixed(2)}</td>
                  <td className="px-4 py-2">dt{parseFloat(item.total).toFixed(2)}</td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => {
                        setEditedItems(editedItems.filter((_, i) => i !== index));
                      }}
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
                 dt{parseFloat(editedItems.reduce((sum, item) => sum + (item.total || 0), 0)).toFixed(2)}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
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
    </div>
  );
};

export default PurchaseOrderManagement;