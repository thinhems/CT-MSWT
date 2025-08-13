# Tính năng Quản lý Yêu cầu (Request Management)

## Tổng quan
Tính năng Quản lý Yêu cầu cho phép người dùng tạo, xem, cập nhật và xóa các yêu cầu từ nhân viên. Tính năng này tích hợp với API endpoint `/api/request` và cung cấp giao diện người dùng thân thiện.

## Các thành phần chính

### 1. Hook: `useRequest.ts`
- **Vị trí**: `src/hooks/useRequest.ts`
- **Chức năng**: Quản lý state và API calls cho requests
- **Các hook chính**:
  - `useRequests()`: Lấy tất cả yêu cầu
  - `useRequestsWithRole()`: Lấy yêu cầu với thông tin role
  - `useRequest(id)`: Lấy yêu cầu theo ID
- **Các function**:
  - `createRequest()`: Tạo yêu cầu mới
  - `updateRequest()`: Cập nhật yêu cầu
  - `updateRequestStatus()`: Cập nhật trạng thái
  - `deleteRequest()`: Xóa yêu cầu

### 2. Component: `RequestTable.jsx`
- **Vị trí**: `src/components/RequestTable.jsx`
- **Chức năng**: Hiển thị danh sách yêu cầu dạng bảng
- **Tính năng**:
  - Hiển thị thông tin yêu cầu
  - Phân loại theo độ ưu tiên và trạng thái
  - Actions: Xem chi tiết, Cập nhật
  - Responsive design

### 3. Page: `RequestManagement.jsx`
- **Vị trí**: `src/pages/RequestManagement.jsx`
- **Chức năng**: Trang chính quản lý yêu cầu
- **Tính năng**:
  - 4 tabs: Tất cả, Giám sát, Công nhân, Của tôi
  - Filter theo độ ưu tiên
  - Thêm yêu cầu mới
  - Xem và cập nhật yêu cầu
  - Phân trang

## API Endpoints

### Base URL
```
https://capstoneproject-mswt-su25.onrender.com/api
```

### Endpoints
- `GET /api/request` - Lấy tất cả yêu cầu
- `GET /api/request/with-role` - Lấy yêu cầu với thông tin role
- `GET /api/request/{id}` - Lấy yêu cầu theo ID
- `POST /api/request` - Tạo yêu cầu mới
- `PUT /api/request/{id}` - Cập nhật yêu cầu
- `PATCH /api/request/{id}/status` - Cập nhật trạng thái
- `DELETE /api/request/{id}` - Xóa yêu cầu

## Cấu trúc dữ liệu

### Request Interface
```typescript
interface Request {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  requestType: string;
  location: string;
  requestedBy: string;
  contactInfo: string;
  createdDate: string;
  timeCreated: string;
  createdBy: string;
  assignedTo: string;
  imageUrl?: string;
  requesterRole?: string;
}
```

### Request Types
- `1`: Vệ sinh
- `2`: Bảo trì
- `3`: Cung cấp
- `4`: Khác

### Priority Levels
- `1`: Cao
- `2`: Trung bình
- `3`: Thấp

### Status Values
- `1`: Đã gửi
- `2`: Đang xử lý
- `3`: Đã hoàn thành

## Cách sử dụng

### 1. Truy cập tính năng
- Đăng nhập vào hệ thống
- Click vào tab "Yêu cầu" trong sidebar
- Hoặc truy cập trực tiếp: `/request-management`

### 2. Xem yêu cầu
- Sử dụng các tab để lọc yêu cầu
- Filter theo độ ưu tiên
- Sử dụng phân trang để xem nhiều yêu cầu

### 3. Tạo yêu cầu mới
- Click nút "Thêm yêu cầu mới"
- Điền thông tin cần thiết
- Upload hình ảnh (tùy chọn)
- Click "Tạo yêu cầu"

### 4. Cập nhật yêu cầu
- Click vào action menu (3 chấm) trong bảng
- Chọn "Cập nhật"
- Thay đổi thông tin cần thiết
- Click "Cập nhật"

### 5. Xem chi tiết
- Click vào action menu
- Chọn "Xem chi tiết"
- Xem đầy đủ thông tin yêu cầu

## Tích hợp với hệ thống

### 1. Sidebar
- Tab "Yêu cầu" đã được thêm vào sidebar
- Icon: `HiOutlineClipboardList`

### 2. Routing
- Route: `/request-management`
- Component: `RequestManagement`

### 3. Authentication
- Sử dụng `useAuth()` context
- Phân quyền theo role người dùng

## Tính năng đặc biệt

### 1. Role-based Filtering
- **Tất cả yêu cầu**: Hiển thị tất cả yêu cầu
- **Giám sát**: Chỉ hiển thị yêu cầu từ Supervisor
- **Công nhân**: Chỉ hiển thị yêu cầu từ Worker
- **Của tôi**: Chỉ hiển thị yêu cầu của Leader hiện tại

### 2. Priority Management
- Hệ thống 3 cấp độ ưu tiên
- Màu sắc phân biệt rõ ràng
- Filter theo độ ưu tiên

### 3. Image Support
- Upload hình ảnh khi tạo yêu cầu
- Preview hình ảnh
- Hiển thị trong chi tiết yêu cầu

### 4. Responsive Design
- Tương thích với mobile
- Bảng responsive
- Modal responsive

## Troubleshooting

### 1. Lỗi API
- Kiểm tra kết nối internet
- Kiểm tra API endpoint
- Xem console log để debug

### 2. Lỗi hiển thị
- Refresh trang
- Kiểm tra dữ liệu API response
- Kiểm tra console errors

### 3. Lỗi authentication
- Đăng xuất và đăng nhập lại
- Kiểm tra token
- Kiểm tra quyền người dùng

## Phát triển tương lai

### 1. Tính năng có thể thêm
- Export dữ liệu (Excel, PDF)
- Email notifications
- Push notifications
- Advanced filtering
- Bulk operations

### 2. Cải tiến UI/UX
- Dark mode
- Customizable themes
- Advanced animations
- Better mobile experience

## Liên hệ hỗ trợ
Nếu gặp vấn đề hoặc cần hỗ trợ, vui lòng liên hệ team phát triển.
