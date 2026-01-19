import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './Auth.css';

function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, verifying, success, error
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    // searchParams'ın yüklenmesini bekle
    const timer = setTimeout(() => {
      const token = searchParams.get('token');

      if (!token) {
        // Token yoksa hata göster
        setStatus('error');
        setMessage('Doğrulama token\'ı bulunamadı. Lütfen email\'inizdeki linki kullanın.');
        return;
      }

      // Token varsa doğrulamaya başla
      setStatus('verifying');
      verifyEmail(token);
    }, 100);

    return () => clearTimeout(timer);
    // eslint-disable-next-line
  }, []);

  const verifyEmail = async (token) => {
    try {
      const response = await fetch(`http://localhost:5000/api/auth/verify-email?token=${token}`);
      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);

        // 3 saniye sonra login sayfasına yönlendir
        setTimeout(() => {
          navigate('/giris');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.error || 'Doğrulama başarısız');
      }
    } catch (error) {
      console.error('Verification error:', error);
      setStatus('error');
      setMessage('Doğrulama sırasında bir hata oluştu');
    }
  };

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
          <h1 className="auth-title">Email Doğrulama</h1>
        </div>

        {(status === 'loading' || status === 'verifying') && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div className="loading-spinner" style={{ fontSize: '48px', marginBottom: '20px' }}>
              ⏳
            </div>
            <p style={{ color: '#6c757d', fontSize: '16px' }}>
              {status === 'loading' ? 'Yükleniyor...' : 'Email adresiniz doğrulanıyor...'}
            </p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>
              ✅
            </div>
            <h2 style={{ color: '#28a745', marginBottom: '15px' }}>
              Başarılı!
            </h2>
            <p style={{ color: '#6c757d', fontSize: '16px', marginBottom: '10px' }}>
              {message}
            </p>
            <p style={{ color: '#6c757d', fontSize: '14px' }}>
              Giriş sayfasına yönlendiriliyorsunuz...
            </p>
          </div>
        )}

        {status === 'error' && (
          <>
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>
                ❌
              </div>
              <h2 style={{ color: '#dc3545', marginBottom: '15px' }}>
                Doğrulama Başarısız
              </h2>
              <p style={{ color: '#6c757d', fontSize: '16px', marginBottom: '30px' }}>
                {message}
              </p>

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
                  Doğrulama emailinizi almadınız mı?
                </p>

                <form onSubmit={handleResendVerification}>
                  <div className="form-group" style={{ marginBottom: '15px' }}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email adresiniz"
                      required
                      disabled={resending}
                      style={{
                        width: '100%',
                        padding: '12px',
                        borderRadius: '5px',
                        border: '1px solid #dee2e6',
                        fontSize: '14px'
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
                  padding: '10px 20px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Giriş Sayfasına Dön
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default EmailVerification;
