import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import './Navbar.css';

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

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    navigate(`/arama?q=${encodeURIComponent(suggestion)}`);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <img
            src="/logo.jpg"
            alt="MEBS İpek Aksesuar"
            className="navbar-logo-img"
          />
        </Link>

        {/* Search Section */}
        <div className="navbar-search">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Ürün ara... (örn: ipek eşarp, şal)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
              className="search-input"
            />
            <button type="submit" className="search-button">
              🔍
            </button>

            {/* Search Suggestions */}
            {isSearchOpen && searchQuery.length > 0 && (
              <div className="search-suggestions">
                <div className="suggestions-title">
                  Hızlı Arama Önerileri:
                </div>
                <div
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick('İpek Eşarp')}
                >
                  🔍 İpek Eşarp
                </div>
                <div
                  className="suggestion-item"
                  onClick={() => handleSuggestionClick('Şal')}
                >
                  🔍 Şal
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Navigation Menu */}
        <div className="navbar-menu">
          <Link to="/" className="nav-link">
            Ana Sayfa
          </Link>
          <Link to="/urunler" className="nav-link">
            Ürünler
          </Link>
          <Link to="/sepet" className="nav-link cart-link">
            Sepet
            {itemCount > 0 && (
              <span className="cart-badge">
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link to="/profil" className="nav-link">
                Profil
              </Link>

              {user.role === 'admin' && (
                <Link to="/admin" className="nav-link admin-link">
                  ⚙️ Admin
                </Link>
              )}

              <span className="user-greeting">
                👋 {user.name || user.email}
              </span>

              <button onClick={logout} className="logout-button">
                Çıkış
              </button>
            </>
          ) : (
            <div className="auth-links">
              <Link to="/giris" className="nav-link">
                Giriş
              </Link>
              <Link to="/kayit" className="nav-link">
                Kayıt
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
