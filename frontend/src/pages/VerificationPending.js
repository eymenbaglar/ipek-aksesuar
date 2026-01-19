import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Auth.css';

function VerificationPending() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);

  const handleResendVerification = async (e) => {
    e.preventDefault();

    if (!email) {
      alert('Lütfen email adresinizi girin');
      return;
    }

    setResending(true);

    try {
      const response = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        setEmail('');
      } else {
        alert(data.error || 'Email gönderilemedi');
      }
    } catch (error) {
      console.error('Resend error:', error);
      alert('Email gönderme sırasında bir hata oluştu');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Email Doğrulama Gerekli</h1>
        </div>

        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>
            📧
          </div>

          <h2 style={{ color: '#667eea', marginBottom: '15px', fontSize: '22px' }}>
            Kayıt İşleminiz Tamamlandı!
          </h2>

          <p style={{ color: '#6c757d', fontSize: '16px', lineHeight: '1.6', marginBottom: '20px' }}>
            Email adresinize bir doğrulama linki gönderdik.
            <br />
            Lütfen gelen kutunuzu kontrol edin ve doğrulama linkine tıklayın.
          </p>

          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '30px',
            textAlign: 'left'
          }}>
            <p style={{
              color: '#495057',
              fontSize: '14px',
              marginBottom: '10px',
              fontWeight: '500'
            }}>
              ℹ️ Bilgilendirme:
            </p>
            <ul style={{
              margin: 0,
              paddingLeft: '20px',
              color: '#6c757d',
              fontSize: '13px',
              lineHeight: '1.8'
            }}>
              <li>Email birkaç dakika içinde gelecektir</li>
              <li>Spam klasörünüzü de kontrol edin</li>
              <li>Email doğrulaması yapmadan giriş yapamazsınız</li>
              <li>Doğrulama linki 24 saat geçerlidir</li>
            </ul>
          </div>

          <div style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <p style={{
              color: '#495057',
              fontSize: '14px',
              marginBottom: '15px',
              fontWeight: '500'
            }}>
              Email almadınız mı?
            </p>

            <form onSubmit={handleResendVerification}>
              <div className="form-group" style={{ marginBottom: '15px' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email adresinizi girin"
                  required
                  disabled={resending}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '5px',
                    border: '1px solid #dee2e6',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={resending}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: resending ? 'not-allowed' : 'pointer',
                  opacity: resending ? 0.6 : 1
                }}
              >
                {resending ? 'Gönderiliyor...' : 'Doğrulama Emailini Tekrar Gönder'}
              </button>
            </form>
          </div>

          <button
            onClick={() => navigate('/giris')}
            style={{
              padding: '12px 30px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              fontSize: '14px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Giriş Sayfasına Dön
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerificationPending;
