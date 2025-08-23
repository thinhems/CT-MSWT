import useSWR from "swr";
import { API_URLS } from "../constants/api-urls";
import { swrFetcher } from "../utils/swr-fetcher";
import {
  Room,
  RoomCreateRequest,
  RoomUpdateRequest,
} from "@/config/models/room.model";

// Custom fetcher for rooms with area information
const roomFetcher = async (url: string) => {
  console.log('🔍 Fetching rooms from:', url);
  const response = await swrFetcher(url);
  console.log('🔍 Raw room API response:', response);
  
  // Handle different response formats
  let rooms = response;
  
  // If response has $values property (from .NET API), extract the actual array
  if (response && response.$values) {
    rooms = response.$values;
  }
  
  // Ensure we have an array
  if (!Array.isArray(rooms)) {
    console.error('❌ Rooms API response is not an array:', rooms);
    return [];
  }
  
  console.log('✅ Processed rooms:', rooms.length, 'items');
  console.log('🔍 Sample room with area data:', rooms[0]);
  
  return rooms;
};

// Custom fetcher for single room details
const roomDetailFetcher = async (url: string) => {
  console.log('🔍 Fetching room details from:', url);
  const response = await swrFetcher(url);
  console.log('🔍 Raw room detail API response:', response);
  
  return response;
};

export function useRooms() {
  const { data, error, isLoading, mutate } = useSWR<Room[]>(
    API_URLS.ROOM.GET_ALL,
    roomFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3
    }
  );

  const createAsync = async (newRoom: RoomCreateRequest) => {
    try {
      console.log('🔄 Creating room:', newRoom);
      const response = await swrFetcher(API_URLS.ROOM.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newRoom),
      });
      console.log('✅ Room created:', response);
      mutate();
      return response;
    } catch (error) {
      console.error("❌ Error creating room:", error);
      throw error;
    }
  };

  const updateAsync = async (
    id: string,
    updatedData: RoomUpdateRequest
  ) => {
    try {
      console.log('🔄 Updating room:', id, updatedData);
      const response = await swrFetcher(API_URLS.ROOM.UPDATE(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
      console.log('✅ Room updated:', response);
      mutate();
      return response;
    } catch (error) {
      console.error("❌ Error updating room:", error);
      throw error;
    }
  };

  const deleteAsync = async (id: string) => {
    try {
      console.log('🔄 Deleting room:', id);
      await swrFetcher(API_URLS.ROOM.DELETE(id), {
        method: "DELETE",
      });
      console.log('✅ Room deleted:', id);
      mutate();
    } catch (error) {
      console.error("❌ Error deleting room:", error);
      throw error;
    }
  };

  return {
    rooms: data ?? [],
    isLoading,
    error,
    createAsync,
    updateAsync,
    deleteAsync,
    mutate,
  };
}

// Hook for fetching individual room details
export function useRoomDetail(id: string | null) {
  const { data, error, isLoading, mutate } = useSWR<Room>(
    id ? API_URLS.ROOM.GET_BY_ID(id) : null,
    roomDetailFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3
    }
  );

  return {
    room: data,
    isLoading,
    error,
    mutate,
  };
}
