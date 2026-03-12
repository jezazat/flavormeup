import React, { useState, useEffect } from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const UPLOADS_URL = API_BASE_URL.replace(/\/api$/, '') + '/uploads';

export default function ProductManagement({ onProductsUpdate }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'coffee',
    price: '',
    stock: '',
    image_url: ''
  });

  const categories = [
    { value: 'coffee', label: 'กาแฟ' },
    { value: 'tea', label: 'ชา' },
    { value: 'milk', label: 'นมสด' },
    { value: 'soda', label: 'น้ำอัดลม' },
    { value: 'pastry', label: 'ขนมปัง' },
    { value: 'cake', label: 'เค้ก' }
  ];

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products/admin/all`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      alert('เกิดข้อผิดพลาดในการโหลดสินค้า');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      
      // Preview image
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target.result);
      };
      reader.readAsDataURL(file);

      // Upload to server
      const formDataUpload = new FormData();
      formDataUpload.append('image', file);

      const response = await fetch(`${API_BASE_URL}/products/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataUpload
      });

      if (response.ok) {
        const data = await response.json();
        setFormData({
          ...formData,
          image_url: data.imageUrl
        });
        alert('อัปโหลดรูปภาพสำเร็จ');
      } else {
        alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    } finally {
      setUploadingImage(false);
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
      return `${UPLOADS_URL}/${imageUrl}`;
    }
    
    // Otherwise it's a legacy image, load from /images
    return `/images/${imageUrl}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddProduct = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      category: 'coffee',
      price: '',
      stock: '',
      image_url: ''
    });
    setPreviewImage(null);
    setShowModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingId(product.id);
    setFormData(product);
    setPreviewImage(product.image_url);
    setShowModal(true);
  };

  const handleSaveProduct = async () => {
    if (!formData.name || !formData.price || !formData.stock) {
      alert('กรุณากรอกข้อมูลให้ครบ (ชื่อสินค้า, ราคา, จำนวนในสต๊อก)');
      return;
    }

    try {
      const url = editingId 
        ? `${API_BASE_URL}/products/${editingId}`
        : `${API_BASE_URL}/products`;

      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          category: formData.category,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          image_url: formData.image_url
        })
      });

      if (response.ok) {
        alert(editingId ? 'แก้ไขสินค้าสำเร็จ' : 'เพิ่มสินค้าสำเร็จ');
        setShowModal(false);
        loadProducts();
        if (onProductsUpdate) onProductsUpdate();
      } else {
        const error = await response.json();
        alert('เกิดข้อผิดพลาด: ' + error.error);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('คุณแน่ใจว่าจะลบสินค้านี้?')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        alert('ลบสินค้าสำเร็จ');
        loadProducts();
        if (onProductsUpdate) onProductsUpdate();
      } else {
        const error = await response.json();
        alert('เกิดข้อผิดพลาด: ' + (error.error || 'ไม่สามารถลบสินค้า'));
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  const handleUpdateStock = async (productId, newStock) => {
    try {
      const product = products.find(p => p.id === productId);
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...product,
          stock: newStock
        })
      });

      if (response.ok) {
        loadProducts();
        if (onProductsUpdate) onProductsUpdate();
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      alert('เกิดข้อผิดพลาด: ' + error.message);
    }
  };

  if (loading) {
    return <div className="text-center py-12"><p className="text-xl text-gray-600">กำลังโหลด...</p></div>;
  }

  return (
    <div>
      {/* Add Product Button */}
      <div className="mb-6">
        <button
          onClick={handleAddProduct}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-semibold transition shadow-md"
        >
          + เพิ่มสินค้าใหม่
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-amber-600 to-amber-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">ID</th>
                <th className="px-4 py-3 text-left font-semibold">รูปภาพ</th>
                <th className="px-4 py-3 text-left font-semibold">ชื่อสินค้า</th>
                <th className="px-4 py-3 text-left font-semibold">ราคา</th>
                <th className="px-4 py-3 text-left font-semibold">จำนวนในสต๊อก</th>
                <th className="px-4 py-3 text-left font-semibold">หมวดหมู่</th>
                <th className="px-4 py-3 text-left font-semibold">การกระทำ</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, idx) => (
                <tr key={product.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-3 border-b font-semibold">{product.id}</td>
                  <td className="px-4 py-3 border-b">
                    {product.image_url ? (
                      <img
                        src={getImagePath(product.image_url)}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling && (e.target.nextSibling.style.display = 'flex');
                        }}
                      />
                    ) : null}
                    {!product.image_url || !getImagePath(product.image_url) ? (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                        ไม่มีรูป
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 border-b font-semibold text-gray-800">{product.name}</td>
                  <td className="px-4 py-3 border-b font-bold text-amber-700">{product.price}฿</td>
                  <td className="px-4 py-3 border-b">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={product.stock}
                        onChange={(e) => handleUpdateStock(product.id, parseInt(e.target.value))}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                      />
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {product.stock}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 border-b text-gray-600 capitalize">
                    {categories.find(c => c.value === product.category)?.label || product.category}
                  </td>
                  <td className="px-4 py-3 border-b space-x-2">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-semibold transition"
                    >
                      แก้ไข
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-6 py-4 font-bold text-lg">
              {editingId ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}
            </div>

            <div className="p-6 space-y-4">
              {/* Product Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">ชื่อสินค้า *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="เช่น: กาแฟสด"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">รายละเอียด</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="รายละเอียดสินค้า..."
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">หมวดหมู่ *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                >
                  {categories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">ราคา (บาท) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Stock */}
                <div>
                  <label className="block text-gray-700 font-semibold mb-2">จำนวนในสต๊อก *</label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">รูปภาพสินค้า</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  {previewImage ? (
                    <div className="space-y-2">
                      <img 
                        src={previewImage.startsWith('data:') ? previewImage : getImagePath(previewImage)} 
                        alt="Preview" 
                        className="w-32 h-32 object-cover mx-auto rounded" 
                      />
                      <p className="text-sm text-green-600 font-semibold">ถูกเลือก</p>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm">ยังไม่มีรูปภาพ</p>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    className="hidden"
                    id="imageInput"
                  />
                  <label
                    htmlFor="imageInput"
                    className={`mt-2 inline-block px-4 py-2 rounded-lg font-semibold cursor-pointer transition ${
                      uploadingImage
                        ? 'bg-gray-300 text-gray-600'
                        : 'bg-amber-600 text-white hover:bg-amber-700'
                    }`}
                  >
                    {uploadingImage ? 'กำลังอัปโหลด...' : 'เลือกรูปภาพ'}
                  </label>
                </div>
                {formData.image_url && (
                  <p className="text-sm text-green-600 mt-2 font-semibold">✓ มีการอัปโหลดรูปภาพแล้ว</p>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-semibold transition"
                >
                  ยกเลิก
                </button>
                <button
                  onClick={handleSaveProduct}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg font-semibold transition"
                >
                  {editingId ? 'บันทึกการแก้ไข' : 'เพิ่มสินค้า'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
