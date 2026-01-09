# 🚀 Hướng dẫn Setup và Chạy Ứng dụng

## 📋 Yêu cầu hệ thống
- Node.js version 16 hoặc mới hơn
- npm hoặc yarn

## 🔧 Các bước cài đặt

### 1. Cài đặt dependencies
```bash
npm install
```

### 2. Cấu hình API Backend (Tùy chọn)

#### Nếu đã có backend Java:
Tạo file `.env` trong thư mục root:
```env
VITE_API_BASE_URL=http://localhost:8088/api
```

#### Nếu chưa có backend:
App sẽ tự động chạy ở chế độ frontend-only. Bạn có thể test giao diện mà không cần backend.

### 3. Chạy ứng dụng
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

---

## 🐛 Khắc phục lỗi "Màn hình trắng"

### Nguyên nhân phổ biến:

1. **Thiếu dependencies**
   ```bash
   npm install
   ```

2. **Lỗi module không tìm thấy**
   ```bash
   # Xóa node_modules và cài lại
   rm -rf node_modules
   npm install
   ```

3. **Lỗi API connection (nếu backend chưa chạy)**
   - App đã được cấu hình để hoạt động mà không cần backend
   - Kiểm tra Console (F12) để xem lỗi chi tiết

4. **Port đã được sử dụng**
   ```bash
   # Thay đổi port trong vite.config
   # hoặc kill process đang dùng port 5173
   ```

### Kiểm tra lỗi trong Console:
1. Mở trình duyệt
2. Nhấn `F12` để mở Developer Tools
3. Xem tab **Console** để tìm lỗi
4. Xem tab **Network** để kiểm tra các API call

---

## 📡 Tích hợp Backend Java

### API Endpoints cần có:

#### 1. Medical Campaigns (Đợt khám)
```
GET    /api/medical-campaigns          - Lấy danh sách
POST   /api/medical-campaigns          - Tạo mới
PUT    /api/medical-campaigns/{id}     - Cập nhật
DELETE /api/medical-campaigns/{id}     - Xóa
GET    /api/medical-campaigns/{id}     - Lấy chi tiết
```

#### 2. Students (Học sinh)
```
GET    /api/students/campaign/{campaignId}  - Lấy danh sách theo đợt khám
POST   /api/students                         - Tạo mới
PUT    /api/students/{id}                    - Cập nhật
DELETE /api/students/{id}                    - Xóa
GET    /api/students/{id}                    - Lấy chi tiết
```

#### 3. Medical Results (Kết quả khám)
```
GET    /api/medical-results/export?campaignId={id}           - Export Excel
POST   /api/medical-results/import-excel/{campaignId}        - Import Excel
GET    /api/medical-results/export-template/{campaignId}     - Tải file mẫu
```

### CORS Configuration
Backend cần cấu hình CORS để cho phép frontend gọi API:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:5173")
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowedHeaders("*");
            }
        };
    }
}
```

---

## 📦 Dependencies chính

```json
{
  "dependencies": {
    "react": "^18.x",
    "axios": "^1.6.0",
    "lucide-react": "latest"
  }
}
```

---

## 🎯 Chức năng chính

✅ Quản lý đợt khám  
✅ Quản lý học sinh  
✅ Nhập liệu kết quả khám trực tiếp trên bảng  
✅ Import/Export Excel  
✅ Tìm kiếm và lọc dữ liệu  
✅ Tải biên bản báo cáo

---

## 💡 Tips

- **Chạy frontend trước**: Không cần backend để test giao diện
- **Mock data**: App sẽ tự động xử lý khi backend chưa sẵn sàng
- **Console logs**: Các lỗi API chỉ log ra console, không làm crash app
- **Hot reload**: Vite hỗ trợ hot reload, không cần restart khi edit code

---

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra Console (F12) để xem lỗi
2. Đảm bảo đã chạy `npm install`
3. Kiểm tra port 5173 chưa bị sử dụng
4. Kiểm tra version Node.js (>= 16)
