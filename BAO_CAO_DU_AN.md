# BÁO CÁO TÓM TẮT DỰ ÁN: Web Bán Source Code

---

## 1. Tổng quan dự án

Đây là một nền tảng thương mại điện tử chuyên bán source code (marketplace). Người dùng có thể duyệt, lọc, thêm vào giỏ hàng và mua các bộ source code hoàn chỉnh. Sau khi thanh toán được xác nhận bởi admin, khách hàng có thể tải file ZIP của sản phẩm về máy.

Dự án theo kiến trúc Full-stack tách biệt rõ ràng:
- **Frontend**: Single Page Application (SPA), deploy trên GitHub Pages
- **Backend**: RESTful API, chạy trên server riêng hoặc localhost

---

## 2. Kiến trúc & Công nghệ sử dụng

### Frontend

| Thành phần       | Công nghệ                                        |
|------------------|--------------------------------------------------|
| Framework        | React 17 + TypeScript 4.9                        |
| Routing          | React Router DOM v6 (HashRouter)                 |
| UI Component     | Reactstrap + Bootstrap 4 + Now UI Kit            |
| State Management | React Context API (AuthContext, CartContext, OrderContext) |
| HTTP Client      | Fetch API (tự đóng gói trong `lib/api.ts`)       |
| Styling          | SCSS + Bootstrap 4                               |
| Build Tool       | Create React App (react-scripts 5)               |
| Deploy           | GitHub Pages (gh-pages)                          |

### Backend

| Thành phần | Công nghệ                              |
|------------|----------------------------------------|
| Framework  | Spring Boot 3.3.12                     |
| Ngôn ngữ   | Java 17                                |
| ORM        | Spring Data JPA + Hibernate            |
| Database   | MySQL (production) / H2 (development)  |
| Auth       | Custom session-based (ConcurrentHashMap) |
| Email      | Spring Boot Mail (Gmail SMTP)          |
| Build      | Maven                                  |
| Tiện ích   | Lombok, Spring Validation, Spring DevTools |

---
    
## 3. Chức năng đã thực hiện

### Phía khách hàng (Customer)
- Trang chủ: danh sách sản phẩm, lọc theo ngôn ngữ / giá / loại dự án / danh mục
- Trang catalog: xem toàn bộ sản phẩm, tìm kiếm
- Trang chi tiết sản phẩm: ảnh, mô tả, tech stack, đánh giá
- Giỏ hàng: thêm / xóa / thay đổi số lượng, áp mã giảm giá
- Checkout: tạo đơn hàng, chọn hình thức thanh toán
- Trang downloads: xem và tải file ZIP sau khi đơn hàng được duyệt
- Trang profile: thông tin tài khoản
- Đăng ký / Đăng nhập / Xác thực email / Gửi lại email xác thực
- Chat hỗ trợ (scripted chatbot)
- Blog: danh sách bài viết và chi tiết bài viết

### Phía quản trị (Admin)
- Dashboard quản lý toàn bộ: sản phẩm, đơn hàng, tài khoản
- Thêm / sửa / xóa sản phẩm (kèm upload ảnh bìa, ảnh chi tiết, file ZIP)
- Quản lý đơn hàng: xem danh sách, xác nhận thanh toán (`pending` → `paid`)
- Quản lý tài khoản: tạo / sửa / xóa user, phân quyền admin/customer
- Bảo vệ route admin bằng `AdminRoute` (chỉ cho phép role `admin`)

### Backend API

| Controller              | Chức năng                                                        |
|-------------------------|------------------------------------------------------------------|
| `AuthController`        | Đăng ký, đăng nhập, đăng xuất, xác thực email, lấy thông tin user |
| `ProductController`     | Danh sách, chi tiết sản phẩm, download file ZIP (kiểm tra quyền) |
| `CommerceController`    | Giỏ hàng, tạo đơn hàng, validate mã giảm giá, review, download list |
| `AdminProductController`| CRUD sản phẩm + upload file                                      |
| `AdminOrderController`  | Xem tất cả đơn, cập nhật trạng thái                              |
| `AdminUserController`   | CRUD tài khoản người dùng                                        |

---

## 4. Mô hình dữ liệu chính

| Entity              | Các trường chính                                                                 |
|---------------------|---------------------------------------------------------------------------------|
| `UserAccount`       | id, email, passwordHash, displayName, role (admin/customer), emailVerified       |
| `ProductRecord`     | id, title, slug, price, categoryId, techStack, description, coverImagePath, zipFilePath |
| `OrderRecord`       | id, userId, items[], subtotal, discountCode, discountAmount, total, status        |
| `OrderItem`         | productId, productTitle, price, quantity, license                                |
| `CartItem`          | userId, productId, quantity, license, supportPlan                                |
| `DiscountCode`      | code, type (percentage/fixed), value, minOrder, expiryDate, active               |
| `VerificationToken` | code, userId, createdAt                                                          |

