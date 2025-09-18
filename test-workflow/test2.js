// Gelişmiş Test Dosyası - Karmaşık JavaScript Süreçlerini Test Etmek İçin
console.log("🚀 Gelişmiş Test Başlatılıyor...");

// 1. Sınıf Tanımlaması ve Kalıtım
class BaseProcessor {
    constructor(name) {
        this.name = name;
        this.startTime = Date.now();
        console.log(`📦 ${this.name} işlemcisi oluşturuldu`);
    }

    async process(data) {
        console.log(`⚙️ ${this.name} işlem başlatıldı...`);
        await this.delay(Math.random() * 1000 + 500);
        return `${this.name} tarafından işlendi: ${data}`;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    getExecutionTime() {
        return Date.now() - this.startTime;
    }
}

class AdvancedProcessor extends BaseProcessor {
    constructor(name, complexity = 1) {
        super(name);
        this.complexity = complexity;
        this.processedCount = 0;
    }

    async process(data) {
        console.log(`🔥 Gelişmiş işlem başlatıldı (Karmaşıklık: ${this.complexity})`);
        
        // Karmaşık hesaplama simülasyonu
        for (let i = 0; i < this.complexity * 1000; i++) {
            Math.sqrt(Math.random() * 1000);
        }

        const result = await super.process(data);
        this.processedCount++;
        
        console.log(`✅ İşlem tamamlandı. Toplam işlenen: ${this.processedCount}`);
        return `[ADVANCED] ${result}`;
    }

