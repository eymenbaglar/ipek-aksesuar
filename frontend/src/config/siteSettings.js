// Site Ayarları - Merkezi Konfigürasyon
// Admin panelden değiştirilebilir, buradaki değerler default olarak kullanılır

// LocalStorage'dan ayarları yükle veya default değerleri kullan
export const getShippingSettings = () => {
  const saved = localStorage.getItem('shippingSettings');

  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error('Shipping settings parse error:', error);
    }
  }

  // Default değerler
  return {
    fee: 29.90,
    freeShippingThreshold: 500,
    enabled: true,
    carrier: 'Yurtiçi Kargo'
  };
};

// Kargo ayarlarını kaydet
export const saveShippingSettings = (settings) => {
  localStorage.setItem('shippingSettings', JSON.stringify(settings));
};

// Default değerleri export et (fallback olarak)
export const DEFAULT_SHIPPING = {
  fee: 29.90,
  freeShippingThreshold: 500,
  enabled: true,
  carrier: 'Yurtiçi Kargo'
};
