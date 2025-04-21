import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaSignOutAlt, FaUser, FaCalendarPlus, FaPencilAlt, FaTrash, FaBoxes, FaExchangeAlt, FaFileInvoiceDollar, FaPercentage } from 'react-icons/fa';
import './Header.css';
import { PiUsersThreeLight } from "react-icons/pi";
import { TfiShoppingCart } from "react-icons/tfi";
import { MdOutlineDashboard, MdKeyboardArrowDown, MdKeyboardArrowUp, MdKeyboardArrowRight, MdKeyboardArrowLeft } from "react-icons/md";
import { LiaProductHunt } from "react-icons/lia";
import { CiFaceSmile } from "react-icons/ci";
import { TbTruckDelivery } from 'react-icons/tb';
import VacationRequest from './Vacation/VacationRequest';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaBell } from 'react-icons/fa';

function Header({ onLogout }) {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showVacationModal, setShowVacationModal] = useState(false);
  const [myRequests, setMyRequests] = useState([]);
  const [editingRequest, setEditingRequest] = useState(null);
  const [showRequestsModal, setShowRequestsModal] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [areNotificationsDeleted, setAreNotificationsDeleted] = useState(() => {
    return localStorage.getItem('notificationsDeleted') === 'true';
  });
  const [menuStates, setMenuStates] = useState({
    employee: false,
    product: false,
    orders: false,
    invoices: false
  });

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  const userInfo = {
    name: localStorage.getItem('userName'),
    email: localStorage.getItem('userEmail'),
    role: localStorage.getItem('userRole'),
    department: localStorage.getItem('department') // Add this line
  };

  const fetchMyRequests = async () => {
    try {
      const userId = localStorage.getItem('id');
      const response = await axios.get(`http://localhost:5000/api/absences/employee/${userId}`);
      setMyRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const fetchNotifications = async () => {
    try {
      const userId = localStorage.getItem('id');
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`http://localhost:5000/api/notifications/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const sortedNotifications = response.data.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      
      setNotifications(sortedNotifications);
      setUnreadCount(sortedNotifications.filter(notif => !notif.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const userId = localStorage.getItem('id');
      const token = localStorage.getItem('token');
      
      await axios.put(
        `http://localhost:5000/api/notifications/${userId}/mark-all-read`,
        {},
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      setNotifications(prev => 
        prev.map(notification => ({
          ...notification,
          read: true
        }))
      );
      
      setUnreadCount(0);
      
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const deleteAllNotifications = async () => {
    try {
      const userId = localStorage.getItem('id');
      const token = localStorage.getItem('token');
      
      const response = await axios.delete(
        `http://localhost:5000/${userId}/delete-all`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.status === 'success') {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error deleting notifications:', error);
    }
  };

  const showAllNotifications = () => {
    setAreNotificationsDeleted(false);
    localStorage.setItem('notificationsDeleted', 'false');
    fetchNotifications(); // Refresh notifications when showing them again
  };

  useEffect(() => {
    const userId = localStorage.getItem('id');
    if (!userId) return;

    fetchNotifications();

    const interval = setInterval(fetchNotifications, 10000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      setAreNotificationsDeleted(false);
      localStorage.setItem('notificationsDeleted', 'false');
    }
  }, [notifications]);

  const handleDeleteRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/absences/${requestId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setMyRequests(myRequests.filter(request => request.id !== requestId));
        toast.success('Request deleted successfully');
      } catch (error) {
        console.error('Error deleting request:', error);
        const errorMessage = error.response?.data?.message || 'Failed to delete request';
        toast.error(errorMessage);
      }
    }
  };

  const handleEditRequest = (request) => {
    setShowProfileModal(false);
    setShowVacationModal(true);
    setEditingRequest(request);
  };

  const handleMenuClick = (menuName) => {
    setMenuStates(prevStates => ({
      ...prevStates,
      [menuName]: !prevStates[menuName]
    }));
  };

  useEffect(() => {
    if (showProfileModal) {
      fetchMyRequests();
    }
  }, [showProfileModal]);

  useEffect(() => {
    if (showRequestsModal) {
      fetchMyRequests();
    }
  }, [showRequestsModal]);

  return (
    <div className="sidebar-container">
      <div className={`top-navbar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="navbar-content">
          <div className="navbar-left">
          
          </div>
          <div className="navbar-right">
            <div className="notification-section">
              <div className="notification-icon" onClick={() => setShowNotifications(!showNotifications)}>
                <FaBell className="bell-icon" />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </div>
              {showNotifications && (
                <div className="notification-dropdown">
                  <div className="notification-header">
                    <h3>Notifications</h3>
                    <div className="notification-actions">
                      {unreadCount > 0 && (
                        <button className="mark-all-read" onClick={markAllAsRead}>
                          Mark all as read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button className="delete-all" onClick={deleteAllNotifications}>
                          <FaTrash /> Delete All
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="notifications-list">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          className={`notification-item ${!notif.read ? 'unread' : ''}`}
                        >
                          <div className="notification-content">
                            <p>{notif.message}</p>
                            <span className="notification-time">
                              {new Date(notif.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="no-notifications">No notifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="profile-section">
              <div className="profile-info-preview">
                <span className="user-name">{userInfo.name}</span>
                <span className="user-role">{userInfo.role}</span>
              </div>
              <div className="profile-icon" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <FaUserCircle className="user-icon" />
              </div>
              {showProfileMenu && (
                <div className="profile-dropdown">
                  <div className="dropdown-item" onClick={() => {
                    setShowProfileModal(true);
                    setShowProfileMenu(false);
                  }}>
                    <FaUser className="dropdown-icon" />
                    <span>My Profile</span>
                  </div>
                  <div className="dropdown-item" onClick={() => {
                    setShowRequestsModal(true);
                    setShowProfileMenu(false);
                  }}>
                    <FaCalendarPlus className="dropdown-icon" />
                    <span>My Requests</span>
                  </div>
                  <div className="dropdown-item" onClick={() => {
                    setShowVacationModal(true);
                    setShowProfileMenu(false);
                  }}>
                    <FaCalendarPlus className="dropdown-icon" />
                    <span>Request Vacation</span>
                  </div>
                  <div className="dropdown-item" onClick={handleLogout}>
                    <FaSignOutAlt className="dropdown-icon" />
                    <span>Logout</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
        {/* Logo at the top of the sidebar */}
        <div className="sidebar-logo">
          <a href="./Dashboard">
            <img src="erp.png" alt="Logo" className="logoh" />
          </a>
          <button 
            className="collapse-btn"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          >
            {isSidebarCollapsed ? <MdKeyboardArrowRight /> : <MdKeyboardArrowLeft />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="sidebar-nav">
          <ul className="nav-links">
            <li>
              <a href="./Dashboard" data-tooltip="Dashboard">
                <MdOutlineDashboard className="nav-icon" />
                <span>Dashboard</span>
              </a>
            </li>
            <li className="menu-item">
              <div 
                className="menu-header" 
                onClick={() => handleMenuClick('employee')}
                data-tooltip="Employees"
              >
                <div className="menu-title">
                  <PiUsersThreeLight className="nav-icon" />
                  <span>Employees</span>
                </div>
                {menuStates.employee ? (
                  <MdKeyboardArrowUp className="arrow-icon" />
                ) : (
                  <MdKeyboardArrowDown className="arrow-icon" />
                )}
              </div>
              <ul className={`submenu ${menuStates.employee ? 'open' : ''}`}>
                <li>
                  <a href="./EmployeManagement">
                    <FaUser className="nav-icon" />
                    <span>Manage Employees</span>
                  </a>
                </li>
                <li>
                  <a href="./VacationRequests">
                    <FaCalendarPlus className="nav-icon" />
                    <span>Vacation Requests</span>
                  </a>
                </li>
              </ul>
            </li>
            <li className="menu-item">
              <div 
                className="menu-header" 
                onClick={() => handleMenuClick('product')}
                data-tooltip="Products"
              >
                <div className="menu-title">
                  <LiaProductHunt className="nav-icon" />
                  <span>Products</span>
                </div>
                {menuStates.product ? (
                  <MdKeyboardArrowUp className="arrow-icon" />
                ) : (
                  <MdKeyboardArrowDown className="arrow-icon" />
                )}
              </div>
              <ul className={`submenu ${menuStates.product ? 'open' : ''}`}>
                <li>
                  <a href="./ProductManagement">
                    <LiaProductHunt className="nav-icon" />
                    <span>Manage Products</span>
                  </a>
                </li>
                <li>
                  <a href="./StockManagement">
                    <FaBoxes className="nav-icon" />
                    <span>Stock Management</span>
                  </a>
                </li>
                <li>
                  <a href="./StockMouvement">
                    <FaExchangeAlt className="nav-icon" />
                    <span>Stock Movements</span>
                  </a>
                </li>
              </ul>
            </li>
            <li>
              <a href="./ClientManagement" data-tooltip="Clients">
                <CiFaceSmile className="nav-icon" />
                <span>Clients</span>
              </a>
            </li>
            <li>
              <a href="./SupplierManagement" data-tooltip="Suppliers">
                <TbTruckDelivery className="nav-icon" />
                <span>Suppliers</span>
              </a>
            </li>
            <li className="menu-item">
              <div 
                className="menu-header" 
                onClick={() => handleMenuClick('orders')}
                data-tooltip="Orders"
              >
                <div className="menu-title">
                  <TfiShoppingCart className="nav-icon" />
                  <span>Orders</span>
                </div>
                {menuStates.orders ? (
                  <MdKeyboardArrowUp className="arrow-icon" />
                ) : (
                  <MdKeyboardArrowDown className="arrow-icon" />
                )}
              </div>
              <ul className={`submenu ${menuStates.orders ? 'open' : ''}`}>
                <li>
                  <a href="./ClientOrderManagement">
                    <CiFaceSmile className="nav-icon" />
                    <span>Client Orders</span>
                  </a>
                </li>
                <li>
                  <a href="./PurchaseOrderManagement">
                    <TbTruckDelivery className="nav-icon" />
                    <span>Purchase Orders</span>
                  </a>
                </li>
              </ul>
            </li>
            <li className="menu-item">
              <div 
                className="menu-header" 
                onClick={() => handleMenuClick('invoices')}
                data-tooltip="Invoices"
              >
                <div className="menu-title">
                  <FaFileInvoiceDollar className="nav-icon" />
                  <span>Fianance</span>
                </div>
                {menuStates.invoices ? (
                  <MdKeyboardArrowUp className="arrow-icon" />
                ) : (
                  <MdKeyboardArrowDown className="arrow-icon" />
                )}
              </div>
              <ul className={`submenu ${menuStates.invoices ? 'open' : ''}`}>
                <li>
                  <a href="./PurchaseInvoices">
                    <FaFileInvoiceDollar className="nav-icon" />
                    <span>Purchase Invoices</span>
                  </a>
                </li>
                <li>
                  <a href="./SalesInvoices">
                    <FaFileInvoiceDollar className="nav-icon" />
                    <span>Sales Invoices</span>
                  </a>
                </li>
                <li>
                  <a href="./QuoteManagement">
                    <FaFileInvoiceDollar className="nav-icon" />
                    <span>Quotes</span>
                  </a>
                </li>
                <li>
                  <a href="./WithholdingTax">
                    <FaPercentage className="nav-icon" />
                    <span>Withholding Tax</span>
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>

        {/* Profile Section at the bottom of the sidebar */}
        <div className="sidebar-profile-section">
          <div className="profile-icon" onClick={() => setShowProfileMenu(!showProfileMenu)}>
            <FaUserCircle className="user-icon" />
          </div>

          {showProfileMenu && (
            <div className="profile-dropdown">
              <div className="dropdown-item" onClick={() => {
                setShowProfileModal(true);
                setShowProfileMenu(false);
              }}>
                <FaUser className="dropdown-icon" />
                <span>My Profile</span>
              </div>
              <div className="dropdown-item" onClick={() => {
                setShowRequestsModal(true);
                setShowProfileMenu(false);
              }}>
                <FaCalendarPlus className="dropdown-icon" />
                <span>My Requests</span>
              </div>
              <div className="dropdown-item" onClick={() => {
                setShowVacationModal(true);
                setShowProfileMenu(false);
              }}>
                <FaCalendarPlus className="dropdown-icon" />
                <span>Request Vacation</span>
              </div>
              <div className="dropdown-item" onClick={handleLogout}>
                <FaSignOutAlt className="dropdown-icon" />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Modals for Profile and Vacation Request */}
      {showProfileModal && (
        <div className="modal-backdrop">
          <div className="modal-content profile-modal">
            <div className="modal-header">
              <h2>My Profile</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowProfileModal(false)}
              >
                ×
              </button>
            </div>
            <div className="profile-container">
              <div className="profile-details">
                <div className="profile-avatar">
                  <FaUserCircle className="large-user-icon" />
                </div>
                <div className="profile-info">
                  <div className="info-row">
                    <label>Name:</label>
                    <span>{userInfo.name}</span>
                  </div>
                  <div className="info-row">
                    <label>Email:</label>
                    <span>{userInfo.email}</span>
                  </div>
                  <div className="info-row">
                    <label>Department:</label>
                    <span className="user-department">{userInfo.department || 'Not assigned'}</span>
                  </div>
                  <div className="info-row">
                    <label>Role:</label>
                    <span className="user-role">{userInfo.role}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showVacationModal && (
        <div className="modal-backdrop">
          <VacationRequest 
            onClose={() => {
              setShowVacationModal(false);
              setEditingRequest(null);
            }} 
            editingRequest={editingRequest}
          />
        </div>
      )}

      {showRequestsModal && (
        <div className="modal-backdrop">
          <div className="modal-content requests-modal">
            <div className="modal-header">
              <h2>My Vacation Requests</h2>
              <button 
                className="close-btn" 
                onClick={() => setShowRequestsModal(false)}
              >
                ×
              </button>
            </div>
            <div className="requests-container">
              <div className="requests-table-container">
                <table className="requests-table">
                  <thead>
                    <tr>
                      <th>Start Date</th>
                      <th>End Date</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRequests.length > 0 ? (
                      myRequests.map((request) => (
                        <tr key={request.id} className="request-row">
                          <td>{new Date(request.start_date).toLocaleDateString()}</td>
                          <td>{new Date(request.end_date).toLocaleDateString()}</td>
                          <td>{request.reason}</td>
                          <td>
                            <span className={`status-badge ${request.status}`}>
                              {request.status}
                            </span>
                          </td>
                          <td>
                            {request.status === 'pending' && (
                              <div className="action-buttons">
                                <FaPencilAlt
                                  className="action-icon edit"
                                  onClick={() => handleEditRequest(request)}
                                  title="Edit Request"
                                />
                                <FaTrash
                                  className="action-icon delete"
                                  onClick={() => handleDeleteRequest(request.id)}
                                  title="Delete Request"
                                />
                              </div>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="no-requests">No vacation requests found</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Header;