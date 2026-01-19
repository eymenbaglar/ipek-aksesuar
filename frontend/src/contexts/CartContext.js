import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isInitialized } = useAuth();

  // Load cart from database when user logs in
  const loadCartFromDatabase = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data.cartItems || []);
      }
    } catch (error) {
      console.error('Load cart error:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load cart when auth initializes
  useEffect(() => {
    if (isInitialized) {
      if (user) {
        loadCartFromDatabase();
      } else {
        // Guest user - load from localStorage
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          try {
            setCartItems(JSON.parse(savedCart));
          } catch (error) {
            console.error('Parse cart error:', error);
          }
        }
      }
    }
  }, [user, isInitialized, loadCartFromDatabase]);

  // Save to localStorage for guest users
  useEffect(() => {
    if (!user) {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, user]);

  const addToCart = useCallback(async (product) => {
    if (user) {
      // Logged in - use database
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            productId: product.id,
            quantity: 1
          })
        });

        if (response.ok) {
          await loadCartFromDatabase();
        } else {
          const error = await response.json();
          alert(error.error || 'Sepete eklenirken hata oluştu');
        }
      } catch (error) {
        console.error('Add to cart error:', error);
        alert('Bağlantı hatası');
      }
    } else {
      // Guest - use localStorage
      setCartItems(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) {
          return prev.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        }
        return [...prev, { ...product, quantity: 1 }];
      });
    }
  }, [user, loadCartFromDatabase]);

  const removeFromCart = useCallback(async (productId) => {
    if (user) {
      // Logged in - use database
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/cart/${productId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          await loadCartFromDatabase();
        }
      } catch (error) {
        console.error('Remove from cart error:', error);
      }
    } else {
      // Guest - use localStorage
      setCartItems(prev => prev.filter(item => item.id !== productId));
    }
  }, [user, loadCartFromDatabase]);

  const updateQuantity = useCallback(async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    if (user) {
      // Logged in - use database
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/cart/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ quantity })
        });

        if (response.ok) {
          await loadCartFromDatabase();
        } else {
          const error = await response.json();
          alert(error.error || 'Güncelleme hatası');
        }
      } catch (error) {
        console.error('Update cart error:', error);
      }
    } else {
      // Guest - use localStorage
      setCartItems(prev =>
        prev.map(item =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  }, [user, removeFromCart, loadCartFromDatabase]);

  const clearCart = useCallback(async () => {
    if (user) {
      // Logged in - clear database
      try {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:5000/api/cart', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setCartItems([]);
      } catch (error) {
        console.error('Clear cart error:', error);
      }
    } else {
      // Guest - clear localStorage
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  }, [user]);

  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const price = Number(item.price) || 0;
      return total + (price * item.quantity);
    }, 0);
  }, [cartItems]);

  // Sync guest cart to database on login
  const syncGuestCart = useCallback(async () => {
    const guestCart = localStorage.getItem('cart');
    if (!guestCart || !user) return;

    try {
      const guestItems = JSON.parse(guestCart);
      if (guestItems.length === 0) return;

      const token = localStorage.getItem('token');

      // Add each guest cart item to database
      for (const item of guestItems) {
        await fetch('http://localhost:5000/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            productId: item.id,
            quantity: item.quantity
          })
        });
      }

      // Clear guest cart and reload from database
      localStorage.removeItem('cart');
      await loadCartFromDatabase();
    } catch (error) {
      console.error('Sync guest cart error:', error);
    }
  }, [user, loadCartFromDatabase]);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalPrice,
      loading,
      syncGuestCart
    }}>
      {children}
    </CartContext.Provider>
  );
};