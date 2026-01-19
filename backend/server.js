// server.js
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const emailService = require('./utils/emailService');
const { sendOrderConfirmationEmail, sendOrderShippedEmail } = emailService;
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Email service'e pool'u set et
emailService.setPool(pool);

// Email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER, // ....... SMTP kullanıcı adı buraya yazılacak
    pass: process.env.SMTP_PASS  // ....... SMTP şifresi buraya yazılacak
  }
});

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token gerekli' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Geçersiz token' });
    req.user = user;
    next();
  });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin yetkisi gerekli' });
  }
  next();
};

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, surname } = req.body;
    
    console.log('Register isteği geldi:', { email, name, surname }); // Debug
    
    // Check if user exists
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Bu email zaten kayıtlı' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Insert user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, name, surname, role, verified, verification_token, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING id, email, name, surname, role',
      [email, hashedPassword, name, surname, 'user', false, verificationToken] // verified başlangıçta false
    );

    const user = result.rows[0];
    console.log('Kullanıcı oluşturuldu:', user);

    // Doğrulama emaili gönder
    try {
      const emailResult = await emailService.sendVerificationEmail(
        { id: user.id, email, name },
        verificationToken
      );

      if (emailResult.success) {
        console.log('✅ Doğrulama emaili başarıyla gönderildi');
      } else {
        console.log('⚠️ Email gönderilemedi ama kayıt başarılı:', emailResult.error);
      }
    } catch (emailError) {
      console.log('⚠️ Email gönderme hatası:', emailError.message);
    }

    // Başarılı response
    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı! Lütfen email adresinizi kontrol ederek hesabınızı doğrulayın.',
      user: user,
      emailSent: true
    });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      error: 'Kayıt sırasında hata oluştu: ' + error.message
    });
  }
});

// Email doğrulama endpoint'i
app.get('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Doğrulama token\'ı eksik'
      });
    }

    // Token'ı veritabanında ara
    const result = await pool.query(
      'SELECT * FROM users WHERE verification_token = $1',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Geçersiz doğrulama token\'ı'
      });
    }

    const user = result.rows[0];

    // Kullanıcı zaten doğrulanmışsa
    if (user.verified) {
      return res.json({
        success: true,
        message: 'Email adresiniz zaten doğrulanmış',
        alreadyVerified: true
      });
    }

    // Kullanıcıyı doğrula
    await pool.query(
      'UPDATE users SET verified = true, verification_token = NULL WHERE id = $1',
      [user.id]
    );

    console.log('✅ Kullanıcı email doğrulandı:', user.email);

    res.json({
      success: true,
      message: 'Email adresiniz başarıyla doğrulandı! Artık giriş yapabilirsiniz.',
      verified: true
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Email doğrulama sırasında hata oluştu'
    });
  }
});

