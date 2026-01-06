-- Refund Requests (İade Talepleri) Tablosu
-- Müşteri iade taleplerini tutar

CREATE TABLE IF NOT EXISTS refund_requests (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(255) NOT NULL, -- İade nedeni
  description TEXT, -- Detaylı açıklama
  photos TEXT[], -- Fotoğraf URL'leri
  return_tracking_number VARCHAR(100), -- İade kargo takip no
  return_cargo_company VARCHAR(100), -- İade kargo şirketi
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'refunded'
  admin_notes TEXT, -- Admin notları
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexler
CREATE INDEX idx_refund_requests_order_id ON refund_requests(order_id);
CREATE INDEX idx_refund_requests_user_id ON refund_requests(user_id);
CREATE INDEX idx_refund_requests_status ON refund_requests(status);
CREATE INDEX idx_refund_requests_created_at ON refund_requests(created_at DESC);

-- Trigger: updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION update_refund_request_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_refund_request_timestamp
BEFORE UPDATE ON refund_requests
FOR EACH ROW
EXECUTE FUNCTION update_refund_request_timestamp();

-- Yorumlar
COMMENT ON TABLE refund_requests IS 'Müşteri iade talepleri';
COMMENT ON COLUMN refund_requests.reason IS 'İade nedeni: Ürün hasarlı, Yanlış ürün, Beğenmedim, vb.';
COMMENT ON COLUMN refund_requests.status IS 'Durum: pending (beklemede), approved (onaylandı), rejected (reddedildi), refunded (iade edildi)';
COMMENT ON COLUMN refund_requests.photos IS 'Ürün fotoğrafları (hasarlı ürün kanıtı için)';
