# Hướng dẫn tích hợp Backend Java

## 📋 Cấu trúc API cần thiết

### 1. Student Management APIs

#### GET /api/students
- **Mô tả**: Lấy danh sách học sinh (có phân trang)
- **Query Params**:
  - `page`: số trang (bắt đầu từ 0)
  - `size`: số lượng item/trang
  - `sort`: sắp xếp (vd: "name,asc")
  - `examPeriodId`: lọc theo đợt khám
  - `classId`: lọc theo lớp
  - `search`: tìm kiếm theo tên/CCCD
  - `status`: lọc theo trạng thái (Đã khám/Chưa khám)
- **Response**:
```json
{
  "content": [
    {
      "id": "1",
      "name": "Nguyễn Văn A",
      "citizenId": "040223002938",
      "studentCode": "2401079943",
      "birthDate": "2022-02-21",
      "gender": "Nam",
      "class": "Lớp 2B",
      "address": "Khối 6 Phường Đồi Cung",
      "status": "Đã khám",
      "healthData": {
        "weight": "25.5",
        "height": "120.0",
        "sdd": false,
        "overweight": true,
        "obesity": false,
        "myopia_correct": false,
        "myopia_incorrect": true,
        "notify_family": "Ghi chú...",
        "overall_status": "Khỏe"
      }
    }
  ],
  "totalElements": 100,
  "totalPages": 2,
  "currentPage": 0,
  "pageSize": 50
}
```

#### GET /api/students/{id}
- **Mô tả**: Lấy thông tin chi tiết một học sinh
- **Response**: Object Student

#### POST /api/students
- **Mô tả**: Thêm học sinh mới
- **Request Body**:
```json
{
  "name": "Nguyễn Văn A",
  "citizenId": "040223002938",
  "studentCode": "2401079943",
  "birthDate": "2022-02-21",
  "gender": "Nam",
  "class": "Lớp 2B",
  "address": "Khối 6 Phường Đồi Cung"
}
```
- **Response**: Object Student đã tạo

#### PUT /api/students/{id}
- **Mô tả**: Cập nhật thông tin học sinh
- **Request Body**: Partial Student object
- **Response**: Object Student đã cập nhật

#### DELETE /api/students/{id}
- **Mô tả**: Xóa học sinh
- **Response**: 204 No Content

#### PUT /api/students/{id}/health-data
- **Mô tả**: Cập nhật kết quả khám sức khỏe
- **Request Body**:
```json
{
  "weight": "25.5",
  "height": "120.0",
  "sdd": false,
  "overweight": true,
  "obesity": false,
  "myopia_correct": false,
  "myopia_incorrect": true,
  "hyperopia": false,
  "astigmatism": false,
  "strabismus": false,
  "refractive_error": false,
  "vkm": false,
  "cavities": false,
  "gingivitis": false,
  "nose_inflammation": false,
  "throat_inflammation": false,
  "ear_infection": false,
  "hearing_loss": false,
  "scoliosis": false,
  "flat_feet": false,
  "limb_deformity": false,
  "eczema": false,
  "skin_allergy": false,
  "fungal_infection": false,
  "anxiety": false,
  "depression": false,
  "behavioral_disorder": false,
  "respiratory_disease": false,
  "heart_disease": false,
  "digestive_disease": false,
  "notify_family": "Ghi chú...",
  "overall_status": "Khỏe"
}
```
- **Response**: Object Student đã cập nhật

#### POST /api/students/import
- **Mô tả**: Import học sinh từ file Excel
- **Content-Type**: multipart/form-data
- **Request**: File Excel
- **Response**:
```json
{
  "success": 50,
  "failed": 2,
  "errors": ["Dòng 5: CCCD không hợp lệ", "Dòng 10: Thiếu tên học sinh"]
}
```

#### GET /api/students/export
- **Mô tả**: Export danh sách học sinh ra Excel
- **Query Params**: Giống GET /api/students
- **Response**: File Excel (blob)

### 2. Exam Period Management APIs

#### GET /api/exam-periods
- **Mô tả**: Lấy danh sách đợt khám
- **Response**:
```json
[
  {
    "id": "1",
    "name": "Đợt khám học kỳ 1 - 2025",
    "startDate": "2025-01-01",
    "endDate": "2025-06-30",
    "semester": "Học kỳ 1",
    "year": 2025,
    "isActive": true,
    "description": "Khám sức khỏe định kỳ"
  }
]
```

#### GET /api/exam-periods/active
- **Mô tả**: Lấy đợt khám đang active
- **Response**: Object ExamPeriod hoặc null

#### POST /api/exam-periods
- **Mô tả**: Tạo đợt khám mới
- **Request Body**: Object ExamPeriod
- **Response**: Object ExamPeriod đã tạo

#### PUT /api/exam-periods/{id}
- **Mô tả**: Cập nhật đợt khám
- **Request Body**: Partial ExamPeriod
- **Response**: Object ExamPeriod đã cập nhật

#### DELETE /api/exam-periods/{id}
- **Mô tả**: Xóa đợt khám
- **Response**: 204 No Content

#### PUT /api/exam-periods/{id}/activate
- **Mô tả**: Kích hoạt đợt khám (tự động deactivate các đợt khác)
- **Response**: Object ExamPeriod đã kích hoạt

### 3. Health Report APIs

#### GET /api/health-reports/{examPeriodId}/export
- **Mô tả**: Xuất biên bản kết quả khám sức khỏe
- **Response**: File PDF hoặc Word (blob)

## 🔐 Authentication (Optional)

