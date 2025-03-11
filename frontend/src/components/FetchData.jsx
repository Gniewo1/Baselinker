import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import '../styles/Orders.css';

const FetchData = () => {
    const [orders, setOrders] = useState([]);
    const [statusFilter, setStatusFilter] = useState('');
    const [statusChanges, setStatusChanges] = useState({}); // Tracks selected statuses for orders

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
        window.location.reload();
    };

    const updateOrderStatus = async (orderId) => {
        const newStatus = statusChanges[orderId];
        if (!newStatus) {
            alert('Please select a status to update.');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:8000/api/update-order-status/${orderId}/`, {
                order_status: newStatus,
            });
            console.log(response.data);
            alert(response.data.message);

            // Update the order status locally
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.order_id === orderId ? { ...order, order_status: newStatus } : order
                )
            );

            // Clear the selected status after successful update
            setStatusChanges(prevChanges => {
                const newChanges = { ...prevChanges };
                delete newChanges[orderId];
                return newChanges;
            });
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Failed to update order status.');
        }
    };

    const handleStatusChange = (orderId, newStatus) => {
        setStatusChanges(prevChanges => ({
            ...prevChanges,
            [orderId]: newStatus,
        }));
    };

    const filteredOrders = orders.filter(order =>
        statusFilter === '' || order.order_status === statusFilter
    );

    return (
        <>
            <Navbar />

            {/* Invisible Container */}
            <div className="invisible-container"></div>

            {/* Status Filter Dropdown */}
            <div className="filter-container">
                <label htmlFor="statusFilter">Filtruj: </label>
                <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="">Wszystkie</option>
                    <option value="Nowe zamówienie">Nowe zamówienie</option>
                    <option value="Do wysłania">Do wysłania</option>
                    <option value="Wysłane">Wysłane</option>
                    <option value="Anulowane">Anulowane</option>
                </select>
            </div>

            <div className="orders-container">
                {filteredOrders.map(order => (
                    <div key={order.order_id} className="order-card">
                        <h3>Order ID: {order.order_id}</h3>
                        
                        <div className="status-update-container">
                            <select
                                value={statusChanges[order.order_id] || order.order_status}
                                onChange={(e) => handleStatusChange(order.order_id, e.target.value)}
                            >
                                <option value="Nowe zamówienie">Nowe zamówienie</option>
                                <option value="Do wysłania">Do wysłania</option>
                                <option value="Wysłane">Wysłane</option>
                                <option value="Anulowane">Anulowane</option>
                            </select>
                            <button
                                onClick={() => updateOrderStatus(order.order_id)}
                                style={{ marginLeft: '10px', backgroundColor: 'blue', color: 'white' }}
                            >
                                Aktualizacja
                            </button>
                        </div>
                        <p><span style={{ fontWeight: 'bold' }}>Status:</span> {order.order_status}</p>
                        <p><span style={{ fontWeight: 'bold' }}>Data:</span> {new Date(order.order_date).toLocaleString()}</p>
                        <p><span style={{ fontWeight: 'bold' }}>Klient:</span> {order.customer_name}</p>
                        <p><span style={{ fontWeight: 'bold' }}>Email:</span> {order.customer_email}</p>
                        <p><span style={{ fontWeight: 'bold' }}>Telefon:</span> {order.customer_phone}</p>
                        <p><span style={{ fontWeight: 'bold' }}>Adres:</span> {order.shipping_address}, {order.shipping_city}, {order.shipping_postcode}, {order.shipping_country}</p>
                        <p><span style={{ fontWeight: 'bold' }}>Metoda płatności:</span> {order.payment_method}</p>
                        <p><span style={{ fontWeight: 'bold' }}>Łącznie zapłacone:</span> {order.total_cost_paid} {order.currency}</p>
                        <p><span style={{ fontWeight: 'bold' }}>Łącznie do zapłaty:</span> {order.total_cost} {order.currency}</p>
                        
                    </div>
                ))}
            </div>

            <button onClick={fetchOrders} style={{ backgroundColor: 'blue', color: 'white' }}>Zaktualizuj zamówienia</button>
        </>
    );
};

export default FetchData;