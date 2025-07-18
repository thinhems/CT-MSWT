import { IShiftRequest, Shift } from "@/config/models/shift.mode";
import useSWR from "swr";
import { API_URLS } from "../constants/api-urls";
import { swrFetcher } from "../utils/swr-fetcher";

// Hook to fetch areas for dropdown
export function useShifts() {
  const { data, error, isLoading, mutate } = useSWR<Shift[]>(
    API_URLS.SHIFT.GET_ALL,
    swrFetcher
  );

  const createAsync = async (request: IShiftRequest) => {
    try {
      const response = await swrFetcher(API_URLS.SHIFT.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
      mutate();
      return response;
    } catch (error) {
      console.error("Error creating area:", error);
      throw error;
    }
  };

  const deleteAsync = async (id: string) => {
    try {
      await swrFetcher(API_URLS.SHIFT.DELETE(id), {
        method: "DELETE",
      });
      mutate();
    } catch (error) {
      console.error("Error deleting floor:", error);
      throw error;
    }
  };

  const updateAsync = async (id: string, request: IShiftRequest) => {
    try {
      const response = await swrFetcher(API_URLS.SHIFT.UPDATE(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
      mutate();
      return response;
    } catch (error) {
      console.error("Error updating area:", error);
      throw error;
    }
  };

  return {
    shifts: data ?? [],
    isLoading,
    error,
    createAsync,
    deleteAsync,
    updateAsync,
  };
}
