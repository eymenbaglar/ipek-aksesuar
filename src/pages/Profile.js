import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Giriş Yapmalısınız</h2>
        <button onClick={() => navigate('/giris')} style={{
          padding: '10px 20px',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}>
          Giriş Yap
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '20px auto', padding: '20px' }}>
      <h2>Profilim</h2>
      
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px',
        marginTop: '20px'
      }}>
        <h3>Kullanıcı Bilgileri</h3>
        <p><strong>Ad:</strong> {user.name || 'Belirtilmemiş'}</p>
        <p><strong>Soyad:</strong> {user.surname || 'Belirtilmemiş'}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Üyelik Tipi:</strong> {user.role === 'admin' ? 'Yönetici' : 'Standart Üye'}</p>
      </div>
      
      <button
        onClick={() => {
          logout();
          navigate('/');
        }}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#e74c3c',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Çıkış Yap
      </button>
    </div>
  );
}

export default Profile;