import useSWR from 'swr';
import { swrFetcher } from '../utils/swr-fetcher';
import { Leave, LeaveResponse, CreateLeaveRequest, UpdateLeaveRequest } from '../config/models/leave.model';
import { BASE_API_URL } from '../constants/api-urls';
import axios from 'axios';

// Create axios instance for API calls
const apiAxios = axios.create({
  baseURL: BASE_API_URL,
  timeout: 30000,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  },
});

// Add request interceptor to include auth token
apiAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    console.log('🔐 API Request Interceptor:', {
      url: config.url,
      method: config.method,
      hasToken: !!token,
      tokenLength: token?.length,
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiAxios.interceptors.response.use(
  (response) => {
    console.log('✅ API Response Success:', {
      url: response.config.url,
      status: response.status,
    });
    return response;
  },
  (error) => {
    console.log('❌ API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }

    throw error;
  }
);

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
  try {
    const response = await apiAxios.post('/leaves', leaveData);
    return response.data;
  } catch (error: any) {
    console.error('Error in createLeave:', error);
    const message = error.response?.data?.message || error.message || 'Failed to create leave request';
    throw new Error(message);
  }
};

export const updateLeave = async (leaveId: string, leaveData: UpdateLeaveRequest): Promise<Leave> => {
  try {
    const response = await apiAxios.put(`/leaves/${leaveId}`, leaveData);
    return response.data;
  } catch (error: any) {
    console.error('Error in updateLeave:', error);
    const message = error.response?.data?.message || error.message || 'Failed to update leave request';
    throw new Error(message);
  }
};

export const deleteLeave = async (leaveId: string): Promise<void> => {
  try {
    await apiAxios.delete(`/leaves/${leaveId}`);
  } catch (error: any) {
    console.error('Error in deleteLeave:', error);
    const message = error.response?.data?.message || error.message || 'Failed to delete leave request';
    throw new Error(message);
  }
};

export const approveLeave = async (leaveId: string, approvalData: { approvalStatus: number; note?: string }): Promise<Leave> => {
  try {
    const response = await apiAxios.patch(`/leaves/${leaveId}/approval`, approvalData);
    return response.data;
  } catch (error: any) {
    console.error('Error in approveLeave:', error);
    const message = error.response?.data?.message || error.message || 'Failed to approve leave request';
    throw new Error(message);
  }
}; 