---

## 5. Phân công công việc

| STT | Công việc | Mô tả chi tiết | Người thực hiện |
|-----|-----------|----------------|-----------------|
| 1 | Tìm kiếm & lựa chọn template | Nghiên cứu, đánh giá và chọn template Now UI Kit React phù hợp với yêu cầu dự án | A |
| 2 | Chuẩn hóa cấu trúc dự án | Tái cấu trúc thư mục, thiết lập TypeScript, cấu hình routing với HashRouter | A |
| 3 | Xây dựng lớp giao tiếp API | Đóng gói Fetch API vào `lib/api.ts`, xử lý token, error handling thống nhất toàn dự án | A |
| 4 | Tích hợp Context API | Xây dựng AuthContext, CartContext, OrderContext để quản lý state toàn cục | A |
| 5 | Kết nối Frontend – Backend | Tích hợp tất cả các trang với REST API: sản phẩm, giỏ hàng, đơn hàng, auth, download | A |
| 6 | Xây dựng Backend Spring Boot | Thiết kế và triển khai toàn bộ REST API: Auth, Product, Commerce, Admin controllers | A |
| 7 | Thiết kế cơ sở dữ liệu | Thiết kế các entity JPA, quan hệ bảng, cấu hình Hibernate tự động tạo schema | A |
| 8 | Tích hợp xác thực email | Cấu hình Gmail SMTP, xây dựng luồng gửi & xác thực email đăng ký | A |
| 9 | Sửa lỗi hiển thị dữ liệu | Sửa các lỗi dữ liệu trả về không hiển thị đúng trên giao diện (sản phẩm, đơn hàng, profile) | B |
| 10 | Hoàn thiện giao diện trang chủ | Chỉnh sửa layout, căn chỉnh responsive, bổ sung hiệu ứng hover cho card sản phẩm | B |
| 11 | Hoàn thiện trang Admin Dashboard | Sửa lỗi hiển thị bảng sản phẩm / đơn hàng / user, cải thiện UX form thêm sản phẩm | B |
| 12 | Hoàn thiện trang giỏ hàng & checkout | Sửa lỗi tính toán giá, giao diện nút tăng/giảm số lượng, hiển thị mã giảm giá | B |
| 13 | Hoàn thiện trang chi tiết sản phẩm | Sửa lỗi load ảnh, bổ sung hiển thị tech stack, section đánh giá sản phẩm | B |
| 14 | Hoàn thiện trang Downloads | Sửa lỗi hiển thị danh sách sản phẩm đã mua, nút tải file | B |
| 15 | Viết báo cáo & tài liệu | Viết báo cáo tóm tắt dự án, hướng dẫn cài đặt, bảng phân công | B |

### Tỷ lệ đóng góp

| Thành viên | Phạm vi | Tỷ lệ |
|------------|---------|-------|
| A | Kiến trúc hệ thống, Backend toàn bộ, tầng API Frontend, tích hợp dữ liệu | ~60% |
| B | Hoàn thiện giao diện, sửa lỗi chi tiết, tài liệu | ~40% |

---

## 6. Hướng dẫn cài đặt & chạy dự án

### Yêu cầu môi trường

| Công cụ    | Phiên bản tối thiểu |
|------------|---------------------|
| Java JDK   | 17                  |
| Maven      | 3.8+                |
| Node.js    | 16+                 |
| npm        | 8+                  |
| MySQL      | 8.0+ (nếu dùng production DB) |

---

### Chạy Backend

**Bước 1 — Clone dự án và vào thư mục Backend:**
```bash
cd Chuyen-De-Web-Ban-Source-Code/Backend
```

**Bước 2 — Cấu hình database:**

Mặc định dự án kết nối MySQL. Tạo database trước:
```sql
CREATE DATABASE sourcecode CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Chỉnh sửa `src/main/resources/application.properties` nếu cần:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/sourcecode?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=<mật_khẩu_mysql_của_bạn>
```

> **Lưu ý:** Nếu không muốn cài MySQL, có thể chuyển sang H2 (in-memory) bằng cách thay:
> ```properties
> spring.datasource.url=jdbc:h2:file:./data/backenddb
> spring.datasource.driverClassName=org.h2.Driver
> spring.datasource.username=sa
> spring.datasource.password=
> spring.h2.console.enabled=true
> ```

