export interface ScheduleDetails {
  scheduleDetailId: string;
  scheduleId: string;
  assignmentId: string; // Add assignmentId directly to ScheduleDetails
  description: string;
  date: string;
  status: string;
  supervisorId: string;
  rating: string;
  workerId: string;
  evidenceImage?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  isBackup?: boolean | null;
  backupForUserId?: string | null;
  schedule: {
    scheduleId: string;
    scheduleName: string;
    areaId: string;
    assignmentId: string;
    startDate: string;
    endDate: string;
    trashBinId: string;
    restroomId: string;
    scheduleType: string;
    shiftId: string;
    // Enhanced names
    areaName?: string;
    restroomNumber?: string;
    assignmentName?: string;
    shiftName?: string;
    trashBinName?: string;
  };
  
  // Related information for display
  workerName?: string;
  supervisorName?: string;
  backupForUserName?: string;
  taskType?: string;
  assignmentName?: string; // Add assignmentName for display
}

export interface ICreateScheduleDetailsRequest {
  scheduleId: string;
  assignmentId: string; // Add assignmentId to create request
  description: string;
  date: string;
  status: string;
  supervisorId?: string; // Make optional for direct creation
  rating?: string; // Make optional for direct creation
  workerId?: string; // Make optional for direct creation
  evidenceImage?: string;
  startTime?: string;
  endTime?: string;
  isBackup?: boolean;
  backupForUserId?: string;
}

export interface IUpdateScheduleDetailsRequest {
  assignmentId?: string; // Add assignmentId to update request
  description?: string;
  date?: string;
  status?: string;
  supervisorId?: string;
  rating?: string;
  workerId?: string;
  evidenceImage?: string;
  startTime?: string;
  endTime?: string;
  isBackup?: boolean;
  backupForUserId?: string;
} 