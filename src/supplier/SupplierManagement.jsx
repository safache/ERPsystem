import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SupplierManagement.css';
import { MdCircle } from 'react-icons/md';
import { FaBuilding, FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTag } from 'react-icons/fa';
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
    axios.get("http://localhost:8000/getsuppliers")
      .then((res) => setSuppliers(res.data))
      .catch((error) => {
        console.error("Error fetching suppliers:", error);
        alert("Error fetching suppliers. Please try again.");
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingSupplier) {
      updateSupplier();
    } else {
      addSupplier();
    }
  };

  const addSupplier = () => {
    axios
      .post("http://localhost:8000/savesuppliers", newSupplier)
      .then((res) => {
        setSuppliers([...suppliers, res.data]);
        setNewSupplier({
          name: '',
          email: '',
          phone: '',
          address: '',
          company: '',
          category: '',
          status: 'active',
          image: null
        });
        setShowForm(false);
      })
      .catch((error) => {
        console.error("Error adding supplier:", error);
        alert(error.response?.data?.message || "Error adding supplier. Please try again.");
      });
  };

  const updateSupplier = () => {
    axios
      .put(`http://localhost:8000/updatesuppliers/${editingSupplier._id}`, editingSupplier)
      .then((res) => {
        setSuppliers(suppliers.map((supplier) => 
          supplier._id === res.data._id ? res.data : supplier
        ));
        setEditingSupplier(null);
        setShowForm(false);
      })
      .catch((error) => {
        console.error("Error updating supplier:", error);
        alert(error.response?.data?.message || "Error updating supplier. Please try again.");
      });
  };

  const deleteSupplier = (id) => {
    if (window.confirm("Are you sure you want to delete this supplier?")) {
      axios
        .delete(`http://localhost:8000/deletesuppliers/${id}`)
        .then(() => {
          setSuppliers(suppliers.filter((supplier) => supplier._id !== id));
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

  const filteredSuppliers = suppliers.filter(supplier => 
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplier.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={editingSupplier ? editingSupplier.company : newSupplier.company}
                  onChange={(e) =>
                    editingSupplier
                      ? setEditingSupplier({ ...editingSupplier, company: e.target.value })
                      : setNewSupplier({ ...newSupplier, company: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Contact Name</label>
                <input
                  type="text"
                  value={editingSupplier ? editingSupplier.name : newSupplier.name}
                  onChange={(e) =>
                    editingSupplier
                      ? setEditingSupplier({ ...editingSupplier, name: e.target.value })
                      : setNewSupplier({ ...newSupplier, name: e.target.value })
                  }
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
                  value={editingSupplier ? editingSupplier.phone : newSupplier.phone}
                  onChange={(e) =>
                    editingSupplier
                      ? setEditingSupplier({ ...editingSupplier, phone: e.target.value })
                      : setNewSupplier({ ...newSupplier, phone: e.target.value })
                  }
                  required
                />
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
                    onChange={(e) => {
                      const file = e.target.files[0];
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        editingSupplier
                          ? setEditingSupplier({ ...editingSupplier, image: reader.result })
                          : setNewSupplier({ ...newSupplier, image: reader.result });
                      };
                      if (file) {
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  {(editingSupplier?.image || newSupplier.image) && (
                    <img
                      src={editingSupplier ? editingSupplier.image : newSupplier.image}
                      alt="Preview"
                      className="image-preview"
                    />
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingSupplier ? editingSupplier.status : newSupplier.status}
                  onChange={(e) =>
                    editingSupplier
                      ? setEditingSupplier({ ...editingSupplier, status: e.target.value })
                      : setNewSupplier({ ...newSupplier, status: e.target.value })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
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
              <div className="detail-row">
                <strong>Status:</strong>
                <span className={`status-badge ${viewingSupplier.status}`}>
                  {viewingSupplier.status}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setViewingSupplier(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="suppliers-grid">
        {filteredSuppliers.map((supplier) => (
          <div key={supplier._id} className="supplier-card">
            <div className="supplier-header">
              <div className="supplier-avatar">
                <FaBuilding className="avatar-icon" />
              </div>
              <h3>{supplier.company}</h3>
              <span className={`supplier-status ${supplier.status}`}>
                <MdCircle className="status-icon" />
                {supplier.status}
              </span>
            </div>
            <div className="supplier-body">
              <div className="info-row">
                <FaUser className="info-icon" />
                <span>{supplier.name}</span>
              </div>
              <div className="info-row">
                <FaEnvelope className="info-icon" />
                <span>{supplier.email}</span>
              </div>
              <div className="info-row">
                <FaPhone className="info-icon" />
                <span>{supplier.phone}</span>
              </div>
              <div className="info-row">
                <FaTag className="info-icon" />
                <span>{supplier.category}</span>
              </div>
              <div className="info-row">
                <FaMapMarkerAlt className="info-icon" />
                <span>{supplier.address}</span>
              </div>
            </div>
            <div className="supplier-actions">
              <button onClick={() => handleViewDetails(supplier)} className="view-btn">
                View
              </button>
              <button onClick={() => handleEdit(supplier)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => deleteSupplier(supplier._id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupplierManagement;