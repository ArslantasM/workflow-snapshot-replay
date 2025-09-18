/**
 * Gelişmiş Java Test Sistemi
 * 
 * Bu dosya karmaşık Java özelliklerini test etmek için tasarlanmıştır:
 * - Inheritance ve Polymorphism
 * - Generics ve Type Safety
 * - Annotations ve Reflection
 * - Design Patterns
 * - Concurrency ve Threading
 * - Lambda Expressions ve Streams
 * - Exception Handling
 * - Collections Framework
 * - Inner Classes ve Nested Classes
 * 
 * @author Advanced Java Test System
 * @version 2.0
 * @since 2024
 */

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.*;
import java.util.function.*;
import java.util.stream.*;
import java.lang.annotation.*;
import java.lang.reflect.*;
import java.io.*;
import java.nio.file.*;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.logging.*;

// Custom Annotations
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.TYPE, ElementType.METHOD, ElementType.FIELD})
@interface Benchmark {
    String value() default "";
    boolean enabled() default true;
}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface Retry {
    int maxAttempts() default 3;
    long delayMs() default 1000;
}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.TYPE)
@interface Component {
    String name() default "";
    String version() default "1.0";
}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface Async {
    String executor() default "default";
}

// Enums
enum ProcessStatus {
    PENDING("Bekliyor"),
    RUNNING("Çalışıyor"),
    COMPLETED("Tamamlandı"),
    FAILED("Başarısız"),
    CANCELLED("İptal Edildi");
    
    private final String description;
    
    ProcessStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
    
    public boolean isTerminal() {
        return this == COMPLETED || this == FAILED || this == CANCELLED;
    }
}

enum Priority {
    LOW(1, "Düşük"),
    MEDIUM(2, "Orta"),
    HIGH(3, "Yüksek"),
    CRITICAL(4, "Kritik");
    
    private final int level;
    private final String description;
    
    Priority(int level, String description) {
        this.level = level;
        this.description = description;
    }
    
    public int getLevel() { return level; }
    public String getDescription() { return description; }
    
    public boolean isHigherThan(Priority other) {
        return this.level > other.level;
    }
}

// Generic Interfaces
interface Repository<T, ID> {
    void save(T entity);
    Optional<T> findById(ID id);
    List<T> findAll();
    void deleteById(ID id);
    boolean existsById(ID id);
    long count();
}

interface DataProcessor<I, O> {
    O process(I input) throws ProcessingException;
    boolean canProcess(I input);
    String getProcessorType();
}

interface Observer<T> {
    void update(T data);
    String getObserverId();
}

interface Command<T> {
    T execute() throws CommandException;
    void undo();
    boolean canUndo();
    String getCommandName();
}

// Custom Exceptions
class ProcessingException extends Exception {
    private final String processorType;
    private final Object failedInput;
    
    public ProcessingException(String message, String processorType, Object failedInput) {
        super(message);
        this.processorType = processorType;
        this.failedInput = failedInput;
    }
    
    public ProcessingException(String message, Throwable cause, String processorType, Object failedInput) {
        super(message, cause);
        this.processorType = processorType;
        this.failedInput = failedInput;
    }
    
    public String getProcessorType() { return processorType; }
    public Object getFailedInput() { return failedInput; }
}

class CommandException extends Exception {
    private final String commandName;
    
    public CommandException(String message, String commandName) {
        super(message);
        this.commandName = commandName;
    }
    
    public CommandException(String message, Throwable cause, String commandName) {
        super(message, cause);
        this.commandName = commandName;
    }
    
    public String getCommandName() { return commandName; }
}

// Abstract Base Classes
@Component(name = "BaseEntity", version = "2.0")
abstract class BaseEntity<ID> {
    protected ID id;
    protected LocalDateTime createdAt;
    protected LocalDateTime updatedAt;
    protected String createdBy;
    protected String updatedBy;
    
    public BaseEntity() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    public BaseEntity(ID id) {
        this();
        this.id = id;
    }
    
    // Abstract methods
    public abstract boolean isValid();
    public abstract Map<String, Object> toMap();
    public abstract void fromMap(Map<String, Object> data);
    
    // Getters and Setters
    public ID getId() { return id; }
    public void setId(ID id) { this.id = id; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }
    public void setUpdatedBy(String updatedBy) { 
        this.updatedBy = updatedBy;
        this.updatedAt = LocalDateTime.now();
    }
    
    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        BaseEntity<?> that = (BaseEntity<?>) obj;
        return Objects.equals(id, that.id);
    }
    
    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
    
    @Override
    public String toString() {
        return String.format("%s{id=%s, createdAt=%s}", 
            getClass().getSimpleName(), id, createdAt);
    }
}

// Concrete Entity Classes
@Component(name = "User", version = "1.5")
class User extends BaseEntity<Long> {
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Set<String> roles;
    private boolean active;
    private Map<String, Object> metadata;
    
    // Constructors
    public User() {
        super();
        this.roles = new HashSet<>();
        this.metadata = new HashMap<>();
        this.active = true;
    }
    
    public User(Long id, String username, String email) {
        super(id);
        this.username = username;
        this.email = email;
        this.roles = new HashSet<>();
        this.metadata = new HashMap<>();
        this.active = true;
    }
    
    // Builder Pattern
    public static class Builder {
        private User user = new User();
        
        public Builder id(Long id) { user.setId(id); return this; }
        public Builder username(String username) { user.username = username; return this; }
        public Builder email(String email) { user.email = email; return this; }
        public Builder firstName(String firstName) { user.firstName = firstName; return this; }
        public Builder lastName(String lastName) { user.lastName = lastName; return this; }
        public Builder addRole(String role) { user.roles.add(role); return this; }
        public Builder active(boolean active) { user.active = active; return this; }
        public Builder metadata(String key, Object value) { user.metadata.put(key, value); return this; }
        
        public User build() {
            if (user.username == null || user.email == null) {
                throw new IllegalStateException("Username ve email zorunludur");
            }
            return user;
        }
    }
    
    @Override
    @Benchmark("user-validation")
    public boolean isValid() {
        return username != null && !username.trim().isEmpty() &&
               email != null && email.contains("@") &&
               !roles.isEmpty();
    }
    
    @Override
    public Map<String, Object> toMap() {
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("username", username);
        map.put("email", email);
        map.put("firstName", firstName);
        map.put("lastName", lastName);
        map.put("roles", new ArrayList<>(roles));
        map.put("active", active);
        map.put("createdAt", createdAt.toString());
        map.put("updatedAt", updatedAt.toString());
        map.put("metadata", new HashMap<>(metadata));
        return map;
    }
    
    @Override
    @SuppressWarnings("unchecked")
    public void fromMap(Map<String, Object> data) {
        this.id = (Long) data.get("id");
        this.username = (String) data.get("username");
        this.email = (String) data.get("email");
        this.firstName = (String) data.get("firstName");
        this.lastName = (String) data.get("lastName");
        
        List<String> rolesList = (List<String>) data.get("roles");
        if (rolesList != null) {
            this.roles = new HashSet<>(rolesList);
        }
        
        this.active = (Boolean) data.getOrDefault("active", true);
        
        Map<String, Object> metadataMap = (Map<String, Object>) data.get("metadata");
        if (metadataMap != null) {
            this.metadata = new HashMap<>(metadataMap);
        }
    }
    
    // Getters and Setters
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    
    public Set<String> getRoles() { return new HashSet<>(roles); }
    public void addRole(String role) { this.roles.add(role); }
    public void removeRole(String role) { this.roles.remove(role); }
    public boolean hasRole(String role) { return this.roles.contains(role); }
    
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    
    public String getFullName() {
        return Stream.of(firstName, lastName)
                .filter(Objects::nonNull)
                .filter(s -> !s.trim().isEmpty())
                .collect(Collectors.joining(" "));
    }
    
    // Inner Class - User Statistics
    public class Statistics {
        private final User user;
        private final Map<String, AtomicLong> counters;
        
        private Statistics(User user) {
            this.user = user;
            this.counters = new ConcurrentHashMap<>();
        }
        
        public void increment(String counter) {
            counters.computeIfAbsent(counter, k -> new AtomicLong(0)).incrementAndGet();
        }
        
        public long getCount(String counter) {
            return counters.getOrDefault(counter, new AtomicLong(0)).get();
        }
        
        public Map<String, Long> getAllCounters() {
            return counters.entrySet().stream()
                    .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> e.getValue().get()
                    ));
        }
    }
    
    public Statistics getStatistics() {
        return new Statistics(this);
    }
}

// Repository Implementation
@Component(name = "InMemoryUserRepository", version = "1.0")
class InMemoryUserRepository implements Repository<User, Long> {
    private final Map<Long, User> storage = new ConcurrentHashMap<>();
    private final AtomicLong idGenerator = new AtomicLong(1);
    private final Logger logger = Logger.getLogger(InMemoryUserRepository.class.getName());
    
