// Checkout.js - React component for checkout page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { getShippingSettings } from '../config/siteSettings';
import './Checkout.css';

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cartItems, getTotalPrice } = useCart();
  
  // State management
  const [activeStep, setActiveStep] = useState(1); // 1: Address, 2: Payment
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Form data
  const [formData, setFormData] = useState({
    title: 'Ev',
    full_name: '',
    email: '',
    phone: '',
    city: '',
    district: '',
    neighborhood: '',
    address_line: '',
    postal_code: '',
    order_notes: '',
    save_address: false,
    is_default: false
  });

  // Fetch saved addresses if user is logged in
  useEffect(() => {
    if (user) {
      fetchSavedAddresses();
      // Pre-fill user info
      setFormData(prev => ({
        ...prev,
        full_name: `${user.name} ${user.surname}`,
        email: user.email,
        phone: user.phone || ''
      }));
    }
  }, [user]);

  // Kargo ücreti hesapla
  const getShippingFee = () => {
    const shippingSettings = getShippingSettings();

    // Kargo sistemi kapalıysa ücretsiz
    if (!shippingSettings.enabled) return 0;

    const subtotal = getTotalPrice();

    // Ücretsiz kargo limiti kontrolü
    return subtotal >= shippingSettings.freeShippingThreshold ? 0 : shippingSettings.fee;
  };

  const fetchSavedAddresses = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}/addresses`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const addresses = await response.json();
        setSavedAddresses(addresses);
        // Auto-select default address
        const defaultAddress = addresses.find(addr => addr.is_default);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!user && !formData.email) {
      newErrors.email = 'E-posta adresi zorunludur';
    } else if (!user && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Ad Soyad zorunludur';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Telefon numarası zorunludur';
    } else if (!/^(\+90|0)?[0-9]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz (5XX XXX XX XX)';
    }
    
    if (showNewAddressForm || !user || !selectedAddressId) {
      if (!formData.city) newErrors.city = 'Şehir seçimi zorunludur';
      if (!formData.district) newErrors.district = 'İlçe zorunludur';
      if (!formData.address_line) newErrors.address_line = 'Adres detayı zorunludur';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Format phone number as user types
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.startsWith('90')) value = value.substring(2);
    if (value.startsWith('0')) value = value.substring(1);
    
    // Format as 5XX XXX XX XX
    let formatted = '';
    if (value.length > 0) formatted = value.substring(0, 3);
    if (value.length > 3) formatted += ' ' + value.substring(3, 6);
    if (value.length > 6) formatted += ' ' + value.substring(6, 8);
    if (value.length > 8) formatted += ' ' + value.substring(8, 10);
    
    setFormData(prev => ({ ...prev, phone: formatted }));
  };

  // Save new address
  const saveAddress = async (addressData) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.id}/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: addressData.title,
          name: addressData.full_name,
          address: addressData.address_line,
          city: addressData.city,
          district: addressData.district,
          neighborhood: addressData.neighborhood,
          phone: addressData.phone,
          postal_code: addressData.postal_code,
          default: addressData.is_default
        })
      });

      if (response.ok) {
        const data = await response.json();
        await fetchSavedAddresses();
        setShowNewAddressForm(false);
        setSelectedAddressId(data.id);
        return true;
      }
    } catch (error) {
      console.error('Error saving address:', error);
    }
    return false;
  };

  // Handle address selection
  const handleAddressSelect = (addressId) => {
    setSelectedAddressId(addressId);
    setShowNewAddressForm(false);
    
    // Fill form with selected address data
    const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setFormData(prev => ({
        ...prev,
        full_name: selectedAddress.full_name,
        phone: selectedAddress.phone,
        city: selectedAddress.city,
        district: selectedAddress.district,
        neighborhood: selectedAddress.neighborhood,
        address_line: selectedAddress.address_line,
        postal_code: selectedAddress.postal_code
      }));
    }
  };

  // Continue to payment
  const handleContinueToPayment = async () => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // If user wants to save the address
      if (user && formData.save_address && showNewAddressForm) {
        const saved = await saveAddress({
          title: formData.title,
          full_name: formData.full_name,
          phone: formData.phone,
          city: formData.city,
          district: formData.district,
          neighborhood: formData.neighborhood,
          address_line: formData.address_line,
          postal_code: formData.postal_code,
          is_default: formData.is_default
        });
        
        if (!saved) {
          alert('Adres kaydedilemedi, ancak siparişe devam edebilirsiniz.');
        }
      }
      
      // For guest checkout, save to session
      if (!user) {
        const sessionId = localStorage.getItem('session_id') || generateSessionId();
        localStorage.setItem('session_id', sessionId);
        
        await fetch('/api/guest-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            session_id: sessionId,
            email: formData.email,
            full_name: formData.full_name,
            phone: formData.phone,
            city: formData.city,
            district: formData.district,
            neighborhood: formData.neighborhood,
            address_line: formData.address_line,
            postal_code: formData.postal_code,
            order_notes: formData.order_notes
          })
        });
      }
      
      // Move to payment step
      setActiveStep(2);
      
      // Store checkout data in sessionStorage for payment process
      sessionStorage.setItem('checkoutData', JSON.stringify({
        addressId: selectedAddressId,
        deliveryAddress: {
          full_name: formData.full_name,
          phone: formData.phone,
          city: formData.city,
          district: formData.district,
          neighborhood: formData.neighborhood,
          address_line: formData.address_line,
          postal_code: formData.postal_code
        },
        email: formData.email,
        order_notes: formData.order_notes
      }));
      
    } catch (error) {
      console.error('Error processing checkout:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  // Generate session ID for guest users
  const generateSessionId = () => {
    return 'guest_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  };

  // Handle payment (create order with mock payment)
  const handleProceedToPayment = async () => {
    setLoading(true);

    try {
      // Get checkout data from sessionStorage
      const checkoutData = JSON.parse(sessionStorage.getItem('checkoutData') || '{}');

      // Prepare order items
      const orderItems = cartItems.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }));

      // Create order payload
      const orderPayload = {
        items: orderItems,
        address: checkoutData.deliveryAddress,
        paymentMethod: 'mock',
        orderNotes: checkoutData.order_notes || formData.order_notes || null,
        discountCode: null // Discount code özelliği eklendiğinde buradan gönderilecek
      };

      // Send order to backend
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      if (response.ok) {
        const result = await response.json();

        // Clear cart from localStorage and state
        localStorage.removeItem('cart');

        // Clear checkout data
        sessionStorage.removeItem('checkoutData');

        // Navigate to success page with order info
        navigate('/siparis-basarili', {
          state: {
            orderNumber: result.order.orderNumber,
            orderId: result.order.id,
            totalPrice: result.order.totalPrice
          },
          replace: true // Prevent going back to checkout
        });
      } else {
        const error = await response.json();
        alert(`Sipariş oluşturulurken hata: ${error.error || 'Bilinmeyen hata'}`);
      }

    } catch (error) {
      console.error('Order creation error:', error);
      alert('Sipariş oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-container">
        <div className="empty-cart">
          <h2>Sepetiniz Boş</h2>
          <p>Ödeme yapabilmek için sepetinize ürün eklemeniz gerekmektedir.</p>
          <button onClick={() => navigate('/urunler')} className="continue-shopping-btn">
            Alışverişe Devam Et
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <h1>Ödeme</h1>
        <div className="checkout-steps">
          <div className={`step ${activeStep >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-title">Teslimat Bilgileri</span>
          </div>
          <div className={`step ${activeStep >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-title">Ödeme</span>
          </div>
        </div>
      </div>

      <div className="checkout-content">
        <div className="checkout-main">
          {activeStep === 1 && (
            <div className="delivery-section">
              <h2>Teslimat Bilgileri</h2>
              
              {/* Saved Addresses for Logged-in Users */}
              {user && savedAddresses.length > 0 && !showNewAddressForm && (
                <div className="saved-addresses">
                  <h3>Kayıtlı Adreslerim</h3>
                  <div className="address-list">
                    {savedAddresses.map(address => (
                      <div 
                        key={address.id}
                        className={`address-card ${selectedAddressId === address.id ? 'selected' : ''}`}
                        onClick={() => handleAddressSelect(address.id)}
                      >
                        <div className="address-header">
                          <input
                            type="radio"
                            name="address"
                            checked={selectedAddressId === address.id}
                            onChange={() => handleAddressSelect(address.id)}
                          />
                          <span className="address-title">{address.title}</span>
                          {address.is_default && <span className="default-badge">Varsayılan</span>}
                        </div>
                        <div className="address-details">
                          <p><strong>{address.full_name}</strong></p>
                          <p>{address.address_line}</p>
                          <p>{address.neighborhood} - {address.district}/{address.city}</p>
                          <p>Tel: {address.phone}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    className="add-new-address-btn"
                    onClick={() => setShowNewAddressForm(true)}
                  >
                    + Yeni Adres Ekle
                  </button>
                </div>
              )}

              {/* Address Form */}
              {(!user || showNewAddressForm || savedAddresses.length === 0) && (
                <div className="address-form">
                  {user && showNewAddressForm && (
                    <div className="form-header">
                      <h3>Yeni Adres Ekle</h3>
                      <button
                        className="cancel-btn"
                        onClick={() => setShowNewAddressForm(false)}
                      >
                        İptal
                      </button>
                    </div>
                  )}

                  {/* Contact Information Section */}
                  <div className="form-section">
                    <h4>İletişim Bilgileri</h4>

                    <div className="form-fields">
                      {!user && (
                        <div className="form-group">
                          <label>E-posta *</label>
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className={errors.email ? 'error' : ''}
                            placeholder="ornek@email.com"
                          />
                          {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>
                      )}

                      <div className="form-row">
                        <div className="form-group">
                          <label>Ad Soyad *</label>
                          <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleInputChange}
                            className={errors.full_name ? 'error' : ''}
                            placeholder="Adınız Soyadınız"
                          />
                          {errors.full_name && <span className="error-text">{errors.full_name}</span>}
                        </div>

                        <div className="form-group">
                          <label>Telefon *</label>
                          <div className="phone-input">
                            <span className="phone-prefix">+90</span>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={handlePhoneChange}
                              className={errors.phone ? 'error' : ''}
                              placeholder="5XX XXX XX XX"
                              maxLength="13"
                            />
                          </div>
                          {errors.phone && <span className="error-text">{errors.phone}</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Address Information Section */}
                  <div className="form-section">
                    <h4>Adres Bilgileri</h4>

                    <div className="form-fields">
                      {user && showNewAddressForm && (
                        <div className="form-group">
                          <label>Adres Başlığı *</label>
                          <select
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                          >
                            <option value="Ev">Ev</option>
                            <option value="İş">İş</option>
                            <option value="Diğer">Diğer</option>
                          </select>
                        </div>
                      )}

                      <div className="form-row">
                        <div className="form-group">
                          <label>Şehir *</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className={errors.city ? 'error' : ''}
                            placeholder="Şehir"
                          />
                          {errors.city && <span className="error-text">{errors.city}</span>}
                        </div>

                        <div className="form-group">
                          <label>İlçe *</label>
                          <input
                            type="text"
                            name="district"
                            value={formData.district}
                            onChange={handleInputChange}
                            className={errors.district ? 'error' : ''}
                            placeholder="İlçe"
                          />
                          {errors.district && <span className="error-text">{errors.district}</span>}
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Mahalle</label>
                          <input
                            type="text"
                            name="neighborhood"
                            value={formData.neighborhood}
                            onChange={handleInputChange}
                            placeholder="Mahalle"
                          />
                        </div>

                        <div className="form-group">
                          <label>Posta Kodu</label>
                          <input
                            type="text"
                            name="postal_code"
                            value={formData.postal_code}
                            onChange={handleInputChange}
                            placeholder="34000"
                            maxLength="5"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Açık Adres *</label>
                        <textarea
                          name="address_line"
                          value={formData.address_line}
                          onChange={handleInputChange}
                          className={errors.address_line ? 'error' : ''}
                          placeholder="Sokak, cadde, bina no, daire no vb."
                          rows="3"
                        />
                        {errors.address_line && <span className="error-text">{errors.address_line}</span>}
                      </div>

                      {user && showNewAddressForm && (
                        <div className="form-checkboxes">
                          <label className="checkbox-label">
                            <input
                              type="checkbox"
                              name="save_address"
                              checked={formData.save_address}
                              onChange={handleInputChange}
                            />
                            <span>Bu adresi kaydet</span>
                          </label>

                          {formData.save_address && (
                            <label className="checkbox-label">
                              <input
                                type="checkbox"
                                name="is_default"
                                checked={formData.is_default}
                                onChange={handleInputChange}
                              />
                              <span>Varsayılan adresim olarak ayarla</span>
                            </label>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Notes Section */}
                  <div className="form-section">
                    <h4>Sipariş Notu (Opsiyonel)</h4>
                    <div className="form-fields">
                      <div className="form-group">
                        <textarea
                          name="order_notes"
                          value={formData.order_notes}
                          onChange={handleInputChange}
                          placeholder="Siparişinizle ilgili eklemek istediğiniz notlar..."
                          rows="3"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="checkout-actions">
                <button 
                  className="back-btn"
                  onClick={() => navigate('/sepet')}
                >
                  Sepete Dön
                </button>
                <button 
                  className="continue-btn"
                  onClick={handleContinueToPayment}
                  disabled={loading}
                >
                  {loading ? 'İşleniyor...' : 'Ödemeye Devam Et'}
                </button>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="payment-section">
              <h2>Ödeme Bilgileri</h2>
              
              <div className="delivery-summary">
                <h3>Teslimat Adresi</h3>
                <div className="summary-content">
                  <p><strong>{formData.full_name}</strong></p>
                  <p>{formData.address_line}</p>
                  <p>{formData.neighborhood} - {formData.district}/{formData.city}</p>
                  <p>Tel: {formData.phone}</p>
                </div>
                <button 
                  className="edit-link"
                  onClick={() => setActiveStep(1)}
                >
                  Düzenle
                </button>
              </div>

              <div className="payment-notice">
                <div className="notice-icon">💳</div>
                <h3>Güvenli Ödeme</h3>
                <p>Ödeme işleminiz İyzico güvencesiyle gerçekleştirilecektir.</p>
                <p>Kart bilgileriniz güvenli bir şekilde işlenecektir.</p>
              </div>

              <div className="checkout-actions">
                <button
                  className="back-btn"
                  onClick={() => setActiveStep(1)}
                  disabled={loading}
                >
                  Geri
                </button>
                <button
                  className="payment-btn"
                  onClick={handleProceedToPayment}
                  disabled={loading}
                >
                  {loading ? 'Sipariş Oluşturuluyor...' : 'Ödemeye Geç'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="checkout-sidebar">
          <div className="order-summary">
            <h3>Sipariş Özeti</h3>
            
            <div className="cart-items-summary">
              {cartItems.map(item => {
                // Resim URL'sini al - Cart.js ile aynı mantık
                const getImageUrl = () => {
                  if (item.image) return item.image;
                  if (item.images) {
                    try {
                      const images = typeof item.images === 'string'
                        ? JSON.parse(item.images)
                        : item.images;
                      if (Array.isArray(images) && images.length > 0) {
                        return images[0];
                      }
                    } catch {
                      if (typeof item.images === 'string' && item.images.includes(',')) {
                        return item.images.split(',')[0].trim();
                      }
                    }
                  }
                  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect width="60" height="60" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="10"%3EResimsiz%3C/text%3E%3C/svg%3E';
                };

                const price = Number(item.price) || 0;

                return (
                  <div key={item.id} className="summary-item">
                    <img
                      src={getImageUrl()}
                      alt={item.name}
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect width="60" height="60" fill="%23f0f0f0"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%23999" font-size="10"%3EResimsiz%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <div className="item-details">
                      <p className="item-name">{item.name}</p>
                      <p className="item-quantity">Adet: {item.quantity}</p>
                    </div>
                    <p className="item-price">₺{(price * item.quantity).toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
            
            <div className="summary-totals">
              <div className="total-row">
                <span>Ara Toplam:</span>
                <span>₺{getTotalPrice().toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Kargo:</span>
                <span>
                  {getShippingFee() === 0 ? (
                    <span style={{ color: '#4caf50', fontWeight: 'bold' }}>Ücretsiz</span>
                  ) : (
                    `₺${getShippingFee().toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="total-row grand-total">
                <span>Toplam:</span>
                <span>₺{(getTotalPrice() + getShippingFee()).toFixed(2)}</span>
              </div>
            </div>

            <div className="security-badges">
              <div className="badge">
                <span className="icon">🔒</span>
                <span>256-bit SSL Güvenlik</span>
              </div>
              <div className="badge">
                <span className="icon">✓</span>
                <span>İyzico Güvencesi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;