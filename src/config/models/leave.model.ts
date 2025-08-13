export interface Leave {
  leaveId: string;
  workerId: string;
  fullName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  totalDays?: number;
  reason: string;
  requestDate?: string;
  approvalStatus?: string;
  approvedBy?: string;
  approvalDate?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
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