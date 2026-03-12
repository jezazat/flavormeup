import React, { useState, useEffect } from 'react';
import { cartAPI, ordersAPI } from '../utils/api';

export default function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await cartAPI.getCart();
      setCartItems(response.data);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to get the correct image URL path
  const getImagePath = (imageUrl) => {
    if (!imageUrl) return null;
    
    // If it's already a full URL, use it as-is
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // If it looks like an uploaded file (product- prefix), load from /uploads
    if (imageUrl.includes('product-')) {
      return `http://localhost:5000/uploads/${imageUrl}`;
    }
    
    // Otherwise it's a legacy image, load from /images
    return `/images/${imageUrl}`;
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await cartAPI.updateItem(itemId, newQuantity);
      loadCart();
    } catch (error) {
      alert(error.response?.data?.error || 'เกิดข้อผิดพลาด');
    }
  };

  const handleRemoveItem = async (itemId) => {
    if (window.confirm('คุณแน่ใจหรือว่าจะลบสินค้านี้?')) {
      try {
        await cartAPI.removeItem(itemId);
        loadCart();
      } catch (error) {
        alert('เกิดข้อผิดพลาด');
      }
    }
  };

  const handleCheckout = async () => {
    if (!tableNumber.trim()) {
      alert('กรุณากรอกหมายเลขโต๊ะ');
      return;
    }

    try {
      const items = cartItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }));

      await ordersAPI.create(items, tableNumber, notes);
      alert('สั่งซื้อสำเร็จแล้ว');
      setCartItems([]);
      setTableNumber('');
      setNotes('');
    } catch (error) {
      alert(error.response?.data?.error || 'เกิดข้อผิดพลาด');
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-4xl font-bold text-amber-900 mb-8 text-center">ตะกร้าสินค้า</h2>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">กำลังโหลด...</p>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-2xl text-gray-600 mb-4">ตะกร้าว่างเปล่า</p>
          <a href="/" className="bg-amber-600 text-white px-6 py-3 rounded-lg hover:bg-amber-700 transition">
            ไปช้อปปิ้ง
          </a>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-md p-4 border-l-4 border-amber-500">
                  <div className="flex gap-4 items-start">
                    {item.image_url ? (
                      <img 
                        src={getImagePath(item.image_url)} 
                        alt={item.name}
                        className="w-24 h-24 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : null}
                    {!item.image_url && (
                      <div className="w-24 h-24 bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg flex items-center justify-center text-3xl">
                        [รูปภาพ]
                      </div>
                    )}
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-amber-900">{item.name}</h3>
                      <p className="text-sm text-amber-600 font-semibold">{item.category}</p>
                      <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                      <p className="text-xl font-bold text-amber-700">{item.price}฿</p>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      {/* Quantity Control */}
                      <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2">
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 w-8 h-8 rounded flex items-center justify-center font-bold transition"
                        >
                          −
                        </button>
                        <input 
                          type="number" 
                          value={item.quantity} 
                          readOnly 
                          className="w-12 text-center bg-white font-bold border-0"
                        />
                        <button 
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="bg-gray-300 hover:bg-gray-400 text-gray-800 w-8 h-8 rounded flex items-center justify-center font-bold transition"
                        >
                          +
                        </button>
                      </div>

                      {/* Total & Remove */}
                      <div className="text-right">
                        <p className="text-lg font-bold text-amber-700 mb-2">
                          {item.price * item.quantity}฿
                        </p>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition font-semibold"
                        >
                          ลบ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Section */}
          <div className="bg-white rounded-lg shadow-md p-6 border-2 border-amber-300 h-fit sticky top-24">
            <h3 className="text-2xl font-bold text-amber-900 mb-4">สรุปคำสั่ง</h3>
            
            <div className="bg-amber-50 p-4 rounded-lg mb-6">
              <p className="text-gray-600">ยอดรวม:</p>
              <p className="text-3xl font-bold text-amber-700">{totalPrice}฿</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  หมายเลขโต๊ะ <span className="text-red-600">*</span>
                </label>
                <input
                  type="number"
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="เช่น: 5"
                  min="1"
                  required
                  className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  หมายเหตุ (ไม่บังคับ)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="หมายเหตุเพิ่มเติม..."
                  className="w-full px-3 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-amber-500 transition resize-none"
                  rows="3"
                />
              </div>

              <button 
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white font-bold py-4 rounded-lg hover:from-amber-700 hover:to-amber-800 transition text-lg"
              >
                สั่งซื้อสินค้า
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