// Doğrulama emailini tekrar gönder
app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email adresi gerekli'
      });
    }

    // Kullanıcıyı bul
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    const user = result.rows[0];

    // Zaten doğrulanmışsa
    if (user.verified) {
      return res.json({
        success: true,
        message: 'Email adresiniz zaten doğrulanmış',
        alreadyVerified: true
      });
    }

    // Yeni token oluştur
    const newToken = crypto.randomBytes(32).toString('hex');

    // Token'ı güncelle
    await pool.query(
      'UPDATE users SET verification_token = $1 WHERE id = $2',
      [newToken, user.id]
    );

    // Doğrulama emaili gönder
    const emailResult = await emailService.sendVerificationEmail(
      { id: user.id, email: user.email, name: user.name },
      newToken
    );

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Doğrulama emaili tekrar gönderildi. Lütfen gelen kutunuzu kontrol edin.'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Email gönderilemedi. Lütfen daha sonra tekrar deneyin.'
      });
    }

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Email gönderme sırasında hata oluştu'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email veya şifre hatalı' });
    }

    const user = result.rows[0];
    
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Email veya şifre hatalı' });
    }

    // Email doğrulama kontrolü
    if (!user.verified) {
      return res.status(401).json({
        error: 'Lütfen email adresinizi doğrulayın',
        errorCode: 'EMAIL_NOT_VERIFIED'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        surname: user.surname,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Giriş sırasında hata oluştu' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Bu email adresi ile kayıtlı kullanıcı bulunamadı'
      });
    }

    const user = result.rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    // Önceki tokenları sil
    await pool.query('DELETE FROM password_resets WHERE user_id = $1', [user.id]);

    // Yeni token ekle
    await pool.query(
      'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, resetToken, expiresAt]
    );

    // Şifre sıfırlama emaili gönder
    const emailResult = await emailService.sendPasswordResetEmail(user, resetToken);

    if (emailResult.success) {
      res.json({
        success: true,
        message: 'Şifre sıfırlama emaili gönderildi. Lütfen email kutunuzu kontrol edin.'
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Email gönderilemedi. Lütfen daha sonra tekrar deneyin.'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'Şifre sıfırlama sırasında bir hata oluştu'
    });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Token ve yeni şifre gerekli'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Şifre en az 6 karakter olmalıdır'
      });
    }

    const result = await pool.query(
      'SELECT * FROM password_resets WHERE token = $1 AND expires_at > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz veya süresi dolmuş token. Lütfen yeni şifre sıfırlama talebi oluşturun.'
      });
    }

    const reset = result.rows[0];
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [hashedPassword, reset.user_id]
    );

    await pool.query('DELETE FROM password_resets WHERE token = $1', [token]);

    console.log('✅ Şifre başarıyla güncellendi, user_id:', reset.user_id);

    res.json({
      success: true,
      message: 'Şifre başarıyla güncellendi. Artık yeni şifrenizle giriş yapabilirsiniz.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'Şifre güncelleme sırasında bir hata oluştu'
    });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    
    const result = await pool.query(
      'UPDATE users SET verified = true WHERE verification_token = $1 RETURNING *',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Geçersiz doğrulama tokeni' });
    }

    res.json({ message: 'Email başarıyla doğrulandı' });
  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({ error: 'Email doğrulama hatası' });
  }
});

// User Routes
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (req.user.id !== parseInt(id) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    const result = await pool.query(
      'SELECT id, email, name, surname, role, verified, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Kullanıcı bilgileri alınamadı' });
  }
});

// Product Routes
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, sortBy, minPrice, maxPrice } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    // Category filter
    if (category && category !== 'all') {
      query += ` AND LOWER(category) = LOWER($${paramIndex})`;
      params.push(category);
      paramIndex++;
    }

    // Search filter
    if (search) {
      query += ` AND (LOWER(name) LIKE LOWER($${paramIndex}) OR LOWER(description) LIKE LOWER($${paramIndex}) OR LOWER(category) LIKE LOWER($${paramIndex}))`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Price range filter
    if (minPrice) {
      query += ` AND price >= $${paramIndex}`;
      params.push(parseFloat(minPrice));
      paramIndex++;
    }

    if (maxPrice) {
      query += ` AND price <= $${paramIndex}`;
      params.push(parseFloat(maxPrice));
      paramIndex++;
    }

    // Sorting
    switch (sortBy) {
      case 'price-asc':
        query += ' ORDER BY price ASC';
        break;
      case 'price-desc':
        query += ' ORDER BY price DESC';
        break;
      case 'name':
        query += ' ORDER BY name ASC';
        break;
      default:
        query += ' ORDER BY created_at DESC';
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Ürünler alınamadı' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Ürün bilgileri alınamadı' });
  }
});

// Cart Routes - Database-based cart system

