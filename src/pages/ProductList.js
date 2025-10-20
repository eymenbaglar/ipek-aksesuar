import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function ProductList() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    fetchProducts();
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(savedFavorites);
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        // Backend çalışmıyorsa örnek ürünler
        setProducts([
          { id: 1, name: 'İpek Eşarp - Mavi', price: 299.90, description: 'Saf ipek eşarp', images: [] },
          { id: 2, name: 'İpek Eşarp - Kırmızı', price: 299.90, description: 'Saf ipek eşarp', images: [] },
          { id: 3, name: 'İpek Şal - Siyah', price: 499.90, description: 'Premium ipek şal', images: [] },
          { id: 4, name: 'İpek Kravat - Lacivert', price: 199.90, description: 'Erkek ipek kravat', images: [] },
          { id: 5, name: 'İpek Mendil Seti', price: 149.90, description: '4 adet ipek mendil', images: [] }
        ]);
      }
    } catch (error) {
      // Hata durumunda örnek ürünler
      setProducts([
        { id: 1, name: 'İpek Eşarp - Mavi', price: 299.90, description: 'Saf ipek eşarp', images: [] },
        { id: 2, name: 'İpek Eşarp - Kırmızı', price: 299.90, description: 'Saf ipek eşarp', images: [] },
        { id: 3, name: 'İpek Şal - Siyah', price: 499.90, description: 'Premium ipek şal', images: [] },
        { id: 4, name: 'İpek Kravat - Lacivert', price: 199.90, description: 'Erkek ipek kravat', images: [] },
        { id: 5, name: 'İpek Mendil Seti', price: 149.90, description: '4 adet ipek mendil', images: [] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (productId) => {
    return favorites.some(fav => fav.id === productId);
  };

  const toggleFavorite = (product, e) => {
    e.stopPropagation(); // Kart tıklamasını engelle
    
    const currentFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    if (isFavorite(product.id)) {
      // Favorilerden kaldır
      const newFavorites = currentFavorites.filter(fav => fav.id !== product.id);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } else {
      // Favorilere ekle
      const favoriteProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : null,
        description: product.description
      };
      currentFavorites.push(favoriteProduct);
      localStorage.setItem('favorites', JSON.stringify(currentFavorites));
      setFavorites(currentFavorites);
    }
  };

  const getProductImages = (product) => {
    if (!product.images) return [];
    
    if (typeof product.images === 'string') {
      try {
        const parsed = JSON.parse(product.images);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return product.images.split(',').map(url => url.trim()).filter(url => url);
      }
    }
    
    return Array.isArray(product.images) ? product.images : [];
  };

  const handleProductClick = (productId) => {
    navigate(`/urun/${productId}`);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Yükleniyor...</div>;
  }

  return (
    <div style={{ padding: '40px 20px', backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <h1 style={{ 
        textAlign: 'center', 
        color: '#2c3e50', 
        marginBottom: '40px',
        fontSize: '36px'
      }}>
        Tüm Ürünler
      </h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '30px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {products.map(product => {
          const productImages = getProductImages(product);
          const hasImage = productImages.length > 0;
          
          return (
            <div 
              key={product.id} 
              style={{
                border: '1px solid #dee2e6',
                borderRadius: '15px',
                overflow: 'hidden',
                backgroundColor: 'white',
                boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                cursor: 'pointer',
                position: 'relative'
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
              {/* Favori Butonu */}
              <button
                onClick={(e) => toggleFavorite(product, e)}
                style={{
                  position: 'absolute',
                  top: '15px',
                  right: '15px',
                  backgroundColor: isFavorite(product.id) ? '#dc3545' : 'rgba(255, 255, 255, 0.9)',
                  border: isFavorite(product.id) ? 'none' : '1px solid #dee2e6',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '20px',
                  zIndex: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
                title={isFavorite(product.id) ? 'Favorilerden Kaldır' : 'Favorilere Ekle'}
              >
                {isFavorite(product.id) ? '❤️' : '🤍'}
              </button>

              {/* Ürün Görseli */}
              <div style={{
                width: '100%',
                height: '300px',
                backgroundColor: '#f8f9fa',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {hasImage ? (
                  <img 
                    src={productImages[0]} 
                    alt={product.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div style="font-size: 48px;">🧣</div>';
                    }}
                  />
                ) : (
                  <div style={{ textAlign: 'center', color: '#adb5bd' }}>
                    <div style={{ fontSize: '48px', marginBottom: '10px' }}>🧣</div>
                    <span style={{ fontSize: '14px' }}>Ürün Görseli</span>
                  </div>
                )}
                
                {/* Hızlı İncele Overlay */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: 'rgba(102, 126, 234, 0.95)',
                  color: 'white',
                  padding: '12px',
                  transform: 'translateY(100%)',
                  transition: 'transform 0.3s ease',
                  textAlign: 'center',
                  fontSize: '16px',
                  fontWeight: '500'
                }}
                className="view-overlay">
                  Hızlı İncele →
                </div>
              </div>
              
              {/* Ürün Bilgileri */}
              <div style={{ padding: '20px' }}>
                <h3 style={{ 
                  marginBottom: '10px',
                  color: '#2c3e50',
                  fontSize: '20px',
                  minHeight: '50px'
                }}>
                  {product.name}
                </h3>
                
                <p style={{ 
                  color: '#6c757d', 
                  fontSize: '14px',
                  marginBottom: '15px',
                  minHeight: '40px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical'
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
                  
                  {product.stock > 0 ? (
                    <span style={{
                      fontSize: '14px',
                      color: '#28a745',
                      fontWeight: '500'
                    }}>
                      ✓ Stokta
                    </span>
                  ) : (
                    <span style={{
                      fontSize: '14px',
                      color: '#dc3545',
                      fontWeight: '500'
                    }}>
                      ✗ Tükendi
                    </span>
                  )}
                </div>

                {/* Ürünü İncele Butonu */}
                <button
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
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
                    e.stopPropagation();
                    handleProductClick(product.id);
                  }}
                >
                  Ürünü İncele
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Boş durum */}
      {products.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: 'white',
          borderRadius: '10px',
          maxWidth: '500px',
          margin: '0 auto'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>📦</div>
          <h2 style={{ color: '#6c757d', marginBottom: '10px' }}>
            Henüz ürün eklenmemiş
          </h2>
          <p style={{ color: '#6c757d' }}>
            Admin panelden yeni ürünler ekleyebilirsiniz.
          </p>
        </div>
      )}

      {/* CSS için hover efekti */}
      <style>{`
        .view-overlay:hover {
          transform: translateY(0) !important;
        }
        
        @media (max-width: 768px) {
          .view-overlay {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

export default ProductList;