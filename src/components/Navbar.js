import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

function Navbar() {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/arama?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  return (
    <nav style={{
      backgroundColor: '#667eea',
      padding: '1rem',
      color: 'white',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        {/* Logo */}
        <Link to="/" style={{ 
          color: 'white', 
          textDecoration: 'none', 
          fontSize: '24px', 
          fontWeight: 'bold' 
        }}>
          İpek Aksesuar
        </Link>
        
        {/* Arama Kutusu - Ortada */}
        <div style={{ 
          flex: '1', 
          maxWidth: '500px',
          display: 'flex',
          justifyContent: 'center'
        }}>
          <form onSubmit={handleSearch} style={{ width: '100%' }}>
            <div style={{
              position: 'relative',
              width: '100%'
            }}>
              <input
                type="text"
                placeholder="Ürün ara... (örn: ipek eşarp, şal)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 45px 10px 15px',
                  borderRadius: '25px',
                  border: 'none',
                  fontSize: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  color: '#333',
                  outline: 'none',
                  transition: 'all 0.3s ease'
                }}
                onFocus={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255,255,255,0.3)';
                  setIsSearchOpen(true);
                }}
                onBlur={(e) => {
                  e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                  e.target.style.boxShadow = 'none';
                  setTimeout(() => setIsSearchOpen(false), 200);
                }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: '5px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: '#5569d0',
                  border: 'none',
                  borderRadius: '50%',
                  width: '35px',
                  height: '35px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'white',
                  fontSize: '18px',
                  transition: 'background 0.3s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#4558b8'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#5569d0'}
              >
                🔍
              </button>
            </div>
            
            {/* Arama Önerileri */}
            {isSearchOpen && searchQuery.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                maxWidth: '500px',
                backgroundColor: 'white',
                borderRadius: '10px',
                boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
                marginTop: '10px',
                padding: '10px',
                zIndex: 1001
              }}>
                <div style={{ color: '#666', fontSize: '12px', marginBottom: '10px' }}>
                  Hızlı Arama Önerileri:
                </div>
                <div 
                  onClick={() => {
                    setSearchQuery('İpek Eşarp');
                    handleSearch(new Event('submit'));
                  }}
                  style={{
                    padding: '8px',
                    color: '#333',
                    cursor: 'pointer',
                    borderRadius: '5px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  🔍 İpek Eşarp
                </div>
                <div 
                  onClick={() => {
                    setSearchQuery('Şal');
                    handleSearch(new Event('submit'));
                  }}
                  style={{
                    padding: '8px',
                    color: '#333',
                    cursor: 'pointer',
                    borderRadius: '5px',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  🔍 Şal
                </div>
              </div>
            )}
          </form>
        </div>
        
        {/* Sağ Menü */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          alignItems: 'center' 
        }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
            Ana Sayfa
          </Link>
          <Link to="/urunler" style={{ color: 'white', textDecoration: 'none' }}>
            Ürünler
          </Link>
          <Link to="/sepet" style={{ 
            color: 'white', 
            textDecoration: 'none',
            position: 'relative'
          }}>
            Sepet
            {itemCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-12px',
                backgroundColor: '#e74c3c',
                color: 'white',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                {itemCount}
              </span>
            )}
          </Link>
          
          {user ? (
            <>
              <Link to="/profil" style={{ color: 'white', textDecoration: 'none' }}>
                Profil
              </Link>
              
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
                  ⚙️ Admin
                </Link>
              )}
              
              <span style={{ color: 'white', fontSize: '14px' }}>
                👋 {user.name || user.email}
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
              <Link to="/giris" style={{ color: 'white', textDecoration: 'none' }}>
                Giriş
              </Link>
              <Link to="/kayit" style={{ color: 'white', textDecoration: 'none' }}>
                Kayıt
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;