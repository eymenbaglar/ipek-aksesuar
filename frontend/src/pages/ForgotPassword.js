// pages/ForgotPassword.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    
    try {
      const response = await api.post('/auth/forgot-password', { email });
      setMessage(response.data.message || 'Şifre sıfırlama emaili gönderildi. Lütfen email kutunuzu kontrol edin.');
      setEmail(''); // Clear the email field after success
    } catch (error) {
      setError(error.response?.data?.error || 'Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Şifremi Unuttum</h2>
        
        <p className="auth-description">
          Email adresinizi girin, size şifre sıfırlama linki gönderelim.
        </p>
        
        {error && <div className="error-message">{error}</div>}
        {message && <div className="success-message">{message}</div>}
        
        {!message && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Adresi:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="ornek@email.com"
                disabled={loading}
              />
            </div>
            
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Linki Gönder'}
            </button>
          </form>
        )}
        
        <div className="auth-links">
          <Link to="/giris">← Giriş sayfasına dön</Link>
          <p>
            Henüz hesabınız yok mu? <Link to="/kayit">Üye Ol</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;