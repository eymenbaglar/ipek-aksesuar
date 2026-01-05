-- =================================================================
-- ORDER STATUS HISTORY TRİGGER'INI DÜZELT
-- =================================================================
-- Bu SQL dosyası order_status_history trigger'ını hem INSERT hem UPDATE
-- için çalışacak şekilde düzenler
-- =================================================================

-- Mevcut trigger'ı sil
DROP TRIGGER IF EXISTS trigger_log_order_status_change ON orders;

-- Fonksiyonu yeniden oluştur - INSERT ve UPDATE için çalışacak şekilde
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- INSERT işlemi ise (yeni sipariş oluşturuldu)
    IF TG_OP = 'INSERT' THEN
        INSERT INTO order_status_history (order_id, old_status, new_status)
        VALUES (NEW.id, NULL, NEW.status);
        RETURN NEW;
    END IF;

    -- UPDATE işlemi ise (sipariş durumu değişti)
    IF TG_OP = 'UPDATE' THEN
        -- Sadece status değiştiyse kaydet
        IF NEW.status IS DISTINCT FROM OLD.status THEN
            INSERT INTO order_status_history (order_id, old_status, new_status)
            VALUES (NEW.id, OLD.status, NEW.status);
        END IF;
        RETURN NEW;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger'ı INSERT ve UPDATE için oluştur
CREATE TRIGGER trigger_log_order_status_change
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION log_order_status_change();

-- =================================================================
-- MEVCUT SİPARİŞLER İÇİN GEÇMİŞ KAYDI OLUŞTUR
-- =================================================================
-- Eğer önceden oluşturulmuş siparişler varsa, onlar için de kayıt oluştur

INSERT INTO order_status_history (order_id, old_status, new_status, created_at)
SELECT
    id,
    NULL,
    status,
    created_at
FROM orders
WHERE id NOT IN (SELECT DISTINCT order_id FROM order_status_history)
ON CONFLICT DO NOTHING;

CREATE INDEX idx_order_status_history_created_at ON order_status_history(created_at DESC);
-- =================================================================
-- TAMAMLANDI!
-- =================================================================
-- Artık yeni siparişler oluşturulduğunda otomatik olarak
-- order_status_history tablosuna kayıt eklenecektir.
-- =================================================================
