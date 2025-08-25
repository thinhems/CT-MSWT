import useSWR from "swr";
import { API_URLS } from "../constants/api-urls";
import { swrFetcher } from "../utils/swr-fetcher";
import { GroupAssignment } from "../config/models/assignment.model";

// SWR fetcher for group assignments
const groupAssignmentFetcher = async (url: string) => {
  try {
    const response = await swrFetcher(url);
    console.log('🔍 Raw Group Assignment API Response:', response);
    
    // Handle .NET API response format
    let groupAssignments = response;
    
    // If data has $values property (from .NET API), extract the actual array
    if (groupAssignments && groupAssignments.$values) {
      groupAssignments = groupAssignments.$values;
    }
    
    // Validate that groupAssignments is an array
    if (!Array.isArray(groupAssignments)) {
      console.error('❌ Group Assignment API response is not an array:', groupAssignments);
      return [];
    }
    
    console.log('📋 Final group assignments array:', groupAssignments);
    return groupAssignments;
  } catch (error: any) {
    console.error('❌ Error fetching group assignments:', error);
    return [];
  }
};

export function useGroupAssignments() {
  const { data, error, isLoading, mutate } = useSWR<GroupAssignment[]>(
    API_URLS.GROUP_ASSIGNMENT.GET_ALL,
    groupAssignmentFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3
    }
  );

  // Function to get group assignment by ID
  const getGroupAssignmentById = async (id: string) => {
    try {
      console.log('🔍 Fetching group assignment details for ID:', id);
      
      const response = await swrFetcher(API_URLS.GROUP_ASSIGNMENT.GET_BY_ID(id));
      console.log('✅ Group assignment details fetched:', response);
      
      return response;
    } catch (error: any) {
      console.error("❌ Error fetching group assignment details:", error);
      throw error;
    }
  };

  return {
    groupAssignments: data ?? [],
    isLoading,
    error,
    getGroupAssignmentById,
    mutate,
  };
}
