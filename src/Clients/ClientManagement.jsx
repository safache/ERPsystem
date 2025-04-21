import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ClientManagement.css';
import { FaEye, FaPencilAlt, FaTrash } from 'react-icons/fa';


// Add this validation function at the top of your component
const validatePhone = (phone) => {
  const phoneRegex = /^\d{8}$/;
  return phoneRegex.test(phone);
};

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
      .get("http://localhost:5000/getclients")
      .then((res) => setClients(res.data))
      .catch((error) => {
        console.error("Error fetching clients:", error);
        alert(error.response?.data?.message || "Error fetching clients. Please try again.");
      });
  };

  // Modify the handleSubmit function
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const phoneToValidate = editingClient ? editingClient.phone : newClient.phone;
    
    if (!validatePhone(phoneToValidate)) {
      alert("Phone number must be exactly 8 digits");
      return;
    }

    if (editingClient) {
      updateClient();
    } else {
      addClient();
    }
  };

  const addClient = () => {
    axios
      .post("http://localhost:5000/saveclients", newClient)
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
      .put(`http://localhost:5000/updateclients/${editingClient.id}`, editingClient) // Changed from _id to id
      .then((res) => {
        setClients(clients.map((client) => 
          client.id === res.data.id ? res.data : client // Changed from _id to id
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
        .delete(`http://localhost:5000/deleteclients/${id}`)
        .then(() => {
          setClients(clients.filter((client) => client.id !== id)); // Changed from _id to id
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
    (client.firstName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (client.lastName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="client-management">
      <h1>Clients Management</h1>
      <div className="top-controls">
        <input 
          type="text" 
          placeholder="Search clients..." 
          className="search"
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
                  pattern="[0-9]{8}"
                  value={editingClient ? editingClient.phone : newClient.phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                    editingClient
                      ? setEditingClient({ ...editingClient, phone: value })
                      : setNewClient({ ...newClient, phone: value })
                  }}
                  required
                  placeholder="Enter 8 digits"
                />
                <small className="form-text">Phone number must be 8 digits</small>
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
            
            </div>
            
          </div>
        </div>
      )}

      <div className="clients-table-container">
        <table className="clients-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Company</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">No clients found.</td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.id} className="client-row">
                  <td>{`${client.firstName} ${client.lastName}`}</td>
                  <td>{client.email}</td>
                  <td>{client.phone}</td>
                  <td>{client.company}</td>
                  <td>{client.address}</td>
               
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleViewDetails(client)}
                        className="action-btn view"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleEdit(client)}
                        className="action-btn edit"
                        title="Edit Client"
                      >
                        <FaPencilAlt />
                      </button>
                      <button
                        onClick={() => deleteClient(client.id)}
                        className="action-btn delete"
                        title="Delete Client"
                      >
                        <FaTrash />
                      </button>
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

export default ClientManagement;