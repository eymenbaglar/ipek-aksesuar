-- =================================================================
-- SİPARİŞ SİSTEMİ İÇİN GEREKLİ DATABASE GÜNCELLEMELERİ
-- =================================================================
-- Bu SQL dosyasını çalıştırarak mevcut orders tablosuna eksik kolonları ekleyebilirsiniz
-- =================================================================

-- 1. ORDERS TABLOSUNA EKSİK KOLONLARI EKLE
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS order_number VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10, 2),
ADD COLUMN IF NOT EXISTS shipping_fee DECIMAL(10, 2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50),
ADD COLUMN IF NOT EXISTS payment_id VARCHAR(100),
ADD COLUMN IF NOT EXISTS payment_status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS cargo_company VARCHAR(50),
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- 2. STATUS KOLONUNU GÜNCELLE (Daha detaylı durumlar için)
-- Mevcut status kolonu zaten var, sadece constraint'i güncelliyoruz
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders
ADD CONSTRAINT orders_status_check
CHECK (status IN ('pending', 'payment_received', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded'));

-- 3. PAYMENT_STATUS İÇİN CONSTRAINT
ALTER TABLE orders
ADD CONSTRAINT orders_payment_status_check
CHECK (payment_status IN ('pending', 'success', 'failed', 'refunded'));

-- 4. SİPARİŞ DURUM GEÇMİŞİ TABLOSU OLUŞTUR
CREATE TABLE IF NOT EXISTS order_status_history (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_by INTEGER REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. ORDER_ITEMS TABLOSUNA EKSİK KOLONLAR
-- Ürün adı ve fiyatı değişebilir, o anki snapshot'ı saklamak için
ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS product_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS product_description TEXT,
ADD COLUMN IF NOT EXISTS product_image VARCHAR(500);

-- 6. İNDEXLER OLUŞTUR (Performans için)
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);

-- 7. SİPARİŞ NUMARASI OLUŞTURMA FONKSİYONU
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS VARCHAR(50) AS $$
DECLARE
    new_order_number VARCHAR(50);
    current_year VARCHAR(4);
    order_count INTEGER;
BEGIN
    -- Yıl bilgisi
    current_year := TO_CHAR(CURRENT_DATE, 'YYYY');

    -- Bu yıl kaç sipariş var?
    SELECT COUNT(*) INTO order_count
    FROM orders
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);

    -- Sipariş numarası formatı: SIP-2024-00001
    new_order_number := 'SIP-' || current_year || '-' || LPAD((order_count + 1)::TEXT, 5, '0');

    RETURN new_order_number;
END;
$$ LANGUAGE plpgsql;

-- 8. SİPARİŞ OLUŞTURULDUĞUNDA OTOMATİK NUMARA ATAMA TRİGGER'I
CREATE OR REPLACE FUNCTION auto_generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.order_number IS NULL THEN
        NEW.order_number := generate_order_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger oluştur (varsa önce sil)
DROP TRIGGER IF EXISTS trigger_auto_generate_order_number ON orders;
CREATE TRIGGER trigger_auto_generate_order_number
BEFORE INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION auto_generate_order_number();

-- 9. SİPARİŞ DURUMU DEĞİŞTİĞİNDE OTOMATİK TARİH GÜNCELLEME
CREATE OR REPLACE FUNCTION update_order_timestamps()
RETURNS TRIGGER AS $$
BEGIN
    -- updated_at her zaman güncellenir
    NEW.updated_at := CURRENT_TIMESTAMP;

    -- Status'e göre özel tarihler
    IF NEW.status = 'shipped' AND OLD.status != 'shipped' THEN
        NEW.shipped_at := CURRENT_TIMESTAMP;
    END IF;

    IF NEW.status = 'delivered' AND OLD.status != 'delivered' THEN
        NEW.delivered_at := CURRENT_TIMESTAMP;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger oluştur (varsa önce sil)
DROP TRIGGER IF EXISTS trigger_update_order_timestamps ON orders;
CREATE TRIGGER trigger_update_order_timestamps
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION update_order_timestamps();

-- 10. SİPARİŞ DURUMU DEĞİŞİMİNİ KAYDET
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Sadece status değiştiyse kaydet
    IF NEW.status IS DISTINCT FROM OLD.status THEN
        INSERT INTO order_status_history (order_id, old_status, new_status)
        VALUES (NEW.id, OLD.status, NEW.status);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger oluştur (varsa önce sil)
DROP TRIGGER IF EXISTS trigger_log_order_status_change ON orders;
CREATE TRIGGER trigger_log_order_status_change
AFTER UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION log_order_status_change();

-- 11. MEVCUT SİPARİŞLERE NUMARA ATA (Eğer varsa)
-- Bu kısım sadece eski siparişler varsa çalıştırılmalı
UPDATE orders
SET order_number = 'SIP-' || TO_CHAR(created_at, 'YYYY') || '-' || LPAD(id::TEXT, 5, '0')
WHERE order_number IS NULL;

-- 12. SUBTOTAL VE SHIPPING_FEE HESAPLA (Eğer mevcut siparişler varsa)
-- Bu kısım eski siparişleri düzenlemek için
UPDATE orders o
SET subtotal = o.total_price,
    shipping_fee = 0
WHERE subtotal IS NULL;

-- =================================================================
-- TAMAMLANDI!
-- =================================================================
-- Artık sipariş sisteminiz hazır. Aşağıdaki komutla kontrol edebilirsiniz:
-- SELECT * FROM orders LIMIT 5;
-- SELECT * FROM order_status_history LIMIT 5;
-- =================================================================
