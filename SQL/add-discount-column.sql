-- Kupon sistemi için discount_amount ve discount_code kolonlarını ekle

ALTER TABLE orders
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS discount_code VARCHAR(50);

-- İndex ekle
CREATE INDEX IF NOT EXISTS idx_orders_discount_code ON orders(discount_code);

-- Yorum ekle
COMMENT ON COLUMN orders.discount_amount IS 'Uygulanan kupon indirimi miktarı (TL)';
COMMENT ON COLUMN orders.discount_code IS 'Kullanılan kupon kodu';
