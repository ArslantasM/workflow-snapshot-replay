#  Workflow Snapshot & Replay - Kullanım Kılavuzu

##  Hızlı Başlangıç

### 1. Extension'ı Yükleyin

### 2. Dashboard'u Bulma
- VS Code/Cursor'da sol kenar çubuğundaki **Explorer** sekmesine gidin
- Dosya ağacının altında **"Workflow Snapshot & Replay"** bölümünü bulun
- Bu mini dashboard tüm işlemlerinizi kontrol etmenizi sağlar

##  Dashboard Özellikleri

### Ana Kontroller
- **🔴/⚪ Durum Göstergesi**: Kayıt durumunu gösterir
- **▶️ Kayıt Başlat**: Yeni workflow kaydı başlatır
- **⏹️ Kaydı Durdur**: Aktif kaydı sonlandırır
- **📋 Rapor Oluştur**: Mevcut oturum için Markdown raporu oluşturur
- **🔄 Workflow Oynat**: Kaydedilmiş workflow'u yeniden oynatır
- **🤖 AI Asistanı**: Analiz ve optimizasyon panelini açar

### Oturum Bilgileri
Dashboard aktif kayıt sırasında şunları gösterir:
- **📅 Başlangıç Zamanı**: Oturum ne zaman başladı
- **📊 Olay Sayısı**: Kaç işlem kaydedildi
- **📁 Workspace**: Hangi projede çalışıyorsunuz

### Son Workflowlar
- Son 3 workflow'unuz otomatik listelenir
- Tıklayarak detaylarını görebilirsiniz
- "+X tane daha..." ile tüm geçmişe erişebilirsiniz

##  Tipik Kullanım Senaryoları

### Senaryo 1: Kod Dersi Hazırlama
```
1. Dashboard'dan "▶️ Kayıt Başlat" tıklayın
2. Normal şekilde kodunuzu yazın, dosyalar oluşturun
3. Terminal komutları çalıştırın (npm install, git commit vb.)
4. "⏹️ Kaydı Durdur" tıklayın
5. "📋 Rapor Oluştur" ile detaylı Markdown dokümantasyonu alın
```

### Senaryo 2: Bug Reproducing
```
1. Kayıt başlatın
2. Bug'ı tetikleyen adımları tekrarlayın
3. Kaydı durdurun
4. Raporu geliştirici ekibinizle paylaşın
5. "🔄 Workflow Oynat" ile başka makinede aynı sorunu yaratın
```

### Senaryo 3: Öğrenci Projesi Takibi
```
1. Proje başında kayıt başlatın
2. Geliştirme sürecini normal şekilde yürütün
3. Her major milestone'da rapor oluşturun
4. AI asistanından kod kalitesi önerileri alın
5. Final raporu mentor'unuzla paylaşın
```

## 🤖 AI Asistanı Kullanımı

Dashboard'dan "🤖 AI Asistanı" tıklayarak:

### Analiz Özellikleri
- **📊 Workflow Analizi**: Çalışma alışkanlıklarınızı değerlendirir
- **💡 Geliştirme Önerileri**: Verimlilik artırıcı ipuçları
- **⚡ Optimizasyon**: Gereksiz adımları tespit eder
- **📖 Açıklama**: Workflow'unuzun ne yaptığını anlatır

### AI Önerileri Örnekleri
- "Çok fazla dosya aç/kapat işlemi yapıyorsunuz, multi-tab kullanın"
- "Terminal komutlarını script haline getirin"
- "Code formatting için otomatik araçlar kullanın"
- "Bu işlemler için keyboard shortcut oluşturun"

##  Rapor Formatı

Oluşturulan Markdown raporları şunları içerir:

```markdown
# 🔄 Workflow Raporu

## 📊 Oturum Bilgileri
- Oturum ID, başlangıç/bitiş zamanı
- Workspace bilgisi

## 📈 Özet İstatistikler
- Toplam olay sayısı
- Değiştirilen dosya sayısı
- Çalıştırılan komut sayısı

## 🕒 Zaman Çizelgesi
Kronolojik sırayla tüm işlemler:
1. 14:30:15 - Dosya oluşturuldu: src/App.js
2. 14:30:45 - Metin değişikliği: src/App.js
3. 14:31:20 - Terminal komutu: npm start
...

##  Yeniden Oynatma Talimatları
Bu workflow'u tekrarlamak için gerekli adımlar
```

## 🔄 Replay (Yeniden Oynatma)

### Manuel Replay
1. Dashboard'dan "🔄 Workflow Oynat" tıklayın
2. `.md` veya `.json` formatındaki workflow dosyasını seçin
3. Progress bar ile süreci takip edin
4. İşlemler otomatik olarak uygulanır

### Replay Sırasında Neler Olur
- **Dosya İşlemleri**: Oluşturma, düzenleme, silme
- **Editör Aktiviteleri**: Dosyaları açma
- **Terminal Komutları**: Otomatik çalıştırma
- **Bekleme Süreleri**: Gerçekçi timing

## ⚙️ İleri Düzey Özellikler

### Command Palette Entegrasyonu
`Ctrl+Shift+P` ile tüm komutlara erişim:
- `Workflow Snapshot: Workflow Kaydını Başlat`
- `Workflow Snapshot: AI Asistanı Aç`
- `Workflow Snapshot: Tüm Workflowları Göster`

### Ayarlar (Settings)
```json
{
  "workflowSnapshot.autoSave": true,
  "workflowSnapshot.outputFormat": "markdown",
  "workflowSnapshot.aiProvider": "local"
}
```

### Keyboard Shortcuts (Önerilen)
```json
{
  "key": "ctrl+alt+r",
  "command": "workflowSnapshot.startRecording"
},
{
  "key": "ctrl+alt+s",
  "command": "workflowSnapshot.stopRecording"
}
```

## 🔧 Sorun Giderme

### Dashboard Görünmüyor
- Explorer sekmesinin açık olduğundan emin olun
- Extension'ın yüklendiğini kontrol edin (`Ctrl+Shift+X`)
- VS Code'u yeniden başlatın

### Replay Çalışmıyor
- Hedef workspace'in açık olduğundan emin olun
- Dosya yollarının doğru olduğunu kontrol edin
- Terminal komutları için gerekli araçların yüklü olduğunu kontrol edin

### AI Asistanı Açılmıyor
- Webview'ların etkin olduğundan emin olun
- Extension security settings'i kontrol edin

##  İpuçları

### Verimli Kullanım
1. **Küçük Oturumlar**: 30-60 dakikalık kayıtlar daha yönetilebilir
2. **Anlamlı İsimler**: Workflow dosyalarına açıklayıcı isimler verin
3. **Düzenli Temizlik**: Eski workflow'ları periyodik olarak silin
4. **AI Önerilerini Takip Edin**: Sürekli iyileştirme için AI asistanını kullanın

### Takım Çalışması
- Workflow raporlarını team channel'ınızda paylaşın
- Code review'lar için workflow'ları kullanın
- Onboarding sürecinde yeni gelenlere örnek workflow'lar verin

##  Kaynaklar

- [GitHub Repository](https://github.com/your-repo/workflow-snapshot-replay)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Issue Tracker](https://github.com/your-repo/workflow-snapshot-replay/issues)

---

