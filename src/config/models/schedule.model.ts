import { Area } from "./area.model";
import { Floor } from "./floor.model";

export interface Schedule {
  scheduleId: string;
  startDate: string;
  endDate: string;
  scheduleType: string;
  shiftId: string;
  scheduleName: string;
  // Related entity information for display
  area?: Area;
  floor?: Floor;
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
  startDate: string;
  endDate: string;
  scheduleType: string;
  shiftId: string;
  scheduleName: string;
}

export interface IUpdateScheduleRequest {
  startDate?: string;
  endDate?: string;
  scheduleType?: string;
  shiftId?: string;
  scheduleName?: string;
} 