// GET /api/cart - Get user's cart items
app.get('/api/cart', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT
        c.id as cart_id,
        c.quantity,
        c.created_at,
        p.id,
        p.name,
        p.description,
        p.price,
        p.stock,
        p.images
      FROM cart c
      JOIN products p ON c.product_id = p.id
      WHERE c.user_id = $1
      ORDER BY c.created_at DESC
    `, [userId]);

    res.json({ success: true, cartItems: result.rows });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ error: 'Sepet bilgileri alınamadı' });
  }
});

// POST /api/cart - Add item to cart or update quantity if exists
app.post('/api/cart', authenticateToken, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user.id;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Geçersiz ürün veya miktar' });
    }

    // Check if product exists
    const product = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
    if (product.rows.length === 0) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    // Check stock
    if (product.rows[0].stock < quantity) {
      return res.status(400).json({ error: 'Yetersiz stok' });
    }

    // Check if item already in cart
    const existingItem = await pool.query(
      'SELECT * FROM cart WHERE user_id = $1 AND product_id = $2',
      [userId, productId]
    );

    let result;
    if (existingItem.rows.length > 0) {
      // Update quantity
      const newQuantity = existingItem.rows[0].quantity + quantity;

      if (product.rows[0].stock < newQuantity) {
        return res.status(400).json({ error: 'Yetersiz stok' });
      }

      result = await pool.query(
        'UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND product_id = $3 RETURNING *',
        [newQuantity, userId, productId]
      );
    } else {
      // Insert new item
      result = await pool.query(
        'INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
        [userId, productId, quantity]
      );
    }

    res.json({
      success: true,
      message: 'Ürün sepete eklendi',
      cartItem: result.rows[0]
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ error: 'Sepete ekleme hatası' });
  }
});

// PUT /api/cart/:productId - Update cart item quantity
app.put('/api/cart/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user.id;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Geçersiz miktar' });
    }

    // Check if product exists and has enough stock
    const product = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
    if (product.rows.length === 0) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    if (product.rows[0].stock < quantity) {
      return res.status(400).json({ error: 'Yetersiz stok' });
    }

    // Update cart item
    const result = await pool.query(
      'UPDATE cart SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2 AND product_id = $3 RETURNING *',
      [quantity, userId, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sepet öğesi bulunamadı' });
    }

    res.json({
      success: true,
      message: 'Sepet güncellendi',
      cartItem: result.rows[0]
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ error: 'Sepet güncelleme hatası' });
  }
});

// DELETE /api/cart/:productId - Remove item from cart
app.delete('/api/cart/:productId', authenticateToken, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'DELETE FROM cart WHERE user_id = $1 AND product_id = $2 RETURNING *',
      [userId, productId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sepet öğesi bulunamadı' });
    }

    res.json({
      success: true,
      message: 'Ürün sepetten kaldırıldı'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ error: 'Sepetten kaldırma hatası' });
  }
});

// DELETE /api/cart - Clear entire cart
app.delete('/api/cart', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    await pool.query('DELETE FROM cart WHERE user_id = $1', [userId]);

    res.json({
      success: true,
      message: 'Sepet temizlendi'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ error: 'Sepet temizleme hatası' });
  }
});

// Checkout Route (İyzico integration)
app.post('/api/checkout', authenticateToken, async (req, res) => {
  try {
    const { items, shippingAddress, discountCode } = req.body;
    const userId = req.user.id;

    // Calculate total
    let totalPrice = 0;
    for (const item of items) {
      const product = await pool.query('SELECT price FROM products WHERE id = $1', [item.productId]);
      totalPrice += product.rows[0].price * item.quantity;
    }

    // Apply discount if exists
    if (discountCode) {
      const discount = await pool.query(
        'SELECT * FROM discount_codes WHERE code = $1 AND valid_until > NOW()',
        [discountCode]
      );
      if (discount.rows.length > 0) {
        totalPrice = totalPrice * (1 - discount.rows[0].discount_percent / 100);
      }
    }

    // İyzico integration would go here
    // ....... İyzico API key buraya yazılacak
    // const iyzipay = new Iyzipay({
    //   apiKey: process.env.IYZICO_API_KEY,
    //   secretKey: process.env.IYZICO_SECRET_KEY,
    //   uri: 'https://sandbox-api.iyzipay.com'
    // });

    // Create order
    const order = await pool.query(
      'INSERT INTO orders (user_id, total_price, status, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [userId, totalPrice, 'pending']
    );

    // Add order items
    for (const item of items) {
      await pool.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [order.rows[0].id, item.productId, item.quantity, item.price]
      );
    }

    res.json({ 
      message: 'Sipariş oluşturuldu',
      orderId: order.rows[0].id,
      checkoutFormContent: 'İyzico checkout form HTML içeriği buraya gelecek'
    });
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Ödeme işlemi hatası' });
  }
});

// Admin Routes
app.get('/api/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, name, surname, role, verified, created_at FROM users ORDER BY created_at DESC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Kullanıcılar alınamadı' });
  }
});

app.post('/api/admin/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, description, price, stock, images, category } = req.body;

    const result = await pool.query(
      'INSERT INTO products (name, description, price, stock, images, category, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [name, description, price, stock, JSON.stringify(images), category]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Ürün oluşturma hatası' });
  }
});

app.put('/api/admin/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, images, category } = req.body;

    const result = await pool.query(
      'UPDATE products SET name = $1, description = $2, price = $3, stock = $4, images = $5, category = $6 WHERE id = $7 RETURNING *',
      [name, description, price, stock, JSON.stringify(images), category, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Ürün güncelleme hatası' });
  }
});

app.delete('/api/admin/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ürün bulunamadı' });
    }

    res.json({ message: 'Ürün silindi' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Ürün silme hatası' });
  }
});

app.post('/api/admin/discount-codes', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { code, discountPercent, validUntil } = req.body;
    
    const result = await pool.query(
      'INSERT INTO discount_codes (code, discount_percent, valid_until) VALUES ($1, $2, $3) RETURNING *',
      [code, discountPercent, validUntil]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create discount code error:', error);
    res.status(500).json({ error: 'İndirim kodu oluşturma hatası' });
  }
});

// Address Routes
app.get('/api/users/:userId/addresses', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    const result = await pool.query(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ error: 'Adresler alınamadı' });
  }
});

app.post('/api/users/:userId/addresses', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, name, address, city, district, neighborhood, phone, postal_code, default: isDefault } = req.body;

    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    // Eğer yeni adres default ise, diğer adresleri default olmaktan çıkar
    if (isDefault) {
      await pool.query(
        'UPDATE addresses SET is_default = false WHERE user_id = $1',
        [userId]
      );
    }

    const result = await pool.query(
      'INSERT INTO addresses (user_id, title, full_name, address_line, city, district, neighborhood, phone, postal_code, is_default, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) RETURNING *',
      [userId, title, name, address, city, district || '', neighborhood || '', phone, postal_code || '', isDefault || false]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create address error:', error);
    res.status(500).json({ error: 'Adres oluşturma hatası' });
  }
});

app.put('/api/users/:userId/addresses/:addressId', authenticateToken, async (req, res) => {
  try {
    const { userId, addressId } = req.params;
    const { title, name, address, city, district, neighborhood, phone, postal_code, default: isDefault } = req.body;

    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    // Eğer adres default yapılıyorsa, diğer adresleri default olmaktan çıkar
    if (isDefault) {
      await pool.query(
        'UPDATE addresses SET is_default = false WHERE user_id = $1',
        [userId]
      );
    }

    const result = await pool.query(
      'UPDATE addresses SET title = $1, full_name = $2, address_line = $3, city = $4, district = $5, neighborhood = $6, phone = $7, postal_code = $8, is_default = $9 WHERE id = $10 AND user_id = $11 RETURNING *',
      [title, name, address, city, district || '', neighborhood || '', phone, postal_code || '', isDefault || false, addressId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Adres bulunamadı' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update address error:', error);
    res.status(500).json({ error: 'Adres güncelleme hatası' });
  }
});

app.delete('/api/users/:userId/addresses/:addressId', authenticateToken, async (req, res) => {
  try {
    const { userId, addressId } = req.params;

    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    const result = await pool.query(
      'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING *',
      [addressId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Adres bulunamadı' });
    }

    res.json({ message: 'Adres silindi' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ error: 'Adres silme hatası' });
  }
});

// Order Routes
// 1. Create new order (with mock payment)
app.post('/api/orders', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { items, address, paymentMethod, orderNotes, discountCode, discountAmount: frontendDiscountAmount } = req.body;
    const userId = req.user.id;

    await client.query('BEGIN');

    // Validate items
    if (!items || items.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Sipariş içeriği boş olamaz' });
    }

    // Calculate subtotal and validate stock
    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const productResult = await client.query(
        'SELECT id, name, description, price, stock, images FROM products WHERE id = $1',
        [item.productId]
      );

      if (productResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: `Ürün bulunamadı: ${item.productId}` });
      }

      const product = productResult.rows[0];

      if (product.stock < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          error: `Yetersiz stok: ${product.name} (Mevcut: ${product.stock}, İstenen: ${item.quantity})`
        });
      }

      const itemTotal = Number(product.price) * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        productDescription: product.description,
        productImage: product.images && product.images.length > 0 ? product.images[0] : null,
        quantity: item.quantity,
        price: product.price
      });
    }

    // Apply discount if exists
    // Frontend'den gelen discount miktarını kullan (localStorage'daki kuponlar için)
    // Eğer frontend discount yoksa database'den kontrol et
    let discountAmount = frontendDiscountAmount || 0;

    if (discountCode && !frontendDiscountAmount) {
      const discountResult = await client.query(
        'SELECT * FROM discount_codes WHERE code = $1 AND valid_until > NOW()',
        [discountCode]
      );
      if (discountResult.rows.length > 0) {
        discountAmount = subtotal * (discountResult.rows[0].discount_percent / 100);
      }
    }

    // Calculate shipping fee (you can customize this logic)
    const shippingFee = subtotal > 500 ? 0 : 29.90;

    // Calculate total
    const totalPrice = subtotal - discountAmount + shippingFee;

    // Mock payment processing
    const paymentId = `MOCK_PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const paymentStatus = 'success'; // Mock success

    // Create order (order_number will be auto-generated by trigger)
    const orderResult = await client.query(
      `INSERT INTO orders
       (user_id, total_price, subtotal, shipping_fee, discount_amount, discount_code,
        payment_method, payment_id, payment_status, status, delivery_address, order_notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())
       RETURNING *`,
      [
        userId,
        totalPrice,
        subtotal,
        shippingFee,
        discountAmount,
        discountCode || null,
        paymentMethod || 'mock',
        paymentId,
        paymentStatus,
        'pending',
        JSON.stringify(address),
        orderNotes || null
      ]
    );

    const order = orderResult.rows[0];

    // Insert order items with product snapshots
    for (const itemData of orderItemsData) {
      await client.query(
        `INSERT INTO order_items
         (order_id, product_id, product_name, product_description, product_image, quantity, price)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          order.id,
          itemData.productId,
          itemData.productName,
          itemData.productDescription,
          itemData.productImage,
          itemData.quantity,
          itemData.price
        ]
      );

      // Update product stock
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [itemData.quantity, itemData.productId]
      );
    }

    await client.query('COMMIT');

    // Get user info for email
    const userResult = await pool.query(
      'SELECT email, name, surname FROM users WHERE id = $1',
      [userId]
    );
    const user = userResult.rows[0];

    // Send order confirmation email (async, don't block response)
    sendOrderConfirmationEmail(order, user, orderItemsData).catch(err => {
      console.error('Email gönderme hatası (order confirmation):', err);
    });

    res.status(201).json({
      success: true,
      message: 'Sipariş başarıyla oluşturuldu',
      order: {
        id: order.id,
        orderNumber: order.order_number,
        totalPrice: order.total_price,
        subtotal: order.subtotal,
        shippingFee: order.shipping_fee,
        discountAmount: order.discount_amount || 0,
        discountCode: order.discount_code || null,
        status: order.status,
        paymentStatus: order.payment_status,
        createdAt: order.created_at
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Sipariş oluşturma hatası: ' + error.message });
  } finally {
    client.release();
  }
});

// 2. Get user's orders
app.get('/api/users/:userId/orders', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    const result = await pool.query(
      `SELECT
        o.id, o.order_number, o.total_price, o.subtotal, o.shipping_fee,
        o.status, o.payment_status, o.payment_method,
        o.tracking_number, o.cargo_company,
        o.created_at, o.shipped_at, o.delivered_at,
        COUNT(oi.id) as item_count
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ error: 'Siparişler alınamadı' });
  }
});

