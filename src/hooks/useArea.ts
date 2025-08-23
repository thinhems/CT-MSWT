import { Area } from "@/config/models/area.model";
import { API_URLS } from "../constants/api-urls";
import { swrFetcher } from "../utils/swr-fetcher";
import useSWR from "swr";
import {
  ICreateAreaRequest,
  IUpdateAreaRequest,
} from "@/config/models/area.model";

// Hook to fetch areas for dropdown
export function useAreas() {
  const { data, error, isLoading, mutate } = useSWR<Area[]>(
    API_URLS.AREA.GET_ALL,
    swrFetcher
  );

  const createAsync = async (request: ICreateAreaRequest) => {
    try {
      const response = await swrFetcher(API_URLS.AREA.CREATE, {
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
      await swrFetcher(API_URLS.AREA.DELETE(id), {
        method: "DELETE",
      });
      mutate();
    } catch (error) {
      console.error("Error deleting floor:", error);
      throw error;
    }
  };

  const updateAsync = async (id: string, request: IUpdateAreaRequest) => {
    try {
      const response = await swrFetcher(API_URLS.AREA.UPDATE(id), {
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

  const assignAreaToBuilding = async (areaId: string, buildingId: string) => {
    try {
      const response = await swrFetcher(API_URLS.AREA.ASSIGN_TO_BUILDING(areaId, buildingId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      mutate();
      return response;
    } catch (error) {
      console.error("Error assigning area to building:", error);
      throw error;
    }
  };

  const assignMultipleAreasToFloor = async (areaIds: string[], floorId: string) => {
    try {
      // Gọi API song song cho tất cả các khu vực
      const promises = areaIds.map(areaId => 
        swrFetcher(API_URLS.AREA.ASSIGN_TO_FLOOR(areaId, floorId), {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        })
      );

      const results = await Promise.all(promises);
      mutate();
      return results;
    } catch (error) {
      console.error("Error assigning multiple areas to floor:", error);
      throw error;
    }
  };

  return {
    areas: data || [],
    error,
    isLoading,
    createAsync,
    deleteAsync,
    updateAsync,
    assignAreaToBuilding,
    mutate,
  };
}
