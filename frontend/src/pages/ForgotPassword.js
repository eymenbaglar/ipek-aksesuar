import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(data.message);
        setEmail('');

        // 3 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          navigate('/giris');
        }, 3000);
      } else {
        setError(data.error || 'Bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Şifremi Unuttum</h1>
          <p className="auth-subtitle">
            Email adresinizi girin, size şifre sıfırlama linki gönderelim
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {success && (
          <div style={{
            padding: '15px',
            marginBottom: '20px',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '5px',
            border: '1px solid #c3e6cb',
            textAlign: 'center'
          }}>
            ✅ {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">E-posta Adresi</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              required
              disabled={loading || success}
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading || success}
          >
            {loading ? 'Gönderiliyor...' : 'Şifre Sıfırlama Linki Gönder'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            <Link to="/giris" className="auth-link">
              ← Giriş sayfasına dön
            </Link>
          </p>
          <p className="auth-footer-text">
            Hesabınız yok mu?{' '}
            <Link to="/kayit" className="auth-link">
              Üye Olun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;