// 3. Get single order details
app.get('/api/orders/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Get order
    const orderResult = await pool.query(
      `SELECT * FROM orders WHERE id = $1`,
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    const order = orderResult.rows[0];

    // Check authorization
    if (req.user.id !== order.user_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    // Get order items
    const itemsResult = await pool.query(
      `SELECT * FROM order_items WHERE order_id = $1`,
      [orderId]
    );

    // Get order status history
    const historyResult = await pool.query(
      `SELECT * FROM order_status_history WHERE order_id = $1 ORDER BY created_at ASC`,
      [orderId]
    );

    // Get user info
    const userResult = await pool.query(
      `SELECT name, surname, email, phone FROM users WHERE id = $1`,
      [order.user_id]
    );

    res.json({
      ...order,
      items: itemsResult.rows,
      statusHistory: historyResult.rows,
      user: userResult.rows[0]
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ error: 'Sipariş bilgileri alınamadı' });
  }
});

// 4. Update order status (Admin only)
app.put('/api/admin/orders/:orderId/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, cargoCompany, notes } = req.body;

    // Validate status
    const validStatuses = ['pending', 'payment_received', 'preparing', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Geçersiz sipariş durumu' });
    }

    // Build update query
    let updateQuery = 'UPDATE orders SET status = $1';
    const queryParams = [status];
    let paramCounter = 2;

    if (trackingNumber) {
      updateQuery += `, tracking_number = $${paramCounter}`;
      queryParams.push(trackingNumber);
      paramCounter++;
    }

    if (cargoCompany) {
      updateQuery += `, cargo_company = $${paramCounter}`;
      queryParams.push(cargoCompany);
      paramCounter++;
    }

    updateQuery += ` WHERE id = $${paramCounter} RETURNING *`;
    queryParams.push(orderId);

    const result = await pool.query(updateQuery, queryParams);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    // If notes provided, add to status history
    if (notes) {
      await pool.query(
        'UPDATE order_status_history SET notes = $1 WHERE order_id = $2 AND new_status = $3 AND created_at = (SELECT MAX(created_at) FROM order_status_history WHERE order_id = $2)',
        [notes, orderId, status]
      );
    }

    // Send shipping email if status changed to 'shipped'
    if (status === 'shipped') {
      try {
        // Get user info and order items for email
        const orderData = result.rows[0];
        const userResult = await pool.query(
          'SELECT email, name, surname FROM users WHERE id = $1',
          [orderData.user_id]
        );
        const user = userResult.rows[0];

        // Get order items
        const orderItemsResult = await pool.query(
          'SELECT product_name, product_description, product_image, quantity, price FROM order_items WHERE order_id = $1',
          [orderId]
        );
        const orderItems = orderItemsResult.rows;

        // Send shipping notification email (async, don't block response)
        sendOrderShippedEmail(orderData, user, orderItems).catch(err => {
          console.error('Email gönderme hatası (order shipped):', err);
        });
      } catch (emailError) {
        console.error('Email hazırlama hatası:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.json({
      success: true,
      message: 'Sipariş durumu güncellendi',
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: 'Sipariş durumu güncellenemedi' });
  }
});

