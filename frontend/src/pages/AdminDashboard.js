import React, { useState, useEffect } from 'react';
import { adminAPI, ordersAPI } from '../utils/api';
import ProductManagement from '../components/ProductManagement';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab !== 'products') {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const loadData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'stats') {
        const statsResponse = await adminAPI.getStats();
        setStats(statsResponse.data);
      } else if (activeTab === 'users') {
        const usersResponse = await adminAPI.getUsers();
        setUsers(usersResponse.data);
      } else if (activeTab === 'orders') {
        const ordersResponse = await ordersAPI.getAll();
        setOrders(ordersResponse.data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('คุณแน่ใจว่าจะลบผู้ใช้นี้?')) {
      try {
        await adminAPI.deleteUser(userId);
        setUsers(users.filter(u => u.id !== userId));
        alert('ลบผู้ใช้สำเร็จ');
      } catch (error) {
        alert('เกิดข้อผิดพลาด');
      }
    }
  };

  const handleResetPassword = async (userId) => {
    if (window.confirm('รีเซ็ตรหัสผ่านเป็น 123456?')) {
      try {
        await adminAPI.resetPassword(userId);
        alert('รีเซ็ตรหัสผ่านสำเร็จ');
      } catch (error) {
        alert('เกิดข้อผิดพลาด');
      }
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await adminAPI.updateUserRole(userId, newRole);
      const updatedUsers = users.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      );
      setUsers(updatedUsers);
      alert('เปลี่ยน role สำเร็จ');
    } catch (error) {
      alert('เกิดข้อผิดพลาด');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      // Call the API to update order status
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // Update local state
        const updatedOrders = orders.map(o =>
          o.id === orderId ? { ...o, status: newStatus } : o
        );
        setOrders(updatedOrders);
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
        alert('อัปเดตสถานะสำเร็จ');
      } else {
        alert('เกิดข้อผิดพลาดในการอัปเดตสถานะ');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('เกิดข้อผิดพลาด');
    }
  };

  const handleProductsUpdate = () => {
    // Reload stats when products are updated
    loadData();
  };

  const renderContent = () => {
    if (loading && activeTab !== 'products') {
      return (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">กำลังโหลด...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'stats':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
              <h3 className="text-gray-600 font-semibold mb-2">ผู้ใช้ทั้งหมด</h3>
              <p className="text-4xl font-bold text-blue-600">{stats?.totalUsers || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
              <h3 className="text-gray-600 font-semibold mb-2">คำสั่งซื้อ</h3>
              <p className="text-4xl font-bold text-green-600">{stats?.totalOrders || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-amber-500">
              <h3 className="text-gray-600 font-semibold mb-2">ยอดขายทั้งหมด</h3>
              <p className="text-4xl font-bold text-amber-600">{stats?.totalSales || 0}฿</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-red-500">
              <h3 className="text-gray-600 font-semibold mb-2">สินค้าทั้งหมด</h3>
              <p className="text-4xl font-bold text-red-600">{stats?.totalProducts || 0}</p>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-amber-600 to-amber-700 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Username</th>
                    <th className="px-4 py-3 text-left font-semibold">Email</th>
                    <th className="px-4 py-3 text-left font-semibold">Role</th>
                    <th className="px-4 py-3 text-left font-semibold">สร้างเมื่อ</th>
                    <th className="px-4 py-3 text-left font-semibold">การกระทำ</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, idx) => (
                    <tr key={user.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 border-b">{user.id}</td>
                      <td className="px-4 py-3 border-b font-semibold text-gray-800">{user.username}</td>
                      <td className="px-4 py-3 border-b text-gray-600">{user.email}</td>
                      <td className="px-4 py-3 border-b">
                        <select
                          value={user.role}
                          onChange={(e) => handleChangeRole(user.id, e.target.value)}
                          className="px-3 py-1 border border-amber-300 rounded bg-white text-gray-800 font-semibold"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 border-b text-gray-600">
                        {new Date(user.created_at).toLocaleDateString('th-TH')}
                      </td>
                      <td className="px-4 py-3 border-b space-x-2">
                        <button
                          onClick={() => handleResetPassword(user.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold transition"
                        >
                          รีเซ็ต
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold transition"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-amber-600 to-amber-700 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">ID</th>
                    <th className="px-4 py-3 text-left font-semibold">โต๊ะ</th>
                    <th className="px-4 py-3 text-left font-semibold">ยอดรวม</th>
                    <th className="px-4 py-3 text-left font-semibold">สถานะ</th>
                    <th className="px-4 py-3 text-left font-semibold">สร้างเมื่อ</th>
                    <th className="px-4 py-3 text-left font-semibold">การกระทำ</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => (
                    <tr key={order.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 border-b font-semibold text-gray-800">#{order.id}</td>
                      <td className="px-4 py-3 border-b font-bold text-amber-700">{order.shipping_address}</td>
                      <td className="px-4 py-3 border-b font-bold text-amber-700">{order.total_price}฿</td>
                      <td className="px-4 py-3 border-b">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-sm font-semibold cursor-pointer ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                            }`}
                        >
                          <option value="pending">รอยืนยัน</option>
                          <option value="confirmed">ยืนยันแล้ว</option>
                          <option value="completed">เสร็จสิ้น</option>
                          <option value="cancelled">ยกเลิก</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 border-b text-gray-600">
                        {new Date(order.created_at).toLocaleDateString('th-TH')}
                      </td>
                      <td className="px-4 py-3 border-b">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold transition"
                        >
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'products':
        return <ProductManagement onProductsUpdate={handleProductsUpdate} />;

      default:
        return null;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-4xl font-bold text-amber-900 mb-8">Admin Dashboard</h2>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white p-4 rounded-lg shadow-md">
        {['stats', 'users', 'orders', 'products'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg font-semibold transition ${activeTab === tab
                ? 'bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            {tab === 'stats' && 'สถิติ'}
            {tab === 'users' && 'ผู้ใช้'}
            {tab === 'orders' && 'คำสั่งซื้อ'}
            {tab === 'products' && 'สินค้า'}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-amber-100 to-amber-200 p-6 border-b-2 border-amber-300 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-amber-900">
                รายละเอียดคำสั่งซื้อ #{selectedOrder.id}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-2xl font-bold text-amber-900 hover:text-amber-700"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="mb-2">
                  <strong className="text-amber-900">หมายเลขโต๊ะ:</strong> {selectedOrder.shipping_address}
                </p>
                <p className="mb-2">
                  <strong className="text-amber-900">ยอดรวม:</strong> <span className="text-amber-700 font-bold text-lg">{selectedOrder.total_price}฿</span>
                </p>
                <p className="mb-2">
                  <strong className="text-amber-900">สร้างเมื่อ:</strong> {new Date(selectedOrder.created_at).toLocaleDateString('th-TH')}
                </p>
                {selectedOrder.notes && (
                  <p>
                    <strong className="text-amber-900">หมายเหตุ:</strong> {selectedOrder.notes}
                  </p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-lg text-amber-900 mb-3">สินค้า:</h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map(item => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border-l-4 border-amber-300">
                      <div>
                        <p className="font-semibold text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-600">จำนวน: {item.quantity} ชิ้น</p>
                      </div>
                      <p className="font-bold text-amber-700">{item.price * item.quantity}฿</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-100 p-4 rounded-lg border-2 border-amber-300">
                <label className="block font-bold text-amber-900 mb-2">เปลี่ยนสถานะ:</label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                  className="w-full px-4 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:border-amber-500 font-semibold"
                >
                  <option value="pending">รอยืนยัน</option>
                  <option value="confirmed">ยืนยันแล้ว</option>
                  <option value="completed">เสร็จสิ้น</option>
                  <option value="cancelled">ยกเลิก</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
