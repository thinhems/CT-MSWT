# API Thêm Chi Tiết Lịch Trình - Cập nhật

## Endpoint
```
POST /api/scheduledetails/{scheduleId}/details
```

## Request Body Format
**⚠️ QUAN TRỌNG: API yêu cầu dữ liệu trực tiếp, KHÔNG wrap trong detailDto**

```json
{
  "description": "string",
  "workerGroupId": "string",
  "startTime": "string | null",
  "groupAssignmentId": "string",
  "areaId": "string"
}
```

## Các thay đổi đã thực hiện

### 1. Cập nhật Model (`scheduleDetails.model.ts`)
```typescript
export interface ICreateScheduleDetailsRequest {
  description: string;
  workerGroupId: string;
  startTime: string | null;
  groupAssignmentId: string;
  areaId: string;
}
```

### 2. Cập nhật Hook (`useScheduleDetails.ts`)
```typescript
const createScheduleDetailForSchedule = async (
  scheduleId: string, 
  requestData: ICreateScheduleDetailsRequest
) => {
  try {
    console.log("📝 Creating schedule detail for schedule:", scheduleId, "with data:", requestData);

    const response = await swrFetcher(API_URLS.SCHEDULE_DETAILS.CREATE_FOR_SCHEDULE(scheduleId), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    console.log("✅ Schedule detail created successfully:", response);

    // Refresh the data
    mutate();

    return response;
  } catch (error) {
    console.error("Error creating schedule detail for schedule:", error);
    throw error;
  }
};
```

### 3. Cập nhật Component (`ScheduleDetailsModal.tsx`)
```typescript
// Create request body according to new API format
const requestBody = {
  description: newDetail.description,
  workerGroupId: newDetail.workerGroupId,
  startTime: newDetail.startTime || null, // Handle empty time
  groupAssignmentId: newDetail.groupAssignmentId,
  areaId: newDetail.areaId,
};
```

### 4. Cập nhật API Endpoint cho Worker Group
```typescript
WORKER_GROUP: {
  GET_ALL: `workerGroup`, // GET /api/workerGroup - Tất cả nhóm làm việc
  // ... other endpoints
}
```

## Form Fields

### ✅ **Các trường đã được loại bỏ:**
- **"Ngày thực hiện"** (date) - đã xóa khỏi form và state
- **"Trạng thái"** (status) - đã xóa khỏi form và state

### ✅ **Form hiện tại chỉ còn các trường cần thiết:**
1. **Chọn nhóm công nhân** (workerGroupId) - từ API `GET /api/workerGroup`
2. **Thời gian bắt đầu** (startTime) - định dạng `HH:MM:SS` (input text tự do)
3. **Chọn phân công nhóm** (groupAssignmentId)
4. **Khu vực** (areaId)
5. **Mô tả công việc** (description)

## Lưu ý quan trọng

### 🔧 **Sửa lỗi 500 Internal Server Error:**
- **Trước đây**: Request body được wrap trong `detailDto` → gây lỗi 500
- **Bây giờ**: Request body gửi trực tiếp các trường → đúng format API

### 🔧 **Sửa lỗi kết nối mạng:**
- SWR fetcher có retry logic (tối đa 3 lần)
- Xử lý timeout và network errors

### 📝 **Request Body Example:**
```json
{
  "description": "Vệ sinh khu vực A",
  "workerGroupId": "wg-001",
  "startTime": "08:00:00",
  "groupAssignmentId": "ga-001",
  "areaId": "area-001"
}
```

## Trạng thái hiện tại

✅ **Đã hoàn thành:**
- Loại bỏ các trường không cần thiết (date, status)
- Cập nhật API endpoint cho Worker Group
- Sửa format request body (không wrap trong detailDto)
- Cập nhật interface và hook
- Field startTime cho phép nhập tự do định dạng HH:MM:SS

🔄 **Sẵn sàng test:**
- Form "+ Thêm chi tiết" đã được cập nhật
- API call sẽ gửi đúng format
- Không còn lỗi linter
