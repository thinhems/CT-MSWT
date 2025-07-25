export interface Leave {
  leaveId: string;
  workerId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  approvalStatus?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveResponse {
  status: number;
  message: string;
  data: Leave[];
}

export interface CreateLeaveRequest {
  workerId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  approvalStatus?: string;
}

export interface UpdateLeaveRequest {
  leaveType?: string;
  startDate?: string;
  endDate?: string;
  reason?: string;
  approvalStatus?: string;
} 