import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './role.css';

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [name, setName] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(''); // For role assignment
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState({
    dashboard: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
    employees: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
    roles: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
    vacations: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
    products: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
    stock: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
    movements: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
    clients: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
    suppliers: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
    clientOrders: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
    purchaseOrders: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
    salesInvoices: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
    purchaseInvoices: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
    quotes: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
    taxes: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const [rolesResponse, employeesResponse] = await Promise.all([
          axios.get('http://localhost:5000/api/roles', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get('http://localhost:5000/getEmployes', {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setRoles(rolesResponse.data);
        setEmployees(employeesResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load roles or employees');
      }
    };

    fetchData();
  }, []);

  const handlePermissionChange = (interfaceName, permission) => {
    setPermissions((prev) => ({
      ...prev,
      [interfaceName]: {
        ...prev[interfaceName],
        [permission]: !prev[interfaceName][permission],
      },
    }));
  };

  const handleRoleSelect = (e) => {
    const roleId = e.target.value;
    setSelectedRoleId(roleId);

    const selectedRole = roles.find((role) => role.id === parseInt(roleId));
    if (selectedRole) {
      setName(selectedRole.name);
      setDescription(selectedRole.description || '');
      setPermissions(selectedRole.permissions);
    } else {
      setName('');
      setDescription('');
      setPermissions({
        dashboard: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        employees: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        roles: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        vacations: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        products: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        stock: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        movements: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        clients: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        suppliers: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        clientOrders: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        purchaseOrders: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        salesInvoices: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        purchaseInvoices: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        quotes: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        taxes: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        name,
        description,
        permissions,
      };

      if (selectedRoleId) {
        await axios.put(`http://localhost:5000/api/roles/${selectedRoleId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('http://localhost:5000/api/roles', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      toast.success(`Role ${selectedRoleId ? 'updated' : 'created'} successfully!`);
      const rolesResponse = await axios.get('http://localhost:5000/api/roles', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoles(rolesResponse.data);

      setSelectedRoleId('');
      setName('');
      setDescription('');
      setPermissions({
        dashboard: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        employees: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        roles: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        vacations: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        products: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        stock: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        movements: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        clients: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        suppliers: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        clientOrders: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        purchaseOrders: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        salesInvoices: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        purchaseInvoices: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        quotes: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
        taxes: { can_see: false, can_create: false, can_edit: false, can_delete: false, can_approve: false },
      });
    } catch (error) {
      console.error('Error saving role:', error);
      toast.error(error.response?.data?.error || 'Failed to save role');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignRole = async () => {
    if (!selectedEmployee || !selectedRoleId) {
      toast.error('Please select both an employee and a role');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');

      await axios.post(
        'http://localhost:5000/api/assign-role',
        {
          employeeId: selectedEmployee,
          roleId: selectedRoleId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Refresh the employees list to reflect the updated role
      const employeesResponse = await axios.get('http://localhost:5000/getEmployes', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(employeesResponse.data);

      toast.success('Role assigned successfully!');
      setSelectedEmployee('');
      setSelectedRoleId('');
    } catch (error) {
      console.error('Error assigning role:', error);
      toast.error(error.response?.data?.error || 'Failed to assign role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="role-management-container">
      <ToastContainer />
      <h1 className="page-title">Role Management</h1>

      <form onSubmit={handleSubmit} className="role-form">
        <div className="form-header">
          <div className="form-group">
            <label htmlFor="roleSelect">Select Role to Edit (Optional)</label>
            <select
              id="roleSelect"
              value={selectedRoleId}
              onChange={handleRoleSelect}
              className="select-input"
            >
              <option value="">-- Create New Role --</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="name">Role Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="select-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
              className="textarea-input"
            />
          </div>
        </div>

        <div className="permissions-container">
          <h2 className="permissions-title">Module Permissions</h2>

          <div className="permissions-grid">
            {Object.entries(permissions).map(([module, perms]) => (
              <div key={module} className="permission-card">
                <h3 className="module-title">{module.replace(/([A-Z])/g, ' $1').trim()}</h3>
                <div className="permissions-checkboxes">
                  {Object.entries(perms).map(([perm, value]) => (
                    <label key={perm} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={() => handlePermissionChange(module, perm)}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">
                        {perm.replace(/_/g, ' ').replace(/can/g, 'Can')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Saving...' : selectedRoleId ? 'Update Role' : 'Create Role'}
          </button>
        </div>
      </form>

      <div className="assign-role-section">
        <h2 className="section-title">Assign Role to Employee</h2>
        <div className="form-group">
          <label htmlFor="employeeAssign">Select Employee</label>
          <select
            id="employeeAssign"
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="select-input"
          >
            <option value="">-- Select Employee --</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.first_name} {emp.last_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="roleAssignSelect">Select Role</label>
          <select
            id="roleAssignSelect"
            value={selectedRoleId}
            onChange={(e) => setSelectedRoleId(e.target.value)}
            className="select-input"
          >
            <option value="">-- Select Role --</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
        </div>

        <button
          className="submit-button"
          onClick={handleAssignRole}
          disabled={loading || !selectedEmployee || !selectedRoleId}
        >
          {loading ? 'Assigning...' : 'Assign Role'}
        </button>
      </div>

      <div className="employee-list">
        <h2>Employees and Their Roles</h2>
        <table className="employees-table">
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{employee.first_name} {employee.last_name}</td>
                <td>{employee.role_name || 'No role assigned'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RoleManagement;