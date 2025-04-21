import React, { useState } from 'react';
import axios from 'axios';
import { FaCalendarAlt, FaFileAlt } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './VacationRequest.css';
const VacationRequest = ({ onClose, editingRequest = null }) => {
  const [formData, setFormData] = useState({
    start_date: editingRequest ? editingRequest.start_date : '',
    end_date: editingRequest ? editingRequest.end_date : '',
    reason: editingRequest ? editingRequest.reason : ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }

      const requestBody = {
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason
      };

      if (editingRequest) {
        const response = await axios.put(
          `http://localhost:5000/api/absences/${editingRequest.id}`, 
          requestBody,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        if (response.data && response.data.status === 'success') {
          toast.success('Request updated successfully', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            icon: '✏️'
          });
          // Remove the immediate onClose call
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } else {
        const response = await axios.post('http://localhost:5000/api/absences', requestBody, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.status === 201) {
          toast.success('Request submitted successfully', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true
          });
          setFormData({ start_date: '', end_date: '', reason: '' });
          setTimeout(onClose, 4000);
        } else {
          throw new Error('Unexpected response status: ' + response.status);
        }
      }
      onClose();
    } catch (err) {
      console.error('Error:', err);
      toast.error(
        err.response?.data?.message || 'Failed to update request',
        {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          icon: '⚠️'
        }
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target.className === 'vacation-request-modal') {
      onClose();
      document.body.classList.remove('modal-open');
    }
  };

  React.useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  return (
    <div className="vacation-request-modal" onClick={handleBackdropClick}>
      <ToastContainer />
      <div className="vacation-form-container">
        <h2>{editingRequest ? 'Edit Vacation Request' : 'Request Vacation'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <FaCalendarAlt className="form-icon" />
              Start Date
            </label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="form-group">
            <label>
              <FaCalendarAlt className="form-icon" />
              End Date
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              required
              min={formData.start_date || new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="form-group">
            <label>
              <FaFileAlt className="form-icon" />
              Reason
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
              rows="4"
              placeholder="Please provide a reason for your vacation request..."
            />
          </div>
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => { onClose(); document.body.classList.remove('modal-open'); }} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Saving...' : editingRequest ? 'Save Changes' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default VacationRequest;