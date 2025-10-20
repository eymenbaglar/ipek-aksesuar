import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

function HomePage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  // Hero Banner Slider Verileri
  const slides = [
    {
      id: 1,
      title: 'Yeni Sezon İpek Koleksiyonu',
      subtitle: 'Baharın En Şık Renkleri',
      description: 'Premium kalite %100 saf ipek ürünlerle tanışın',
      buttonText: 'Koleksiyonu Keşfet',
      buttonLink: '/urunler',
      bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      image: '🧣'
    },
    {
      id: 2,
      title: 'Özel İndirim Günleri',
      subtitle: '%25 İndirim',
      description: 'Seçili ürünlerde geçerli, sınırlı süre',
      buttonText: 'Fırsatları Gör',
      buttonLink: '/urunler',
      bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      image: '🎁'
    },
    {
      id: 3,
      title: 'Hediye Paketleme',
      subtitle: 'Ücretsiz Özel Kutu',
      description: 'Sevdiklerinize özel hediye seçenekleri',
      buttonText: 'Hediyelik Ürünler',
      buttonLink: '/urunler',
      bgColor: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      image: '💝'
    }
  ];

  // Slider otomatik geçiş
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // 5 saniyede bir değiş

    return () => clearInterval(timer);
  }, [slides.length]);

  // Ürünleri yükle
  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (response.ok) {
        const data = await response.json();
        setFeaturedProducts(data.slice(0, 4));
      } else {
        // Örnek ürünler
        setFeaturedProducts([
          { id: 1, name: 'İpek Eşarp - Mavi', price: 299.90, badge: 'Yeni', oldPrice: 399.90 },
          { id: 2, name: 'İpek Şal - Siyah', price: 499.90, badge: 'Popüler' },
          { id: 3, name: 'İpek Kravat', price: 199.90, badge: '%20 İndirim', oldPrice: 249.90 },
          { id: 4, name: 'İpek Mendil Seti', price: 149.90, badge: 'Son 5 Adet' }
        ]);
      }
    } catch (error) {
      setFeaturedProducts([
        { id: 1, name: 'İpek Eşarp - Mavi', price: 299.90, badge: 'Yeni' },
        { id: 2, name: 'İpek Şal - Siyah', price: 499.90, badge: 'Popüler' },
        { id: 3, name: 'İpek Kravat', price: 199.90 },
        { id: 4, name: 'İpek Mendil Seti', price: 149.90 }
      ]);
    }
  };

  return (
    <div style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      {/* Hero Banner Slider */}
      <section style={{ position: 'relative', height: '500px', overflow: 'hidden' }}>
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: slide.bgColor,
              opacity: currentSlide === index ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <div style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '0 20px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              alignItems: 'center',
              gap: '50px'
            }}>
              {/* Sol Taraf - Metin */}
              <div style={{ color: 'white' }}>
                <h3 style={{
                  fontSize: '18px',
                  marginBottom: '10px',
                  opacity: 0.9,
                  letterSpacing: '2px',
                  textTransform: 'uppercase'
                }}>
                  {slide.subtitle}
                </h3>
                <h1 style={{
                  fontSize: '48px',
                  marginBottom: '20px',
                  fontWeight: 'bold',
                  lineHeight: '1.2'
                }}>
                  {slide.title}
                </h1>
                <p style={{
                  fontSize: '20px',
                  marginBottom: '30px',
                  opacity: 0.9
                }}>
                  {slide.description}
                </p>
                <button
                  onClick={() => navigate(slide.buttonLink)}
                  style={{
                    padding: '15px 40px',
                    fontSize: '18px',
                    backgroundColor: 'white',
                    color: '#667eea',
                    border: 'none',
                    borderRadius: '50px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    transition: 'transform 0.3s',
                    boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-3px)';
                    e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                  }}
                >
                  {slide.buttonText} →
                </button>
              </div>

              {/* Sağ Taraf - Görsel */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '200px',
                animation: 'float 3s ease-in-out infinite'
              }}>
                {slide.image}
              </div>
            </div>
          </div>
        ))}

        {/* Slider Noktaları */}
        <div style={{
          position: 'absolute',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '10px'
        }}>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: currentSlide === index ? '30px' : '10px',
                height: '10px',
                borderRadius: '5px',
                border: 'none',
                backgroundColor: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s'
              }}
            />
          ))}
        </div>
      </section>

      {/* Özellikler Bölümü */}
      <section style={{ padding: '60px 20px', backgroundColor: 'white' }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px',
              backgroundColor: '#f8f9fa',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}>
              🚚
            </div>
            <h3 style={{ marginBottom: '10px', color: '#2c3e50' }}>Hızlı Kargo</h3>
            <p style={{ color: '#6c757d' }}>2-3 iş günü içinde teslim</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px',
              backgroundColor: '#f8f9fa',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}>
              ✨
            </div>
            <h3 style={{ marginBottom: '10px', color: '#2c3e50' }}>%100 İpek</h3>
            <p style={{ color: '#6c757d' }}>Saf ipek garantisi</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px',
              backgroundColor: '#f8f9fa',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}>
              🎁
            </div>
            <h3 style={{ marginBottom: '10px', color: '#2c3e50' }}>Özel Paket</h3>
            <p style={{ color: '#6c757d' }}>Hediye paketi seçeneği</p>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px',
              backgroundColor: '#f8f9fa',
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto'
            }}>
              💳
            </div>
            <h3 style={{ marginBottom: '10px', color: '#2c3e50' }}>Güvenli Ödeme</h3>
            <p style={{ color: '#6c757d' }}>256 bit SSL güvenlik</p>
          </div>
        </div>
      </section>

      {/* Öne Çıkan Ürünler */}
      <section style={{ padding: '60px 20px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center',
            fontSize: '36px',
            marginBottom: '50px',
            color: '#2c3e50'
          }}>
            Öne Çıkan Ürünler
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '30px'
          }}>
            {featuredProducts.map(product => (
              <div
                key={product.id}
                style={{
                  backgroundColor: 'white',
                  borderRadius: '15px',
                  overflow: 'hidden',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  cursor: 'pointer',
                  position: 'relative'
                }}
                onClick={() => navigate(`/urun/${product.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.08)';
                }}
              >
                {/* Badge */}
                {product.badge && (
                  <span style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    backgroundColor: product.badge.includes('İndirim') ? '#e74c3c' : '#27ae60',
                    color: 'white',
                    padding: '5px 15px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    zIndex: 1
                  }}>
                    {product.badge}
                  </span>
                )}

                {/* Ürün Görseli */}
                <div style={{
                  height: '300px',
                  backgroundColor: '#f8f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '80px'
                }}>
                  🧣
                </div>

                {/* Ürün Bilgileri */}
                <div style={{ padding: '20px' }}>
                  <h3 style={{
                    fontSize: '18px',
                    marginBottom: '10px',
                    color: '#2c3e50'
                  }}>
                    {product.name}
                  </h3>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '15px'
                  }}>
                    <span style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#667eea'
                    }}>
                      {product.price} TL
                    </span>
                    {product.oldPrice && (
                      <span style={{
                        fontSize: '16px',
                        color: '#999',
                        textDecoration: 'line-through'
                      }}>
                        {product.oldPrice} TL
                      </span>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToCart(product);
                      alert('Ürün sepete eklendi!');
                    }}
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
                      transition: 'background 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#5569d0'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
                  >
                    Sepete Ekle
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Tüm Ürünleri Gör Butonu */}
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <button
              onClick={() => navigate('/urunler')}
              style={{
                padding: '15px 50px',
                fontSize: '18px',
                backgroundColor: 'transparent',
                color: '#667eea',
                border: '2px solid #667eea',
                borderRadius: '50px',
                cursor: 'pointer',
                fontWeight: 'bold',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#667eea';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#667eea';
              }}
            >
              Tüm Ürünleri Görüntüle →
            </button>
          </div>
        </div>
      </section>

      {/* Kampanya Banner */}
      <section style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '80px 20px',
        color: 'white',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '36px', marginBottom: '20px' }}>
            Özel Fırsatları Kaçırmayın!
          </h2>
          <p style={{ fontSize: '20px', marginBottom: '30px', opacity: 0.9 }}>
            Yeni üyelere özel %10 indirim kodu: <strong style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: '5px 15px',
              borderRadius: '5px'
            }}>HOSGELDIN10</strong>
          </p>
          <button
            onClick={() => navigate('/kayit')}
            style={{
              padding: '15px 40px',
              fontSize: '18px',
              backgroundColor: 'white',
              color: '#667eea',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'transform 0.3s'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
          >
            Hemen Üye Ol
          </button>
        </div>
      </section>

      {/* Animasyon için CSS */}
      <style jsx>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
}

export default HomePage;