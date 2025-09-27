import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    // Form validation
    if (!formData.name || !formData.surname || !formData.email || !formData.password) {
      setError('Tüm alanları doldurun');
      setLoading(false);
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Şifre en az 6 karakter olmalı');
      setLoading(false);
      return;
    }
    
    console.log('Form gönderiliyor:', formData); // Debug
    
    const result = await register(formData);
    
    console.log('Register sonucu:', result); // Debug
    
    if (result.success) {
      alert(result.message || 'Kayıt başarılı! Giriş yapabilirsiniz.');
      navigate('/giris');
    } else {
      setError(result.error || 'Kayıt başarısız');
    }
    
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px' }}>
      <h2>Üye Ol</h2>
      
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          borderRadius: '5px',
          marginBottom: '15px' 
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Ad:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Soyad:</label>
          <input
            type="text"
            name="surname"
            value={formData.surname}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label>Şifre (en az 6 karakter):</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
            required
            minLength="6"
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#999' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Kayıt yapılıyor...' : 'Kayıt Ol'}
        </button>
      </form>
      
      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        Zaten hesabınız var mı? <Link to="/giris">Giriş Yap</Link>
      </p>
    </div>
  );
}

export default Register;