import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

function KVKKPolicy() {
  return (
    <div className="legal-container">
      <Link to="/kayit" className="legal-back-button">
        ← Kayıt Sayfasına Dön
      </Link>

      <div className="legal-header">
        <h1 className="legal-title">KVKK Aydınlatma Metni</h1>
        <p className="legal-subtitle">
          Kişisel Verilerin Korunması ve İşlenmesi Hakkında Bilgilendirme
        </p>
        <span className="legal-last-updated">
          Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
        </span>
      </div>

      <div className="legal-content">
        <div className="legal-info-box">
          <p>
            <strong>6698 Sayılı Kişisel Verilerin Korunması Kanunu</strong> ("KVKK")
            uyarınca, kişisel verilerinizin işlenmesine ilişkin olarak sizleri
            bilgilendirmek isteriz.
          </p>
        </div>

        <div className="legal-section">
          <h2>1. VERİ SORUMLUSU</h2>
          <p>
            Kişisel verileriniz, KVKK uyarınca veri sorumlusu sıfatıyla MEBS İpek
            Aksesuar tarafından aşağıda açıklanan kapsamda işlenebilecektir.
          </p>
          <ul>
            <li><strong>Ünvan:</strong> MEBS İpek Aksesuar</li>
            <li><strong>Adres:</strong> [Şirket Adresi]</li>
            <li><strong>E-posta:</strong> info@ipekaksesuar.com</li>
            <li><strong>Telefon:</strong> +90 (XXX) XXX XX XX</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>2. KİŞİSEL VERİLERİNİZİN İŞLENME AMAÇLARI</h2>
          <p>
            Toplanan kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:
          </p>
          <ul>
            <li>Üyelik işlemlerinin gerçekleştirilmesi</li>
            <li>Sipariş ve teslimat süreçlerinin yönetilmesi</li>
            <li>Ödeme işlemlerinin gerçekleştirilmesi</li>
            <li>Müşteri hizmetleri ve destek sağlanması</li>
            <li>Fatura ve muhasebe işlemlerinin yürütülmesi</li>
            <li>Kampanya, promosyon ve reklam faaliyetlerinin yürütülmesi</li>
            <li>Ürün ve hizmetlerin geliştirilmesi</li>
            <li>İstatistiksel analiz ve raporlama yapılması</li>
            <li>Yasal yükümlülüklerin yerine getirilmesi</li>
            <li>Hukuki işlemlerin takibi ve yürütülmesi</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>3. İŞLENEN KİŞİSEL VERİ KATEGORİLERİ</h2>
          <p>
            Aşağıdaki kategorilerdeki kişisel verileriniz işlenebilmektedir:
          </p>

          <h3>3.1. Kimlik Bilgileri</h3>
          <ul>
            <li>Ad, Soyad</li>
            <li>TC Kimlik Numarası (fatura için gerekli olması halinde)</li>
            <li>Doğum Tarihi (gerekli olması halinde)</li>
          </ul>

          <h3>3.2. İletişim Bilgileri</h3>
          <ul>
            <li>E-posta Adresi</li>
            <li>Telefon Numarası</li>
            <li>Adres Bilgileri (Teslimat ve Fatura Adresi)</li>
          </ul>

          <h3>3.3. Müşteri İşlem Bilgileri</h3>
          <ul>
            <li>Sipariş Bilgileri</li>
            <li>Satın Alma Geçmişi</li>
            <li>Ödeme Bilgileri</li>
            <li>Kargo Takip Bilgileri</li>
            <li>İade ve İptal Bilgileri</li>
          </ul>

          <h3>3.4. İşlem Güvenliği Bilgileri</h3>
          <ul>
            <li>IP Adresi</li>
            <li>Çerez (Cookie) Kayıtları</li>
            <li>Tarayıcı Bilgileri</li>
            <li>Cihaz Bilgileri</li>
            <li>Oturum Kayıtları</li>
          </ul>

          <h3>3.5. Pazarlama Bilgileri</h3>
          <ul>
            <li>Alışveriş Tercihleri</li>
            <li>İlgi Alanları</li>
            <li>Anket ve Değerlendirme Yanıtları</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>4. KİŞİSEL VERİLERİN TOPLANMA YÖNTEMİ</h2>
          <p>
            Kişisel verileriniz, aşağıdaki yöntemlerle toplanmaktadır:
          </p>
          <ul>
            <li>Web sitesi üzerinden kayıt ve sipariş formları</li>
            <li>E-posta ve telefon yoluyla iletişim</li>
            <li>Mobil uygulama (varsa)</li>
            <li>Sosyal medya platformları</li>
            <li>Müşteri hizmetleri kanalları</li>
            <li>Çerezler (Cookies) ve benzeri teknolojiler</li>
            <li>Fiziksel mağaza (varsa)</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>5. KİŞİSEL VERİLERİN AKTARILMASI</h2>
          <p>
            Kişisel verileriniz, aşağıdaki taraflara aktarılabilir:
          </p>

          <table className="legal-table">
            <thead>
              <tr>
                <th>Aktarım Yapılabilecek Kişi/Kurum</th>
                <th>Aktarım Amacı</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Kargo Şirketleri</td>
                <td>Ürün teslimatının gerçekleştirilmesi</td>
              </tr>
              <tr>
                <td>Ödeme Kuruluşları (İyzico vb.)</td>
                <td>Ödeme işlemlerinin güvenli şekilde alınması</td>
              </tr>
              <tr>
                <td>Muhasebe ve Finans Danışmanları</td>
                <td>Mali işlemlerin yürütülmesi</td>
              </tr>
              <tr>
                <td>Hukuk Danışmanları</td>
                <td>Hukuki süreçlerin yürütülmesi</td>
              </tr>
              <tr>
                <td>Resmi Kurumlar</td>
                <td>Yasal yükümlülüklerin yerine getirilmesi</td>
              </tr>
              <tr>
                <td>Bulut Hizmet Sağlayıcılar</td>
                <td>Veri saklama ve barındırma hizmetleri</td>
              </tr>
              <tr>
                <td>Pazarlama ve Analiz Şirketleri</td>
                <td>Pazarlama faaliyetleri ve analiz</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="legal-section">
          <h2>6. KİŞİSEL VERİLERİN İŞLENME HUKUKI SEBEPLERİ</h2>
          <p>
            Kişisel verileriniz, KVKK'nın 5. ve 6. maddelerinde belirtilen aşağıdaki
            hukuki sebeplere dayalı olarak işlenmektedir:
          </p>
          <ul>
            <li>Bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması</li>
            <li>Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi</li>
            <li>
              İlgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri
              sorumlusunun meşru menfaatleri
            </li>
            <li>Açık rızanızın bulunması</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>7. KİŞİSEL VERİ SAHİBİNİN HAKLARI</h2>
          <p>
            KVKK'nın 11. maddesi uyarınca, kişisel veri sahipleri olarak aşağıdaki
            haklara sahipsiniz:
          </p>
          <ul>
            <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
            <li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme</li>
            <li>
              Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp
              kullanılmadığını öğrenme
            </li>
            <li>
              Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü
              kişileri bilme
            </li>
            <li>
              Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların
              düzeltilmesini isteme
            </li>
            <li>
              KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin
              silinmesini veya yok edilmesini isteme
            </li>
            <li>
              Düzeltme, silme ve yok edilme işlemlerinin kişisel verilerin aktarıldığı
              üçüncü kişilere bildirilmesini isteme
            </li>
            <li>
              İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz
              edilmesi suretiyle aleyhinize bir sonucun ortaya çıkmasına itiraz etme
            </li>
            <li>
              Kişisel verilerinizin kanuna aykırı olarak işlenmesi sebebiyle zarara
              uğramanız hâlinde zararın giderilmesini talep etme
            </li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>8. HAKLARINIZI KULLANMA YÖNTEMİ</h2>
          <p>
            Yukarıda belirtilen haklarınızı kullanmak için kimliğinizi tespit edici
            belgeler ile birlikte talebinizi aşağıdaki yöntemlerle iletebilirsiniz:
          </p>
          <ul>
            <li>
              <strong>E-posta:</strong>{' '}
              <a href="mailto:kvkk@ipekaksesuar.com">kvkk@ipekaksesuar.com</a> adresine
              e-posta göndererek
            </li>
            <li>
              <strong>Posta:</strong> [Şirket Adresi] adresine ıslak imzalı başvuru
              göndererek
            </li>
            <li>
              <strong>Elden:</strong> Şirket adresine şahsen gelerek dilekçe ile
              başvurarak
            </li>
          </ul>
          <p>
            Başvurularınız, talebin niteliğine göre en geç 30 (otuz) gün içinde
            ücretsiz olarak sonuçlandırılacaktır. Ancak, işlemin ayrıca bir maliyet
            gerektirmesi halinde, Kişisel Verileri Koruma Kurulu tarafından belirlenen
            tarifedeki ücret alınabilir.
          </p>
        </div>

        <div className="legal-section">
          <h2>9. VERİ GÜVENLİĞİ</h2>
          <p>
            Kişisel verilerinizin güvenliğini sağlamak için aşağıdaki önlemleri almaktayız:
          </p>
          <ul>
            <li>SSL sertifikası ile güvenli veri iletimi</li>
            <li>Güçlü şifreleme teknolojileri</li>
            <li>Düzenli güvenlik denetimleri ve testleri</li>
            <li>Personel eğitimleri ve gizlilik taahhütleri</li>
            <li>Erişim kontrol ve yetkilendirme sistemleri</li>
            <li>Düzenli yedekleme ve felaket kurtarma planları</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>10. ÇEREZLER (COOKIES)</h2>
          <p>
            Web sitemizde çerez (cookie) teknolojisi kullanılmaktadır. Çerezler hakkında
            detaylı bilgi için Çerez Politikamızı inceleyebilirsiniz. Çerezlerin
            kullanımını tarayıcı ayarlarınızdan yönetebilirsiniz.
          </p>
        </div>

        <div className="legal-section">
          <h2>11. VERİ SAKLAMA SÜRELERİ</h2>
          <p>
            Kişisel verileriniz, işleme amaçlarının gerektirdiği süre boyunca ve ilgili
            mevzuatta öngörülen saklama süreleri boyunca saklanacaktır. Saklama
            sürelerinin sonunda verileriniz silinir, yok edilir veya anonim hale
            getirilir.
          </p>
        </div>

        <div className="legal-section">
          <h2>12. DEĞİŞİKLİKLER</h2>
          <p>
            İşbu Aydınlatma Metni, yasal düzenlemelerdeki değişiklikler veya şirket
            politikalarındaki güncellemeler nedeniyle zaman zaman güncellenebilir.
            Güncellemeler web sitesinde yayınlandığı tarihte yürürlüğe girer.
          </p>
        </div>

        <div className="legal-contact">
          <h3>İletişim ve Başvuru</h3>
          <p>
            KVKK kapsamındaki sorularınız ve talepleriniz için bizimle iletişime
            geçebilirsiniz:
          </p>
          <p>
            <strong>Firma:</strong> MEBS İpek Aksesuar
          </p>
          <p>
            <strong>KVKK E-posta:</strong>{' '}
            <a href="mailto:kvkk@ipekaksesuar.com">kvkk@ipekaksesuar.com</a>
          </p>
          <p>
            <strong>Genel E-posta:</strong>{' '}
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

export default KVKKPolicy;
