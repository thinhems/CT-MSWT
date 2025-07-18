import useSWR from "swr";
import { API_URLS } from "../constants/api-urls";
import { swrFetcher } from "../utils/swr-fetcher";
import {
  TrashBin,
  TrashBinCreateRequest,
  TrashBinUpdateRequest,
} from "@/config/models/types";

// Custom fetcher for trash bins with area information
const trashBinFetcher = async (url: string) => {
  console.log('🔍 Fetching trash bins from:', url);
  const response = await swrFetcher(url);
  console.log('🔍 Raw trash bin API response:', response);
  
  // Handle different response formats
  let trashBins = response;
  
  // If response has $values property (from .NET API), extract the actual array
  if (response && response.$values) {
    trashBins = response.$values;
  }
  
  // Ensure we have an array
  if (!Array.isArray(trashBins)) {
    console.error('❌ Trash bins API response is not an array:', trashBins);
    return [];
  }
  
  console.log('✅ Processed trash bins:', trashBins.length, 'items');
  console.log('🔍 Sample trash bin with area data:', trashBins[0]);
  
  return trashBins;
};

// Custom fetcher for individual trash bin detail
const trashBinDetailFetcher = async (url: string) => {
  console.log('🔍 Fetching trash bin detail from:', url);
  const response = await swrFetcher(url);
  console.log('🔍 Raw trash bin detail API response:', response);
  
  // Handle different response formats from .NET API
  let trashBin = response;
  
  // If response has $values or other .NET specific structure, extract accordingly
  if (response && typeof response === 'object') {
    // .NET APIs might return the object directly or wrapped
    trashBin = response;
  }
  
  console.log('✅ Processed trash bin detail:', trashBin);
  return trashBin as TrashBin;
};

// Hook for fetching all trash bins
export function useTrashBins() {
  const { data, error, isLoading, mutate } = useSWR<TrashBin[]>(
    API_URLS.TRASHBIN.GET_ALL,
    trashBinFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3
    }
  );

  const createAsync = async (newTrashBin: TrashBinCreateRequest) => {
    try {
      // Validate required fields
      if (!newTrashBin.areaId || !newTrashBin.location) {
        throw new Error("Vui lòng điền đầy đủ thông tin bắt buộc (Khu vực và Vị trí)");
      }

      // Ensure restroomId is provided if needed
      const cleanedData = {
        ...newTrashBin,
        // Convert empty string to null for optional fields
        restroomId: newTrashBin.restroomId || null,
        image: newTrashBin.image || null,
      };

      console.log('🔄 Creating trash bin with cleaned data:', cleanedData);
      console.log('🔍 API URL:', API_URLS.TRASHBIN.CREATE);
      
      const response = await swrFetcher(API_URLS.TRASHBIN.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cleanedData),
      });
      
      console.log('✅ Trash bin created successfully:', response);
      mutate(); // Refresh data
      return response;
    } catch (error: any) {
      console.error("❌ Error creating trash bin:", error);
      
      // Enhanced error messages
      if (error.response?.status === 500) {
        throw new Error("Lỗi server khi tạo thùng rác. Vui lòng kiểm tra dữ liệu và thử lại.");
      } else if (error.response?.status === 400) {
        throw new Error("Dữ liệu không hợp lệ: " + (error.response?.data?.message || error.message));
      } else if (error.response?.status === 422) {
        throw new Error("Dữ liệu không đúng định dạng: " + (error.response?.data?.message || error.message));
      }
      
      throw error;
    }
  };

  const updateAsync = async (
    id: string,
    updatedData: TrashBinUpdateRequest
  ) => {
    try {
      console.log('🔄 Updating trash bin:', id, updatedData);
      const response = await swrFetcher(API_URLS.TRASHBIN.UPDATE(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
      console.log('✅ Trash bin updated:', response);
      mutate();
      return response;
    } catch (error) {
      console.error("❌ Error updating trash bin:", error);
      throw error;
    }
  };

  const deleteAsync = async (id: string) => {
    try {
      console.log('🔄 Deleting trash bin:', id);
      await swrFetcher(API_URLS.TRASHBIN.DELETE(id), {
        method: "DELETE",
      });
      console.log('✅ Trash bin deleted:', id);
      mutate();
    } catch (error) {
      console.error("❌ Error deleting trash bin:", error);
      throw error;
    }
  };

  return {
    trashBins: data ?? [],
    isLoading,
    error,
    createAsync,
    updateAsync,
    deleteAsync,
    mutate,
  };
}

// Hook for fetching individual trash bin detail
export function useTrashBinDetail(trashBinId?: string) {
  const { data, error, isLoading, mutate } = useSWR<TrashBin>(
    trashBinId ? API_URLS.TRASHBIN.GET_BY_ID(trashBinId) : null,
    trashBinDetailFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      // Refresh detail when opening modal
      dedupingInterval: 0,
    }
  );

  return {
    trashBinDetail: data,
    isLoadingDetail: isLoading,
    errorDetail: error,
    mutateDetail: mutate,
  };
} 