    async batchProcess(dataArray) {
        console.log(`📊 Toplu işlem başlatıldı: ${dataArray.length} öğe`);
        const results = [];
        
        for (const data of dataArray) {
            try {
                const result = await this.process(data);
                results.push({ success: true, data: result });
            } catch (error) {
                results.push({ success: false, error: error.message });
                console.error(`❌ İşlem hatası: ${error.message}`);
            }
        }
        
        return results;
    }
}

// 2. Promise Chain ve Async/Await Karışımı
async function complexAsyncOperation() {
    console.log("🔄 Karmaşık async işlem başlatıldı...");
    
    const operations = [
        () => fetchData("kullanici-verileri"),
        () => processUserData(),
        () => validateResults(),
        () => saveToDatabase()
    ];

    let result = null;
    for (const operation of operations) {
        try {
            result = await operation();
            console.log(`✓ İşlem tamamlandı: ${operation.name}`);
        } catch (error) {
            console.error(`❌ İşlem hatası: ${error.message}`);
            throw error;
        }
    }
    
    return result;
}

// 3. Simüle edilmiş API çağrıları
async function fetchData(endpoint) {
    console.log(`🌐 API çağrısı yapılıyor: ${endpoint}`);
    await new Promise(resolve => setTimeout(resolve, Math.random() * 800 + 200));
    
    if (Math.random() < 0.1) {
        throw new Error(`API hatası: ${endpoint} erişilemez`);
    }
    
    return {
        endpoint,
        data: `${endpoint} verisi`,
        timestamp: new Date().toISOString(),
        requestId: Math.random().toString(36).substring(7)
    };
}

async function processUserData() {
    console.log("👤 Kullanıcı verileri işleniyor...");
    await new Promise(resolve => setTimeout(resolve, 300));
    return { processed: true, users: Math.floor(Math.random() * 100) };
}

async function validateResults() {
    console.log("🔍 Sonuçlar doğrulanıyor...");
    await new Promise(resolve => setTimeout(resolve, 200));
    
    if (Math.random() < 0.05) {
        throw new Error("Doğrulama hatası: Geçersiz veri formatı");
    }
    
    return { valid: true, score: Math.random() * 100 };
}

async function saveToDatabase() {
    console.log("💾 Veritabanına kaydediliyor...");
    await new Promise(resolve => setTimeout(resolve, 400));
    return { saved: true, recordId: Date.now() };
}

// 4. Event Emitter Simülasyonu
class EventProcessor {
    constructor() {
        this.listeners = {};
        this.eventCount = 0;
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        console.log(`📡 Event yayınlandı: ${event}`);
        this.eventCount++;
        
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Event handler hatası: ${error.message}`);
                }
            });
        }
    }

    getEventCount() {
        return this.eventCount;
    }
}

// 5. Ana Test Fonksiyonu
async function runAdvancedTests() {
    console.log("\n" + "=".repeat(50));
    console.log("🧪 GELİŞMİŞ TEST SÜİTİ BAŞLATIILIYOR");
    console.log("=".repeat(50));

    try {
        // Test 1: Sınıf ve Kalıtım Testi
        console.log("\n📋 Test 1: Sınıf İşlemleri");
        const processor = new AdvancedProcessor("TestProcessor", 3);
        const singleResult = await processor.process("test-verisi-1");
        console.log(`Sonuç: ${singleResult}`);

        // Test 2: Toplu İşlem Testi
        console.log("\n📋 Test 2: Toplu İşlemler");
        const testData = ["veri-1", "veri-2", "veri-3", "veri-4", "veri-5"];
        const batchResults = await processor.batchProcess(testData);
        console.log(`Toplu işlem tamamlandı: ${batchResults.length} sonuç`);

        // Test 3: Karmaşık Async İşlemler
        console.log("\n📋 Test 3: Karmaşık Async İşlemler");
        const complexResult = await complexAsyncOperation();
        console.log(`Karmaşık işlem sonucu:`, complexResult);

        // Test 4: Event System Testi
        console.log("\n📋 Test 4: Event Sistemi");
        const eventProcessor = new EventProcessor();
        
        eventProcessor.on('test-event', (data) => {
            console.log(`🎯 Event alındı: ${JSON.stringify(data)}`);
        });
        
        eventProcessor.on('error-event', (error) => {
            console.log(`⚠️ Hata eventi: ${error}`);
        });

        // Event'leri tetikle
        for (let i = 0; i < 5; i++) {
            eventProcessor.emit('test-event', { 
                id: i, 
                message: `Test mesajı ${i + 1}`,
                timestamp: Date.now()
            });
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Test 5: Paralel İşlemler
        console.log("\n📋 Test 5: Paralel İşlemler");
        const parallelTasks = [
            fetchData("endpoint-1"),
            fetchData("endpoint-2"),
            fetchData("endpoint-3")
        ];

        const parallelResults = await Promise.allSettled(parallelTasks);
        console.log(`Paralel işlemler tamamlandı: ${parallelResults.length} sonuç`);

        // Özet
        console.log("\n" + "=".repeat(50));
        console.log("📊 TEST SONUÇLARI");
        console.log("=".repeat(50));
        console.log(`✅ İşlem süresi: ${processor.getExecutionTime()}ms`);
        console.log(`✅ İşlenen veri sayısı: ${processor.processedCount}`);
        console.log(`✅ Event sayısı: ${eventProcessor.getEventCount()}`);
        console.log(`✅ Paralel görev sayısı: ${parallelResults.length}`);
        console.log("🎉 Tüm testler başarıyla tamamlandı!");

    } catch (error) {
        console.error("❌ Test hatası:", error.message);
        console.error("Stack trace:", error.stack);
    }
}

// 6. Error Handling ve Cleanup
process.on('uncaughtException', (error) => {
    console.error('🚨 Yakalanmamış hata:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 İşlenmemiş Promise reddi:', reason);
});

// Ana fonksiyonu çalıştır
if (require.main === module) {
    runAdvancedTests()
        .then(() => {
            console.log("\n🏁 Test suite tamamlandı!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Fatal hata:", error);
            process.exit(1);
        });
}

module.exports = {
    BaseProcessor,
    AdvancedProcessor,
    EventProcessor,
    runAdvancedTests,
    fetchData,
    complexAsyncOperation
};
