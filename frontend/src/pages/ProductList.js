import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../contexts/CartContext';
import './ProductList.css';

function ProductList() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchProducts();
    loadFavorites();
  }, [selectedCategory, sortBy, debouncedSearchQuery]);

  const loadFavorites = () => {
    const savedFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(savedFavorites);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Build query string
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (sortBy !== 'newest') params.append('sortBy', sortBy);
      if (debouncedSearchQuery.trim()) params.append('search', debouncedSearchQuery.trim());

      const response = await fetch(`http://localhost:5000/api/products?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Products fetch error:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const isFavorite = (productId) => {
    return favorites.some(fav => fav.id === productId);
  };

  const toggleFavorite = (product, e) => {
    e.stopPropagation();

    const currentFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');

    if (isFavorite(product.id)) {
      const newFavorites = currentFavorites.filter(fav => fav.id !== product.id);
      localStorage.setItem('favorites', JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } else {
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

  const handleAddToCart = (product, e) => {
    e.stopPropagation();

    if (product.stock <= 0) {
      alert('Bu ürün stokta yok!');
      return;
    }

    addToCart(product);

    // Görsel feedback
    const button = e.target;
    const originalText = button.textContent;
    button.textContent = '✓ Eklendi';
    button.style.backgroundColor = '#28a745';

    setTimeout(() => {
      button.textContent = originalText;
      button.style.backgroundColor = '';
    }, 1500);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">⏳</div>
        <p className="loading-text">Ürünler yükleniyor...</p>
      </div>
    );
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Ana Sayfa', item: 'https://ipekaksesuar.com' },
      { '@type': 'ListItem', position: 2, name: 'Ürünler', item: 'https://ipekaksesuar.com/urunler' }
    ]
  };

  return (
    <>
    <Helmet>
      <title>Tüm Ürünler | İpek Aksesuar</title>
      <meta name="description" content="İpek Aksesuar'ın tüm ürünlerini keşfedin. El işçiliği ile üretilmiş premium kalite ipek eşarplar, şallar ve aksesuarlar." />
      <link rel="canonical" href="https://ipekaksesuar.com/urunler" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Tüm Ürünler | İpek Aksesuar" />
      <meta property="og:description" content="İpek Aksesuar'ın tüm ürünlerini keşfedin. El işçiliği ile üretilmiş premium kalite ipek eşarplar, şallar ve aksesuarlar." />
      <meta property="og:url" content="https://ipekaksesuar.com/urunler" />
      <meta property="og:site_name" content="İpek Aksesuar" />
      <meta property="og:locale" content="tr_TR" />
      <script type="application/ld+json">{JSON.stringify(breadcrumbSchema)}</script>
    </Helmet>
    <div className="product-list-container">
      <h1 className="product-list-title">Tüm Ürünler</h1>

      {/* Filtreleme ve Arama */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '15px',
        marginBottom: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        alignItems: 'center'
      }}>
        {/* Arama Kutusu */}
        <div style={{ flex: '1 1 300px' }}>
          <input
            type="text"
            placeholder="Ürün ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '95%',
              padding: '10px 15px',
              borderRadius: '5px',
              border: '1px solid #dee2e6',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Kategori Filtresi */}
        <div>
          <label style={{ marginRight: '10px', color: '#495057', fontWeight: '500' }}>Kategori:</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '10px 15px',
              borderRadius: '5px',
              border: '1px solid #dee2e6',
              fontSize: '14px',
              cursor: 'pointer',
              backgroundColor: 'white'
            }}
          >
            <option value="all">Tümü</option>
            <option value="Eşarp">Eşarp</option>
            <option value="Şal">Şal</option>
            <option value="Fular">Fular</option>
          </select>
        </div>

        {/* Sıralama */}
        <div>
          <label style={{ marginRight: '10px', color: '#495057', fontWeight: '500' }}>Sırala:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '10px 15px',
              borderRadius: '5px',
              border: '1px solid #dee2e6',
              fontSize: '14px',
              cursor: 'pointer',
              backgroundColor: 'white'
            }}
          >
            <option value="newest">En Yeni</option>
            <option value="name">İsme Göre (A-Z)</option>
            <option value="price-asc">Fiyat (Düşükten Yükseğe)</option>
            <option value="price-desc">Fiyat (Yüksekten Düşüğe)</option>
          </select>
        </div>

        {/* Temizle Butonu */}
        {(selectedCategory !== 'all' || sortBy !== 'newest' || debouncedSearchQuery.trim()) && (
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSortBy('newest');
              setSearchQuery('');
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Filtreleri Temizle
          </button>
        )}
      </div>

      {/* Sonuç Sayısı */}
      <p style={{ marginBottom: '20px', color: '#6c757d' }}>
        {products.length} ürün bulundu
      </p>

      <div className="products-container">
        {products.map(product => {
          const productImages = getProductImages(product);
          const hasImage = productImages.length > 0;

          return (
            <div
              key={product.id}
              className="product-list-card"
              onClick={() => handleProductClick(product.id)}
            >
              {/* Favori Butonu */}
              <button
                onClick={(e) => toggleFavorite(product, e)}
                className={`favorite-button ${isFavorite(product.id) ? 'active' : ''}`}
                title={isFavorite(product.id) ? 'Favorilerden Kaldır' : 'Favorilere Ekle'}
              >
                {isFavorite(product.id) ? '❤️' : '🤍'}
              </button>

              {/* Ürün Görseli */}
              <div className="product-image-container">
                {hasImage ? (
                  <img
                    src={productImages[0]}
                    alt={product.name}
                    loading="lazy"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = '<div class="product-placeholder"><div class="product-placeholder-icon">🧣</div><span class="product-placeholder-text">Ürün Görseli</span></div>';
                    }}
                  />
                ) : (
                  <div className="product-placeholder">
                    <div className="product-placeholder-icon">🧣</div>
                    <span className="product-placeholder-text">Ürün Görseli</span>
                  </div>
                )}

                {/* Hızlı İncele Overlay */}
                <div className="quick-view-overlay">
                  Hızlı İncele →
                </div>
              </div>

              {/* Ürün Bilgileri */}
              <div className="product-details">
                <h3 className="product-title">
                  {product.name}
                </h3>

                <p className="product-description">
                  {product.description}
                </p>

                <div className="product-meta">
                  <span className="product-price">
                    ₺{Number(product.price).toFixed(2)}
                  </span>

                  {product.stock > 0 ? (
                    <span className="product-stock in-stock">
                      ✓ Stokta
                    </span>
                  ) : (
                    <span className="product-stock out-of-stock">
                      ✗ Tükendi
                    </span>
                  )}
                </div>

                {/* Butonlar */}
                <div className="product-actions">
                  <button
                    className="add-to-cart-button"
                    onClick={(e) => handleAddToCart(product, e)}
                    disabled={product.stock <= 0}
                  >
                    {product.stock > 0 ? '🛒 Sepete Ekle' : 'Stokta Yok'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Boş durum */}
      {products.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h2 className="empty-title">
            Henüz ürün eklenmemiş
          </h2>
          <p className="empty-description">
            Diğer ürünlerimize göz atabilirsiniz!
          </p>
        </div>
      )}
    </div>
    </>
  );
}

export default ProductList;
