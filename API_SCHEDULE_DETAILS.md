# API Thêm Chi Tiết Lịch Trình (Schedule Details)

## Endpoint
```
POST /api/scheduledetails/{scheduleId}/details
```

## Request Body
```json
{
  "description": "string",
  "workerGroupId": "string", 
  "startTime": "string",
  "groupAssignmentId": "string",
  "areaId": "string"
}
```

## Cách sử dụng trong component

### 1. Sử dụng hook có sẵn:
```typescript
import { useScheduleDetails } from '../hooks/useScheduleDetails';

const { createScheduleDetailForSchedule } = useScheduleDetails(scheduleId);

const handleSubmit = async () => {
  const requestBody = {
    description: newDetail.description,
    workerGroupId: newDetail.workerGroupId,
    startTime: newDetail.startTime,
    groupAssignmentId: newDetail.groupAssignmentId,
    areaId: newDetail.areaId,
  };
  
  try {
    const response = await createScheduleDetailForSchedule(scheduleId, requestBody);
    console.log('Thêm chi tiết thành công:', response);
  } catch (error) {
    console.error('Lỗi:', error);
  }
};
```

### 2. Sử dụng trực tiếp với swrFetcher:
```typescript
import { swrFetcher } from '../utils/swr-fetcher';
import { API_URLS } from '../constants/api-urls';

const response = await swrFetcher(
  API_URLS.SCHEDULE_DETAILS.CREATE_FOR_SCHEDULE(scheduleId),
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  }
);
```

## Các trường dữ liệu

| Trường | Bắt buộc | Mô tả |
|--------|-----------|--------|
| `description` | ✅ | Mô tả chi tiết công việc |
| `workerGroupId` | ✅ | ID của nhóm nhân viên thực hiện |
| `startTime` | ❌ | Thời gian bắt đầu (format: HH:mm) |
| `groupAssignmentId` | ✅ | ID của loại công việc |
| `areaId` | ✅ | ID của khu vực thực hiện |

## Lưu ý
- API đã được cập nhật để sử dụng JSON thay vì FormData
- Component `ScheduleDetailsModal` đã được cập nhật để phù hợp với format mới
- Các trường `date` và `status` đã được loại bỏ khỏi form
