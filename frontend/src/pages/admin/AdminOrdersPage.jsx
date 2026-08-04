import React, { useEffect, useState } from 'react';
import AdminLayout from '../../admin/AdminLayout.jsx';

// Admin Orders Page – premium styled table with status management
const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch all orders (admin protected endpoint)
    useEffect(() => {
        const token = localStorage.getItem('token');
        fetch('http://localhost:5000/api/admin/orders', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch orders');
                return res.json();
            })
            .then((data) => {
                // Expected shape: { success: true, orders: [...] } or plain array
                const fetched = data.orders || data;
                setOrders(fetched);
                setLoading(false);
            })
            .catch((err) => {
                setError(err.message);
                setLoading(false);
            });
    }, []);

    const updateStatus = (orderId, newStatus) => {
        const token = localStorage.getItem('token');
        fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ status: newStatus }),
        })
            .then((res) => {
                if (!res.ok) throw new Error('Status update failed');
                return res.json();
            })
            .then(() => {
                // Optimistically update UI
                setOrders((prev) =>
                    prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
                );
            })
            .catch((err) => alert(err.message));
    };

    if (loading) return <AdminLayout><p className="p-8 text-center text-white">Loading orders…</p></AdminLayout>;
    if (error) return <AdminLayout><p className="p-8 text-center text-red-400">{error}</p></AdminLayout>;

    return (
        <AdminLayout>
            <section className="p-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white min-h-screen">
                <h1 className="text-4xl font-bold mb-6 text-center animate-fade-in-up">Admin Orders</h1>
                <div className="overflow-x-auto rounded-lg shadow-lg">
                    <table className="w-full table-auto bg-gray-800/80 backdrop-blur-sm">
                        <thead className="bg-gray-900/80">
                            <tr className="text-left">
                                <th className="px-4 py-2">Order ID</th>
                                <th className="px-4 py-2">Customer</th>
                                <th className="px-4 py-2">Total</th>
                                <th className="px-4 py-2">Status</th>
                                <th className="px-4 py-2">Payment</th>
                                <th className="px-4 py-2">Tracking Notes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => (
                                <tr key={order._id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                    <td className="px-4 py-2 font-mono text-sm">{order._id?.slice(0, 12)}…</td>
                                    <td className="px-4 py-2">{order.user?.name || order.user?.email || 'N/A'}</td>
                                    <td className="px-4 py-2">${order.total?.toFixed(2) || order.subtotal?.toFixed(2) || '0.00'}</td>
                                    <td className="px-4 py-2">
                                        <select
                                            value={order.status || 'Pending'}
                                            onChange={(e) => updateStatus(order._id, e.target.value)}
                                            className="bg-gray-700 text-white rounded px-2 py-1"
                                        >
                                            <option value="Pending">Pending</option>
                                            <option value="Processing">Processing</option>
                                            <option value="Shipped">Shipped</option>
                                            <option value="Delivered">Delivered</option>
                                            <option value="Cancelled">Cancelled</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-2">
                                        {order.isPaid ? (
                                            <span className="text-green-400">Paid</span>
                                        ) : (
                                            <span className="text-red-400">Unpaid</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2">
                                        <input
                                            type="text"
                                            defaultValue={order.trackingNotes || ''}
                                            placeholder="Tracking ID / notes"
                                            className="bg-gray-700 text-white rounded px-2 py-1 w-full"
                                            onBlur={(e) => {
                                                const notes = e.target.value;
                                                // Simple inline update – you can extend to a dedicated endpoint
                                                const token = localStorage.getItem('token');
                                                fetch(`http://localhost:5000/api/admin/orders/${order._id}/tracking`, {
                                                    method: 'PUT',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        Authorization: `Bearer ${token}`,
                                                    },
                                                    body: JSON.stringify({ trackingNotes: notes }),
                                                }).catch(() => { });
                                            }}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </AdminLayout>
    );
};

export default AdminOrdersPage;
