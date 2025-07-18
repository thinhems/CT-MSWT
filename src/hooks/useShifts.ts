import useSWR from "swr";
import { API_URLS } from "../constants/api-urls";
import { swrFetcher } from "../utils/swr-fetcher";

export interface Shift {
  shiftId: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  description?: string;
}

export function useShifts() {
  const { data, error, isLoading, mutate } = useSWR<Shift[]>(
    API_URLS.SHIFTS.GET_ALL,
    swrFetcher
  );

  return {
    shifts: data || [],
    isLoading,
    error,
    mutate,
  };
} 