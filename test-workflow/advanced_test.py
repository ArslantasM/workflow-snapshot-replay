#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Gelişmiş Python Test Dosyası
Karmaşık Python özelliklerini test etmek için tasarlanmış kapsamlı bir sistem

Bu dosya şunları içerir:
- Çoklu kalıtım ve mixin'ler
- Async/await programlama
- Decorator'lar ve metaclass'lar
- Context manager'lar
- Generator'lar ve iterator'lar
- Type hints ve dataclass'lar
- Exception handling
- Threading ve multiprocessing
- Design patterns
"""

import asyncio
import threading
import multiprocessing
import time
import functools
import contextlib
import itertools
import json
import pickle
import sqlite3
import logging
import typing
from typing import Dict, List, Optional, Union, Callable, Any, Generic, TypeVar
from dataclasses import dataclass, field
from abc import ABC, abstractmethod
from enum import Enum, auto
from collections import defaultdict, deque, namedtuple
from datetime import datetime, timedelta
from pathlib import Path
import weakref
import gc

# Logging yapılandırması
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('advanced_test.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Type variables
T = TypeVar('T')
K = TypeVar('K')
V = TypeVar('V')

# Enums
class ProcessStatus(Enum):
    """İşlem durumları"""
    PENDING = auto()
    RUNNING = auto()
    COMPLETED = auto()
    FAILED = auto()
    CANCELLED = auto()

class Priority(Enum):
    """Öncelik seviyeleri"""
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    CRITICAL = 4

# Dataclasses
@dataclass(frozen=True)
class TaskResult:
    """Görev sonucu veri yapısı"""
    task_id: str
    status: ProcessStatus
    result: Optional[Any] = None
    error: Optional[str] = None
    execution_time: float = 0.0
    timestamp: datetime = field(default_factory=datetime.now)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class Configuration:
    """Sistem yapılandırması"""
    max_workers: int = 4
    timeout: float = 30.0
    retry_count: int = 3
    debug_mode: bool = False
    cache_size: int = 1000
    batch_size: int = 100
    
    def __post_init__(self):
        if self.max_workers < 1:
            raise ValueError("max_workers en az 1 olmalı")
        if self.timeout <= 0:
            raise ValueError("timeout pozitif olmalı")

# Metaclass
class SingletonMeta(type):
    """Singleton pattern için metaclass"""
    _instances: Dict[type, Any] = {}
    _lock = threading.Lock()
    
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            with cls._lock:
                if cls not in cls._instances:
                    instance = super().__call__(*args, **kwargs)
                    cls._instances[cls] = instance
        return cls._instances[cls]

# Decorators
def measure_time(func: Callable) -> Callable:
    """Fonksiyon çalışma süresini ölçer"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            logger.info(f"{func.__name__} çalıştı - Süre: {execution_time:.4f}s")
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"{func.__name__} hata - Süre: {execution_time:.4f}s - Hata: {e}")
            raise
    return wrapper

def retry(max_attempts: int = 3, delay: float = 1.0):
    """Fonksiyonu belirtilen sayıda yeniden dener"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exception = None
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exception = e
                    if attempt < max_attempts - 1:
                        logger.warning(f"{func.__name__} deneme {attempt + 1} başarısız: {e}")
                        time.sleep(delay)
                    else:
                        logger.error(f"{func.__name__} tüm denemeler başarısız")
            raise last_exception
        return wrapper
    return decorator

def cache_result(max_size: int = 128):
    """Fonksiyon sonuçlarını önbelleğe alır"""
    def decorator(func: Callable) -> Callable:
        cache: Dict[str, Any] = {}
        cache_order = deque()
        
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Cache key oluştur
            key = str(args) + str(sorted(kwargs.items()))
            
            if key in cache:
                logger.debug(f"{func.__name__} cache hit: {key[:50]}...")
                return cache[key]
            
            # Fonksiyonu çalıştır
            result = func(*args, **kwargs)
            
            # Cache'e ekle
            if len(cache) >= max_size:
                oldest_key = cache_order.popleft()
                del cache[oldest_key]
            
            cache[key] = result
            cache_order.append(key)
            logger.debug(f"{func.__name__} cache miss: {key[:50]}...")
            
            return result
        
        wrapper.cache = cache
        wrapper.cache_clear = lambda: (cache.clear(), cache_order.clear())
        return wrapper
    return decorator

# Abstract Base Classes
class DataProcessor(ABC):
    """Veri işleyici abstract sınıfı"""
    
    @abstractmethod
    async def process(self, data: Any) -> Any:
        """Veriyi işle"""
        pass
    
    @abstractmethod
    def validate(self, data: Any) -> bool:
        """Veriyi doğrula"""
        pass
    
    @property
    @abstractmethod
    def processor_type(self) -> str:
        """İşleyici tipi"""
        pass

class StorageBackend(ABC):
    """Depolama backend'i abstract sınıfı"""
    
    @abstractmethod
    async def save(self, key: str, data: Any) -> bool:
        pass
    
    @abstractmethod
    async def load(self, key: str) -> Optional[Any]:
        pass
    
    @abstractmethod
    async def delete(self, key: str) -> bool:
        pass

