import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmployeManagement.css';

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [newEmployee, setNewEmployee] = useState({
    firstName: '',
    lastName: '',
    email: '',
    position: '',
    department: '',
    hireDate: '',
    phoneNumber: '',
    address: ''
  });
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingEmployee, setViewingEmployee] = useState(null);

  const departments = ['Sales', 'Human Resource', 'Stock', 'Finance', 'Operations'];

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    axios.get("http://localhost:8000/getEmployes").then((res) => setEmployees(res.data));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingEmployee) {
      updateEmployee();
    } else {
      addEmployee();
    }
  };

  const deleteEmployee = (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      axios.delete(`http://localhost:8000/deleteEmployes/${id}`).then(() => {
        setEmployees(employees.filter((emp) => emp._id !== id));
      });
    }
  };

  const updateEmployee = () => {
    axios.put(`http://localhost:8000/updateEmployes/${editingEmployee._id}`, editingEmployee)
      .then((res) => {
        setEmployees(employees.map((emp) => (emp._id === res.data._id ? res.data : emp)));
        setEditingEmployee(null);
        setShowForm(false);
      });
  };

  const addEmployee = () => {
    axios.post("http://localhost:8000/saveEmployes", newEmployee)
      .then((res) => {
        setEmployees([...employees, res.data]);
        setNewEmployee({
          firstName: '',
          lastName: '',
          email: '',
          position: '',
          department: '',
          hireDate: '',
          phoneNumber: '',
          address: ''
        });
        setShowForm(false);
      })
      .catch((error) => {
        console.error('Error adding employee:', error);
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error data:', error.response.data);
          alert('Error adding employee: ' + error.response.data.error);
        } else {
          alert('Error adding employee. Please try again.');
        }
      });
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleViewDetails = (employee) => {
    setViewingEmployee(employee);
  };

  const filteredEmployees = employees.filter(emp => 
    emp.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.lastName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="employee-management">
         <h1>Employees Management</h1>
      <div className="top-controls">
        <input 
          type="text" 
          placeholder="Search employees..." 
          className="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="add-employee-btn" onClick={() => setShowForm(true)}>
         + Add Employee
        </button>
      </div>

      {showForm && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingEmployee ? "Edit Employee" : "Add New Employee"}</h2>
              <button 
                className="close-btn" 
                onClick={() => {
                  setShowForm(false);
                  setEditingEmployee(null);
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
                  value={editingEmployee ? editingEmployee.firstName : newEmployee.firstName}
                  onChange={(e) =>
                    editingEmployee
                      ? setEditingEmployee({ ...editingEmployee, firstName: e.target.value })
                      : setNewEmployee({ ...newEmployee, firstName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={editingEmployee ? editingEmployee.lastName : newEmployee.lastName}
                  onChange={(e) =>
                    editingEmployee
                      ? setEditingEmployee({ ...editingEmployee, lastName: e.target.value })
                      : setNewEmployee({ ...newEmployee, lastName: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editingEmployee ? editingEmployee.email : newEmployee.email}
                  onChange={(e) =>
                    editingEmployee
                      ? setEditingEmployee({ ...editingEmployee, email: e.target.value })
                      : setNewEmployee({ ...newEmployee, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Position</label>
                <input
                  type="text"
                  value={editingEmployee ? editingEmployee.position : newEmployee.position}
                  onChange={(e) =>
                    editingEmployee
                      ? setEditingEmployee({ ...editingEmployee, position: e.target.value })
                      : setNewEmployee({ ...newEmployee, position: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select
                  value={editingEmployee ? editingEmployee.department : newEmployee.department}
                  onChange={(e) =>
                    editingEmployee
                      ? setEditingEmployee({ ...editingEmployee, department: e.target.value })
                      : setNewEmployee({ ...newEmployee, department: e.target.value })
                  }
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Hire Date</label>
                <input
                  type="date"
                  value={editingEmployee ? editingEmployee.hireDate : newEmployee.hireDate}
                  onChange={(e) =>
                    editingEmployee
                      ? setEditingEmployee({ ...editingEmployee, hireDate: e.target.value })
                      : setNewEmployee({ ...newEmployee, hireDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={editingEmployee ? editingEmployee.phoneNumber : newEmployee.phoneNumber}
                  onChange={(e) =>
                    editingEmployee
                      ? setEditingEmployee({ ...editingEmployee, phoneNumber: e.target.value })
                      : setNewEmployee({ ...newEmployee, phoneNumber: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  value={editingEmployee ? editingEmployee.address : newEmployee.address}
                  onChange={(e) =>
                    editingEmployee
                      ? setEditingEmployee({ ...editingEmployee, address: e.target.value })
                      : setNewEmployee({ ...newEmployee, address: e.target.value })
                  }
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="submit" className="submit-btn">
                  {editingEmployee ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEmployee(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewingEmployee && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Employee Details</h2>
              <button 
                className="close-btn" 
                onClick={() => setViewingEmployee(null)}
              >
                ×
              </button>
            </div>
            <div className="employee-details">
              <div className="detail-row">
                <strong>Name:</strong>
                <span>{`${viewingEmployee.firstName} ${viewingEmployee.lastName}`}</span>
              </div>
              <div className="detail-row">
                <strong>Email:</strong>
                <span>{viewingEmployee.email}</span>
              </div>
              <div className="detail-row">
                <strong>Position:</strong>
                <span>{viewingEmployee.position}</span>
              </div>
              <div className="detail-row">
                <strong>Department:</strong>
                <span>{viewingEmployee.department}</span>
              </div>
              <div className="detail-row">
                <strong>Hire Date:</strong>
                <span>{new Date(viewingEmployee.hireDate).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <strong>Phone Number:</strong>
                <span>{viewingEmployee.phoneNumber}</span>
              </div>
              <div className="detail-row">
                <strong>Address:</strong>
                <span>{viewingEmployee.address}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setViewingEmployee(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="employees-list">
        {filteredEmployees.map((employee) => (
          <div key={employee._id} className="employee-item">
            <div className="employee-info">
              <span className="employee-name">{`${employee.firstName} ${employee.lastName}`}</span>
              <span className="employee-email">{employee.email}</span>
              <span className="employee-department">{employee.department}</span>
              <span className="employee-position">{employee.position}</span>
            </div>
            <div className="employee-actions">
              <button onClick={() => handleViewDetails(employee)} className="view-btn">
                View
              </button>
              <button onClick={() => handleEdit(employee)} className="edit-btn">
                Edit
              </button>
              <button onClick={() => deleteEmployee(employee._id)} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeManagement;