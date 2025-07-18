import useSWR from "swr";
import { API_URLS } from "../constants/api-urls";
import { swrFetcher } from "../utils/swr-fetcher";
import {
  Restroom,
  RestroomCreateRequest,
  RestroomUpdateRequest,
} from "@/config/models/restroom.model";

// Custom fetcher for restrooms with area information
const restroomFetcher = async (url: string) => {
  console.log('🔍 Fetching restrooms from:', url);
  const response = await swrFetcher(url);
  console.log('🔍 Raw restroom API response:', response);
  
  // Handle different response formats
  let restrooms = response;
  
  // If response has $values property (from .NET API), extract the actual array
  if (response && response.$values) {
    restrooms = response.$values;
  }
  
  // Ensure we have an array
  if (!Array.isArray(restrooms)) {
    console.error('❌ Restrooms API response is not an array:', restrooms);
    return [];
  }
  
  console.log('✅ Processed restrooms:', restrooms.length, 'items');
  console.log('🔍 Sample restroom with area data:', restrooms[0]);
  
  return restrooms;
};

// Custom fetcher for single restroom details
const restroomDetailFetcher = async (url: string) => {
  console.log('🔍 Fetching restroom details from:', url);
  const response = await swrFetcher(url);
  console.log('🔍 Raw restroom detail API response:', response);
  
  return response;
};

export function useRestrooms() {
  const { data, error, isLoading, mutate } = useSWR<Restroom[]>(
    API_URLS.RESTROOM.GET_ALL,
    restroomFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3
    }
  );

  const createAsync = async (newRestroom: RestroomCreateRequest) => {
    try {
      console.log('🔄 Creating restroom:', newRestroom);
      const response = await swrFetcher(API_URLS.RESTROOM.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRestroom),
      });
      console.log('✅ Restroom created:', response);
      mutate();
      return response;
    } catch (error) {
      console.error("❌ Error creating restroom:", error);
      throw error;
    }
  };

  const updateAsync = async (
    id: string,
    updatedData: RestroomUpdateRequest
  ) => {
    try {
      console.log('🔄 Updating restroom:', id, updatedData);
      const response = await swrFetcher(API_URLS.RESTROOM.UPDATE(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
      console.log('✅ Restroom updated:', response);
      mutate();
      return response;
    } catch (error) {
      console.error("❌ Error updating restroom:", error);
      throw error;
    }
  };

  const deleteAsync = async (id: string) => {
    try {
      console.log('🔄 Deleting restroom:', id);
      await swrFetcher(API_URLS.RESTROOM.DELETE(id), {
        method: "DELETE",
      });
      console.log('✅ Restroom deleted:', id);
      mutate();
    } catch (error) {
      console.error("❌ Error deleting restroom:", error);
      throw error;
    }
  };

  return {
    restrooms: data ?? [],
    isLoading,
    error,
    createAsync,
    updateAsync,
    deleteAsync,
    mutate,
  };
}

// Hook for fetching individual restroom details
export function useRestroomDetail(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Restroom>(
    id ? API_URLS.RESTROOM.GET_BY_ID(id) : null,
    restroomDetailFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3
    }
  );

  return {
    restroom: data,
    isLoading,
    error,
    mutate,
  };
}
