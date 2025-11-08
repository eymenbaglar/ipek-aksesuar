import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const applyCoupon = () => {
    setCouponError('');
    
    if (!couponCode.trim()) {
      setCouponError('Lütfen bir kupon kodu girin');
      return;
    }
    
    // LocalStorage'dan kuponları al
    const allCoupons = JSON.parse(localStorage.getItem('coupons') || '[]');
    const coupon = allCoupons.find(c => 
      c.code.toUpperCase() === couponCode.toUpperCase() && 
      c.isActive
    );
    
    if (!coupon) {
      setCouponError('Geçersiz kupon kodu');
      return;
    }
    
    // Geçerlilik tarihi kontrolü
    if (new Date(coupon.validUntil) < new Date()) {
      setCouponError('Bu kuponun süresi dolmuş');
      return;
    }
    
    // Minimum tutar kontrolü
    const totalPrice = getTotalPrice();
    if (coupon.minPurchase && totalPrice < coupon.minPurchase) {
      setCouponError(`Minimum alışveriş tutarı ${coupon.minPurchase} TL olmalıdır`);
      return;
    }
    
    // Kullanım limiti kontrolü
    if (coupon.usageCount >= coupon.maxUsage) {
      setCouponError('Bu kupon kullanım limitine ulaşmış');
      return;
    }
    
    // Kişiye özel kupon kontrolü
    if (coupon.targetUser && user?.email !== coupon.targetUser) {
      setCouponError('Bu kupon size ait değil');
      return;
    }
    
    // Kullanıcı daha önce bu kuponu kullanmış mı?
    if (user && coupon.usedBy && coupon.usedBy.includes(user.email)) {
      setCouponError('Bu kuponu daha önce kullandınız');
      return;
    }
    
    // Kuponu uygula
    setAppliedCoupon(coupon);
    setCouponError('');
    alert(`Kupon uygulandı! %${coupon.discountPercent} indirim`);
  };
  
  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
  };
  
  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    return (getTotalPrice() * appliedCoupon.discountPercent) / 100;
  };
  
  const getFinalPrice = () => {
    return getTotalPrice() - calculateDiscount();
  };

  const handleCheckout = () => {
    if (!user) {
      alert('Ödeme için giriş yapmalısınız');
      navigate('/giris');
      return;
    }
    
    // Kupon kullanım sayısını güncelle
    if (appliedCoupon) {
      const allCoupons = JSON.parse(localStorage.getItem('coupons') || '[]');
      const updatedCoupons = allCoupons.map(c => {
        if (c.id === appliedCoupon.id) {
          return {
            ...c,
            usageCount: (c.usageCount || 0) + 1,
            usedBy: [...(c.usedBy || []), user.email]
          };
        }
        return c;
      });
      localStorage.setItem('coupons', JSON.stringify(updatedCoupons));
    }
    
    // Sipariş bilgilerini kaydet
    const order = {
      items: cartItems,
      subtotal: getTotalPrice(),
      discount: calculateDiscount(),
      couponUsed: appliedCoupon?.code,
      total: getFinalPrice(),
      date: new Date().toISOString()
    };
    
    // Kullanıcının son alışveriş tarihini güncelle (localStorage'da simüle)
    if (user) {
      const userActivity = JSON.parse(localStorage.getItem('userActivity') || '{}');
      userActivity[user.email] = {
        lastPurchase: new Date().toISOString(),
        totalPurchases: (userActivity[user.email]?.totalPurchases || 0) + 1
      };
      localStorage.setItem('userActivity', JSON.stringify(userActivity));
    }
    
    navigate('/odeme');
  };

  if (cartItems.length === 0) {
    return (
      <div style={{ 
        minHeight: '400px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '40px'
      }}>
        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🛒</div>
        <h2 style={{ color: '#2c3e50', marginBottom: '20px' }}>Sepetiniz Boş</h2>
        <p style={{ color: '#6c757d', marginBottom: '30px' }}>
          Henüz sepetinize ürün eklemediniz
        </p>
        <Link to="/urunler" style={{
          padding: '12px 30px',
          backgroundColor: '#667eea',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          Alışverişe Başla
        </Link>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '40px 20px', 
      backgroundColor: '#f8f9fa',
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '30px', color: '#2c3e50' }}>Sepetim</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          {/* Sol - Ürünler */}
          <div>
            {cartItems.map(item => (
              <div key={item.id} style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '10px',
                marginBottom: '15px',
                display: 'flex',
                gap: '20px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}>
                <div style={{
                  width: '100px',
                  height: '100px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {item.images && item.images[0] ? (
                    <img 
                      src={item.images[0]} 
                      alt={item.name}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '8px'
                      }}
                    />
                  ) : (
                    <span style={{ fontSize: '32px' }}>🧣</span>
                  )}
                </div>
                
                <div style={{ flex: 1 }}>
                  <h3 style={{ marginBottom: '10px', color: '#2c3e50' }}>{item.name}</h3>
                  <p style={{ color: '#6c757d', fontSize: '14px' }}>
                    {item.description || 'Premium ipek ürün'}
                  </p>
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#667eea' }}>
                    {item.price} TL
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      style={{
                        width: '30px',
                        height: '30px',
                        border: '1px solid #ddd',
                        background: 'white',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: '30px', textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      style={{
                        width: '30px',
                        height: '30px',
                        border: '1px solid #ddd',
                        background: 'white',
                        borderRadius: '5px',
                        cursor: 'pointer'
                      }}
                    >
                      +
                    </button>
                  </div>
                  
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    color: '#2c3e50'
                  }}>
                    {(item.price * item.quantity).toFixed(2)} TL
                  </div>
                  
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      padding: '5px 10px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Kaldır
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Sağ - Sipariş Özeti */}
          <div style={{
            backgroundColor: 'white',
            padding: '25px',
            borderRadius: '10px',
            height: 'fit-content',
            position: 'sticky',
            top: '20px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          }}>
            <h2 style={{ marginBottom: '25px', color: '#2c3e50' }}>
              Sipariş Özeti
            </h2>
            
            {/* Kupon Kodu */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ 
                display: 'block', 
                marginBottom: '10px',
                fontWeight: 'bold',
                color: '#495057'
              }}>
                İndirim Kuponu
              </label>
              
              {!appliedCoupon ? (
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    placeholder="Kupon kodunu girin"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: '1px solid #ddd',
                      borderRadius: '5px'
                    }}
                  />
                  <button
                    onClick={applyCoupon}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#28a745',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Uygula
                  </button>
                </div>
              ) : (
                <div style={{
                  padding: '10px',
                  backgroundColor: '#d4edda',
                  borderRadius: '5px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <strong style={{ color: '#155724' }}>{appliedCoupon.code}</strong>
                    <div style={{ fontSize: '12px', color: '#155724' }}>
                      %{appliedCoupon.discountPercent} indirim uygulandı
                    </div>
                  </div>
                  <button
                    onClick={removeCoupon}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#dc3545',
                      cursor: 'pointer',
                      fontSize: '18px'
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
              
              {couponError && (
                <div style={{
                  marginTop: '10px',
                  padding: '8px',
                  backgroundColor: '#f8d7da',
                  color: '#721c24',
                  borderRadius: '5px',
                  fontSize: '14px'
                }}>
                  {couponError}
                </div>
              )}
              
              {/* Örnek Kuponlar */}
              {!appliedCoupon && !user && (
                <div style={{
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: '#fff3cd',
                  borderRadius: '5px',
                  fontSize: '12px'
                }}>
                  💡 İpucu: Giriş yaparak kişiye özel kuponlarınızı kullanabilirsiniz
                </div>
              )}
            </div>
            
            {/* Fiyat Detayları */}
            <div style={{ borderTop: '1px solid #dee2e6', paddingTop: '20px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '10px'
              }}>
                <span>Ara Toplam:</span>
                <span>{getTotalPrice().toFixed(2)} TL</span>
              </div>
              
              {appliedCoupon && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                  color: '#28a745'
                }}>
                  <span>İndirim (%{appliedCoupon.discountPercent}):</span>
                  <span>-{calculateDiscount().toFixed(2)} TL</span>
                </div>
              )}
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                marginBottom: '10px'
              }}>
                <span>Kargo:</span>
                <span style={{ color: '#28a745' }}>Ücretsiz</span>
              </div>
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#2c3e50',
                paddingTop: '10px',
                borderTop: '2px solid #dee2e6'
              }}>
                <span>Toplam:</span>
                <span style={{ color: '#667eea' }}>
                  {getFinalPrice().toFixed(2)} TL
                </span>
              </div>
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
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#5569d0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#667eea'}
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
                color: '#dc3545',
                border: '1px solid #dc3545',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Sepeti Temizle
            </button>
            
            <Link 
              to="/urunler"
              style={{
                display: 'block',
                textAlign: 'center',
                marginTop: '15px',
                color: '#667eea',
                textDecoration: 'none',
                fontSize: '14px'
              }}
            >
              ← Alışverişe Devam Et
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;