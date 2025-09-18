# Changelog

Bu dosya Workflow Snapshot & Replay extension'ının tüm önemli değişikliklerini dokümante eder.

## [0.1.0] - 2025-09-18

### Yeni Özellikler

#### Explorer Dashboard UI
- **Yeni Dashboard**: Explorer paneline entegre edilmiş kullanıcı dostu arayüz
- **Hızlı Eylem Butonları**: Record, Stop, Replay, AI Assistant butonları
- **Gerçek Zamanlı Durum**: Kayıt durumu ve oturum bilgileri
- **Son Workflowlar**: Son 3 workflow'a hızlı erişim
- **Smart Navigation**: Tüm workflow geçmişine kolay erişim

#### Workflow Tracking
- **Otomatik İzleme**: Dosya değişiklikleri, editör aktiviteleri
- **Terminal Entegrasyonu**: Terminal açma/kapama olayları
- **Metin Değişiklikleri**: Detaylı kod değişiklik takibi
- **Workspace Context**: Proje bilgilerini otomatik kaydetme
- **Olay Zaman Damgası**: Milisaniye hassasiyetinde zaman kayıtları

#### Markdown Raporlama
- **Güzel Formatlanmış Raporlar**: Türkçe Markdown çıktısı
- **Zaman Çizelgesi**: Kronolojik olay listesi
- **İstatistik Özeti**: Dosya sayıları, süre, olay sayısı
- **Yeniden Oynatma Talimatları**: Adım adım rehber
- **Teknik Detaylar**: VS Code sürümü, extension bilgileri

#### Replay Sistemi
- **Multi-Format Desteği**: JSON ve Markdown dosyalarından replay
- **Progress Tracking**: Visual ilerleme göstergesi
- **Dosya İşlemleri**: Oluşturma, düzenleme, silme otomasyonu
- **Editör Kontrolü**: Otomatik dosya açma
- **Terminal Komutları**: Komut çalıştırma desteği
- **Hata Yönetimi**: Graceful error handling

#### AI Assistant
- **Yerleşik Webview**: Güzel arayüzlü AI paneli
- **Workflow Analizi**: Verimlilik değerlendirmesi
- **Optimizasyon Önerileri**: Gereksiz adım tespiti
- **Geliştirme Tavsiyeleri**: Best practice önerileri
- **Akıllı Açıklamalar**: Workflow'un ne yaptığını anlama
- **API Bağımsız**: Yerleşik analiz motoru

#### Kullanıcı Deneyimi
- **Command Palette**: Tüm komutlara kolay erişim
- **Keyboard Shortcuts**: Hızlı işlem desteği
- **Ayar Paneli**: Kişiselleştirilebilir seçenekler
- **Türkçe Arayüz**: Tam Türkçe dil desteği
- **Context Menus**: Sağ tık menüleri
- **Quick Pick**: Hızlı seçim dialoglari

### Teknik İyileştirmeler

#### Proje Yapısı
- **Modüler Mimari**: Ayrılmış sorumluluklar
- **TypeScript**: Tam tip güvenliği
- **ESLint**: Kod kalitesi standartları
- **Mocha Testing**: Unit test framework
- **VS Code API**: En son API özellikleri

#### Geliştirici Deneyimi
- **Hot Reload**: Watch mode ile hızlı geliştirme
- **Debug Config**: VS Code debug yapılandırması
- **Task Runner**: Otomatik build görevleri
- **Extension Packaging**: VSIX paket oluşturma
- **Linting Rules**: Tutarlı kod formatı

#### Dokümantasyon
- **Detaylı README**: Kurulum ve kullanım kılavuzu
- **Kullanım Kılavuzu**: Adım adım örnekler
- **API Dokümantasyonu**: Geliştirici referansı
- **Changelog**: Sürüm geçmişi takibi
- **TypeScript Definitions**: Tam tip desteği

### UI/UX Geliştirmeleri

#### Dashboard Tasarımı
- **Minimalist Arayüz**: Sade ve kullanışlı tasarım
- **Icon Integration**: VS Code tema uyumlu ikonlar
- **Smart Grouping**: Mantıklı içerik gruplama
- **Responsive Layout**: Farklı panel boyutları
- **Dark/Light Theme**: Otomatik tema uyumu

#### Etkileşim Tasarımı
- **One-Click Actions**: Tek tıkla işlemler
- **Visual Feedback**: Durum göstergeleri
- **Progress Indicators**: İlerleme çubukları
- **Toast Notifications**: Bilgilendirme mesajları
- **Contextual Help**: Bağlamsal yardım

### Güvenlik ve Stabilite

#### Güvenlik Önlemleri
- **File System Safety**: Güvenli dosya işlemleri
- **Input Validation**: Girdi doğrulama
- **Error Boundaries**: Hata yakalama
- **Resource Cleanup**: Bellek yönetimi
- **Permission Handling**: Yetki kontrolü

#### Performans
- **Lazy Loading**: İhtiyaç anında yükleme
- **Event Debouncing**: Olay filtreleme
- **Memory Management**: Bellek optimizasyonu
- **Async Operations**: Non-blocking işlemler
- **Efficient Storage**: Optimized veri saklama

### Desteklenen Formatlar

#### Çıktı Formatları
- **Markdown (.md)**: Varsayılan format
- **JSON (.json)**: Programatik erişim
- **HTML (.html)**: Web görüntüleme (gelecek sürüm)

#### Replay Formatları
- **JSON Workflow**: Tam veri desteği
- **Markdown Report**: Rapor tabanlı replay
- **Custom Scripts**: Özel replay senaryoları (gelecek)

### Yerelleştirme
- **Türkçe UI**: Tam Türkçe arayüz
- **Tarih Formatları**: Türk tarih formatı
- **Sayı Formatları**: Yerel sayı gösterimi
- **Zaman Dilimi**: Otomatik zaman dilimi

### Gelecek Planları

#### v0.2.0 Hedefleri
- [ ] Git entegrasyonu (commit tracking)
- [ ] Team collaboration özelliği
- [ ] Cloud sync desteği
- [ ] Plugin system
- [ ] Advanced AI features
- [ ] Performance metrics

#### Uzun Vadeli Vizyon
- [ ] Multi-language support
- [ ] Cross-platform compatibility
- [ ] Enterprise features
- [ ] Marketplace publishing
- [ ] Community contributions

### Bilinen Sorunlar
- Windows'ta node-pty bağımlılığı kaldırıldı (terminal tracking sınırlı)
- Büyük dosyalarda replay performansı optimize edilmeli
- AI analiz sonuçları daha detaylı olabilir

### Teşekkürler
- VS Code team'ine API desteği için
- TypeScript community'sine
- Tüm test eden geliştiricilere

---

**Not**: Bu changelog [Keep a Changelog](https://keepachangelog.com/) formatını takip eder.
