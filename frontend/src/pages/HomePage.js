import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../contexts/CartContext';
import './HomePage.css';

function HomePage() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [activeScrollIndex, setActiveScrollIndex] = useState(0);
  const itemRefs = useRef([]);

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
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length]);

  // Ürünleri yükle
  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  // Scroll ile aktif kartı güncelle
  useEffect(() => {
    if (featuredProducts.length === 0) return;
    const handleScroll = () => {
      const viewportMid = window.innerHeight / 2;
      let closest = 0;
      let closestDist = Infinity;
      itemRefs.current.forEach((el, index) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const elMid = rect.top + rect.height / 2;
        const dist = Math.abs(elMid - viewportMid);
        if (dist < closestDist) {
          closestDist = dist;
          closest = index;
        }
      });
      setActiveScrollIndex(closest);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [featuredProducts]);


  const fetchFeaturedProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (response.ok) {
        const data = await response.json();
        setFeaturedProducts(data.slice(0, 6));
      } else {
        setFeaturedProducts([
          { id: 1, name: 'İpek Eşarp - Mavi', price: 299.90, badge: 'Yeni', oldPrice: 399.90 },
          { id: 2, name: 'İpek Şal - Siyah', price: 499.90, badge: 'Popüler' },
          { id: 3, name: 'İpek Kravat', price: 199.90, badge: '%20 İndirim', oldPrice: 249.90 },
          { id: 7, name: 'yeni ürün', price: 2500.00, badge: 'Son 5 Adet' }
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

  const getBadgeClass = (badge) => {
    if (badge?.includes('İndirim') || badge?.includes('%')) return 'discount';
    if (badge === 'Yeni') return 'new';
    if (badge === 'Popüler') return 'popular';
    return '';
  };

  const getProductImages = (product) => {
    if (!product.images) return [];

    if (typeof product.images === 'string') {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed)) return parsed;
        // {"0": "url", "1": "url"} gibi object ise values al
        if (parsed && typeof parsed === 'object') return Object.values(parsed).filter(url => url);
        return [];
      } catch {
        return product.images.split(',').map(url => url.trim()).filter(url => url);
      }
    }

    return Array.isArray(product.images) ? product.images : [];
  };

  const scrollProducts = featuredProducts.slice(0, 3);

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'İpek Aksesuar',
    url: 'https://ipekaksesuar.com',
    description: 'El işçiliği ile üretilmiş premium kalite ipek eşarplar, şallar ve aksesuarlar.',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Turkish'
    }
  };

  return (
    <>
    <Helmet>
      <title>İpek Aksesuar | Premium İpek Eşarp ve Şal</title>
      <meta name="description" content="El işçiliği ile üretilmiş premium kalite ipek eşarplar, şallar ve aksesuarlar. Özel hediye kutusu ile gönderim." />
      <link rel="canonical" href="https://ipekaksesuar.com" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="İpek Aksesuar | Premium İpek Eşarp ve Şal" />
      <meta property="og:description" content="El işçiliği ile üretilmiş premium kalite ipek eşarplar, şallar ve aksesuarlar. Özel hediye kutusu ile gönderim." />
      <meta property="og:url" content="https://ipekaksesuar.com" />
      <meta property="og:site_name" content="İpek Aksesuar" />
      <meta property="og:locale" content="tr_TR" />
      <script type="application/ld+json">{JSON.stringify(organizationSchema)}</script>
    </Helmet>
    <div className="homepage-container">
      {/* Hero Banner Slider */}
      <section className="hero-slider">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero-slide ${currentSlide === index ? 'active' : ''}`}
            style={{ background: slide.bgColor }}
          >
            <div className="hero-content">
              <div className="hero-text">
                <h3 className="hero-subtitle">{slide.subtitle}</h3>
                <h1 className="hero-title">{slide.title}</h1>
                <p className="hero-description">{slide.description}</p>
                <button
                  onClick={() => navigate(slide.buttonLink)}
                  className="hero-button"
                >
                  {slide.buttonText} →
                </button>
              </div>

              <div className="hero-image">
                {slide.image}
              </div>
            </div>
          </div>
        ))}

        <div className="slider-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`slider-dot ${currentSlide === index ? 'active' : ''}`}
            />
          ))}
        </div>
      </section>

      {/* Scroll Sticky Ürün Bölümü */}
      {scrollProducts.length > 0 && (() => {
        return (
          <section style={{ backgroundColor: '#fff', padding: '80px 0' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 40px' }}>
              <h2 style={{
                textAlign: 'center',
                fontSize: '32px',
                fontWeight: '700',
                color: '#2d3748',
                marginBottom: '60px',
                letterSpacing: '-0.5px'
              }}>
                Koleksiyondan Seçmeler
              </h2>
              <div style={{ display: 'flex', gap: '60px', alignItems: 'flex-start', position: 'relative' }}>

                {/* Sol: Sticky Görsel */}
                <div style={{ flex: '0 0 45%', position: 'sticky', top: '15vh', alignSelf: 'flex-start' }}>
                  <div style={{
                    borderRadius: '16px',
                    overflow: 'hidden',
                    backgroundColor: '#f8f9fa',
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
                    transition: 'all 0.4s ease'
                  }}>
                    {(() => {
                      const active = scrollProducts[activeScrollIndex];
                      if (!active) return null;
                      const imgs = getProductImages(active);
                      return imgs.length > 0 ? (
                        <img
                          key={active.id}
                          src={imgs[0]}
                          alt={active.name}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'opacity 0.4s ease'
                          }}
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{ fontSize: '80px' }}>🧣</div>
                      );
                    })()}
                  </div>
                  {/* Aktif ürün bilgisi */}
                  {(() => {
                    const active = scrollProducts[activeScrollIndex];
                    if (!active) return null;
                    return (
                      <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#2d3748', marginBottom: '8px' }}>
                          {active.name}
                        </h3>
                        <p style={{ fontSize: '20px', color: '#667eea', fontWeight: '600' }}>
                          ₺{Number(active.price).toFixed(2)}
                        </p>
                        <button
                          onClick={() => navigate(`/urun/${active.id}`)}
                          style={{
                            marginTop: '16px',
                            padding: '12px 32px',
                            backgroundColor: '#667eea',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontSize: '15px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                          }}
                          onMouseOver={(e) => e.target.style.backgroundColor = '#5a6fd8'}
                          onMouseOut={(e) => e.target.style.backgroundColor = '#667eea'}
                        >
                          Ürünü İncele →
                        </button>
                      </div>
                    );
                  })()}
                </div>

                {/* Sağ: Ürün Kartları */}
                <div style={{ flex: '1', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {scrollProducts.map((product, index) => {
                    const imgs = getProductImages(product);
                    const isActive = activeScrollIndex === index;
                    return (
                      <div
                        key={product.id}
                        ref={el => { itemRefs.current[index] = el; }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: isActive ? '28px 32px' : '20px 32px',
                          borderRadius: '16px',
                          backgroundColor: isActive ? '#f0f4ff' : '#f8f9fa',
                          border: isActive ? '2px solid #667eea' : '2px solid transparent',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer',
                          gap: '20px',
                          minHeight: '120px'
                        }}
                        onClick={() => navigate(`/urun/${product.id}`)}
                      >
                        {/* Küçük resim */}
                        <div style={{
                          width: isActive ? '90px' : '70px',
                          height: isActive ? '90px' : '70px',
                          borderRadius: '10px',
                          overflow: 'hidden',
                          flexShrink: 0,
                          backgroundColor: '#e9ecef',
                          transition: 'all 0.3s ease'
                        }}>
                          {imgs.length > 0 ? (
                            <img src={imgs[0]} alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '28px' }}>🧣</div>
                          )}
                        </div>
                        {/* Yazılar */}
                        <div style={{ flex: 1 }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            color: isActive ? '#667eea' : '#adb5bd',
                            letterSpacing: '2px',
                            textTransform: 'uppercase',
                            display: 'block',
                            marginBottom: '6px',
                            transition: 'color 0.3s ease'
                          }}>
                            
                          </span>
                          <h3 style={{
                            fontSize: isActive ? '18px' : '16px',
                            fontWeight: '700',
                            color: isActive ? '#2d3748' : '#6c757d',
                            marginBottom: '4px',
                            transition: 'all 0.3s ease'
                          }}>
                            {product.name}
                          </h3>
                          <p style={{
                            fontSize: '15px',
                            color: isActive ? '#667eea' : '#adb5bd',
                            fontWeight: '600',
                            transition: 'color 0.3s ease'
                          }}>
                            ₺{Number(product.price).toFixed(2)}
                          </p>
                        </div>
                        {/* Ok işareti */}
                        <span style={{
                          fontSize: '20px',
                          color: isActive ? '#667eea' : '#dee2e6',
                          transition: 'color 0.3s ease',
                          flexShrink: 0
                        }}>→</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        );
      })()}

      {/* Öne Çıkan Ürünler */}
      <section className="featured-section">
        <div className="featured-container">
          <h2 className="section-title">Öne Çıkan Ürünler</h2>

          <div className="products-grid">
            {featuredProducts.map(product => {
              const productImages = getProductImages(product);
              const hasImage = productImages.length > 0;

              return (
                <div
                  key={product.id}
                  className="product-card"
                  onClick={() => navigate(`/urun/${product.id}`)}
                >
                  {product.badge && (
                    <span className={`product-badge ${getBadgeClass(product.badge)}`}>
                      {product.badge}
                    </span>
                  )}

                  <div className="product-image">
                    {hasImage ? (
                      <img
                        src={productImages[0]}
                        alt={product.name}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          maxWidth: 'none',
                          maxHeight: 'none',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="product-placeholder"><div class="product-placeholder-icon">🧣</div></div>';
                        }}
                      />
                    ) : (
                      <div className="product-placeholder">
                        <div className="product-placeholder-icon">🧣</div>
                      </div>
                    )}
                  </div>

                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>

                    <div className="product-price-container">
                      <span className="product-price">₺{Number(product.price).toFixed(2)}</span>
                      {product.oldPrice && (
                        <span className="product-old-price">
                          ₺{Number(product.oldPrice).toFixed(2)}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addToCart(product);
                        alert('Ürün sepete eklendi!');
                      }}
                      className="add-to-cart-btn"
                    >
                      Sepete Ekle
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="view-all-container">
            <button
              onClick={() => navigate('/urunler')}
              className="view-all-btn"
            >
              Tüm Ürünleri Görüntüle →
            </button>
          </div>
        </div>
      </section>

      {/* Kampanya Banner */}
      <section className="campaign-banner">
        <div className="campaign-content">
          <h2 className="campaign-title">
            Özel Fırsatları Kaçırmayın!
          </h2>
          <p className="campaign-description">
            Yeni üyelere özel %10 indirim kodu:{' '}
            <span className="campaign-code">HOSGELDIN10</span>
          </p>
          <button
            onClick={() => navigate('/kayit')}
            className="campaign-button"
          >
            Hemen Üye Ol
          </button>
        </div>
      </section>
    </div>
    </>
  );
}

export default HomePage;
