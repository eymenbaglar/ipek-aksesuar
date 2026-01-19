const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

// Pool'u parametre olarak alacağız, kendi pool oluşturmayacağız
let pool = null;

// Pool'u set etmek için fonksiyon
const setPool = (dbPool) => {
  pool = dbPool;
};

// SMTP transporter oluştur
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// HTML template'ini oku ve placeholder'ları değiştir
const loadTemplate = async (templateName, replacements) => {
  try {
    const templatePath = path.join(__dirname, '..', 'email-templates', templateName);
    let template = await fs.readFile(templatePath, 'utf-8');

    // Tüm placeholder'ları değiştir
    Object.keys(replacements).forEach(key => {
      const placeholder = `{{${key}}}`;
      template = template.replace(new RegExp(placeholder, 'g'), replacements[key]);
    });

    return template;
  } catch (error) {
    console.error('Template okuma hatası:', error);
    throw error;
  }
};

// Tarih formatla (DD.MM.YYYY HH:MM)
const formatDate = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
};

// Fiyat formatla (₺1.234,56)
const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price);
};

// Order items'ı HTML table row'larına dönüştür
const formatOrderItems = (items) => {
  return items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">
        <div style="display: flex; gap: 10px; align-items: center;">
          ${item.product_image ? `<img src="${item.product_image}" alt="${item.product_name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;">` : ''}
          <div>
            <strong style="color: #2c3e50; font-size: 14px;">${item.product_name}</strong>
            ${item.product_description ? `<p style="margin: 5px 0 0 0; color: #6c757d; font-size: 12px;">${item.product_description}</p>` : ''}
          </div>
        </div>
      </td>
      <td style="padding: 12px; text-align: center; color: #2c3e50; font-size: 14px; border-bottom: 1px solid #e9ecef;">
        ${item.quantity}
      </td>
      <td style="padding: 12px; text-align: right; color: #2c3e50; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e9ecef;">
        ${formatPrice(item.price)}
      </td>
    </tr>
  `).join('');
};

// Order items'ı basit liste formatında (kargo bildirimi için)
const formatOrderItemsSimple = (items) => {
  return items.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e9ecef;">
        <strong style="color: #2c3e50; font-size: 14px;">${item.product_name}</strong>
      </td>
      <td style="padding: 12px; text-align: center; color: #2c3e50; font-size: 14px; border-bottom: 1px solid #e9ecef;">
        ${item.quantity}
      </td>
    </tr>
  `).join('');
};

// Email log kaydet
const logEmail = async (userId, orderId, emailType, recipientEmail, subject, status, errorMessage = null, messageId = null) => {
  try {
    await pool.query(
      `INSERT INTO email_logs (user_id, order_id, email_type, recipient_email, subject, status, error_message, message_id, sent_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())`,
      [userId, orderId, emailType, recipientEmail, subject, status, errorMessage, messageId]
    );
  } catch (error) {
    console.error('Email log kaydetme hatası:', error);
    // Log hatası email gönderimini engellememeli
  }
};

