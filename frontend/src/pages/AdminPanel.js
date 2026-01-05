import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getShippingSettings, saveShippingSettings } from '../config/siteSettings';

function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [emailLogs, setEmailLogs] = useState([]);
  const [shippingSettings, setShippingSettings] = useState(getShippingSettings());
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    images: '',
    category: ''
  });
  const [newCoupon, setNewCoupon] = useState({
    code: '',
    discountPercent: '',
    validUntil: '',
    minPurchase: '',
    maxUsage: '',
    isActive: true,
    description: '',
    targetUser: '', // Kişiye özel kupon için
    couponType: 'general' // general, personal, comeback
  });
  const [imagePreview, setImagePreview] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
    }
    fetchProducts();
    fetchUsers();
    fetchOrders();
    fetchCoupons();
    fetchEmailLogs();
  }, [user, navigate]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error);
      setProducts([
        { id: 1, name: 'İpek Eşarp', price: 299.90, stock: 10, images: [], category: 'Eşarp' },
        { id: 2, name: 'İpek Şal', price: 499.90, stock: 5, images: [], category: 'Şal' }
      ]);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
      setUsers([
        { id: 1, name: 'Admin', email: 'admin@ipekaksesuar.com', role: 'admin', lastPurchase: '2024-01-15' },
        { id: 2, name: 'Test', email: 'test@test.com', role: 'user', lastPurchase: '2023-12-01' },
        { id: 3, name: 'Eski Müşteri', email: 'eski@test.com', role: 'user', lastPurchase: '2023-06-15' }
      ]);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Siparişler yüklenemedi:', error);
      setOrders([]);
    }
  };

  const fetchCoupons = () => {
    // LocalStorage'dan kuponları yükle
    const savedCoupons = JSON.parse(localStorage.getItem('coupons') || '[]');
    setCoupons(savedCoupons);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        alert('Sipariş durumu güncellendi!');
        fetchOrders(); // Refresh orders list
      } else {
        const error = await response.json();
        alert(`Hata: ${error.error || 'Durum güncellenemedi'}`);
      }
    } catch (error) {
      console.error('Sipariş durumu güncellenemedi:', error);
      alert('Sipariş durumu güncellenirken hata oluştu');
    }
  };

  const handleAddTrackingInfo = async (orderId) => {
    const trackingNumber = prompt('Kargo takip numarasını girin:');
    const cargoCompany = prompt('Kargo şirketini girin (örn: Aras Kargo, Yurtiçi):');

    if (!trackingNumber || !cargoCompany) {
      alert('Takip numarası ve kargo şirketi gerekli!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: 'shipped',
          trackingNumber,
          cargoCompany
        })
      });

      if (response.ok) {
        alert('Kargo bilgileri eklendi ve sipariş kargoya verildi!');
        fetchOrders();
      } else {
        const error = await response.json();
        alert(`Hata: ${error.error || 'Bilgiler eklenemedi'}`);
      }
    } catch (error) {
      console.error('Kargo bilgileri eklenemedi:', error);
      alert('Kargo bilgileri eklenirken hata oluştu');
    }
  };

  const fetchEmailLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/email-logs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setEmailLogs(data);
      }
    } catch (error) {
      console.error('Email logları yüklenemedi:', error);
      setEmailLogs([]);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return '#28a745';
      case 'shipped': return '#17a2b8';
      case 'preparing': return '#ffc107';
      case 'payment_received': return '#007bff';
      case 'pending': return '#6c757d';
      case 'cancelled': return '#dc3545';
      case 'refunded': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'delivered': return 'Teslim Edildi';
      case 'shipped': return 'Kargoda';
      case 'preparing': return 'Hazırlanıyor';
      case 'payment_received': return 'Ödeme Alındı';
      case 'pending': return 'Beklemede';
      case 'cancelled': return 'İptal Edildi';
      case 'refunded': return 'İade Edildi';
      default: return 'Bilinmeyen';
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const imageUrls = newProduct.images.split(',').map(url => url.trim()).filter(url => url);
      
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock: parseInt(newProduct.stock),
        images: imageUrls
      };

      const response = await fetch('http://localhost:5000/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      
      if (response.ok) {
        alert('Ürün eklendi!');
        fetchProducts();
        setNewProduct({ name: '', description: '', price: '', stock: '', images: '', category: '' });
        setImagePreview('');
      }
    } catch (error) {
      alert('Ürün eklenirken hata oluştu');
    }
  };

  const handleAddCoupon = (e) => {
    e.preventDefault();
    
    const coupon = {
      id: Date.now(),
      code: newCoupon.code.toUpperCase(),
      discountPercent: parseInt(newCoupon.discountPercent),
      validUntil: newCoupon.validUntil,
      minPurchase: parseFloat(newCoupon.minPurchase) || 0,
      maxUsage: parseInt(newCoupon.maxUsage) || 999,
      isActive: newCoupon.isActive,
      description: newCoupon.description,
      couponType: newCoupon.couponType,
      targetUser: newCoupon.targetUser,
      usedBy: [], // Kullanan kullanıcıların listesi
      usageCount: 0,
      createdAt: new Date().toISOString()
    };
    
    const updatedCoupons = [...coupons, coupon];
    setCoupons(updatedCoupons);
    localStorage.setItem('coupons', JSON.stringify(updatedCoupons));
    
    alert('Kupon oluşturuldu!');
    setNewCoupon({
      code: '',
      discountPercent: '',
      validUntil: '',
      minPurchase: '',
      maxUsage: '',
      isActive: true,
      description: '',
      targetUser: '',
      couponType: 'general'
    });
  };

  const deleteCoupon = (couponId) => {
    if (window.confirm('Bu kuponu silmek istediğinize emin misiniz?')) {
      const updatedCoupons = coupons.filter(c => c.id !== couponId);
      setCoupons(updatedCoupons);
      localStorage.setItem('coupons', JSON.stringify(updatedCoupons));
    }
  };

  const toggleCouponStatus = (couponId) => {
    const updatedCoupons = coupons.map(c =>
      c.id === couponId ? { ...c, isActive: !c.isActive } : c
    );
    setCoupons(updatedCoupons);
    localStorage.setItem('coupons', JSON.stringify(updatedCoupons));
  };

  // Kargo ayarlarını kaydet
  const handleSaveShippingSettings = (e) => {
    e.preventDefault();
    saveShippingSettings(shippingSettings);
    alert('Kargo ayarları kaydedildi!');
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/products/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          alert('Ürün silindi!');
          fetchProducts();
        }
      } catch (error) {
        alert('Ürün silinirken hata oluştu');
      }
    }
  };

  const handleImageUrlChange = (value) => {
    setNewProduct({ ...newProduct, images: value });
    const firstUrl = value.split(',')[0].trim();
    setImagePreview(firstUrl);
  };

  // Uzun süredir alışveriş yapmayan kullanıcıları bul
  const getInactiveUsers = () => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    return users.filter(user => {
      if (!user.lastPurchase) return true;
      return new Date(user.lastPurchase) < threeMonthsAgo;
    });
  };

  const generateComebackCoupon = (targetUser) => {
    const code = `COMEBACK${targetUser.id}${Date.now().toString().slice(-4)}`;
    setNewCoupon({
      code: code,
      discountPercent: '20',
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 gün
      minPurchase: '100',
      maxUsage: '1',
      isActive: true,
      description: `${targetUser.name} için geri dönüş kuponu`,
      targetUser: targetUser.email,
      couponType: 'comeback'
    });
  };

  const sidebarStyle = {
    width: '200px',
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '20px',
    minHeight: '100vh'
  };

  const contentStyle = {
    flex: 1,
    padding: '20px',
    backgroundColor: '#f8f9fa',
    overflowY: 'auto'
  };

  const tabStyle = (isActive) => ({
    padding: '10px',
    cursor: 'pointer',
    backgroundColor: isActive ? '#34495e' : 'transparent',
    borderRadius: '5px',
    marginBottom: '5px'
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={sidebarStyle}>
        <h2>Admin Panel</h2>
        <hr style={{ margin: '20px 0' }} />
        <div style={tabStyle(activeTab === 'dashboard')} onClick={() => setActiveTab('dashboard')}>
          📊 Dashboard
        </div>
        <div style={tabStyle(activeTab === 'products')} onClick={() => setActiveTab('products')}>
          📦 Ürün Yönetimi
        </div>
        <div style={tabStyle(activeTab === 'coupons')} onClick={() => setActiveTab('coupons')}>
          🎟️ Kupon Yönetimi
        </div>
        <div style={tabStyle(activeTab === 'shipping')} onClick={() => setActiveTab('shipping')}>
          🚚 Kargo Ayarları
        </div>
        <div style={tabStyle(activeTab === 'users')} onClick={() => setActiveTab('users')}>
          👥 Kullanıcılar
        </div>
        <div style={tabStyle(activeTab === 'orders')} onClick={() => setActiveTab('orders')}>
          🛒 Siparişler
        </div>
        <div style={tabStyle(activeTab === 'emailLogs')} onClick={() => setActiveTab('emailLogs')}>
          📧 Email Logları
        </div>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div>
            <h1>Dashboard</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#667eea' }}>Toplam Ürün</h3>
                <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{products.length}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#27ae60' }}>Aktif Kupon</h3>
                <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{coupons.filter(c => c.isActive).length}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#e74c3c' }}>Toplam Kullanıcı</h3>
                <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{users.length}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#f39c12' }}>Pasif Müşteri</h3>
                <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{getInactiveUsers().length}</p>
              </div>
            </div>
          </div>
        )}

        {/* Kupon Yönetimi Tab */}
        {activeTab === 'coupons' && (
          <div>
            <h1>Kupon Yönetimi</h1>
            
            {/* Yeni Kupon Oluştur */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
              <h3>Yeni Kupon Oluştur</h3>
              <form onSubmit={handleAddCoupon}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                      Kupon Tipi
                    </label>
                    <select
                      value={newCoupon.couponType}
                      onChange={(e) => setNewCoupon({ ...newCoupon, couponType: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                      required
                    >
                      <option value="general">Genel Kupon</option>
                      <option value="personal">Kişiye Özel</option>
                      <option value="comeback">Geri Dönüş Kuponu</option>
                    </select>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                      Kupon Kodu
                    </label>
                    <input
                      type="text"
                      placeholder="Örn: INDIRIM20"
                      value={newCoupon.code}
                      onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                      İndirim Yüzdesi (%)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      placeholder="20"
                      value={newCoupon.discountPercent}
                      onChange={(e) => setNewCoupon({ ...newCoupon, discountPercent: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                      Geçerlilik Tarihi
                    </label>
                    <input
                      type="date"
                      value={newCoupon.validUntil}
                      onChange={(e) => setNewCoupon({ ...newCoupon, validUntil: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                      required
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                      Minimum Alışveriş (TL)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="100"
                      value={newCoupon.minPurchase}
                      onChange={(e) => setNewCoupon({ ...newCoupon, minPurchase: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                      Maksimum Kullanım
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="999"
                      value={newCoupon.maxUsage}
                      onChange={(e) => setNewCoupon({ ...newCoupon, maxUsage: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                  </div>
                  
                  {(newCoupon.couponType === 'personal' || newCoupon.couponType === 'comeback') && (
                    <div>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                        Hedef Kullanıcı Email
                      </label>
                      <input
                        type="email"
                        placeholder="kullanici@email.com"
                        value={newCoupon.targetUser}
                        onChange={(e) => setNewCoupon({ ...newCoupon, targetUser: e.target.value })}
                        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                        required={newCoupon.couponType !== 'general'}
                      />
                    </div>
                  )}
                  
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: 'bold' }}>
                      Açıklama
                    </label>
                    <input
                      type="text"
                      placeholder="Kupon açıklaması"
                      value={newCoupon.description}
                      onChange={(e) => setNewCoupon({ ...newCoupon, description: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  style={{
                    padding: '12px 30px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  Kupon Oluştur
                </button>
              </form>
            </div>

            {/* Pasif Müşteriler için Özel Kupon */}
            {getInactiveUsers().length > 0 && (
              <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
                <h3 style={{ color: '#856404' }}>🎯 Geri Kazanım Kampanyası</h3>
                <p style={{ marginBottom: '15px' }}>3 aydan uzun süredir alışveriş yapmayan müşteriler:</p>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {getInactiveUsers().map(user => (
                    <div key={user.id} style={{
                      backgroundColor: 'white',
                      padding: '10px',
                      borderRadius: '5px',
                      border: '1px solid #ffc107'
                    }}>
                      <p style={{ marginBottom: '5px', fontWeight: 'bold' }}>{user.name}</p>
                      <p style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>{user.email}</p>
                      <button
                        onClick={() => generateComebackCoupon(user)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: '#ffc107',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        %20 Kupon Oluştur
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Mevcut Kuponlar */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
              <h3>Mevcut Kuponlar</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Kod</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Tip</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>İndirim</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Min. Tutar</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Kullanım</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Geçerlilik</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Durum</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map(coupon => (
                      <tr key={coupon.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>
                          <strong>{coupon.code}</strong>
                          {coupon.targetUser && (
                            <div style={{ fontSize: '11px', color: '#666' }}>
                              {coupon.targetUser}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '3px',
                            fontSize: '12px',
                            backgroundColor: 
                              coupon.couponType === 'general' ? '#17a2b8' :
                              coupon.couponType === 'personal' ? '#6f42c1' : '#ffc107',
                            color: 'white'
                          }}>
                            {coupon.couponType === 'general' ? 'Genel' :
                             coupon.couponType === 'personal' ? 'Kişisel' : 'Geri Dönüş'}
                          </span>
                        </td>
                        <td style={{ padding: '10px' }}>%{coupon.discountPercent}</td>
                        <td style={{ padding: '10px' }}>{coupon.minPurchase || 0} TL</td>
                        <td style={{ padding: '10px' }}>
                          {coupon.usageCount || 0}/{coupon.maxUsage}
                        </td>
                        <td style={{ padding: '10px' }}>
                          {new Date(coupon.validUntil).toLocaleDateString('tr-TR')}
                        </td>
                        <td style={{ padding: '10px' }}>
                          <span style={{
                            padding: '3px 8px',
                            borderRadius: '3px',
                            fontSize: '12px',
                            backgroundColor: coupon.isActive ? '#28a745' : '#6c757d',
                            color: 'white'
                          }}>
                            {coupon.isActive ? 'Aktif' : 'Pasif'}
                          </span>
                        </td>
                        <td style={{ padding: '10px' }}>
                          <button
                            onClick={() => toggleCouponStatus(coupon.id)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: coupon.isActive ? '#ffc107' : '#28a745',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              marginRight: '5px',
                              fontSize: '12px'
                            }}
                          >
                            {coupon.isActive ? 'Pasifleştir' : 'Aktifleştir'}
                          </button>
                          <button
                            onClick={() => deleteCoupon(coupon.id)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#dc3545',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Sil
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {coupons.length === 0 && (
                  <p style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>
                    Henüz kupon oluşturulmamış
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'products' && (
          <div>
            <h1>Ürün Yönetimi</h1>
            
            {/* Yeni Ürün Ekleme Formu */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
              <h3>Yeni Ürün Ekle</h3>
              <form onSubmit={handleAddProduct}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <input
                    type="text"
                    placeholder="Ürün Adı"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Fiyat (TL)"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Açıklama"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Stok Adedi"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    required
                  />
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    style={{ padding: '10px', borderRadius: '5px', border: '1px solid #ddd' }}
                    required
                  >
                    <option value="">Kategori Seçin</option>
                    <option value="Eşarp">Eşarp</option>
                    <option value="Şal">Şal</option>
                    <option value="Kravat">Kravat</option>
                    <option value="Mendil">Mendil</option>
                    <option value="Fular">Fular</option>
                  </select>
                </div>
                
                {/* Resim URL Girişi */}
                <div style={{ marginTop: '15px' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                    Ürün Resimleri (URL):
                  </label>
                  <textarea
                    placeholder="Resim URL'lerini virgülle ayırarak girin&#10;Örnek: https://resim1.jpg, https://resim2.jpg&#10;&#10;Ücretsiz resim siteleri:&#10;• https://unsplash.com&#10;• https://pexels.com&#10;• https://pixabay.com"
                    value={newProduct.images}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    style={{ 
                      width: '100%', 
                      padding: '10px', 
                      borderRadius: '5px', 
                      border: '1px solid #ddd',
                      minHeight: '100px',
                      resize: 'vertical'
                    }}
                  />
                  
                  {/* Resim Önizleme */}
                  {imagePreview && (
                    <div style={{ marginTop: '15px' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                        Önizleme:
                      </label>
                      <div style={{ 
                        border: '1px solid #ddd', 
                        borderRadius: '5px', 
                        padding: '10px',
                        textAlign: 'center',
                        backgroundColor: '#f8f9fa'
                      }}>
                        <img 
                          src={imagePreview} 
                          alt="Önizleme" 
                          style={{ 
                            maxWidth: '200px', 
                            maxHeight: '200px',
                            borderRadius: '5px'
                          }}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect width="200" height="200" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EGeçersiz URL%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Örnek URL'ler */}
                  <div style={{ marginTop: '10px', fontSize: '12px', color: '#6c757d' }}>
                    <strong>Örnek İpek Ürün Resimleri (Kopyalayıp kullanabilirsiniz):</strong>
                    <ul style={{ marginTop: '5px', marginLeft: '20px' }}>
                      <li>Eşarp: https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400</li>
                      <li>Şal: https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400</li>
                      <li>Kravat: https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400</li>
                    </ul>
                  </div>
                </div>
                
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    marginTop: '15px',
                    padding: '12px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  Ürün Ekle
                </button>
              </form>
            </div>

            {/* Ürün Listesi */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
              <h3>Mevcut Ürünler</h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', marginTop: '15px', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #ddd' }}>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Resim</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Ürün Adı</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Kategori</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Fiyat</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>Stok</th>
                      <th style={{ padding: '10px', textAlign: 'left' }}>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ padding: '10px' }}>
                          {product.images && product.images.length > 0 ? (
                            <img 
                              src={product.images[0]} 
                              alt={product.name}
                              style={{ 
                                width: '50px', 
                                height: '50px', 
                                objectFit: 'cover',
                                borderRadius: '5px'
                              }}
                              onError={(e) => {
                                e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="50" height="50"%3E%3Crect width="50" height="50" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="10"%3ENo Image%3C/text%3E%3C/svg%3E';
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '50px',
                              height: '50px',
                              backgroundColor: '#f0f0f0',
                              borderRadius: '5px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '20px'
                            }}>
                              🧣
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '10px' }}>{product.id}</td>
                        <td style={{ padding: '10px' }}>{product.name}</td>
                        <td style={{ padding: '10px' }}>{product.category || '-'}</td>
                        <td style={{ padding: '10px' }}>{product.price} TL</td>
                        <td style={{ padding: '10px' }}>{product.stock || 0}</td>
                        <td style={{ padding: '10px' }}>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#e74c3c',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer',
                              marginRight: '5px'
                            }}
                          >
                            Sil
                          </button>
                          <button
                            onClick={() => navigate(`/urun/${product.id}`)}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#3498db',
                              color: 'white',
                              border: 'none',
                              borderRadius: '3px',
                              cursor: 'pointer'
                            }}
                          >
                            Görüntüle
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Kargo Ayarları Tab */}
        {activeTab === 'shipping' && (
          <div>
            <h1>Kargo Ayarları</h1>

            <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '10px', maxWidth: '800px' }}>
              <form onSubmit={handleSaveShippingSettings}>
                <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ marginBottom: '20px', color: '#333' }}>Genel Kargo Ayarları</h3>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#555' }}>
                      Kargo Firması
                    </label>
                    <input
                      type="text"
                      value={shippingSettings.carrier}
                      onChange={(e) => setShippingSettings({ ...shippingSettings, carrier: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '5px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                      placeholder="Örn: Yurtiçi Kargo"
                    />
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#555' }}>
                      Kargo Ücreti (₺)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={shippingSettings.fee}
                      onChange={(e) => setShippingSettings({ ...shippingSettings, fee: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '5px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                      required
                    />
                    <small style={{ color: '#666', fontSize: '12px' }}>
                      Müşterilerden alınacak standart kargo ücreti
                    </small>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 'bold', color: '#555' }}>
                      Ücretsiz Kargo Minimum Tutar (₺)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={shippingSettings.freeShippingThreshold}
                      onChange={(e) => setShippingSettings({ ...shippingSettings, freeShippingThreshold: parseFloat(e.target.value) || 0 })}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '5px',
                        border: '1px solid #ddd',
                        fontSize: '14px'
                      }}
                      required
                    />
                    <small style={{ color: '#666', fontSize: '12px' }}>
                      Bu tutarın üzerindeki alışverişlerde kargo ücretsiz olacaktır
                    </small>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={shippingSettings.enabled}
                        onChange={(e) => setShippingSettings({ ...shippingSettings, enabled: e.target.checked })}
                        style={{ marginRight: '10px', width: '18px', height: '18px' }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#555' }}>
                        Kargo sistemini aktif et
                      </span>
                    </label>
                    <small style={{ color: '#666', fontSize: '12px', marginLeft: '28px', display: 'block', marginTop: '5px' }}>
                      Bu seçenek kapalıysa tüm siparişlerde kargo ücretsiz olacaktır
                    </small>
                  </div>
                </div>

                <div style={{
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  border: '1px solid #e9ecef'
                }}>
                  <h4 style={{ marginBottom: '15px', color: '#333', fontSize: '16px' }}>Önizleme</h4>
                  <div style={{ fontSize: '14px', color: '#555', lineHeight: '1.8' }}>
                    <p>
                      <strong>Kargo Firması:</strong> {shippingSettings.carrier || 'Belirtilmedi'}
                    </p>
                    <p>
                      <strong>Kargo Ücreti:</strong> {shippingSettings.enabled ? `₺${shippingSettings.fee.toFixed(2)}` : 'Ücretsiz'}
                    </p>
                    <p>
                      <strong>Ücretsiz Kargo Limiti:</strong> ₺{shippingSettings.freeShippingThreshold.toFixed(2)} ve üzeri
                    </p>
                    <p>
                      <strong>Durum:</strong> {shippingSettings.enabled ? '✅ Aktif' : '❌ Pasif'}
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '15px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    transition: 'background-color 0.3s'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#218838'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#28a745'}
                >
                  💾 Ayarları Kaydet
                </button>
              </form>

              <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#856404' }}>
                  <strong>ℹ️ Bilgi:</strong> Kargo ayarları değiştirildiğinde, tüm sepet ve ödeme sayfalarında yeni değerler kullanılacaktır.
                  Aktif siparişlerdeki kargo ücretleri değişmeyecektir.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h1>Kullanıcı Yönetimi</h1>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
              <table style={{ width: '100%' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Ad Soyad</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>{user.id}</td>
                      <td style={{ padding: '10px' }}>{user.name} {user.surname}</td>
                      <td style={{ padding: '10px' }}>{user.email}</td>
                      <td style={{ padding: '10px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '3px',
                          backgroundColor: user.role === 'admin' ? '#e74c3c' : '#3498db',
                          color: 'white',
                          fontSize: '12px'
                        }}>
                          {user.role === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h1>Sipariş Yönetimi</h1>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
              {orders.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6c757d', padding: '40px' }}>
                  Henüz sipariş bulunmamaktadır.
                </p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e9ecef' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Sipariş No</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Müşteri</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Tarih</th>
                        <th style={{ padding: '12px', textAlign: 'right' }}>Tutar</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Ürün Sayısı</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Durum</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Kargo</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(order => (
                        <tr key={order.id} style={{ borderBottom: '1px solid #e9ecef' }}>
                          <td style={{ padding: '12px' }}>
                            <strong style={{ color: '#667eea', fontFamily: 'monospace' }}>
                              {order.order_number}
                            </strong>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div>{order.user_name}</div>
                            <div style={{ fontSize: '12px', color: '#6c757d' }}>
                              {order.user_email}
                            </div>
                          </td>
                          <td style={{ padding: '12px' }}>
                            {new Date(order.created_at).toLocaleDateString('tr-TR')}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>
                            ₺{Number(order.total_price).toFixed(2)}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {order.item_count} ürün
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span style={{
                              padding: '6px 12px',
                              backgroundColor: getStatusColor(order.status),
                              color: 'white',
                              borderRadius: '15px',
                              fontSize: '12px',
                              fontWeight: 'bold',
                              display: 'inline-block'
                            }}>
                              {getStatusText(order.status)}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            {order.tracking_number ? (
                              <div>
                                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                  {order.tracking_number}
                                </div>
                                <div style={{ fontSize: '11px', color: '#6c757d' }}>
                                  {order.cargo_company}
                                </div>
                              </div>
                            ) : (
                              <span style={{ color: '#6c757d', fontSize: '12px' }}>-</span>
                            )}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', flexWrap: 'wrap' }}>
                              {order.status === 'pending' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'payment_received')}
                                  style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                  }}
                                >
                                  Ödeme Onay
                                </button>
                              )}
                              {order.status === 'payment_received' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'preparing')}
                                  style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#ffc107',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                  }}
                                >
                                  Hazırlanıyor
                                </button>
                              )}
                              {order.status === 'preparing' && (
                                <button
                                  onClick={() => handleAddTrackingInfo(order.id)}
                                  style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#17a2b8',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                  }}
                                >
                                  Kargoya Ver
                                </button>
                              )}
                              {order.status === 'shipped' && (
                                <button
                                  onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}
                                  style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                  }}
                                >
                                  Teslim Et
                                </button>
                              )}
                              {!['cancelled', 'delivered', 'refunded'].includes(order.status) && (
                                <button
                                  onClick={() => {
                                    if (window.confirm('Siparişi iptal etmek istediğinizden emin misiniz?')) {
                                      handleUpdateOrderStatus(order.id, 'cancelled');
                                    }
                                  }}
                                  style={{
                                    padding: '5px 10px',
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '11px'
                                  }}
                                >
                                  İptal
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Email Logs Tab */}
        {activeTab === 'emailLogs' && (
          <div>
            <h1>Email Logları</h1>
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
              {emailLogs.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#6c757d' }}>Henüz email gönderimi yapılmamış.</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #ddd' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Tarih</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Tip</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Alıcı</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Konu</th>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Sipariş No</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {emailLogs.map((log) => (
                        <tr key={log.id} style={{ borderBottom: '1px solid #eee' }}>
                          <td style={{ padding: '12px' }}>
                            {new Date(log.sent_at).toLocaleString('tr-TR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              backgroundColor: log.email_type === 'order_confirmation' ? '#e3f2fd' : '#fff3e0',
                              color: log.email_type === 'order_confirmation' ? '#1976d2' : '#f57c00'
                            }}>
                              {log.email_type === 'order_confirmation' ? '📨 Sipariş Onayı' :
                               log.email_type === 'order_shipped' ? '🚚 Kargo Bildirimi' :
                               log.email_type === 'order_cancelled' ? '❌ İptal Bildirimi' :
                               log.email_type}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div>
                              <strong>{log.user_name} {log.user_surname}</strong>
                              <br />
                              <small style={{ color: '#6c757d' }}>{log.recipient_email}</small>
                            </div>
                          </td>
                          <td style={{ padding: '12px', maxWidth: '300px' }}>
                            {log.subject}
                          </td>
                          <td style={{ padding: '12px' }}>
                            {log.order_number || '-'}
                          </td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <span style={{
                              padding: '4px 12px',
                              borderRadius: '20px',
                              fontSize: '12px',
                              fontWeight: '600',
                              backgroundColor: log.status === 'sent' ? '#d4edda' : log.status === 'failed' ? '#f8d7da' : '#fff3cd',
                              color: log.status === 'sent' ? '#155724' : log.status === 'failed' ? '#721c24' : '#856404'
                            }}>
                              {log.status === 'sent' ? '✅ Gönderildi' :
                               log.status === 'failed' ? '❌ Başarısız' :
                               '⏳ Beklemede'}
                            </span>
                            {log.status === 'failed' && log.error_message && (
                              <div style={{
                                marginTop: '8px',
                                fontSize: '11px',
                                color: '#dc3545',
                                maxWidth: '200px',
                                wordWrap: 'break-word'
                              }}>
                                {log.error_message}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;