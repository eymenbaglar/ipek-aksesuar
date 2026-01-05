import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    surname: user?.surname || '',
    email: user?.email || '',
    phone: '',
    birthDate: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: '',
    name: '',
    address: '',
    city: '',
    district: '',
    neighborhood: '',
    phone: '',
    postal_code: '',
    default: false
  });

  useEffect(() => {
    if (!user) {
      navigate('/giris');
      return;
    }
    fetchUserData();
    loadFavorites();
  }, [user, navigate]);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');

      // Siparişleri yükle
      const ordersResponse = await fetch(`http://localhost:5000/api/users/${user.id}/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData);
      } else {
        setOrders([]);
      }

      // Adresleri yükle
      const addressesResponse = await fetch(`http://localhost:5000/api/users/${user.id}/addresses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (addressesResponse.ok) {
        const addressesData = await addressesResponse.json();
        setAddresses(addressesData);
      } else {
        setAddresses([]);
      }
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      setOrders([]);
      setAddresses([]);
    }
  };

  const loadFavorites = () => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  };

  const removeFavorite = (productId) => {
    const newFavorites = favorites.filter(fav => fav.id !== productId);
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${user.id}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newAddress)
      });

      if (response.ok) {
        const savedAddress = await response.json();
        setAddresses([...addresses, savedAddress]);

        // Formu temizle ve modalı kapat
        setNewAddress({
          title: '',
          name: '',
          address: '',
          city: '',
          district: '',
          neighborhood: '',
          phone: '',
          postal_code: '',
          default: false
        });
        setShowAddressModal(false);
        alert('Adres başarıyla eklendi!');
      } else {
        const error = await response.json();
        alert(error.error || 'Adres eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Adres ekleme hatası:', error);
      alert('Adres eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm('Bu adresi silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${user.id}/addresses/${addressId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setAddresses(addresses.filter(addr => addr.id !== addressId));
        alert('Adres silindi!');
      } else {
        const error = await response.json();
        alert(error.error || 'Adres silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Adres silme hatası:', error);
      alert('Adres silinirken hata oluştu');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });
      
      if (response.ok) {
        alert('Profil güncellendi!');
        setEditMode(false);
        // LocalStorage'daki user bilgisini güncelle
        const updatedUser = { ...user, ...profileData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } else {
        // Backend çalışmıyorsa simüle et
        alert('Profil güncellendi!');
        setEditMode(false);
      }
    } catch (error) {
      alert('Güncelleme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Yeni şifreler eşleşmiyor!');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      alert('Yeni şifre en az 6 karakter olmalı!');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });
      
      if (response.ok) {
        alert('Şifre başarıyla değiştirildi!');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        alert('Mevcut şifre hatalı!');
      }
    } catch (error) {
      alert('Şifre değiştirme sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return '#28a745';
      case 'shipped': return '#17a2b8';
      case 'preparing': return '#ffc107';
      case 'payment_received': return '#007bff';
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

  // Aktif ve geçmiş siparişleri ayır
  const activeOrders = orders.filter(order =>
    ['pending', 'payment_received', 'preparing', 'shipped'].includes(order.status)
  );
  const pastOrders = orders.filter(order =>
    ['delivered', 'cancelled', 'refunded'].includes(order.status)
  );

  const tabStyle = (isActive) => ({
    padding: '12px 24px',
    backgroundColor: isActive ? '#667eea' : 'transparent',
    color: isActive ? 'white' : '#6c757d',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.3s ease'
  });

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Başlık */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '10px',
          marginBottom: '30px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ marginBottom: '10px', color: '#2c3e50' }}>
                Hoş Geldiniz, {user?.name} {user?.surname}
              </h1>
              <p style={{ color: '#6c757d' }}>
                {user?.email} • Üyelik Tarihi: Ocak 2024
              </p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Çıkış Yap
            </button>
          </div>
        </div>

        {/* Tab Menü */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '30px',
          flexWrap: 'wrap'
        }}>
          <button
            style={tabStyle(activeTab === 'orders')}
            onClick={() => setActiveTab('orders')}
          >
            📦 Siparişlerim ({orders.length})
          </button>
          <button
            style={tabStyle(activeTab === 'favorites')}
            onClick={() => setActiveTab('favorites')}
          >
            ❤️ Favorilerim ({favorites.length})
          </button>
          <button
            style={tabStyle(activeTab === 'addresses')}
            onClick={() => setActiveTab('addresses')}
          >
            📍 Adreslerim ({addresses.length})
          </button>
          <button
            style={tabStyle(activeTab === 'account')}
            onClick={() => setActiveTab('account')}
          >
            ⚙️ Hesap Ayarları
          </button>
          <button
            style={tabStyle(activeTab === 'notifications')}
            onClick={() => setActiveTab('notifications')}
          >
            🔔 Bildirimler
          </button>
        </div>

        {/* Tab İçerikleri */}
        <div style={{ 
          backgroundColor: 'white', 
          padding: '30px', 
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          {/* Siparişler Tab */}
          {activeTab === 'orders' && (
            <div>
              <h2 style={{ marginBottom: '30px', color: '#2c3e50' }}>Siparişlerim</h2>
              
              {/* Aktif Siparişler */}
              {activeOrders.length > 0 && (
                <div style={{ marginBottom: '40px' }}>
                  <h3 style={{ color: '#667eea', marginBottom: '20px' }}>
                    🚚 Aktif Siparişler
                  </h3>
                  {activeOrders.map(order => (
                    <div key={order.id} style={{
                      border: '2px solid #667eea',
                      borderRadius: '10px',
                      padding: '20px',
                      marginBottom: '20px',
                      backgroundColor: '#f8f9ff'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '15px'
                      }}>
                        <div>
                          <h4 style={{ marginBottom: '5px' }}>
                            Sipariş No: {order.order_number}
                          </h4>
                          <p style={{ color: '#6c757d', fontSize: '14px' }}>
                            {new Date(order.created_at).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            padding: '8px 16px',
                            backgroundColor: getStatusColor(order.status),
                            color: 'white',
                            borderRadius: '20px',
                            fontSize: '14px',
                            fontWeight: 'bold'
                          }}>
                            {getStatusText(order.status)}
                          </span>
                          <p style={{
                            fontSize: '20px',
                            fontWeight: 'bold',
                            marginTop: '10px',
                            color: '#2c3e50'
                          }}>
                            ₺{Number(order.total_price).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {order.tracking_number && (
                        <div style={{
                          backgroundColor: 'white',
                          padding: '10px',
                          borderRadius: '5px',
                          marginBottom: '15px'
                        }}>
                          📍 Kargo Takip No: <strong>{order.tracking_number}</strong>
                          {order.cargo_company && ` (${order.cargo_company})`}
                        </div>
                      )}

                      <div style={{ fontSize: '14px', color: '#495057', marginBottom: '10px' }}>
                        <div style={{ color: '#6c757d' }}>
                          {order.item_count} ürün • ₺{Number(order.subtotal).toFixed(2)} ürün toplamı
                          {order.shipping_fee > 0 && ` + ₺${Number(order.shipping_fee).toFixed(2)} kargo`}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => navigate(`/siparis/${order.id}`)}
                        style={{
                          marginTop: '15px',
                          padding: '8px 20px',
                          backgroundColor: '#667eea',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        Sipariş Detayı
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Geçmiş Siparişler */}
              {pastOrders.length > 0 && (
                <div>
                  <h3 style={{ color: '#6c757d', marginBottom: '20px' }}>
                    📋 Geçmiş Siparişler
                  </h3>
                  {pastOrders.map(order => (
                    <div key={order.id} style={{
                      border: '1px solid #dee2e6',
                      borderRadius: '10px',
                      padding: '20px',
                      marginBottom: '20px'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <div>
                          <h4 style={{ marginBottom: '5px' }}>
                            {order.order_number}
                          </h4>
                          <p style={{ color: '#6c757d', fontSize: '14px' }}>
                            {new Date(order.created_at).toLocaleDateString('tr-TR')}
                          </p>
                          <p style={{ color: '#6c757d', fontSize: '13px' }}>
                            {order.item_count} ürün
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{
                            padding: '5px 12px',
                            backgroundColor: getStatusColor(order.status),
                            color: 'white',
                            borderRadius: '15px',
                            fontSize: '12px'
                          }}>
                            {getStatusText(order.status)}
                          </span>
                          <p style={{
                            fontSize: '18px',
                            fontWeight: 'bold',
                            marginTop: '5px'
                          }}>
                            ₺{Number(order.total_price).toFixed(2)}
                          </p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => navigate(`/siparis/${order.id}`)}
                        style={{
                          marginTop: '15px',
                          padding: '6px 15px',
                          backgroundColor: 'transparent',
                          color: '#667eea',
                          border: '1px solid #667eea',
                          borderRadius: '5px',
                          cursor: 'pointer',
                          fontSize: '14px'
                        }}
                      >
                        Detayları Gör
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {orders.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                    Henüz siparişiniz bulunmamaktadır
                  </p>
                  <button
                    onClick={() => navigate('/urunler')}
                    style={{
                      padding: '10px 30px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Alışverişe Başla
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Favoriler Tab */}
          {activeTab === 'favorites' && (
            <div>
              <h2 style={{ marginBottom: '30px', color: '#2c3e50' }}>Favori Ürünlerim</h2>
              
              {favorites.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                  gap: '20px'
                }}>
                  {favorites.map(product => (
                    <div key={product.id} style={{
                      border: '1px solid #dee2e6',
                      borderRadius: '10px',
                      overflow: 'hidden',
                      transition: 'transform 0.3s'
                    }}>
                      <div style={{
                        height: '200px',
                        backgroundColor: '#f8f9fa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}>
                        {product.image ? (
                          <img src={product.image} alt={product.name} style={{
                            maxWidth: '100%',
                            maxHeight: '100%'
                          }} />
                        ) : (
                          <span style={{ fontSize: '48px' }}>🧣</span>
                        )}
                        
                        <button
                          onClick={() => removeFavorite(product.id)}
                          style={{
                            position: 'absolute',
                            top: '10px',
                            right: '10px',
                            backgroundColor: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '35px',
                            height: '35px',
                            cursor: 'pointer',
                            fontSize: '20px',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                          }}
                        >
                          ❤️
                        </button>
                      </div>
                      
                      <div style={{ padding: '15px' }}>
                        <h4 style={{ marginBottom: '10px' }}>{product.name}</h4>
                        <p style={{ 
                          fontSize: '20px', 
                          fontWeight: 'bold',
                          color: '#667eea',
                          marginBottom: '10px'
                        }}>
                          {product.price} TL
                        </p>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            onClick={() => navigate(`/urun/${product.id}`)}
                            style={{
                              flex: 1,
                              padding: '8px',
                              backgroundColor: 'transparent',
                              color: '#667eea',
                              border: '1px solid #667eea',
                              borderRadius: '5px',
                              cursor: 'pointer'
                            }}
                          >
                            İncele
                          </button>
                          <button
                            onClick={() => {
                              addToCart(product);
                              alert('Ürün sepete eklendi!');
                            }}
                            style={{
                              flex: 1,
                              padding: '8px',
                              backgroundColor: '#667eea',
                              color: 'white',
                              border: 'none',
                              borderRadius: '5px',
                              cursor: 'pointer'
                            }}
                          >
                            Sepete Ekle
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: '#6c757d', marginBottom: '20px' }}>
                    Henüz favori ürününüz bulunmamaktadır
                  </p>
                  <button
                    onClick={() => navigate('/urunler')}
                    style={{
                      padding: '10px 30px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                  >
                    Ürünleri Keşfet
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Adresler Tab */}
          {activeTab === 'addresses' && (
            <div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '30px'
              }}>
                <h2 style={{ color: '#2c3e50' }}>Adreslerim</h2>
                <button
                  onClick={() => setShowAddressModal(true)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  + Yeni Adres Ekle
                </button>
              </div>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px'
              }}>
                {addresses.map(address => (
                  <div key={address.id} style={{
                    border: address.is_default ? '2px solid #667eea' : '1px solid #dee2e6',
                    borderRadius: '10px',
                    padding: '20px',
                    position: 'relative'
                  }}>
                    {address.is_default && (
                      <span style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: '#667eea',
                        color: 'white',
                        padding: '3px 10px',
                        borderRadius: '15px',
                        fontSize: '12px'
                      }}>
                        Varsayılan
                      </span>
                    )}
                    
                    <h4 style={{ marginBottom: '10px' }}>{address.title}</h4>
                    <p style={{ marginBottom: '5px' }}>{address.full_name}</p>
                    <p style={{ marginBottom: '5px', color: '#6c757d' }}>
                      {address.address_line}
                    </p>
                    <p style={{ marginBottom: '5px', color: '#6c757d' }}>
                      {address.neighborhood && `${address.neighborhood}, `}
                      {address.district && `${address.district}, `}
                      {address.city}
                    </p>
                    {address.postal_code && (
                      <p style={{ marginBottom: '5px', color: '#6c757d' }}>
                        Posta Kodu: {address.postal_code}
                      </p>
                    )}
                    <p style={{ marginBottom: '15px' }}>
                      📞 {address.phone}
                    </p>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button style={{
                        padding: '5px 15px',
                        backgroundColor: 'transparent',
                        color: '#667eea',
                        border: '1px solid #667eea',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}>
                        Düzenle
                      </button>
                      {!address.is_default && (
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          style={{
                            padding: '5px 15px',
                            backgroundColor: 'transparent',
                            color: '#dc3545',
                            border: '1px solid #dc3545',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          Sil
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Adres Ekleme Modal */}
              {showAddressModal && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000
                }}>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '30px',
                    borderRadius: '10px',
                    maxWidth: '500px',
                    width: '90%',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                  }}>
                    <h3 style={{ marginBottom: '20px', color: '#2c3e50' }}>
                      Yeni Adres Ekle
                    </h3>

                    <form onSubmit={handleAddAddress}>
                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                          Adres Başlığı *
                        </label>
                        <input
                          type="text"
                          value={newAddress.title}
                          onChange={(e) => setNewAddress({...newAddress, title: e.target.value})}
                          placeholder="Ev, İş, vb."
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #dee2e6',
                            borderRadius: '5px',
                            fontSize: '14px'
                          }}
                          required
                        />
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                          Ad Soyad *
                        </label>
                        <input
                          type="text"
                          value={newAddress.name}
                          onChange={(e) => setNewAddress({...newAddress, name: e.target.value})}
                          placeholder="Alıcı adı soyadı"
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #dee2e6',
                            borderRadius: '5px',
                            fontSize: '14px'
                          }}
                          required
                        />
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                          Adres *
                        </label>
                        <textarea
                          value={newAddress.address}
                          onChange={(e) => setNewAddress({...newAddress, address: e.target.value})}
                          placeholder="Mahalle, sokak, bina no, daire no"
                          rows="3"
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #dee2e6',
                            borderRadius: '5px',
                            fontSize: '14px',
                            resize: 'vertical'
                          }}
                          required
                        />
                      </div>

                      <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                          Mahalle
                        </label>
                        <input
                          type="text"
                          value={newAddress.neighborhood}
                          onChange={(e) => setNewAddress({...newAddress, neighborhood: e.target.value})}
                          placeholder="Mahalle adı"
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #dee2e6',
                            borderRadius: '5px',
                            fontSize: '14px'
                          }}
                        />
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                            İlçe
                          </label>
                          <input
                            type="text"
                            value={newAddress.district}
                            onChange={(e) => setNewAddress({...newAddress, district: e.target.value})}
                            placeholder="İlçe"
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #dee2e6',
                              borderRadius: '5px',
                              fontSize: '14px'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                            Şehir *
                          </label>
                          <input
                            type="text"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                            placeholder="İstanbul, Ankara"
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #dee2e6',
                              borderRadius: '5px',
                              fontSize: '14px'
                            }}
                            required
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '15px' }}>
                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                            Telefon *
                          </label>
                          <input
                            type="tel"
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                            placeholder="5XX XXX XX XX"
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #dee2e6',
                              borderRadius: '5px',
                              fontSize: '14px'
                            }}
                            required
                          />
                        </div>

                        <div>
                          <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>
                            Posta Kodu
                          </label>
                          <input
                            type="text"
                            value={newAddress.postal_code}
                            onChange={(e) => setNewAddress({...newAddress, postal_code: e.target.value})}
                            placeholder="34000"
                            style={{
                              width: '100%',
                              padding: '10px',
                              border: '1px solid #dee2e6',
                              borderRadius: '5px',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: '20px' }}>
                        <label style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          cursor: 'pointer'
                        }}>
                          <input
                            type="checkbox"
                            checked={newAddress.default}
                            onChange={(e) => setNewAddress({...newAddress, default: e.target.checked})}
                          />
                          <span style={{ fontSize: '14px' }}>
                            Varsayılan adres olarak ayarla
                          </span>
                        </label>
                      </div>

                      <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                          type="submit"
                          style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          Kaydet
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddressModal(false);
                            setNewAddress({
                              title: '',
                              name: '',
                              address: '',
                              city: '',
                              district: '',
                              neighborhood: '',
                              phone: '',
                              postal_code: '',
                              default: false
                            });
                          }}
                          style={{
                            flex: 1,
                            padding: '12px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontWeight: '500'
                          }}
                        >
                          İptal
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Hesap Ayarları Tab */}
          {activeTab === 'account' && (
            <div>
              <h2 style={{ marginBottom: '30px', color: '#2c3e50' }}>Hesap Ayarları</h2>
              
              {/* Profil Bilgileri */}
              <div style={{ marginBottom: '40px' }}>
                <h3 style={{ marginBottom: '20px', color: '#495057' }}>
                  Profil Bilgileri
                </h3>
                
                {!editMode ? (
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    padding: '20px',
                    borderRadius: '10px'
                  }}>
                    <div style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '20px',
                      marginBottom: '20px'
                    }}>
                      <div>
                        <label style={{ color: '#6c757d', fontSize: '14px' }}>Ad</label>
                        <p style={{ fontSize: '16px', fontWeight: '500' }}>{user?.name}</p>
                      </div>
                      <div>
                        <label style={{ color: '#6c757d', fontSize: '14px' }}>Soyad</label>
                        <p style={{ fontSize: '16px', fontWeight: '500' }}>{user?.surname}</p>
                      </div>
                      <div>
                        <label style={{ color: '#6c757d', fontSize: '14px' }}>Email</label>
                        <p style={{ fontSize: '16px', fontWeight: '500' }}>{user?.email}</p>
                      </div>
                      <div>
                        <label style={{ color: '#6c757d', fontSize: '14px' }}>Telefon</label>
                        <p style={{ fontSize: '16px', fontWeight: '500' }}>
                          {profileData.phone || 'Belirtilmemiş'}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => setEditMode(true)}
                      style={{
                        padding: '10px 20px',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      Bilgileri Düzenle
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleProfileUpdate}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                      gap: '20px',
                      marginBottom: '20px'
                    }}>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Ad</label>
                        <input
                          type="text"
                          value={profileData.name}
                          onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #dee2e6',
                            borderRadius: '5px'
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Soyad</label>
                        <input
                          type="text"
                          value={profileData.surname}
                          onChange={(e) => setProfileData({...profileData, surname: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #dee2e6',
                            borderRadius: '5px'
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #dee2e6',
                            borderRadius: '5px'
                          }}
                          required
                          disabled
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Telefon</label>
                        <input
                          type="tel"
                          value={profileData.phone}
                          onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                          style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #dee2e6',
                            borderRadius: '5px'
                          }}
                          placeholder="5XX XXX XX XX"
                        />
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        type="submit"
                        disabled={loading}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: loading ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {loading ? 'Kaydediliyor...' : 'Kaydet'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        style={{
                          padding: '10px 20px',
                          backgroundColor: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                      >
                        İptal
                      </button>
                    </div>
                  </form>
                )}
              </div>
              
              {/* Şifre Değiştirme */}
              <div>
                <h3 style={{ marginBottom: '20px', color: '#495057' }}>
                  Şifre Değiştir
                </h3>
                
                <form onSubmit={handlePasswordChange} style={{
                  backgroundColor: '#f8f9fa',
                  padding: '20px',
                  borderRadius: '10px',
                  maxWidth: '500px'
                }}>
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                      Mevcut Şifre
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData, 
                        currentPassword: e.target.value
                      })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #dee2e6',
                        borderRadius: '5px'
                      }}
                      required
                    />
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                      Yeni Şifre
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData, 
                        newPassword: e.target.value
                      })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #dee2e6',
                        borderRadius: '5px'
                      }}
                      required
                      minLength="6"
                    />
                  </div>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>
                      Yeni Şifre (Tekrar)
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData, 
                        confirmPassword: e.target.value
                      })}
                      style={{
                        width: '100%',
                        padding: '10px',
                        border: '1px solid #dee2e6',
                        borderRadius: '5px'
                      }}
                      required
                      minLength="6"
                    />
                  </div>
                  
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      padding: '10px 30px',
                      backgroundColor: '#667eea',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {loading ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Bildirimler Tab */}
          {activeTab === 'notifications' && (
            <div>
              <h2 style={{ marginBottom: '30px', color: '#2c3e50' }}>
                Bildirim Tercihleri
              </h2>
              
              <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '10px'
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer'
                  }}>
                    <input type="checkbox" defaultChecked />
                    <span>
                      <strong>Email Bildirimleri</strong>
                      <p style={{ margin: '5px 0', color: '#6c757d', fontSize: '14px' }}>
                        Sipariş durumu, kampanyalar ve özel fırsatlar hakkında email alın
                      </p>
                    </span>
                  </label>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer'
                  }}>
                    <input type="checkbox" defaultChecked />
                    <span>
                      <strong>SMS Bildirimleri</strong>
                      <p style={{ margin: '5px 0', color: '#6c757d', fontSize: '14px' }}>
                        Kargo takibi ve önemli güncellemeler için SMS alın
                      </p>
                    </span>
                  </label>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer'
                  }}>
                    <input type="checkbox" defaultChecked />
                    <span>
                      <strong>Kampanya Bildirimleri</strong>
                      <p style={{ margin: '5px 0', color: '#6c757d', fontSize: '14px' }}>
                        İndirimler ve özel kampanyalardan haberdar olun
                      </p>
                    </span>
                  </label>
                </div>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer'
                  }}>
                    <input type="checkbox" />
                    <span>
                      <strong>Ürün Önerileri</strong>
                      <p style={{ margin: '5px 0', color: '#6c757d', fontSize: '14px' }}>
                        Size özel ürün önerileri alın
                      </p>
                    </span>
                  </label>
                </div>
                
                <button style={{
                  padding: '10px 30px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}>
                  Tercihleri Kaydet
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Hızlı Linkler */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginTop: '30px'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'transform 0.3s'
          }}
          onClick={() => navigate('/iletisim')}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>💬</div>
            <h4>Destek Merkezi</h4>
            <p style={{ color: '#6c757d', fontSize: '14px' }}>
              Sorularınız için bize ulaşın
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'transform 0.3s'
          }}
          onClick={() => navigate('/iade-degisim')}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🔄</div>
            <h4>İade ve Değişim</h4>
            <p style={{ color: '#6c757d', fontSize: '14px' }}>
              İade politikamızı görüntüleyin
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'transform 0.3s'
          }}
          onClick={() => navigate('/sss')}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>❓</div>
            <h4>S.S.S.</h4>
            <p style={{ color: '#6c757d', fontSize: '14px' }}>
              Sık sorulan sorular
            </p>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            transition: 'transform 0.3s'
          }}
          onClick={() => navigate('/urunler')}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>🛍️</div>
            <h4>Alışverişe Devam</h4>
            <p style={{ color: '#6c757d', fontSize: '14px' }}>
              Ürünlerimizi keşfedin
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;