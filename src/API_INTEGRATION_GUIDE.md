# 📚 Hướng dẫn tích hợp Backend Java API

## 🚀 Tổng quan

Hệ thống quản lý sức khỏe học sinh với 3 controller chính:
1. **MedicalCampaignController** - Quản lý đợt khám
2. **StudentController** - Quản lý học sinh
3. **MedicalResultExcelController** - Import/Export Excel

---

## 📋 Chi tiết API Endpoints

### 1️⃣ Medical Campaign APIs (Đợt khám)

**Base URL**: `/api/medical-campaigns`

#### 1.1 Lấy danh sách tất cả đợt khám
```
GET /api/medical-campaigns
```

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "school": {
      "id": 1,
      "name": "Trường Tiểu học ABC"
    },
    "schoolYear": "2025-2026",
    "campaignName": "Đợt khám học kỳ 1 năm 2025",
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-06-30T00:00:00.000Z",
    "status": "IN_PROGRESS",
    "note": "Khám sức khỏe định kỳ",
    "totalStudents": 120,
    "totalStudentsExamined": 85,
    "campaignMedicalConfig": {
      "id": 1,
      "configName": "Cấu hình khám chuẩn"
    }
  }
]
```

#### 1.2 Lấy chi tiết một đợt khám
```
GET /api/medical-campaigns/{id}
```

**Path Parameters**:
- `id` (Long) - ID của đợt khám

**Response** (200 OK): Object MedicalCampaignResponseDTO

#### 1.3 Tạo đợt khám mới
```
POST /api/medical-campaigns
Content-Type: application/json
```

**Request Body**:
```json
{
  "schoolId": 1,
  "schoolYear": "2025-2026",
  "campaignName": "Đợt khám học kỳ 1 năm 2025",
  "startDate": "2025-01-01T00:00:00.000Z",
  "endDate": "2025-06-30T00:00:00.000Z",
  "status": "DRAFT",
  "note": "Ghi chú đợt khám",
  "totalStudents": 0,
  "totalStudentsExamined": 0,
  "campaignMedicalConfig": {
    "id": 1,
    "configName": "Cấu hình chuẩn"
  }
}
```

**Response** (200 OK): Object MedicalCampaignResponseDTO đã tạo

**Các giá trị status**:
- `DRAFT` - Nháp
- `IN_PROGRESS` - Đang tiến hành
- `CLOSED` - Đã đóng

#### 1.4 Cập nhật đợt khám
```
PUT /api/medical-campaigns/{id}
Content-Type: application/json
```

**Path Parameters**:
- `id` (Long) - ID của đợt khám

**Request Body**: Giống như POST (có thể partial update)

**Response** (200 OK): Object MedicalCampaignResponseDTO đã cập nhật

#### 1.5 Xóa đợt khám
```
DELETE /api/medical-campaigns/{id}
```

**Path Parameters**:
- `id` (Long) - ID của đợt khám

**Response** (200 OK hoặc 204 No Content)

---

### 2️⃣ Student APIs (Học sinh)

**Base URL**: `/api/students`

#### 2.1 Lấy danh sách học sinh theo đợt khám
```
GET /api/students/campaign/{campaignId}
```

**Path Parameters**:
- `campaignId` (Long) - ID của đợt khám

**Response** (200 OK):
```json
[
  {
    "id": 1,
    "campaignId": 1,
    "fullName": "Nguyễn Văn A",
    "gender": "MALE",
    "dob": "2015-05-20T00:00:00.000Z",
    "address": "Khối 6 Phường Đồi Cung",
    "identityNumber": "040223002938",
    "weight": "25.5",
    "height": "120.0",
    "notifyFamily": "Ghi chú thông báo gia đình",
    "medicalResults": [
      {
        "id": 1,
        "studentId": 1,
        "medicalGroupId": 1,
        "medicalGroupName": "Mắt",
        "medicalIndicatorId": 1,
        "medicalIndicatorName": "Cận thị",
        "medicalSubIndicatorId": 1,
        "medicalSubIndicatorName": "Cận đúng số",
        "resultValue": true,
        "campaignId": 1
      }
    ]
  }
]
```

**Các giá trị gender**:
- `MALE` - Nam
- `FEMALE` - Nữ

#### 2.2 Lấy thông tin một học sinh
```
GET /api/students/{id}
```

**Path Parameters**:
- `id` (Long) - ID của học sinh

**Response** (200 OK): Object StudentResponseDTO

#### 2.3 Tạo học sinh mới
```
POST /api/students
Content-Type: application/json
```

**Request Body**:
```json
{
  "campaignId": 1,
  "fullName": "Nguyễn Văn A",
  "gender": "MALE",
  "dob": "2015-05-20T00:00:00.000Z",
  "address": "Khối 6 Phường Đồi Cung, Lào Cai",
  "identityNumber": "040223002938",
  "weight": "25.5",
  "height": "120.0",
  "notifyFamily": "Ghi chú cho gia đình"
}
```

**Response** (200 OK): Object StudentResponseDTO đã tạo

#### 2.4 Cập nhật thông tin học sinh
```
PUT /api/students/{id}
Content-Type: application/json
```

**Path Parameters**:
- `id` (Long) - ID của học sinh

**Request Body**: Giống như POST (có thể partial update)

**Response** (200 OK): Object StudentResponseDTO đã cập nhật

#### 2.5 Xóa học sinh
```
DELETE /api/students/{id}
```

**Path Parameters**:
- `id` (Long) - ID của học sinh

**Response** (200 OK hoặc 204 No Content)

---

### 3️⃣ Medical Result Excel APIs (Import/Export Excel)

**Base URL**: `/api/medical-results`

#### 3.1 Export kết quả khám ra Excel
```
GET /api/medical-results/export?campaignId={campaignId}
```

**Query Parameters**:
- `campaignId` (Long) - ID của đợt khám

**Response** (200 OK):
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="ket-qua-kham-suc-khoe-campaign-{campaignId}.xlsx"`
- Body: Binary file Excel

