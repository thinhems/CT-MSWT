import { API_URLS } from "../constants/api-urls";
import { swrFetcher } from "../utils/swr-fetcher";
import useSWR from "swr";
import {
  Floor,
  ICreateFloorRequest,
  IUpdateFloorRequest,
} from "../config/models/floor.model";

// Hook to fetch floors for dropdown
export function useFloors() {
  const { data, error, isLoading, mutate } = useSWR<Floor[]>(
    API_URLS.FLOOR.GET_ALL,
    swrFetcher
  );

  const createAsync = async (request: ICreateFloorRequest) => {
    try {
      const response = await swrFetcher(API_URLS.FLOOR.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
      mutate();
      return response;
    } catch (error) {
      console.error("Error creating floor:", error);
      throw error;
    }
  };

  const updateAsync = async (id: string, request: IUpdateFloorRequest) => {
    try {
      const response = await swrFetcher(API_URLS.FLOOR.UPDATE(id), {
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

  const deleteAsync = async (id: string) => {
    try {
      await swrFetcher(API_URLS.FLOOR.DELETE(id), {
        method: "DELETE",
      });
      mutate();
    } catch (error) {
      console.error("Error deleting floor:", error);
      throw error;
    }
  };

  return {
    floors: data ?? [],
    isLoading,
    error,
    createAsync,
    updateAsync,
    deleteAsync,
  };
}
