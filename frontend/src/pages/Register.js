import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Auth.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState('');
  const [agreements, setAgreements] = useState({
    termsOfService: false,
    distanceSales: false,
    kvkk: false
  });
  const { register } = useAuth();
  const navigate = useNavigate();

  const checkPasswordStrength = (password) => {
    if (password.length === 0) return '';
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Check password strength
    if (name === 'password') {
      setPasswordStrength(checkPasswordStrength(value));
    }
  };

  const handleAgreementChange = (e) => {
    const { name, checked } = e.target;
    setAgreements({
      ...agreements,
      [name]: checked
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Form validation
    if (!formData.name || !formData.surname || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Lütfen tüm alanları doldurun');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor. Lütfen kontrol edin.');
      setLoading(false);
      return;
    }

    if (!agreements.termsOfService || !agreements.distanceSales || !agreements.kvkk) {
      setError('Devam etmek için sözleşmeleri onaylamanız gerekmektedir');
      setLoading(false);
      return;
    }

    // Remove confirmPassword before sending
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (result.success) {
      alert(result.message || 'Kayıt başarılı! Giriş yapabilirsiniz.');
      navigate('/giris');
    } else {
      setError(result.error || 'Kayıt başarısız. Lütfen tekrar deneyin.');
    }

    setLoading(false);
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'Zayıf şifre';
      case 'medium':
        return 'Orta güçlükte';
      case 'strong':
        return 'Güçlü şifre';
      default:
        return '';
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Üye Olun</h1>
          <p className="auth-subtitle">Hemen hesap oluşturun ve alışverişe başlayın</p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Ad</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Adınız"
                required
                disabled={loading}
                autoComplete="given-name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="surname">Soyad</label>
              <input
                id="surname"
                type="text"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                placeholder="Soyadınız"
                required
                disabled={loading}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">E-posta Adresi</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="ornek@email.com"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifre (en az 6 karakter)</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Güçlü bir şifre oluşturun"
              required
              minLength="6"
              disabled={loading}
              autoComplete="new-password"
            />
            {passwordStrength && (
              <div className={`password-strength ${passwordStrength}`}>
                {getPasswordStrengthText()}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Şifre Tekrar</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Şifrenizi tekrar girin"
              required
              minLength="6"
              disabled={loading}
              autoComplete="new-password"
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <div className="password-strength weak">
                Şifreler eşleşmiyor
              </div>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && formData.confirmPassword.length >= 6 && (
              <div className="password-strength strong">
                Şifreler eşleşiyor ✓
              </div>
            )}
          </div>

          <div className="agreements-section">
            <div className="agreement-checkbox">
              <input
                type="checkbox"
                id="termsOfService"
                name="termsOfService"
                checked={agreements.termsOfService}
                onChange={handleAgreementChange}
                disabled={loading}
              />
              <label htmlFor="termsOfService">
                <Link to="/kullanim-kosullari" target="_blank" className="agreement-link">
                  Kullanım Koşulları
                </Link>
                'nı okudum ve kabul ediyorum
              </label>
            </div>

            <div className="agreement-checkbox">
              <input
                type="checkbox"
                id="distanceSales"
                name="distanceSales"
                checked={agreements.distanceSales}
                onChange={handleAgreementChange}
                disabled={loading}
              />
              <label htmlFor="distanceSales">
                <Link to="/mesafeli-satis-sozlesmesi" target="_blank" className="agreement-link">
                  Mesafeli Satış Sözleşmesi
                </Link>
                'ni okudum ve kabul ediyorum
              </label>
            </div>

            <div className="agreement-checkbox">
              <input
                type="checkbox"
                id="kvkk"
                name="kvkk"
                checked={agreements.kvkk}
                onChange={handleAgreementChange}
                disabled={loading}
              />
              <label htmlFor="kvkk">
                <Link to="/kvkk" target="_blank" className="agreement-link">
                  KVKK Aydınlatma Metni
                </Link>
                'ni okudum ve kabul ediyorum
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Kayıt Yapılıyor...' : 'Üye Ol'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-footer-text">
            Zaten hesabınız var mı?{' '}
            <Link to="/giris" className="auth-link">
              Giriş Yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
