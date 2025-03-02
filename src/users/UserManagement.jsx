import React, { useEffect, useState } from "react";
import axios from "axios";
import "./UserManagement.css";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({ name: "", email: "", mdp: "", role: "user" });
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    axios
      .get("http://localhost:8000/getusers")
      .then((res) => setUsers(res.data))
      .catch((error) => {
        console.error("Error fetching users:", error);
        alert(error.response?.data?.message || "Error fetching users. Please try again.");
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      updateUser();
    } else {
      addUser();
    }
  };

  const deleteUser = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      axios
        .delete(`http://localhost:8000/deleteusers/${id}`)
        .then(() => {
          setUsers(users.filter((user) => user._id !== id));
        })
        .catch((error) => {
          console.error("Error deleting user:", error);
          alert(error.response?.data?.message || "Error deleting user. Please try again.");
        });
    }
  };

  const updateUser = () => {
    axios
      .put(`http://localhost:8000/updateusers/${editingUser._id}`, editingUser)
      .then((res) => {
        setUsers(users.map((user) => (user._id === res.data._id ? res.data : user)));
        setEditingUser(null);
        setShowForm(false);
      })
      .catch((error) => {
        console.error("Error updating user:", error);
        alert(error.response?.data?.message || "Error updating user. Please try again.");
      });
  };

  const addUser = () => {
    axios
      .post("http://localhost:8000/saveusers", newUser)
      .then((res) => {
        setUsers([...users, res.data]);
        setNewUser({ name: "", email: "", mdp: "", role: "user" });
        setShowForm(false);
      })
      .catch((error) => {
        console.error("Error adding user:", error);
        alert(error.response?.data?.message || "Error adding user. Please try again.");
      });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
   
    <div className="user-management">
       <h1>Users Management</h1>
      <div className="top-controls">
        <input 
          type="text" 
          placeholder="Search users..." 
          className="search-inputt"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="add-user-btnn" onClick={() => setShowForm(true)}>
         + Add User
        </button>
      </div>

      {/* Popup Modal Form */}
      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingUser ? "Edit User" : "Add New User"}</h2>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowForm(false);
                  setEditingUser(null);
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
                  value={editingUser ? editingUser.name : newUser.name}
                  onChange={(e) =>
                    editingUser
                      ? setEditingUser({ ...editingUser, name: e.target.value })
                      : setNewUser({ ...newUser, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editingUser ? editingUser.email : newUser.email}
                  onChange={(e) =>
                    editingUser
                      ? setEditingUser({ ...editingUser, email: e.target.value })
                      : setNewUser({ ...newUser, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={editingUser ? editingUser.mdp : newUser.mdp}
                  onChange={(e) =>
                    editingUser
                      ? setEditingUser({ ...editingUser, mdp: e.target.value })
                      : setNewUser({ ...newUser, mdp: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={editingUser ? editingUser.role : newUser.role}
                  onChange={(e) =>
                    editingUser
                      ? setEditingUser({ ...editingUser, role: e.target.value })
                      : setNewUser({ ...newUser, role: e.target.value })
                  }
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="submit" className="submit-btn">
                  {editingUser ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingUser(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User List */}
      <div className="users-list">
        {filteredUsers.map((user) => (
          <div key={user._id} className="user-item">
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-email">{user.email}</span>
              <span className={`user-role ${user.role}`}>{user.role}</span>
            </div>
            <div className="user-actions">
              <button onClick={() => handleEdit(user)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => deleteUser(user._id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserManagement;
