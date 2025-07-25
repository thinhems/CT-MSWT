import useSWR from "swr";
import { useMemo } from "react";
import { API_URLS } from "../constants/api-urls";
import { swrFetcher } from "../utils/swr-fetcher";
import {
  ScheduleDetails,
  ICreateScheduleDetailsRequest,
  IUpdateScheduleDetailsRequest,
} from "@/config/models/scheduleDetails.model";
import { useAssignments } from "./useAssignments";

export function useScheduleDetails(scheduleId?: string) {
  // Fetch all schedule details from the main endpoint
  const { data, error, isLoading, mutate } = useSWR<ScheduleDetails[]>(
    API_URLS.SCHEDULE_DETAILS.GET_ALL,
    swrFetcher
  );

  // Fetch assignments for name mapping
  const { assignments } = useAssignments();

  // Create assignment lookup map
  const assignmentLookup = useMemo(() => {
    const lookup = new Map();
    assignments.forEach((assignment) => {
      lookup.set(assignment.assignmentId, assignment.assignmentName);
    });
    return lookup;
  }, [assignments]);

  // Enhanced schedule details with assignment names
  const enhancedScheduleDetails = useMemo(() => {
    if (!data) return [];
    
    const enhanced = data.map(detail => ({
      ...detail,
      assignmentName: assignmentLookup.get(detail.assignmentId) || 
                     assignmentLookup.get(detail.schedule?.assignmentId) || 
                     detail.assignmentId || 
                     "N/A"
    }));
    
    if (scheduleId) {
      return enhanced.filter(detail => detail.scheduleId === scheduleId);
    }
    
    return enhanced;
  }, [data, scheduleId, assignmentLookup]);



  const createScheduleDetail = async (newDetail: ICreateScheduleDetailsRequest) => {
    try {
      const response = await swrFetcher(API_URLS.SCHEDULE_DETAILS.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDetail),
      });
      mutate();
      return response;
    } catch (error) {
      console.error("Error creating schedule detail:", error);
      throw error;
    }
  };

  const createScheduleDetailForSchedule = async (
    scheduleId: string, 
    formData: FormData
  ) => {
    try {
      console.log("📝 Creating schedule detail for schedule:", scheduleId, "with FormData:", formData);
      
      const response = await swrFetcher(API_URLS.SCHEDULE_DETAILS.CREATE_FOR_SCHEDULE(scheduleId), {
        method: "POST",
        headers: {
          // Remove Content-Type header to let browser set it automatically for FormData
        },
        body: formData,
      });
      
      console.log("✅ Schedule detail created successfully:", response);
      
      // Refresh the data
      mutate();
      
      return response;
    } catch (error) {
      console.error("Error creating schedule detail for schedule:", error);
      throw error;
    }
  };

  const updateScheduleDetail = async (
    id: string,
    updatedData: IUpdateScheduleDetailsRequest
  ) => {
    try {
      const response = await swrFetcher(
        API_URLS.SCHEDULE_DETAILS.UPDATE(id),
        {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
        }
      );
      mutate();
      return response;
    } catch (error) {
      console.error("Error updating schedule detail:", error);
      throw error;
    }
  };

  // updateScheduleDetailRating function removed - implemented directly in component

  const deleteScheduleDetail = async (id: string) => {
    try {
      await swrFetcher(API_URLS.SCHEDULE_DETAILS.DELETE(id), {
        method: "DELETE",
      });
      mutate();
    } catch (error) {
      console.error("Error deleting schedule detail:", error);
      throw error;
    }
  };

  return {
    scheduleDetails: enhancedScheduleDetails, // Return enhanced details with assignment names
    isLoading,
    error,
    mutate,
    createScheduleDetail,
    createScheduleDetailForSchedule,
    updateScheduleDetail,
    deleteScheduleDetail,
  };
}

export function useScheduleDetailById(id: string) {
  const { data, error, isLoading, mutate } = useSWR<ScheduleDetails>(
    id ? API_URLS.SCHEDULE_DETAILS.GET_BY_ID(id) : null,
    swrFetcher
  );

  return {
    scheduleDetail: data,
    isLoading,
    error,
    mutate,
  };
} 