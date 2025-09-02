# API Testing Dashboard

Frontend React để test tất cả các API endpoints của server.

## 🚀 Tính năng

### 🔐 Authentication APIs
- **Register**: Đăng ký tài khoản mới
- **Login**: Đăng nhập với email và password
- **Logout**: Đăng xuất
- **Refresh Token**: Làm mới access token

### 👤 User APIs
- **Get Profile**: Lấy thông tin profile người dùng
- **Update Profile**: Cập nhật thông tin cá nhân
- **Upload Avatar**: Upload ảnh đại diện

### 📝 Posts APIs
- **Create Post**: Tạo bài viết mới
- **List Posts**: Lấy danh sách bài viết với pagination, search, sort
- **Update Post**: Cập nhật bài viết
- **Delete Post**: Xóa bài viết

### 📤 Upload APIs
- **Upload File**: Upload file lên server
- **Get File Meta**: Lấy thông tin metadata của file
- **Delete File**: Xóa file

### 🌐 Google OAuth
- **Google Login**: Đăng nhập bằng Google

## 🛠️ Cài đặt và chạy

### Yêu cầu
- Node.js (version 14 trở lên)
- npm hoặc yarn
- Server backend đang chạy ở `http://localhost:4000`

### Bước 1: Cài đặt dependencies
```bash
npm install
```

### Bước 2: Chạy ứng dụng
```bash
npm start
```

Ứng dụng sẽ chạy ở `http://localhost:3000`

## 📱 Cách sử dụng

### 1. Authentication
- **Đăng ký**: Điền họ tên, email và password để tạo tài khoản mới
- **Đăng nhập**: Sử dụng email và password đã đăng ký
- **Refresh Token**: Làm mới token khi cần thiết

### 2. User Management
- **Get Profile**: Lấy thông tin profile hiện tại
- **Update Profile**: Thay đổi tên hiển thị
- **Upload Avatar**: Chọn file ảnh để làm avatar

### 3. Posts Management
- **Create Post**: Tạo bài viết với tiêu đề, nội dung và trạng thái
- **List Posts**: Xem danh sách bài viết với các tùy chọn tìm kiếm và sắp xếp
- **Update Post**: Cập nhật tiêu đề hoặc nội dung bài viết
- **Delete Post**: Xóa bài viết theo ID

### 4. File Upload
- **Upload File**: Chọn file để upload lên server
- **Get File Info**: Xem thông tin chi tiết của file theo ID
- **Delete File**: Xóa file theo ID

### 5. Google OAuth
- **Google Login**: Click để đăng nhập bằng Google

## 🔧 Cấu hình

### API Base URL
Mặc định frontend sẽ gọi API đến `http://localhost:4000/api/v1`. Nếu bạn muốn thay đổi, hãy sửa trong file `src/App.js`:

```javascript
axios.defaults.baseURL = 'YOUR_API_BASE_URL';
```

### CORS
Đảm bảo server backend đã cấu hình CORS để cho phép frontend gọi API:

```javascript
app.use(cors({ origin: true, credentials: true }));
```

## 📁 Cấu trúc thư mục

```
├── public/
│   └── index.html
├── src/
│   ├── App.js          # Component chính
│   ├── App.css         # Styles cho App component
│   ├── index.js        # Entry point
│   └── index.css       # Global styles
├── package.json
└── README.md
```

## 🎨 Giao diện

- **Responsive Design**: Tương thích với mọi kích thước màn hình
- **Modern UI**: Sử dụng gradient colors và smooth animations
- **Tab Navigation**: Chia thành 5 tabs chính để dễ dàng test từng nhóm API
- **Real-time Response**: Hiển thị response từ API ngay lập tức
- **Loading States**: Hiển thị trạng thái loading khi gọi API
- **Error Handling**: Xử lý và hiển thị lỗi một cách rõ ràng

## 🔍 Debug và Testing

### Console Logs
Tất cả các API calls và responses đều được log ra console để dễ dàng debug.

### Network Tab
Sử dụng Developer Tools > Network tab để xem chi tiết các HTTP requests.

### Response Display
Mỗi API call sẽ hiển thị response trong một box riêng biệt với:
- Status (Success/Error)
- Timestamp
- Full response data

## 🚨 Lưu ý

1. **Authentication Required**: Một số API endpoints yêu cầu đăng nhập trước
2. **File Upload**: Hỗ trợ upload file với giới hạn 20MB
3. **Pagination**: Posts API hỗ trợ phân trang với limit 10 items/page
4. **Search & Sort**: Posts API hỗ trợ tìm kiếm và sắp xếp theo nhiều tiêu chí

## 🤝 Đóng góp

Nếu bạn muốn thêm tính năng mới hoặc cải thiện giao diện, hãy tạo pull request hoặc báo cáo issue.

## 📄 License

MIT License
