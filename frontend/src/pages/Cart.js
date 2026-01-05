// Cart.js - Complete version with all features
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { getShippingSettings } from '../config/siteSettings';
import './Cart.css';

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Apply coupon function
  const applyCoupon = () => {
    setCouponError('');
    
    if (!couponCode.trim()) {
      setCouponError('Lütfen bir kupon kodu girin');
      return;
    }
    
    // Get coupons from localStorage
    const allCoupons = JSON.parse(localStorage.getItem('coupons') || '[]');
    const coupon = allCoupons.find(c => 
      c.code.toUpperCase() === couponCode.toUpperCase() && 
      c.isActive
    );
    
    if (!coupon) {
      setCouponError('Geçersiz kupon kodu');
      return;
    }
    
    // Check expiry date
    if (new Date(coupon.validUntil) < new Date()) {
      setCouponError('Bu kuponun süresi dolmuş');
      return;
    }
    
    // Check minimum purchase amount
    const totalPrice = getTotalPrice();
    if (coupon.minPurchase && totalPrice < coupon.minPurchase) {
      setCouponError(`Minimum alışveriş tutarı ${coupon.minPurchase} TL olmalıdır`);
      return;
    }
    
    // Check usage limit
    if (coupon.usageCount >= coupon.maxUsage) {
      setCouponError('Bu kupon kullanım limitine ulaşmış');
      return;
    }
    
    // Apply the coupon
    setAppliedCoupon(coupon);
    setCouponCode('');
    
    // Update usage count (in real app, this should be done on backend)
    const updatedCoupons = allCoupons.map(c => 
      c.code === coupon.code 
        ? { ...c, usageCount: c.usageCount + 1 }
        : c
    );
    localStorage.setItem('coupons', JSON.stringify(updatedCoupons));
  };

  // Remove applied coupon
  const removeCoupon = () => {
    if (appliedCoupon) {
      // Restore usage count
      const allCoupons = JSON.parse(localStorage.getItem('coupons') || '[]');
      const updatedCoupons = allCoupons.map(c => 
        c.code === appliedCoupon.code 
          ? { ...c, usageCount: Math.max(0, c.usageCount - 1) }
          : c
      );
      localStorage.setItem('coupons', JSON.stringify(updatedCoupons));
    }
    setAppliedCoupon(null);
    setCouponError('');
  };

  // Calculate discount amount
  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;

    const subtotal = getTotalPrice();
    // AdminPanel'de discountPercent olarak saklanıyor
    const discountPercent = Number(appliedCoupon.discountPercent) || 0;

    return (subtotal * discountPercent) / 100;
  };

  // Calculate shipping fee
  const getShippingFee = () => {
    const shippingSettings = getShippingSettings();

    // Kargo sistemi kapalıysa ücretsiz
    if (!shippingSettings.enabled) return 0;

    const subtotal = getTotalPrice();

    // Ücretsiz kargo limiti kontrolü
    return subtotal >= shippingSettings.freeShippingThreshold ? 0 : shippingSettings.fee;
  };

  // Calculate final total
  const getFinalTotal = () => {
    const subtotal = getTotalPrice();
    const discount = getDiscountAmount();
    const shipping = getShippingFee();
    return Math.max(0, subtotal - discount + shipping);
  };

  // Handle quantity change
  const handleQuantityChange = (productId, value) => {
    const quantity = parseInt(value);
    if (quantity >= 1) {
      updateQuantity(productId, quantity);
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    if (!user) {
      // Store the intended destination
      localStorage.setItem('redirectAfterLogin', '/checkout');
      navigate('/giris');
    } else {
      // Store coupon info if applied
      if (appliedCoupon) {
        sessionStorage.setItem('appliedCoupon', JSON.stringify(appliedCoupon));
      }
      navigate('/checkout');
    }
  };

  // Empty cart view
  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <div className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Sepetiniz Boş</h2>
          <p>Sepetinizde henüz ürün bulunmamaktadır.</p>
          <Link to="/urunler" className="continue-shopping-btn">
            Alışverişe Başla
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Sepetim ({cartItems.length} Ürün)</h1>
      
      <div className="cart-content">
        <div className="cart-items">
          <table className="cart-table">
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Fiyat</th>
                <th>Adet</th>
                <th>Toplam</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map(item => {
                const price = Number(item.price) || 0;
                const originalPrice = item.originalPrice ? Number(item.originalPrice) : null;

                // Resim URL'sini al - images array'inden veya image field'inden
                const getImageUrl = () => {
                  if (item.image) return item.image;
                  if (item.images) {
                    try {
                      // JSON string ise parse et
                      const images = typeof item.images === 'string'
                        ? JSON.parse(item.images)
                        : item.images;

                      // Array ise ilk elemanı al
                      if (Array.isArray(images) && images.length > 0) {
                        return images[0];
                      }
                    } catch {
                      // JSON parse hatası varsa virgülle ayır
                      if (typeof item.images === 'string' && item.images.includes(',')) {
                        return item.images.split(',')[0].trim();
                      }
                    }
                  }
                  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3EResimsiz%3C/text%3E%3C/svg%3E';
                };

                return (
                  <tr key={item.id} className="cart-item">
                    <td className="product-info">
                      <img
                        src={getImageUrl()}
                        alt={item.name}
                        className="product-image"
                        onClick={() => navigate(`/urun/${item.id}`)}
                        style={{ cursor: 'pointer' }}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3EResimsiz%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="product-details">
                        <Link to={`/urun/${item.id}`} className="product-name">
                          {item.name}
                        </Link>
                        {item.description && (
                          <p className="product-description">{item.description}</p>
                        )}
                        {item.selectedColor && (
                          <p className="product-variant">Renk: {item.selectedColor}</p>
                        )}
                      </div>
                    </td>
                    <td className="product-price">
                      {originalPrice && !isNaN(originalPrice) && originalPrice > price && (
                        <div>
                          <span className="original-price">₺{originalPrice.toFixed(2)}</span>
                          <br />
                        </div>
                      )}
                      <span className="current-price">₺{price.toFixed(2)}</span>
                    </td>
                    <td className="product-quantity">
                      <div className="quantity-controls">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="quantity-btn"
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                          min="1"
                          className="quantity-input"
                        />
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="quantity-btn"
                          disabled={item.stock && item.quantity >= item.stock}
                        >
                          +
                        </button>
                      </div>
                      {item.stock && item.stock <= 5 && (
                        <p className="stock-warning">Son {item.stock} adet!</p>
                      )}
                    </td>
                    <td className="product-total">₺{(price * item.quantity).toFixed(2)}</td>
                    <td className="product-remove">
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="remove-btn"
                        title="Ürünü Kaldır"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <div className="cart-actions">
            <Link to="/urunler" className="continue-shopping-link">
              ← Alışverişe Devam Et
            </Link>
            <button 
              onClick={clearCart} 
              className="clear-cart-btn"
            >
              Sepeti Temizle
            </button>
          </div>
        </div>

        <div className="cart-summary">
          <h2>Sipariş Özeti</h2>
          
          <div className="summary-row">
            <span>Ara Toplam:</span>
            <span>₺{getTotalPrice().toFixed(2)}</span>
          </div>
          
          {appliedCoupon && (
            <div className="summary-row discount">
              <span>
                İndirim ({appliedCoupon.code}):
                <button 
                  onClick={removeCoupon}
                  className="remove-coupon-btn"
                  title="Kuponu Kaldır"
                >
                  ✕
                </button>
              </span>
              <span className="discount-amount">-₺{getDiscountAmount().toFixed(2)}</span>
            </div>
          )}
          
          <div className="summary-row">
            <span>Kargo Ücreti:</span>
            <span>
              {getShippingFee() === 0 ? (
                <span className="free-shipping">Ücretsiz</span>
              ) : (
                `₺${getShippingFee().toFixed(2)}`
              )}
            </span>
          </div>
          
          {(() => {
            const shippingSettings = getShippingSettings();
            const totalPrice = getTotalPrice();
            const remaining = shippingSettings.freeShippingThreshold - totalPrice;

            return shippingSettings.enabled && remaining > 0 && (
              <div className="free-shipping-info">
                <small>₺{remaining.toFixed(2)} daha alışveriş yapın, kargo ücretsiz!</small>
              </div>
            );
          })()}
          
          <div className="promo-code">
            <input 
              type="text" 
              placeholder="İndirim kodu" 
              className="promo-input"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyCoupon()}
              disabled={appliedCoupon}
            />
            <button 
              className="apply-promo-btn"
              onClick={applyCoupon}
              disabled={appliedCoupon}
            >
              Uygula
            </button>
          </div>
          
          {couponError && (
            <div className="coupon-error">
              {couponError}
            </div>
          )}
          
          <div className="summary-total">
            <span>Genel Toplam:</span>
            <span className="total-price">₺{getFinalTotal().toFixed(2)}</span>
          </div>
          
          <button 
            onClick={handleCheckout} 
            className="checkout-btn"
          >
            {user ? 'Ödemeye Geç' : 'Giriş Yap ve Devam Et'}
          </button>
          
          {!user && (
            <div className="guest-checkout-option">
              <span>veya</span>
              <button 
                onClick={() => navigate('/checkout')}
                className="guest-checkout-link"
              >
                Üye olmadan devam et
              </button>
            </div>
          )}
          
          <div className="payment-methods">
            <span className="payment-badge">💳 Visa</span>
            <span className="payment-badge">💳 Mastercard</span>
            <span className="payment-badge">💰 İyzico</span>
          </div>
          
          <div className="security-note">
            <span className="lock-icon">🔒</span>
            <span>Tüm işlemleriniz SSL güvencesi altındadır</span>
          </div>
          
          <div className="cart-benefits">
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span>Güvenli Ödeme</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span>Hızlı Kargo</span>
            </div>
            <div className="benefit-item">
              <span className="benefit-icon">✓</span>
              <span>İade Garantisi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;