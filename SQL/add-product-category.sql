-- Add category column to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS category VARCHAR(50);

-- Update existing products with categories
UPDATE products
SET category = CASE
    WHEN name LIKE '%Eşarp%' THEN 'Eşarp'
    WHEN name LIKE '%Şal%' THEN 'Şal'
    WHEN name LIKE '%Fular%' THEN 'Fular'
    ELSE 'Eşarp' -- default category
END;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- Add comment
COMMENT ON COLUMN products.category IS 'Ürün kategorisi: Eşarp, Şal, Fular';
