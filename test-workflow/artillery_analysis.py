#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Topçu Mermisi Atış Analizi Sistemi
Namlu açısı, mesafe ve konum analizleri yapan gelişmiş bir uygulama

Özellikler:
- Balistik hesaplamalar
- Trajectory analizi
- Grafik görselleştirme
- Interaktif GUI
- Detaylı analiz raporları
"""

import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
import numpy as np
import math
import json
from datetime import datetime
import os

class BallisticCalculator:
    """Balistik hesaplamalar için ana sınıf"""
    
    def __init__(self):
        # Fiziksel sabitler
        self.g = 9.81  # Yerçekimi ivmesi (m/s²)
        self.air_density = 1.225  # Hava yoğunluğu (kg/m³)
        
    def calculate_trajectory(self, v0, angle_deg, drag_coeff=0.0, mass=1.0, 
                           diameter=0.1, wind_speed=0.0, elevation=0.0):
        """
        Mermi yörüngesini hesaplar
        
        Args:
            v0: İlk hız (m/s)
            angle_deg: Namlu açısı (derece)
            drag_coeff: Hava direnci katsayısı
            mass: Mermi kütlesi (kg)
            diameter: Mermi çapı (m)
            wind_speed: Rüzgar hızı (m/s)
            elevation: Yükseklik (m)
        
        Returns:
            dict: Trajectory verileri
        """
        angle_rad = math.radians(angle_deg)
        
        # Başlangıç hız bileşenleri
        v0x = v0 * math.cos(angle_rad)
        v0y = v0 * math.sin(angle_rad)
        
        # Hava direnci hesaplamaları
        area = math.pi * (diameter / 2) ** 2
        drag_factor = 0.5 * self.air_density * drag_coeff * area / mass
        
        # Zaman adımı ve maksimum zaman
        dt = 0.01
        max_time = 2 * v0y / self.g + 10  # Güvenlik marjı
        
        # Veriler için listeler
        times = []
        x_positions = []
        y_positions = []
        velocities = []
        angles = []
        
        # Başlangıç değerleri
        t = 0
        x, y = 0, elevation
        vx, vy = v0x, v0y
        
        while y >= 0 and t <= max_time:
            # Mevcut değerleri kaydet
            times.append(t)
            x_positions.append(x)
            y_positions.append(y)
            
            # Hız ve açı hesapla
            v_total = math.sqrt(vx**2 + vy**2)
            current_angle = math.degrees(math.atan2(vy, vx))
            velocities.append(v_total)
            angles.append(current_angle)
            
            # Hava direnci kuvvetleri
            if drag_coeff > 0:
                drag_force = drag_factor * v_total
                drag_x = -drag_force * (vx / v_total) if v_total > 0 else 0
                drag_y = -drag_force * (vy / v_total) if v_total > 0 else 0
            else:
                drag_x = drag_y = 0
            
            # Rüzgar etkisi
            wind_effect = wind_speed * dt
            
            # Hız güncellemesi
            ax = drag_x + wind_effect
            ay = -self.g + drag_y
            
            vx += ax * dt
            vy += ay * dt
            
            # Konum güncellemesi
            x += vx * dt
            y += vy * dt
            
            t += dt
        
        # Analiz sonuçları
        max_height = max(y_positions) if y_positions else 0
        max_range = max(x_positions) if x_positions else 0
        flight_time = times[-1] if times else 0
        
        return {
            'times': times,
            'x_positions': x_positions,
            'y_positions': y_positions,
            'velocities': velocities,
            'angles': angles,
            'max_height': max_height,
            'max_range': max_range,
            'flight_time': flight_time,
            'impact_velocity': velocities[-1] if velocities else 0,
            'impact_angle': angles[-1] if angles else 0
        }
    
    def calculate_optimal_angle(self, v0, target_distance, elevation=0.0):
        """Belirli bir mesafe için optimal açıyı hesaplar"""
        best_angle = 45
        min_error = float('inf')
        
        for angle in range(1, 90):
            trajectory = self.calculate_trajectory(v0, angle, elevation=elevation)
            error = abs(trajectory['max_range'] - target_distance)
            
            if error < min_error:
                min_error = error
                best_angle = angle
        
        return best_angle, min_error
    
    def calculate_hit_probability(self, trajectory, target_x, target_y, target_radius=5.0):
        """Hedefe isabet olasılığını hesaplar"""
        if not trajectory['x_positions']:
            return 0.0
        
        # En yakın noktayı bul
        min_distance = float('inf')
        for x, y in zip(trajectory['x_positions'], trajectory['y_positions']):
            distance = math.sqrt((x - target_x)**2 + (y - target_y)**2)
            min_distance = min(min_distance, distance)
        
        # Olasılık hesapla (basit model)
        if min_distance <= target_radius:
            return max(0.0, 1.0 - (min_distance / target_radius))
        else:
            return max(0.0, 1.0 - (min_distance / (target_radius * 3)))

class ArtilleryAnalysisGUI:
    """Ana GUI sınıfı"""
    
    def __init__(self, root):
        self.root = root
        self.root.title("🎯 Topçu Mermisi Atış Analizi Sistemi")
        self.root.geometry("1400x900")
        self.root.configure(bg='#2c3e50')
        
        # Balistik hesaplayıcı
        self.calculator = BallisticCalculator()
        
        # Mevcut trajectory verisi
        self.current_trajectory = None
        
        # Stil ayarları
        self.setup_styles()
        
        # GUI bileşenlerini oluştur
        self.create_widgets()
        
        # Başlangıç değerleri
        self.load_default_values()
    
    def setup_styles(self):
        """GUI stillerini ayarla"""
        style = ttk.Style()
        style.theme_use('clam')
        
        # Özel stiller
        style.configure('Title.TLabel', font=('Arial', 16, 'bold'), 
                       background='#2c3e50', foreground='#ecf0f1')
        style.configure('Header.TLabel', font=('Arial', 12, 'bold'),
                       background='#34495e', foreground='#ecf0f1')
        style.configure('Info.TLabel', font=('Arial', 10),
                       background='#34495e', foreground='#bdc3c7')
    
    def create_widgets(self):
        """GUI bileşenlerini oluştur"""
        # Ana başlık
        title_frame = tk.Frame(self.root, bg='#2c3e50')
        title_frame.pack(fill='x', padx=10, pady=5)
        
        title_label = ttk.Label(title_frame, text="🎯 TOPÇU MERMİSİ ATIŞ ANALİZİ SİSTEMİ",
                               style='Title.TLabel')
        title_label.pack()
        
        # Ana container
        main_frame = tk.Frame(self.root, bg='#2c3e50')
        main_frame.pack(fill='both', expand=True, padx=10, pady=5)
        
        # Sol panel - Kontroller
        self.create_control_panel(main_frame)
        
        # Sağ panel - Grafik ve sonuçlar
        self.create_results_panel(main_frame)
    
    def create_control_panel(self, parent):
        """Kontrol panelini oluştur"""
        control_frame = tk.Frame(parent, bg='#34495e', relief='raised', bd=2)
        control_frame.pack(side='left', fill='y', padx=(0, 5))
        
        # Başlık
        ttk.Label(control_frame, text="⚙️ ATIŞ PARAMETRELERİ", 
                 style='Header.TLabel').pack(pady=10)
        
        # Temel parametreler
        self.create_basic_params(control_frame)
        
        # Gelişmiş parametreler
        self.create_advanced_params(control_frame)
        
        # Hedef parametreler
        self.create_target_params(control_frame)
        
        # Butonlar
        self.create_buttons(control_frame)
    
    def create_basic_params(self, parent):
        """Temel parametreleri oluştur"""
        frame = tk.LabelFrame(parent, text="🔧 Temel Parametreler", 
                             bg='#34495e', fg='#ecf0f1', font=('Arial', 10, 'bold'))
        frame.pack(fill='x', padx=10, pady=5)
        
        # İlk hız
        tk.Label(frame, text="İlk Hız (m/s):", bg='#34495e', fg='#bdc3c7').grid(row=0, column=0, sticky='w', padx=5, pady=2)
        self.v0_var = tk.StringVar(value="300")
        tk.Entry(frame, textvariable=self.v0_var, width=10).grid(row=0, column=1, padx=5, pady=2)
        
        # Namlu açısı
        tk.Label(frame, text="Namlu Açısı (°):", bg='#34495e', fg='#bdc3c7').grid(row=1, column=0, sticky='w', padx=5, pady=2)
        self.angle_var = tk.StringVar(value="45")
        tk.Entry(frame, textvariable=self.angle_var, width=10).grid(row=1, column=1, padx=5, pady=2)
        
        # Mermi kütlesi
        tk.Label(frame, text="Mermi Kütlesi (kg):", bg='#34495e', fg='#bdc3c7').grid(row=2, column=0, sticky='w', padx=5, pady=2)
        self.mass_var = tk.StringVar(value="15.0")
        tk.Entry(frame, textvariable=self.mass_var, width=10).grid(row=2, column=1, padx=5, pady=2)
        
        # Mermi çapı
        tk.Label(frame, text="Mermi Çapı (mm):", bg='#34495e', fg='#bdc3c7').grid(row=3, column=0, sticky='w', padx=5, pady=2)
        self.diameter_var = tk.StringVar(value="155")
        tk.Entry(frame, textvariable=self.diameter_var, width=10).grid(row=3, column=1, padx=5, pady=2)
    
    def create_advanced_params(self, parent):
        """Gelişmiş parametreleri oluştur"""
        frame = tk.LabelFrame(parent, text="🌪️ Gelişmiş Parametreler", 
                             bg='#34495e', fg='#ecf0f1', font=('Arial', 10, 'bold'))
        frame.pack(fill='x', padx=10, pady=5)
        
        # Hava direnci
        tk.Label(frame, text="Hava Direnci Kat.:", bg='#34495e', fg='#bdc3c7').grid(row=0, column=0, sticky='w', padx=5, pady=2)
        self.drag_var = tk.StringVar(value="0.47")
        tk.Entry(frame, textvariable=self.drag_var, width=10).grid(row=0, column=1, padx=5, pady=2)
        
        # Rüzgar hızı
        tk.Label(frame, text="Rüzgar Hızı (m/s):", bg='#34495e', fg='#bdc3c7').grid(row=1, column=0, sticky='w', padx=5, pady=2)
        self.wind_var = tk.StringVar(value="0")
        tk.Entry(frame, textvariable=self.wind_var, width=10).grid(row=1, column=1, padx=5, pady=2)
        
        # Yükseklik
        tk.Label(frame, text="Başlangıç Yük. (m):", bg='#34495e', fg='#bdc3c7').grid(row=2, column=0, sticky='w', padx=5, pady=2)
        self.elevation_var = tk.StringVar(value="0")
        tk.Entry(frame, textvariable=self.elevation_var, width=10).grid(row=2, column=1, padx=5, pady=2)
    
    def create_target_params(self, parent):
        """Hedef parametrelerini oluştur"""
        frame = tk.LabelFrame(parent, text="🎯 Hedef Parametreleri", 
                             bg='#34495e', fg='#ecf0f1', font=('Arial', 10, 'bold'))
        frame.pack(fill='x', padx=10, pady=5)
        
        # Hedef mesafesi
        tk.Label(frame, text="Hedef Mesafesi (m):", bg='#34495e', fg='#bdc3c7').grid(row=0, column=0, sticky='w', padx=5, pady=2)
        self.target_x_var = tk.StringVar(value="5000")
        tk.Entry(frame, textvariable=self.target_x_var, width=10).grid(row=0, column=1, padx=5, pady=2)
        
        # Hedef yüksekliği
        tk.Label(frame, text="Hedef Yüksekliği (m):", bg='#34495e', fg='#bdc3c7').grid(row=1, column=0, sticky='w', padx=5, pady=2)
        self.target_y_var = tk.StringVar(value="0")
        tk.Entry(frame, textvariable=self.target_y_var, width=10).grid(row=1, column=1, padx=5, pady=2)
        
        # Hedef yarıçapı
        tk.Label(frame, text="Hedef Yarıçapı (m):", bg='#34495e', fg='#bdc3c7').grid(row=2, column=0, sticky='w', padx=5, pady=2)
        self.target_radius_var = tk.StringVar(value="10")
        tk.Entry(frame, textvariable=self.target_radius_var, width=10).grid(row=2, column=1, padx=5, pady=2)
    
    def create_buttons(self, parent):
        """Butonları oluştur"""
        button_frame = tk.Frame(parent, bg='#34495e')
        button_frame.pack(fill='x', padx=10, pady=10)
        
        # Hesapla butonu
        tk.Button(button_frame, text="🚀 Atış Hesapla", 
                 command=self.calculate_trajectory,
                 bg='#e74c3c', fg='white', font=('Arial', 10, 'bold')).pack(fill='x', pady=2)
        
        # Optimal açı butonu
        tk.Button(button_frame, text="📐 Optimal Açı Bul", 
                 command=self.find_optimal_angle,
                 bg='#f39c12', fg='white', font=('Arial', 10, 'bold')).pack(fill='x', pady=2)
        
        # Karşılaştırma butonu
        tk.Button(button_frame, text="📊 Açı Karşılaştırması", 
                 command=self.compare_angles,
                 bg='#3498db', fg='white', font=('Arial', 10, 'bold')).pack(fill='x', pady=2)
        
        # Rapor kaydet butonu
        tk.Button(button_frame, text="💾 Rapor Kaydet", 
                 command=self.save_report,
                 bg='#27ae60', fg='white', font=('Arial', 10, 'bold')).pack(fill='x', pady=2)
        
        # Temizle butonu
        tk.Button(button_frame, text="🗑️ Temizle", 
                 command=self.clear_results,
                 bg='#95a5a6', fg='white', font=('Arial', 10, 'bold')).pack(fill='x', pady=2)
    
    def create_results_panel(self, parent):
        """Sonuçlar panelini oluştur"""
        results_frame = tk.Frame(parent, bg='#2c3e50')
        results_frame.pack(side='right', fill='both', expand=True)
        
        # Notebook için tab'lar
        self.notebook = ttk.Notebook(results_frame)
        self.notebook.pack(fill='both', expand=True)
        
        # Grafik tab'ı
        self.create_plot_tab()
        
        # Sonuçlar tab'ı
        self.create_results_tab()
        
        # Analiz tab'ı
        self.create_analysis_tab()
    
    def create_plot_tab(self):
        """Grafik tab'ını oluştur"""
        plot_frame = ttk.Frame(self.notebook)
        self.notebook.add(plot_frame, text="📈 Trajectory Grafiği")
        
        # Matplotlib figure
        self.fig, self.ax = plt.subplots(figsize=(10, 6))
        self.fig.patch.set_facecolor('#2c3e50')
        self.ax.set_facecolor('#34495e')
        
        # Canvas
        self.canvas = FigureCanvasTkAgg(self.fig, plot_frame)
        self.canvas.get_tk_widget().pack(fill='both', expand=True)
        
        # İlk grafik
        self.plot_empty_trajectory()
    
    def create_results_tab(self):
        """Sonuçlar tab'ını oluştur"""
        results_frame = ttk.Frame(self.notebook)
        self.notebook.add(results_frame, text="📋 Detaylı Sonuçlar")
        
        # Scrollable text widget
        text_frame = tk.Frame(results_frame)
        text_frame.pack(fill='both', expand=True, padx=10, pady=10)
        
        self.results_text = tk.Text(text_frame, bg='#34495e', fg='#ecf0f1',
                                   font=('Courier', 10), wrap='word')
        scrollbar = tk.Scrollbar(text_frame, orient='vertical', command=self.results_text.yview)
        self.results_text.configure(yscrollcommand=scrollbar.set)
        
        self.results_text.pack(side='left', fill='both', expand=True)
        scrollbar.pack(side='right', fill='y')
    
    def create_analysis_tab(self):
        """Analiz tab'ını oluştur"""
        analysis_frame = ttk.Frame(self.notebook)
        self.notebook.add(analysis_frame, text="🔍 Performans Analizi")
        
        # Analiz sonuçları için text widget
        text_frame = tk.Frame(analysis_frame)
        text_frame.pack(fill='both', expand=True, padx=10, pady=10)
        
        self.analysis_text = tk.Text(text_frame, bg='#34495e', fg='#ecf0f1',
                                    font=('Courier', 10), wrap='word')
        scrollbar2 = tk.Scrollbar(text_frame, orient='vertical', command=self.analysis_text.yview)
        self.analysis_text.configure(yscrollcommand=scrollbar2.set)
        
        self.analysis_text.pack(side='left', fill='both', expand=True)
        scrollbar2.pack(side='right', fill='y')
    
    def load_default_values(self):
        """Varsayılan değerleri yükle"""
        self.results_text.insert('1.0', "🎯 Topçu Mermisi Atış Analizi Sistemi\n")
        self.results_text.insert('end', "=" * 50 + "\n\n")
        self.results_text.insert('end', "📋 Hesaplama yapmak için parametreleri girin ve 'Atış Hesapla' butonuna basın.\n\n")
        
        self.analysis_text.insert('1.0', "🔍 Performans Analizi\n")
        self.analysis_text.insert('end', "=" * 30 + "\n\n")
        self.analysis_text.insert('end', "📊 Analiz sonuçları burada görüntülenecek.\n\n")
    
    def get_parameters(self):
        """GUI'den parametreleri al"""
        try:
            params = {
                'v0': float(self.v0_var.get()),
                'angle_deg': float(self.angle_var.get()),
                'mass': float(self.mass_var.get()),
                'diameter': float(self.diameter_var.get()) / 1000,  # mm to m
                'drag_coeff': float(self.drag_var.get()),
                'wind_speed': float(self.wind_var.get()),
                'elevation': float(self.elevation_var.get()),
                'target_x': float(self.target_x_var.get()),
                'target_y': float(self.target_y_var.get()),
                'target_radius': float(self.target_radius_var.get())
            }
            return params
        except ValueError as e:
            messagebox.showerror("Hata", f"Geçersiz parametre değeri: {e}")
            return None
    
    def calculate_trajectory(self):
        """Trajectory hesapla ve görüntüle"""
        params = self.get_parameters()
        if not params:
            return
        
        try:
            # Trajectory hesapla
            self.current_trajectory = self.calculator.calculate_trajectory(
                params['v0'], params['angle_deg'], params['drag_coeff'],
                params['mass'], params['diameter'], params['wind_speed'], 
                params['elevation']
            )
            
            # İsabet olasılığını hesapla
            hit_prob = self.calculator.calculate_hit_probability(
                self.current_trajectory, params['target_x'], 
                params['target_y'], params['target_radius']
            )
            
            # Grafik çiz
            self.plot_trajectory()
            
            # Sonuçları göster
            self.display_results(params, hit_prob)
            
            # Analiz yap
            self.perform_analysis(params)
            
        except Exception as e:
            messagebox.showerror("Hata", f"Hesaplama hatası: {e}")
    
    def plot_trajectory(self):
        """Trajectory grafiğini çiz"""
        if not self.current_trajectory:
            return
        
        self.ax.clear()
        
        # Trajectory çiz
        self.ax.plot(self.current_trajectory['x_positions'], 
                    self.current_trajectory['y_positions'],
                    'r-', linewidth=2, label='Mermi Yörüngesi')
        
        # Hedef göster
        params = self.get_parameters()
        if params:
            target_circle = plt.Circle((params['target_x'], params['target_y']), 
                                     params['target_radius'], 
                                     color='yellow', alpha=0.3, label='Hedef Bölgesi')
            self.ax.add_patch(target_circle)
            
            self.ax.plot(params['target_x'], params['target_y'], 
                        'yo', markersize=8, label='Hedef Merkezi')
        
        # Maksimum yükseklik noktası
        max_height_idx = np.argmax(self.current_trajectory['y_positions'])
        max_x = self.current_trajectory['x_positions'][max_height_idx]
        max_y = self.current_trajectory['y_positions'][max_height_idx]
        
        self.ax.plot(max_x, max_y, 'go', markersize=8, label='Maksimum Yükseklik')
        
        # Grafik ayarları
        self.ax.set_xlabel('Mesafe (m)', color='white')
        self.ax.set_ylabel('Yükseklik (m)', color='white')
        self.ax.set_title('Mermi Trajectory Analizi', color='white', fontsize=14, fontweight='bold')
        self.ax.grid(True, alpha=0.3)
        self.ax.legend()
        
        # Renk ayarları
        self.ax.tick_params(colors='white')
        self.ax.spines['bottom'].set_color('white')
        self.ax.spines['top'].set_color('white')
        self.ax.spines['right'].set_color('white')
        self.ax.spines['left'].set_color('white')
        
        # Canvas güncelle
        self.canvas.draw()
    
    def plot_empty_trajectory(self):
        """Boş trajectory grafiği"""
        self.ax.clear()
        self.ax.set_xlabel('Mesafe (m)', color='white')
        self.ax.set_ylabel('Yükseklik (m)', color='white')
        self.ax.set_title('Mermi Trajectory Analizi - Hesaplama Bekleniyor', 
                         color='white', fontsize=14, fontweight='bold')
        self.ax.grid(True, alpha=0.3)
        
        # Renk ayarları
        self.ax.tick_params(colors='white')
        self.ax.spines['bottom'].set_color('white')
        self.ax.spines['top'].set_color('white')
        self.ax.spines['right'].set_color('white')
        self.ax.spines['left'].set_color('white')
        
        self.canvas.draw()
    
    def display_results(self, params, hit_prob):
        """Sonuçları görüntüle"""
        self.results_text.delete('1.0', 'end')
        
        # Başlık
        self.results_text.insert('end', "🎯 ATIŞ ANALİZİ SONUÇLARI\n")
        self.results_text.insert('end', "=" * 50 + "\n\n")
        
        # Giriş parametreleri
        self.results_text.insert('end', "📋 GİRİŞ PARAMETRELERİ:\n")
        self.results_text.insert('end', f"• İlk Hız: {params['v0']:.1f} m/s\n")
        self.results_text.insert('end', f"• Namlu Açısı: {params['angle_deg']:.1f}°\n")
        self.results_text.insert('end', f"• Mermi Kütlesi: {params['mass']:.1f} kg\n")
        self.results_text.insert('end', f"• Mermi Çapı: {params['diameter']*1000:.0f} mm\n")
        self.results_text.insert('end', f"• Hava Direnci Kat.: {params['drag_coeff']:.2f}\n")
        self.results_text.insert('end', f"• Rüzgar Hızı: {params['wind_speed']:.1f} m/s\n")
        self.results_text.insert('end', f"• Başlangıç Yükseklik: {params['elevation']:.1f} m\n\n")
        
        # Hesaplama sonuçları
        traj = self.current_trajectory
        self.results_text.insert('end', "🚀 HESAPLAMA SONUÇLARI:\n")
        self.results_text.insert('end', f"• Maksimum Menzil: {traj['max_range']:.1f} m\n")
        self.results_text.insert('end', f"• Maksimum Yükseklik: {traj['max_height']:.1f} m\n")
        self.results_text.insert('end', f"• Uçuş Süresi: {traj['flight_time']:.1f} saniye\n")
        self.results_text.insert('end', f"• İsabet Hızı: {traj['impact_velocity']:.1f} m/s\n")
        self.results_text.insert('end', f"• İsabet Açısı: {traj['impact_angle']:.1f}°\n\n")
        
        # Hedef analizi
        self.results_text.insert('end', "🎯 HEDEF ANALİZİ:\n")
        self.results_text.insert('end', f"• Hedef Mesafesi: {params['target_x']:.1f} m\n")
        self.results_text.insert('end', f"• Hedef Yüksekliği: {params['target_y']:.1f} m\n")
        self.results_text.insert('end', f"• Hedef Yarıçapı: {params['target_radius']:.1f} m\n")
        self.results_text.insert('end', f"• İsabet Olasılığı: {hit_prob:.1%}\n\n")
        
        # Menzil farkı
        range_diff = abs(traj['max_range'] - params['target_x'])
        self.results_text.insert('end', f"📏 Menzil Farkı: {range_diff:.1f} m\n")
        
        if range_diff < 50:
            self.results_text.insert('end', "✅ Mükemmel atış! Hedef menzil aralığında.\n")
        elif range_diff < 100:
            self.results_text.insert('end', "🟡 İyi atış! Küçük düzeltme gerekebilir.\n")
        else:
            self.results_text.insert('end', "🔴 Açı veya hız düzeltmesi gerekli.\n")
    
    def perform_analysis(self, params):
        """Performans analizi yap"""
        self.analysis_text.delete('1.0', 'end')
        
        traj = self.current_trajectory
        
        # Başlık
        self.analysis_text.insert('end', "🔍 PERFORMANS ANALİZİ\n")
        self.analysis_text.insert('end', "=" * 40 + "\n\n")
        
        # Enerji analizi
        kinetic_energy_initial = 0.5 * params['mass'] * (params['v0'] ** 2)
        kinetic_energy_impact = 0.5 * params['mass'] * (traj['impact_velocity'] ** 2)
        energy_loss = kinetic_energy_initial - kinetic_energy_impact
        energy_loss_percent = (energy_loss / kinetic_energy_initial) * 100
        
        self.analysis_text.insert('end', "⚡ ENERJİ ANALİZİ:\n")
        self.analysis_text.insert('end', f"• Başlangıç Kinetik Enerji: {kinetic_energy_initial/1000:.1f} kJ\n")
        self.analysis_text.insert('end', f"• İsabet Kinetik Enerji: {kinetic_energy_impact/1000:.1f} kJ\n")
        self.analysis_text.insert('end', f"• Enerji Kaybı: {energy_loss/1000:.1f} kJ ({energy_loss_percent:.1f}%)\n\n")
        
        # Balistik analiz
        self.analysis_text.insert('end', "📊 BALİSTİK ANALİZ:\n")
        
        # Optimal açı karşılaştırması
        optimal_angle, _ = self.calculator.calculate_optimal_angle(
            params['v0'], params['target_x'], params['elevation'])
        
        angle_diff = abs(params['angle_deg'] - optimal_angle)
        self.analysis_text.insert('end', f"• Mevcut Açı: {params['angle_deg']:.1f}°\n")
        self.analysis_text.insert('end', f"• Optimal Açı: {optimal_angle:.1f}°\n")
        self.analysis_text.insert('end', f"• Açı Farkı: {angle_diff:.1f}°\n\n")
        
        # Performans değerlendirmesi
        self.analysis_text.insert('end', "🎖️ PERFORMANS DEĞERLENDİRMESİ:\n")
        
        # Menzil performansı
        range_efficiency = min(100, (params['target_x'] / traj['max_range']) * 100)
        self.analysis_text.insert('end', f"• Menzil Verimliliği: {range_efficiency:.1f}%\n")
        
        # Açı performansı
        angle_performance = max(0, 100 - (angle_diff * 2))
        self.analysis_text.insert('end', f"• Açı Performansı: {angle_performance:.1f}%\n")
        
        # Genel performans
        overall_performance = (range_efficiency + angle_performance) / 2
        self.analysis_text.insert('end', f"• Genel Performans: {overall_performance:.1f}%\n\n")
        
        # Öneriler
        self.analysis_text.insert('end', "💡 ÖNERİLER:\n")
        
        if angle_diff > 5:
            self.analysis_text.insert('end', f"• Açıyı {optimal_angle:.1f}° olarak ayarlayın\n")
        
        if range_efficiency < 90:
            if traj['max_range'] < params['target_x']:
                self.analysis_text.insert('end', "• Daha yüksek açı veya hız kullanın\n")
            else:
                self.analysis_text.insert('end', "• Daha düşük açı veya hız kullanın\n")
        
        if params['wind_speed'] != 0:
            self.analysis_text.insert('end', "• Rüzgar etkisini hesaba katın\n")
        
        if overall_performance > 90:
            self.analysis_text.insert('end', "✅ Mükemmel atış parametreleri!\n")
        elif overall_performance > 70:
            self.analysis_text.insert('end', "🟡 İyi parametreler, küçük iyileştirmeler yapılabilir\n")
        else:
            self.analysis_text.insert('end', "🔴 Parametreler önemli ölçüde iyileştirilmeli\n")
    
    def find_optimal_angle(self):
        """Optimal açıyı bul ve göster"""
        params = self.get_parameters()
        if not params:
            return
        
        try:
            optimal_angle, error = self.calculator.calculate_optimal_angle(
                params['v0'], params['target_x'], params['elevation'])
            
            # Sonucu göster
            message = f"🎯 OPTIMAL AÇI ANALİZİ\n\n"
            message += f"Hedef Mesafe: {params['target_x']:.1f} m\n"
            message += f"Optimal Açı: {optimal_angle:.1f}°\n"
            message += f"Menzil Hatası: {error:.1f} m\n\n"
            message += f"Mevcut açı ({params['angle_deg']:.1f}°) yerine "
            message += f"{optimal_angle:.1f}° kullanmanız önerilir."
            
            messagebox.showinfo("Optimal Açı", message)
            
            # Açıyı otomatik olarak ayarla
            response = messagebox.askyesno("Açı Ayarlama", 
                                         "Optimal açıyı otomatik olarak ayarlamak istiyor musunuz?")
            if response:
                self.angle_var.set(str(optimal_angle))
                self.calculate_trajectory()
                
        except Exception as e:
            messagebox.showerror("Hata", f"Optimal açı hesaplama hatası: {e}")
    
    def compare_angles(self):
        """Farklı açıları karşılaştır"""
        params = self.get_parameters()
        if not params:
            return
        
        try:
            # Farklı açılar için hesapla
            angles = [15, 30, 45, 60, 75]
            trajectories = []
            
            for angle in angles:
                traj = self.calculator.calculate_trajectory(
                    params['v0'], angle, params['drag_coeff'],
                    params['mass'], params['diameter'], params['wind_speed'], 
                    params['elevation']
                )
                trajectories.append((angle, traj))
            
            # Grafik çiz
            self.ax.clear()
            
            colors = ['red', 'blue', 'green', 'orange', 'purple']
            for i, (angle, traj) in enumerate(trajectories):
                self.ax.plot(traj['x_positions'], traj['y_positions'],
                           color=colors[i], linewidth=2, 
                           label=f'{angle}° (Menzil: {traj["max_range"]:.0f}m)')
            
            # Hedef göster
            target_circle = plt.Circle((params['target_x'], params['target_y']), 
                                     params['target_radius'], 
                                     color='yellow', alpha=0.3, label='Hedef')
            self.ax.add_patch(target_circle)
            
            # Grafik ayarları
            self.ax.set_xlabel('Mesafe (m)', color='white')
            self.ax.set_ylabel('Yükseklik (m)', color='white')
            self.ax.set_title('Açı Karşılaştırması', color='white', fontsize=14, fontweight='bold')
            self.ax.grid(True, alpha=0.3)
            self.ax.legend()
            
            # Renk ayarları
            self.ax.tick_params(colors='white')
            for spine in self.ax.spines.values():
                spine.set_color('white')
            
            self.canvas.draw()
            
            # Sonuçları göster
            self.results_text.delete('1.0', 'end')
            self.results_text.insert('end', "📊 AÇI KARŞILAŞTIRMASI\n")
            self.results_text.insert('end', "=" * 40 + "\n\n")
            
            for angle, traj in trajectories:
                hit_prob = self.calculator.calculate_hit_probability(
                    traj, params['target_x'], params['target_y'], params['target_radius']
                )
                
                self.results_text.insert('end', f"🎯 {angle}° Açı:\n")
                self.results_text.insert('end', f"  • Menzil: {traj['max_range']:.1f} m\n")
                self.results_text.insert('end', f"  • Max Yükseklik: {traj['max_height']:.1f} m\n")
                self.results_text.insert('end', f"  • Uçuş Süresi: {traj['flight_time']:.1f} s\n")
                self.results_text.insert('end', f"  • İsabet Olasılığı: {hit_prob:.1%}\n\n")
            
        except Exception as e:
            messagebox.showerror("Hata", f"Karşılaştırma hatası: {e}")
    
    def save_report(self):
        """Analiz raporunu kaydet"""
        if not self.current_trajectory:
            messagebox.showwarning("Uyarı", "Önce bir hesaplama yapmalısınız!")
            return
        
        try:
            # Dosya adı oluştur
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"atis_analizi_{timestamp}.json"
            
            # Dosya kaydet dialog'u
            file_path = filedialog.asksaveasfilename(
                defaultextension=".json",
                filetypes=[("JSON files", "*.json"), ("All files", "*.*")],
                initialvalue=filename
            )
            
            if file_path:
                # Rapor verilerini hazırla
                params = self.get_parameters()
                
                report_data = {
                    "timestamp": datetime.now().isoformat(),
                    "parameters": params,
                    "trajectory": self.current_trajectory,
                    "analysis": {
                        "kinetic_energy_initial": 0.5 * params['mass'] * (params['v0'] ** 2),
                        "kinetic_energy_impact": 0.5 * params['mass'] * (self.current_trajectory['impact_velocity'] ** 2),
                        "hit_probability": self.calculator.calculate_hit_probability(
                            self.current_trajectory, params['target_x'], 
                            params['target_y'], params['target_radius']
                        )
                    }
                }
                
                # JSON dosyası olarak kaydet
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(report_data, f, indent=2, ensure_ascii=False)
                
                messagebox.showinfo("Başarılı", f"Rapor kaydedildi:\n{file_path}")
                
        except Exception as e:
            messagebox.showerror("Hata", f"Rapor kaydetme hatası: {e}")
    
    def clear_results(self):
        """Sonuçları temizle"""
        self.current_trajectory = None
        self.plot_empty_trajectory()
        self.load_default_values()
        messagebox.showinfo("Temizlendi", "Tüm sonuçlar temizlendi.")

def main():
    """Ana fonksiyon"""
    root = tk.Tk()
    app = ArtilleryAnalysisGUI(root)
    
    # Çıkış işlemi
    def on_closing():
        if messagebox.askokcancel("Çıkış", "Uygulamadan çıkmak istediğinizden emin misiniz?"):
            root.destroy()
    
    root.protocol("WM_DELETE_WINDOW", on_closing)
    root.mainloop()

if __name__ == "__main__":
    print("🎯 Topçu Mermisi Atış Analizi Sistemi")
    print("=" * 50)
    print("Sistem başlatılıyor...")
    
    try:
        main()
    except Exception as e:
        print(f"❌ Sistem hatası: {e}")
        input("Çıkmak için Enter tuşuna basın...")
