import React from 'react';
import { Link } from 'react-router-dom';
import './Legal.css';

function DistanceSalesAgreement() {
  return (
    <div className="legal-container">
      <Link to="/kayit" className="legal-back-button">
        ← Kayıt Sayfasına Dön
      </Link>

      <div className="legal-header">
        <h1 className="legal-title">Mesafeli Satış Sözleşmesi</h1>
        <p className="legal-subtitle">
          6502 Sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği
        </p>
        <span className="legal-last-updated">
          Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
        </span>
      </div>

      <div className="legal-content">
        <div className="legal-info-box">
          <p>
            <strong>Önemli:</strong> Bu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında
            Kanun ve Mesafeli Sözleşmeler Yönetmeliği uyarınca düzenlenmiştir.
          </p>
        </div>

        <div className="legal-section">
          <h2>MADDE 1: TARAFLAR</h2>
          <h3>1.1. SATICI BİLGİLERİ</h3>
          <ul>
            <li><strong>Ünvanı:</strong> MEBS İpek Aksesuar</li>
            <li><strong>Adres:</strong> [Şirket Adresi]</li>
            <li><strong>Telefon:</strong> +90 (XXX) XXX XX XX</li>
            <li><strong>E-posta:</strong> info@ipekaksesuar.com</li>
            <li><strong>Mersis No:</strong> [Mersis Numarası]</li>
          </ul>

          <h3>1.2. ALICI BİLGİLERİ</h3>
          <p>
            Sipariş esnasında bildirilen ve kayıt altına alınan teslim/fatura bilgileri
            alıcı bilgileri olarak kabul edilir.
          </p>
        </div>

        <div className="legal-section">
          <h2>MADDE 2: SÖZLEŞME KONUSU</h2>
          <p>
            İşbu sözleşmenin konusu, ALICI'nın SATICI'ya ait www.ipekaksesuar.com
            internet sitesinden elektronik ortamda siparişini verdiği aşağıda nitelikleri
            ve satış fiyatı belirtilen ürün/ürünlerin satışı ve teslimi ile ilgili olarak
            6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmelere Dair
            Yönetmelik hükümleri gereğince tarafların hak ve yükümlülüklerinin
            belirlenmesidir.
          </p>
        </div>

        <div className="legal-section">
          <h2>MADDE 3: SÖZLEŞME KONUSU ÜRÜN/ÜRÜNLER BİLGİLERİ</h2>
          <p>
            Ürün/hizmetin temel özellikleri (türü, miktarı, marka/modeli, rengi, adedi)
            SATICI'ya ait internet sitesinde yayınlanmaktadır. Satıcı tarafından kampanya
            düzenlenmiş ise ilgili ürünün temel özelliklerini kampanya süresince
            inceleyebilirsiniz.
          </p>
          <p>
            Sipariş tarihinde geçerli olan fiyatlar uygulanır. Listelenen ve sitede ilan
            edilen fiyatlar satış fiyatıdır. İlan edilen fiyatlar ve vaatler güncelleme
            yapılana ve değiştirilene kadar geçerlidir.
          </p>
        </div>

        <div className="legal-section">
          <h2>MADDE 4: GENEL HÜKÜMLER</h2>
          <h3>4.1. Ödeme ve Teslimat</h3>
          <ul>
            <li>
              ALICI, sipariş verdiği ürün/ürünlerin temel nitelikleri, satış fiyatı,
              ödeme şekli ve teslimat koşullarını okuyup bilgi sahibi olduğunu, elektronik
              ortamda gerekli teyidi verdiğini kabul ve beyan eder.
            </li>
            <li>
              Sözleşme konusu mal, yasal 30 günlük süreyi aşmamak koşulu ile her bir ürün
              için ALICI'nın yerleşim yerinin uzaklığına bağlı olarak internet sitesinde
              ön bilgiler içinde açıklanan süre içinde ALICI veya ALICI'nın gösterdiği
              adresteki kişi ve/veya kuruluşa teslim edilir.
            </li>
            <li>
              Ürün, ALICI'dan başka bir kişi/kuruluşa teslim edilecek ise, teslim
              edilecek kişi/kuruluşun teslimatı kabul etmemesinden SATICI sorumlu
              tutulamaz.
            </li>
          </ul>

          <h3>4.2. Teslimat Masrafları</h3>
          <p>
            Ürün sevkiyat masrafı olan kargo ücreti ALICI tarafından ödenecektir.
            Kampanyalar kapsamında belirtilen koşullarda kargo ücretsiz olabilir.
          </p>
        </div>

        <div className="legal-section">
          <h2>MADDE 5: CAYMA HAKKI</h2>
          <h3>5.1. Cayma Hakkı Süresi</h3>
          <div className="legal-info-box">
            <p>
              <strong>ALICI; </strong>
              mal satışına ilişkin mesafeli sözleşmelerde, ürünün kendisine veya
              gösterdiği adresteki kişi/kuruluşa teslim tarihinden itibaren 14 (on dört)
              gün içerisinde, SATICI'ya bildirmek şartıyla hiçbir hukuki ve cezai
              sorumluluk üstlenmeksizin ve hiçbir gerekçe göstermeksizin malı reddederek
              sözleşmeden cayma hakkını kullanabilir.
            </p>
          </div>

          <h3>5.2. Cayma Hakkının Kullanılması</h3>
          <p>
            Cayma hakkının kullanımından kaynaklanan masraflar SATICI'ya aittir. ALICI,
            cayma hakkını kullanmak için 14 günlük süre içinde SATICI'ya elektronik posta,
            telefon veya yazılı olarak bildirimde bulunmalıdır.
          </p>

          <h3>5.3. Cayma Hakkının Kullanılamayacağı Haller</h3>
          <p>Aşağıdaki durumlarda ALICI cayma hakkını kullanamaz:</p>
          <ul>
            <li>
              Fiyatı finansal piyasalardaki dalgalanmalara bağlı olarak değişen ve
              satıcının kontrolünde olmayan mal veya hizmetlere ilişkin sözleşmeler
            </li>
            <li>
              ALICI'nın istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan
              mallara ilişkin sözleşmeler
            </li>
            <li>
              Çabuk bozulabilen veya son kullanma tarihi geçebilecek malların teslimine
              ilişkin sözleşmeler
            </li>
            <li>
              Tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları
              açılmış olan mallardan; iadesi sağlık ve hijyen açısından uygun olmayanların
              teslimine ilişkin sözleşmeler
            </li>
            <li>
              Tesliminden sonra başka ürünlerle karışan ve doğası gereği ayrıştırılması
              mümkün olmayan mallara ilişkin sözleşmeler
            </li>
          </ul>

          <h3>5.4. İade Prosedürü</h3>
          <ol>
            <li>Cayma hakkı bildirimini SATICI'ya iletin</li>
            <li>Ürünü eksiksiz ve faturası ile birlikte kargoya verin</li>
            <li>İade kargo kodu/takip numarasını SATICI'ya bildirin</li>
            <li>
              SATICI, ürünü teslim aldıktan sonra 14 gün içinde ödemenizi iade eder
            </li>
          </ol>
        </div>

        <div className="legal-section">
          <h2>MADDE 6: TESLİMAT</h2>
          <h3>6.1. Teslimat Süresi</h3>
          <p>
            Ürünler, sipariş onayını takiben en geç 30 gün içerisinde teslim edilir.
            Teslimat adresi olarak ALICI'nın kayıt sırasında bildirdiği adres esas alınır.
          </p>

          <h3>6.2. Teslimat Şartları</h3>
          <ul>
            <li>
              Ürün teslim alınırken hasarlı ve ambalajı açılmış ise teslim alınmamalı ve
              durum tutanağa bağlanmalıdır
            </li>
            <li>
              Teslimat sırasında ALICI veya gösterdiği adresteki kişi hazır bulunmalıdır
            </li>
            <li>
              Kargo görevlisi ile birlikte paket kontrol edilmeli, hasarlı ise teslim
              alınmamalıdır
            </li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>MADDE 7: GARANTİ ŞARTLARI</h2>
          <p>
            Malın ayıplı olması durumunda ALICI, 6502 sayılı Tüketicinin Korunması
            Hakkında Kanun'un 11. maddesi uyarınca aşağıdaki haklardan birini kullanabilir:
          </p>
          <ul>
            <li>Satış bedelinde indirim isteme</li>
            <li>
              Malın ücretsiz onarımını isteme (onarımın mümkün olması durumunda)
            </li>
            <li>Malın ayıpsız bir misli ile değiştirilmesini isteme</li>
            <li>Sözleşmeden dönme ve ödediği bedelin iadesini isteme</li>
          </ul>
        </div>

        <div className="legal-section">
          <h2>MADDE 8: UYUŞMAZLIKLARIN ÇÖZÜMÜ</h2>
          <p>
            İşbu Sözleşme'den doğabilecek ihtilaflarda; Sanayi ve Ticaret Bakanlığınca her
            yıl Aralık ayında belirlenen parasal sınırlar dâhilinde tüketicinin mal veya
            hizmeti satın aldığı veya ikametgahının bulunduğu yerdeki İl veya İlçe
            Tüketici Hakem Heyetleri ile İl veya İlçe Tüketici Mahkemeleri yetkilidir.
          </p>
          <p>
            Parasal sınırın üzerindeki ihtilaflarda ise tüketicinin mal veya hizmeti satın
            aldığı veya ikametgahının bulunduğu yerdeki İl veya İlçe Tüketici Mahkemeleri
            yetkilidir.
          </p>
        </div>

        <div className="legal-section">
          <h2>MADDE 9: YÜRÜRLÜK</h2>
          <p>
            ALICI, site üzerinden verdiği sipariş ile işbu sözleşmenin tüm koşullarını
            kabul etmiş sayılır. İşbu sözleşme, ALICI'nın onayı ile birlikte yürürlüğe
            girer.
          </p>
          <p>
            <strong>Sözleşme Tarihi:</strong> Sipariş tarihinde otomatik olarak
            oluşturulur.
          </p>
        </div>

        <div className="legal-contact">
          <h3>SATICI İletişim Bilgileri</h3>
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
            <strong>Müşteri Hizmetleri Çalışma Saatleri:</strong> Hafta içi 09:00 - 18:00
          </p>
        </div>
      </div>
    </div>
  );
}

export default DistanceSalesAgreement;
