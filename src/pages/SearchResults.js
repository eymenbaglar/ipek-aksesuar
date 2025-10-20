import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function SearchResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q') || '';
  
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('relevance');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterAndSortProducts();
  }, [query, products, sortBy, priceRange]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        // Backend çalışmıyorsa örnek ürünler
        setProducts([
          { id: 1, name: 'İpek Eşarp - Mavi', price: 299.90, description: 'Saf ipek eşarp', category: 'eşarp' },
          { id: 2, name: 'İpek Eşarp - Kırmızı', price: 299.90, description: 'Saf ipek eşarp', category: 'eşarp' },
          { id: 3, name: 'İpek Şal - Siyah', price: 499.90, description: 'Premium ipek şal', category: 'şal' },
          { id: 4, name: 'İpek Kravat - Lacivert', price: 199.90, description: 'Erkek ipek kravat', category: 'kravat' },
          { id: 5, name: 'İpek Mendil Seti', price: 149.90, description: '4 adet ipek mendil', category: 'mendil' },
          { id: 6, name: 'İpek Eşarp - Yeşil', price: 299.90, description: 'Saf ipek eşarp', category: 'eşarp' },
          { id: 7, name: 'İpek Şal - Bordo', price: 549.90, description: 'Lüks ipek şal', category: 'şal' },
          { id: 8, name: 'İpek Fular', price: 179.90, description: 'İnce ipek fular', category: 'fular' }
        ]);
      }
    } catch (error) {
      console.error('Ürünler yüklenemedi:', error);
      // Hata durumunda da örnek ürünler
      setProducts([
        { id: 1, name: 'İpek Eşarp - Mavi', price: 299.90, description: 'Saf ipek eşarp' },
        { id: 2, name: 'İpek Eşarp - Kırmızı', price: 299.90, description: 'Saf ipek eşarp' },
        { id: 3, name: 'İpek Şal - Siyah', price: 499.90, description: 'Premium ipek şal' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = products.filter(product => {
      const searchLower = query.toLowerCase();
      const nameMatch = product.name.toLowerCase().includes(searchLower);
      const descMatch = product.description?.toLowerCase().includes(searchLower);
      const categoryMatch = product.category?.toLowerCase().includes(searchLower);
      const priceMatch = product.price >= priceRange.min && product.price <= priceRange.max;
      
      return (nameMatch || descMatch || categoryMatch) && priceMatch;
    });

    // Sıralama
    switch (sortBy) {
      case 'price-asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // relevance
        // Tam eşleşmeleri önce göster
        filtered.sort((a, b) => {
          const aExact = a.name.toLowerCase() === query.toLowerCase();
          const bExact = b.name.toLowerCase() === query.toLowerCase();
          if (aExact && !bExact) return -1;
          if (!aExact && bExact) return 1;
          return 0;
        });
    }

    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <h2>Aranıyor...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', minHeight: '80vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Başlık ve Arama Bilgisi */}
        <div style={{ 
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '10px'
        }}>
          <h1 style={{ color: '#2c3e50', marginBottom: '10px' }}>
            Arama Sonuçları
          </h1>
          <p style={{ color: '#6c757d', fontSize: '18px' }}>
            "<strong style={{ color: '#667eea' }}>{query}</strong>" için {filteredProducts.length} ürün bulundu
          </p>
        </div>

        {/* Filtreler ve Sıralama */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginBottom: '30px',
          flexWrap: 'wrap',
          alignItems: 'center'
        }}>
          {/* Sıralama */}
          <div>
            <label style={{ marginRight: '10px', color: '#495057' }}>Sırala:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '8px 15px',
                borderRadius: '5px',
                border: '1px solid #dee2e6',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              <option value="relevance">İlgili</option>
              <option value="name">İsme Göre (A-Z)</option>
              <option value="price-asc">Fiyat (Düşükten Yükseğe)</option>
              <option value="price-desc">Fiyat (Yüksekten Düşüğe)</option>
            </select>
          </div>

          {/* Fiyat Aralığı */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ color: '#495057' }}>Fiyat Aralığı:</label>
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange({ ...priceRange, min: parseInt(e.target.value) || 0 })}
              style={{
                width: '80px',
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #dee2e6',
                fontSize: '14px'
              }}
            />
            <span>-</span>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) || 1000 })}
              style={{
                width: '80px',
                padding: '8px',
                borderRadius: '5px',
                border: '1px solid #dee2e6',
                fontSize: '14px'
              }}
            />
            <span>TL</span>
          </div>

          {/* Temizle Butonu */}
          <button
            onClick={() => {
              setSortBy('relevance');
              setPriceRange({ min: 0, max: 1000 });
            }}
            style={{
              padding: '8px 20px',
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
        </div>

        {/* Ürün Listesi */}
        {filteredProducts.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
            gap: '20px'
          }}>
            {filteredProducts.map(product => (
              <div
                key={product.id}
                style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/urun/${product.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
                }}
              >
                {/* Ürün Görseli */}
                <div style={{
                  height: '200px',
                  backgroundColor: '#f8f9fa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '48px' }}>🧣</span>
                </div>

                {/* Ürün Bilgileri */}
                <div style={{ padding: '15px' }}>
                  <h3 style={{
                    fontSize: '16px',
                    marginBottom: '10px',
                    color: '#2c3e50',
                    height: '40px',
                    overflow: 'hidden'
                  }}>
                    {product.name}
                  </h3>
                  
                  <p style={{
                    fontSize: '14px',
                    color: '#6c757d',
                    marginBottom: '10px',
                    height: '40px',
                    overflow: 'hidden'
                  }}>
                    {product.description}
                  </p>
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#667eea'
                    }}>
                      {product.price} TL
                    </span>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/urun/${product.id}`);
                      }}
                      style={{
                        padding: '5px 15px',
                        backgroundColor: '#667eea',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      İncele
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '10px'
          }}>
            <h2 style={{ color: '#6c757d', marginBottom: '20px' }}>
              Aramanızla eşleşen ürün bulunamadı
            </h2>
            <p style={{ color: '#6c757d', marginBottom: '30px' }}>
              Farklı kelimelerle aramayı deneyebilirsiniz
            </p>
            <button
              onClick={() => navigate('/urunler')}
              style={{
                padding: '12px 30px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Tüm Ürünleri Görüntüle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResults;