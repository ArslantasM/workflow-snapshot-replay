#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Topçu Mermisi Atış Analizi Test Senaryoları
Farklı atış durumlarını test etmek için örnek senaryolar
"""

import sys
import os

# Ana modülü import et
try:
    from artillery_analysis import BallisticCalculator, ArtilleryAnalysisGUI
    import tkinter as tk
    import matplotlib.pyplot as plt
    import numpy as np
except ImportError as e:
    print(f"❌ Gerekli kütüphane bulunamadı: {e}")
    print("Lütfen requirements.txt dosyasındaki kütüphaneleri kurun:")
    print("pip install matplotlib numpy scipy")
    sys.exit(1)

def test_basic_calculations():
    """Temel hesaplamaları test et"""
    print("🧪 Temel Hesaplama Testleri")
    print("=" * 40)
    
    calculator = BallisticCalculator()
    
    # Test senaryoları
    test_cases = [
        {
            "name": "Standart 155mm Obüs",
            "v0": 300,
            "angle": 45,
            "mass": 15.0,
            "diameter": 0.155,
            "drag_coeff": 0.47
        },
        {
            "name": "Yüksek Hızlı Atış",
            "v0": 500,
            "angle": 30,
            "mass": 10.0,
            "diameter": 0.120,
            "drag_coeff": 0.35
        },
        {
            "name": "Düşük Açı Atış",
            "v0": 250,
            "angle": 15,
            "mass": 20.0,
            "diameter": 0.200,
            "drag_coeff": 0.55
        }
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📋 Test {i}: {test_case['name']}")
        print("-" * 30)
        
        trajectory = calculator.calculate_trajectory(
            test_case['v0'], test_case['angle'], test_case['drag_coeff'],
            test_case['mass'], test_case['diameter']
        )
        
        print(f"• Maksimum Menzil: {trajectory['max_range']:.1f} m")
        print(f"• Maksimum Yükseklik: {trajectory['max_height']:.1f} m")
        print(f"• Uçuş Süresi: {trajectory['flight_time']:.1f} s")
        print(f"• İsabet Hızı: {trajectory['impact_velocity']:.1f} m/s")
        
        # Sonuç değerlendirmesi
        if trajectory['max_range'] > 3000:
            print("✅ Uzun menzil atış başarılı")
        elif trajectory['max_range'] > 1000:
            print("🟡 Orta menzil atış")
        else:
            print("🔴 Kısa menzil atış")

def test_optimal_angle_finding():
    """Optimal açı bulma testleri"""
    print("\n\n🎯 Optimal Açı Bulma Testleri")
    print("=" * 40)
    
    calculator = BallisticCalculator()
    
    # Farklı mesafeler için optimal açıları bul
    target_distances = [1000, 2000, 3000, 5000, 8000]
    v0 = 350  # Sabit hız
    
    print(f"İlk Hız: {v0} m/s için optimal açılar:")
    print()
    
    for distance in target_distances:
        optimal_angle, error = calculator.calculate_optimal_angle(v0, distance)
        
        print(f"📏 {distance}m mesafe:")
        print(f"  • Optimal Açı: {optimal_angle}°")
        print(f"  • Menzil Hatası: {error:.1f} m")
        
        # Doğrulama hesabı
        verification = calculator.calculate_trajectory(v0, optimal_angle)
        actual_range = verification['max_range']
        
        print(f"  • Gerçek Menzil: {actual_range:.1f} m")
        print(f"  • Doğruluk: {100 - (abs(actual_range - distance) / distance * 100):.1f}%")
        print()

def test_environmental_effects():
    """Çevresel etkileri test et"""
    print("\n🌪️ Çevresel Etki Testleri")
    print("=" * 40)
    
    calculator = BallisticCalculator()
    
    # Temel parametreler
    base_params = {
        "v0": 300,
        "angle": 45,
        "mass": 15.0,
        "diameter": 0.155
    }
    
    # Farklı çevresel koşullar
    environmental_conditions = [
        {"name": "İdeal Koşullar", "drag": 0.0, "wind": 0, "elevation": 0},
        {"name": "Normal Hava Direnci", "drag": 0.47, "wind": 0, "elevation": 0},
        {"name": "Rüzgarlı Hava", "drag": 0.47, "wind": 10, "elevation": 0},
        {"name": "Yüksek Rakım", "drag": 0.47, "wind": 0, "elevation": 500},
        {"name": "Zorlu Koşullar", "drag": 0.55, "wind": 15, "elevation": 200}
    ]
    
    print("Çevresel koşulların atış performansına etkisi:")
    print()
    
    for condition in environmental_conditions:
        trajectory = calculator.calculate_trajectory(
            base_params["v0"], base_params["angle"], 
            condition["drag"], base_params["mass"], 
            base_params["diameter"], condition["wind"], 
            condition["elevation"]
        )
        
        print(f"🌤️ {condition['name']}:")
        print(f"  • Menzil: {trajectory['max_range']:.1f} m")
        print(f"  • Max Yükseklik: {trajectory['max_height']:.1f} m")
        print(f"  • Uçuş Süresi: {trajectory['flight_time']:.1f} s")
        
        # Enerji kaybı hesapla
        initial_ke = 0.5 * base_params["mass"] * (base_params["v0"] ** 2)
        impact_ke = 0.5 * base_params["mass"] * (trajectory['impact_velocity'] ** 2)
        energy_loss_percent = ((initial_ke - impact_ke) / initial_ke) * 100
        
        print(f"  • Enerji Kaybı: {energy_loss_percent:.1f}%")
        print()

def test_hit_probability():
    """İsabet olasılığı testleri"""
    print("\n🎯 İsabet Olasılığı Testleri")
    print("=" * 40)
    
    calculator = BallisticCalculator()
    
    # Test atışı
    trajectory = calculator.calculate_trajectory(300, 45, 0.47, 15.0, 0.155)
    actual_range = trajectory['max_range']
    
    # Farklı hedef boyutları ve konumları
    test_targets = [
        {"name": "Büyük Hedef (50m)", "x": actual_range, "y": 0, "radius": 50},
        {"name": "Orta Hedef (20m)", "x": actual_range, "y": 0, "radius": 20},
        {"name": "Küçük Hedef (10m)", "x": actual_range, "y": 0, "radius": 10},
        {"name": "Hassas Hedef (5m)", "x": actual_range, "y": 0, "radius": 5},
        {"name": "Uzak Hedef", "x": actual_range + 100, "y": 0, "radius": 20},
        {"name": "Yakın Hedef", "x": actual_range - 100, "y": 0, "radius": 20},
        {"name": "Yüksek Hedef", "x": actual_range, "y": 50, "radius": 15}
    ]
    
    print(f"Mermi menzili: {actual_range:.1f} m")
    print("Farklı hedefler için isabet olasılıkları:")
    print()
    
    for target in test_targets:
        hit_prob = calculator.calculate_hit_probability(
            trajectory, target["x"], target["y"], target["radius"]
        )
        
        print(f"🎯 {target['name']}:")
        print(f"  • Konum: ({target['x']:.0f}, {target['y']:.0f}) m")
        print(f"  • Yarıçap: {target['radius']} m")
        print(f"  • İsabet Olasılığı: {hit_prob:.1%}")
        
        if hit_prob > 0.8:
            print("  • Değerlendirme: ✅ Çok yüksek isabet şansı")
        elif hit_prob > 0.5:
            print("  • Değerlendirme: 🟡 İyi isabet şansı")
        elif hit_prob > 0.2:
            print("  • Değerlendirme: 🟠 Orta isabet şansı")
        else:
            print("  • Değerlendirme: 🔴 Düşük isabet şansı")
        print()

def run_performance_benchmark():
    """Performans benchmark'ı"""
    print("\n⚡ Performans Benchmark'ı")
    print("=" * 40)
    
    import time
    
    calculator = BallisticCalculator()
    
    # Hesaplama sayısı
    num_calculations = 1000
    
    print(f"{num_calculations} trajectory hesaplaması yapılıyor...")
    
    start_time = time.time()
    
    for i in range(num_calculations):
        # Rastgele parametreler
        v0 = 200 + (i % 300)
        angle = 15 + (i % 60)
        
        trajectory = calculator.calculate_trajectory(v0, angle, 0.47, 15.0, 0.155)
    
    end_time = time.time()
    elapsed_time = end_time - start_time
    
    print(f"✅ {num_calculations} hesaplama tamamlandı")
    print(f"⏱️ Toplam süre: {elapsed_time:.2f} saniye")
    print(f"🚀 Hesaplama hızı: {num_calculations / elapsed_time:.1f} hesaplama/saniye")
    print(f"⚡ Ortalama hesaplama süresi: {(elapsed_time / num_calculations) * 1000:.2f} ms")

