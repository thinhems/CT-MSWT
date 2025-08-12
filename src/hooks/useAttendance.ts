import useSWR from "swr";
import { API_URLS } from "../constants/api-urls";
import { swrFetcher } from "../utils/swr-fetcher";

export interface AttendanceRecord {
  id?: string;
  userId: string; // mapped from employeeId
  userName?: string;
  checkInTime: string;
  checkOutTime?: string | null;
  date: string; // mapped from attendanceDate
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
    userId: item.employeeId,
    userName: item.user?.name || item.user?.fullName || undefined,
    checkInTime: item.checkInTime || null,
    checkOutTime: item.checkOutTime || null,
    date: item.attendanceDate,
    status: item.status,
    note: item.note ?? null,
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
    userId: item.employeeId,
    userName: item.user?.name || item.user?.fullName || undefined,
    checkInTime: item.checkInTime || null,
    checkOutTime: item.checkOutTime || null,
    date: item.attendanceDate,
    status: item.status,
    note: item.note ?? null,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  }));
  return { records, isLoading, error, refresh: mutate };
};


