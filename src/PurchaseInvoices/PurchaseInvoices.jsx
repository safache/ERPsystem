import React, { useState, useEffect } from 'react';
import { FaEye, FaDownload } from 'react-icons/fa';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './PurchaseInvoices.css';
import html2pdf from 'html2pdf.js';

const getCurrentTimestamp = () => {
  return new Date().toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

const PurchaseInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/purchase-invoices', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Fetch items for each invoice
      const invoicesWithItems = await Promise.all(
        response.data.map(async (invoice) => {
          const itemsResponse = await axios.get(
            `http://localhost:5000/api/purchase-invoices/${invoice.id}/items`, // Fixed URL
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
          return { ...invoice, items: itemsResponse.data };
        })
      );
      
      setInvoices(invoicesWithItems);
    } catch (error) {
      console.error('Error fetching invoices:', error);
      toast.error('Error fetching invoices');
    }
  };

  const handleView = async (invoiceId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/purchase-invoices/${invoiceId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setSelectedInvoice(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching invoice details:', error);
    }
  };



  const handleStatusChange = async (invoiceId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/purchase-invoices/${invoiceId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      fetchInvoices(); // Refresh the list
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };

  const handleDownload = async (invoice) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/purchase-invoices/${invoice.id}/items`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      console.log('API Response:', response.data);

      // Process items with careful number handling
      const items = response.data.map(item => {
        console.log('Processing item:', item);
        return {
          ...item,
          quantity: parseInt(item.quantity) || 0,
          unitprice: parseFloat(item.unitprice) || 0,
          totalprice: parseFloat(item.totalprice) || 0
        };
      });

      console.log('Processed items:', items);

      // Calculate totals
      const subtotal = items.reduce((sum, item) => sum + item.totalprice, 0);
      const tva = subtotal * 0.19;
      const totalTTC = subtotal + tva;

      console.log('Calculated totals:', { subtotal, tva, totalTTC });

      const content = document.createElement('div');
      content.innerHTML = `
        <div style="padding: 20px; font-family: Arial, sans-serif;">
          <div style="text-align: center; margin-bottom: 20px;">
            <p style="font-size: 20px; color: #4B5563; margin: 0;">${invoice.invoicenumber}</p>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <h3 style="color: #4B5563; margin-bottom: 10px;">Supplier Details</h3>
              <p style="margin: 5px 0;">Name: ${invoice.supplier_name}</p>
              <p style="margin: 5px 0;">Issue Date: ${new Date(invoice.issuedate).toLocaleDateString()}</p>
              <p style="margin: 5px 0;">Due Date: ${new Date(invoice.duedate).toLocaleDateString()}</p>
            </div>
          </div>

          <h3 style="color: #4B5563; margin: 20px 0 10px;">Products Details</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #F3F4F6;">
                <th style="padding: 12px; border: 1px solid #E5E7EB; text-align: left;">Product Name</th>
                <th style="padding: 12px; border: 1px solid #E5E7EB; text-align: center;">Quantity</th>
                <th style="padding: 12px; border: 1px solid #E5E7EB; text-align: right;">Unit Price </th>
                <th style="padding: 12px; border: 1px solid #E5E7EB; text-align: right;">Total </th>
              </tr>
            </thead>
            <tbody>
              ${items.map(item => `
                <tr>
                  <td style="padding: 12px; border: 1px solid #E5E7EB;">${item.product_name}</td>
                  <td style="padding: 12px; border: 1px solid #E5E7EB; text-align: center;">${item.quantity}</td>
                  <td style="padding: 12px; border: 1px solid #E5E7EB; text-align: right;">${item.unitprice.toFixed(3)} DT</td>
                  <td style="padding: 12px; border: 1px solid #E5E7EB; text-align: right;">${(item.quantity * item.unitprice).toFixed(3)} DT</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="3" style="padding: 12px; border: 1px solid #E5E7EB; text-align: right; font-weight: bold;">Total HT:</td>
                <td style="padding: 12px; border: 1px solid #E5E7EB; text-align: right; font-weight: bold;">${subtotal.toFixed(3)} DT</td>
              </tr>
              <tr>
                <td colspan="3" style="padding: 12px; border: 1px solid #E5E7EB; text-align: right; font-weight: bold;">TVA (19%):</td>
                <td style="padding: 12px; border: 1px solid #E5E7EB; text-align: right; font-weight: bold;">${tva.toFixed(3)} DT</td>
              </tr>
              <tr style="background-color: #F3F4F6;">
                <td colspan="3" style="padding: 12px; border: 1px solid #E5E7EB; text-align: right; font-weight: bold;">Total TTC:</td>
                <td style="padding: 12px; border: 1px solid #E5E7EB; text-align: right; font-weight: bold;">${totalTTC.toFixed(3)}DT</td>
              </tr>
            </tfoot>
          </table>

        </div>
      `;

      const opt = {
        margin: 1,
        filename: `Invoice-${invoice.invoicenumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };

      await html2pdf().from(content).set(opt).save();
      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading invoice:', error);
      console.log('Error details:', error.response?.data);
      toast.error('Failed to download invoice');
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="purchase-invoices-container">
      <ToastContainer />
      <h1>Purchase Invoices</h1>
      
      {/* Add the search bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by supplier name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <table className="invoices-table">
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th>Supplier</th>
            <th>Issue Date</th>
            <th>Due Date</th>
            <th></th> {/* New column */}
            <th>Total Amount</th>
            <th>Payment Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
        {filteredInvoices.map((invoice) => (
      <tr key={invoice.id}>
        <td>{invoice.invoicenumber}</td>
        <td>{invoice.supplier_name}</td>
        <td>{new Date(invoice.issuedate).toLocaleDateString()}</td>
        <td>{new Date(invoice.duedate).toLocaleDateString()}</td>
        <td></td> {/* New cell */}
        <td>{Number(invoice.totalamount).toFixed(3)}dt</td>
        <td>
          <select
            className={`status-select ${invoice.status}`}
            value={invoice.status}
            onChange={(e) => handleStatusChange(invoice.id, e.target.value)}
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
          </select>
              </td>
              <td>
                <div className="action-buttons">
                  <button
                    onClick={() => handleDownload(invoice)}
                    className="action-btn download-btn"
                    title="Download Invoice"
                  >
                    <FaDownload />
                  </button>
                  <button 
                    onClick={() => handleView(invoice.id)} 
                    className="action-btn view-btn"
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showDetailsModal && selectedInvoice && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Invoice Details</h2>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="invoice-details">
              <div className="invoice-header-info">
                <div>
                  <h3>Invoice #{selectedInvoice.invoice.invoicenumber}</h3>
                  <p>Supplier: {selectedInvoice.invoice.supplier_name}</p>
                </div>
                <div>
                  <p>Issue Date: {new Date(selectedInvoice.invoice.issuedate).toLocaleDateString()}</p>
                  <p>Due Date: {new Date(selectedInvoice.invoice.duedate).toLocaleDateString()}</p>
                </div>
              </div>
              <table className="details-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total Price</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.details.map((detail) => (
                    <tr key={detail.id}>
                      <td>{detail.product_name}</td>
                      <td>{detail.quantity}</td>
                      <td>
                        ${typeof detail.unitprice === 'number' 
                          ? detail.unitprice.toFixed(2) 
                          : Number(detail.unitprice).toFixed(2)}
                      </td>
                      <td>
                        ${typeof detail.totalprice === 'number'
                          ? detail.totalprice.toFixed(2)
                          : Number(detail.totalprice).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="invoice-total">
                <h3>
                  Total Amount: ${typeof selectedInvoice.invoice.totalamount === 'number'
                    ? selectedInvoice.invoice.totalamount.toFixed(2)
                    : Number(selectedInvoice.invoice.totalamount).toFixed(2)}
                </h3>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseInvoices;