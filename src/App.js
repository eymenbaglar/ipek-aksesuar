import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ProductList from './pages/ProductList';
import Footer from './components/Footer'; 
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import ProductDetail from './pages/ProductDetail';
import SearchResults from './pages/SearchResults';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            minHeight: '100vh' 
          }}>
            <Navbar />
            
            {/* Main content - flex: 1 ile footer'ı aşağı iter */}
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/urunler" element={<ProductList />} />
                <Route path="/urun/:id" element={<ProductDetail />} />
                <Route path="/sepet" element={<Cart />} />
                <Route path="/giris" element={<Login />} />
                <Route path="/kayit" element={<Register />} />
                <Route path="/profil" element={<Profile />} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminPanel />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/arama" element={<SearchResults />} />
              </Routes>
            </main>
            
            <Footer />  {/* Footer'ı buraya ekleyin */}
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;