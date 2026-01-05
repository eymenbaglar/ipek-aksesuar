import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

function TermsOfService() {
  return (
    <div className="legal-container">
      <Link to="/kayit" className="legal-back-button">
        ← Kayıt Sayfasına Dön
      </Link>

      <div className="legal-header">
        <h1 className="legal-title">Kullanım Koşulları</h1>
        <p className="legal-subtitle">
          MEBS İpek Aksesuar web sitesi kullanım şartları ve koşulları
        </p>
        <span className="legal-last-updated">
          Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
        </span>
      </div>

      <div className="legal-content">
        <div className="legal-section">
          <h2>1. Genel Hükümler</h2>
          <p>
            İşbu Kullanım Koşulları, MEBS İpek Aksesuar ("Şirket") tarafından işletilen
            www.ipekaksesuar.com web sitesinin ("Site") kullanımına ilişkin şartları
            belirlemektedir. Siteyi kullanarak, işbu Kullanım Koşullarını kabul etmiş
            sayılırsınız.
          </p>
          <div className="legal-info-box">
            <p>
              <strong>Önemli:</strong> Bu koşulları kabul etmiyorsanız, lütfen siteyi
              kullanmayınız. Site'yi kullanmaya devam etmeniz, bu koşulları kabul
              ettiğiniz anlamına gelir.
            </p>
          </div>
        </div>

        <div className="legal-section">
          <h2>2. Hizmet Kapsamı</h2>
          <h3>2.1. Sunulan Hizmetler</h3>
          <p>
            MEBS İpek Aksesuar, internet üzerinden ipek ürünleri ve aksesuar satışı
            yapmaktadır. Site üzerinden aşağıdaki hizmetlerden faydalanabilirsiniz:
          </p>
          <ul>
            <li>Ürün katalogunu görüntüleme ve inceleme</li>
            <li>Ürün satın alma ve sipariş verme</li>
            <li>Kullanıcı hesabı oluşturma ve yönetme</li>
            <li>Sipariş takibi ve geçmiş siparişleri görüntüleme</li>
            <li>Müşteri hizmetleri ile iletişim kurma</li>
          </ul>

          <h3>2.2. Hizmet Değişiklikleri</h3>
          <p>
            Şirket, önceden bildirimde bulunmaksızın Site'de sunulan hizmetleri
            değiştirme, askıya alma veya sonlandırma hakkını saklı tutar.
          </p>
        </div>

        <div className="legal-section">
          <h2>3. Kullanıcı Hesabı</h2>
          <h3>3.1. Hesap Oluşturma</h3>
          <p>
            Site'nin bazı özelliklerini kullanabilmek için kullanıcı hesabı
            oluşturmanız gerekmektedir. Hesap oluştururken:
          </p>
          <ul>
            <li>Doğru, güncel ve eksiksiz bilgiler sağlamalısınız</li>
            <li>18 yaşından büyük olmalısınız veya yasal vasi iznine sahip olmalısınız</li>
            <li>Hesap bilgilerinizin güvenliğinden siz sorumlusunuz</li>
            <li>Hesabınızda gerçekleşen tüm faaliyetlerden siz sorumlusunuz</li>
          </ul>

          <h3>3.2. Hesap Güvenliği</h3>
          <p>
            Şifrenizi başkalarıyla paylaşmamalı ve hesabınızın güvenliğini sağlamak için
            gerekli önlemleri almalısınız. Hesabınızın yetkisiz kullanımını fark
            ettiğinizde derhal bize bildirmelisiniz.
          </p>
        </div>

        <div className="legal-section">
          <h2>4. Sipariş ve Satın Alma</h2>
          <h3>4.1. Sipariş Süreci</h3>
          <p>
            Site üzerinden verdiğiniz siparişler, bir satın alma teklifi niteliğindedir.
            Şirket, siparişinizi kabul etme veya reddetme hakkını saklı tutar.
          </p>

          <h3>4.2. Fiyatlar</h3>
          <p>
            Site'de belirtilen fiyatlar Türk Lirası cinsindendir ve KDV dahildir.
            Fiyatlar önceden haber verilmeksizin değiştirilebilir. Ancak, onaylanmış
            siparişlerin fiyatları değişmez.
          </p>

          <h3>4.3. Ödeme</h3>
          <p>
            Ödemeler güvenli ödeme sistemleri üzerinden alınmaktadır. Kabul edilen ödeme
            yöntemleri sipariş aşamasında belirtilmektedir.
          </p>
        </div>

        <div className="legal-section">
          <h2>5. Teslimat</h2>
          <p>
            Ürünler, belirtilen teslimat süreleri içerisinde kargo ile gönderilir.
            Teslimat süreleri tahminidir ve garanti edilmez. Kargo şirketi kaynaklı
            gecikmelerden Şirket sorumlu tutulamaz.
          </p>
        </div>

        <div className="legal-section">
          <h2>6. İptal ve İade</h2>
          <p>
            Mesafeli Satış Sözleşmesi kapsamında, tüketicilerin cayma hakkı bulunmaktadır.
            İptal ve iade koşulları için{' '}
            <Link to="/mesafeli-satis-sozlesmesi">Mesafeli Satış Sözleşmesi</Link>
            'ni inceleyiniz.
          </p>
        </div>

        <div className="legal-section">
          <h2>7. Fikri Mülkiyet Hakları</h2>
          <p>
            Site'de yer alan tüm içerik, görseller, logolar, tasarımlar ve diğer materyaller
            Şirket'in veya lisans verenlerinin mülkiyetindedir. Bu içeriklerin izinsiz
            kopyalanması, çoğaltılması veya kullanılması yasaktır.
          </p>
        </div>

        <div className="legal-section">
          <h2>8. Yasak Faaliyetler</h2>
          <p>Site'yi kullanırken aşağıdaki faaliyetlerde bulunamazsınız:</p>
          <ul>
            <li>Yasalara aykırı herhangi bir amaç için Site'yi kullanmak</li>
            <li>Başkalarının haklarını ihlal etmek</li>
            <li>Virüs, kötü amaçlı yazılım veya zararlı kod yüklemek</li>
            <li>Site'nin güvenliğini tehlikeye atmak</li>
            <li>Otomatik sistemler (bot, spider vb.) kullanarak veri toplamak</li>
            <li>Sahte hesap oluşturmak veya kimlik sahteciliği yapmak</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>9. Sorumluluk Reddi</h2>
          <p>
            Site ve içeriği "olduğu gibi" sunulmaktadır. Şirket, Site'nin kesintisiz,
            hatasız veya güvenli olacağına dair herhangi bir garanti vermemektedir.
          </p>
          <p>
            Şirket, Site'nin kullanımından kaynaklanan doğrudan veya dolaylı zararlardan
            sorumlu tutulamaz.
          </p>
        </div>

        <div className="legal-section">
          <h2>10. Değişiklikler</h2>
          <p>
            Şirket, işbu Kullanım Koşullarını dilediği zaman değiştirme hakkını saklı tutar.
            Değişiklikler Site'de yayınlandığı anda yürürlüğe girer. Site'yi kullanmaya
            devam etmeniz, değişiklikleri kabul ettiğiniz anlamına gelir.
          </p>
        </div>

        <div className="legal-section">
          <h2>11. Uygulanacak Hukuk ve Yetkili Mahkeme</h2>
          <p>
            İşbu Kullanım Koşulları Türkiye Cumhuriyeti kanunlarına tabidir. İşbu
            sözleşmeden kaynaklanan her türlü uyuşmazlıkta İstanbul Mahkemeleri ve İcra
            Daireleri yetkilidir.
          </p>
        </div>

        <div className="legal-contact">
          <h3>İletişim Bilgileri</h3>
          <p>
            <strong>Firma:</strong> MEBS İpek Aksesuar
          </p>
          <p>
            <strong>E-posta:</strong>{' '}
            <a href="mailto:info@ipekaksesuar.com">info@ipekaksesuar.com</a>
          </p>
          <p>
            <strong>Telefon:</strong> +90 (XXX) XXX XX XX
          </p>
          <p>
            <strong>Adres:</strong> [Şirket Adresi]
          </p>
        </div>
      </div>
    </div>
  );
}

export default TermsOfService;
