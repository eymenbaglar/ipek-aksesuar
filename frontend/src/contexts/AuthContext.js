import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // LocalStorage'dan user bilgisini al
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('User parse error:', error);
      }
    }
    setIsInitialized(true);
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      console.log('Login response:', data); // Debug
      
      if (response.ok && data.token) {
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true };
      } else {
        return {
          success: false,
          error: data.error || 'Giriş başarısız',
          errorCode: data.errorCode
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Bağlantı hatası' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('Register isteği gönderiliyor:', userData); // Debug
      
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      console.log('Register response:', data); // Debug
      
      // success field'ını kontrol et
      if (response.ok || data.success) {
        return { 
          success: true, 
          message: data.message || 'Kayıt başarılı!' 
        };
      } else {
        return { 
          success: false, 
          error: data.error || 'Kayıt başarısız' 
        };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        error: 'Bağlantı hatası: ' + error.message 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isInitialized }}>
      {children}
    </AuthContext.Provider>
  );
};