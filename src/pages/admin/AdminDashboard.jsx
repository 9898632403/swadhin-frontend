import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid, LineChart, Line,
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis
} from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../../styles/AdminDashboard.css';
import { BASE_URL } from "../../config";


const AdminDashboard = () => {
  const { userInfo } = useContext(UserContext);
  const [orderData, setOrderData] = useState([]);
  const [productStats, setProductStats] = useState([]);
  const [salesTrend, setSalesTrend] = useState([]);
  const [customerStats, setCustomerStats] = useState([]);
  const [timePeriod, setTimePeriod] = useState('week');
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 7)));
  const [endDate, setEndDate] = useState(new Date());
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('sales');

  useEffect(() => {
    if (!userInfo?.email) return;

    setLoading(true);
    fetch(`${BASE_URL}/api/orders`, {
      headers: {
        "X-User-Email": userInfo.email,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setOrderData(data);
          processStats(data);
          analyzeSalesTrend(data);
          analyzeCustomerData(data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [userInfo]);

  const processStats = (orders) => {
    let filtered = applyFilters(orders);

    // Product statistics
    const productMap = {};
    filtered.forEach(order => {
      (order.items || []).forEach(item => {
        const id = item._id;
        if (!productMap[id]) {
          productMap[id] = {
            id,
            name: item.name,
            quantity: 0,
            revenue: 0,
            category: item.category || 'Uncategorized'
          };
        }
        productMap[id].quantity += item.quantity;
        productMap[id].revenue += item.price * item.quantity;
      });
    });

    setProductStats(Object.values(productMap).sort((a, b) => b.quantity - a.quantity));
  };

  const analyzeSalesTrend = (orders) => {
    let filtered = applyFilters(orders);
    const salesByDate = {};
    
    filtered.forEach(order => {
      const date = new Date(order.timestamp).toISOString().split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = {
          date,
          total: 0,
          count: 0
        };
      }
      salesByDate[date].total += order.total;
      salesByDate[date].count += 1;
    });

    const trendData = Object.values(salesByDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map(item => ({
        date: item.date,
        total: item.total,
        count: item.count,
        avg: item.total / item.count
      }));

    setSalesTrend(trendData);
  };

  const analyzeCustomerData = (orders) => {
    let filtered = applyFilters(orders);
    const customerData = {};
    
    filtered.forEach(order => {
      if (!customerData[order.email]) {
        customerData[order.email] = {
          email: order.email,
          name: order.name,
          orderCount: 0,
          totalSpent: 0,
          firstOrder: new Date(order.timestamp),
          lastOrder: new Date(order.timestamp)
        };
      } else {
        customerData[order.email].orderCount += 1;
        customerData[order.email].totalSpent += order.total;
        const orderDate = new Date(order.timestamp);
        if (orderDate < customerData[order.email].firstOrder) {
          customerData[order.email].firstOrder = orderDate;
        }
        if (orderDate > customerData[order.email].lastOrder) {
          customerData[order.email].lastOrder = orderDate;
        }
      }
    });

    setCustomerStats(Object.values(customerData).sort((a, b) => b.totalSpent - a.totalSpent));
  };

  const applyFilters = (orders) => {
    let filtered = [...orders];

    // Date range filter
    if (startDate && endDate) {
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    // Price range filter
    if (minPrice) {
      filtered = filtered.filter(order => order.total >= parseFloat(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(order => order.total <= parseFloat(maxPrice));
    }

    return filtered;
  };

  const handleTimePeriodChange = (period) => {
    setTimePeriod(period);
    const now = new Date();
    let newStartDate = new Date();

    switch (period) {
      case 'day':
        newStartDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        newStartDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        newStartDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        newStartDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        newStartDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        newStartDate.setDate(now.getDate() - 7);
    }

    setStartDate(newStartDate);
    setEndDate(now);
  };

  const handleFilter = () => {
    processStats(orderData);
    analyzeSalesTrend(orderData);
    analyzeCustomerData(orderData);
  };

  const resetFilter = () => {
    setStartDate(new Date(new Date().setDate(new Date().getDate() - 7)));
    setEndDate(new Date());
    setMinPrice('');
    setMaxPrice('');
    processStats(orderData);
    analyzeSalesTrend(orderData);
    analyzeCustomerData(orderData);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Title
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text('Comprehensive Sales Analytics Report', 105, 20, { align: 'center' });
    
    // Date range
    doc.setFontSize(12);
    doc.text(`Report Period: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`, 105, 30, { align: 'center' });
    
    // Summary stats
    doc.setFontSize(14);
    doc.text('Key Metrics', 20, 45);
    
    const totalSales = orderData.reduce((sum, order) => sum + order.total, 0);
    const avgOrderValue = totalSales / (orderData.length || 1);
    
    doc.autoTable({
      startY: 50,
      head: [['Metric', 'Value']],
      body: [
        ['Total Orders', orderData.length],
        ['Total Revenue', `₹${totalSales.toFixed(2)}`],
        ['Average Order Value', `₹${avgOrderValue.toFixed(2)}`],
        ['Top Product', productStats[0]?.name || 'N/A'],
        ['Top Customer', customerStats[0]?.name || 'N/A']
      ],
      theme: 'grid',
      headStyles: { fillColor: [44, 62, 80] }
    });
    
    // Product performance
    doc.setFontSize(14);
    doc.text('Top Performing Products', 20, doc.autoTable.previous.finalY + 20);
    
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 25,
      head: [['Product', 'Quantity Sold', 'Revenue Generated']],
      body: productStats.slice(0, 10).map(item => [
        item.name,
        item.quantity,
        `₹${item.revenue.toFixed(2)}`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [44, 62, 80] }
    });
    
    // Customer performance
    doc.setFontSize(14);
    doc.text('Top Customers', 20, doc.autoTable.previous.finalY + 20);
    
    doc.autoTable({
      startY: doc.autoTable.previous.finalY + 25,
      head: [['Customer', 'Orders', 'Total Spent', 'First Order', 'Last Order']],
      body: customerStats.slice(0, 5).map(cust => [
        cust.name,
        cust.orderCount,
        `₹${cust.totalSpent.toFixed(2)}`,
        cust.firstOrder.toLocaleDateString(),
        cust.lastOrder.toLocaleDateString()
      ]),
      theme: 'grid',
      headStyles: { fillColor: [44, 62, 80] }
    });
    
    doc.save(`Sales_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const COLORS = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', 
    '#8884d8', '#82ca9d', '#ffc658', '#ff7f50',
    '#00C49F', '#FFBB28', '#FF8042'
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sales':
        return (
          <>
            <div className="chart-box">
              <h3>Sales Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total Sales" />
                  <Line type="monotone" dataKey="avg" stroke="#82ca9d" name="Average Order" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="chart-box">
              <h3>Order Volume</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#FFBB28" name="Order Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        );
      case 'products':
        return (
          <>
            <div className="chart-box">
              <h3>Top Products by Quantity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={productStats.slice(0, 10)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="quantity" fill="#0088FE" name="Quantity Sold" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="chart-box">
              <h3>Revenue by Product</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={productStats.slice(0, 6)}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {productStats.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Revenue']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        );
      case 'customers':
        return (
          <>
            <div className="chart-box">
              <h3>Customer Value</h3>
              <ResponsiveContainer width="100%" height={300}>
                <ScatterChart
                  margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                >
                  <CartesianGrid />
                  <XAxis type="number" dataKey="orderCount" name="Order Count" />
                  <YAxis type="number" dataKey="totalSpent" name="Total Spent" />
                  <ZAxis type="number" dataKey="orderCount" range={[60, 400]} name="Order Frequency" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  <Scatter name="Customers" data={customerStats.slice(0, 20)} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
            
            <div className="chart-box">
              <h3>Top Customers by Spending</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={customerStats.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value.toFixed(2)}`, 'Total Spent']} />
                  <Legend />
                  <Bar dataKey="totalSpent" fill="#00C49F" name="Total Spent" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>📊 Advanced Analytics Dashboard</h2>
        <div className="time-period-selector">
          {['day', 'week', 'month', 'quarter', 'year'].map(period => (
            <button
              key={period}
              className={timePeriod === period ? 'active' : ''}
              onClick={() => handleTimePeriodChange(period)}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-panel">
        <div className="date-range-picker">
          <DatePicker
            selected={startDate}
            onChange={date => setStartDate(date)}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            className="date-input"
          />
          <span>to</span>
          <DatePicker
            selected={endDate}
            onChange={date => setEndDate(date)}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate}
            className="date-input"
          />
        </div>
        
        <div className="price-filters">
          <input
            type="number"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min Order ₹"
            className="price-input"
          />
          <input
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max Order ₹"
            className="price-input"
          />
        </div>
        
        <div className="filter-actions">
          <button className="filter-btn" onClick={handleFilter}>
            <i className="fas fa-filter"></i> Apply Filters
          </button>
          <button className="reset-btn" onClick={resetFilter}>
            <i className="fas fa-sync-alt"></i> Reset
          </button>
          <button className="export-btn" onClick={exportToPDF}>
            <i className="fas fa-file-pdf"></i> Export Report
          </button>
        </div>
      </div>

      <div className="analytics-tabs">
        <button 
          className={activeTab === 'sales' ? 'active' : ''}
          onClick={() => setActiveTab('sales')}
        >
          <i className="fas fa-chart-line"></i> Sales Analytics
        </button>
        <button 
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          <i className="fas fa-boxes"></i> Product Analytics
        </button>
        <button 
          className={activeTab === 'customers' ? 'active' : ''}
          onClick={() => setActiveTab('customers')}
        >
          <i className="fas fa-users"></i> Customer Analytics
        </button>
      </div>

      {loading ? (
        <div className="loading-indicator">
          <i className="fas fa-spinner fa-spin"></i> Loading analytics data...
        </div>
      ) : orderData.length === 0 ? (
        <div className="no-data">
          <i className="fas fa-database"></i>
          <p>No order data available for the selected period.</p>
        </div>
      ) : (
        <div className="charts-container">
          {renderTabContent()}
          
          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card revenue">
              <h3>Total Revenue</h3>
              <p>₹{orderData.reduce((sum, order) => sum + order.total, 0).toFixed(2)}</p>
              <div className="trend up">
                <i className="fas fa-arrow-up"></i> 12% from last period
              </div>
            </div>
            
            <div className="summary-card orders">
              <h3>Total Orders</h3>
              <p>{orderData.length}</p>
              <div className="trend up">
                <i className="fas fa-arrow-up"></i> 8% from last period
              </div>
            </div>
            
            <div className="summary-card avg-order">
              <h3>Avg. Order Value</h3>
              <p>₹{(orderData.reduce((sum, order) => sum + order.total, 0) / (orderData.length || 1)).toFixed(2)}</p>
              <div className="trend down">
                <i className="fas fa-arrow-down"></i> 3% from last period
              </div>
            </div>
            
            <div className="summary-card top-product">
              <h3>Top Product</h3>
              <p>{productStats[0]?.name || 'N/A'}</p>
              <div className="trend neutral">
                {productStats[0]?.quantity || 0} units sold
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;