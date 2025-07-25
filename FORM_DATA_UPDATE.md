# Cập nhật Form Data cho Schedule Details

## Tổng quan
Đã cập nhật phần thêm chi tiết công việc trong thông tin lịch trình để sử dụng FormData thay vì JSON, phù hợp với yêu cầu API.

## Các thay đổi chính

### 1. Cập nhật ScheduleDetailsModal.tsx
- **Thêm trường mới vào state:**
  - Bỏ trường `date` khỏi state

- **Cập nhật form UI:**
  - Bỏ trường Date với type `datetime-local`
  - Bỏ trường Status và checkbox "Send empty value"
  - Bỏ hiển thị kiểu dữ liệu cho các trường
  - Bỏ placeholder "string" trong các input fields
  - Cập nhật layout để đơn giản hơn

- **Cập nhật xử lý submit:**
  - Sử dụng FormData thay vì JSON
  - Gửi dữ liệu với format key-value như form HTML
  - Status được gửi với giá trị rỗng
  - Date được tự động set với ngày hiện tại

### 2. Cập nhật useScheduleDetails.ts
- **Thay đổi hàm `createScheduleDetailForSchedule`:**
  - Nhận FormData thay vì JSON object
  - Loại bỏ Content-Type header để browser tự động set cho FormData

### 3. Cập nhật swr-fetcher.ts
- **Thêm hỗ trợ FormData:**
  - Kiểm tra loại body (FormData vs JSON)
  - Xử lý Content-Type header phù hợp
  - Cập nhật request interceptor

## Cấu trúc FormData

FormData được gửi với các trường sau:

```javascript
const formData = new FormData();
formData.append('Description', newDetail.description);
formData.append('Date', new Date().toISOString()); // Tự động set ngày hiện tại
formData.append('Status', ''); // Send empty status
formData.append('WorkerId', newDetail.workerId || '');
formData.append('AssignmentId', newDetail.assignmentId);
```

## Các trường trong form

1. **AssignmentId** - Bắt buộc
   - Dropdown để chọn loại công việc

2. **Description** - Bắt buộc
   - Textarea để nhập mô tả công việc (không có placeholder)

3. **WorkerId** - Tùy chọn
   - Dropdown để chọn nhân viên thực hiện

## Tính năng mới

- **FormData support:** Gửi dữ liệu dạng key-value như form HTML
- **Status tự động:** Status được gửi với giá trị rỗng
- **UI/UX đơn giản:** Layout gọn gàng, bỏ các thông tin không cần thiết
- **Placeholder sạch:** Bỏ placeholder "string" trong các input fields
- **Validation cải tiến:** Kiểm tra đầy đủ các trường bắt buộc

## Lưu ý kỹ thuật

- FormData được gửi với Content-Type tự động set bởi browser
- Không cần set Content-Type header thủ công cho FormData
- Tất cả các trường đều được gửi dưới dạng key-value pairs
- Status luôn được gửi với giá trị rỗng
- Input fields không có placeholder để giao diện sạch sẽ hơn
- Hỗ trợ đầy đủ cho việc gửi file và dữ liệu phức tạp trong tương lai 