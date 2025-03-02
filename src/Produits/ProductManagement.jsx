import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductManagement.css';
import { FaImage } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    quantity: '',
    supplier: '',
    status: 'in-stock',
    image: null
  });
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingProduct, setViewingProduct] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const navigate = useNavigate();

  const categories = ['Electronics', 'Clothing', 'Food', 'Furniture', 'Other'];

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchProducts = () => {
    axios
      .get("http://localhost:8000/getproducts")
      .then((res) => setProducts(res.data))
      .catch((error) => {
        console.error("Error fetching products:", error);
        alert("Error fetching products. Please try again.");
      });
  };

  const fetchSuppliers = () => {
    axios
      .get("http://localhost:8000/getsuppliers")
      .then((res) => setSuppliers(res.data))
      .catch((error) => {
        console.error("Error fetching suppliers:", error);
        alert("Error fetching suppliers. Please try again.");
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingProduct) {
      updateProduct();
    } else {
      addProduct();
    }
  };

  const addProduct = () => {
    axios
      .post("http://localhost:8000/saveproducts", newProduct)
      .then((res) => {
        setProducts([...products, res.data]);
        setNewProduct({
          name: '',
          description: '',
          price: '',
          category: '',
          quantity: '',
          supplier: '',
          status: 'in-stock',
          image: null
        });
        setShowForm(false);
      })
      .catch((error) => {
        console.error("Error adding product:", error);
        alert("Error adding product. Please try again.");
      });
  };

  const updateProduct = () => {
    axios
      .put(`http://localhost:8000/updateproducts/${editingProduct._id}`, editingProduct)
      .then((res) => {
        setProducts(products.map((product) => 
          product._id === res.data._id ? res.data : product
        ));
        setEditingProduct(null);
        setShowForm(false);
      })
      .catch((error) => {
        console.error("Error updating product:", error);
        alert("Error updating product. Please try again.");
      });
  };

  const deleteProduct = (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      axios
        .delete(`http://localhost:8000/deleteproducts/${id}`)
        .then(() => {
          setProducts(products.filter((product) => product._id !== id));
        })
        .catch((error) => {
          console.error("Error deleting product:", error);
          alert("Error deleting product. Please try again.");
        });
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleViewDetails = (product) => {
    setViewingProduct(product);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="product-management">
      <h1>Products Management</h1>
      <div className="top-controls">
        <input 
          type="text" 
          placeholder="Search products..." 
          className="input-search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="add-product-btn" onClick={() => setShowForm(true)}>
          + Add Product
        </button>
      </div>

      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowForm(false);
                  setEditingProduct(null);
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editingProduct ? editingProduct.name : newProduct.name}
                  onChange={(e) =>
                    editingProduct
                      ? setEditingProduct({ ...editingProduct, name: e.target.value })
                      : setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={editingProduct ? editingProduct.description : newProduct.description}
                  onChange={(e) =>
                    editingProduct
                      ? setEditingProduct({ ...editingProduct, description: e.target.value })
                      : setNewProduct({ ...newProduct, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  value={editingProduct ? editingProduct.price : newProduct.price}
                  onChange={(e) =>
                    editingProduct
                      ? setEditingProduct({ ...editingProduct, price: e.target.value })
                      : setNewProduct({ ...newProduct, price: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={editingProduct ? editingProduct.category : newProduct.category}
                  onChange={(e) =>
                    editingProduct
                      ? setEditingProduct({ ...editingProduct, category: e.target.value })
                      : setNewProduct({ ...newProduct, category: e.target.value })
                  }
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  value={editingProduct ? editingProduct.quantity : newProduct.quantity}
                  onChange={(e) =>
                    editingProduct
                      ? setEditingProduct({ ...editingProduct, quantity: e.target.value })
                      : setNewProduct({ ...newProduct, quantity: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Supplier</label>
                <div className="supplier-select">
                  <select
                    value={editingProduct ? editingProduct.supplier : newProduct.supplier}
                    onChange={(e) =>
                      editingProduct
                        ? setEditingProduct({ ...editingProduct, supplier: e.target.value })
                        : setNewProduct({ ...newProduct, supplier: e.target.value })
                    }
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier._id} value={supplier.name}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="add-supplier-btn"
                    onClick={() => navigate('/SupplierManagement')}
                  >
                    + Add Supplier
                  </button>
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingProduct ? editingProduct.status : newProduct.status}
                  onChange={(e) =>
                    editingProduct
                      ? setEditingProduct({ ...editingProduct, status: e.target.value })
                      : setNewProduct({ ...newProduct, status: e.target.value })
                  }
                >
                  <option value="in-stock">In Stock</option>
                  <option value="out-of-stock">Out of Stock</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
              <div className="form-group">
                <label>Product Image</label>
                <div className="image-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        editingProduct
                          ? setEditingProduct({ ...editingProduct, image: reader.result })
                          : setNewProduct({ ...newProduct, image: reader.result });
                      };
                      if (file) {
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {(editingProduct?.image || newProduct.image) && (
                    <img
                      src={editingProduct ? editingProduct.image : newProduct.image}
                      alt="Product preview"
                      className="image-preview"
                    />
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="submit-btn">
                  {editingProduct ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingProduct(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingProduct && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Product Details</h2>
              <button 
                className="close-btn" 
                onClick={() => setViewingProduct(null)}
              >
                ×
              </button>
            </div>
            <div className="product-details">
              <div className="detail-row">
                <strong>Name:</strong>
                <span>{viewingProduct.name}</span>
              </div>
              <div className="detail-row">
                <strong>Description:</strong>
                <span>{viewingProduct.description}</span>
              </div>
              <div className="detail-row">
                <strong>Price:</strong>
                <span>${viewingProduct.price}</span>
              </div>
              <div className="detail-row">
                <strong>Category:</strong>
                <span>{viewingProduct.category}</span>
              </div>
              <div className="detail-row">
                <strong>Quantity:</strong>
                <span>{viewingProduct.quantity}</span>
              </div>
              <div className="detail-row">
                <strong>Supplier:</strong>
                <span>{viewingProduct.supplier}</span>
              </div>
              <div className="detail-row">
                <strong>Status:</strong>
                <span className={`status-badge ${viewingProduct.status}`}>
                  {viewingProduct.status}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setViewingProduct(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product._id} className="product-card">
            <div className="product-image">
              {product.image ? (
                <img src={product.image} alt={product.name} />
              ) : (
                <FaImage className="no-image" />
              )}
            </div>
            <div className="product-content">
              <h3 className="product-name">{product.name}</h3>
              <div className="product-details">
                <span className="product-price">${product.price}</span>
                <span className="product-quantity">Stock: {product.quantity}</span>
              </div>
              <span className={`product-status ${product.status}`}>
                {product.status}
              </span>
            </div>
            <div className="product-actions">
              <button onClick={() => handleViewDetails(product)} className="view-btn">
                View
              </button>
              <button onClick={() => handleEdit(product)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => deleteProduct(product._id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductManagement;