import React, { useEffect, useState } from "react";
import axios from "axios";
import { Pie, Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import "./Dashboard.css";

ChartJS.register(
  ArcElement,
  LineElement,
  BarElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [data, setData] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const [purchaseOrdersChart, setPurchaseOrdersChart] = useState({
    labels: ['Total Amount', 'Approved Amount'],
    datasets: [{
      label: 'Purchase Orders (Last 30 Days)',
      data: [0, 0],
      backgroundColor: [
        'rgba(54, 162, 235, 0.6)',
        'rgba(75, 192, 192, 0.6)'
      ],
      borderColor: [
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 192, 1)'
      ],
      borderWidth: 1
    }]
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/dashboard", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        console.log("Dashboard data:", response.data); // Debug log
        setData(response.data);

        // Update purchase orders chart
        setPurchaseOrdersChart(prev => ({
          ...prev,
          datasets: [{
            ...prev.datasets[0],
            data: [
              Number(response.data.purchaseOrdersStats?.totalAmount || 0),
              Number(response.data.purchaseOrdersStats?.approvedAmount || 0)
            ]
          }]
        }));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };
    fetchData();
  }, []);

  // Order Statistics Chart
  const orderStatsChart = {
    labels: data.orderStats?.map((stat) => stat.status),
    datasets: [
      {
        data: data.orderStats?.map((stat) => stat.count),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
      },
    ],
  };

  // Revenue Chart
  const revenueChart = {
    labels: data.revenueLastWeek?.map((r) =>
      new Date(r.date).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Revenue (Daily)",
        data: data.revenueLastWeek?.map((r) => r.total),
        borderColor: "#36A2EB",
        fill: false,
      },
    ],
  };

  // Filtered Orders
  const filteredOrders =
    statusFilter === "all"
      ? data.recentOrders
      : data.recentOrders?.filter((order) => order.status === statusFilter);

  // Employee Stats Chart
  const employeeRolesChart = {
    labels: data.employeeStats?.map((role) => role.role),
    datasets: [
      {
        label: "Number of Employees",
        data: data.employeeStats?.map((role) => role.count),
        backgroundColor: data.employeeStats?.map((role) => {
          switch (role.role.toLowerCase()) {
            case 'admin':
              return '#FF6384'; // Red for Admin
            case 'manager':
              return '#36A2EB'; // Blue for Manager
            case 'worker':
              return '#4BC0C0'; // Teal for Worker
            default:
              return '#FFCE56'; // Yellow for any other role
          }
        }),
      },
    ],
  };

  // Monthly Revenue Chart
  const monthlyRevenueChart = {
    labels: data.monthlyRevenue?.map((r) =>
      new Date(r.month).toLocaleString("default", {
        month: "short",
        year: "numeric",
      })
    ),
    datasets: [
      {
        label: "Revenue (Monthly)",
        data: data.monthlyRevenue?.map((r) => r.total),
        borderColor: "#FF6384",
        fill: false,
      },
    ],
  };

  return (
    <div className="dashboard-container">

      {/* Section 1: Overview */}
      <div className="overview-section">
        <div className="overview-card">
          <h2>Order Statistics</h2>
          {data.orderStats && <Pie data={orderStatsChart} />}
        </div>
        <div className="overview-card">
          <h2 className="tit">Daily Revenue (Last 7 Days)</h2>
          {data.revenueLastWeek && <Line data={revenueChart} />}
        </div>
        <div className="overview-card">
          <div className="card-header">
            <h2>Out of Stock Products</h2>
            <a href="./StockManagement" className="view-all-link">View All</a>
          </div>
          <p className={`out-of-stock ${data.outOfStockCount > 0 ? "red" : "green"}`}>
            {data.outOfStockCount || 0}
          </p>
        </div>
      </div>

      {/* Section 2: Performance */}
      <div className="performance-section">
        <div className="performance-card">
          <div className="card-header">
            <h2 className="tit">Employee Roles</h2>
            <a href="./EmployeManagement" className="view-all-link">View All</a>
          </div>
          {data.employeeStats && <Bar data={employeeRolesChart} />}
        </div>
        <div className="performance-card">
          <h2 className="tit">Monthly Revenue (Last 6 Months)</h2>
          {data.monthlyRevenue && <Line data={monthlyRevenueChart} />}
        </div>
        <div className="performance-card">
          <div className="card-header">
            <h2>Purchase Orders Summary</h2>
            <a href="./PurchaseOrderManagement" className="view-all-link">View All</a>
          </div>
          <div className="chart-container">
            <Bar 
              data={purchaseOrdersChart}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'bottom',
                  },
                  title: {
                    display: true,
                    text: `Total Orders: ${data.purchaseOrdersStats?.orderCount || 0}`,
                    padding: {
                      bottom: 10
                    }
                  }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => `dt${value}`
                    }
                  }
                }
              }}
            />
          </div>
          <div className="stats-summary">
            <div className="stat-item">
              <span className="stat-label">Total Amount:</span>
              <span className="stat-value">
                {data.purchaseOrdersStats?.totalAmount ? 
                  Number(data.purchaseOrdersStats.totalAmount).toFixed(2) : 
                  '0.00'}dt
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Approved Amount:</span>
              <span className="stat-value">
                 {data.purchaseOrdersStats?.approvedAmount ? 
                  Number(data.purchaseOrdersStats.approvedAmount).toFixed(2) : 
                  '0.00'}dt
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Orders */}
      <div className="orders-section">
        <div className="section-header">
          <h2>Recent Orders</h2>
          <a href="./ClientOrderManagement" className="view-all-link">View All</a>
        </div>
        <div className="filter-container">
          <label>Filter by Status: </label>
          <select
            onChange={(e) => setStatusFilter(e.target.value)}
            value={statusFilter}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
           
          </select>
        </div>
        <table className="orders-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders?.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.client_name}</td>
                <td>{order.status}</td>
                <td>
                  {typeof order.total_amount === "number"
                    ? `dt${order.total_amount.toFixed(2)}`
                    : `dt${parseFloat(order.total_amount).toFixed(2)}`}
                </td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Section 4: Stock Management */}
      <div className="stock-section">
        <div className="stock-card">
          <div className="card-header">
            <h2>Low Stock Products</h2>
            <a href="./StockManagement" className="view-all-link">View All</a>
          </div>
          <table className="stock-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Quantity</th>
              </tr>
            </thead>
            <tbody>
              {data.lowStockProducts?.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td className={product.quantity <= 5 ? "red" : "warning"}>
                    {product.quantity}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="stock-card">
          <div className="card-header">
            <h2 >Recent Stock Movements</h2>
            <a href="./StockMouvement" className="view-all-link">View All</a>
          </div>
          <table className="stock-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentStockMovements?.map((movement) => (
                <tr key={movement.id}>
                  <td>{movement.product_name}</td>
                  <td>{movement.movement_type}</td>
                  <td>{movement.quantity}</td>
                  <td>
                    {new Date(movement.movement_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