// 5. Get order status history
app.get('/api/orders/:orderId/history', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if order exists and user has access
    const orderResult = await pool.query(
      'SELECT user_id FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    if (req.user.id !== orderResult.rows[0].user_id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    const result = await pool.query(
      `SELECT
        osh.*,
        u.name as changed_by_name
       FROM order_status_history osh
       LEFT JOIN users u ON osh.changed_by = u.id
       WHERE osh.order_id = $1
       ORDER BY osh.created_at ASC`,
      [orderId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get order history error:', error);
    res.status(500).json({ error: 'Sipariş geçmişi alınamadı' });
  }
});

// 6. Get all orders (Admin only)
app.get('/api/admin/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT
        o.id, o.order_number, o.total_price, o.subtotal, o.shipping_fee,
        o.discount_amount, o.discount_code,
        o.status, o.payment_status, o.payment_method,
        o.tracking_number, o.cargo_company,
        o.created_at, o.shipped_at, o.delivered_at,
        u.email as user_email, u.name as user_name,
        COUNT(oi.id) as item_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;

    const queryParams = [];
    let paramCounter = 1;

    if (status) {
      query += ` WHERE o.status = $${paramCounter}`;
      queryParams.push(status);
      paramCounter++;
    }

    query += ` GROUP BY o.id, u.email, u.name ORDER BY o.created_at DESC LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({ error: 'Siparişler alınamadı' });
  }
});

// Email Logs Routes
// Get all email logs (Admin only)
app.get('/api/admin/email-logs', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { email_type, status, limit = 50, offset = 0 } = req.query;

    let query = `
      SELECT
        el.id,
        el.user_id,
        el.order_id,
        el.email_type,
        el.recipient_email,
        el.subject,
        el.status,
        el.error_message,
        el.message_id,
        el.sent_at,
        u.name as user_name,
        u.surname as user_surname,
        o.order_number
      FROM email_logs el
      LEFT JOIN users u ON el.user_id = u.id
      LEFT JOIN orders o ON el.order_id = o.id
      WHERE 1=1
    `;

    const queryParams = [];
    let paramCounter = 1;

    if (email_type) {
      query += ` AND el.email_type = $${paramCounter}`;
      queryParams.push(email_type);
      paramCounter++;
    }

    if (status) {
      query += ` AND el.status = $${paramCounter}`;
      queryParams.push(status);
      paramCounter++;
    }

    query += ` ORDER BY el.sent_at DESC LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error('Get email logs error:', error);
    res.status(500).json({ error: 'Email logları alınamadı' });
  }
});

