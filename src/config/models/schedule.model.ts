import { Area } from "./area.model";
import { Floor } from "./floor.model";

export interface Schedule {
  scheduleId: string;
  areaId: string;
  assignmentId: string;
  startDate: string;
  endDate: string;
  restroomId: string;
  scheduleType: string;
  shiftId: string;
  // Related entity information for display
  area?: Area;
  floor?: Floor;
  scheduleName?: string;
  areaName?: string;
  restroomName?: string;
  shiftName?: string;
  assignmentName?: string;
  // Additional fields for compatibility
  roomId?: string;
  roomName?: string;
  supervisorId?: string;
}

export interface ICreateScheduleRequest {
  scheduleName: string;
  areaId: string;
  assignmentId: string;
  startDate: string;
  endDate: string;
  restroomId: string;
  scheduleType: string;
  shiftId: string;
  supervisorId?: string;
}

export interface IUpdateScheduleRequest {
  areaId?: string;
  assignmentId?: string;
  startDate?: string;
  endDate?: string;
  restroomId?: string;
  scheduleType?: string;
  shiftId?: string;
} 