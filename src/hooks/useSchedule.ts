import useSWR from "swr";
import { useMemo } from "react";
import { API_URLS } from "../constants/api-urls";
import { swrFetcher } from "../utils/swr-fetcher";
import {
  Schedule,
  ICreateScheduleRequest,
  IUpdateScheduleRequest,
} from "@/config/models/schedule.model";
import { useAreas } from "./useArea";
import { useBuildings } from "./useBuilding";
import { useRooms } from "./useRoom";
import { useShifts } from "./useShifts";
import { useAssignments } from "./useAssignments";

export function useSchedules() {
  const { data, error, isLoading, mutate } = useSWR<Schedule[]>(
    API_URLS.SCHEDULE.GET_ALL,
    swrFetcher
  );

  // Fetch related data for name lookups
  const { areas } = useAreas();
  const { buildings } = useBuildings();
  const { rooms } = useRooms();
  const { shifts } = useShifts();
  const { assignments } = useAssignments();

  // Create lookup maps for converting IDs to names
  const areaLookup = useMemo(() => {
    const lookup = new Map();
    areas.forEach((area) => {
      lookup.set(area.areaId, area.areaName);
    });
    return lookup;
  }, [areas]);

  const roomLookup = useMemo(() => {
    const lookup = new Map();
    rooms.forEach((room) => {
      lookup.set(room.roomId, `Phòng ${room.roomNumber}`);
    });
    return lookup;
  }, [rooms]);

  const buildingLookup = useMemo(() => {
    const lookup = new Map();
    buildings.forEach((building) => {
      lookup.set(building.buildingId, building.buildingName);
    });
    return lookup;
  }, [buildings]);

  const shiftLookup = useMemo(() => {
    const lookup = new Map();
    shifts.forEach((shift) => {
      lookup.set(shift.shiftId, shift.shiftName);
    });
    return lookup;
  }, [shifts]);

  const assignmentLookup = useMemo(() => {
    const lookup = new Map();
    assignments.forEach((assignment) => {
      lookup.set(assignment.assignmentId, assignment.assignmentName);
    });
    return lookup;
  }, [assignments]);



  // Enhanced schedules with name mappings
  const enhancedSchedules = useMemo(() => {
    if (!data) return [];
    
    return data.map((schedule) => ({
      ...schedule,
      // Use scheduleName from API if available, otherwise create a descriptive name
      scheduleName: schedule.scheduleName || `${schedule.scheduleType} - ${areaLookup.get(schedule.areaId) || schedule.areaId}${roomLookup.get(schedule.roomId) ? ` - ${roomLookup.get(schedule.roomId)}` : ''}`,
      areaName: areaLookup.get(schedule.areaId) || schedule.areaId,
      roomName: roomLookup.get(schedule.roomId) || schedule.roomId,
      shiftName: shiftLookup.get(schedule.shiftId) || (schedule.shiftId ? `Ca ${schedule.shiftId.slice(0, 8)}` : 'N/A'),
      assignmentName: assignmentLookup.get(schedule.assignmentId) || (schedule.assignmentId ? `Assignment ${schedule.assignmentId.slice(0, 8)}` : 'N/A'),
    }));
  }, [data, areaLookup, roomLookup, buildingLookup, shiftLookup, assignmentLookup]);

  const createSchedule = async (newSchedule: ICreateScheduleRequest) => {
    try {
      const response = await swrFetcher(API_URLS.SCHEDULE.CREATE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSchedule),
      });
      mutate();
      return response;
    } catch (error) {
      console.error("Error creating schedule:", error);
      throw error;
    }
  };

  const updateSchedule = async (
    id: string,
    updatedData: IUpdateScheduleRequest
  ) => {
    try {
      const response = await swrFetcher(API_URLS.SCHEDULE.UPDATE(id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
      mutate();
      return response;
    } catch (error) {
      console.error("Error updating schedule:", error);
      throw error;
    }
  };

  const deleteSchedule = async (id: string) => {
    try {
      await swrFetcher(API_URLS.SCHEDULE.DELETE(id), {
        method: "DELETE",
      });
      mutate();
    } catch (error) {
      console.error("Error deleting schedule:", error);
      throw error;
    }
  };

  return {
    schedules: enhancedSchedules,
    isLoading: isLoading,
    error,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    mutate,
  };
} 