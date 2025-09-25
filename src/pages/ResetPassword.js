import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Geçersiz sıfırlama linki');
    }
  }, [token]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalı');
      return;
    }
    
    try {
      const response = await api.post('/auth/reset-password', {
        token,
        newPassword: formData.newPassword
      });
      setSuccess(response.data.message || 'Şifre başarıyla güncellendi');
      setTimeout(() => navigate('/giris'), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Şifre güncellenemedi');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Yeni Şifre Oluştur</h2>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Yeni Şifre:</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              required
              placeholder="En az 6 karakter"
            />
          </div>
          
          <div className="form-group">
            <label>Şifre Tekrar:</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Şifreyi tekrar girin"
            />
          </div>
          
          <button type="submit" className="submit-btn">
            Şifreyi Güncelle
          </button>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;