// Cancel/Refund Routes
// 1. Cancel order (User - only for pending, payment_received, preparing)
app.post('/api/orders/:orderId/cancel', authenticateToken, async (req, res) => {
  const client = await pool.connect();
  try {
    const { orderId } = req.params;
    const { reason } = req.body;

    await client.query('BEGIN');

    // Get order
    const orderResult = await client.query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    const order = orderResult.rows[0];

    // Check authorization
    if (req.user.id !== order.user_id && req.user.role !== 'admin') {
      await client.query('ROLLBACK');
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    // Check if cancellable
    const cancellableStatuses = ['pending', 'payment_received', 'preparing'];
    if (!cancellableStatuses.includes(order.status)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        error: 'Bu sipariş iptal edilemez. Sadece beklemede, ödeme alındı veya hazırlanıyor durumundaki siparişler iptal edilebilir.'
      });
    }

    // Get order items to restore stock
    const itemsResult = await client.query(
      'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
      [orderId]
    );

    // Restore stock
    for (const item of itemsResult.rows) {
      await client.query(
        'UPDATE products SET stock = stock + $1 WHERE id = $2',
        [item.quantity, item.product_id]
      );
    }

    // Update order status to cancelled
    await client.query(
      'UPDATE orders SET status = $1 WHERE id = $2',
      ['cancelled', orderId]
    );

    // If payment was received, create refund request automatically
    if (order.payment_status === 'success') {
      await client.query(
        `INSERT INTO refund_requests (order_id, user_id, reason, description, status, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [orderId, order.user_id, reason || 'Sipariş iptali', 'Kullanıcı siparişi iptal etti', 'pending']
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Sipariş başarıyla iptal edildi',
      refundPending: order.payment_status === 'success'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Cancel order error:', error);
    res.status(500).json({ error: 'Sipariş iptal edilemedi' });
  } finally {
    client.release();
  }
});

// 2. Create refund request (User - only for delivered orders within 14 days)
app.post('/api/orders/:orderId/refund', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason, description, photos } = req.body;
    const userId = req.user.id;

    // Get order
    const orderResult = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [orderId]
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sipariş bulunamadı' });
    }

    const order = orderResult.rows[0];

    // Check authorization
    if (userId !== order.user_id) {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    // Check if delivered
    if (order.status !== 'delivered') {
      return res.status(400).json({
        error: 'Sadece teslim edilmiş siparişler için iade talebi oluşturabilirsiniz'
      });
    }

    // Check 14 days limit
    const deliveredDate = new Date(order.delivered_at);
    const today = new Date();
    const daysDifference = Math.floor((today - deliveredDate) / (1000 * 60 * 60 * 24));

    if (daysDifference > 14) {
      return res.status(400).json({
        error: 'İade süresi dolmuş. Sadece teslim tarihinden itibaren 14 gün içinde iade talebi oluşturabilirsiniz.'
      });
    }

    // Check if refund request already exists
    const existingRefund = await pool.query(
      'SELECT * FROM refund_requests WHERE order_id = $1',
      [orderId]
    );

    if (existingRefund.rows.length > 0) {
      return res.status(400).json({
        error: 'Bu sipariş için zaten bir iade talebi mevcut'
      });
    }

    // Create refund request
    const result = await pool.query(
      `INSERT INTO refund_requests (order_id, user_id, reason, description, photos, status, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING *`,
      [orderId, userId, reason, description || null, photos || null, 'pending']
    );

    res.status(201).json({
      success: true,
      message: 'İade talebi başarıyla oluşturuldu',
      refundRequest: result.rows[0]
    });

  } catch (error) {
    console.error('Create refund request error:', error);
    res.status(500).json({ error: 'İade talebi oluşturulamadı' });
  }
});

// 3. Get user's refund requests
app.get('/api/users/:userId/refund-requests', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Yetkisiz erişim' });
    }

    const result = await pool.query(
      `SELECT
        rr.*,
        o.order_number,
        o.total_price
       FROM refund_requests rr
       LEFT JOIN orders o ON rr.order_id = o.id
       WHERE rr.user_id = $1
       ORDER BY rr.created_at DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get refund requests error:', error);
    res.status(500).json({ error: 'İade talepleri alınamadı' });
  }
});

// 4. Get all refund requests (Admin)
app.get('/api/admin/refund-requests', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT
        rr.*,
        o.order_number,
        o.total_price,
        u.name as user_name,
        u.surname as user_surname,
        u.email as user_email
      FROM refund_requests rr
      LEFT JOIN orders o ON rr.order_id = o.id
      LEFT JOIN users u ON rr.user_id = u.id
    `;

    const queryParams = [];
    if (status) {
      query += ' WHERE rr.status = $1';
      queryParams.push(status);
    }

    query += ' ORDER BY rr.created_at DESC';

    const result = await pool.query(query, queryParams);

    res.json(result.rows);
  } catch (error) {
    console.error('Get all refund requests error:', error);
    res.status(500).json({ error: 'İade talepleri alınamadı' });
  }
});

// 5. Update refund request status (Admin)
app.put('/api/admin/refund-requests/:requestId', authenticateToken, requireAdmin, async (req, res) => {
  const client = await pool.connect();
  try {
    const { requestId } = req.params;
    const { status, adminNotes, returnTrackingNumber, returnCargoCompany } = req.body;

    await client.query('BEGIN');

    // Get refund request
    const refundResult = await client.query(
      'SELECT * FROM refund_requests WHERE id = $1',
      [requestId]
    );

    if (refundResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'İade talebi bulunamadı' });
    }

    const refundRequest = refundResult.rows[0];

    // Update refund request
    let updateQuery = 'UPDATE refund_requests SET status = $1, admin_notes = $2';
    const updateParams = [status, adminNotes || null];
    let paramCounter = 3;

    if (returnTrackingNumber) {
      updateQuery += `, return_tracking_number = $${paramCounter}`;
      updateParams.push(returnTrackingNumber);
      paramCounter++;
    }

    if (returnCargoCompany) {
      updateQuery += `, return_cargo_company = $${paramCounter}`;
      updateParams.push(returnCargoCompany);
      paramCounter++;
    }

    updateQuery += ` WHERE id = $${paramCounter} RETURNING *`;
    updateParams.push(requestId);

    const result = await client.query(updateQuery, updateParams);

    // If approved and stock should be restored
    if (status === 'approved') {
      // Get order items
      const itemsResult = await client.query(
        'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
        [refundRequest.order_id]
      );

      // Restore stock
      for (const item of itemsResult.rows) {
        await client.query(
          'UPDATE products SET stock = stock + $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      // Update order status to refunded
      await client.query(
        'UPDATE orders SET status = $1 WHERE id = $2',
        ['refunded', refundRequest.order_id]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'İade talebi güncellendi',
      refundRequest: result.rows[0]
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update refund request error:', error);
    res.status(500).json({ error: 'İade talebi güncellenemedi' });
  } finally {
    client.release();
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});