import useSWR from "swr";
import { API_URLS } from "../constants/api-urls";
import { swrFetcher } from "../utils/swr-fetcher";

export interface AttendanceRecord {
  id?: string;
  employeeId: string; // API response field
  fullName: string; // API response field
  attendanceDate: string; // API response field
  checkInTime: string | null;
  checkOutTime?: string | null;
  status?: string;
  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Normalize .NET $values array if present
const normalizeArray = (data: any): any[] => {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (data.$values && Array.isArray(data.$values)) return data.$values;
  return [];
};

export const useAttendanceAll = () => {
  const { data, error, isLoading, mutate } = useSWR<any>(API_URLS.ATTENDANCE.GET_ALL, swrFetcher);
  const raw: any[] = normalizeArray(data);
  const records: AttendanceRecord[] = raw.map((item: any) => ({
    id: item.id,
    employeeId: item.employeeId,
    fullName: item.fullName,
    attendanceDate: item.attendanceDate,
    checkInTime: item.checkInTime,
    checkOutTime: item.checkOutTime,
    status: item.status,
    note: item.note,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
  return { records, isLoading, error, refresh: mutate };
};

export const useAttendanceByDate = (date?: string) => {
  const shouldFetch = !!date;
  const { data, error, isLoading, mutate } = useSWR<any>(
    shouldFetch ? API_URLS.ATTENDANCE.GET_BY_DATE(date as string) : null,
    swrFetcher
  );
  const raw: any[] = normalizeArray(data);
  const records: AttendanceRecord[] = raw.map((item: any) => ({
    id: item.id,
    employeeId: item.employeeId,
    fullName: item.fullName,
    attendanceDate: item.attendanceDate,
    checkInTime: item.checkInTime,
    checkOutTime: item.checkOutTime,
    status: item.status,
    note: item.note,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
  return { records, isLoading, error, refresh: mutate };
};


