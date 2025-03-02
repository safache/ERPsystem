import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ClientManagement.css';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaMapMarkerAlt } from 'react-icons/fa';
import { MdCircle } from 'react-icons/md';
const ClientManagement = () => {
  const [clients, setClients] = useState([]);
  const [editingClient, setEditingClient] = useState(null);
  const [newClient, setNewClient] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    company: '',
    status: 'active'
  });
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingClient, setViewingClient] = useState(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = () => {
    axios
      .get("http://localhost:8000/getclients")
      .then((res) => setClients(res.data))
      .catch((error) => {
        console.error("Error fetching clients:", error);
        alert(error.response?.data?.message || "Error fetching clients. Please try again.");
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingClient) {
      updateClient();
    } else {
      addClient();
    }
  };

  const addClient = () => {
    axios
      .post("http://localhost:8000/saveclients", newClient)
      .then((res) => {
        setClients([...clients, res.data]);
        setNewClient({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          company: '',
          status: 'active'
        });
        setShowForm(false);
      })
      .catch((error) => {
        console.error("Error adding client:", error);
        alert(error.response?.data?.message || "Error adding client. Please try again.");
      });
  };

  const updateClient = () => {
    axios
      .put(`http://localhost:8000/updateclients/${editingClient._id}`, editingClient)
      .then((res) => {
        setClients(clients.map((client) => 
          client._id === res.data._id ? res.data : client
        ));
        setEditingClient(null);
        setShowForm(false);
      })
      .catch((error) => {
        console.error("Error updating client:", error);
        alert(error.response?.data?.message || "Error updating client. Please try again.");
      });
  };

  const deleteClient = (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      axios
        .delete(`http://localhost:8000/deleteclients/${id}`)
        .then(() => {
          setClients(clients.filter((client) => client._id !== id));
        })
        .catch((error) => {
          console.error("Error deleting client:", error);
          alert(error.response?.data?.message || "Error deleting client. Please try again.");
        });
    }
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setShowForm(true);
  };

  const handleViewDetails = (client) => {
    setViewingClient(client);
  };

  const filteredClients = clients.filter(client => 
    client.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    client.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="client-management">
      <h1>Clients Management</h1>
      <div className="top-controls">
        <input 
          type="text" 
          placeholder="Search clients..." 
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="add-client-btn" onClick={() => setShowForm(true)}>
          + Add Client
        </button>
      </div>

      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingClient ? "Edit Client" : "Add New Client"}</h2>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowForm(false);
                  setEditingClient(null);
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  value={editingClient ? editingClient.firstName : newClient.firstName}
                  onChange={(e) =>
                    editingClient
                      ? setEditingClient({ ...editingClient, firstName: e.target.value })
                      : setNewClient({ ...newClient, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={editingClient ? editingClient.lastName : newClient.lastName}
                  onChange={(e) =>
                    editingClient
                      ? setEditingClient({ ...editingClient, lastName: e.target.value })
                      : setNewClient({ ...newClient, lastName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editingClient ? editingClient.email : newClient.email}
                  onChange={(e) =>
                    editingClient
                      ? setEditingClient({ ...editingClient, email: e.target.value })
                      : setNewClient({ ...newClient, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  value={editingClient ? editingClient.phone : newClient.phone}
                  onChange={(e) =>
                    editingClient
                      ? setEditingClient({ ...editingClient, phone: e.target.value })
                      : setNewClient({ ...newClient, phone: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  value={editingClient ? editingClient.company : newClient.company}
                  onChange={(e) =>
                    editingClient
                      ? setEditingClient({ ...editingClient, company: e.target.value })
                      : setNewClient({ ...newClient, company: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={editingClient ? editingClient.address : newClient.address}
                  onChange={(e) =>
                    editingClient
                      ? setEditingClient({ ...editingClient, address: e.target.value })
                      : setNewClient({ ...newClient, address: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={editingClient ? editingClient.status : newClient.status}
                  onChange={(e) =>
                    editingClient
                      ? setEditingClient({ ...editingClient, status: e.target.value })
                      : setNewClient({ ...newClient, status: e.target.value })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="submit" className="submit-btn">
                  {editingClient ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingClient(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingClient && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Client Details</h2>
              <button 
                className="close-btn" 
                onClick={() => setViewingClient(null)}
              >
                ×
              </button>
            </div>
            <div className="client-details">
              <div className="detail-row">
                <strong>Name:</strong>
                <span>{`${viewingClient.firstName} ${viewingClient.lastName}`}</span>
              </div>
              <div className="detail-row">
                <strong>Email:</strong>
                <span>{viewingClient.email}</span>
              </div>
              <div className="detail-row">
                <strong>Phone:</strong>
                <span>{viewingClient.phone}</span>
              </div>
              <div className="detail-row">
                <strong>Company:</strong>
                <span>{viewingClient.company}</span>
              </div>
              <div className="detail-row">
                <strong>Address:</strong>
                <span>{viewingClient.address}</span>
              </div>
              <div className="detail-row">
                <strong>Status:</strong>
                <span className={`status-badge ${viewingClient.status}`}>
                  {viewingClient.status}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setViewingClient(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="clients-grid">
        {filteredClients.map((client) => (
          <div key={client._id} className="client-card">
            <div className="client-header">
              <div className="client-avatar">
                <FaUser className="avatar-icon" />
              </div>
              <h3>{`${client.firstName} ${client.lastName}`}</h3>
              <span className={`client-status ${client.status}`}>
                <MdCircle className="status-icon" />
                {client.status}
              </span>
            </div>
            <div className="client-body">
              <div className="info-row">
                <FaEnvelope className="info-icon" />
                <span>{client.email}</span>
              </div>
              <div className="info-row">
                <FaPhone className="info-icon" />
                <span>{client.phone}</span>
              </div>
              <div className="info-row">
                <FaBuilding className="info-icon" />
                <span>{client.company}</span>
              </div>
              <div className="info-row">
                <FaMapMarkerAlt className="info-icon" />
                <span>{client.address}</span>
              </div>
            </div>
            <div className="client-actions">
              <button onClick={() => handleViewDetails(client)} className="view-btn">
                View
              </button>
              <button onClick={() => handleEdit(client)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => deleteClient(client._id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientManagement;