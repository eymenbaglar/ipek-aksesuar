import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!user) {
      alert('Ödeme için giriş yapmalısınız');
      navigate('/giris');
    } else {
      navigate('/odeme');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Sepetiniz Boş</h2>
        <p>Henüz sepetinize ürün eklemediniz.</p>
        <Link to="/urunler" style={{
          display: 'inline-block',
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#667eea',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px'
        }}>
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '20px' }}>
      <h2>Sepetim</h2>
      
      {cartItems.map(item => (
        <div key={item.id} style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '15px',
          border: '1px solid #ddd',
          borderRadius: '5px',
          marginBottom: '10px'
        }}>
          <div>
            <h4>{item.name}</h4>
            <p>{item.price} TL</p>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button 
              onClick={() => updateQuantity(item.id, item.quantity - 1)}
              style={{
                width: '30px',
                height: '30px',
                border: '1px solid #ddd',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              -
            </button>
            <span>{item.quantity}</span>
            <button 
              onClick={() => updateQuantity(item.id, item.quantity + 1)}
              style={{
                width: '30px',
                height: '30px',
                border: '1px solid #ddd',
                background: 'white',
                cursor: 'pointer'
              }}
            >
              +
            </button>
            
            <button
              onClick={() => removeFromCart(item.id)}
              style={{
                marginLeft: '20px',
                padding: '5px 10px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Kaldır
            </button>
          </div>
          
          <div>
            <strong>{(item.price * item.quantity).toFixed(2)} TL</strong>
          </div>
        </div>
      ))}
      
      <div style={{
        marginTop: '30px',
        padding: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '5px'
      }}>
        <h3>Sipariş Özeti</h3>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
          <span>Toplam:</span>
          <strong style={{ fontSize: '24px', color: '#667eea' }}>
            {getTotalPrice().toFixed(2)} TL
          </strong>
        </div>
        
        <button
          onClick={handleCheckout}
          style={{
            width: '100%',
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '18px',
            cursor: 'pointer'
          }}
        >
          Ödemeye Geç
        </button>
        
        <button
          onClick={clearCart}
          style={{
            width: '100%',
            marginTop: '10px',
            padding: '10px',
            backgroundColor: 'transparent',
            color: '#e74c3c',
            border: '1px solid #e74c3c',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Sepeti Temizle
        </button>
      </div>
    </div>
  );
}

export default Cart;