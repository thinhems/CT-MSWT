import useSWR from 'swr';
import { swrFetcher } from '../utils/swr-fetcher';
import { Leave, LeaveResponse, CreateLeaveRequest, UpdateLeaveRequest } from '../config/models/leave.model';
import { BASE_API_URL } from '../constants/api-urls';

export const useLeaves = () => {
  const { data, error, isLoading, mutate } = useSWR<LeaveResponse>(
    `${BASE_API_URL}/leaves`,
    swrFetcher
  );

  return {
    leaves: data?.data || [],
    isLoading,
    error,
    mutate
  };
};

export const useLeave = (leaveId: string) => {
  const { data, error, isLoading, mutate } = useSWR<Leave>(
    leaveId ? `${BASE_API_URL}/leaves/${leaveId}` : null,
    swrFetcher
  );

  return {
    leave: data,
    isLoading,
    error,
    mutate
  };
};

export const createLeave = async (leaveData: CreateLeaveRequest): Promise<Leave> => {
  const response = await fetch(`${BASE_API_URL}/leaves`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(leaveData),
  });

  if (!response.ok) {
    throw new Error('Failed to create leave request');
  }

  return response.json();
};

export const updateLeave = async (leaveId: string, leaveData: UpdateLeaveRequest): Promise<Leave> => {
  const response = await fetch(`${BASE_API_URL}/leaves/${leaveId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(leaveData),
  });

  if (!response.ok) {
    throw new Error('Failed to update leave request');
  }

  return response.json();
};

export const deleteLeave = async (leaveId: string): Promise<void> => {
  const response = await fetch(`${BASE_API_URL}/leaves/${leaveId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete leave request');
  }
};

export const approveLeave = async (leaveId: string, approvalData: { approvalStatus: string }): Promise<Leave> => {
  const response = await fetch(`${BASE_API_URL}/leaves/${leaveId}/approval`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(approvalData),
  });

  if (!response.ok) {
    throw new Error('Failed to approve leave request');
  }

  return response.json();
}; 