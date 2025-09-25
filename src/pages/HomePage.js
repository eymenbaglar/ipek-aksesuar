import React from 'react';
import { useCart } from '../contexts/CartContext';

function HomePage() {
  const { addToCart } = useCart();
  
  const products = [
    { id: 1, name: 'İpek Eşarp', price: 299.90 },
    { id: 2, name: 'İpek Şal', price: 499.90 },
    { id: 3, name: 'İpek Kravat', price: 199.90 }
  ];

  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ textAlign: 'center', color: '#667eea' }}>
        İpek Aksesuar'a Hoş Geldiniz
      </h1>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginTop: '40px'
      }}>
        {products.map(product => (
          <div key={product.id} style={{
            border: '1px solid #ddd',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center'
          }}>
            <h3>{product.name}</h3>
            <p style={{ fontSize: '20px', color: '#667eea' }}>
              {product.price} TL
            </p>
            <button
              onClick={() => addToCart(product)}
              style={{
                backgroundColor: '#667eea',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
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

export default HomePage;