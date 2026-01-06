import React, { useState } from 'react';
import './RefundRequestModal.css';

function RefundRequestModal({ orderId, orderNumber, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    reason: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  const reasons = [
    'Ürün hasarlı/kusurlu geldi',
    'Yanlış ürün gönderildi',
    'Ürünü beğenmedim',
    'Beden/ölçü uygun değil',
    'Fikrim değişti',
    'Diğer'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.reason) {
      alert('Lütfen iade nedenini seçin');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('İade talebiniz başarıyla oluşturuldu. En kısa sürede değerlendirilecektir.');
        onSuccess();
        onClose();
      } else {
        alert(data.error || 'İade talebi oluşturulamadı');
      }
    } catch (error) {
      console.error('İade talebi hatası:', error);
      alert('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="refund-modal-overlay" onClick={onClose}>
      <div className="refund-modal-content" onClick={e => e.stopPropagation()}>
        <div className="refund-modal-header">
          <h2>İade Talebi Oluştur</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="refund-modal-body">
          <p className="order-info">Sipariş No: <strong>{orderNumber}</strong></p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>İade Nedeni *</label>
              <select
                value={formData.reason}
                onChange={e => setFormData({ ...formData, reason: e.target.value })}
                required
              >
                <option value="">Neden seçin</option>
                {reasons.map((reason, index) => (
                  <option key={index} value={reason}>{reason}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Detaylı Açıklama (İsteğe bağlı)</label>
              <textarea
                rows="4"
                placeholder="İade nedeninizi detaylı olarak açıklayın..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="info-box">
              <p><strong>İade Süreci:</strong></p>
              <ol>
                <li>Talebiniz 24 saat içinde değerlendirilecektir</li>
                <li>Onay durumunda size bildirim gönderilecektir</li>
                <li>Ürünü kargo ile geri göndermeniz gerekecektir</li>
                <li>Ürün kontrolünden sonra iade işlemi tamamlanacaktır</li>
              </ol>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={onClose}
                className="btn-cancel"
                disabled={loading}
              >
                İptal
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={loading}
              >
                {loading ? 'Gönderiliyor...' : 'İade Talebi Oluştur'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RefundRequestModal;
