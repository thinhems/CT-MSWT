export interface IShiftRequest {
  shiftName: string;
  startTime: string;
  endTime: string;
}

export type Shift = {
  shiftId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  status: string;
  schedules: string[];
};
