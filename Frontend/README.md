# Source Market – Ứng dụng bán source code

>Dự án React + Firebase giúp các nhóm dev quản lý kho source code, cho phép khách hàng duyệt catalog, thêm vào giỏ, mua và tải xuống sản phẩm số. Bạn có thể chạy dự án để demo front-end, kiểm thử chức năng giỏ hàng và quy trình đăng ký/đăng nhập với xác thực email.

## 1. Tính năng nổi bật
- **Landing & Catalog:** giao diện Now UI Kit tuỳ biến, danh mục nguồn mở theo carousel, thanh lọc source theo stack/giá.
- **Giỏ hàng tức thời:** thêm/xoá sản phẩm không cần reload, thông báo dính (sticky) hiển thị kết quả.
- **Firebase Authentication:** đăng ký, đăng nhập, bắt buộc xác thực email, resend verification trực tiếp trong app.
- **Phân quyền admin:** sử dụng custom claims, tự động điều hướng admin vào dashboard, chặn truy cập nếu chưa verify.
- **Admin Dashboard:** mock quy trình thêm source, upload file .zip, chỉnh README, xác nhận đơn hàng.
- **Hướng dẫn gán quyền:** script `npm run set-admin -- <UID>` kết hợp service account để phong admin.

## 2. Công nghệ sử dụng
- React 17 + Reactstrap (Now UI Kit).
- React Router v6 (HashRouter) để deploy tĩnh dễ dàng.
- Firebase Web SDK (Auth + Analytics).
- Context API quản lý Auth và Cart.
- SCSS tuỳ biến (`react-differences.scss`) để áp dụng theme riêng.

## 3. Cấu trúc thư mục chính
```
now-ui-kit-react/
├── src
│   ├── assets/          # SCSS, CSS, hình ảnh, font
│   ├── components/      # Navbar, Footer, Route guards...
│   ├── context/         # AuthContext, CartContext
│   ├── lib/firebase.ts  # Khởi tạo Firebase
│   ├── views/
│   │   ├── store/       # Home, Catalog, Cart, Auth...
│   │   └── admin/       # AdminDashboard
│   └── index.tsx        # Router + provider
├── scripts/setAdminClaim.js
└── README.md
```

## 4. Chuẩn bị môi trường
1. Cài Node.js ≥ 18.
2. Clone repo, sau đó cài dependencies:
    ```bash
    npm install
    ```
3. Tạo file `.env` với cấu hình Firebase (API key, authDomain...).
4. Chạy development server:
    ```bash
    npm start
    ```
5. Build production:
    ```bash
    npm run build
    ```

## 5. Thiết lập Firebase & phân quyền admin
1. Vào Firebase Console → Authentication → bật Email/Password.
2. Tạo người dùng, yêu cầu họ xác thực email.
3. Tải service account JSON và đặt ở `serviceAccountKey.json` (đã được ignore).
4. Gán quyền admin:
    ```bash
    npm run set-admin -- <UID>
    ```
    Script sẽ thiết lập custom claim `role: "admin"` và revoke token cũ.

## 6. Luồng đăng ký/đăng nhập
- Người dùng đăng ký → hệ thống gửi email xác thực → giao diện chuyển sang trạng thái chờ.
- Khi click link trong email, app tự xử lý `oobCode`, thông báo thành công và mở form đăng nhập.
- Người dùng thường chỉ được truy cập các trang `/store/*`.
- Admin đã verify sẽ thấy link "Quản trị" và tới `/admin`.

## 7. Scripts hữu ích
| Lệnh | Mô tả |
|------|-------|
| `npm start` | Chạy dev server với hot reload |
| `npm run build` | Build static bundle |
| `npm run set-admin -- <UID>` | Gán custom claim admin cho tài khoản Firebase |

## 8. Ghi chú
- `serviceAccountKey.json` tuyệt đối không commit lên repo.
- Sử dụng HashRouter nên deploy trên GitHub Pages hay hosting tĩnh rất dễ (không cần rewrite rule).
- Các mock chức năng admin (upload, xác nhận đơn) hiện chỉ dừng ở UI – cần backend riêng nếu bạn triển khai sản phẩm thật.

## 9. Thành viên & liên hệ
- **Product Owner:** Lâm Hoàng
- **Tech stack:** React, Firebase, SCSS.
- Vấn đề kỹ thuật: tạo issue trên repo hoặc liên hệ trực tiếp qua email nhóm.

