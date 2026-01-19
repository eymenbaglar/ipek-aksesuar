-- Sepet Sistemi İyileştirmeleri
-- Cart tablosu zaten var, ama updated_at kolonunu ekleyelim

ALTER TABLE cart
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Updated_at otomatik güncelleme trigger'ı
CREATE OR REPLACE FUNCTION update_cart_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_cart_timestamp ON cart;
CREATE TRIGGER trigger_update_cart_timestamp
BEFORE UPDATE ON cart
FOR EACH ROW
EXECUTE FUNCTION update_cart_timestamp();

-- Index'leri kontrol et
CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product_id ON cart(product_id);

-- Yorumlar
COMMENT ON TABLE cart IS 'Kullanıcı sepet öğeleri - cihazlar arası senkronize';
COMMENT ON COLUMN cart.user_id IS 'Sepet sahibi kullanıcı';
COMMENT ON COLUMN cart.product_id IS 'Sepetteki ürün';
COMMENT ON COLUMN cart.quantity IS 'Ürün adedi';
COMMENT ON COLUMN cart.created_at IS 'Sepete eklenme tarihi';
COMMENT ON COLUMN cart.updated_at IS 'Son güncelleme tarihi';
