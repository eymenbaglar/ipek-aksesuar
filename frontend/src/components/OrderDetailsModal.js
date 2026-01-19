import React, { useState, useEffect, useCallback } from 'react';
import './OrderDetailsModal.css';
import RefundRequestModal from './RefundRequestModal';

function OrderDetailsModal({ orderId, onClose }) {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRefundModal, setShowRefundModal] = useState(false);

  const fetchOrderDetails = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
      } else {
        alert('Sipariş detayları yüklenemedi');
        onClose();
      }
    } catch (error) {
      console.error('Sipariş detayları yüklenirken hata:', error);
      alert('Sipariş detayları yüklenemedi');
      onClose();
    } finally {
      setLoading(false);
    }
  }, [orderId, onClose]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const getStatusText = (status) => {
    switch(status) {
      case 'delivered': return 'Teslim Edildi';
      case 'shipped': return 'Kargoda';
      case 'preparing': return 'Hazırlanıyor';
      case 'payment_received': return 'Ödeme Alındı';
      case 'pending': return 'Beklemede';
      case 'cancelled': return 'İptal Edildi';
      case 'refunded': return 'İade Edildi';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'delivered': return '#28a745';
      case 'shipped': return '#17a2b8';
      case 'preparing': return '#ffc107';
      case 'payment_received': return '#007bff';
      case 'pending': return '#6c757d';
      case 'cancelled': return '#dc3545';
      case 'refunded': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  const handleCancelOrder = async () => {
    const reason = prompt('İptal nedenini giriniz (opsiyonel):');

    if (!window.confirm('Siparişi iptal etmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: reason || 'İptal edildi' })
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        if (data.refundPending) {
          alert('Ödemeniz iade sürecine alınmıştır. En kısa sürede hesabınıza iade edilecektir.');
        }
        onClose();
        window.location.reload();
      } else {
        alert(data.error || 'Sipariş iptal edilemedi');
      }
    } catch (error) {
      console.error('İptal hatası:', error);
      alert('Bir hata oluştu');
    }
  };

  const canCancelOrder = () => {
    const cancellableStatuses = ['pending', 'payment_received', 'preparing'];
    return cancellableStatuses.includes(orderDetails.status);
  };

  const canRequestRefund = () => {
    if (orderDetails.status !== 'delivered') return false;
    if (!orderDetails.delivered_at) return false;

    const deliveredDate = new Date(orderDetails.delivered_at);
    const today = new Date();
    const daysDifference = Math.floor((today - deliveredDate) / (1000 * 60 * 60 * 24));

    return daysDifference <= 14;
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="loading">Yükleniyor...</div>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return null;
  }

  const address = typeof orderDetails.delivery_address === 'string'
    ? JSON.parse(orderDetails.delivery_address)
    : orderDetails.delivery_address;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content order-details-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>Sipariş Detayları</h2>
            <p className="order-number">#{orderDetails.order_number}</p>
          </div>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Status Badge */}
        <div className="status-badge" style={{ backgroundColor: getStatusColor(orderDetails.status) }}>
          {getStatusText(orderDetails.status)}
        </div>

        {/* Order Info */}
        <div className="order-info-section">
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Sipariş Tarihi</span>
              <span className="info-value">{formatDate(orderDetails.created_at)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Ödeme Durumu</span>
              <span className="info-value">
                {orderDetails.payment_status === 'success' ? '✅ Ödendi' : '⏳ Beklemede'}
              </span>
            </div>
            {orderDetails.tracking_number && (
              <>
                <div className="info-item">
                  <span className="info-label">Kargo Takip No</span>
                  <span className="info-value tracking-number">{orderDetails.tracking_number}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Kargo Şirketi</span>
                  <span className="info-value">{orderDetails.cargo_company}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Customer Info (Admin görünümünde) */}
        {orderDetails.user && (
          <div className="section">
            <h3>Müşteri Bilgileri</h3>
            <div className="customer-info">
              <p><strong>Ad Soyad:</strong> {orderDetails.user.name} {orderDetails.user.surname}</p>
              <p><strong>Email:</strong> {orderDetails.user.email}</p>
              {orderDetails.user.phone && <p><strong>Telefon:</strong> {orderDetails.user.phone}</p>}
            </div>
          </div>
        )}

        {/* Delivery Address */}
        <div className="section">
          <h3>Teslimat Adresi</h3>
          <div className="address-box">
            <p>{address.address}</p>
            <p>{address.district}, {address.city} - {address.postalCode}</p>
            {address.phone && <p>📞 {address.phone}</p>}
          </div>
        </div>

        {/* Order Items */}
        <div className="section">
          <h3>Sipariş Ürünleri</h3>
          <div className="items-list">
            {orderDetails.items.map((item, index) => (
              <div key={index} className="order-item">
                {item.product_image && (
                  <img src={item.product_image} alt={item.product_name} className="item-image" />
                )}
                <div className="item-details">
                  <h4>{item.product_name}</h4>
                  {item.product_description && <p className="item-desc">{item.product_description}</p>}
                  <div className="item-price-qty">
                    <span className="item-qty">Adet: {item.quantity}</span>
                    <span className="item-price">{formatPrice(item.price)}</span>
                  </div>
                </div>
                <div className="item-total">
                  {formatPrice(item.price * item.quantity)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Price Summary */}
        <div className="section">
          <div className="price-summary">
            <div className="price-row">
              <span>Ara Toplam:</span>
              <span>{formatPrice(orderDetails.subtotal)}</span>
            </div>
            {orderDetails.discount_code && orderDetails.discount_amount > 0 && (
              <div className="price-row" style={{ color: '#28a745', background: '#d4edda', margin: '0 -20px', padding: '8px 20px' }}>
                <span>İndirim ({orderDetails.discount_code}):</span>
                <span>-{formatPrice(orderDetails.discount_amount)}</span>
              </div>
            )}
            <div className="price-row">
              <span>Kargo Ücreti:</span>
              <span>{formatPrice(orderDetails.shipping_fee)}</span>
            </div>
            <div className="price-row total">
              <span>Toplam:</span>
              <span>{formatPrice(orderDetails.total_price)}</span>
            </div>
          </div>
        </div>

        {/* Status History Timeline */}
        {orderDetails.statusHistory && orderDetails.statusHistory.length > 0 && (
          <div className="section">
            <h3>Sipariş Geçmişi</h3>
            <div className="timeline">
              {orderDetails.statusHistory.map((history, index) => (
                <div key={index} className="timeline-item">
                  <div className="timeline-dot"></div>
                  <div className="timeline-content">
                    <span className="timeline-status">{getStatusText(history.new_status)}</span>
                    <span className="timeline-date">{formatDate(history.created_at)}</span>
                    {history.notes && <p className="timeline-notes">{history.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancel/Refund Actions */}
        {(canCancelOrder() || canRequestRefund()) && (
          <div className="section">
            <div className="action-buttons">
              {canCancelOrder() && (
                <button onClick={handleCancelOrder} className="btn-cancel-order">
                  ❌ Siparişi İptal Et
                </button>
              )}
              {canRequestRefund() && (
                <button onClick={() => setShowRefundModal(true)} className="btn-refund-request">
                  ↩️ İade Talebi Oluştur
                </button>
              )}
            </div>
          </div>
        )}

        {/* Order Notes */}
        {orderDetails.order_notes && (
          <div className="section">
            <h3>Sipariş Notları</h3>
            <div className="notes-box">
              {orderDetails.order_notes}
            </div>
          </div>
        )}
      </div>

      {/* Refund Request Modal */}
      {showRefundModal && (
        <RefundRequestModal
          orderId={orderId}
          orderNumber={orderDetails.order_number}
          onClose={() => setShowRefundModal(false)}
          onSuccess={() => {
            fetchOrderDetails();
          }}
        />
      )}
    </div>
  );
}

export default OrderDetailsModal;