    @Override
    @Benchmark("user-save")
    public void save(User entity) {
        if (entity.getId() == null) {
            entity.setId(idGenerator.getAndIncrement());
        }
        entity.setUpdatedBy("system");
        storage.put(entity.getId(), entity);
        logger.info(String.format("User kaydedildi: %s (ID: %d)", 
            entity.getUsername(), entity.getId()));
    }
    
    @Override
    public Optional<User> findById(Long id) {
        User user = storage.get(id);
        logger.fine(String.format("User arandı: ID %d, Bulundu: %s", id, user != null));
        return Optional.ofNullable(user);
    }
    
    @Override
    public List<User> findAll() {
        List<User> users = new ArrayList<>(storage.values());
        logger.info(String.format("Tüm kullanıcılar listelendi: %d kullanıcı", users.size()));
        return users;
    }
    
    @Override
    public void deleteById(Long id) {
        User removed = storage.remove(id);
        if (removed != null) {
            logger.info(String.format("User silindi: %s (ID: %d)", 
                removed.getUsername(), id));
        }
    }
    
    @Override
    public boolean existsById(Long id) {
        return storage.containsKey(id);
    }
    
    @Override
    public long count() {
        return storage.size();
    }
    
    // Custom query methods
    public List<User> findByRole(String role) {
        return storage.values().stream()
                .filter(user -> user.hasRole(role))
                .collect(Collectors.toList());
    }
    
    public List<User> findActiveUsers() {
        return storage.values().stream()
                .filter(User::isActive)
                .collect(Collectors.toList());
    }
    
    public Optional<User> findByUsername(String username) {
        return storage.values().stream()
                .filter(user -> Objects.equals(user.getUsername(), username))
                .findFirst();
    }
    
    public Map<String, Long> getUserStatsByRole() {
        return storage.values().stream()
                .flatMap(user -> user.getRoles().stream())
                .collect(Collectors.groupingBy(
                    Function.identity(),
                    Collectors.counting()
                ));
    }
}

// Data Processors
@Component(name = "StringProcessor", version = "1.0")
class StringDataProcessor implements DataProcessor<String, String> {
    private final Logger logger = Logger.getLogger(StringDataProcessor.class.getName());
    
    @Override
    @Benchmark("string-processing")
    @Retry(maxAttempts = 3, delayMs = 500)
    public String process(String input) throws ProcessingException {
        if (!canProcess(input)) {
            throw new ProcessingException("Geçersiz string input", getProcessorType(), input);
        }
        
        try {
            logger.info("String işleme başlatıldı: " + input.substring(0, Math.min(input.length(), 50)));
            
            // Simulated processing
            Thread.sleep(100);
            
            String result = input.trim()
                    .toLowerCase()
                    .replaceAll("\\s+", "_")
                    .replaceAll("[^a-z0-9_]", "");
            
            logger.info("String işleme tamamlandı");
            return result;
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new ProcessingException("String işleme kesintiye uğradı", e, getProcessorType(), input);
        } catch (Exception e) {
            throw new ProcessingException("String işleme hatası", e, getProcessorType(), input);
        }
    }
    
    @Override
    public boolean canProcess(String input) {
        return input != null && !input.trim().isEmpty() && input.length() <= 1000;
    }
    
    @Override
    public String getProcessorType() {
        return "string_processor";
    }
}

@Component(name = "NumberProcessor", version = "1.0")
class NumberDataProcessor implements DataProcessor<Number, Double> {
    private final Logger logger = Logger.getLogger(NumberDataProcessor.class.getName());
    
    @Override
    @Benchmark("number-processing")
    public Double process(Number input) throws ProcessingException {
        if (!canProcess(input)) {
            throw new ProcessingException("Geçersiz number input", getProcessorType(), input);
        }
        
        try {
            logger.info("Number işleme başlatıldı: " + input);
            
            double value = input.doubleValue();
            
            // Complex mathematical operation
            double result = Math.sqrt(Math.abs(value)) * Math.PI + Math.log(Math.abs(value) + 1);
            
            logger.info("Number işleme tamamlandı: " + result);
            return result;
            
        } catch (Exception e) {
            throw new ProcessingException("Number işleme hatası", e, getProcessorType(), input);
        }
    }
    
