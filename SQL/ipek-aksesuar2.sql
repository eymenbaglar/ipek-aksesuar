-- PostgreSQL Database Schema for İpek Aksesuar

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    surname VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    stock INTEGER DEFAULT 0,
    images JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    shipping_address JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
);

-- Discount codes table
CREATE TABLE discount_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_percent INTEGER CHECK (discount_percent > 0 AND discount_percent <= 100),
    valid_until TIMESTAMP
);

-- Password resets table
CREATE TABLE password_resets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cart table (optional - for persistent cart)
CREATE TABLE cart (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_password_resets_token ON password_resets(token);
CREATE INDEX idx_cart_user_id ON cart(user_id);

-- Insert sample admin user (password: admin123)
INSERT INTO users (email, password_hash, name, surname, role, verified) 
VALUES ('admin@ipekaksesuar.com', '$2b$10$ZmF5vTGxK8VqQJ7J9kxH5.pNzWXPD0GwG8S4vVh4AKxNP7Oy0NmLW', 'Admin', 'User', 'admin', true);

-- Insert sample products
INSERT INTO products (name, description, price, stock, images) VALUES
('İpek Eşarp - Mavi', 'El yapımı saf ipek eşarp, 90x90cm', 299.90, 10, '["https://example.com/esarp1.jpg"]'),
('İpek Şal - Kırmızı', 'Premium kalite ipek şal, 180x70cm', 499.90, 5, '["https://example.com/sal1.jpg"]'),
('İpek Kravat - Lacivert', 'Erkek ipek kravat, klasik model', 199.90, 15, '["https://example.com/kravat1.jpg"]'),
('İpek Mendil Seti', '4 adet ipek cep mendili', 149.90, 20, '["https://example.com/mendil1.jpg"]');

-- Insert sample discount codes
INSERT INTO discount_codes (code, discount_percent, valid_until) VALUES
('HOSGELDIN10', 10, '2025-12-31'),
('YAZ25', 25, '2025-08-31');