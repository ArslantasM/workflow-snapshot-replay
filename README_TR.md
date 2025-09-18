# Workflow Snapshot & Replay - AI-Destekli Geliştirme İş Akışı Extension'ı

<div align="center">

![Workflow Snapshot Logo](https://img.shields.io/badge/Workflow%20Snapshot-AI%20Destekli%20Geliştirme-blue?style=for-the-badge)
[![VS Code](https://img.shields.io/badge/VS%20Code-Extension-007ACC?style=for-the-badge&logo=visual-studio-code)](https://marketplace.visualstudio.com/vscode)
[![Cursor](https://img.shields.io/badge/Cursor-Uyumlu-00D4AA?style=for-the-badge)](https://cursor.sh/)
[![Türkiye'de Yapıldı](https://img.shields.io/badge/Türkiye'de-Yapıldı-red?style=for-the-badge)](https://github.com/ArslantasM)

**Geliştirme iş akışınızı otomatik olarak kaydeden, analiz eden ve yeniden oynatan ilk AI-destekli VS Code extension'ı**

[Hızlı Başlangıç](#hızlı-başlangıç) • [Özellikler](#özellikler) • [AI Analizi](#ai-analizi) • [İndir](#i̇ndir)

</div>

## Workflow Snapshot & Replay Nedir?

Kodlarken nasıl çalıştığınızı izleyen, geliştirme alışkanlıklarınızdan öğrenen ve daha verimli olmanıza yardımcı olan **akıllı bir asistan** hayal edin. İşte Workflow Snapshot & Replay tam olarak bunu yapıyor!

### Çözdüğümüz Sorunlar

- **Kayıp Geliştirme Bilgisi**: Geçen ay o özelliği nasıl yaptınız?
- **Verimsiz İş Akışları**: Aynı hataları fark etmeden tekrarlama
- **Bilgi Paylaşımı**: Takım arkadaşlarına geliştirme sürecinizi göstermekte zorluk
- **Öğrenme Eğrisi**: Yeni geliştiricilerin proje iş akışlarını anlamakta zorlanması

### Çözümümüz

**Workflow Snapshot & Replay** otomatik olarak:
1. **Kaydeder** - Kodlarken yaptığınız her işlemi
2. **Analiz Eder** - İş akışınızı gelişmiş AI ile
3. **Dokümante Eder** - Sürecinizi güzel Markdown raporlarında
4. **Yeniden Oynatır** - İş akışınızı herhangi bir makinede, istediğiniz zaman

## Temel Özellikler

### 🎥 Otomatik İş Akışı Kaydı
- **Sıfır Kurulum**: Sadece "Kaydı Başlat"a tıklayın ve normal çalışın
- **Tam Yakalama**: Dosyalar, düzenlemeler, terminal komutları, her şey
- **Akıllı Filtreleme**: Sadece anlamlı geliştirme aktivitelerini yakalar
- **Arka Plan İşlemi**: Çalışmanızı asla kesintiye uğratmaz

### 🤖 Gelişmiş AI Analizi (API Anahtarı Gerektirmez!)

#### Dosya Seviyesi Derin Analiz
- **Kod Kalitesi Puanlaması**: Her dosya 0-100 arası kalite puanı alır
- **Desen Tanıma**: Programlama desenlerini ve mimarileri tespit eder
- **Fonksiyon Analizi**: Fonksiyonları, import'ları ve kod yapısını tanımlar
- **Dil Tespiti**: 15+ programlama dilini otomatik tanır

#### Proje Seviyesi Zeka
- **Proje Türü Tespiti**: React, Python, Java, .NET projeleri
- **Mimari Analizi**: MVC, Component-Service, Monolithic desenler
- **Framework Tanıma**: Django, Express, Spring Boot ve daha fazlası
- **En İyi Uygulama Önerileri**: Teknoloji yığınınıza özel

#### Gerçek Zamanlı İçgörüler
```
Örnek AI Analizi:
📊 Proje Türü: Python Veri Analizi Projesi
🏗️ Mimari: Modüler fonksiyonlarla script tabanlı
📁 Analiz Edilen Dosyalar:
  • data_analyzer.py: Kalite 85/100, Fonksiyonlar: analyze_data, generate_plot
  • requirements.txt: Bağımlılık yönetimi, Öneri: Sürümleri sabitle
  • README.md: Dokümantasyon, Kalite 70/100
💡 Akıllı Öneriler:
  • HTTP istekleri için hata yönetimi ekle
  • Sanal ortam kur
  • Unit testler eklemeyi düşün
```

### 📋 Güzel Dokümantasyon
- **Markdown Raporları**: Profesyonel, paylaşılabilir dokümantasyon
- **Zaman Çizelgesi**: Adım adım geliştirme süreci
- **Görsel İçgörüler**: İş akışınız hakkında grafikler ve metrikler
- **Dışa Aktarma Seçenekleri**: Takımla paylaş veya daha sonra için kaydet

### 🔄 Akıllı Yeniden Oynatma
- **Çapraz Platform**: Windows'ta kaydet, Mac/Linux'ta oynat
- **Akıllı Yeniden Üretim**: Dosyaları, klasörleri, komutları otomatik yeniden oluşturur
- **Eğitim Aracı**: Tutorial'lar ve işe alım için mükemmel
- **Hata Ayıklama Yardımı**: Hataları tam olarak gerçekleştiği gibi yeniden üret

### 🎛️ Sorunsuz Entegrasyon
- **Explorer Dashboard**: Her şeyi VS Code'un Explorer panelinden kontrol edin
- **Tek Tık İşlemler**: Başlat, durdur, analiz et, oynat tek tıkla
- **Komut Paleti**: Tam klavye kısayolu desteği
- **Bağlam Değiştirme Yok**: Her şey editörünüzde gerçekleşir

## Nasıl Çalışır

### Adım 1: İş Akışınızı Kaydedin
```
1. Projenizi VS Code/Cursor'da açın
2. Explorer panelinde "Workflow Snapshot & Replay" bölümünü bulun
3. "▶️ Kaydı Başlat"a tıklayın
4. Normal şekilde kodlayın - dosya oluşturun, kod yazın, komut çalıştırın
5. İşiniz bittiğinde "⏹️ Kaydı Durdur"a tıklayın
```

### Adım 2: AI Analizini Alın
```
1. Dashboard'da "🤖 AI Asistanı"na tıklayın
2. Analiz türünüzü seçin:
   • "Aktif Workflow'u Analiz Et" - Derin dosya ve proje analizi
   • "Geliştirme Önerileri Al" - Kişiselleştirilmiş öneriler
   • "Workflow'u Optimize Et" - Verimsizlikleri ve iyileştirmeleri bul
   • "Workflow'u Açıkla" - Ne başardığınızı anlayın
```

### Adım 3: Paylaşın ve Yeniden Oynayın
```
1. Güzel Markdown dokümantasyonu için "📋 Rapor Oluştur"a tıklayın
2. Raporu takımınızla paylaşın veya referans için kaydedin
3. Aynı adımları herhangi bir yerde yeniden üretmek için "🔄 Workflow Oynat" kullanın
4. Tutorial'lar, hata ayıklama veya yeni geliştiricilerin işe alımı için mükemmel
```

## AI Analizi Örnekleri

### React Projesi İçin:
```
🔍 Analiz Sonuçları:
• Proje Türü: React Frontend Projesi
• Mimari: Component-Service Mimarisi
• Diller: TypeScript, CSS, Markdown
• App.tsx: Kalite 92/100, Fonksiyonlar: useState, useEffect
  └ Desenler: React Hooks, Component Mimarisi
• UserService.js: Kalite 88/100, Fonksiyonlar: fetchUser, updateProfile
  └ Desenler: API Entegrasyonu, Asenkron Programlama

💡 Akıllı Öneriler:
• App.tsx: Performans için React.memo kullanmayı düşünün
• UserService.js: API çağrıları için error boundary ekleyin
• Proje: Tutarlılık için ESLint ve Prettier kurun
```

### Python Veri Projesi İçin:
```
🔍 Analiz Sonuçları:
• Proje Türü: Python Veri Analizi Projesi  
• Mimari: Modüler fonksiyonlarla script tabanlı
• Diller: Python, Markdown
• data_processor.py: Kalite 78/100, Fonksiyonlar: load_data, clean_data
  └ Desenler: Veri Analizi, Bilimsel Hesaplama
• visualization.py: Kalite 85/100, Fonksiyonlar: create_charts, save_plots
  └ Desenler: Veri Görselleştirme, Matplotlib Entegrasyonu

💡 Akıllı Öneriler:
• data_processor.py: Daha iyi dokümantasyon için type hint'ler ekle
• visualization.py: Daha iyi grafikler için Seaborn kullanmayı düşün
• Proje: Sabitlenmiş sürümlerle requirements.txt ekle
```

## Hızlı Başlangıç

### Kurulum
1. **İndir**: Releases'dan `workflow-snapshot-replay-0.1.0.vsix` dosyasını alın
2. **Kur**: VS Code/Cursor'da → Extensions → "Install from VSIX"
3. **Dashboard'u Bul**: Explorer paneli → "Workflow Snapshot & Replay"
4. **Kaydı Başlat**: "▶️ Kaydı Başlat"a tıklayın ve kodlamaya başlayın!

### İlk İş Akışınız
1. **Kaydet**: Birkaç dosya oluşturun, kod yazın, terminal komutları çalıştırın
2. **Analiz Et**: İş akışınız hakkında içgörüler almak için AI Asistanını kullanın
3. **Paylaş**: Güzel bir Markdown raporu oluşturun
4. **Yeniden Oynat**: İş akışınızı yeni bir klasörde yeniden oynamayı deneyin

## Kullanım Alanları

### 🎓 Eğitim ve Öğretim
- **Kod Dersleri**: Öğrenciler için kodlama oturumları kaydedin
- **En İyi Uygulamalar**: Doğru geliştirme iş akışlarını gösterin
- **İşe Alım**: Yeni takım üyelerinin süreçlerinizi öğrenmesine yardımcı olun

### 🐛 Hata Ayıklama ve Kalite
- **Hata Yeniden Üretme**: Sorunlara neden olan tam adımları kaydedin
- **Kod İncelemeleri**: Geliştirme sürecinizi inceleyicilerle paylaşın
- **Performans Analizi**: Yavaş veya verimsiz iş akışlarını belirleyin

### 📚 Dokümantasyon
- **Süreç Dokümantasyonu**: Özelliklerin nasıl yapıldığını otomatik olarak belgeleyin
- **Bilgi Paylaşımı**: Geliştirme bilgisini takımlar arasında paylaşın
- **Uygunluk**: Denetimler için geliştirme süreçlerini takip edin

### 🚀 Verimlilik
- **İş Akışı Optimizasyonu**: AI daha verimli çalışma yollarını belirler
- **Desen Öğrenme**: En verimli oturumlarınızdan öğrenin
- **Otomasyon**: Tekrarlayan iş akışlarını otomatik scriptlere dönüştürün

## Neden Workflow Snapshot & Replay Seçmelisiniz?

### ✅ **Gizlilik Öncelikli**
- Tüm analizler makinenizde yerel olarak gerçekleşir
- Harici sunuculara veri gönderilmez (seçmediğiniz sürece)
- Kodunuz özel ve güvenli kalır

### ✅ **API Anahtarı Olmadan AI**
- Gelişmiş AI analizi çevrimdışı çalışır
- Abonelik ücreti veya API maliyeti yok
- İlk günden itibaren gerçek değer sağlayacak kadar akıllı

### ✅ **Evrensel Uyumluluk**
- Herhangi bir programlama dili ile çalışır
- Herhangi bir proje yapısıyla uyumlu
- Tüm ana framework'leri ve araçları destekler

### ✅ **Profesyonel Kalite**
- Kurumsal düzeyde güvenlik ve gizlilik
- Güzel, paylaşılabilir dokümantasyon
- Güvenilir iş akışı yeniden üretimi

## Destek ve Topluluk

- **Sorunlar**: [Hata bildirin ve özellik isteyin](https://github.com/ArslantasM/workflow-snapshot-replay/issues)
- **Tartışmalar**: [Topluluğumuza katılın](https://github.com/ArslantasM/workflow-snapshot-replay/discussions)
- **Dokümantasyon**: Detaylı kullanım için dahil edilen kılavuzlara bakın

## Lisans

Apache License 2.0 altında lisanslanmıştır - detaylar için [LICENSE](LICENSE) dosyasına bakın.

## Geliştirici

**Mustafa Barış Arslantaş**
- Türkiye'de yapıldı 🇹🇷
- AI-destekli geliştirme araçları konusunda tutkulu
- Telif Hakkı © 2025 Mustafa Barış Arslantaş

---

<div align="center">

**Geliştirme iş akışınızı AI-destekli içgörülerle dönüştürün**

[Extension'ı İndir](https://github.com/ArslantasM/workflow-snapshot-replay/releases) • [Sorun Bildir](https://github.com/ArslantasM/workflow-snapshot-replay/issues) • [Geliştiriciyle İletişim](https://github.com/ArslantasM)

</div>
