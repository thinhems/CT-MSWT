import useSWR from "swr";
import { API_URLS } from "../constants/api-urls";
import { swrFetcher } from "../utils/swr-fetcher";
import { Assignment, AssignmentCreateRequest, AssignmentUpdateRequest } from "../config/models/assignment.model";

// SWR fetcher for assignments with error handling
const assignmentFetcher = async (url: string) => {
  try {
    const response = await swrFetcher(url);
    console.log('🔍 Raw Assignment API Response:', response);
    
    // Handle .NET API response format
    let assignments = response;
    
    // If data has $values property (from .NET API), extract the actual array
    if (assignments && assignments.$values) {
      assignments = assignments.$values;
    }
    
    // Validate that assignments is an array
    if (!Array.isArray(assignments)) {
      console.error('❌ Assignment API response is not an array:', assignments);
      return [];
    }
    
    // Check if assignments are already objects or arrays
    const firstItem = assignments[0];
    if (firstItem && typeof firstItem === 'object' && !Array.isArray(firstItem)) {
      console.log('✅ Assignments are objects, mapping field names');
      
      // Map API field names to expected field names (fix typo in API)
      return assignments.map((assignment: any) => ({
        assignmentId: assignment.assignmentId,
        assignmentName: assignment.assigmentName, // Note: API has typo "assigmentName" instead of "assignmentName"
        description: assignment.description,
        timesPerDay: assignment.timesPerDay,
        status: assignment.status
      }));
    }
    
    // Fallback: Transform array of arrays to array of objects (if needed)
    const transformedAssignments = assignments.map((assignmentArray: any[]) => {
      if (!Array.isArray(assignmentArray)) {
        return assignmentArray; // Return as-is if it's already an object
      }
      
      // Map array indices to object properties
      return {
        assignmentId: assignmentArray[0] || '',
        assignmentName: assignmentArray[1] || '',
        description: assignmentArray[2] || '',
        timesPerDay: assignmentArray[3] || '',
        status: assignmentArray[4] || ''
      };
    });
    
    console.log('📋 Final assignments array:', transformedAssignments);
    return transformedAssignments;
  } catch (error: any) {
    console.error('❌ Error fetching assignments:', error);
    return [];
  }
};

export function useAssignments() {
  const { data, error, isLoading, mutate } = useSWR<Assignment[]>(
    API_URLS.ASSIGNMENTS.GET_ALL,
    assignmentFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3
    }
  );

  const createAsync = async (newAssignment: AssignmentCreateRequest) => {
    try {
      console.log('🔄 Creating assignment:', newAssignment);
      
      // Validate required fields
      if (!newAssignment.assignmentName?.trim()) {
        throw new Error("Tên công việc là bắt buộc");
      }

      // Map field names to match API expectations (API has typo "assigmentName")
      const apiPayload = {
        assigmentName: newAssignment.assignmentName, // Map to API's typo field name
        description: newAssignment.description,
        timesPerDay: newAssignment.timesPerDay,
        status: newAssignment.status
      };

      console.log('🔄 API Payload:', apiPayload);

      const response = await swrFetcher(API_URLS.ASSIGNMENTS.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      });
      
      console.log('✅ Assignment created successfully:', response);
      mutate(); // Refresh data
      return response;
    } catch (error: any) {
      console.error("❌ Error creating assignment:", error);
      
      // Enhanced error messages
      if (error.response?.status === 500) {
        throw new Error("Lỗi server khi tạo công việc. Vui lòng thử lại sau.");
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
    updatedData: AssignmentUpdateRequest
  ) => {
    try {
      console.log('🔄 Updating assignment:', id, updatedData);
      
      // Map field names to match API expectations (API has typo "assigmentName")
      const apiPayload = {
        assigmentName: updatedData.assignmentName, // Map to API's typo field name
        description: updatedData.description,
        timesPerDay: updatedData.timesPerDay,
        status: updatedData.status
      };

      console.log('🔄 Update API Payload:', apiPayload);
      
      const response = await swrFetcher(API_URLS.ASSIGNMENTS.UPDATE(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiPayload),
      });
      
      console.log('✅ Assignment updated:', response);
      mutate(); // Refresh data
      return response;
    } catch (error: any) {
      console.error("❌ Error updating assignment:", error);
      throw error;
    }
  };

  const deleteAsync = async (id: string) => {
    try {
      console.log('🔄 Deleting assignment:', id);
      
      await swrFetcher(API_URLS.ASSIGNMENTS.DELETE(id), {
        method: "DELETE",
      });
      
      console.log('✅ Assignment deleted:', id);
      mutate(); // Refresh data
    } catch (error: any) {
      console.error("❌ Error deleting assignment:", error);
      throw error;
    }
  };

  // Function to get assignment details by ID
  const getAssignmentById = async (id: string) => {
    try {
      console.log('🔍 Fetching assignment details for ID:', id);
      
      const response = await swrFetcher(API_URLS.ASSIGNMENTS.GET_BY_ID(id));
      console.log('✅ Assignment details fetched:', response);
      
      // Map API field names to expected field names (fix typo in API)
      const assignment = {
        assignmentId: response.assignmentId,
        assignmentName: response.assigmentName, // Note: API has typo "assigmentName"
        description: response.description,
        timesPerDay: response.timesPerDay,
        status: response.status,
        createdAt: response.createdAt,
        updatedAt: response.updatedAt
      };
      
      return assignment;
    } catch (error: any) {
      console.error("❌ Error fetching assignment details:", error);
      
      // Enhanced error messages
      if (error.response?.status === 404) {
        throw new Error("Không tìm thấy công việc với ID này.");
      } else if (error.response?.status === 500) {
        throw new Error("Lỗi server khi tải chi tiết công việc. Vui lòng thử lại sau.");
      }
      
      throw error;
    }
  };

  return {
    assignments: data ?? [],
    isLoading,
    error,
    createAsync,
    updateAsync,
    deleteAsync,
    getAssignmentById,
    mutate,
  };
} 