-- Email Logs Tablosu
-- Email gönderim kayıtlarını tutar

CREATE TABLE IF NOT EXISTS email_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  order_id INTEGER REFERENCES orders(id) ON DELETE SET NULL,
  email_type VARCHAR(50) NOT NULL, -- 'order_confirmation', 'order_shipped', 'order_cancelled', 'password_reset', etc.
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'sent', -- 'sent', 'failed', 'pending'
  error_message TEXT, -- Hata mesajı (varsa)
  message_id VARCHAR(255), -- NodeMailer messageId
  sent_at TIMESTAMP DEFAULT NOW()
);

-- Indexler (performans için)
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_order_id ON email_logs(order_id);
CREATE INDEX idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX idx_email_logs_sent_at ON email_logs(sent_at DESC);
CREATE INDEX idx_email_logs_status ON email_logs(status);

-- Yorum ekle
COMMENT ON TABLE email_logs IS 'Sistemden gönderilen tüm emaillerin kayıtları';
COMMENT ON COLUMN email_logs.email_type IS 'Email tipi: order_confirmation, order_shipped, order_cancelled, password_reset vb.';
COMMENT ON COLUMN email_logs.status IS 'Gönderim durumu: sent (başarılı), failed (başarısız), pending (beklemede)';
COMMENT ON COLUMN email_logs.message_id IS 'NodeMailer tarafından döndürülen benzersiz mesaj ID';
