import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ProductManagement.css';
import { FaImage, FaBox, FaFileAlt, FaDollarSign, FaTag, FaTruck, FaCircle,FaBoxes } from 'react-icons/fa';
import { FaEye, FaTrash, FaPencilAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    supplier: '',
    status: 'in-stock',
    image: null
  });
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingProduct, setViewingProduct] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  const categories = ['Electronics', 'Clothing', 'Food', 'Furniture', 'Other'];

  useEffect(() => {
    fetchProducts();
    fetchSuppliers();
  }, []);

  const fetchProducts = () => {
    axios
      .get('http://localhost:5000/getproducts', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then((res) => {
        console.log('Products data:', res.data);
        setProducts(res.data || []);
      })
      .catch((error) => {
        console.error('Error fetching products:', error.response?.data || error.message);
        setProducts([]);
        alert(error.response?.data?.message || 'Error fetching products. Please try again.');
      });
  };

  const fetchSuppliers = () => {
    axios
      .get('http://localhost:5000/getsuppliers', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      })
      .then((res) => setSuppliers(res.data))
      .catch((error) => {
        console.error('Error fetching suppliers:', error);
        alert('Error fetching suppliers. Please try again.');
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

  const addProduct = async () => {
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('description', newProduct.description);
    formData.append('price', newProduct.price);
    formData.append('category', newProduct.category);
    formData.append('supplier', newProduct.supplier);
    formData.append('status', newProduct.status);
    if (newProduct.image) {
      formData.append('image', newProduct.image);
    }

    try {
      const res = await axios.post('http://localhost:5000/saveproducts', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setProducts([...products, res.data]);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        supplier: '',
        status: 'in-stock',
        image: null
      });
      setImagePreview(null);
      setShowForm(false);
      alert('Product added successfully! You can now manage its stock.');
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Error adding product. Please try again.');
    }
  };

  const updateProduct = () => {
    const formData = new FormData();
    Object.keys(editingProduct).forEach((key) => {
      if (key === 'image') {
        if (editingProduct[key] instanceof File) {
          formData.append('image', editingProduct[key]);
        }
      } else if (key !== '_id' && key !== '__v') {
        formData.append(key, editingProduct[key]);
      }
    });

    axios
      .put(`http://localhost:5000/updateproducts/${editingProduct.id}`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then((res) => {
        setProducts(products.map((prod) => (prod.id === editingProduct.id ? res.data : prod)));
        setEditingProduct(null);
        setImagePreview(null);
        setShowForm(false);
      })
      .catch((error) => {
        console.error('Error updating product:', error);
        alert(error.response?.data?.message || 'Error updating product. Please try again.');
      });
  };

  const deleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      axios
        .delete(`http://localhost:5000/deleteproducts/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
        .then(() => {
          setProducts(products.filter((product) => product.id !== id));
        })
        .catch((error) => {
          console.error('Error deleting product:', error);
          alert('Error deleting product. Please try again.');
        });
    }
  };

  const handleEdit = (product) => {
    setEditingProduct({
      ...product,
      image: product.image
    });
    setImagePreview(product.image);
    setShowForm(true);
  };

  const handleViewDetails = (product) => {
    setViewingProduct(product);
  };

   const [filteredProducts , setFilteredProducts] = useState(products);
  useEffect(() => { 
    console.log('Search query:', filteredProducts);
    setFilteredProducts(
      products.filter((product) =>   
        (product.name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
      )
    );  
  }, [products, searchQuery]);



  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const imageUrl = URL.createObjectURL(file);
        setImagePreview(imageUrl);
        if (editingProduct) {
          setEditingProduct({
            ...editingProduct,
            image: file,
            imagePreview: imageUrl
          });
        } else {
          setNewProduct({
            ...newProduct,
            image: file,
            imagePreview: imageUrl
          });
        }
      } else {
        alert('Please select an image file');
      }
    }
  };

  return (
    <div className="product-management">
      <h1>Products Management</h1>
      <div className="top-controls">
        <input
          type="text"
          placeholder="Search products..."
          className="search"
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
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
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
            <form onSubmit={handleSubmit} encType="multipart/form-data">
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
                      <option key={supplier.id} value={supplier.name}>
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
                    onChange={handleImageChange}
                    className="file-input"
                  />
                  {(imagePreview || (editingProduct && editingProduct.image)) && (
                    <img
                      src={imagePreview || editingProduct.image}
                      alt="Product preview"
                      className="image-preview"
                    />
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="submit" className="submit-btn">
                  {editingProduct ? 'Update' : 'Add'}
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
              <button className="close-btn" onClick={() => setViewingProduct(null)}>
                ×
              </button>
            </div>
            <div className="product-details-container">
              {viewingProduct.image && (
                <div className="product-detail-image">
                  <img src={viewingProduct.image} alt={viewingProduct.name} />
                </div>
              )}
              <div className="product-info-grid">
                <div className="detail-card">
                  <div className="detail-icon">
                    <FaBox />
                  </div>
                  <div className="detail-content">
                    <label>Name</label>
                    <span>{viewingProduct.name}</span>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon">
                    <FaFileAlt />
                  </div>
                  <div className="detail-content">
                    <label>Description</label>
                    <span>{viewingProduct.description}</span>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon">
                    <FaDollarSign />
                  </div>
                  <div className="detail-content">
                    <label>Price</label>
                    <span>Dt{parseFloat(viewingProduct.price).toFixed(2)}</span>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon">
                    <FaTag />
                  </div>
                  <div className="detail-content">
                    <label>Category</label>
                    <span>{viewingProduct.category}</span>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon">
                    <FaBoxes />
                  </div>
                  <div className="detail-content">
                    <label>Quantity</label>
                    <span>{viewingProduct.total_quantity || 0}</span>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon">
                    <FaTruck />
                  </div>
                  <div className="detail-content">
                    <label>Supplier</label>
                    <span>{viewingProduct.supplier}</span>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon">
                    <FaCircle />
                  </div>
                  <div className="detail-content">
                    <label>Status</label>
                    <span className={`status-badge ${viewingProduct.status}`}>
                      {viewingProduct.status}
                    </span>
                  </div>
                </div>
                <div className="detail-card">
                  <div className="detail-icon">
                    <FaBoxes />
                  </div>
                  <div className="detail-content">
                    <label>Product ID</label>
                    <span>{viewingProduct.id}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="close-btn"
                onClick={() => setViewingProduct(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <p>No products found.</p>
        ) : (
          filteredProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image">
                {product.image ? (
                  <img
                    src={`http://localhost:5000${product.image}`}
                    alt={product.name}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/placeholder.png';
                    }}
                  />
                ) : (
                  <FaImage className="no-image" />
                )}
              </div>
              <div className="product-content">
                <h3 className="product-name">{product.name}</h3>
                <div className="product-details">
                  <span className="product-price">dt {parseFloat(product.price).toFixed(2)}</span>
                  <span className="product-quantity">Stock: {product.total_quantity || 0}</span>
                </div>
                <span className="product-id">ID: {product.id}</span> {/* Display the ID */}
                <span className={`product-status ${product.status}`}>{product.status}</span>
              </div>
              <div className="product-actions">
                <FaEye 
                  onClick={() => handleViewDetails(product)} 
                  className="action-icon" 
                  title="View Details"
                />
                <FaPencilAlt 
                  onClick={() => handleEdit(product)} 
                  className="action-icon" 
                  title="Edit Product"
                />
                <FaTrash 
                  onClick={() => deleteProduct(product.id)} 
                  className="action-icon"
                  title="Delete Product"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ProductManagement;



