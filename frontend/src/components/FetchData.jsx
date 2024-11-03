import axios from 'axios';
import Navbar from './Navbar'
import React, { useEffect, useState } from 'react';
import '../styles/Orders.css';

const FetchData = () => {
    const [orders, setOrders] = useState([]); 

    useEffect(() => {
        fetch('http://localhost:8000/api/show-orders/')
          .then(response => response.json())
          .then(data => setOrders(data))
          .catch(error => console.error('Error fetching orders:', error));
      }, []);

    const fetchOrders = async () => {
        try {
            const response = await axios.get('http://localhost:8000/api/fetch-orders/');
            console.log(response.data);
            alert(response.data.message);
        } catch (error) {
            console.error('Error fetching orders:', error);
            alert('Failed to fetch orders.');
        }
        window.location.reload()
    };

    return (
        <>
        <Navbar/>
        
        <div className="orders-container">
      {orders.map(order => (
        <div key={order.order_id} className="order-card">
          <h3>Order ID: {order.order_id}</h3>
          <p>Date: {new Date(order.order_date).toLocaleString()}</p>
          <p>Customer: {order.customer_name}</p>
          <p>Email: {order.customer_email}</p>
          <p>Phone: {order.customer_phone}</p>
          <p>Address: {order.shipping_address}, {order.shipping_city}, {order.shipping_postcode}, {order.shipping_country}</p>
          <p>Payment Method: {order.payment_method}</p>
          <p>Total Amount: {order.total_amount} {order.currency}</p>
          {/* Additional order details can be added here */}
        </div>
      ))}
    </div>
    <button onClick={fetchOrders} style={{ backgroundColor: 'blue', color: 'white' }}>Update Orders</button>
        </>
    );
};

export default FetchData;