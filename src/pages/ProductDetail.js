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

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data);
      } else {
        // Backend çalışmıyorsa örnek ürün
        const products = [
          { id: 1, name: 'İpek Eşarp - Mavi', price: 299.90, description: 'Saf ipek eşarp. El işçiliği ile üretilmiş, 90x90cm boyutunda premium kalite ipek eşarp. Özel hediye kutusu ile gönderilir.', stock: 10 },
          { id: 2, name: 'İpek Eşarp - Kırmızı', price: 299.90, description: 'Saf ipek eşarp. El işçiliği ile üretilmiş, 90x90cm boyutunda premium kalite ipek eşarp. Özel hediye kutusu ile gönderilir.', stock: 8 },
          { id: 3, name: 'İpek Şal - Siyah', price: 499.90, description: 'Premium ipek şal. 180x70cm boyutunda, el işlemeli detaylar ile süslenmiş lüks ipek şal. Özel günlerinizde kullanabileceğiniz şık bir aksesuar.', stock: 5 },
          { id: 4, name: 'İpek Kravat - Lacivert', price: 199.90, description: 'Erkek ipek kravat. İtalyan işçiliği ile üretilmiş, %100 saf ipek klasik erkek kravatı. Özel kutusunda teslim edilir.', stock: 15 },
          { id: 5, name: 'İpek Mendil Seti', price: 149.90, description: '4 adet ipek mendil. Farklı renk ve desenlerde 4 adet cep mendili seti. Özel hediye kutusu içerisinde.', stock: 20 }
        ];
        const foundProduct = products.find(p => p.id === parseInt(id));
        setProduct(foundProduct);
      }
    } catch (error) {
      console.error('Ürün yüklenemedi:', error);
      // Hata durumunda da örnek ürün göster
      setProduct({
        id: parseInt(id),
        name: 'İpek Ürün',
        price: 299.90,
        description: 'Premium kalite ipek ürün. Detaylı açıklama yükleniyor...',
        stock: 10
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

  return (
    <div style={{ 
      display: 'flex', 
      height: 'calc(100vh - 60px)', // Navbar yüksekliğini çıkar
      backgroundColor: '#fff'
    }}>
      {/* Sol Taraf - Ürün Resmi */}
      <div style={{ 
        flex: '1', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        padding: '40px'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '600px',
          height: '600px',
          backgroundColor: '#e9ecef',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}>
          {product.images && product.images.length > 0 ? (
            <img 
              src={product.images[0]} 
              alt={product.name}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                borderRadius: '10px'
              }}
            />
          ) : (
            <div style={{ textAlign: 'center', color: '#6c757d' }}>
              <div style={{ fontSize: '72px', marginBottom: '20px' }}>🧣</div>
              <p style={{ fontSize: '18px' }}>Ürün Görseli</p>
            </div>
          )}
        </div>
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