import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './VacationRequests.css';

const VacationRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/absences', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to fetch vacation requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `http://localhost:5000/api/absences/${requestId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.status === 'success') {
        // Update local state
        setRequests(requests.map(request => 
          request.id === requestId 
            ? { ...request, status: newStatus }
            : request
        ));

        // Show success message with appropriate icon
        toast.success(`Request ${newStatus}`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: newStatus === 'approved' ? '✅' : '❌'
        });

        // Refresh the requests to ensure sync with database
        fetchRequests();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(error.response?.data?.message || 'Failed to update request status', {
        position: "top-right",
        autoClose: 5000,
        icon: '⚠️'
      });
    }
  };

  return (
    <div className="vacation-requests-container">
      <ToastContainer />
      <h1>Vacation Requests</h1>
      
      {loading ? (
        <div className="loading">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="no-requests">No vacation requests found</div>
      ) : (
        <div className="table-container">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <div className="requester-info">
                      <span className="requester-name">{request.requester_full_name}</span>
                      <span className="requester-email">{request.requester_email}</span>
                    </div>
                  </td>
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
                        <button
                          className="approve-btn"
                          onClick={() => handleStatusUpdate(request.id, 'approved')}
                          title="Approve Request"
                        >
                          <FaCheck />
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleStatusUpdate(request.id, 'rejected')}
                          title="Reject Request"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VacationRequests;