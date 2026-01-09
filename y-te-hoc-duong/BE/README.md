\# 📘 Dự án Y Tế Học Đường – Backend (Spring Boot)



\## 1. Giới thiệu



Dự án \*\*Y Tế Học Đường\*\* là hệ thống quản lý các đợt khám, kiểm tra sức khỏe định kỳ cho học sinh, bao gồm:



\* Quản lý trường học, lớp học, học sinh

\* Quản lý đợt khám sức khỏe (Medical Campaign)

\* Cấu hình nhóm khám, chỉ tiêu khám, chỉ tiêu con

\* Nhập / xuất kết quả khám bằng Excel

\* Thống kê tổng hợp kết quả khám



Backend được xây dựng bằng \*\*Java 17 + Spring Boot\*\*, sử dụng \*\*PostgreSQL\*\* và \*\*Apache POI\*\* để xử lý Excel.



---



\## 2. Yêu cầu hệ thống



\### 2.1. Phần mềm cần cài đặt



\* \*\*Java JDK 17\*\* (bắt buộc)

\* \*\*Maven 3.8+\*\* hoặc dùng Maven Wrapper

\* \*\*PostgreSQL 13+\*\*

\* \*\*Git\*\*

\* IDE khuyến nghị: \*\*IntelliJ IDEA\*\*



Kiểm tra phiên bản:



```bash

java -version

mvn -version

```



---



\## 3. Clone source code



```bash

git clone <repository-url>

cd <project-folder>

```



---



\## 4. Cấu hình Database



\### 4.1. Tạo database PostgreSQL



```sql

CREATE DATABASE y\_te\_hoc\_duong;

```



\### 4.2. Cấu hình `application.yml` hoặc `application.properties`



```yaml

spring:

&nbsp; datasource:

&nbsp;   url: jdbc:postgresql://localhost:5432/yte

&nbsp;   username: postgres

&nbsp;   password: your\_password

&nbsp;   driver-class-name: org.postgresql.Driver



&nbsp; jpa:

&nbsp;   hibernate:

&nbsp;     ddl-auto: update

&nbsp;   show-sql: true

&nbsp;   properties:

&nbsp;     hibernate:

&nbsp;       format\_sql: true



&nbsp; jackson:

&nbsp;   serialization:

&nbsp;     FAIL\_ON\_EMPTY\_BEANS: false

```




---



\## 5. Build \& Run project



\### 5.1. Build project



```bash

mvn clean install

```



\### 5.2. Chạy ứng dụng



```bash

mvn spring-boot:run

```



Hoặc chạy trực tiếp class:



```

sk.ytr.YTeHocDuongApplication

```



Mặc định server chạy tại:



```

http://localhost:8088

```



---

Sever swagger:



```

http://localhost:8088/swagger-ui/index.html

```



---



\## 6. Import / Export Excel



\### 6.1. Export file Excel mẫu



\* API export tạo file Excel \*\*chỉ có header + cấu trúc cột động\*\*

\* Header gồm:



&nbsp; \* Tiêu đề

&nbsp; \* Lớp / Trường

&nbsp; \* 3 dòng header: Nhóm khám → Chỉ tiêu → Chỉ tiêu con

\* File export \*\*dùng trực tiếp để import ngược lại\*\*



\### 6.2. Quy tắc nhập dữ liệu Excel



\* Không thay đổi cấu trúc header

\* Các ô kết quả chấp nhận:



&nbsp; \* `x`, `✓`, `1`, `true`, `có`

\* Ô trống sẽ được bỏ qua



---



\## 7. Kiến trúc \& nguyên tắc



\### 7.1. Không trả Entity trực tiếp ra API



\* \*\*Controller → DTO → Service → Entity\*\*

\* Tránh lỗi Hibernate Lazy Loading



\### 7.2. DTO Mapping



\* Sử dụng `fromEntity()` để map dữ liệu

\* Không nhúng Entity vào Response DTO



---



\## 8. Một số lỗi thường gặp



\### ❌ `No serializer found for ByteBuddyInterceptor`



\*\*Nguyên nhân:\*\* Trả Entity có quan hệ LAZY ra JSON



\*\*Cách fix chuẩn:\*\*



\* Dùng DTO thay cho Entity



---



\### ❌ `Connection refused (PostgreSQL)`



\* Kiểm tra PostgreSQL đã chạy chưa

\* Kiểm tra lại `url`, `username`, `password`



---



\## 9. Công nghệ sử dụng



\* Java 17

\* Spring Boot

\* Spring Data JPA

\* PostgreSQL

\* Apache POI (Excel)

\* Lombok

\* Jackson



---



\## 10. Ghi chú



\* Project được thiết kế để dễ mở rộng thêm:



&nbsp; \* Thống kê

&nbsp; \* Dashboard

&nbsp; \* Phân quyền

\* Khuyến nghị sử dụng DTO cho toàn bộ API response