def create_test_gui():
    """Test GUI'sini başlat"""
    print("\n🖥️ GUI Test Modu Başlatılıyor...")
    print("=" * 40)
    
    try:
        root = tk.Tk()
        app = ArtilleryAnalysisGUI(root)
        
        # Test verilerini yükle
        app.v0_var.set("350")
        app.angle_var.set("42")
        app.mass_var.set("15.5")
        app.diameter_var.set("155")
        app.drag_var.set("0.47")
        app.wind_var.set("5")
        app.elevation_var.set("100")
        app.target_x_var.set("4500")
        app.target_y_var.set("0")
        app.target_radius_var.set("25")
        
        print("✅ GUI başarıyla başlatıldı!")
        print("📋 Test verileri otomatik olarak yüklendi")
        print("🎯 'Atış Hesapla' butonuna basarak test edebilirsiniz")
        
        root.mainloop()
        
    except Exception as e:
        print(f"❌ GUI başlatma hatası: {e}")

def main():
    """Ana test fonksiyonu"""
    print("🎯 TOPÇU MERMİSİ ATIŞ ANALİZİ - TEST SÜİTİ")
    print("=" * 60)
    print()
    
    try:
        # Tüm testleri çalıştır
        test_basic_calculations()
        test_optimal_angle_finding()
        test_environmental_effects()
        test_hit_probability()
        run_performance_benchmark()
        
        print("\n" + "=" * 60)
        print("✅ TÜM TESTLER BAŞARIYLA TAMAMLANDI!")
        print("=" * 60)
        
        # GUI testi için sor
        response = input("\n🖥️ GUI test modunu başlatmak istiyor musunuz? (e/h): ")
        if response.lower() in ['e', 'evet', 'y', 'yes']:
            create_test_gui()
        else:
            print("👋 Test süreci tamamlandı!")
            
    except Exception as e:
        print(f"\n❌ Test hatası: {e}")
        print("Lütfen gerekli kütüphanelerin kurulu olduğundan emin olun.")

if __name__ == "__main__":
    main()
