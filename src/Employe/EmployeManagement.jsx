import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EmployeManagement.css';
import { FaUser, FaEnvelope, FaBuilding, FaEye, FaPen, FaTrash } from 'react-icons/fa';
import { BsGrid, BsListUl } from 'react-icons/bs';
import { toast } from 'react-toastify';

const validatePhone = (phone) => {
  const phoneRegex = /^\d{8}$/;
  return phoneRegex.test(phone);
};

const EmployeeManagement = () => {
  const [employees, setEmployees] = useState([]);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [roles, setRoles] = useState([]);
  const [newEmployee, setNewEmployee] = useState({
    first_name: '', 
    last_name: '', 
    email: '',
    department: '',
    hire_date: new Date().toISOString().split('T')[0],
    phone_number: '',
    address: '',
    salary: 0.00,
    mdp: '',
    role_id: ''
  });
  
  const [showForm, setShowForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewingEmployee, setViewingEmployee] = useState(null);
  const [viewMode, setViewMode] = useState('list');
 
  const departments = ['Sales', 'Human Resource', 'Stock', 'Finance', 'Operations', 'Purchasing'];

  useEffect(() => {
    fetchEmployees();
    fetchRoles();
  }, []);

  useEffect(() => {
    if (roles.length > 0) {
      fetchEmployees();
    }
  }, [roles]);

  const fetchRoles = () => {
    axios.get("http://localhost:5000/api/roles")
      .then((res) => {
        const rolesData = Array.isArray(res.data) ? res.data : [];
        console.log('Fetched roles:', rolesData);
        setRoles(rolesData);
      })
      .catch((error) => {
        console.error("Error fetching roles:", error);
        setRoles([]);
        toast.error("Error fetching roles");
      });
  };

  const fetchEmployees = () => {
    axios.get("http://localhost:5000/getEmployes")
      .then((res) => {
        setEmployees(Array.isArray(res.data) ? res.data : []);
      })
      .catch((error) => {
        console.error("Error fetching employees:", error);
        setEmployees([]);
        toast.error("Error fetching employees. Please try again.");
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const phoneToValidate = editingEmployee ? editingEmployee.phone_number : newEmployee.phone_number;
    
    if (!validatePhone(phoneToValidate)) {
      toast.error("Phone number must be exactly 8 digits");
      return;
    }

    editingEmployee ? updateEmployee() : addEmployee();
  };

  const addEmployee = () => {
    const employeeData = {
      first_name: newEmployee.first_name.trim(),
      last_name: newEmployee.last_name.trim(),
      email: newEmployee.email.trim().toLowerCase(),
      department: newEmployee.department,
      hire_date: newEmployee.hire_date,
      phone_number: newEmployee.phone_number,
      address: newEmployee.address,
      salary: parseFloat(newEmployee.salary) || 0.00,
      mdp: newEmployee.mdp,
      role_id: newEmployee.role_id
    };

    axios.post("http://localhost:5000/saveEmployes", employeeData)
      .then((res) => {
        setEmployees([res.data, ...employees]);
        setShowForm(false);
        toast.success('Employee added successfully!');
      })
      .catch((error) => {
        console.error('Error adding employee:', error);
        toast.error(error.response?.data?.message || "Error adding employee");
      });
  };

  const updateEmployee = () => {
    const updatedEmployee = {
      first_name: editingEmployee.first_name,
      last_name: editingEmployee.last_name,
      email: editingEmployee.email,
      department: editingEmployee.department,
      hire_date: editingEmployee.hire_date,
      phone_number: editingEmployee.phone_number,
      address: editingEmployee.address,
      salary: editingEmployee.salary ? parseFloat(editingEmployee.salary) : 0.00,
      mdp: editingEmployee.mdp,
      role_id: editingEmployee.role_id
    };

    axios.put(`http://localhost:5000/updateEmployes/${editingEmployee.id}`, updatedEmployee)
      .then((res) => {
        setEmployees(employees.map((emp) => emp.id === editingEmployee.id ? res.data : emp));
        setEditingEmployee(null);
        setShowForm(false);
        toast.success('Employee updated successfully!');
      })
      .catch((error) => {
        console.error("Error updating employee:", error);
        toast.error(error.response?.data?.message || "Error updating employee");
      });
  };

  const deleteEmployee = (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      axios.delete(`http://localhost:5000/deleteEmployes/${id}`)
        .then(() => {
          setEmployees(employees.filter((emp) => emp.id !== id));
          toast.success('Employee deleted successfully!');
        })
        .catch((error) => {
          console.error("Error deleting employee:", error);
          toast.error(error.response?.data?.message || "Error deleting employee");
        });
    }
  };

  const handleViewDetails = (employee) => {
    setViewingEmployee(employee);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const filteredEmployees = employees.filter(emp => {
    const firstName = emp.first_name ? emp.first_name.toLowerCase() : '';
    const lastName = emp.last_name ? emp.last_name.toLowerCase() : '';
    return (
      firstName.includes(searchQuery.toLowerCase()) ||
      lastName.includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="employee-management">
      <h1>Employees Management</h1>
      <div className="top-controls">
        <div className="left-controls">
          <input 
            type="text" 
            placeholder="Search employees..." 
            className="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="view-toggle-btn" onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}>
            {viewMode === 'list' ? <BsGrid /> : <BsListUl />}
          </button>
        </div>
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
                  value={editingEmployee ? editingEmployee.first_name : newEmployee.first_name}
                  onChange={(e) =>
                    editingEmployee
                      ? setEditingEmployee({ ...editingEmployee, first_name: e.target.value })
                      : setNewEmployee({ ...newEmployee, first_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  value={editingEmployee ? editingEmployee.last_name : newEmployee.last_name}
                  onChange={(e) =>
                    editingEmployee
                      ? setEditingEmployee({ ...editingEmployee, last_name: e.target.value })
                      : setNewEmployee({ ...newEmployee, last_name: e.target.value })
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
                  value={editingEmployee ? editingEmployee.hire_date : newEmployee.hire_date}
                  onChange={(e) =>
                    editingEmployee
                      ? setEditingEmployee({ ...editingEmployee, hire_date: e.target.value })
                      : setNewEmployee({ ...newEmployee, hire_date: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  pattern="[0-9]{8}"
                  value={editingEmployee ? editingEmployee.phone_number : newEmployee.phone_number}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                    editingEmployee
                      ? setEditingEmployee({ ...editingEmployee, phone_number: value })
                      : setNewEmployee({ ...newEmployee, phone_number: value })
                  }}
                  required
                  placeholder="Enter 8 digits"
                />
                <small className="form-text">Phone number must be 8 digits</small>
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
              <div className="form-group">
                <label>Salary (Dt)</label>
                <input
                  type="number"
                  
                  value={editingEmployee ? editingEmployee.salary : newEmployee.salary}
                  onChange={(e) => {
                    const value = e.target.value ? parseFloat(e.target.value) : '';
                    editingEmployee
                      ? setEditingEmployee({ ...editingEmployee, salary: value || 0.00 })
                      : setNewEmployee({ ...newEmployee, salary: value || 0.00 });
                  }}
                  placeholder="Enter salary"
                  required
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  value={editingEmployee ? editingEmployee.mdp : newEmployee.mdp}
                  onChange={(e) =>
                    editingEmployee
                      ? setEditingEmployee({ ...editingEmployee, mdp: e.target.value })
                      : setNewEmployee({ ...newEmployee, mdp: e.target.value })
                  }
                  required={!editingEmployee} // Required only for new employees
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  value={editingEmployee ? editingEmployee.role_id : newEmployee.role_id}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (editingEmployee) {
                      setEditingEmployee({ ...editingEmployee, role_id: value });
                    } else {
                      setNewEmployee({ ...newEmployee, role_id: value });
                    }
                  }}
                 
                >
                  <option value="">Select Role</option>
                  {Array.isArray(roles) && roles.length > 0 ? (
                    roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>No roles available</option>
                  )}
                </select>
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
                <span>{`${viewingEmployee.first_name} ${viewingEmployee.last_name}`}</span>
              </div>
              <div className="detail-row">
                <strong>Email:</strong>
                <span>{viewingEmployee.email}</span>
              </div>
              
              <div className="detail-row">
                <strong>Department:</strong>
                <span>{viewingEmployee.department}</span>
              </div>
              <div className="detail-row">
                <strong>Hire Date:</strong>
                <span>{new Date(viewingEmployee.hire_date).toLocaleDateString()}</span>
              </div>
              <div className="detail-row">
                <strong>Phone Number:</strong>
                <span>{viewingEmployee.phone_number}</span>
              </div>
              <div className="detail-row">
                <strong>Address:</strong>
                <span>{viewingEmployee.address}</span>
              </div>
              <div className="detail-row">
                <strong>Salary:</strong>
                <span>{viewingEmployee.salary ? parseFloat(viewingEmployee.salary).toFixed(2) : '0.00'}Dt</span>
              </div>
              <div className="detail-row">
                <strong>Role:</strong>
                <span>
                  {Array.isArray(roles) && viewingEmployee.role_id
                    ? (roles.find(role => role.id === parseInt(viewingEmployee.role_id))?.name || 'No Role Assigned')
                    : 'No Role Assigned'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={`employees-container ${viewMode}`}>
        {filteredEmployees.length === 0 ? (
          <p>No employees found.</p>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="employees-grid">
            {filteredEmployees.map((employee) => (
              <div key={employee.id} className="employee-card">
                <div className="employee-card-header">
                  <div className="employee-avatar">
                    <FaUser className="avatar-icon" />
                  </div>
                  <h3 className="employee-card-name">{`${employee.first_name} ${employee.last_name}`}</h3>
                </div>
                <div className="employee-card-body">
                  <div className="info-row">
                    <span>{employee.email}</span>
                    <FaEnvelope className="info-side-icon" />
                  </div>
                
                  <div className="info-row">
                    <span>{employee.department}</span>
                    <FaBuilding className="info-side-icon" />
                  </div>
                  <div className="info-row">
                    <span>{employee.salary ? parseFloat(employee.salary).toFixed(2) : '0.00'}dt</span>
                   
                  </div>
                </div>
                <div className="employee-card-actions">
                  <button onClick={() => handleViewDetails(employee)} className="card-btn view">
                    <FaEye /> 
                  </button>
                  <button onClick={() => handleEdit(employee)} className="card-btn edit">
                    <FaPen />
                  </button>
                  <button onClick={() => deleteEmployee(employee.id)} className="card-btn delete">
                    <FaTrash /> 
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <table className="employees-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Email</th>
                <th>Department</th>
                <th>Salary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee) => (
                <tr key={employee.id}>
                  <td className="employee-name-cell">
                    <div className="employee-name-wrapper">
                      <div className="employee-avatar-small">
                        <FaUser />
                      </div>
                      <span>{`${employee.first_name} ${employee.last_name}`}</span>
                    </div>
                  </td>
                  <td>{employee.email}</td>
                  <td>{employee.department}</td>
                  <td>{employee.salary ? parseFloat(employee.salary).toFixed(2) : '0.00'}Dt</td>
                  <td>
                    <div className="table-actions">
                      <button onClick={() => handleViewDetails(employee)} className="table-btn view">
                        <FaEye />
                      </button>
                      <button onClick={() => handleEdit(employee)} className="table-btn edit">
                        <FaPen />
                      </button>
                      <button onClick={() => deleteEmployee(employee.id)} className="table-btn delete">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;