# Mixins
class LoggingMixin:
    """Loglama yetenekleri ekleyen mixin"""
    
    def log_info(self, message: str):
        logger.info(f"[{self.__class__.__name__}] {message}")
    
    def log_error(self, message: str, exception: Optional[Exception] = None):
        if exception:
            logger.error(f"[{self.__class__.__name__}] {message}: {exception}")
        else:
            logger.error(f"[{self.__class__.__name__}] {message}")
    
    def log_debug(self, message: str):
        logger.debug(f"[{self.__class__.__name__}] {message}")

class CacheableMixin:
    """Önbellek yetenekleri ekleyen mixin"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._cache: Dict[str, Any] = {}
        self._cache_timestamps: Dict[str, datetime] = {}
        self._cache_ttl = timedelta(minutes=5)
    
    def get_cached(self, key: str) -> Optional[Any]:
        """Önbellekten veri al"""
        if key in self._cache:
            timestamp = self._cache_timestamps.get(key)
            if timestamp and datetime.now() - timestamp < self._cache_ttl:
                return self._cache[key]
            else:
                # Süresi dolmuş, temizle
                self._cache.pop(key, None)
                self._cache_timestamps.pop(key, None)
        return None
    
    def set_cached(self, key: str, value: Any):
        """Önbelleğe veri kaydet"""
        self._cache[key] = value
        self._cache_timestamps[key] = datetime.now()
    
    def clear_cache(self):
        """Önbelleği temizle"""
        self._cache.clear()
        self._cache_timestamps.clear()

# Generic Classes
class Repository(Generic[T]):
    """Generic repository pattern"""
    
    def __init__(self, item_type: typing.Type[T]):
        self._item_type = item_type
        self._items: Dict[str, T] = {}
        self._lock = threading.RLock()
    
    def add(self, key: str, item: T) -> None:
        """Öğe ekle"""
        if not isinstance(item, self._item_type):
            raise TypeError(f"Öğe {self._item_type} tipinde olmalı")
        
        with self._lock:
            self._items[key] = item
    
    def get(self, key: str) -> Optional[T]:
        """Öğe al"""
        with self._lock:
            return self._items.get(key)
    
    def remove(self, key: str) -> bool:
        """Öğe sil"""
        with self._lock:
            return self._items.pop(key, None) is not None
    
    def list_all(self) -> List[T]:
        """Tüm öğeleri listele"""
        with self._lock:
            return list(self._items.values())
    
    def count(self) -> int:
        """Öğe sayısı"""
        with self._lock:
            return len(self._items)

# Context Managers
@contextlib.contextmanager
def database_transaction(db_path: str):
    """Veritabanı transaction context manager'ı"""
    conn = sqlite3.connect(db_path)
    try:
        conn.execute("BEGIN TRANSACTION")
        yield conn
        conn.execute("COMMIT")
        logger.info("Veritabanı transaction başarılı")
    except Exception as e:
        conn.execute("ROLLBACK")
        logger.error(f"Veritabanı transaction başarısız: {e}")
        raise
    finally:
        conn.close()

