import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';

function ProductList() {
  const { addToCart } = useCart();
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

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Yükleniyor...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#667eea' }}>Tüm Ürünler</h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '20px',
        marginTop: '30px'
      }}>
        {products.map(product => (
          <div key={product.id} style={{
            border: '1px solid #ddd',
            borderRadius: '10px',
            padding: '20px',
            textAlign: 'center',
            backgroundColor: 'white',
            boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              width: '100%',
              height: '200px',
              backgroundColor: '#f0f0f0',
              borderRadius: '5px',
              marginBottom: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ color: '#999' }}>Ürün Görseli</span>
            </div>
            
            <h3>{product.name}</h3>
            <p style={{ color: '#666', fontSize: '14px' }}>{product.description}</p>
            <p style={{ fontSize: '24px', color: '#667eea', fontWeight: 'bold' }}>
              {product.price} TL
            </p>
            
            <button
              onClick={() => {
                addToCart(product);
                alert(`${product.name} sepete eklendi!`);
              }}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Sepete Ekle
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;