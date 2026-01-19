import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import './Auth.css';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setError('Geçersiz şifre sıfırlama linki');
    } else {
      setToken(tokenFromUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);

        // 3 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          navigate('/giris');
        }, 3000);
      } else {
        setError(data.error || 'Şifre sıfırlanamadı. Lütfen tekrar deneyin.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Bağlantı hatası. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div className="loading-spinner" style={{ fontSize: '48px', marginBottom: '20px' }}>
              ⏳
            </div>
            <p style={{ color: '#6c757d', fontSize: '16px' }}>
              Yükleniyor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>
              ✅
            </div>
            <h2 style={{ color: '#28a745', marginBottom: '15px' }}>
              Şifre Güncellendi!
            </h2>
            <p style={{ color: '#6c757d', fontSize: '16px', marginBottom: '10px' }}>
              Şifreniz başarıyla güncellendi.
            </p>
            <p style={{ color: '#6c757d', fontSize: '14px' }}>
              Giriş sayfasına yönlendiriliyorsunuz...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Yeni Şifre Belirle</h1>
          <p className="auth-subtitle">
            Lütfen yeni şifrenizi girin
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="newPassword">Yeni Şifre (en az 6 karakter)</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Yeni şifrenizi girin"
              required
              minLength="6"
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Yeni Şifre Tekrar</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Şifrenizi tekrar girin"
              required
              minLength="6"
              disabled={loading}
              autoComplete="new-password"
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <div style={{
                color: '#dc3545',
                fontSize: '13px',
                marginTop: '5px'
              }}>
                Şifreler eşleşmiyor
              </div>
            )}
            {confirmPassword && newPassword === confirmPassword && confirmPassword.length >= 6 && (
              <div style={{
                color: '#28a745',
                fontSize: '13px',
                marginTop: '5px'
              }}>
                ✓ Şifreler eşleşiyor
              </div>
            )}
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Güncelleniyor...' : 'Şifremi Güncelle'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            <Link to="/giris" className="auth-link">
              ← Giriş sayfasına dön
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;