import React, { useState  } from "react";
import Header from "./Header";
import "./App.css";
import {BrowserRouter as Router,Routes,Route,Navigate,Link} from "react-router-dom";
import EmployeManagement from "./Employe/EmployeManagement";
import Login from "./Login";
import ClientManagement from "./Clients/ClientManagement";
import ProductManagement from "./Produits/ProductManagement";
import SupplierManagement from "./supplier/SupplierManagement";
import VacationRequest from "./Vacation/VacationRequest";
import VacationRequests from "./Requests/VacationRequests";
import StockMouvement from './Stock/StockMouvement';
import StockManagement from './Stock/StockManagement';
import PurchaseOrderManagement from './PurchaseOrderManagement/PurchaseOrderManagement';
import ClientOrderManagement from "./OrderClient/ClientOrderManagement";
import Dashboard from "./Dashboard/Dashboard";
import PurchaseInvoices from "./PurchaseInvoices/PurchaseInvoices";
import SalesInvoices from "./SalesInvoices/SalesInvoices";
import WithholdingTax from './WithholdingTax/WithholdingTax';
import QuoteManagement from "./QuoteManagement/QuoteManagement";
import RoleManagement from "./Role/RoleManagement";
import { AuthProvider } from './AuthContext';

const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

function App() {
  const [isAuthenticatedState, setIsAuthenticatedState] = useState(
    isAuthenticated()
  );

  const handleLogin = () => {
    setIsAuthenticatedState(true);
  };
  const userRole = localStorage.getItem('userRole');
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    setIsAuthenticatedState(false);
  };

  return (
    <AuthProvider>
    <Router>
      <div className="app-wrapper">
        {isAuthenticatedState && (
          <Header className="header" onLogout={handleLogout} />
        )}
        <main className="main-content">
          <div style={{ height: "1000px", background: "rgb(255, 255, 255)" }}>
            <Routes>
              <Route
                path="/"
                element={
                  isAuthenticatedState ? (
                    <Navigate to="/Dashboard" />
                  ) : (
                    <Navigate to="/login" />
                  )
                }
              />

              <Route
                path="/login"
                element={
                  !isAuthenticatedState ? (
                    <Login onLogin={handleLogin} />
                  ) : (
                    <Navigate to="/Dashboard" />
                  )
                }
              />

              <Route path="/EmployeManagement" element={<EmployeManagement />} />
              <Route path="/ClientManagement" element={<ClientManagement />} />
              <Route path="/ProductManagement" element={<ProductManagement />} />
              <Route path="/SupplierManagement" element={<SupplierManagement />} />
              <Route path="/VacationRequest" element={<VacationRequest />} />
              <Route path="/VacationRequests" element ={<VacationRequests/>} />
              <Route path="/StockMouvement" element={<StockMouvement />} />
              <Route path="/StockManagement" element={<StockManagement />} />
              <Route path="/PurchaseOrderManagement" element={<PurchaseOrderManagement />} />
              <Route path="/ClientOrderManagement" element={<ClientOrderManagement />} />
              <Route path="/Dashboard" element={<Dashboard />} />
              <Route path="/PurchaseInvoices" element={<PurchaseInvoices />} />
              <Route path="/SalesInvoices" element={<SalesInvoices />} />
              <Route path="/WithholdingTax" element={<WithholdingTax />} />
              <Route path="/QuoteManagement" element={<QuoteManagement />} />
              <Route path="/RoleManagement" element={<RoleManagement />} />
            </Routes>
            <nav>
               {['admin', 'manager'].includes(userRole) && (
              <Link to="/Dashboard">Dashboard</Link>
              )}
   
  </nav>
          </div>
        </main>
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;
