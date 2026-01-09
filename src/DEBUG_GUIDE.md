# 🐛 Hướng dẫn Debug - Khắc phục màn hình trắng

## 🔍 Bước 1: Kiểm tra Console

### Mở Developer Tools
1. Mở trình duyệt (Chrome/Firefox/Edge)
2. Nhấn **F12** hoặc **Ctrl + Shift + I** (Windows/Linux) hoặc **Cmd + Option + I** (Mac)
3. Chọn tab **Console**

### Các lỗi phổ biến và cách xử lý

#### ❌ Lỗi 1: CORS Error
```
Access to XMLHttpRequest at 'http://localhost:8088/api/...' from origin 'http://localhost:3000' 
has been blocked by CORS policy
```

**Nguyên nhân**: Backend chưa cấu hình CORS

**Giải pháp**:
```java
// Thêm vào backend Java Spring Boot
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:3000", "http://localhost:5173")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

Sau đó **restart backend**.

---

#### ❌ Lỗi 2: ERR_CONNECTION_REFUSED
```
GET http://localhost:8088/api/medical-campaigns net::ERR_CONNECTION_REFUSED
```

**Nguyên nhân**: Backend chưa chạy hoặc chạy sai port

**Giải pháp**:
1. Kiểm tra backend đang chạy:
   ```bash
   # Trong terminal backend
   mvn spring-boot:run
   ```
2. Kiểm tra backend chạy trên port 8088
3. Test API trực tiếp: `curl http://localhost:8088/api/medical-campaigns`

---

#### ❌ Lỗi 3: 404 Not Found
```
GET http://localhost:8088/api/medical-campaigns 404 (Not Found)
```

**Nguyên nhân**: API endpoint không tồn tại hoặc controller chưa được map đúng

**Giải pháp**:
1. Kiểm tra controller có annotation `@RestController` và `@RequestMapping("/api/medical-campaigns")`
2. Kiểm tra method có annotation `@GetMapping`, `@PostMapping`, etc.
3. Restart backend sau khi sửa code

---

#### ❌ Lỗi 4: Module not found
```
Failed to resolve module specifier "axios"
```

**Nguyên nhân**: Thiếu dependencies

**Giải pháp**:
```bash
npm install axios
```

---

#### ❌ Lỗi 5: React component error
```
ReferenceError: handleImportExcel is not defined
```

**Nguyên nhân**: Function chưa được định nghĩa hoặc import sai

**Giải pháp**: Kiểm tra code đã được cập nhật đúng

---

## 🔍 Bước 2: Kiểm tra Network Tab

### Mở Network Tab
1. Mở Developer Tools (F12)
2. Chọn tab **Network**
3. Refresh trang (Ctrl + R hoặc Cmd + R)

### Kiểm tra các API calls

#### ✅ API Call thành công
- Status: **200 OK**
- Response có dữ liệu

#### ❌ API Call thất bại

**Status 0** hoặc **CORS error**:
- Backend chưa chạy
- CORS chưa cấu hình
- URL sai

**Status 404**:
- Endpoint không tồn tại
- Base URL sai

**Status 500**:
- Lỗi server
- Kiểm tra backend logs

---

## 🔍 Bước 3: Kiểm tra Backend Logs

### Xem logs trong terminal backend

```bash
# Chạy backend với logs chi tiết
mvn spring-boot:run

# Hoặc nếu dùng IDE (IntelliJ/Eclipse), xem tab Console
```

### Các log quan trọng

```
Started Application in X seconds
Tomcat started on port(s): 8088 (http)
```
➡️ Backend đã khởi động thành công

```
Mapped "{[/api/medical-campaigns],methods=[GET]}"
```
➡️ Endpoint đã được map thành công

```
java.lang.NullPointerException
```
➡️ Lỗi code trong backend, cần fix

---

## 🔍 Bước 4: Test API trực tiếp

### Dùng cURL (Terminal)

```bash
# Test lấy danh sách đợt khám
curl http://localhost:8088/api/medical-campaigns

# Nếu thành công sẽ trả về JSON array []
```

### Dùng Postman

1. Mở Postman
2. Tạo request mới:
   - Method: GET
   - URL: `http://localhost:8088/api/medical-campaigns`
3. Click **Send**
4. Kiểm tra response

---

## 🔍 Bước 5: Kiểm tra file .env

### Vị trí file
```
/your-project/.env
```

### Nội dung đúng
```env
VITE_API_BASE_URL=http://localhost:8088/api
```

