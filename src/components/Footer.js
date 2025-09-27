import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer style={{
      backgroundColor: '#2c3e50',
      color: 'white',
      marginTop: '80px',
      padding: '60px 0 20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        {/* Üst Kısım - 4 Sütun */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          
          {/* 1. Sütun - Şirket Bilgisi */}
          <div>
            <h3 style={{ 
              marginBottom: '20px', 
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#fff'
            }}>
              İpek Aksesuar
            </h3>
            <p style={{ 
              lineHeight: '1.8', 
              color: '#bdc3c7',
              marginBottom: '10px' 
            }}>
              Premium kalite ipek ürünleri ile hayatınıza şıklık katıyoruz.
            </p>
            <p style={{ color: '#bdc3c7', fontSize: '14px' }}>
              {/* BURAYA ŞİRKET SLOGANI YAZIN */}
              "Zarafet ve Kalitenin Buluştuğu Nokta"
            </p>
          </div>

          {/* 2. Sütun - İletişim Bilgileri */}
          <div>
            <h4 style={{ 
              marginBottom: '20px', 
              fontSize: '18px',
              color: '#fff'
            }}>
              📞 İletişim
            </h4>
            <div style={{ color: '#bdc3c7' }}>
              <p style={{ marginBottom: '10px' }}>
                <strong>Telefon:</strong><br />
                {/* BURAYA TELEFON NUMARASI YAZIN */}
                +90 555 123 45 67
              </p>
              <p style={{ marginBottom: '10px' }}>
                <strong>WhatsApp:</strong><br />
                {/* BURAYA WHATSAPP NUMARASI YAZIN */}
                +90 555 123 45 67
              </p>
              <p style={{ marginBottom: '10px' }}>
                <strong>Email:</strong><br />
                {/* BURAYA EMAIL ADRESİ YAZIN */}
                info@ipekaksesuar.com
              </p>
              <p>
                <strong>Çalışma Saatleri:</strong><br />
                {/* BURAYA ÇALIŞMA SAATLERİ YAZIN */}
                Pazartesi - Cumartesi: 09:00 - 19:00<br />
                Pazar: 12:00 - 18:00
              </p>
            </div>
          </div>

          {/* 3. Sütun - Hızlı Linkler */}
          <div>
            <h4 style={{ 
              marginBottom: '20px', 
              fontSize: '18px',
              color: '#fff'
            }}>
              🔗 Hızlı Erişim
            </h4>
            <ul style={{ 
              listStyle: 'none', 
              padding: 0,
              color: '#bdc3c7'
            }}>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/hakkimizda" style={{ 
                  color: '#bdc3c7', 
                  textDecoration: 'none',
                  transition: 'color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.color = '#3498db'}
                onMouseOut={(e) => e.target.style.color = '#bdc3c7'}>
                  → Hakkımızda
                </Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/urunler" style={{ 
                  color: '#bdc3c7', 
                  textDecoration: 'none',
                  transition: 'color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.color = '#3498db'}
                onMouseOut={(e) => e.target.style.color = '#bdc3c7'}>
                  → Ürünlerimiz
                </Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/sss" style={{ 
                  color: '#bdc3c7', 
                  textDecoration: 'none',
                  transition: 'color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.color = '#3498db'}
                onMouseOut={(e) => e.target.style.color = '#bdc3c7'}>
                  → Sıkça Sorulan Sorular
                </Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/iade-degisim" style={{ 
                  color: '#bdc3c7', 
                  textDecoration: 'none',
                  transition: 'color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.color = '#3498db'}
                onMouseOut={(e) => e.target.style.color = '#bdc3c7'}>
                  → İade ve Değişim
                </Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/gizlilik" style={{ 
                  color: '#bdc3c7', 
                  textDecoration: 'none',
                  transition: 'color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.color = '#3498db'}
                onMouseOut={(e) => e.target.style.color = '#bdc3c7'}>
                  → Gizlilik Politikası
                </Link>
              </li>
              <li style={{ marginBottom: '10px' }}>
                <Link to="/iletisim" style={{ 
                  color: '#bdc3c7', 
                  textDecoration: 'none',
                  transition: 'color 0.3s'
                }}
                onMouseOver={(e) => e.target.style.color = '#3498db'}
                onMouseOut={(e) => e.target.style.color = '#bdc3c7'}>
                  → İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* 4. Sütun - Sosyal Medya ve Adres */}
          <div>
            <h4 style={{ 
              marginBottom: '20px', 
              fontSize: '18px',
              color: '#fff'
            }}>
              📍 Adres & Sosyal Medya
            </h4>
            
            {/* Adres */}
            <div style={{ marginBottom: '20px', color: '#bdc3c7' }}>
              <strong>Mağaza Adresi:</strong><br />
              {/* BURAYA FİZİKİ ADRES YAZIN */}
              Örnek Mahallesi, İpek Sokak No:1<br />
              Şişli / İstanbul
            </div>

            {/* Sosyal Medya Linkleri */}
            <div style={{ marginBottom: '20px' }}>
              <p style={{ marginBottom: '15px', color: '#fff' }}>
                <strong>Bizi Takip Edin:</strong>
              </p>
              <div style={{ display: 'flex', gap: '15px' }}>
                {/* INSTAGRAM */}
                <a 
                  href="https://instagram.com/BURAYA_INSTAGRAM_KULLANICI_ADI" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#E4405F',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    color: 'white',
                    transition: 'transform 0.3s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  title="Instagram"
                >
                  <span style={{ fontSize: '20px' }}>📷</span>
                </a>

                {/* FACEBOOK */}
                <a 
                  href="https://facebook.com/BURAYA_FACEBOOK_SAYFA_ADI" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#1877F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    color: 'white',
                    transition: 'transform 0.3s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  title="Facebook"
                >
                  <span style={{ fontSize: '20px' }}>f</span>
                </a>

                {/* TWITTER/X */}
                <a 
                  href="https://twitter.com/BURAYA_TWITTER_KULLANICI_ADI" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#1DA1F2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    color: 'white',
                    transition: 'transform 0.3s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  title="Twitter"
                >
                  <span style={{ fontSize: '20px' }}>𝕏</span>
                </a>

                {/* YOUTUBE */}
                <a 
                  href="https://youtube.com/@BURAYA_YOUTUBE_KANAL_ADI" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: '#FF0000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textDecoration: 'none',
                    color: 'white',
                    transition: 'transform 0.3s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  title="YouTube"
                >
                  <span style={{ fontSize: '16px' }}>▶</span>
                </a>
              </div>
            </div>

            {/* Ödeme Yöntemleri */}
            <div>
              <p style={{ marginBottom: '10px', color: '#fff' }}>
                <strong>Güvenli Ödeme:</strong>
              </p>
              <div style={{ 
                display: 'flex', 
                gap: '10px',
                flexWrap: 'wrap'
              }}>
                <span style={{ 
                  padding: '5px 10px', 
                  backgroundColor: '#34495e', 
                  borderRadius: '5px',
                  fontSize: '12px'
                }}>
                  💳 Kredi Kartı
                </span>
                <span style={{ 
                  padding: '5px 10px', 
                  backgroundColor: '#34495e', 
                  borderRadius: '5px',
                  fontSize: '12px'
                }}>
                  💰 Havale/EFT
                </span>
                <span style={{ 
                  padding: '5px 10px', 
                  backgroundColor: '#34495e', 
                  borderRadius: '5px',
                  fontSize: '12px'
                }}>
                  📱 İyzico
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Çizgi */}
        <hr style={{ 
          border: 'none', 
          borderTop: '1px solid #34495e', 
          margin: '40px 0 20px' 
        }} />

        {/* En Alt Kısım - Copyright ve Ekstra Bilgiler */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div>
            <p style={{ color: '#95a5a6', fontSize: '14px' }}>
              © 2024 İpek Aksesuar. Tüm hakları saklıdır.
            </p>
            <p style={{ color: '#95a5a6', fontSize: '12px', marginTop: '5px' }}>
              {/* BURAYA VERGİ BİLGİLERİ YAZIN */}
              Vergi No: 123456789 | Mersis No: 0123456789012345
            </p>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <p style={{ color: '#95a5a6', fontSize: '12px' }}>
              {/* BURAYA TASARIMCI/GELİŞTİRİCİ BİLGİSİ */}
              Designed with ❤️ by Eymen
            </p>
            <p style={{ color: '#95a5a6', fontSize: '12px', marginTop: '5px' }}>
              {/* SSL ve GÜVENLİK BİLGİSİ */}
              🔒 SSL Güvenli Alışveriş
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;