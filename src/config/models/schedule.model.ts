import { Area } from "./restroom.model";
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
}

export interface ICreateScheduleRequest {
  areaId: string;
  scheduleName: string;
  assignmentId: string;
  startDate: string;
  endDate: string;
  restroomId?: string;
  scheduleType: string;
  shiftId: string;
  supervisorId?: string;
}

export interface IUpdateScheduleRequest {
  scheduleName?: string; // Add scheduleName to update request
  areaId?: string;
  assignmentId?: string;
  startDate?: string;
  endDate?: string;
  restroomId?: string;
  scheduleType?: string;
  shiftId?: string;
} 