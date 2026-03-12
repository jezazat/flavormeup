import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../utils/AuthContext';

export default function Header() {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-amber-100 to-amber-200 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-amber-900">FlavorMeUp</h1>
          </a>
          
          {/* Navigation */}
          <nav className="flex items-center gap-6">
            <a href="/" className="text-amber-900 hover:text-amber-700 font-semibold transition">
              หน้าหลัก
            </a>
            
            {user ? (
              <>
                <a href="/cart" className="text-amber-900 hover:text-amber-700 font-semibold transition">
                  ตะกร้า
                </a>
                <a href="/orders" className="text-amber-900 hover:text-amber-700 font-semibold transition">
                  คำสั่งซื้อ
                </a>
                
                {user.role === 'admin' && (
                  <a 
                    href="/admin" 
                    className="bg-red-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-red-700 transition"
                  >
                    Admin
                  </a>
                )}

                <div className="flex items-center gap-3 border-l pl-6 border-amber-300">
                  <span className="text-amber-900 font-semibold">สวัสดี, {user.username}</span>
                  <button 
                    onClick={handleLogout} 
                    className="bg-gray-700 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition font-semibold"
                  >
                    ออกจากระบบ
                  </button>
                </div>
              </>
            ) : (
              <>
                <a href="/login" className="text-amber-900 hover:text-amber-700 font-semibold transition">
                  เข้าสู่ระบบ
                </a>
                <a 
                  href="/register" 
                  className="bg-green-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-green-700 transition"
                >
                  สมัครสมาชิก
                </a>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
