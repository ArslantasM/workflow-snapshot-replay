# 🚀 Workflow Snapshot & Replay - Kurulum Kılavuzu

## 📦 Paket Bilgileri

- **Extension Adı**: Workflow Snapshot & Replay
- **Sürüm**: v0.1.0
- **Paket Dosyası**: `workflow-snapshot-replay-0.1.0.vsix`
- **Boyut**: ~93 KB

## 💻 Kurulum Yöntemleri

### Yöntem 1: VS Code ile Kurulum

1. **VS Code'u açın**
2. **Extensions sekmesine** gidin (`Ctrl+Shift+X`)
3. **Üç nokta menüsü** (...) → **"Install from VSIX..."** seçin
4. **`workflow-snapshot-replay-0.1.0.vsix`** dosyasını seçin
5. **"Install"** butonuna tıklayın
6. **VS Code'u yeniden başlatın**

### Yöntem 2: Komut Satırı ile Kurulum

```bash
# VS Code için
code --install-extension workflow-snapshot-replay-0.1.0.vsix

# Cursor için
cursor --install-extension workflow-snapshot-replay-0.1.0.vsix
```

### Yöntem 3: Manuel Kurulum

1. VS Code extensions klasörüne gidin:
   - **Windows**: `%USERPROFILE%\.vscode\extensions\`
   - **macOS**: `~/.vscode/extensions/`
   - **Linux**: `~/.vscode/extensions/`

2. VSIX dosyasını ZIP olarak açın ve içeriğini extensions klasörüne çıkarın

## ✅ Kurulum Doğrulama

### 1. Extension'ın Yüklendiğini Kontrol Edin
- Extensions listesinde **"Workflow Snapshot & Replay"** görünmeli
- Extension enabled (etkin) durumda olmalı

### 2. Dashboard'u Bulun
- **Explorer sekmesi** → **"Workflow Snapshot & Replay"** bölümü
- Dashboard'da şu öğeler görünmeli:
  - 🔴/⚪ Durum göstergesi
  - ▶️ Kayıt Başlat butonu
  - 🔄 Workflow Oynat butonu
  - 🤖 AI Asistanı butonu

### 3. Command Palette'i Test Edin
- `Ctrl+Shift+P` tuşlarına basın
- `"Workflow"` yazın
- Şu komutlar görünmeli:
  - Workflow Snapshot: Workflow Kaydını Başlat
  - Workflow Snapshot: AI Asistanı Aç
  - Workflow Snapshot: Tüm Workflow'ları Göster

## 🎯 İlk Kullanım

### Hızlı Test
1. **Dashboard'dan "▶️ Kayıt Başlat"** tıklayın
2. **Bir dosya oluşturun** (örn: `test.txt`)
3. **Dosyaya bir şeyler yazın**
4. **"⏹️ Kaydı Durdur"** tıklayın
5. **"📋 Rapor Oluştur"** tıklayın
6. **Markdown raporu** otomatik açılmalı

### AI Asistanını Test Edin
1. **Dashboard'dan "🤖 AI Asistanı"** tıklayın
2. **Webview paneli** açılmalı
3. **"Aktif Workflow'u Analiz Et"** butonunu deneyin

## 🔧 Sorun Giderme

### Extension Görünmüyor
```bash
# Extension listesini kontrol edin
code --list-extensions | grep workflow

# Yeniden yükleyin
code --uninstall-extension workflow-tools.workflow-snapshot-replay
code --install-extension workflow-snapshot-replay-0.1.0.vsix
```

### Dashboard Görünmüyor
1. **Explorer sekmesinin açık** olduğundan emin olun
2. **VS Code'u yeniden başlatın**
3. **Extension'ın enabled** olduğunu kontrol edin

### Komutlar Çalışmıyor
1. **Developer Console'u açın**: `Help → Toggle Developer Tools`
2. **Console sekmesinde hata** var mı kontrol edin
3. **Extension'ı disable/enable** yapın

### Dosya İzinleri Sorunu
```bash
# Windows'ta admin olarak çalıştırın
# macOS/Linux'ta sudo kullanmayın, kullanıcı izinleri yeterli
```

## 📊 Sistem Gereksinimleri

### Minimum Gereksinimler
- **VS Code**: v1.74.0 veya üzeri
- **Node.js**: v16.x (extension çalışması için gerekli değil)
- **RAM**: 512 MB boş alan
- **Disk**: 100 MB boş alan

### Önerilen
- **VS Code**: En son sürüm
- **RAM**: 2 GB veya üzeri
- **Disk**: 1 GB boş alan (workflow dosyaları için)

## 🔄 Güncelleme

### Yeni Sürüm Kurulumu
1. **Eski sürümü kaldırın**:
   ```bash
   code --uninstall-extension workflow-tools.workflow-snapshot-replay
   ```

2. **Yeni sürümü yükleyin**:
   ```bash
   code --install-extension workflow-snapshot-replay-0.x.x.vsix
   ```

### Ayarları Koruma
- Workflow dosyaları otomatik korunur
- VS Code settings korunur
- AI asistanı ayarları korunur

## 📚 Sonraki Adımlar

### Öğrenme Kaynakları
1. **KULLANIM_KILAVUZU.md** - Detaylı kullanım örnekleri
2. **README.md** - Genel bilgiler ve özellikler
3. **CHANGELOG.md** - Sürüm geçmişi

### Topluluk
- **GitHub Issues**: Bug report ve feature request
- **Discussions**: Sorular ve tartışmalar
- **Wiki**: İleri düzey kullanım örnekleri

## 📞 Destek

### Sorun Bildirimi
1. **GitHub Issues** sayfasını kullanın: https://github.com/ArslantasM/workflow-snapshot-replay/issues
2. **Şu bilgileri ekleyin**:
   - VS Code sürümü
   - Extension sürümü
   - İşletim sistemi
   - Hata mesajları
   - Yeniden üretme adımları

### Feature Request
- Yeni özellik önerileri için GitHub Issues: https://github.com/ArslantasM/workflow-snapshot-replay/issues
- Detaylı açıklama ve use case ekleyin

---

**Kurulumda başarılar! 🎉**

Extension'ı kullanmaya başlamak için KULLANIM_KILAVUZU.md dosyasını inceleyebilirsiniz.