    @Override
    public boolean canProcess(Number input) {
        return input != null && !Double.isNaN(input.doubleValue()) && !Double.isInfinite(input.doubleValue());
    }
    
    @Override
    public String getProcessorType() {
        return "number_processor";
    }
}

// Observer Pattern Implementation
@Component(name = "EventPublisher", version = "1.0")
class EventPublisher<T> {
    private final List<Observer<T>> observers = new CopyOnWriteArrayList<>();
    private final Logger logger = Logger.getLogger(EventPublisher.class.getName());
    
    public void subscribe(Observer<T> observer) {
        observers.add(observer);
        logger.info("Observer eklendi: " + observer.getObserverId());
    }
    
    public void unsubscribe(Observer<T> observer) {
        observers.remove(observer);
        logger.info("Observer çıkarıldı: " + observer.getObserverId());
    }
    
    @Async
    public void publish(T data) {
        logger.info(String.format("Event yayınlanıyor: %d observer'a", observers.size()));
        
        observers.parallelStream().forEach(observer -> {
            try {
                observer.update(data);
            } catch (Exception e) {
                logger.severe(String.format("Observer hatası (%s): %s", 
                    observer.getObserverId(), e.getMessage()));
            }
        });
    }
    
    public int getObserverCount() {
        return observers.size();
    }
}

// Concrete Observer
class UserEventObserver implements Observer<User> {
    private final String observerId;
    private final AtomicLong eventCount = new AtomicLong(0);
    private final Logger logger = Logger.getLogger(UserEventObserver.class.getName());
    
    public UserEventObserver(String observerId) {
        this.observerId = observerId;
    }
    
