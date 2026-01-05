import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import './ProductList.css';

function ProductList() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
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
        setProducts([
          { id: 1, name: 'İpek Eşarp - Mavi', price: 299.90, description: 'Saf ipek eşarp', images: [], stock: 10 },
          { id: 2, name: 'İpek Eşarp - Kırmızı', price: 299.90, description: 'Saf ipek eşarp', images: [], stock: 5 },
          { id: 3, name: 'İpek Şal - Siyah', price: 499.90, description: 'Premium ipek şal', images: [], stock: 8 },
          { id: 4, name: 'İpek Kravat - Lacivert', price: 199.90, description: 'Erkek ipek kravat', images: [], stock: 15 },
          { id: 5, name: 'İpek Mendil Seti', price: 149.90, description: '4 adet ipek mendil', images: [], stock: 0 }
        ]);
      }
    } catch (error) {
      setProducts([
        { id: 1, name: 'İpek Eşarp - Mavi', price: 299.90, description: 'Saf ipek eşarp', images: [], stock: 10 },
        { id: 2, name: 'İpek Eşarp - Kırmızı', price: 299.90, description: 'Saf ipek eşarp', images: [], stock: 5 },
        { id: 3, name: 'İpek Şal - Siyah', price: 499.90, description: 'Premium ipek şal', images: [], stock: 8 },
        { id: 4, name: 'İpek Kravat - Lacivert', price: 199.90, description: 'Erkek ipek kravat', images: [], stock: 15 },
        { id: 5, name: 'İpek Mendil Seti', price: 149.90, description: '4 adet ipek mendil', images: [], stock: 0 }
      ]);
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

  return (
    <div className="product-list-container">
      <h1 className="product-list-title">Tüm Ürünler</h1>

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
                    className="view-product-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(product.id);
                    }}
                  >
                    Ürünü İncele
                  </button>
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
            Admin panelden yeni ürünler ekleyebilirsiniz.
          </p>
        </div>
      )}
    </div>
  );
}

export default ProductList;
