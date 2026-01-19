import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import './OrderSuccess.css';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();

  const orderData = location.state || {};
  const { orderNumber, orderId, totalPrice, subtotal, shippingFee, discountAmount, discountCode } = orderData;

  useEffect(() => {
    // Clear cart when component mounts
    clearCart();
  }, [clearCart]);

  // If no order data, redirect to home
  if (!orderNumber) {
    setTimeout(() => navigate('/'), 2000);
    return (
      <div className="order-success-container">
        <div className="order-success-card">
          <div className="error-icon">⚠️</div>
          <h2>Sipariş Bilgisi Bulunamadı</h2>
          <p>Ana sayfaya yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-success-container">
      <div className="order-success-card">
        <div className="success-icon">✓</div>

        <h1 className="success-title">Siparişiniz Alındı!</h1>

        <p className="success-message">
          Siparişiniz başarıyla oluşturuldu. Sipariş detaylarınız e-posta adresinize gönderilecektir.
        </p>

        <div className="order-details">
          <div className="detail-row">
            <span className="detail-label">Sipariş Numarası:</span>
            <span className="detail-value order-number">{orderNumber}</span>
          </div>

          {subtotal && (
            <div className="detail-row">
              <span className="detail-label">Ara Toplam:</span>
              <span className="detail-value">₺{Number(subtotal).toFixed(2)}</span>
            </div>
          )}

          {discountAmount > 0 && discountCode && (
            <div className="detail-row discount-row">
              <span className="detail-label">İndirim ({discountCode}):</span>
              <span className="detail-value discount">-₺{Number(discountAmount).toFixed(2)}</span>
            </div>
          )}

          {shippingFee !== undefined && (
            <div className="detail-row">
              <span className="detail-label">Kargo:</span>
              <span className="detail-value">
                {Number(shippingFee) === 0 ? 'Ücretsiz' : `₺${Number(shippingFee).toFixed(2)}`}
              </span>
            </div>
          )}

          <div className="detail-row total-row">
            <span className="detail-label">Toplam Tutar:</span>
            <span className="detail-value price">₺{Number(totalPrice).toFixed(2)}</span>
          </div>

          <div className="detail-row">
            <span className="detail-label">Ödeme Durumu:</span>
            <span className="detail-value status-success">✓ Başarılı</span>
          </div>
        </div>

        <div className="info-box">
          <div className="info-icon">ℹ️</div>
          <div className="info-content">
            <p><strong>Sipariş Takibi:</strong></p>
            <p>Siparişinizin durumunu "Profilim" sayfasından takip edebilirsiniz.</p>
          </div>
        </div>

        <div className="action-buttons">
          <button
            className="view-order-btn"
            onClick={() => navigate('/profil', { state: { tab: 'orders' } })}
          >
            Siparişimi Görüntüle
          </button>

          <button
            className="continue-shopping-btn"
            onClick={() => navigate('/urunler')}
          >
            Alışverişe Devam Et
          </button>
        </div>

        <div className="next-steps">
          <h3>Sonraki Adımlar</h3>
          <div className="steps-list">
            <div className="step-item">
              <span className="step-number">1</span>
              <div className="step-content">
                <strong>Sipariş Onayı</strong>
                <p>Siparişiniz hazırlanmaya başlandı</p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-number">2</span>
              <div className="step-content">
                <strong>Hazırlanıyor</strong>
                <p>Ürünleriniz paketleniyor</p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-number">3</span>
              <div className="step-content">
                <strong>Kargoya Verildi</strong>
                <p>Kargo takip numaranız tarafınıza iletilecek</p>
              </div>
            </div>
            <div className="step-item">
              <span className="step-number">4</span>
              <div className="step-content">
                <strong>Teslim Edildi</strong>
                <p>Siparişiniz adresinize ulaştı</p>
              </div>
            </div>
          </div>
        </div>

        <div className="contact-info">
          <p>
            Herhangi bir sorunuz olması durumunda bizimle iletişime geçebilirsiniz.
          </p>
          <p className="contact-detail">
            📧 <a href="mailto:destek@ipekaksesuar.com">destek@ipekaksesuar.com</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