Nếu cần authentication, thêm các API sau:

#### POST /api/auth/login
- **Request Body**:
```json
{
  "username": "admin",
  "password": "password123"
}
```
- **Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "1",
    "username": "admin",
    "fullName": "Quản trị viên",
    "role": "ADMIN"
  }
}
```

#### POST /api/auth/logout
- **Response**: 200 OK

## ⚙️ Backend Configuration (Java Spring Boot)

### 1. CORS Configuration
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:5173", "http://localhost:3000")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

### 2. Entity Classes

```java
@Entity
@Table(name = "students")
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String name;
    private String citizenId;
    private String studentCode;
    private LocalDate birthDate;
    private String gender;
    private String className;
    private String address;
    private String status;
    
    @OneToOne(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "health_data_id")
    private HealthData healthData;
    
    // Getters, setters, constructors
}

@Entity
@Table(name = "health_data")
public class HealthData {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String weight;
    private String height;
    
    // Dinh dưỡng
    private Boolean sdd;
    private Boolean overweight;
    private Boolean obesity;
    
    // Mắt
    private Boolean myopiaCorrect;
    private Boolean myopiaIncorrect;
    private Boolean hyperopia;
    private Boolean astigmatism;
    private Boolean strabismus;
    private Boolean refractiveError;
    private Boolean vkm;
    
    // Răng
    private Boolean cavities;
    private Boolean gingivitis;
    
    // Tai mũi họng
    private Boolean noseInflammation;
    private Boolean throatInflammation;
    private Boolean earInfection;
    private Boolean hearingLoss;
    
    // Cơ xương khớp
    private Boolean scoliosis;
    private Boolean flatFeet;
    private Boolean limbDeformity;
    
    // Da liễu
    private Boolean eczema;
    private Boolean skinAllergy;
    private Boolean fungalInfection;
    
    // Tâm thần
    private Boolean anxiety;
    private Boolean depression;
    private Boolean behavioralDisorder;
    
    // Nội khoa
    private Boolean respiratoryDisease;
    private Boolean heartDisease;
    private Boolean digestiveDisease;
    
    @Column(length = 1000)
    private String notifyFamily;
    
    private String overallStatus;
    
    @OneToOne(mappedBy = "healthData")
    private Student student;
    
    // Getters, setters
}

@Entity
@Table(name = "exam_periods")
public class ExamPeriod {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    
    private String name;
    private LocalDate startDate;
    private LocalDate endDate;
    private String semester;
    private Integer year;
    private Boolean isActive;
    
    @Column(length = 1000)
    private String description;
    
    // Getters, setters
}
```

### 3. Repository Layer
```java
@Repository
public interface StudentRepository extends JpaRepository<Student, String> {
    Page<Student> findByNameContainingOrCitizenIdContaining(
        String name, String citizenId, Pageable pageable
    );
    
    Page<Student> findByClassNameAndStatus(
        String className, String status, Pageable pageable
    );
}

@Repository
public interface ExamPeriodRepository extends JpaRepository<ExamPeriod, String> {
    Optional<ExamPeriod> findByIsActiveTrue();
}
```

### 4. Exception Handling
```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
        ResourceNotFoundException ex
    ) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.NOT_FOUND.value(),
            ex.getMessage(),
            LocalDateTime.now()
        );
        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        ErrorResponse error = new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            "Có lỗi xảy ra: " + ex.getMessage(),
            LocalDateTime.now()
        );
        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
```

## 🚀 Frontend Setup

### 1. Cài đặt dependencies
```bash
npm install axios
```

### 2. Cấu hình environment
Tạo file `.env` từ `.env.example`:
```bash
cp .env.example .env
```

Chỉnh sửa `.env`:
```
VITE_API_BASE_URL=http://localhost:8080/api
```

### 3. Sử dụng trong component
```typescript
import { useStudents } from '../hooks/useStudents';

function StudentTable() {
  const {
    students,
    loading,
    error,
    fetchStudents,
    addStudent,
    updateStudent,
    deleteStudent,
    updateHealthData,
  } = useStudents();
  
  // Sử dụng các function để tương tác với API
}
```

## 📝 Checklist tích hợp

### Backend (Java)
- [ ] Tạo các Entity classes (Student, HealthData, ExamPeriod)
- [ ] Tạo Repository layer
- [ ] Tạo Service layer
- [ ] Tạo Controller với các endpoints
- [ ] Cấu hình CORS
- [ ] Thêm Exception Handling
- [ ] Test các API endpoints (Postman/Swagger)
- [ ] Setup Database (MySQL/PostgreSQL)
- [ ] Thêm validation cho request body
- [ ] (Optional) Implement JWT authentication

### Frontend (React)
- [ ] Cài đặt axios
- [ ] Tạo file `.env` với API URL
- [ ] Copy các file service (`api.ts`, `studentService.ts`, `examPeriodService.ts`)
- [ ] Copy hook `useStudents.ts`
- [ ] Update component `StudentTable` để dùng hook
- [ ] Xử lý loading states
- [ ] Xử lý error states
- [ ] Test tích hợp end-to-end

## 🔍 Testing

Test từng API endpoint:
1. Start backend server: `mvn spring-boot:run`
2. Start frontend: `npm run dev`
3. Kiểm tra CORS trong browser console
4. Test CRUD operations
5. Test phân trang và filter
6. Test import/export Excel

## 📚 Tài liệu tham khảo

- Spring Boot Documentation: https://spring.io/projects/spring-boot
- Axios Documentation: https://axios-http.com/
- React Query (Alternative): https://tanstack.com/query/latest