// Sipariş onay emaili gönder
const sendOrderConfirmationEmail = async (order, user, orderItems) => {
  try {
    const transporter = createTransporter();

    // Adres objesini düzenle
    const address = typeof order.delivery_address === 'string'
      ? JSON.parse(order.delivery_address)
      : order.delivery_address;

    const fullAddress = `${address.address || ''}, ${address.district || ''}, ${address.city || ''} - ${address.postalCode || ''}`;

    // Template için replacement değerleri hazırla
    const replacements = {
      ORDER_NUMBER: order.order_number,
      ORDER_DATE: formatDate(order.created_at),
      TOTAL_PRICE: formatPrice(order.total_price),
      SUBTOTAL: formatPrice(order.subtotal),
      SHIPPING_FEE: formatPrice(order.shipping_fee),
      CUSTOMER_NAME: `${user.name} ${user.surname}`,
      DELIVERY_ADDRESS: fullAddress,
      ORDER_ITEMS: formatOrderItems(orderItems)
    };

    // HTML template'ini yükle
    const htmlContent = await loadTemplate('order-confirmation.html', replacements);

    // Email gönder
    const mailOptions = {
      from: `"İpek Aksesuar" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `Sipariş Onayı - ${order.order_number}`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Sipariş onay emaili gönderildi:', info.messageId);

    // Email log kaydet (başarılı)
    await logEmail(
      order.user_id,
      order.id,
      'order_confirmation',
      user.email,
      mailOptions.subject,
      'sent',
      null,
      info.messageId
    );

    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Email gönderme hatası:', error);

    // Email log kaydet (başarısız)
    await logEmail(
      order.user_id,
      order.id,
      'order_confirmation',
      user.email,
      `Sipariş Onayı - ${order.order_number}`,
      'failed',
      error.message,
      null
    );

    // Email hatası siparişi etkilememeli, sadece log'la
    return { success: false, error: error.message };
  }
};

// Kargo bildirim emaili gönder
const sendOrderShippedEmail = async (order, user, orderItems) => {
  try {
    const transporter = createTransporter();

    // Adres objesini düzenle
    const address = typeof order.delivery_address === 'string'
      ? JSON.parse(order.delivery_address)
      : order.delivery_address;

    const fullAddress = `${address.address || ''}, ${address.district || ''}, ${address.city || ''} - ${address.postalCode || ''}`;

    // Template için replacement değerleri hazırla
    const replacements = {
      TRACKING_NUMBER: order.tracking_number || 'Henüz eklenmedi',
      CARGO_COMPANY: order.cargo_company || 'Kargo Şirketi',
      ORDER_NUMBER: order.order_number,
      SHIPPED_DATE: formatDate(order.shipped_at || new Date()),
      CUSTOMER_NAME: `${user.name} ${user.surname}`,
      DELIVERY_ADDRESS: fullAddress,
      ORDER_ITEMS: formatOrderItemsSimple(orderItems)
    };

    // HTML template'ini yükle
    const htmlContent = await loadTemplate('order-shipped.html', replacements);

    // Email gönder
    const mailOptions = {
      from: `"İpek Aksesuar" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: `Siparişiniz Kargoya Verildi - ${order.order_number}`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Kargo bildirim emaili gönderildi:', info.messageId);

    // Email log kaydet (başarılı)
    await logEmail(
      order.user_id,
      order.id,
      'order_shipped',
      user.email,
      mailOptions.subject,
      'sent',
      null,
      info.messageId
    );

    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Email gönderme hatası:', error);

    // Email log kaydet (başarısız)
    await logEmail(
      order.user_id,
      order.id,
      'order_shipped',
      user.email,
      `Siparişiniz Kargoya Verildi - ${order.order_number}`,
      'failed',
      error.message,
      null
    );

    return { success: false, error: error.message };
  }
};

// Doğrulama emaili gönder
const sendVerificationEmail = async (user, verificationToken) => {
  try {
    const transporter = createTransporter();

    // Doğrulama URL'i oluştur
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/email-dogrulama?token=${verificationToken}`;

    // Template için replacement değerleri hazırla
    const replacements = {
      USER_NAME: user.name,
      VERIFICATION_URL: verificationUrl,
      CURRENT_YEAR: new Date().getFullYear()
    };

    // HTML template'ini yükle
    const htmlContent = await loadTemplate('verification-email.html', replacements);

    // Email gönder
    const mailOptions = {
      from: `"İpek Aksesuar" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Email Adresinizi Doğrulayın - İpek Aksesuar',
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Doğrulama emaili gönderildi:', info.messageId);

    // Email log kaydet (başarılı)
    if (pool) {
      await logEmail(
        user.id,
        null,
        'email_verification',
        user.email,
        mailOptions.subject,
        'sent',
        null,
        info.messageId
      );
    }

    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Email gönderme hatası:', error);

    // Email log kaydet (başarısız)
    if (pool) {
      await logEmail(
        user.id,
        null,
        'email_verification',
        user.email,
        'Email Adresinizi Doğrulayın - İpek Aksesuar',
        'failed',
        error.message,
        null
      );
    }

    return { success: false, error: error.message };
  }
};

// Şifre sıfırlama emaili gönder
const sendPasswordResetEmail = async (user, resetToken) => {
  try {
    const transporter = createTransporter();

    // Şifre sıfırlama URL'i oluştur
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/sifre-sifirlama?token=${resetToken}`;

    // Template için replacement değerleri hazırla
    const replacements = {
      USER_NAME: user.name,
      RESET_URL: resetUrl,
      CURRENT_YEAR: new Date().getFullYear()
    };

    // HTML template'ini yükle
    const htmlContent = await loadTemplate('password-reset.html', replacements);

    // Email gönder
    const mailOptions = {
      from: `"İpek Aksesuar" <${process.env.SMTP_USER}>`,
      to: user.email,
      subject: 'Şifre Sıfırlama Talebi - İpek Aksesuar',
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Şifre sıfırlama emaili gönderildi:', info.messageId);

    // Email log kaydet (başarılı)
    if (pool) {
      await logEmail(
        user.id,
        null,
        'password_reset',
        user.email,
        mailOptions.subject,
        'sent',
        null,
        info.messageId
      );
    }

    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('❌ Email gönderme hatası:', error);

    // Email log kaydet (başarısız)
    if (pool) {
      await logEmail(
        user.id,
        null,
        'password_reset',
        user.email,
        'Şifre Sıfırlama Talebi - İpek Aksesuar',
        'failed',
        error.message,
        null
      );
    }

    return { success: false, error: error.message };
  }
};

module.exports = {
  setPool,
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendVerificationEmail,
  sendPasswordResetEmail
};