class ResourceManager:
    """Kaynak yönetimi context manager'ı"""
    
    def __init__(self, resource_name: str):
        self.resource_name = resource_name
        self.resource = None
        self.acquired_at = None
    
    def __enter__(self):
        self.acquired_at = datetime.now()
        logger.info(f"Kaynak alındı: {self.resource_name}")
        # Simüle edilmiş kaynak
        self.resource = {"name": self.resource_name, "data": "test_data"}
        return self.resource
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.acquired_at:
            duration = datetime.now() - self.acquired_at
            logger.info(f"Kaynak serbest bırakıldı: {self.resource_name} (Süre: {duration})")
        
        if exc_type:
            logger.error(f"Kaynak kullanımında hata: {exc_val}")
        
        self.resource = None
        return False  # Exception'ları yeniden fırlat

# Concrete Implementations
class JSONProcessor(DataProcessor, LoggingMixin, CacheableMixin):
    """JSON veri işleyicisi"""
    
    def __init__(self):
        super().__init__()
        self.log_info("JSON processor başlatıldı")
    
    async def process(self, data: Any) -> Dict[str, Any]:
        """JSON verisini işle"""
        cache_key = f"json_process_{hash(str(data))}"
        cached_result = self.get_cached(cache_key)
        
        if cached_result:
            self.log_debug("Cache'den JSON verisi alındı")
            return cached_result
        
        await asyncio.sleep(0.1)  # Simüle edilmiş işlem süresi
        
        if isinstance(data, str):
            try:
                result = json.loads(data)
            except json.JSONDecodeError as e:
                self.log_error("JSON parse hatası", e)
                raise
        elif isinstance(data, dict):
            result = data.copy()
        else:
            result = {"processed_data": str(data)}
        
        # Metadata ekle
        result["_metadata"] = {
            "processed_at": datetime.now().isoformat(),
            "processor": self.processor_type
        }
        
        self.set_cached(cache_key, result)
        self.log_info(f"JSON verisi işlendi: {len(str(result))} karakter")
        
        return result
    
    def validate(self, data: Any) -> bool:
        """JSON verisini doğrula"""
        try:
            if isinstance(data, str):
                json.loads(data)
            return True
        except (json.JSONDecodeError, TypeError):
            return False
    
    @property
    def processor_type(self) -> str:
        return "json_processor"

class MemoryStorage(StorageBackend, LoggingMixin):
    """Bellek tabanlı depolama"""
    
    def __init__(self):
        super().__init__()
        self._storage: Dict[str, Any] = {}
        self._access_times: Dict[str, datetime] = {}
        self._lock = asyncio.Lock()
    
    async def save(self, key: str, data: Any) -> bool:
        """Veriyi kaydet"""
        async with self._lock:
            try:
                self._storage[key] = pickle.dumps(data)
                self._access_times[key] = datetime.now()
                self.log_info(f"Veri kaydedildi: {key}")
                return True
            except Exception as e:
                self.log_error(f"Veri kaydetme hatası: {key}", e)
                return False
    
    async def load(self, key: str) -> Optional[Any]:
        """Veriyi yükle"""
        async with self._lock:
            try:
                if key in self._storage:
                    self._access_times[key] = datetime.now()
                    data = pickle.loads(self._storage[key])
                    self.log_debug(f"Veri yüklendi: {key}")
                    return data
                return None
            except Exception as e:
                self.log_error(f"Veri yükleme hatası: {key}", e)
                return None
    
    async def delete(self, key: str) -> bool:
        """Veriyi sil"""
        async with self._lock:
            try:
                if key in self._storage:
                    del self._storage[key]
                    self._access_times.pop(key, None)
                    self.log_info(f"Veri silindi: {key}")
                    return True
                return False
            except Exception as e:
                self.log_error(f"Veri silme hatası: {key}", e)
                return False
    
    def get_stats(self) -> Dict[str, Any]:
        """Depolama istatistikleri"""
        return {
            "total_items": len(self._storage),
            "total_size": sum(len(data) for data in self._storage.values()),
            "last_access_times": dict(self._access_times)
        }

