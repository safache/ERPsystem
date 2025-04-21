import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEye, FaDownload } from "react-icons/fa";
import html2pdf from "html2pdf.js";
import "./WithholdingTax.css";

const WithholdingTax = () => {
  const [withholdingTaxes, setWithholdingTaxes] = useState([]);
  const [selectedTax, setSelectedTax] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchWithholdingTaxes();
  }, []);

  const fetchWithholdingTaxes = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/withholding-taxes",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setWithholdingTaxes(response.data);
    } catch (error) {
      console.error("Error fetching withholding taxes:", error);
    }
  };

  const handleView = async (invoiceId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/sales-invoices/${invoiceId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setSelectedTax(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      console.error("Error fetching tax details:", error);
    }
  };

  const handleDownload = async (tax) => {
    const content = document.createElement("div");
    content.innerHTML = `
      <div style="padding: 15px; font-size: 12px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div style="max-width: 40%; text-align: left;">
            <h3 style="margin: 0; font-size: 12px;">République Tunisienne</h3>
            <h3 style="margin: 3px 0; font-size: 12px;">Ministère des Finances</h3>
            <h3 style="margin: 0; font-size: 12px;">Direction Générale du Contrôle Fiscal</h3>
          </div>
          <div style="max-width: 40%; text-align: right;">
            <h3 style="margin: 0; font-size: 14px; color:rgb(0, 4, 9);">Certification de Retenue</h3>
            <h3 style="margin: 3px 0; font-size: 14px; color:rgb(0, 0, 0);">d'Impôt sur le Revenu</h3>
            <h3 style="margin: 0; font-size: 14px; color:rgb(0, 0, 0);">ou d'Impôt sur les Sociétés</h3>
          </div>
        </div>

        <!-- Section A - Payeur -->
        <div style="margin-bottom: 10px;">
          <h3 style="background-color: #f8f9fa; padding: 6px; margin-bottom: 10px; font-size: 13px;">A- PERSONNE OU ORGANISME PAYEUR :</h3>
          <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
            <div style="width: 50%; max-width: 400px;">
              <p style="margin-bottom: 3px; font-weight: bold; font-size: 11px;">IDENTIFIANT</p>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 10px;">
                <tr>
                  <td style="padding: 3px; border: 1px solid #dee2e6;">Matricule Fiscal</td>
                  <td style="padding: 3px; border: 1px solid #dee2e6;">Code TVA</td>
                  <td style="padding: 3px; border: 1px solid #dee2e6;">Code Catégorie(2)</td>
                  <td style="padding: 3px; border: 1px solid #dee2e6;">N°Etab Secondaire</td>
                </tr>
                <tr>
                  <td style="padding: 3px; border: 1px solid #dee2e6;"></td>
                  <td style="padding: 3px; border: 1px solid #dee2e6;">A</td>
                  <td style="padding: 3px; border: 1px solid #dee2e6;">M</td>
                  <td style="padding: 3px; border: 1px solid #dee2e6;">000</td>
                </tr>
              </table>
            </div>
          </div>
          <p style="font-size: 11px;">Dénomination de la personne ou l'organisme payeur: ${
            tax.client_name
          }</p>
          <p style="font-size: 11px;">Adresse: ${
            tax.client_address || "Non spécifiée"
          }</p>
        </div>

        <!-- Section B - Montants -->
        <div style="margin-bottom: 10px;">
          <h3 style="background-color: #f8f9fa; padding: 6px; margin-bottom: 10px; font-size: 13px;">B- MONTANTS</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 11px;">
            <tr>
              <th style="padding: 5px; border: 1px solid #dee2e6; text-align: center; background-color: #f8f9fa;" colspan="2">B- RETENUES EFFECTUEES SUR</th>
              <th style="padding: 5px; border: 1px solid #dee2e6; text-align: center; background-color: #f8f9fa;">MONTANT BRUT</th>
              <th style="padding: 5px; border: 1px solid #dee2e6; text-align: center; background-color: #f8f9fa;">RETENUE</th>
              <th style="padding: 5px; border: 1px solid #dee2e6; text-align: center; background-color: #f8f9fa;">MONTANT NET</th>
            </tr>
            <tr>
              <td style="padding: 5px; border: 1px solid #dee2e6;" colspan="2">Retenus effectué N°Facture ${tax.invoice_number} </td>
              <td style="padding: 5px; border: 1px solid #dee2e6; text-align: right;">${Number(tax.montant_brut).toFixed(3)} </td>
              <td style="padding: 5px; border: 1px solid #dee2e6; text-align: right;">${Number(tax.retenue).toFixed(3)} </td>
              <td style="padding: 5px; border: 1px solid #dee2e6; text-align: right;">${Number(tax.montant_net).toFixed(3)} </td>
            </tr>
            <tr>
              <td style="padding: 5px; border: 1px solid #dee2e6;" colspan="5">Sur marché 1%</td>
            </tr>
            <tr>
              <td style="padding: 5px; border: 1px solid #dee2e6;" colspan="5">Sur honoraires 3%</td>
            </tr>
            <tr>
              <td style="padding: 5px; border: 1px solid #dee2e6;" colspan="5">Sur honoraires 10%</td>
            </tr>
            <tr>
              <td style="padding: 5px; border: 1px solid #dee2e6; font-weight: bold;" colspan="2">TOTAL</td>
              <td style="padding: 5px; border: 1px solid #dee2e6; text-align: right; font-weight: bold;">${Number(tax.montant_brut).toFixed(3)} DT</td>
              <td style="padding: 5px; border: 1px solid #dee2e6; text-align: right; font-weight: bold;">${Number(tax.retenue).toFixed(3)} DT</td>
              <td style="padding: 5px; border: 1px solid #dee2e6; text-align: right; font-weight: bold;">${Number(tax.montant_net).toFixed(3)} DT</td>
            </tr>
          </table>
        </div>

        <!-- Section C - Bénéficiaire -->
        <div style="margin-bottom: 10px;">
          <h3 style="background-color: #f8f9fa; padding: 6px; margin-bottom: 10px; font-size: 13px;">C- BÉNÉFICIAIRE</h3>
          <div style="display: flex; justify-content: flex-end; margin-bottom: 8px;">
            <div style="width: 50%; max-width: 400px;">
              <p style="margin-bottom: 3px; font-weight: bold; font-size: 11px;">IDENTIFIANT</p>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 8px; font-size: 10px;">
                <tr>
                  <td style="padding: 3px; border: 1px solid #dee2e6;">Matricule Fiscal</td>
                  <td style="padding: 3px; border: 1px solid #dee2e6;">Code TVA</td>
                  <td style="padding: 3px; border: 1px solid #dee2e6;">Code Catégorie(2)</td>
                  <td style="padding: 3px; border: 1px solid #dee2e6;">N°Etab Secondaire</td>
                </tr>
                <tr>
                  <td style="padding: 3px; border: 1px solid #dee2e6;"></td>
                  <td style="padding: 3px; border: 1px solid #dee2e6;">A</td>
                  <td style="padding: 3px; border: 1px solid #dee2e6;">M</td>
                  <td style="padding: 3px; border: 1px solid #dee2e6;">000</td>
                </tr>
              </table>
            </div>
          </div>
          <p style="font-size: 11px;">Dénomination de la personne ou l'organisme payeur: ${
            tax.beneficiary_name || ""
          }</p>
          <p style="font-size: 11px;">Adresse: ${
            tax.beneficiary_address || ""
          }</p>
        </div>

        <div style="width: 100%; border-top: 1px solid #000; margin-top: 15px;"></div>

        <div style="margin-top: 20px; text-align: right;">
                  <p style="margin-bottom: 5px; font-size: 11px;">Je soussigné , certifier exacts les renseignements  figurant sur le présent certificat et </p>
                  <p style="margin-bottom: 10px; font-size: 11px;">m'exposer aux sanctions prévus par la loi pour toute inexactitude.</p>

          <p style="margin-bottom: 20px; font-size: 11px;">Signature et Cachet</p>
          <div style="width: 150px; border-top: 1px solid #000; margin-left: auto;"></div>
        </div>
      </div>
    `;

    const opt = {
      margin: 0.5,
      filename: `attestation-retenue-${tax.invoice_number}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };

    await html2pdf().from(content).set(opt).save();
  };

  const filteredTaxes = withholdingTaxes.filter(tax =>
    tax.client_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="withholding-tax-container">
      <h1>Withholding Tax Records</h1>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by client name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <table className="tax-table">
        <thead>
          <tr>
            <th>Invoice Number</th>
            <th>Client</th>
            <th>Gross Amount</th>
            <th>Withholding Tax </th>
            <th>Net Amount</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredTaxes.map((tax) => (
            <tr key={tax.id}>
              <td>{tax.invoice_number}</td>
              <td>{tax.client_name}</td>
              <td>${Number(tax.montant_brut).toFixed(2)}</td>
              <td>${Number(tax.retenue).toFixed(2)}</td>
              <td>${Number(tax.montant_net).toFixed(2)}</td>
              <td>{new Date(tax.created_at).toLocaleDateString()}</td>
              <td>
                <div className="action-buttons">
                  <button
                    onClick={() => handleView(tax.sales_invoice_id)}
                    className="action-btn view-btn"
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleDownload(tax)}
                    className="action-btn download-btn"
                    title="Download Certificate"
                  >
                    <FaDownload />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showDetailsModal && selectedTax && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Withholding Tax Details</h2>
              <button
                className="close-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </button>
            </div>
            <div className="tax-details">
              <div className="tax-header">
                <img src="/FlexERP (1).png" alt="Logo" className="tax-logo" />
              </div>
              <div className="tax-info">
                <div>
                  <h3>Invoice #{selectedTax.invoice.invoicenumber}</h3>
                  <p>Client: {selectedTax.invoice.client_name}</p>
                </div>
                <div>
                  <p>
                    Date:{" "}
                    {new Date(
                      selectedTax.withholding_tax.created_at
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="tax-calculation">
                <table className="calculation-table">
                  <tbody>
                    <tr>
                      <td>Gross Amount:</td>
                      <td>
                        DT
                        {Number(
                          selectedTax.withholding_tax.montant_brut
                        ).toFixed(2)}
                      </td>
                    </tr>
                    <tr>
                      <td>Withholding Tax (1.5%):</td>
                      <td>
                        DT
                        {Number(selectedTax.withholding_tax.retenue).toFixed(2)}
                      </td>
                    </tr>
                    <tr className="net-amount">
                      <td>Net Amount:</td>
                      <td>
                        DT
                        {Number(
                          selectedTax.withholding_tax.montant_net
                        ).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithholdingTax;
