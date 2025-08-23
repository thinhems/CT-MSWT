import { API_URLS } from "../constants/api-urls";
import { swrFetcher } from "../utils/swr-fetcher";
import useSWR from "swr";
import {
  Building,
  ICreateBuildingRequest,
  IUpdateBuildingRequest,
} from "../config/models/building.model";

// Hook to fetch buildings for dropdown
export function useBuildings() {
  const { data, error, isLoading, mutate } = useSWR<Building[]>(
    API_URLS.BUILDING.GET_ALL,
    swrFetcher
  );

  const createAsync = async (request: ICreateBuildingRequest) => {
    try {
      const response = await swrFetcher(API_URLS.BUILDING.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
      mutate();
      return response;
    } catch (error) {
      console.error("Error creating building:", error);
      throw error;
    }
  };

  const updateAsync = async (id: string, request: IUpdateBuildingRequest) => {
    try {
      const response = await swrFetcher(API_URLS.BUILDING.UPDATE(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });
      mutate();
      return response;
    } catch (error) {
      console.error("Error updating building:", error);
      throw error;
    }
  };

  const deleteAsync = async (id: string) => {
    try {
      await swrFetcher(API_URLS.BUILDING.DELETE(id), {
        method: "DELETE",
      });
      mutate();
    } catch (error) {
      console.error("Error deleting building:", error);
      throw error;
    }
  };

  return {
    buildings: data ?? [],
    isLoading,
    error,
    createAsync,
    updateAsync,
    deleteAsync,
  };
}