**Bước 3 — (Tùy chọn) Cấu hình Gmail SMTP để gửi email xác thực:**
```properties
spring.mail.username=<your_gmail>@gmail.com
spring.mail.password=<gmail_app_password>
```
> Cần bật "App Password" trong tài khoản Google (2FA phải được bật).

**Bước 4 — Cấu hình email admin:**
```properties
app.admin.email=admin@gmail.com
```
> Tài khoản đăng ký với email này sẽ tự động được cấp quyền `admin`.

**Bước 5 — Build và chạy:**
```bash
# Sử dụng Maven Wrapper (không cần cài Maven riêng)
./mvnw spring-boot:run

# Hoặc trên Windows
mvnw.cmd spring-boot:run
```

Backend sẽ chạy tại: `http://localhost:8080`

---

### Chạy Frontend

**Bước 1 — Vào thư mục Frontend:**
```bash
cd Chuyen-De-Web-Ban-Source-Code/Frontend
```

**Bước 2 — Cài dependencies:**
```bash
npm install --legacy-peer-deps
```

**Bước 3 — (Tùy chọn) Cấu hình URL backend:**

Mặc định Frontend gọi tới `http://localhost:8080/api`. Nếu backend chạy ở địa chỉ khác, tạo file `.env.local`:
```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

**Bước 4 — Chạy development server:**
```bash
npm start
```

Frontend sẽ chạy tại: `http://localhost:3000`

---

### Tài khoản mặc định để test

| Vai trò  | Cách tạo                                                                              |
|----------|---------------------------------------------------------------------------------------|
| Admin    | Đăng ký tài khoản với email trùng với `app.admin.email` trong `application.properties` (mặc định: `admin@gmail.com`) |
| Customer | Đăng ký tài khoản bất kỳ, xác thực email, sau đó đăng nhập bình thường               |

> Sau khi đăng ký, kiểm tra hộp thư email để lấy link xác thực. Nếu chưa cấu hình SMTP, có thể vào database và set `email_verified = true` thủ công.

---

### Deploy Frontend lên GitHub Pages

```bash
npm run deploy
```

Lệnh này sẽ tự động build và push lên nhánh `gh-pages`. Cần cấu hình `homepage` trong `package.json` đúng với repo của bạn:
```json
"homepage": "https://<username>.github.io/<repo-name>"
```

---

## 7. Kết quả đạt được

- Xây dựng hoàn chỉnh một marketplace bán source code với đầy đủ luồng: duyệt → giỏ hàng → checkout → admin duyệt → tải file
- Tích hợp hệ thống xác thực email (gửi link verify qua Gmail SMTP)
- Mã giảm giá hoạt động cả phía client (fallback) lẫn phía server (validate API)
- Upload file sản phẩm (ảnh + ZIP) từ Admin Dashboard
- Deploy Frontend lên GitHub Pages với HashRouter để tương thích static hosting
- Phân quyền 2 cấp rõ ràng: customer và admin

---

## 8. Hạn chế & Vấn đề bảo mật phát hiện

| Mức độ   | Vấn đề                                                          | File liên quan                          |
|----------|-----------------------------------------------------------------|-----------------------------------------|
| Critical | Hash mật khẩu bằng SHA-256 (nên thay bằng BCryptPasswordEncoder) | `AuthService.java`, `AdminUserService.java` |
| Critical | Hardcoded credentials trong source code                         | `useScriptedChat.ts`                    |
| High     | Token lưu trong `localStorage` (dễ bị XSS đánh cắp, nên dùng `httpOnly` cookie) | `api.ts`         |
| High     | Path traversal khi xử lý file upload/download                   | `ProductController.java`                |
| High     | XSS tiềm năng khi render dữ liệu từ server không được sanitize  | `productImages.ts`, `DownloadsPage.tsx` |
| High     | Log injection từ input người dùng chưa được sanitize            | `CartContext.tsx`, `OrderContext.tsx`   |
| Medium   | Gọi `.get()` trên `Optional` không kiểm tra `isPresent()`       | `CommerceService.java`                  |
| Medium   | Session lưu trong bộ nhớ RAM (mất khi restart server)           | `AuthService.java`                      |
| Medium   | Cyclomatic complexity cao, khó bảo trì và test                  | `AdminProductService.java`              |

---

> Dự án có nền tảng chức năng vững chắc và luồng nghiệp vụ đầy đủ, phù hợp cho mục đích học tập / demo. Để đưa lên môi trường production cần ưu tiên xử lý các vấn đề bảo mật **Critical** và **High** trước tiên.