**Cách sử dụng trong JavaScript**:
```typescript
const response = await apiClient.get('/medical-results/export', {
  params: { campaignId: 1 },
  responseType: 'blob'
});

// Tải xuống file
const url = window.URL.createObjectURL(response.data);
const a = document.createElement('a');
a.href = url;
a.download = `ket-qua-kham-${campaignId}.xlsx`;
a.click();
window.URL.revokeObjectURL(url);
```

#### 3.2 Import kết quả khám từ Excel
```
POST /api/medical-results/import-excel/{campaignId}
Content-Type: multipart/form-data
```

**Path Parameters**:
- `campaignId` (Long) - ID của đợt khám

**Request Body** (Form Data):
- `file` (File) - File Excel (.xlsx hoặc .xls)

**Response** (200 OK):
```
"Import kết quả khám thành công"
```

**Response** (400 Bad Request) - Nếu file không hợp lệ:
```
"File Excel không được để trống"
```
hoặc
```
"File không đúng định dạng Excel (.xlsx, .xls)"
```

**Response** (500 Internal Server Error) - Nếu có lỗi:
```
"Import thất bại: {error message}"
```

**Cách sử dụng trong JavaScript**:
```typescript
const formData = new FormData();
formData.append('file', fileObject);

const response = await apiClient.post(
  `/medical-results/import-excel/${campaignId}`,
  formData,
  {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }
);
```

#### 3.3 Tải file mẫu Excel
```
GET /api/medical-results/export-template/{campaignId}
```

**Path Parameters**:
- `campaignId` (Long) - ID của đợt khám

**Response** (200 OK):
- Content-Type: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- Content-Disposition: `attachment; filename="excel_mau_ket_qua_kham.xlsx"`
- Body: Binary file Excel template

**Cách sử dụng trong JavaScript**:
```typescript
const response = await apiClient.get(
  `/medical-results/export-template/${campaignId}`,
  { responseType: 'blob' }
);

// Tải xuống file
const url = window.URL.createObjectURL(response.data);
const a = document.createElement('a');
a.href = url;
a.download = 'mau-ket-qua-kham.xlsx';
a.click();
window.URL.revokeObjectURL(url);
```

---

## 🔧 Cấu hình Backend (Java Spring Boot)

### 1. CORS Configuration

**QUAN TRỌNG**: Backend phải cấu hình CORS để frontend có thể gọi API

```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins(
                        "http://localhost:3000",
                        "http://localhost:5173"
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true)
                    .maxAge(3600);
            }
        };
    }
}
```

### 2. Application Properties

```properties
# Server Port
server.port=8088

# Database Configuration (PostgreSQL/MySQL)
spring.datasource.url=jdbc:postgresql://localhost:5432/health_management
spring.datasource.username=your_username
spring.datasource.password=your_password

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# File Upload Settings (cho import Excel)
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Date Format
spring.jackson.date-format=yyyy-MM-dd'T'HH:mm:ss.SSS'Z'
spring.jackson.time-zone=UTC
```

---

## 💻 Cấu hình Frontend (React + Vite)

### 1. Cài đặt dependencies

```bash
npm install axios
```

### 2. Tạo file .env

```bash
cp .env.example .env
```

Nội dung file `.env`:
```env
VITE_API_BASE_URL=http://localhost:8088/api
```

### 3. Cấu trúc Service Files

Đã có sẵn các file service:
- `/services/api.ts` - Axios client cấu hình sẵn
- `/services/examPeriodService.ts` - Service cho Medical Campaign APIs
- `/services/studentService.ts` - Service cho Student APIs
- `/services/medicalResultService.ts` - Service cho Excel Import/Export

### 4. Sử dụng trong Components

```typescript
import examPeriodService from '../services/examPeriodService';
import studentService from '../services/studentService';
import medicalResultService from '../services/medicalResultService';

// Lấy danh sách đợt khám
const periods = await examPeriodService.getExamPeriods();

// Lấy danh sách học sinh theo đợt khám
const students = await studentService.getStudentsByCampaign(campaignId);

// Export Excel
const blob = await medicalResultService.exportExcel(campaignId);

// Import Excel
await medicalResultService.importExcel(campaignId, fileObject);

// Tải file mẫu
const template = await medicalResultService.downloadTemplate(campaignId);
```

