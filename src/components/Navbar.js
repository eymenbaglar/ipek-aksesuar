import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav style={{
      backgroundColor: '#667eea',
      padding: '1rem',
      color: 'white'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '24px', fontWeight: 'bold' }}>
          İpek Aksesuar
        </Link>
        
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>Ana Sayfa</Link>
          <Link to="/urunler" style={{ color: 'white', textDecoration: 'none' }}>Ürünler</Link>
          <Link to="/sepet" style={{ color: 'white', textDecoration: 'none' }}>
            Sepet ({itemCount})
          </Link>
          
          {user ? (
            <>
              <Link to="/profil" style={{ color: 'white', textDecoration: 'none' }}>Profil</Link>
              
              {user.role === 'admin' && (
                <Link 
                  to="/admin" 
                  style={{ 
                    color: 'white', 
                    textDecoration: 'none',
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    padding: '5px 10px',
                    borderRadius: '5px'
                  }}
                >
                  ⚙️ Admin Panel
                </Link>
              )}
              
              <span style={{ color: 'white', fontSize: '14px' }}>
                Merhaba, {user.name || user.email}
              </span>
              
              <button onClick={logout} style={{ 
                background: 'none', 
                border: '1px solid white',
                color: 'white',
                padding: '5px 10px',
                borderRadius: '5px',
                cursor: 'pointer'
              }}>
                Çıkış
              </button>
            </>
          ) : (
            <>
              <Link to="/giris" style={{ color: 'white', textDecoration: 'none' }}>Giriş</Link>
              <Link to="/kayit" style={{ color: 'white', textDecoration: 'none' }}>Kayıt</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;