// Base API URL for the backend
// In development, this will be proxied through Vite
// In production, this will be the direct backend URL
export const BASE_API_URL = "https://capstoneproject-mswt-su25.onrender.com/api";

export const API_URLS = {
  // User management endpoints - ĐANG ĐƯỢC SỬ DỤNG trong userService.js
  // Backend xử lý authentication trực tiếp trong login endpoint
  USER: {
    GET_ALL: `users`,
    GET_BY_ID: (id: string) => `users/${id}`,
    CREATE: `users`,
    UPDATE: (id: string) => `users/${id}`,
    UPDATE_STATUS: (id: string) => `users/update-status/${id}`,
    DELETE: (id: string) => `users/${id}`,
    LOGIN: `users/login`, // Backend xử lý login và trả về token
    REGISTER: `users/register`, // Backend xử lý register
    GET_UNASSIGNED_WORKERS: `users/unassigned-workers`, // Get unassigned workers for assignment
    GET_UNASSIGNED_SUPERVISORS: `users/unassigned-supervisors`, // Get unassigned supervisors for assignment
  },

  // Building management endpoints - ĐANG ĐƯỢC SỬ DỤNG trong useBuilding.ts
  BUILDING: {
    GET_ALL: `buildings`,
    GET_BY_ID: (id: string) => `buildings/${id}`,
    CREATE: `buildings`,
    UPDATE: (id: string) => `buildings/${id}`,
    DELETE: (id: string) => `buildings/${id}`,
  },

  // Area management endpoints - ĐANG ĐƯỢC SỬ DỤNG trong useArea.ts
  AREA: {
    GET_ALL: `areas`,
    GET_BY_ID: (id: string) => `areas/${id}`,
    CREATE: `areas`,
    UPDATE: (id: string) => `areas/${id}`,
    DELETE: (id: string) => `areas/${id}`,
    ASSIGN_TO_BUILDING: (areaId: string, buildingId: string) => `areas/${areaId}/building/${buildingId}`,
  },

  // Shift management endpoints - ĐANG ĐƯỢC SỬ DỤNG trong shifts.ts
  SHIFT: {
    GET_ALL: `shifts`,
    GET_BY_ID: (id: string) => `shifts/${id}`,
    CREATE: `shifts`,
    UPDATE: (id: string) => `shifts/${id}`,
    DELETE: (id: string) => `shifts/${id}`,
  },

  // Room management endpoints - ĐANG ĐƯỢC SỬ DỤNG trong useRoom.ts
  ROOM: {
    GET_ALL: `rooms`,
    GET_BY_ID: (id: string) => `rooms/${id}`,
    CREATE: `rooms`,
    UPDATE: (id: string) => `rooms/${id}`,
    DELETE: (id: string) => `rooms/${id}`,
  },

  // Schedule management endpoints - ĐANG ĐƯỢC SỬ DỤNG trong useSchedule.ts
  SCHEDULE: {
    GET_ALL: `schedules`,
    GET_BY_ID: (id: string) => `schedules/${id}`,
    CREATE: `schedules`,
    UPDATE: (id: string) => `schedules/${id}`,
    DELETE: (id: string) => `schedules/${id}`,
  },

  // Schedule Details management endpoints
  SCHEDULE_DETAILS: {
    GET_ALL: `scheduledetails`,
    GET_BY_ID: (id: string) => `scheduledetails/${id}`,
    GET_BY_SCHEDULE_ID: (scheduleId: string) => `scheduledetails/schedule/${scheduleId}`,
    CREATE: `scheduledetails`,
    CREATE_FOR_SCHEDULE: (scheduleId: string) => `scheduledetails/${scheduleId}/details`,
    UPDATE: (id: string) => `scheduledetails/${id}`,
    UPDATE_RATING: (id: string) => `scheduledetails/scheduledetails/rating/${id}`,
    ASSIGN_WORKER: (id: string) => `scheduledetails/user/worker/${id}`,
    ASSIGN_SUPERVISOR: (id: string) => `scheduledetails/user/supervisor/${id}`,
    DELETE: (id: string) => `scheduledetails/${id}`,
  },

  // Shifts management endpoints
  SHIFTS: {
    GET_ALL: `shifts`,
    GET_BY_ID: (id: string) => `shifts/${id}`,
    CREATE: `shifts`,
    UPDATE: (id: string) => `shifts/${id}`,
    DELETE: (id: string) => `shifts/${id}`,
  },

  // Assignments management endpoints
  ASSIGNMENTS: {
    GET_ALL: `assignments`, // Correct plural form from Swagger
    GET_BY_ID: (id: string) => `assignments/${id}`,
    CREATE: `assignments`,
    UPDATE: (id: string) => `assignments/${id}`,
    DELETE: (id: string) => `assignments/${id}`,
  },

  // TrashBin management endpoints
  TRASHBIN: {
    GET_ALL: `trashbins`,
    GET_BY_ID: (id: string) => `trashbins/${id}`,
    CREATE: `trashbins`,
    UPDATE: (id: string) => `trashbins/${id}`,
    DELETE: (id: string) => `trashbins/${id}`,
    TOGGLE_STATUS: (id: string) => `trashbins/toggle-status/${id}`,
  },

  // Report management endpoints - ĐANG ĐƯỢC SỬ DỤNG trong ReportManagement.jsx
  REPORT: {
    GET_ALL: `reports`, // GET /api/reports - Báo cáo tổng
    GET_WITH_ROLE: `reports/with-role`, // GET /api/reports/with-role - Filter theo role
    GET_BY_ID: (id: string) => `reports/${id}`,
    CREATE: `reports`,
    CREATE_LEADER: `reports/leader-supervisor`, // POST /api/reports/leader-supervisor - Tạo báo cáo cho Leader
    UPDATE: (id: string) => `reports/${id}`,
    UPDATE_STATUS: (id: string) => `reports/${id}/status`, // PATCH /api/reports/{id}/status
    DELETE: (id: string) => `reports/${id}`,
  },

  // Alerts management endpoints
  ALERTS: {
    GET_ALL: `alerts`,
    GET_BY_ID: (id: string) => `alerts/${id}`,
    GET_BY_USER: (userId: string) => `alerts/user/${userId}`,
    CREATE: `alerts`,
    UPDATE: (id: string) => `alerts/${id}`,
    MARK_AS_READ: (id: string) => `alerts/${id}/read`,
    MARK_ALL_AS_READ: (userId: string) => `alerts/user/${userId}/read-all`,
    DELETE: (id: string) => `alerts/${id}`,
  },

  // Notifications management endpoints
  NOTIFICATIONS: {
    GET_ALL: `notifications`,
    GET_BY_ID: (id: string) => `notifications/${id}`,
    GET_BY_USER: (userId: string) => `notifications/user/${userId}`,
    CREATE: `notifications`,
    UPDATE: (id: string) => `notifications/${id}`,
    MARK_AS_READ: (id: string) => `notifications/${id}/read`,
    MARK_ALL_AS_READ: (userId: string) => `notifications/user/${userId}/read-all`,
    DELETE: (id: string) => `notifications/${id}`,
  },

  // Attendance record endpoints
  ATTENDANCE: {
    GET_ALL: `attendanceRecord/all`,
    GET_BY_DATE: (date: string) => `attendanceRecord/date/${date}`,
  },

  // Request management endpoints
  REQUEST: {
    GET_ALL: `request`, // GET /api/request - Tất cả yêu cầu
    GET_WITH_ROLE: `request`, // Use the same endpoint since /with-role doesn't exist
    GET_BY_ID: (id: string) => `request/${id}`,
    CREATE: `request`,
    CREATE_LEADER: `request/leader`, // POST /api/request/leader - Tạo yêu cầu cho Leader
    UPDATE: (id: string) => `request/${id}`,
    UPDATE_STATUS: (id: string) => `request/${id}/status`, // PATCH /api/request/{id}/status
    DELETE: (id: string) => `request/${id}`,
  },

  // Worker Group management endpoints
  WORKER_GROUP: {
    GET_ALL: `workerGroup/get-all`, // GET /api/workerGroup/get-all - Tất cả nhóm làm việc
    GET_BY_ID: (id: string) => `workerGroup/${id}`, // GET /api/workerGroup/{id}
    CREATE: `workerGroup`,
    UPDATE: (id: string) => `workerGroup/${id}`, // PUT /api/workerGroup/{id}
    DELETE: (id: string) => `workerGroup/${id}`,
    GET_ALL_MEMBERS: `workGroupMember/all-members`, // GET /api/workGroupMember/all-members - Tất cả thành viên nhóm
    GET_AVAILABLE_USERS: `workerGroup/available-users`, // GET /api/workerGroup/available-users - Lấy danh sách user có thể thêm vào nhóm
    UPDATE_MEMBERS: (groupId: string) => `workerGroup/${groupId}/members`, // POST /api/workerGroup/{groupId}/members
  },

  // Group Assignment management endpoints
  GROUP_ASSIGNMENT: {
    GET_ALL: `groupAssignment/get-all`, // GET /api/groupAssignment/get-all - Tất cả nhóm công việc
    CREATE: `groupAssignment`,
    UPDATE: (id: string) => `groupAssignment/${id}`,
    DELETE: (id: string) => `groupAssignment/${id}`,
  },
};
