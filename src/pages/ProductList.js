import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        // Backend çalışmıyorsa örnek ürünler
        setProducts([
          { id: 1, name: 'İpek Eşarp - Mavi', price: 299.90, description: 'Saf ipek eşarp' },
          { id: 2, name: 'İpek Eşarp - Kırmızı', price: 299.90, description: 'Saf ipek eşarp' },
          { id: 3, name: 'İpek Şal - Siyah', price: 499.90, description: 'Premium ipek şal' },
          { id: 4, name: 'İpek Kravat - Lacivert', price: 199.90, description: 'Erkek ipek kravat' },
          { id: 5, name: 'İpek Mendil Seti', price: 149.90, description: '4 adet ipek mendil' }
        ]);
      }
    } catch (error) {
      // Hata durumunda örnek ürünler
      setProducts([
        { id: 1, name: 'İpek Eşarp - Mavi', price: 299.90, description: 'Saf ipek eşarp' },
        { id: 2, name: 'İpek Eşarp - Kırmızı', price: 299.90, description: 'Saf ipek eşarp' },
        { id: 3, name: 'İpek Şal - Siyah', price: 499.90, description: 'Premium ipek şal' },
        { id: 4, name: 'İpek Kravat - Lacivert', price: 199.90, description: 'Erkek ipek kravat' },
        { id: 5, name: 'İpek Mendil Seti', price: 149.90, description: '4 adet ipek mendil' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = (productId) => {
    console.log('Ürün ID:', productId); // Debug için
    navigate(`/urun/${productId}`);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Yükleniyor...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#667eea', marginBottom: '40px' }}>Tüm Ürünler</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '30px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {products.map(product => (
          <div 
            key={product.id} 
            style={{
              border: '1px solid #dee2e6',
              borderRadius: '15px',
              overflow: 'hidden',
              backgroundColor: 'white',
              boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={() => handleProductClick(product.id)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-5px)';
              e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.08)';
            }}
          >
            {/* Ürün Görseli */}
            <div style={{
              width: '100%',
              height: '300px',
              backgroundColor: '#f8f9fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{ textAlign: 'center', color: '#adb5bd' }}>
                  <div style={{ fontSize: '48px', marginBottom: '10px' }}>🧣</div>
                  <span style={{ fontSize: '14px' }}>Ürün Görseli</span>
                </div>
              )}
            </div>
            
            {/* Ürün Bilgileri */}
            <div style={{ padding: '20px' }}>
              <h3 style={{ 
                marginBottom: '10px',
                color: '#2c3e50',
                fontSize: '20px'
              }}>
                {product.name}
              </h3>
              
              <p style={{ 
                color: '#6c757d', 
                fontSize: '14px',
                marginBottom: '15px',
                minHeight: '40px'
              }}>
                {product.description}
              </p>
              
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px'
              }}>
                <span style={{ 
                  fontSize: '24px', 
                  color: '#667eea', 
                  fontWeight: 'bold' 
                }}>
                  {product.price} TL
                </span>
                
                <span style={{
                  fontSize: '14px',
                  color: '#28a745'
                }}>
                  ✓ Stokta
                </span>
              </div>

              {/* Ürünü İncele Butonu */}
              <button
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#5569d0';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#667eea';
                }}
                onClick={(e) => {
                  e.stopPropagation(); // Çift tıklamayı önle
                  handleProductClick(product.id);
                }}
              >
                Ürünü İncele →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;