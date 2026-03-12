import React, { useState, useEffect } from 'react';
import { ordersAPI } from '../utils/api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getAll();
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await ordersAPI.getById(orderId);
      setSelectedOrder(response.data);
    } catch (error) {
      alert('ไม่สามารถโหลดรายละเอียดคำสั่งได้');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': 
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'รอยืนยัน' };
      case 'confirmed': 
        return { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'ยืนยันแล้ว' };
      case 'completed': 
        return { bg: 'bg-green-100', text: 'text-green-800', icon: 'เสร็จสิ้น' };
      case 'cancelled': 
        return { bg: 'bg-red-100', text: 'text-red-800', icon: 'ยกเลิก' };
      default: 
        return { bg: 'bg-gray-100', text: 'text-gray-800', icon: 'ไม่ทราบ' };
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'รอการยืนยัน';
      case 'confirmed': return 'ยืนยันแล้ว';
      case 'completed': return 'สำเร็จ';
      case 'cancelled': return 'ยกเลิก';
      default: return status;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-4xl font-bold text-amber-900 mb-8 text-center">ประวัติการสั่งซื้อ</h2>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">กำลังโหลด...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-2xl text-gray-600 mb-4">ยังไม่มีการสั่งซื้อ</p>
          <a href="/" className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition">
            ไปช้อปปิ้ง
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const badge = getStatusBadge(order.status);
            return (
              <div key={order.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition p-6 border-l-4 border-amber-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-amber-900">
                        คำสั่ง #{order.id}
                      </h3>
                      <span className={`px-3 py-1 rounded-full font-semibold text-sm ${badge.bg} ${badge.text}`}>
                        {badge.icon}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      {new Date(order.created_at).toLocaleDateString('th-TH', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-amber-700 font-bold text-lg">
                      ยอดรวม: {order.total_price}฿
                    </p>
                  </div>
                  <button
                    onClick={() => handleViewDetails(order.id)}
                    className="bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-3 rounded-lg hover:from-amber-700 hover:to-amber-800 transition font-semibold whitespace-nowrap"
                  >
                    ดูรายละเอียด
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-amber-100 to-amber-200 p-6 border-b-2 border-amber-300">
              <h3 className="text-2xl font-bold text-amber-900">
                รายละเอียดคำสั่งซื้อ #{selectedOrder.id}
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-amber-50 p-4 rounded-lg">
                <p className="mb-2">
                  <strong className="text-amber-900">สถานะ:</strong>{' '}
                  <span className={`ml-2 px-3 py-1 rounded-full ${getStatusBadge(selectedOrder.status).bg} ${getStatusBadge(selectedOrder.status).text} font-semibold text-sm`}>
                    {getStatusText(selectedOrder.status)}
                  </span>
                </p>
                <p className="mb-2">
                  <strong className="text-amber-900">หมายเลขโต๊ะ:</strong> {selectedOrder.shipping_address}
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
                <p className="text-lg">
                  <strong className="text-amber-900">ยอดรวมทั้งหมด:</strong>
                  <span className="text-2xl font-bold text-amber-700 ml-2">{selectedOrder.total_price}฿</span>
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-gray-700 hover:bg-gray-800 text-white font-bold py-3 rounded-lg transition mt-6"
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
