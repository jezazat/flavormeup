import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { productsAPI, cartAPI } from '../utils/api';
import { AuthContext } from '../utils/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    loadProducts();
  }, [search, category]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getAll(category, search);
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId, quantity = 1) => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อน');
      navigate('/login');
      return;
    }

    try {
      await cartAPI.addItem(productId, quantity);
      alert('เพิ่มลงตะกร้าสำเร็จ');
    } catch (error) {
      alert(error.response?.data?.error || 'เกิดข้อผิดพลาด');
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Search Section */}
      <div className="mb-8">
        <h2 className="text-4xl font-bold text-center text-amber-900 mb-6">
          ค้นหาเครื่องดื่มที่คุณชอบ
        </h2>
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-6 rounded-lg shadow-md">
          <input
            type="text"
            placeholder="ค้นหาสินค้า..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 text-gray-800"
          />
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 text-gray-800 bg-white"
          >
            <option value="">ทั้งหมด</option>
            <option value="tea">ชา</option>
            <option value="coffee">กาแฟ</option>
            <option value="dessert">ขนมหวาน</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 font-semibold">กำลังโหลด...</p>
        </div>
      ) : (
        <div>
          {products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">ไม่พบสินค้า</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(product => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-lg shadow-md hover:shadow-xl transition transform hover:scale-105 overflow-hidden border-2 border-transparent hover:border-amber-300"
                >
                  {/* Product Image */}
                  {product.image_url ? (
                    <img 
                      src={getImagePath(product.image_url)} 
                      alt={product.name}
                      className="w-full h-48 object-cover bg-gray-100"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : null}
                  {!product.image_url && (
                    <div className="w-full h-48 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-4xl">
                      [รูปภาพ]
                    </div>
                  )}
                  
                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="text-xl font-bold text-amber-900 mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-amber-600 font-semibold mb-2">
                      {product.category}
                    </p>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                    
                    {/* Price & Stock */}
                    <div className="flex justify-between items-center mb-4">
                      <p className="text-2xl font-bold text-amber-700">
                        {product.price}฿
                      </p>
                      <p className={`text-sm font-semibold ${
                        product.stock > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        สต็อก: {product.stock}
                      </p>
                    </div>
                    
                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product.id, 1)}
                      disabled={product.stock === 0}
                      className={`w-full py-3 rounded-lg font-bold transition ${
                        product.stock === 0
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-600 to-amber-700 text-white hover:from-amber-700 hover:to-amber-800'
                      }`}
                    >
                      {product.stock === 0 ? 'หมดสต็อก' : 'เพิ่มไปตะกร้า'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
