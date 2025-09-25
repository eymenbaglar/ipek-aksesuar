import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>İpek Aksesuar</h3>
            <p>Premium kalite ipek ürünler</p>
          </div>
          
          <div className="footer-section">
            <h4>Hızlı Linkler</h4>
            <ul>
              <li><a href="/urunler">Ürünler</a></li>
              <li><a href="/hakkimizda">Hakkımızda</a></li>
              <li><a href="/iletisim">İletişim</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>Müşteri Hizmetleri</h4>
            <ul>
              <li><a href="/iade-degisim">İade ve Değişim</a></li>
              <li><a href="/kargo-bilgisi">Kargo Bilgisi</a></li>
              <li><a href="/gizlilik">Gizlilik Politikası</a></li>
            </ul>
          </div>
          
          <div className="footer-section">
            <h4>İletişim</h4>
            <p>Email: info@ipekaksesuar.com</p>
            <p>Tel: +90 555 123 4567</p>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2024 İpek Aksesuar. Tüm hakları saklıdır.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;