    @Override
    public void update(User user) {
        long count = eventCount.incrementAndGet();
        logger.info(String.format("[%s] User event alındı: %s (Event #%d)", 
            observerId, user.getUsername(), count));
        
        // Simulate some processing
        try {
            Thread.sleep(10);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
    
    @Override
    public String getObserverId() {
        return observerId;
    }
    
    public long getEventCount() {
        return eventCount.get();
    }
}

// Command Pattern Implementation
class CreateUserCommand implements Command<User> {
    private final InMemoryUserRepository repository;
    private final String username;
    private final String email;
    private User createdUser;
    
    public CreateUserCommand(InMemoryUserRepository repository, String username, String email) {
        this.repository = repository;
        this.username = username;
        this.email = email;
    }
    
    @Override
    @Benchmark("create-user-command")
    public User execute() throws CommandException {
        try {
            // Check if user already exists
            if (repository.findByUsername(username).isPresent()) {
                throw new CommandException("User zaten mevcut: " + username, getCommandName());
            }
            
            createdUser = new User.Builder()
                    .username(username)
                    .email(email)
                    .addRole("USER")
                    .active(true)
                    .build();
            
            repository.save(createdUser);
            
            Logger.getLogger(CreateUserCommand.class.getName())
                    .info("User oluşturuldu: " + username);
            
            return createdUser;
            
        } catch (Exception e) {
            throw new CommandException("User oluşturma hatası: " + e.getMessage(), e, getCommandName());
        }
    }
    
    @Override
    public void undo() {
        if (createdUser != null && createdUser.getId() != null) {
            repository.deleteById(createdUser.getId());
            Logger.getLogger(CreateUserCommand.class.getName())
                    .info("User silindi (undo): " + createdUser.getUsername());
            createdUser = null;
        }
    }
    
    @Override
    public boolean canUndo() {
        return createdUser != null && createdUser.getId() != null;
    }
    
    @Override
    public String getCommandName() {
        return "CreateUserCommand";
    }
}

// Task Management System
@Component(name = "TaskManager", version = "2.0")
class TaskManager {
    private final ExecutorService executorService;
    private final CompletionService<TaskResult> completionService;
    private final Map<String, Future<TaskResult>> runningTasks;
    private final AtomicLong taskIdGenerator;
    private final Logger logger;
    
    // Task Result Class
    public static class TaskResult {
        private final String taskId;
        private final ProcessStatus status;
        private final Object result;
        private final Exception error;
        private final long executionTimeMs;
        private final LocalDateTime completedAt;
        
        public TaskResult(String taskId, ProcessStatus status, Object result, 
                         Exception error, long executionTimeMs) {
            this.taskId = taskId;
            this.status = status;
            this.result = result;
            this.error = error;
            this.executionTimeMs = executionTimeMs;
            this.completedAt = LocalDateTime.now();
        }
        
        // Getters
        public String getTaskId() { return taskId; }
        public ProcessStatus getStatus() { return status; }
        public Object getResult() { return result; }
        public Exception getError() { return error; }
        public long getExecutionTimeMs() { return executionTimeMs; }
        public LocalDateTime getCompletedAt() { return completedAt; }
        
        public boolean isSuccessful() { return status == ProcessStatus.COMPLETED; }
    }
    
    public TaskManager(int threadPoolSize) {
        this.executorService = Executors.newFixedThreadPool(threadPoolSize);
        this.completionService = new ExecutorCompletionService<>(executorService);
        this.runningTasks = new ConcurrentHashMap<>();
        this.taskIdGenerator = new AtomicLong(1);
        this.logger = Logger.getLogger(TaskManager.class.getName());
        
        logger.info(String.format("TaskManager başlatıldı: %d thread", threadPoolSize));
    }
    
    public <T> String submitTask(Callable<T> task, String taskName) {
        String taskId = "task_" + taskIdGenerator.getAndIncrement();
        
        Callable<TaskResult> wrappedTask = () -> {
            long startTime = System.currentTimeMillis();
            try {
                logger.info(String.format("Görev başlatıldı: %s (%s)", taskName, taskId));
                
                T result = task.call();
                long executionTime = System.currentTimeMillis() - startTime;
                
                logger.info(String.format("Görev tamamlandı: %s (%s) - %dms", 
                    taskName, taskId, executionTime));
                
                return new TaskResult(taskId, ProcessStatus.COMPLETED, result, null, executionTime);
                
            } catch (Exception e) {
                long executionTime = System.currentTimeMillis() - startTime;
                
                logger.severe(String.format("Görev başarısız: %s (%s) - %s", 
                    taskName, taskId, e.getMessage()));
                
                return new TaskResult(taskId, ProcessStatus.FAILED, null, e, executionTime);
            }
        };
        
        Future<TaskResult> future = completionService.submit(wrappedTask);
        runningTasks.put(taskId, future);
        
        return taskId;
    }
    
    public TaskResult getTaskResult(String taskId, long timeoutMs) throws InterruptedException, TimeoutException {
        Future<TaskResult> future = runningTasks.get(taskId);
        if (future == null) {
            return null;
        }
        
        try {
            TaskResult result = future.get(timeoutMs, TimeUnit.MILLISECONDS);
            runningTasks.remove(taskId);
            return result;
        } catch (ExecutionException e) {
            runningTasks.remove(taskId);
            Throwable cause = e.getCause();
            if (cause instanceof RuntimeException) {
                throw (RuntimeException) cause;
            }
            throw new RuntimeException("Task execution error", cause);
        }
    }
    
    public List<TaskResult> waitForAllTasks(long timeoutMs) throws InterruptedException {
        List<TaskResult> results = new ArrayList<>();
        long deadline = System.currentTimeMillis() + timeoutMs;
        
        while (!runningTasks.isEmpty() && System.currentTimeMillis() < deadline) {
            try {
                long remainingTime = deadline - System.currentTimeMillis();
                if (remainingTime <= 0) break;
                
                Future<TaskResult> future = completionService.poll(remainingTime, TimeUnit.MILLISECONDS);
                if (future != null) {
                    TaskResult result = future.get();
                    results.add(result);
                    
                    // Remove from running tasks
                    runningTasks.entrySet().removeIf(entry -> entry.getValue() == future);
                }
            } catch (ExecutionException e) {
                logger.severe("Task execution error: " + e.getMessage());
            }
        }
        
        return results;
    }
    
    public void shutdown() {
        logger.info("TaskManager kapatılıyor...");
        executorService.shutdown();
        try {
            if (!executorService.awaitTermination(10, TimeUnit.SECONDS)) {
                executorService.shutdownNow();
            }
        } catch (InterruptedException e) {
            executorService.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
    
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("runningTasks", runningTasks.size());
        stats.put("isShutdown", executorService.isShutdown());
        stats.put("isTerminated", executorService.isTerminated());
        return stats;
    }
}

// Utility Classes
class ReflectionUtils {
    public static void printAnnotationInfo(Class<?> clazz) {
        System.out.println("=== " + clazz.getSimpleName() + " Annotation Bilgileri ===");
        
        // Class annotations
        Annotation[] classAnnotations = clazz.getAnnotations();
        for (Annotation annotation : classAnnotations) {
            System.out.println("Sınıf Annotation: " + annotation);
        }
        
        // Method annotations
        Method[] methods = clazz.getDeclaredMethods();
        for (Method method : methods) {
            Annotation[] methodAnnotations = method.getAnnotations();
            if (methodAnnotations.length > 0) {
                System.out.println("Method: " + method.getName());
                for (Annotation annotation : methodAnnotations) {
                    System.out.println("  Annotation: " + annotation);
                }
            }
        }
        
        System.out.println();
    }
    
    public static <T> T createInstance(Class<T> clazz) throws ReflectiveOperationException {
        Constructor<T> constructor = clazz.getDeclaredConstructor();
        constructor.setAccessible(true);
        return constructor.newInstance();
    }
    
    public static void invokeMethodWithAnnotation(Object obj, Class<? extends Annotation> annotationClass) {
        Class<?> clazz = obj.getClass();
        Method[] methods = clazz.getDeclaredMethods();
        
        for (Method method : methods) {
            if (method.isAnnotationPresent(annotationClass)) {
                try {
                    method.setAccessible(true);
                    method.invoke(obj);
                    System.out.println("Invoked method: " + method.getName());
                } catch (Exception e) {
                    System.err.println("Error invoking method " + method.getName() + ": " + e.getMessage());
                }
            }
        }
    }
}

class StreamUtils {
    public static <T> Collector<T, ?, Map<T, Long>> groupingByCount() {
        return Collectors.groupingBy(Function.identity(), Collectors.counting());
    }
    
    public static <T> Predicate<T> distinctByKey(Function<? super T, ?> keyExtractor) {
        Set<Object> seen = ConcurrentHashMap.newKeySet();
        return t -> seen.add(keyExtractor.apply(t));
    }
    
    public static <T> Stream<T> takeWhile(Stream<T> stream, Predicate<T> predicate) {
        return stream.takeWhile(predicate);
    }
    
    public static <T> Optional<T> findAny(Collection<T> collection, Predicate<T> predicate) {
        return collection.stream().filter(predicate).findAny();
    }
}

// Main Test Class
@Component(name = "AdvancedJavaTest", version = "3.0")
public class AdvancedJavaTest {
    private static final Logger logger = Logger.getLogger(AdvancedJavaTest.class.getName());
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    
    public static void main(String[] args) {
        System.out.println("☕ Gelişmiş Java Test Sistemi");
        System.out.println("=" + "=".repeat(50));
        
        try {
            // Setup logging
            setupLogging();
            
            // Run comprehensive tests
            runComprehensiveTests();
            
            System.out.println("\n✅ Tüm testler başarıyla tamamlandı!");
            
        } catch (Exception e) {
            logger.severe("Test hatası: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    private static void setupLogging() {
        Logger rootLogger = Logger.getLogger("");
        rootLogger.setLevel(Level.INFO);
        
        // Console handler
        ConsoleHandler consoleHandler = new ConsoleHandler();
        consoleHandler.setLevel(Level.INFO);
        consoleHandler.setFormatter(new SimpleFormatter() {
            @Override
            public String format(LogRecord record) {
                return String.format("[%s] %s: %s%n",
                    FORMATTER.format(LocalDateTime.now()),
                    record.getLevel(),
                    record.getMessage());
            }
        });
        rootLogger.addHandler(consoleHandler);
    }
    
    private static void runComprehensiveTests() throws Exception {
        logger.info("🧪 Kapsamlı testler başlatılıyor...");
        
        // 1. Repository ve Entity testleri
        testRepositoryAndEntities();
        
        // 2. Data Processor testleri
        testDataProcessors();
        
        // 3. Observer Pattern testi
        testObserverPattern();
        
        // 4. Command Pattern testi
        testCommandPattern();
        
        // 5. Task Management testi
        testTaskManagement();
        
        // 6. Stream API testleri
        testStreamOperations();
        
        // 7. Reflection testleri
        testReflection();
        
        // 8. Concurrency testleri
        testConcurrency();
    }
    
    private static void testRepositoryAndEntities() {
        logger.info("📋 Repository ve Entity testleri...");
        
        InMemoryUserRepository repository = new InMemoryUserRepository();
        
        // Create users
        User user1 = new User.Builder()
                .username("alice")
                .email("alice@example.com")
                .firstName("Alice")
                .lastName("Johnson")
                .addRole("USER")
                .addRole("ADMIN")
                .metadata("department", "IT")
                .build();
        
        User user2 = new User.Builder()
                .username("bob")
                .email("bob@example.com")
                .firstName("Bob")
                .lastName("Smith")
                .addRole("USER")
                .metadata("department", "Sales")
                .build();
        
        // Save users
        repository.save(user1);
        repository.save(user2);
        
        // Test queries
        logger.info("Toplam kullanıcı: " + repository.count());
        logger.info("Admin rolündeki kullanıcılar: " + repository.findByRole("ADMIN").size());
        logger.info("Aktif kullanıcılar: " + repository.findActiveUsers().size());
        
        // Test user statistics
        User.Statistics stats = user1.getStatistics();
        stats.increment("login_count");
        stats.increment("login_count");
        stats.increment("page_views");
        
        logger.info("User1 login count: " + stats.getCount("login_count"));
        
        // Role statistics
        Map<String, Long> roleStats = repository.getUserStatsByRole();
        logger.info("Rol istatistikleri: " + roleStats);
    }
    
    private static void testDataProcessors() throws ProcessingException {
        logger.info("📋 Data Processor testleri...");
        
        StringDataProcessor stringProcessor = new StringDataProcessor();
        NumberDataProcessor numberProcessor = new NumberDataProcessor();
        
        // String processing
        String input = "Hello World! Test String 123";
        String result = stringProcessor.process(input);
        logger.info("String işleme sonucu: " + input + " -> " + result);
        
        // Number processing
        Number numberInput = 42.5;
        Double numberResult = numberProcessor.process(numberInput);
        logger.info("Number işleme sonucu: " + numberInput + " -> " + numberResult);
        
        // Test validation
        logger.info("String processor can process empty string: " + stringProcessor.canProcess(""));
        logger.info("Number processor can process NaN: " + numberProcessor.canProcess(Double.NaN));
    }
    
    private static void testObserverPattern() throws InterruptedException {
        logger.info("📋 Observer Pattern testi...");
        
        EventPublisher<User> publisher = new EventPublisher<>();
        
        // Create observers
        UserEventObserver observer1 = new UserEventObserver("Observer1");
        UserEventObserver observer2 = new UserEventObserver("Observer2");
        UserEventObserver observer3 = new UserEventObserver("Observer3");
        
        // Subscribe observers
        publisher.subscribe(observer1);
        publisher.subscribe(observer2);
        publisher.subscribe(observer3);
        
        // Create and publish events
        for (int i = 0; i < 5; i++) {
            User user = new User.Builder()
                    .username("user" + i)
                    .email("user" + i + "@example.com")
                    .addRole("USER")
                    .build();
            
            publisher.publish(user);
            Thread.sleep(100); // Small delay between events
        }
        
        Thread.sleep(500); // Wait for async processing
        
        logger.info("Observer1 event count: " + observer1.getEventCount());
        logger.info("Observer2 event count: " + observer2.getEventCount());
        logger.info("Observer3 event count: " + observer3.getEventCount());
    }
    
    private static void testCommandPattern() throws CommandException {
        logger.info("📋 Command Pattern testi...");
        
        InMemoryUserRepository repository = new InMemoryUserRepository();
        List<Command<User>> commands = new ArrayList<>();
        
        // Create commands
        for (int i = 0; i < 3; i++) {
            CreateUserCommand command = new CreateUserCommand(
                repository, 
                "cmduser" + i, 
                "cmduser" + i + "@example.com"
            );
            commands.add(command);
        }
        
        // Execute commands
        List<User> createdUsers = new ArrayList<>();
        for (Command<User> command : commands) {
            User user = command.execute();
            createdUsers.add(user);
            logger.info("Command executed: " + user.getUsername());
        }
        
        logger.info("Repository count after commands: " + repository.count());
        
        // Undo some commands
        for (int i = 0; i < 2; i++) {
            Command<User> command = commands.get(i);
            if (command.canUndo()) {
                command.undo();
                logger.info("Command undone: " + command.getCommandName());
            }
        }
        
        logger.info("Repository count after undo: " + repository.count());
    }
    
    private static void testTaskManagement() throws InterruptedException, TimeoutException {
        logger.info("📋 Task Management testi...");
        
        TaskManager taskManager = new TaskManager(4);
        List<String> taskIds = new ArrayList<>();
        
        // Submit various tasks
        for (int i = 0; i < 10; i++) {
            final int taskNumber = i;
            
            Callable<String> task = () -> {
                Thread.sleep(100 + (int)(Math.random() * 200)); // Random delay
                return "Task " + taskNumber + " completed";
            };
            
            String taskId = taskManager.submitTask(task, "Task" + i);
            taskIds.add(taskId);
        }
        
        // Wait for all tasks to complete
        List<TaskManager.TaskResult> results = taskManager.waitForAllTasks(5000);
        
        logger.info("Completed tasks: " + results.size());
        
        long successfulTasks = results.stream()
                .mapToLong(result -> result.isSuccessful() ? 1 : 0)
                .sum();
        
        logger.info("Successful tasks: " + successfulTasks);
        
        double averageExecutionTime = results.stream()
                .mapToLong(TaskManager.TaskResult::getExecutionTimeMs)
                .average()
                .orElse(0.0);
        
        logger.info("Average execution time: " + averageExecutionTime + "ms");
        
        taskManager.shutdown();
    }
    
    private static void testStreamOperations() {
        logger.info("📋 Stream API testleri...");
        
        // Create test data
        List<User> users = IntStream.range(0, 20)
                .mapToObj(i -> new User.Builder()
                        .username("streamuser" + i)
                        .email("streamuser" + i + "@example.com")
                        .firstName("User" + i)
                        .addRole(i % 3 == 0 ? "ADMIN" : "USER")
                        .active(i % 4 != 0)
                        .build())
                .collect(Collectors.toList());
        
        // Stream operations
        logger.info("Total users: " + users.size());
        
        long activeUsers = users.stream()
                .filter(User::isActive)
                .count();
        logger.info("Active users: " + activeUsers);
        
        Map<String, Long> roleDistribution = users.stream()
                .flatMap(user -> user.getRoles().stream())
                .collect(StreamUtils.groupingByCount());
        logger.info("Role distribution: " + roleDistribution);
        
        List<String> usernames = users.stream()
                .filter(User::isActive)
                .filter(user -> user.hasRole("USER"))
                .map(User::getUsername)
                .sorted()
                .limit(5)
                .collect(Collectors.toList());
        logger.info("First 5 active user usernames: " + usernames);
        
        Optional<User> adminUser = StreamUtils.findAny(users, user -> user.hasRole("ADMIN"));
        logger.info("Found admin user: " + adminUser.map(User::getUsername).orElse("None"));
        
        // Parallel stream operations
        long parallelCount = users.parallelStream()
                .filter(User::isActive)
                .filter(user -> user.getUsername().contains("1"))
                .count();
        logger.info("Parallel filtered count: " + parallelCount);
    }
    
    private static void testReflection() {
        logger.info("📋 Reflection testleri...");
        
        // Print annotation info for various classes
        ReflectionUtils.printAnnotationInfo(User.class);
        ReflectionUtils.printAnnotationInfo(InMemoryUserRepository.class);
        ReflectionUtils.printAnnotationInfo(StringDataProcessor.class);
        
        // Test method invocation by annotation
        try {
            StringDataProcessor processor = new StringDataProcessor();
            ReflectionUtils.invokeMethodWithAnnotation(processor, Benchmark.class);
        } catch (Exception e) {
            logger.warning("Reflection method invocation failed: " + e.getMessage());
        }
    }
    
    private static void testConcurrency() throws InterruptedException {
        logger.info("📋 Concurrency testleri...");
        
        // Shared data structures
        ConcurrentHashMap<String, AtomicLong> counters = new ConcurrentHashMap<>();
        ExecutorService executor = Executors.newFixedThreadPool(10);
        
        // Submit concurrent tasks
        List<Future<?>> futures = new ArrayList<>();
        for (int i = 0; i < 50; i++) {
            final String key = "counter" + (i % 5);
            
            Future<?> future = executor.submit(() -> {
                counters.computeIfAbsent(key, k -> new AtomicLong(0)).incrementAndGet();
                
                try {
                    Thread.sleep(10);
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                }
            });
            
            futures.add(future);
        }
        
        // Wait for all tasks
        for (Future<?> future : futures) {
            try {
                future.get(1, TimeUnit.SECONDS);
            } catch (Exception e) {
                logger.warning("Concurrent task failed: " + e.getMessage());
            }
        }
        
        // Print results
        counters.forEach((key, value) -> 
            logger.info("Counter " + key + ": " + value.get()));
        
        executor.shutdown();
        executor.awaitTermination(5, TimeUnit.SECONDS);
    }
}
