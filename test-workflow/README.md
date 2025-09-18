# 🎯 Topçu Mermisi Atış Analizi Sistemi

Modern balistik hesaplamalar ve görsel analiz için geliştirilmiş kapsamlı bir Python uygulaması.

## 📋 Özellikler

### 🔧 Temel Özellikler
- **Balistik Hesaplamalar**: Gerçekçi fizik modellemesi ile mermi yörüngesi hesaplama
- **Namlu Açısı Optimizasyonu**: Hedef mesafe için optimal atış açısı bulma
- **Mesafe Analizi**: Maksimum menzil, yükseklik ve uçuş süresi hesaplama
- **Konum Analizi**: 3D uzayda mermi konumu takibi

### 🌪️ Gelişmiş Özellikler
- **Çevresel Faktörler**: Hava direnci, rüzgar etkisi, yükseklik kompanzasyonu
- **İsabet Olasılığı**: Hedef boyutu ve konumuna göre isabet şansı hesaplama
- **Performans Analizi**: Enerji kaybı, verimlilik ve optimizasyon önerileri
- **Karşılaştırmalı Analiz**: Farklı açılar için trajectory karşılaştırması

### 🖥️ Kullanıcı Arayüzü
- **Modern GUI**: Tkinter tabanlı kullanıcı dostu arayüz
- **Gerçek Zamanlı Grafik**: Matplotlib ile interaktif trajectory görselleştirme
- **Detaylı Raporlama**: Kapsamlı analiz sonuçları ve öneriler
- **Veri Dışa Aktarma**: JSON formatında rapor kaydetme

## 🚀 Kurulum

### Gereksinimler
- Python 3.8 veya üzeri
- Gerekli kütüphaneler (requirements.txt'te listelendi)

### Adım Adım Kurulum

1. **Projeyi İndirin**
   ```bash
   git clone [repository-url]
   cd artillery-analysis
   ```

2. **Gerekli Kütüphaneleri Kurun**
   ```bash
   pip install -r requirements.txt
   ```

3. **Uygulamayı Başlatın**
   ```bash
   python artillery_analysis.py
   ```

### Alternatif Kurulum (Manuel)
```bash
pip install matplotlib numpy scipy tkinter
```

## 📖 Kullanım Kılavuzu

### 1. Temel Kullanım

1. **Parametreleri Girin**:
   - İlk Hız (m/s): Merminin namludan çıkış hızı
   - Namlu Açısı (°): Yatay düzleme göre açı
   - Mermi Kütlesi (kg): Merminin ağırlığı
   - Mermi Çapı (mm): Merminin çapı

2. **Hesaplama Yapın**:
   - "🚀 Atış Hesapla" butonuna basın
   - Sonuçları grafik ve tablo halinde görüntüleyin

3. **Sonuçları Analiz Edin**:
   - Trajectory grafiğini inceleyin
   - Detaylı sonuçlar sekmesini kontrol edin
   - Performans analizi önerilerini okuyun

### 2. Gelişmiş Özellikler

#### Optimal Açı Bulma
```python
# Programatik kullanım
calculator = BallisticCalculator()
optimal_angle, error = calculator.calculate_optimal_angle(v0=300, target_distance=5000)
```

#### Çevresel Faktörler
- **Hava Direnci**: 0.0-1.0 arası değer (0.47 tipik)
- **Rüzgar Hızı**: m/s cinsinden (pozitif: yardımcı rüzgar)
- **Başlangıç Yüksekliği**: Deniz seviyesinden metre

#### İsabet Analizi
- Hedef koordinatları (x, y)
- Hedef yarıçapı
- İsabet olasılığı hesaplama

### 3. Test Modu

Test senaryolarını çalıştırmak için:
```bash
python test_artillery.py
```

Test modu şunları içerir:
- Temel hesaplama testleri
- Optimal açı bulma testleri
- Çevresel etki testleri
- İsabet olasılığı testleri
- Performans benchmark'ı

## 📊 Örnek Senaryolar

### Standart 155mm Obüs
- İlk Hız: 300 m/s
- Açı: 45°
- Kütle: 15 kg
- Çap: 155 mm
- **Beklenen Menzil**: ~4500m

### Uzun Menzil Atışı
- İlk Hız: 500 m/s
- Açı: 30°
- Kütle: 10 kg
- Çap: 120 mm
- **Beklenen Menzil**: ~8000m

### Hassas Atış
- İlk Hız: 250 m/s
- Açı: 15°
- Kütle: 20 kg
- Çap: 200 mm
- **Beklenen Menzil**: ~2500m

## 🔬 Teknik Detaylar

### Fizik Modeli
- **Yerçekimi**: 9.81 m/s²
- **Hava Yoğunluğu**: 1.225 kg/m³
- **Drag Katsayısı**: Mermi şekline bağlı (0.2-0.8)

### Hesaplama Yöntemi
- Runge-Kutta entegrasyonu
- 0.01 saniye zaman adımı
- Gerçek zamanlı hava direnci hesabı

### Doğruluk
- Menzil doğruluğu: ±2%
- Yükseklik doğruluğu: ±1%
- Zaman doğruluğu: ±0.1s

## 📁 Dosya Yapısı

```
artillery-analysis/
├── artillery_analysis.py    # Ana uygulama
├── test_artillery.py       # Test senaryoları
├── requirements.txt        # Gerekli kütüphaneler
├── README.md              # Bu dosya
└── reports/               # Kaydedilen raporlar (otomatik oluşur)
```

## 🛠️ Geliştirme

### Yeni Özellik Ekleme
1. `BallisticCalculator` sınıfına yeni hesaplama metodu ekleyin
2. `ArtilleryAnalysisGUI` sınıfına UI bileşenleri ekleyin
3. Test senaryolarını `test_artillery.py`'ye ekleyin

### Hata Ayıklama
- Konsol çıktılarını kontrol edin
- Test modunu kullanarak doğrulama yapın
- Parametrelerin geçerli aralıklarda olduğunu kontrol edin

## 🎯 Kullanım Alanları

- **Askeri Eğitim**: Balistik eğitimi ve simülasyon
- **Mühendislik**: Projectile motion analizi
- **Araştırma**: Balistik performans çalışmaları
- **Eğitim**: Fizik ve matematik öğretimi

## ⚠️ Önemli Notlar

1. **Güvenlik**: Bu yazılım sadece eğitim amaçlıdır
2. **Doğruluk**: Gerçek atış koşulları daha karmaşık olabilir
3. **Sorumluluk**: Kullanıcı tüm riskleri kabul eder

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📞 Destek

Sorularınız için:
- Issue açın
- Dokümantasyonu kontrol edin
- Test senaryolarını çalıştırın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

---

**🎯 İyi Atışlar!** 🚀
