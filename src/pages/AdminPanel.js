import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function AdminPanel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: ''
  });

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
    }
    fetchProducts();
    fetchUsers();
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
      // Test için örnek ürünler
      setProducts([
        { id: 1, name: 'İpek Eşarp', price: 299.90, stock: 10 },
        { id: 2, name: 'İpek Şal', price: 499.90, stock: 5 }
      ]);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
      // Test için örnek kullanıcılar
      setUsers([
        { id: 1, name: 'Admin', email: 'admin@ipekaksesuar.com', role: 'admin' },
        { id: 2, name: 'Test', email: 'test@test.com', role: 'user' }
      ]);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price),
          stock: parseInt(newProduct.stock),
          images: []
        })
      });
      
      if (response.ok) {
        alert('Ürün eklendi!');
        fetchProducts();
        setNewProduct({ name: '', description: '', price: '', stock: '' });
      }
    } catch (error) {
      alert('Ürün eklenirken hata oluştu');
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm('Bu ürünü silmek istediğinize emin misiniz?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/admin/products/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
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
    backgroundColor: '#f8f9fa'
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
        <div
          style={tabStyle(activeTab === 'dashboard')}
          onClick={() => setActiveTab('dashboard')}
        >
          📊 Dashboard
        </div>
        <div
          style={tabStyle(activeTab === 'products')}
          onClick={() => setActiveTab('products')}
        >
          📦 Ürün Yönetimi
        </div>
        <div
          style={tabStyle(activeTab === 'users')}
          onClick={() => setActiveTab('users')}
        >
          👥 Kullanıcılar
        </div>
        <div
          style={tabStyle(activeTab === 'orders')}
          onClick={() => setActiveTab('orders')}
        >
          🛒 Siparişler
        </div>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {activeTab === 'dashboard' && (
          <div>
            <h1>Dashboard</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#667eea' }}>Toplam Ürün</h3>
                <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{products.length}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#27ae60' }}>Toplam Kullanıcı</h3>
                <p style={{ fontSize: '36px', fontWeight: 'bold' }}>{users.length}</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#e74c3c' }}>Bekleyen Sipariş</h3>
                <p style={{ fontSize: '36px', fontWeight: 'bold' }}>0</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                <h3 style={{ color: '#f39c12' }}>Aylık Gelir</h3>
                <p style={{ fontSize: '36px', fontWeight: 'bold' }}>0 TL</p>
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
              <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
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
                <button
                  type="submit"
                  style={{
                    gridColumn: 'span 2',
                    padding: '10px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Ürün Ekle
                </button>
              </form>
            </div>

            {/* Ürün Listesi */}
            <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px' }}>
              <h3>Mevcut Ürünler</h3>
              <table style={{ width: '100%', marginTop: '15px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '10px', textAlign: 'left' }}>ID</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Ürün Adı</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Fiyat</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Stok</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px' }}>{product.id}</td>
                      <td style={{ padding: '10px' }}>{product.name}</td>
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
                            cursor: 'pointer'
                          }}
                        >
                          Sil
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              <p>Henüz sipariş bulunmamaktadır.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;