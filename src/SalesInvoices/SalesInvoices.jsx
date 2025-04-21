import React, { useState, useEffect } from 'react';
import { FaEye, FaDownload } from 'react-icons/fa';
import axios from 'axios';
import html2pdf from 'html2pdf.js';
import './SalesInvoices.css';

const SalesInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/sales-invoices', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setInvoices(response.data);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    }
  };

  const handleView = async (invoiceId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/sales-invoices/${invoiceId}`, {
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
      await axios.put(`http://localhost:5000/api/sales-invoices/${invoiceId}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }}
      );
      fetchInvoices();
    } catch (error) {
      console.error('Error updating invoice status:', error);
    }
  };

  const handleDownload = async (invoice) => {
    try {
      setDownloadingInvoiceId(invoice.id); // Set the specific invoice ID
      // Fetch invoice details first
      const response = await axios.get(`http://localhost:5000/api/sales-invoices/${invoice.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      const invoiceWithDetails = response.data;
      
      const invoiceContent = document.createElement('div');
      invoiceContent.innerHTML = `
        <div style="padding: 20px;">
         
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div>
              <h3>Invoice #${invoiceWithDetails.invoice.invoicenumber}</h3>
              <p>Client: ${invoiceWithDetails.invoice.client_name}</p>
            </div>
            <div>
              <p>Issue Date: ${new Date(invoiceWithDetails.invoice.issuedate).toLocaleDateString()}</p>
              <p>Due Date: ${new Date(invoiceWithDetails.invoice.duedate).toLocaleDateString()}</p>
            </div>
          </div>
  
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px;">Product</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Unit Price</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Total Price</th>
                <th style="border: 1px solid #ddd; padding: 8px;">TVA (19%)</th>
                <th style="border: 1px solid #ddd; padding: 8px;">Total with TVA</th>
              </tr>
            </thead>
            <tbody>
              ${invoiceWithDetails.details.map(detail => {
                const totalPrice = Number(detail.totalprice);
                const tva = totalPrice * 0.19;
                const totalWithTVA = totalPrice + tva;
                return `
                  <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">${detail.product_name}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">${detail.quantity}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">DT${Number(detail.unitprice).toFixed(2)}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">DT${totalPrice.toFixed(2)}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">DT${tva.toFixed(2)}</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">DT${totalWithTVA.toFixed(2)}</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
  
          <div style="text-align: right; margin-top: 20px; border-top: 2px solid #ddd; padding-top: 20px;">
            <h3>Subtotal: DT${Number(invoiceWithDetails.invoice.totalamount).toFixed(2)}</h3>
            <h3>TVA (19%): DT${(Number(invoiceWithDetails.invoice.totalamount) * 0.19).toFixed(2)}</h3>
            <h3>Timbre fiscal: DT 1.00</h3>
            <h3>Total: DT ${(Number(invoiceWithDetails.invoice.totalamount) * 1.19 + 1).toFixed(2)}</h3>
          </div>
        </div>
      `;
  
      const opt = {
        margin: 1,
        filename: `invoice-${invoiceWithDetails.invoice.invoicenumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          logging: true 
        },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      };
  
      await html2pdf().from(invoiceContent).set(opt).save();
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Add error handling here (e.g., show error message to user)
    } finally {
      setDownloadingInvoiceId(null); // Clear the downloading state
    }
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="sales-invoices-container">
      <h1>Sales Invoices</h1>
      
      {/* Add the search bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by client name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      <table className="invoices-table">
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th>Client</th>
            <th>Order ID</th>
            <th>Issue Date</th>
            <th>Due Date</th>
            <th>Total Amount</th>
            <th>Payment Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredInvoices.map((invoice) => (
            <tr key={invoice.id}>
              <td>{invoice.invoicenumber}</td>
              <td>{invoice.client_name}</td>
              <td>{invoice.clientorderid}</td>
              <td>{new Date(invoice.issuedate).toLocaleDateString()}</td>
              <td>{new Date(invoice.duedate).toLocaleDateString()}</td>
              <td>
                ${typeof invoice.totalamount === 'number' 
                  ? invoice.totalamount.toFixed(2) 
                  : Number(invoice.totalamount).toFixed(2)}
              </td>
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
                    onClick={() => handleView(invoice.id)} 
                    className="action-btn view-btn"
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button 
                    onClick={() => handleDownload(invoice)} 
                    className="action-btn download-btn"
                    title="Download PDF"
                    disabled={downloadingInvoiceId === invoice.id}
                  >
                    {downloadingInvoiceId === invoice.id ? 'Generating...' : <FaDownload />}
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
              <div className="invoice-header">
                <img src="/FlexERP (1).png" alt="Logo" className="invoice-logo" />
              </div>
              <div className="invoice-header-info">
                <div>
                  <h3>Invoice #{selectedInvoice.invoice.invoicenumber}</h3>
                  <p>Client: {selectedInvoice.invoice.client_name}</p>
                  <p>Order ID: {selectedInvoice.invoice.clientorderid}</p>
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
                    <th>TVA (19%)</th>
                    <th>Total with TVA</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.details.map((detail) => {
                    const totalPrice = typeof detail.totalprice === 'number' 
                      ? detail.totalprice 
                      : Number(detail.totalprice);
                    const tva = totalPrice * 0.19;
                    const totalWithTVA = totalPrice + tva;

                    return (
                      <tr key={detail.id}>
                        <td>{detail.product_name}</td>
                        <td>{detail.quantity}</td>
                        <td>
                          ${typeof detail.unitprice === 'number' 
                            ? detail.unitprice.toFixed(2) 
                            : Number(detail.unitprice).toFixed(2)}
                        </td>
                        <td>${totalPrice.toFixed(2)}</td>
                        <td>${tva.toFixed(2)}</td>
                        <td>${totalWithTVA.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <div className="invoice-total">
                {(() => {
                  const totalAmount = typeof selectedInvoice.invoice.totalamount === 'number'
                    ? selectedInvoice.invoice.totalamount
                    : Number(selectedInvoice.invoice.totalamount);
                  const totalTVA = totalAmount * 0.19;
                  const timbreFiscal = 1;
                  const finalTotal = totalAmount + totalTVA + timbreFiscal;

                  return (
                    <>
                      <h3>Subtotal: {totalAmount.toFixed(2)}dt</h3>
                      <h3>TVA (19%): {totalTVA.toFixed(2)}dt</h3>
                      <h3>Timbre fiscal: DT 1.00</h3>
                      <h3>Total: {finalTotal.toFixed(2)}dt</h3>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesInvoices;