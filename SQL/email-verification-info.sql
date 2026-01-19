-- Email Verification System
-- Bu dosya sadece bilgi amaçlıdır, çalıştırmanıza gerek yoktur.
-- Email doğrulama sistemi zaten mevcut users tablosunu kullanıyor.

-- Users tablosunda mevcut sütunlar:
-- - verified: BOOLEAN (Kullanıcının email'i doğrulanmış mı?)
-- - verification_token: VARCHAR(255) (Email doğrulama token'ı)

-- Email doğrulama flow'u:
-- 1. Kullanıcı kayıt olur (verified=false)
-- 2. Sistem verification_token oluşturur ve kullanıcıya email gönderir
-- 3. Kullanıcı email'deki linke tıklar
-- 4. /api/auth/verify-email endpoint'i token'ı doğrular
-- 5. verified=true olarak güncellenir
-- 6. Kullanıcı artık giriş yapabilir

-- Eğer email_logs tablosu yoksa (email takibi için):
CREATE TABLE IF NOT EXISTS email_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    email_type VARCHAR(50) NOT NULL, -- 'email_verification', 'order_confirmation', 'order_shipped'
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'sent', 'failed'
    error_message TEXT,
    message_id VARCHAR(255),
    sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for email_logs
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_order_id ON email_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_email_type ON email_logs(email_type);