# Task Management System
class TaskManager(metaclass=SingletonMeta):
    """Görev yönetim sistemi (Singleton)"""
    
    def __init__(self, config: Optional[Configuration] = None):
        if hasattr(self, '_initialized'):
            return
        
        self._initialized = True
        self.config = config or Configuration()
        self._tasks: Dict[str, TaskResult] = {}
        self._task_queue = asyncio.Queue()
        self._workers: List[asyncio.Task] = []
        self._running = False
        self._stats = defaultdict(int)
        
        logger.info(f"TaskManager başlatıldı - Workers: {self.config.max_workers}")
    
    async def start(self):
        """Görev yöneticisini başlat"""
        if self._running:
            return
        
        self._running = True
        
        # Worker'ları başlat
        for i in range(self.config.max_workers):
            worker = asyncio.create_task(self._worker(f"worker_{i}"))
            self._workers.append(worker)
        
        logger.info(f"{len(self._workers)} worker başlatıldı")
    
    async def stop(self):
        """Görev yöneticisini durdur"""
        self._running = False
        
        # Tüm worker'ları durdur
        for worker in self._workers:
            worker.cancel()
        
        if self._workers:
            await asyncio.gather(*self._workers, return_exceptions=True)
        
        self._workers.clear()
        logger.info("TaskManager durduruldu")
    
    async def _worker(self, worker_name: str):
        """Worker coroutine"""
        logger.info(f"Worker başlatıldı: {worker_name}")
        
        while self._running:
            try:
                # Queue'dan görev al
                task_func, task_id, args, kwargs = await asyncio.wait_for(
                    self._task_queue.get(), timeout=1.0
                )
                
                logger.debug(f"{worker_name} görevi alındı: {task_id}")
                
                # Görevi çalıştır
                start_time = time.time()
                try:
                    if asyncio.iscoroutinefunction(task_func):
                        result = await task_func(*args, **kwargs)
                    else:
                        result = task_func(*args, **kwargs)
                    
                    execution_time = time.time() - start_time
                    
                    # Sonucu kaydet
                    self._tasks[task_id] = TaskResult(
                        task_id=task_id,
                        status=ProcessStatus.COMPLETED,
                        result=result,
                        execution_time=execution_time
                    )
                    
                    self._stats['completed'] += 1
                    logger.info(f"Görev tamamlandı: {task_id} ({execution_time:.4f}s)")
                
                except Exception as e:
                    execution_time = time.time() - start_time
                    
                    self._tasks[task_id] = TaskResult(
                        task_id=task_id,
                        status=ProcessStatus.FAILED,
                        error=str(e),
                        execution_time=execution_time
                    )
                    
                    self._stats['failed'] += 1
                    logger.error(f"Görev başarısız: {task_id} - {e}")
                
                finally:
                    self._task_queue.task_done()
            
            except asyncio.TimeoutError:
                continue
            except asyncio.CancelledError:
                logger.info(f"Worker iptal edildi: {worker_name}")
                break
            except Exception as e:
                logger.error(f"Worker hatası {worker_name}: {e}")
    
    async def submit_task(self, task_func: Callable, *args, **kwargs) -> str:
        """Görev gönder"""
        task_id = f"task_{int(time.time() * 1000000)}"
        
        # Görev durumunu kaydet
        self._tasks[task_id] = TaskResult(
            task_id=task_id,
            status=ProcessStatus.PENDING
        )
        
        # Queue'ya ekle
        await self._task_queue.put((task_func, task_id, args, kwargs))
        self._stats['submitted'] += 1
        
        logger.debug(f"Görev gönderildi: {task_id}")
        return task_id
    
    def get_task_result(self, task_id: str) -> Optional[TaskResult]:
        """Görev sonucunu al"""
        return self._tasks.get(task_id)
    
    def get_stats(self) -> Dict[str, Any]:
        """İstatistikleri al"""
        return {
            "total_tasks": len(self._tasks),
            "queue_size": self._task_queue.qsize(),
            "workers": len(self._workers),
            "running": self._running,
            **dict(self._stats)
        }

# Generator Functions
def fibonacci_generator(n: int):
    """Fibonacci sayı dizisi generator'ı"""
    a, b = 0, 1
    count = 0
    while count < n:
        yield a
        a, b = b, a + b
        count += 1

def prime_generator(limit: int):
    """Asal sayı generator'ı"""
    def is_prime(num):
        if num < 2:
            return False
        for i in range(2, int(num ** 0.5) + 1):
            if num % i == 0:
                return False
        return True
    
    for num in range(2, limit + 1):
        if is_prime(num):
            yield num

def batch_generator(iterable, batch_size: int):
    """Batch generator - büyük veri setlerini parçalara böler"""
    iterator = iter(iterable)
    while True:
        batch = list(itertools.islice(iterator, batch_size))
        if not batch:
            break
        yield batch

