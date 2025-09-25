import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './Auth.css';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Email adresiniz doğrulanıyor...');

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setStatus('error');
      setMessage('Geçersiz doğrulama linki');
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await api.post('/auth/verify-email', { token });
      setStatus('success');
      setMessage(response.data.message || 'Email adresiniz başarıyla doğrulandı');
      setTimeout(() => navigate('/giris'), 3000);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.error || 'Doğrulama başarısız');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2>Email Doğrulama</h2>
        
        <div className={`message ${status}`}>
          {status === 'verifying' && <div className="spinner"></div>}
          <p>{message}</p>
          {status === 'success' && <p>Giriş sayfasına yönlendiriliyorsunuz...</p>}
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;