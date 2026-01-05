import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // Hangi resim gösteriliyor
  const [isFavorite, setIsFavorite] = useState(false);

useEffect(() => {
  // Favori kontrolü
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  setIsFavorite(favorites.some(fav => fav.id === product?.id));
}, [product]);

const toggleFavorite = () => {
  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
  
  if (isFavorite) {
    const newFavorites = favorites.filter(fav => fav.id !== product.id);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    setIsFavorite(false);
    alert('Favorilerden kaldırıldı!');
  } else {
    favorites.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: productImages[0] || null
    });
    localStorage.setItem('favorites', JSON.stringify(favorites));
    setIsFavorite(true);
    alert('Favorilere eklendi!');
  }
};
  

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Ürün verisi:', data); // Debug için
        setProduct(data);
      } else {
        // Backend çalışmıyorsa örnek ürün
        const products = [
          { 
            id: 1, 
            name: 'İpek Eşarp - Mavi', 
            price: 299.90, 
            description: 'Saf ipek eşarp. El işçiliği ile üretilmiş, 90x90cm boyutunda premium kalite ipek eşarp. Özel hediye kutusu ile gönderilir.', 
            stock: 10,
            images: [
              'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400',
              'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400'
            ]
          },
          { id: 2, name: 'İpek Eşarp - Kırmızı', price: 299.90, description: 'Saf ipek eşarp', stock: 8, images: [] },
          { id: 3, name: 'İpek Şal - Siyah', price: 499.90, description: 'Premium ipek şal', stock: 5, images: [] },
        ];
        const foundProduct = products.find(p => p.id === parseInt(id));
        setProduct(foundProduct);
      }
    } catch (error) {
      console.error('Ürün yüklenemedi:', error);
      setProduct({
        id: parseInt(id),
        name: 'İpek Ürün',
        price: 299.90,
        description: 'Premium kalite ipek ürün',
        stock: 10,
        images: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 3000);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= product.stock) {
      setQuantity(value);
    }
  };

  // Resim dizisini kontrol et ve düzelt
  const getProductImages = () => {
    if (!product.images) return [];
    
    // Eğer images string ise array'e çevir
    if (typeof product.images === 'string') {
      try {
        // JSON string ise parse et
        const parsed = JSON.parse(product.images);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        // JSON değilse virgülle ayır
        return product.images.split(',').map(url => url.trim()).filter(url => url);
      }
    }
    
    // Zaten array ise direkt döndür
    return Array.isArray(product.images) ? product.images : [];
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <h2>Yükleniyor...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px' 
      }}>
        <h2>Ürün bulunamadı</h2>
        <button 
          onClick={() => navigate('/urunler')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Ürünlere Dön
        </button>
      </div>
    );
  }

  const productImages = getProductImages();
  const hasImages = productImages.length > 0;

  return (
    <div style={{ 
      display: 'flex', 
      minHeight: 'calc(100vh - 60px)',
      backgroundColor: '#fff'
    }}>
      {/* Sol Taraf - Ürün Resimleri */}
      <div style={{ 
        flex: '1', 
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        padding: '40px'
      }}>
        {/* Ana Resim */}
        <div style={{
          width: '100%',
          maxWidth: '600px',
          height: '600px',
          backgroundColor: '#fff',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {hasImages ? (
            <>
              <img 
                src={productImages[selectedImageIndex]} 
                alt={`${product.name} - ${selectedImageIndex + 1}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect width="400" height="400" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999"%3EResim Yüklenemedi%3C/text%3E%3C/svg%3E';
                }}
              />
              
              {/* Resim Navigasyon Okları */}
              {productImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => prev === 0 ? productImages.length - 1 : prev - 1)}
                    style={{
                      position: 'absolute',
                      left: '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      fontSize: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1
                    }}
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex((prev) => (prev + 1) % productImages.length)}
                    style={{
                      position: 'absolute',
                      right: '20px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '40px',
                      height: '40px',
                      fontSize: '20px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 1
                    }}
                  >
                    ›
                  </button>
                </>
              )}
              
              {/* Resim Sayacı */}
              {productImages.length > 1 && (
                <div style={{
                  position: 'absolute',
                  bottom: '20px',
                  right: '20px',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  padding: '5px 10px',
                  borderRadius: '20px',
                  fontSize: '14px'
                }}>
                  {selectedImageIndex + 1} / {productImages.length}
                </div>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', color: '#6c757d' }}>
              <div style={{ fontSize: '72px', marginBottom: '20px' }}>🧣</div>
              <p style={{ fontSize: '18px' }}>Ürün Görseli</p>
            </div>
          )}
        </div>

        {/* Thumbnail Resimleri */}
        {hasImages && productImages.length > 1 && (
          <div style={{
            display: 'flex',
            gap: '10px',
            marginTop: '20px',
            maxWidth: '600px',
            overflowX: 'auto',
            padding: '10px 0'
          }}>
            {productImages.map((image, index) => (
              <div
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                style={{
                  minWidth: '80px',
                  width: '80px',
                  height: '80px',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: selectedImageIndex === index ? '3px solid #667eea' : '3px solid transparent',
                  transition: 'all 0.3s ease',
                  backgroundColor: '#fff',
                  flexShrink: 0
                }}
              >
                <img
                  src={image}
                  alt={`Thumbnail ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="10"%3EHata%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
            ))}
          </div>
        )}
        
      </div>

      {/* Sağ Taraf - Ürün Bilgileri */}
      <div style={{ 
        flex: '1', 
        padding: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        {/* Ürün Adı */}
        <h1 style={{ 
          fontSize: '48px', 
          marginBottom: '30px',
          color: '#2c3e50',
          fontWeight: '300',
          lineHeight: '1.2'
        }}>
          {product.name}
        </h1>

        {/* Ürün Açıklaması */}
        <p style={{ 
          fontSize: '18px', 
          color: '#6c757d',
          lineHeight: '1.8',
          marginBottom: '40px'
        }}>
          {product.description || 'Premium kalite ipek ürün. El işçiliği ile üretilmiş, özel hediye kutusu ile gönderilir.'}
        </p>

        {/* Ürün Özellikleri */}
        <div style={{ 
          marginBottom: '40px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '10px'
        }}>
          <h3 style={{ marginBottom: '15px', color: '#495057' }}>Ürün Özellikleri</h3>
          <ul style={{ 
            listStyle: 'none', 
            padding: 0,
            color: '#6c757d'
          }}>
            <li style={{ marginBottom: '10px' }}>✓ %100 Saf İpek</li>
            <li style={{ marginBottom: '10px' }}>✓ El İşçiliği</li>
            <li style={{ marginBottom: '10px' }}>✓ Özel Hediye Kutusu</li>
            <li style={{ marginBottom: '10px' }}>✓ 2-3 Gün İçinde Kargo</li>
            <li>✓ Stok: {product.stock} adet</li>
          </ul>
        </div>

        {/* Fiyat */}
        <div style={{ 
          fontSize: '36px', 
          color: '#667eea',
          fontWeight: 'bold',
          marginBottom: '30px'
        }}>
          {product.price} TL
        </div>

        {/* Favorilere ekle */}
              <button
        onClick={toggleFavorite}
        style={{
          padding: '12px 24px',
          backgroundColor: isFavorite ? '#dc3545' : 'transparent',
          color: isFavorite ? 'white' : '#dc3545',
          border: `2px solid #dc3545`,
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          transition: 'all 0.3s ease'
        }}
      >
        <span style={{ fontSize: '20px' }}>
          {isFavorite ? '❤️' : '🤍'}
        </span>
        {isFavorite ? 'Favorilerden Kaldır' : 'Favorilere Ekle'}
      </button>



        {/* Adet Seçimi ve Sepete Ekle */}
        <div style={{ 
          display: 'flex', 
          gap: '20px',
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '16px', color: '#495057' }}>Adet:</label>
            <select 
              value={quantity} 
              onChange={handleQuantityChange}
              style={{
                padding: '12px 20px',
                fontSize: '16px',
                border: '2px solid #dee2e6',
                borderRadius: '5px',
                backgroundColor: 'white',
                cursor: 'pointer',
                minWidth: '80px'
              }}
            >
              {[...Array(Math.min(10, product.stock))].map((_, i) => (
                <option key={i + 1} value={i + 1}>{i + 1}</option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            style={{
              flex: 1,
              padding: '15px 40px',
              fontSize: '18px',
              backgroundColor: product.stock === 0 ? '#6c757d' : '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              fontWeight: '500'
            }}
          >
            {product.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
          </button>
        </div>

        {/* Sepete Eklendi Bildirimi */}
        {addedToCart && (
          <div style={{
            padding: '15px',
            backgroundColor: '#28a745',
            color: 'white',
            borderRadius: '5px',
            textAlign: 'center',
            animation: 'fadeIn 0.3s ease'
          }}>
            ✓ Ürün sepete eklendi!
          </div>
        )}

        {/* Geri Dön Butonu */}
        <button
          onClick={() => navigate('/urunler')}
          style={{
            marginTop: '20px',
            padding: '10px 20px',
            backgroundColor: 'transparent',
            color: '#667eea',
            border: '2px solid #667eea',
            borderRadius: '5px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#667eea';
            e.target.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#667eea';
          }}
        >
          ← Ürünlere Geri Dön
        </button>
      </div>
    </div>
  );
}

export default ProductDetail;