# Async Functions
@measure_time
@retry(max_attempts=3)
async def complex_async_operation(data: Dict[str, Any]) -> Dict[str, Any]:
    """Karmaşık async işlem"""
    logger.info(f"Karmaşık async işlem başlatıldı: {data.get('id', 'unknown')}")
    
    # Simüle edilmiş network delay
    await asyncio.sleep(0.5)
    
    # Veri işleme simülasyonu
    processor = JSONProcessor()
    processed_data = await processor.process(data)
    
    # Storage işlemi
    storage = MemoryStorage()
    key = f"processed_{data.get('id', 'unknown')}"
    await storage.save(key, processed_data)
    
    # Sonuç
    result = {
        "original": data,
        "processed": processed_data,
        "storage_key": key,
        "timestamp": datetime.now().isoformat()
    }
    
    logger.info(f"Karmaşık async işlem tamamlandı: {data.get('id', 'unknown')}")
    return result

@cache_result(max_size=50)
def expensive_calculation(n: int) -> int:
    """Pahalı hesaplama (cache'lenmiş)"""
    logger.info(f"Pahalı hesaplama başlatıldı: n={n}")
    
    # Simüle edilmiş pahalı işlem
    time.sleep(0.1)
    
    result = sum(i * i for i in range(n))
    logger.info(f"Pahalı hesaplama tamamlandı: n={n}, result={result}")
    
    return result

# Threading Functions
def cpu_bound_task(task_id: str, iterations: int) -> Dict[str, Any]:
    """CPU yoğun görev (threading için)"""
    logger.info(f"CPU yoğun görev başlatıldı: {task_id}")
    
    start_time = time.time()
    result = 0
    
    for i in range(iterations):
        result += i ** 2
        if i % 100000 == 0:
            logger.debug(f"{task_id}: {i}/{iterations} tamamlandı")
    
    execution_time = time.time() - start_time
    
    return {
        "task_id": task_id,
        "result": result,
        "iterations": iterations,
        "execution_time": execution_time,
        "thread_name": threading.current_thread().name
    }

def run_threaded_tasks(num_tasks: int = 4, iterations: int = 1000000):
    """Çoklu thread'de görevleri çalıştır"""
    logger.info(f"Threaded görevler başlatılıyor: {num_tasks} görev")
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=num_tasks) as executor:
        # Görevleri gönder
        futures = []
        for i in range(num_tasks):
            future = executor.submit(cpu_bound_task, f"task_{i}", iterations)
            futures.append(future)
        
        # Sonuçları topla
        results = []
        for future in concurrent.futures.as_completed(futures):
            try:
                result = future.result()
                results.append(result)
                logger.info(f"Thread görevi tamamlandı: {result['task_id']}")
            except Exception as e:
                logger.error(f"Thread görevi başarısız: {e}")
        
        return results

# Design Patterns
class Observer(ABC):
    """Observer pattern - gözlemci"""
    
    @abstractmethod
    def update(self, subject: 'Subject', event: str, data: Any):
        pass

class Subject:
    """Observer pattern - gözlemlenen"""
    
    def __init__(self):
        self._observers: List[Observer] = []
        self._state: Dict[str, Any] = {}
    
    def attach(self, observer: Observer):
        """Gözlemci ekle"""
        if observer not in self._observers:
            self._observers.append(observer)
            logger.debug(f"Gözlemci eklendi: {observer.__class__.__name__}")
    
    def detach(self, observer: Observer):
        """Gözlemci çıkar"""
        if observer in self._observers:
            self._observers.remove(observer)
            logger.debug(f"Gözlemci çıkarıldı: {observer.__class__.__name__}")
    
    def notify(self, event: str, data: Any = None):
        """Gözlemcileri bilgilendir"""
        logger.info(f"Event yayınlandı: {event}")
        for observer in self._observers:
            try:
                observer.update(self, event, data)
            except Exception as e:
                logger.error(f"Gözlemci bilgilendirme hatası: {e}")
    
    def set_state(self, key: str, value: Any):
        """Durum güncelle"""
        old_value = self._state.get(key)
        self._state[key] = value
        
        if old_value != value:
            self.notify("state_changed", {"key": key, "old": old_value, "new": value})
    
    def get_state(self, key: str) -> Any:
        """Durum al"""
        return self._state.get(key)