---

## 🐛 Troubleshooting

### Vấn đề 1: Màn hình trắng khi chạy npm run dev

**Nguyên nhân**:
- Backend chưa chạy
- CORS chưa được cấu hình
- API URL sai

**Giải pháp**:
1. Kiểm tra Console (F12) để xem lỗi
2. Đảm bảo backend đang chạy trên port 8088
3. Kiểm tra file `.env` có đúng URL backend
4. App đã được cấu hình để không crash khi backend chưa chạy (chỉ log lỗi ra console)

### Vấn đề 2: CORS Error

**Lỗi**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Giải pháp**:
1. Thêm CORS Configuration vào backend (xem phần trên)
2. Restart backend sau khi thêm cấu hình
3. Đảm bảo frontend URL trong `allowedOrigins` chính xác

### Vấn đề 3: Network Error / ERR_CONNECTION_REFUSED

**Nguyên nhân**: Backend chưa chạy hoặc port sai

**Giải pháp**:
1. Chạy backend: `mvn spring-boot:run`
2. Kiểm tra backend chạy trên đúng port 8088
3. Test API bằng Postman hoặc curl

### Vấn đề 4: Import Excel thất bại

**Giải pháp**:
1. Kiểm tra file đúng định dạng (.xlsx hoặc .xls)
2. Tải file mẫu và điền đúng format
3. Kiểm tra backend logs để xem lỗi chi tiết

---

## ✅ Checklist Tích hợp

### Backend
- [ ] Cài đặt database (PostgreSQL/MySQL)
- [ ] Cấu hình `application.properties`
- [ ] Thêm CORS Configuration
- [ ] Chạy backend: `mvn spring-boot:run` hoặc IDE
- [ ] Test API với Postman/curl
- [ ] Kiểm tra backend chạy trên port 8088

### Frontend
- [ ] Chạy `npm install`
- [ ] Tạo file `.env` từ `.env.example`
- [ ] Cập nhật `VITE_API_BASE_URL` trong `.env`
- [ ] Chạy `npm run dev`
- [ ] Mở http://localhost:3000 hoặc http://localhost:5173
- [ ] Kiểm tra Console (F12) không có lỗi CORS

### Testing
- [ ] Tạo đợt khám mới
- [ ] Thêm học sinh mới
- [ ] Xóa học sinh
- [ ] Tải file mẫu Excel
- [ ] Import Excel
- [ ] Export Excel
- [ ] Kiểm tra dữ liệu được lưu vào database

---

## 📞 Test API với cURL

```bash
# 1. Lấy danh sách đợt khám
curl http://localhost:8088/api/medical-campaigns

# 2. Tạo đợt khám mới
curl -X POST http://localhost:8088/api/medical-campaigns \
  -H "Content-Type: application/json" \
  -d '{
    "schoolId": 1,
    "schoolYear": "2025-2026",
    "campaignName": "Đợt khám HK1",
    "startDate": "2025-01-01T00:00:00.000Z",
    "endDate": "2025-06-30T00:00:00.000Z",
    "status": "DRAFT"
  }'

# 3. Lấy danh sách học sinh theo đợt khám
curl http://localhost:8088/api/students/campaign/1

# 4. Tạo học sinh mới
curl -X POST http://localhost:8088/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": 1,
    "fullName": "Nguyễn Văn A",
    "gender": "MALE",
    "dob": "2015-05-20T00:00:00.000Z",
    "identityNumber": "040223002938"
  }'

# 5. Export Excel (tải file)
curl -OJ "http://localhost:8088/api/medical-results/export?campaignId=1"

# 6. Download template
curl -OJ http://localhost:8088/api/medical-results/export-template/1
```

---

## 📚 Tài liệu tham khảo

- **Spring Boot**: https://spring.io/projects/spring-boot
- **Axios**: https://axios-http.com/
- **React**: https://react.dev/
- **Vite**: https://vitejs.dev/
- **TypeScript**: https://www.typescriptlang.org/

---

## 🎯 Luồng hoạt động của hệ thống

```
1. User mở app → Frontend gọi GET /api/medical-campaigns
2. Frontend hiển thị danh sách đợt khám
3. User chọn đợt khám → Frontend gọi GET /api/students/campaign/{id}
4. Frontend hiển thị danh sách học sinh
5. User thêm học sinh → Frontend gọi POST /api/students
6. User nhập kết quả khám trực tiếp trên bảng
7. User export Excel → Frontend gọi GET /api/medical-results/export
8. User import Excel:
   - Tải file mẫu: GET /api/medical-results/export-template/{id}
   - Upload file: POST /api/medical-results/import-excel/{id}
```

---

**Lưu ý quan trọng**:
- Đảm bảo backend đang chạy trước khi start frontend
- Kiểm tra CORS configuration nếu gặp lỗi kết nối
- App frontend đã được cấu hình để không crash khi backend chưa chạy
- Tất cả API errors đều được log ra Console (F12)
