import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import './Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { syncGuestCart } = useCart();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      // Sync guest cart to database after successful login
      await syncGuestCart();
      navigate('/');
    } else {
      // Email doğrulanmamışsa özel mesaj göster
      if (result.errorCode === 'EMAIL_NOT_VERIFIED') {
        setError(
          result.error + ' Email gelen kutunuzu kontrol edin veya doğrulama sayfasından yeni email isteyin.'
        );
      } else {
        setError(result.error || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      }
    }

    setLoading(false);
  };

  return (
    <>
    <Helmet>
      <title>Giriş Yap | İpek Aksesuar</title>
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Hoş Geldiniz</h1>
          <p className="auth-subtitle">Hesabınıza giriş yapın</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
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
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifrenizi girin"
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            <Link to="/sifremi-unuttum" className="auth-link">
              Şifremi Unuttum
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
    </>
  );
}

export default Login;
