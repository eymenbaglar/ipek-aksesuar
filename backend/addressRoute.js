// addressRoutes.js - Backend API for address management

const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const authenticateToken = require('./middleware/auth'); // JWT middleware

// Database connection (import from your main server.js)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Get all addresses for logged in user
router.get('/api/addresses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ error: 'Adresler alınırken hata oluştu' });
  }
});

// Add new address
router.post('/api/addresses', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      title,
      full_name,
      phone,
      city,
      district,
      neighborhood,
      address_line,
      postal_code,
      is_default
    } = req.body;

    // Validation
    if (!title || !full_name || !phone || !city || !district || !address_line) {
      return res.status(400).json({ error: 'Zorunlu alanları doldurunuz' });
    }

    // Phone validation (Turkish phone number)
    const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
    const cleanPhone = phone.replace(/\s/g, '').replace(/[-()+]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ error: 'Geçerli bir telefon numarası giriniz' });
    }

    const result = await pool.query(
      `INSERT INTO addresses 
       (user_id, title, full_name, phone, city, district, neighborhood, address_line, postal_code, is_default)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [userId, title, full_name, cleanPhone, city, district, neighborhood, address_line, postal_code, is_default || false]
    );

    res.status(201).json({
      message: 'Adres başarıyla eklendi',
      address: result.rows[0]
    });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ error: 'Adres eklenirken hata oluştu' });
  }
});

// Update address
router.put('/api/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;
    const {
      title,
      full_name,
      phone,
      city,
      district,
      neighborhood,
      address_line,
      postal_code,
      is_default
    } = req.body;

    // Check if address belongs to user
    const checkResult = await pool.query(
      'SELECT * FROM addresses WHERE id = $1 AND user_id = $2',
      [addressId, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Adres bulunamadı' });
    }

    const result = await pool.query(
      `UPDATE addresses 
       SET title = $1, full_name = $2, phone = $3, city = $4, district = $5, 
           neighborhood = $6, address_line = $7, postal_code = $8, is_default = $9,
           updated_at = NOW()
       WHERE id = $10 AND user_id = $11
       RETURNING *`,
      [title, full_name, phone, city, district, neighborhood, address_line, postal_code, is_default, addressId, userId]
    );

    res.json({
      message: 'Adres güncellendi',
      address: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ error: 'Adres güncellenirken hata oluştu' });
  }
});

// Delete address
router.delete('/api/addresses/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    const result = await pool.query(
      'DELETE FROM addresses WHERE id = $1 AND user_id = $2 RETURNING *',
      [addressId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Adres bulunamadı' });
    }

    res.json({ message: 'Adres silindi' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ error: 'Adres silinirken hata oluştu' });
  }
});

// Set default address
router.patch('/api/addresses/:id/default', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const addressId = req.params.id;

    // First, unset all default addresses for this user
    await pool.query(
      'UPDATE addresses SET is_default = FALSE WHERE user_id = $1',
      [userId]
    );

    // Then set the selected address as default
    const result = await pool.query(
      'UPDATE addresses SET is_default = TRUE WHERE id = $1 AND user_id = $2 RETURNING *',
      [addressId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Adres bulunamadı' });
    }

    res.json({
      message: 'Varsayılan adres güncellendi',
      address: result.rows[0]
    });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ error: 'Varsayılan adres güncellenirken hata oluştu' });
  }
});

// Guest checkout - save temporary checkout info
router.post('/api/guest-checkout', async (req, res) => {
  try {
    const {
      session_id,
      email,
      full_name,
      phone,
      city,
      district,
      neighborhood,
      address_line,
      postal_code,
      order_notes
    } = req.body;

    // Validation
    if (!session_id || !email || !full_name || !phone || !city || !district || !address_line) {
      return res.status(400).json({ error: 'Zorunlu alanları doldurunuz' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Geçerli bir e-posta adresi giriniz' });
    }

    // Phone validation
    const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
    const cleanPhone = phone.replace(/\s/g, '').replace(/[-()+]/g, '');
    if (!phoneRegex.test(cleanPhone)) {
      return res.status(400).json({ error: 'Geçerli bir telefon numarası giriniz' });
    }

    const result = await pool.query(
      `INSERT INTO guest_checkouts 
       (session_id, email, full_name, phone, city, district, neighborhood, address_line, postal_code, order_notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (session_id) 
       DO UPDATE SET 
         email = EXCLUDED.email,
         full_name = EXCLUDED.full_name,
         phone = EXCLUDED.phone,
         city = EXCLUDED.city,
         district = EXCLUDED.district,
         neighborhood = EXCLUDED.neighborhood,
         address_line = EXCLUDED.address_line,
         postal_code = EXCLUDED.postal_code,
         order_notes = EXCLUDED.order_notes,
         created_at = NOW()
       RETURNING *`,
      [session_id, email, full_name, cleanPhone, city, district, neighborhood, address_line, postal_code, order_notes]
    );

    res.status(201).json({
      message: 'Teslimat bilgileri kaydedildi',
      checkout: result.rows[0]
    });
  } catch (error) {
    console.error('Error saving guest checkout:', error);
    res.status(500).json({ error: 'Bilgiler kaydedilirken hata oluştu' });
  }
});

module.exports = router;