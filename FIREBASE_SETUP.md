# Hướng dẫn cấu hình Cloudinary

## 1. Cấu hình Cloudinary

### Bước 1: Tạo tài khoản Cloudinary
1. Truy cập [Cloudinary](https://cloudinary.com/)
2. Đăng ký tài khoản miễn phí
3. Lấy thông tin API credentials

### Bước 2: Cấu hình API endpoint
Đảm bảo backend có endpoint `/api/Cloudinary/upload` để xử lý upload ảnh.

## 2. Cách hoạt động

### Upload ảnh:
1. **Upload trực tiếp**: Hệ thống sẽ upload ảnh lên Cloudinary thông qua API
2. **Lưu URL**: URL ảnh được lưu vào state và gửi đi cùng với dữ liệu

### Luồng xử lý:
```
User chọn ảnh → Upload lên Cloudinary → Thành công → Lưu URL
                ↓
            Thất bại → Hiển thị lỗi
```

## 3. Sử dụng trong code

### Import service:
```javascript
import { uploadImageToCloudinary } from "../services/imageUploadService";
```

### Upload ảnh:
```javascript
const uploadResult = await uploadImageToCloudinary(file);
if (uploadResult.success) {
  // Sử dụng uploadResult.url
  console.log('URL ảnh:', uploadResult.url);
}
```

## 4. Troubleshooting

### Lỗi Cloudinary:
- Kiểm tra API endpoint `/api/Cloudinary/upload`
- Kiểm tra authentication token
- Kiểm tra quyền upload

### Lỗi chung:
- Kiểm tra console browser để xem lỗi chi tiết
- Đảm bảo file ảnh hợp lệ (jpg, png, gif)
- Kiểm tra kích thước file (khuyến nghị < 5MB)

## 5. Tính năng bổ sung

### Upload nhiều ảnh:
```javascript
const uploadPromises = files.map(file => uploadImageToCloudinary(file));
const results = await Promise.all(uploadPromises);
```
