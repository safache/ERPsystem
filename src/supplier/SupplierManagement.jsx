import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SupplierManagement.css';
import { FaBuilding ,FaEye ,FaPencilAlt,FaTrash} from 'react-icons/fa';

const validatePhone = (phone) => {
  const phoneRegex = /^\d{8}$/;
  return phoneRegex.test(phone);
};

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    category: '',
    status: 'active',
    image: null
  });
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingSupplier, setViewingSupplier] = useState(null);

  const categories = ['Electronics', 'Clothing', 'Food', 'Furniture', 'Other'];

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = () => {
    axios
      .get("http://localhost:5000/getsuppliers")
      .then((res) => {
        console.log("Suppliers data from backend:", res.data);
        const normalizedSuppliers = Array.isArray(res.data) ? res.data.map(supplier => ({
          ...supplier,
          name: supplier.name || 'Unknown Supplier',
          company: supplier.company || 'Unknown Company'
        })) : [];
        setSuppliers(normalizedSuppliers);
      })
      .catch((error) => {
        console.error("Error fetching suppliers:", error.response?.data || error.message);
        setSuppliers([]); // Définir un tableau vide en cas d’erreur
        alert(error.response?.data?.message || "Error fetching suppliers. Please try again.");
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Get values from either editing or new supplier
    const supplierData = editingSupplier || newSupplier;
    const name = supplierData.name?.trim();
    const company = supplierData.company?.trim();
    const phone = supplierData.phone;
  
    // Clear previous validation messages
    const errors = [];
  
    // Validate fields
    if (!name) {
      errors.push("Contact name is required");
    }
    if (!company) {
      errors.push("Company name is required");
    }
    if (!validatePhone(phone)) {
      errors.push("Phone number must be exactly 8 digits");
    }
  
    // If there are errors, show them and stop submission
    if (errors.length > 0) {
      alert(errors.join("\n"));
      return;
    }
  
    // Proceed with update or add
    if (editingSupplier) {
      updateSupplier();
    } else {
      addSupplier();
    }
  };

  const addSupplier = () => {
    const formData = new FormData();
    if (newSupplier.image instanceof File) {
      formData.append('image', newSupplier.image);
    }

    axios
      .post("http://localhost:5000/savesuppliers", newSupplier, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        setSuppliers([...suppliers, res.data]);
        
        setShowForm(false);
      })
      .catch((error) => {
        console.error("Error adding supplier:", error);
        alert(error.response?.data?.message || "Error adding supplier. Please try again.");
      });
  };

  const updateSupplier = () => {
    console.log("Editing supplier:", editingSupplier);
    if (!editingSupplier || !editingSupplier.id) {
      alert("Invalid supplier ID. Please try again.");
      return;
    }

    const formData = new FormData();
    formData.append('name', editingSupplier.name || 'Unknown Supplier');
    formData.append('email', editingSupplier.email || '');
    formData.append('phone', editingSupplier.phone || '');
    formData.append('address', editingSupplier.address || '');
    formData.append('company', editingSupplier.company || 'Unknown Company');
    formData.append('category', editingSupplier.category || '');
    formData.append('status', editingSupplier.status || 'active');
    if (editingSupplier.image instanceof File) {
      formData.append('image', editingSupplier.image);
    } else if (typeof editingSupplier.image === 'string') {
      formData.append('image', editingSupplier.image || null);
    }

    axios
      .put(`http://localhost:5000/updatesuppliers/${editingSupplier.id}`, formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        setSuppliers(suppliers.map((supplier) => 
          supplier.id === res.data.id ? res.data : supplier
        ));
        setEditingSupplier(null);
        setShowForm(false);
      })
      .catch((error) => {
        console.error("Error updating supplier:", error.response?.data || error.message);
        alert(error.response?.data?.message || "Error updating supplier. Please try again.");
      });
  };

  const deleteSupplier = (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      axios
        .delete(`http://localhost:5000/deletesuppliers/${id}`)
        .then(() => {
          setSuppliers(suppliers.filter((supplier) => supplier.id !== id));
        })
        .catch((error) => {
          console.error("Error deleting supplier:", error);
          alert(error.response?.data?.message || "Error deleting supplier. Please try again.");
        });
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleViewDetails = (supplier) => {
    setViewingSupplier(supplier);
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const name = supplier?.name?.toLowerCase() || '';
    const company = supplier?.company?.toLowerCase() || '';
    return (
      name.includes(searchQuery.toLowerCase()) ||
      company.includes(searchQuery.toLowerCase())
    );
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        editingSupplier
          ? setEditingSupplier({ ...editingSupplier, image: file })
          : setNewSupplier({ ...newSupplier, image: file });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="supplier-management">
      <h1>Suppliers Management</h1>
      <div className="top-controls">
        <input 
          type="text" 
          placeholder="Search suppliers..." 
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="add-supplier-btn" onClick={() => setShowForm(true)}>
          + Add Supplier
        </button>
      </div>

      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</h2>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowForm(false);
                  setEditingSupplier(null);
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <div className="form-group">
                <label>Company Name*</label>
                <input
                  type="text"
                  value={editingSupplier ? editingSupplier.company || '' : newSupplier.company || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (editingSupplier) {
                      setEditingSupplier({
                        ...editingSupplier,
                        company: value
                      });
                    } else {
                      setNewSupplier({
                        ...newSupplier,
                        company: value
                      });
                    }
                  }}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Name*</label>
                <input
                  type="text"
                  value={editingSupplier ? editingSupplier.name || '' : newSupplier.name || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (editingSupplier) {
                      setEditingSupplier({
                        ...editingSupplier,
                        name: value
                      });
                    } else {
                      setNewSupplier({
                        ...newSupplier,
                        name: value
                      });
                    }
                  }}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editingSupplier ? editingSupplier.email : newSupplier.email}
                  onChange={(e) =>
                    editingSupplier
                      ? setEditingSupplier({ ...editingSupplier, email: e.target.value })
                      : setNewSupplier({ ...newSupplier, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  pattern="[0-9]{8}"
                  value={editingSupplier ? editingSupplier.phone : newSupplier.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                    editingSupplier
                      ? setEditingSupplier({ ...editingSupplier, phone: value })
                      : setNewSupplier({ ...newSupplier, phone: value })
                  }}
                  required
                  placeholder="Enter 8 digits"
                />
                <small className="form-text">Phone number must be 8 digits</small>
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={editingSupplier ? editingSupplier.category : newSupplier.category}
                  onChange={(e) =>
                    editingSupplier
                      ? setEditingSupplier({ ...editingSupplier, category: e.target.value })
                      : setNewSupplier({ ...newSupplier, category: e.target.value })
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
                <label>Address</label>
                <textarea
                  value={editingSupplier ? editingSupplier.address : newSupplier.address}
                  onChange={(e) =>
                    editingSupplier
                      ? setEditingSupplier({ ...editingSupplier, address: e.target.value })
                      : setNewSupplier({ ...newSupplier, address: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Logo/Image</label>
                <div className="image-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {(editingSupplier?.image instanceof File || newSupplier.image instanceof File) && (
                    <img
                      src={editingSupplier?.image ? URL.createObjectURL(editingSupplier.image) : newSupplier.image ? URL.createObjectURL(newSupplier.image) : ''}
                      alt="Preview"
                      className="image-preview"
                    />
                  )}
                </div>
              </div>
            
              <div className="modal-footer">
                <button type="submit" className="submit-btn">
                  {editingSupplier ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingSupplier(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingSupplier && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Supplier Details</h2>
              <button 
                className="close-btn" 
                onClick={() => setViewingSupplier(null)}
              >
                ×
              </button>
            </div>
            <div className="supplier-details">
              {viewingSupplier.image && (
                <div className="supplier-logo">
                  <img src={viewingSupplier.image} alt={viewingSupplier.company} />
                </div>
              )}
              <div className="detail-row">
                <strong>Company:</strong>
                <span>{viewingSupplier.company}</span>
              </div>
              <div className="detail-row">
                <strong>Contact Name:</strong>
                <span>{viewingSupplier.name}</span>
              </div>
              <div className="detail-row">
                <strong>Email:</strong>
                <span>{viewingSupplier.email}</span>
              </div>
              <div className="detail-row">
                <strong>Phone:</strong>
                <span>{viewingSupplier.phone}</span>
              </div>
              <div className="detail-row">
                <strong>Category:</strong>
                <span>{viewingSupplier.category}</span>
              </div>
              <div className="detail-row">
                <strong>Address:</strong>
                <span>{viewingSupplier.address}</span>
              </div>
             
            </div>
            
          </div>
        </div>
      )}

      <div className="table-container">
        <table className="suppliers-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Category</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-data">No suppliers found.</td>
              </tr>
            ) : (
              filteredSuppliers.map((supplier) => (
                <tr key={supplier.id}>
                  <td className="company-cell">
                    <div className="company-info">
                      {supplier.image ? (
                        <img src={supplier.image} alt={supplier.company} className="company-logo" />
                      ) : (
                        <FaBuilding className="default-logo" />
                      )}
                      <span>{supplier.company}</span>
                    </div>
                  </td>
                  <td>{supplier.name}</td>
                  <td>{supplier.email}</td>
                  <td>{supplier.phone}</td>
                  <td>{supplier.category}</td>
                  <td>{supplier.address}</td>
                 
                  <td>
                    <div className="action-buttons">
                      <FaEye 
                        onClick={() => handleViewDetails(supplier)} 
                        className="action-icon" 
                        title="View Details"
                      />
                      <FaPencilAlt 
                        onClick={() => handleEdit(supplier)} 
                        className="action-icon" 
                        title="Edit Supplier"
                      />
                      <FaTrash 
                        onClick={() => deleteSupplier(supplier.id)} 
                        className="action-icon" 
                        title="Delete Supplier"
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SupplierManagement;