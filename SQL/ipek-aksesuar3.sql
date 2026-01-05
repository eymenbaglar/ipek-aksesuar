-- Addresses table for user saved addresses
CREATE TABLE IF NOT EXISTS addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL, -- 'Ev', 'İş', 'Diğer'
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100),
    address_line TEXT NOT NULL,
    postal_code VARCHAR(10),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for faster queries
CREATE INDEX idx_addresses_user_id ON addresses(user_id);

-- Function to ensure only one default address per user
CREATE OR REPLACE FUNCTION ensure_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_default = TRUE THEN
        UPDATE addresses 
        SET is_default = FALSE 
        WHERE user_id = NEW.user_id 
        AND id != NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for default address
CREATE TRIGGER trigger_single_default_address
AFTER INSERT OR UPDATE ON addresses
FOR EACH ROW
EXECUTE FUNCTION ensure_single_default_address();

-- Add phone number to users table if not exists
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Guest checkout table for non-registered users
CREATE TABLE IF NOT EXISTS guest_checkouts (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    city VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    neighborhood VARCHAR(100),
    address_line TEXT NOT NULL,
    postal_code VARCHAR(10),
    order_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Update orders table to support guest checkouts
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS guest_checkout_id INTEGER REFERENCES guest_checkouts(id),
ADD COLUMN IF NOT EXISTS delivery_address JSONB,
ADD COLUMN IF NOT EXISTS billing_address JSONB,
ADD COLUMN IF NOT EXISTS order_notes TEXT;