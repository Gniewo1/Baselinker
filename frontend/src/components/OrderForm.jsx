import React, { useState } from 'react';
import axios from 'axios';

const OrderForm = () => {
    const [orderData, setOrderData] = useState({
        order_id: '',
        order_status: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
        shipping_address: '',
        shipping_city: '',
        shipping_postcode: '',
        shipping_country: '',
        payment_status: '',
        payment_method: '',
        total_amount: 0,
        currency: 'USD',
        items: [],  // array of items
    });

    const [item, setItem] = useState({
        product_id: '',
        product_name: '',
        price: 0,
        quantity: 1,
    });

    // Handle order form input changes
    const handleChange = (e) => {
        setOrderData({ ...orderData, [e.target.name]: e.target.value });
    };

    // Handle item form input changes
    const handleItemChange = (e) => {
        setItem({ ...item, [e.target.name]: e.target.value });
    };

    // Add item to items list
    const addItem = () => {
        const lineTotal = parseFloat(item.price) * parseInt(item.quantity);
        const newItem = { ...item, line_total: lineTotal };
        setOrderData({ ...orderData, items: [...orderData.items, newItem] });
        setItem({ product_id: '', product_name: '', price: 0, quantity: 1 });
    };

    // Submit order
    const submitOrder = async () => {
        try {
            const response = await axios.post('http://localhost:8000/api/orders/', orderData);
            console.log('Order created:', response.data);
        } catch (error) {
            console.error('Error creating order:', error);
        }
    };

    return (
        <div>
            <h2>Create Order</h2>
            <form>
                <input type="text" name="order_id" value={orderData.order_id} onChange={handleChange} placeholder="Order ID" />
                <input type="text" name="order_status" value={orderData.order_status} onChange={handleChange} placeholder="Order Status" />
                <input type="text" name="customer_name" value={orderData.customer_name} onChange={handleChange} placeholder="Customer Name" />
                <input type="email" name="customer_email" value={orderData.customer_email} onChange={handleChange} placeholder="Customer Email" />
                <input type="text" name="customer_phone" value={orderData.customer_phone} onChange={handleChange} placeholder="Customer Phone" />
                <input type="text" name="shipping_address" value={orderData.shipping_address} onChange={handleChange} placeholder="Shipping Address" />
                <input type="text" name="shipping_city" value={orderData.shipping_city} onChange={handleChange} placeholder="City" />
                <input type="text" name="shipping_postcode" value={orderData.shipping_postcode} onChange={handleChange} placeholder="Postcode" />
                <input type="text" name="shipping_country" value={orderData.shipping_country} onChange={handleChange} placeholder="Country" />
                <input type="text" name="payment_status" value={orderData.payment_status} onChange={handleChange} placeholder="Payment Status" />
                <input type="text" name="payment_method" value={orderData.payment_method} onChange={handleChange} placeholder="Payment Method" />
                <input type="number" name="total_amount" value={orderData.total_amount} onChange={handleChange} placeholder="Total Amount" />
                <input type="text" name="currency" value={orderData.currency} onChange={handleChange} placeholder="Currency" />

                <h3>Add Item</h3>
                <input type="text" name="product_id" value={item.product_id} onChange={handleItemChange} placeholder="Product ID" />
                <input type="text" name="product_name" value={item.product_name} onChange={handleItemChange} placeholder="Product Name" />
                <input type="number" name="price" value={item.price} onChange={handleItemChange} placeholder="Price" />
                <input type="number" name="quantity" value={item.quantity} onChange={handleItemChange} placeholder="Quantity" />
                <button type="button" onClick={addItem}>Add Item</button>

                <button type="button" onClick={submitOrder}>Submit Order</button>
            </form>
        </div>
    );
};

export default OrderForm;