### Lưu ý
- **KHÔNG có khoảng trắng** trước/sau dấu `=`
- URL **KHÔNG có** dấu `/` cuối cùng
- Phải **restart** `npm run dev` sau khi sửa .env

---

## 🔍 Bước 6: Kiểm tra Port

### Frontend port
Mặc định Vite chạy trên port **5173** hoặc **3000**

```bash
# Xem trong terminal khi chạy npm run dev
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

### Backend port
Mặc định Spring Boot chạy trên port **8088**

```bash
# Xem trong terminal backend
Tomcat started on port(s): 8088 (http)
```

### Nếu port bị conflict
```bash
# Kiểm tra port đang được sử dụng
# Windows
netstat -ano | findstr :8088

# Linux/Mac
lsof -i :8088

# Kill process nếu cần
# Windows
taskkill /PID <PID> /F

# Linux/Mac
kill -9 <PID>
```

---

## ✅ Checklist Debug theo thứ tự

### ☑️ 1. Backend
- [ ] Backend đang chạy? (`mvn spring-boot:run`)
- [ ] Port 8088 hoạt động? (`curl http://localhost:8088/api/medical-campaigns`)
- [ ] CORS đã cấu hình?
- [ ] Không có lỗi trong backend logs?

### ☑️ 2. Frontend
- [ ] Đã chạy `npm install`?
- [ ] File `.env` đã tạo và đúng nội dung?
- [ ] `npm run dev` chạy thành công?
- [ ] Không có lỗi trong Console (F12)?

### ☑️ 3. Network
- [ ] API calls xuất hiện trong Network tab?
- [ ] Status code là 200 OK?
- [ ] Response có dữ liệu?

### ☑️ 4. Browser
- [ ] Đã thử refresh (Ctrl + R)?
- [ ] Đã thử hard refresh (Ctrl + Shift + R)?
- [ ] Đã thử xóa cache?

---

## 🛠️ Solutions nhanh

### Solution 1: Reset hoàn toàn

```bash
# Frontend
rm -rf node_modules package-lock.json
npm install
npm run dev

# Backend
mvn clean install
mvn spring-boot:run
```

### Solution 2: Chạy frontend trước, không cần backend

App đã được cấu hình để chạy được mà không cần backend. Các API errors chỉ log ra console.

```bash
# Chỉ cần
npm run dev
```

Mở http://localhost:5173 - Giao diện sẽ hiển thị (không có dữ liệu)

### Solution 3: Test từng bước

**Bước 1**: Backend có chạy không?
```bash
curl http://localhost:8088/api/medical-campaigns
```

**Bước 2**: Frontend có build không?
```bash
npm run dev
```

**Bước 3**: CORS có hoạt động không?
- Mở http://localhost:5173
- Xem Network tab
- Kiểm tra CORS error

---

## 📸 Screenshots hữu ích

### Console không có lỗi ✅
```
[vite] connected
```

### Console có lỗi ❌
```
Error loading exam periods: AxiosError {message: 'Network Error'...}
```

### Network tab thành công ✅
```
medical-campaigns   200   application/json   [...response data...]
```

### Network tab thất bại ❌
```
medical-campaigns   (failed)   net::ERR_CONNECTION_REFUSED
```

---

## 🆘 Vẫn không chạy được?

### Thu thập thông tin

1. **Console errors** (F12 > Console):
   - Copy toàn bộ error messages
   
2. **Network errors** (F12 > Network):
   - Screenshot các request màu đỏ
   
3. **Backend logs**:
   - Copy errors từ terminal backend
   
4. **Environment**:
   ```bash
   node -v        # Node version
   npm -v         # npm version
   java -version  # Java version
   ```

5. **File .env content**:
   ```
   cat .env
   ```

### Gửi thông tin để được hỗ trợ

Gửi kèm:
- Console errors
- Network tab screenshot
- Backend logs
- Node/Java version
- OS (Windows/Mac/Linux)

---

## 💡 Tips

1. **Luôn mở Console khi dev** - Nhấn F12
2. **Kiểm tra Network tab** - Xem API calls
3. **Đọc error messages** - Thường có hướng dẫn rõ ràng
4. **Google error messages** - Nhiều người gặp vấn đề tương tự
5. **Test API riêng** - Dùng curl/Postman trước khi test từ frontend

---

## 🎯 Kết luận

Hầu hết vấn đề "màn hình trắng" do:
1. **Backend chưa chạy** (80% trường hợp)
2. **CORS chưa cấu hình** (15% trường hợp)
3. **Dependencies thiếu** (5% trường hợp)

➡️ **Kiểm tra theo checklist trên sẽ fix được phần lớn vấn đề!**
