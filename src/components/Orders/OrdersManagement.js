import React, { useState, useEffect } from 'react';
import './OrdersManagement.css';

const OrdersManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);

    // API Base URL - adjust this according to your backend
    const API_BASE_URL = 'http://localhost:8000';

    // Fetch all orders
    const fetchOrders = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/orders/`);
            if (!response.ok) {
                throw new Error('Failed to fetch orders');
            }
            const data = await response.json();
            setOrders(data);
        } catch (err) {
            setError('Error fetching orders: ' + err.message);
            console.error('Error fetching orders:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch single order by ID
    const fetchOrderById = async (orderId) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch order details');
            }
            const data = await response.json();
            setSelectedOrder(data);
        } catch (err) {
            setError('Error fetching order details: ' + err.message);
            console.error('Error fetching order details:', err);
        } finally {
            setLoading(false);
        }
    };

    // Delete order
    const deleteOrder = async (orderId) => {
        if (!window.confirm('Are you sure you want to delete this order?')) {
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete order');
            }
            await response.json();
            // Refresh orders list after deletion
            fetchOrders();
            setSelectedOrder(null);
        } catch (err) {
            setError('Error deleting order: ' + err.message);
            console.error('Error deleting order:', err);
        } finally {
            setLoading(false);
        }
    };

    // Format date for display
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    // Load orders on component mount
    useEffect(() => {
        fetchOrders();
    }, []);

    return (
        <div className="orders-management">
            <div className="orders-header">
                <h2>Orders Management</h2>
                <button 
                    className="refresh-btn"
                    onClick={fetchOrders}
                    disabled={loading}
                >
                    {loading ? 'Loading...' : 'Refresh'}
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="orders-container">
                <div className="orders-list">
                    <h3>All Orders ({orders.length})</h3>
                    {loading && <div className="loading">Loading orders...</div>}
                    
                    {!loading && orders.length === 0 && (
                        <div className="no-orders">
                            No orders found.
                        </div>
                    )}

                    {!loading && orders.length > 0 && (
                        <div className="orders-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Email</th>
                                        <th>Created At</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <tr key={order.order_id}>
                                            <td>{order.order_id}</td>
                                            <td>{order.email}</td>
                                            <td>{formatDate(order.created_at)}</td>
                                            <td>
                                                <button
                                                    className="view-btn"
                                                    onClick={() => fetchOrderById(order.order_id)}
                                                >
                                                    View
                                                </button>
                                                <button
                                                    className="delete-btn"
                                                    onClick={() => deleteOrder(order.order_id)}
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {selectedOrder && (
                    <div className="order-details">
                        <div className="order-details-header">
                            <h3>Order Details</h3>
                            <button
                                className="close-btn"
                                onClick={() => setSelectedOrder(null)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="order-details-content">
                            <div className="detail-item">
                                <label>Order ID:</label>
                                <span>{selectedOrder.order_id}</span>
                            </div>
                            <div className="detail-item">
                                <label>Email:</label>
                                <span>{selectedOrder.email}</span>
                            </div>
                            <div className="detail-item">
                                <label>Created At:</label>
                                <span>{formatDate(selectedOrder.created_at)}</span>
                            </div>
                            <div className="detail-item">
                                <label>Message:</label>
                                <div className="message-content">
                                    {selectedOrder.message}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OrdersManagement;