class ConcreteObserver(Observer, LoggingMixin):
    """Somut gözlemci"""
    
    def __init__(self, name: str):
        self.name = name
    
    def update(self, subject: Subject, event: str, data: Any):
        self.log_info(f"Event alındı: {event} - Data: {data}")

# Factory Pattern
class ProcessorFactory:
    """İşleyici factory'si"""
    
    _processors = {
        "json": JSONProcessor,
        # Diğer işleyiciler buraya eklenebilir
    }
    
    @classmethod
    def create_processor(cls, processor_type: str) -> DataProcessor:
        """İşleyici oluştur"""
        processor_class = cls._processors.get(processor_type.lower())
        if not processor_class:
            raise ValueError(f"Bilinmeyen işleyici tipi: {processor_type}")
        
        return processor_class()
    
    @classmethod
    def register_processor(cls, processor_type: str, processor_class: type):
        """Yeni işleyici tipi kaydet"""
        cls._processors[processor_type.lower()] = processor_class

# Test Functions
async def run_comprehensive_test():
    """Kapsamlı test fonksiyonu"""
    logger.info("🚀 Kapsamlı test başlatılıyor...")
    
    try:
        # 1. TaskManager testi
        logger.info("📋 TaskManager testi...")
        task_manager = TaskManager()
        await task_manager.start()
        
        # Görevler gönder
        task_ids = []
        for i in range(10):
            test_data = {"id": i, "data": f"test_data_{i}"}
            task_id = await task_manager.submit_task(complex_async_operation, test_data)
            task_ids.append(task_id)
        
        # Sonuçları bekle
        await asyncio.sleep(3)
        
        # Sonuçları kontrol et
        completed = 0
        for task_id in task_ids:
            result = task_manager.get_task_result(task_id)
            if result and result.status == ProcessStatus.COMPLETED:
                completed += 1
        
        logger.info(f"TaskManager test sonucu: {completed}/{len(task_ids)} görev tamamlandı")
        
        await task_manager.stop()
        
        # 2. Generator testi
        logger.info("📋 Generator testi...")
        fib_numbers = list(fibonacci_generator(10))
        prime_numbers = list(prime_generator(50))
        logger.info(f"Fibonacci: {fib_numbers}")
        logger.info(f"Asal sayılar: {prime_numbers}")
        
        # 3. Cache testi
        logger.info("📋 Cache testi...")
        for i in range(5):
            result = expensive_calculation(1000)  # İlk çağrı cache'e alınır
            result = expensive_calculation(1000)  # İkinci çağrı cache'den gelir
        
        # 4. Observer pattern testi
        logger.info("📋 Observer pattern testi...")
        subject = Subject()
        observer1 = ConcreteObserver("Observer1")
        observer2 = ConcreteObserver("Observer2")
        
        subject.attach(observer1)
        subject.attach(observer2)
        
        subject.set_state("test_key", "test_value")
        subject.set_state("another_key", 42)
        
        # 5. Repository testi
        logger.info("📋 Repository testi...")
        user_repo = Repository[str](str)
        user_repo.add("user1", "Alice")
        user_repo.add("user2", "Bob")
        
        logger.info(f"Repository count: {user_repo.count()}")
        logger.info(f"User1: {user_repo.get('user1')}")
        
        # 6. Context manager testi
        logger.info("📋 Context manager testi...")
        with ResourceManager("test_resource") as resource:
            logger.info(f"Resource kullanılıyor: {resource}")
        
        # 7. Threading testi
        logger.info("📋 Threading testi...")
        thread_results = run_threaded_tasks(num_tasks=3, iterations=500000)
        logger.info(f"Thread test sonucu: {len(thread_results)} görev tamamlandı")
        
        logger.info("✅ Kapsamlı test başarıyla tamamlandı!")
        
    except Exception as e:
        logger.error(f"❌ Test hatası: {e}")
        raise

# Ana fonksiyon
def main():
    """Ana fonksiyon"""
    print("🐍 Gelişmiş Python Test Sistemi")
    print("=" * 50)
    
    # Async test'i çalıştır
    asyncio.run(run_comprehensive_test())
    
    print("\n🎉 Test tamamlandı! Log dosyasını kontrol edin: advanced_test.log")

if __name__ == "__main__":
    main()
