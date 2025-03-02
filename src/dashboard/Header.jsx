import React from 'react';  
import './Header.css';
import { LiaUserShieldSolid } from "react-icons/lia";
import { PiUsersThreeLight } from "react-icons/pi";
import { TfiShoppingCart } from "react-icons/tfi";
import { MdOutlineDashboard } from "react-icons/md";
import { LiaProductHunt } from "react-icons/lia";
import { CiFaceSmile } from "react-icons/ci";
import { TbTruckDelivery } from 'react-icons/tb'; // Add this import for supplier icon

function Header({ onLogout }) {
  return (  
    <header className="header">  
      <a href="./HomePage"><img src="/FlexERP.png" alt="" className="logoh" /></a>  
      <nav className="navbar">  
        <ul className="nav-links">
          <li>
            <a href="./HomePage">
              <MdOutlineDashboard className="nav-icon" />
              Dashboard
            </a>
          </li> 
          <li>
            <a href="./EmployeManagement">
              <PiUsersThreeLight className="nav-icon" />
              Employees
            </a>
          </li>   
          <li>
            <a href="./ProductManagement">
              <LiaProductHunt className="nav-icon" />
              Products
            </a>
          </li>  
          <li>
            <a href="./UserManagement">
              <LiaUserShieldSolid className="nav-icon" />
              Users
            </a>
          </li>   
          <li>
            <a href="./ClientManagement">
              <CiFaceSmile className="nav-icon" />
              Clients
            </a>
          </li> 
          <li>
            <a href="./SupplierManagement">
              <TbTruckDelivery className="nav-icon" />
              Suppliers
            </a>
          </li>
          <li>
            <a href="./Orders">
              <TfiShoppingCart className="nav-icon" />
              Orders
            </a>
          </li> 
        </ul> 
      </nav>  
      <div className="auth-buttons">
        <button className="logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>  
  );  
}

export default Header;