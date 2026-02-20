import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../contexts/CartContext';
import './HomePage.css';

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
    }, 5000);

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
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return product.images.split(',').map(url => url.trim()).filter(url => url);
      }
    }

    return Array.isArray(product.images) ? product.images : [];
  };

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

      {/* Özellikler Bölümü */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-item">
            <div className="feature-icon">🚚</div>
            <h3 className="feature-title">Hızlı Kargo</h3>
            <p className="feature-description">2-3 iş günü içinde teslim</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">✨</div>
            <h3 className="feature-title">%100 İpek</h3>
            <p className="feature-description">Saf ipek garantisi</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">🎁</div>
            <h3 className="feature-title">Özel Paket</h3>
            <p className="feature-description">Hediye paketi seçeneği</p>
          </div>

          <div className="feature-item">
            <div className="feature-icon">💳</div>
            <h3 className="feature-title">Güvenli Ödeme</h3>
            <p className="feature-description">256 bit SSL güvenlik</p>
          </div>
        </div>
      </section>

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
