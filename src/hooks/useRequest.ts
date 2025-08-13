import useSWR, { mutate } from 'swr';
import { API_URLS, BASE_API_URL } from '../constants/api-urls';
import { swrFetcher } from '../utils/swr-fetcher';

// Request interface based on backend API
export interface Request {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  requestType: string;
  location: string;
  requestedBy: string;
  contactInfo: string;
  createdDate: string;
  timeCreated: string;
  createdBy: string;
  assignedTo: string;
  imageUrl?: string;
  requesterRole?: string;
}

export interface RequestWithRole extends Request {
  roleName: string;
  userName: string;
}

// Create request data interface
export interface CreateRequestData {
  description: string;
  requestName: string;
  image?: string;
  priority: number; // 1, 2, 3 cho Low, Medium, High
  requestType: number; // Loại yêu cầu
}

// Update request data interface
export interface UpdateRequestData {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  requestType?: string;
  location?: string;
  assignedTo?: string;
}

// Update request status data interface
export interface UpdateRequestStatusData {
  status: number | string; // Based on enum: 1=DaGui, 2=DangXuLy, 3=DaHoanThanh or string format
}

// Priority mapping
export const REQUEST_PRIORITY_MAPPING = {
  "Thấp": 3,
  "Trung bình": 2, 
  "Cao": 1
};

export const REQUEST_PRIORITY_MAPPING_REVERSE = {
  1: "Cao",
  2: "Trung bình",
  3: "Thấp"
};

// Status mapping based on enum RequestStatus
export const REQUEST_STATUS_MAPPING = {
  "Đã gửi": 1,        // DaGui
  "Đang xử lý": 2,    // DangXuLy  
  "Đã hoàn thành": 3  // DaHoanThanh
};

export const REQUEST_STATUS_MAPPING_REVERSE = {
  1: "Đã gửi",        // DaGui
  2: "Đang xử lý",    // DangXuLy
  3: "Đã hoàn thành"  // DaHoanThanh
};

// Hook to get all requests
export const useRequests = () => {
  const { data, error, isLoading } = useSWR<Request[]>(
    API_URLS.REQUEST.GET_ALL,
    swrFetcher
  );

  return {
    requests: data || [],
    isLoading,
    isError: error,
    refresh: () => mutate(API_URLS.REQUEST.GET_ALL),
  };
};

// Hook to get requests with role filtering
export const useRequestsWithRole = () => {
  const { data, error, isLoading } = useSWR<RequestWithRole[]>(
    API_URLS.REQUEST.GET_WITH_ROLE,
    swrFetcher
  );

  return {
    requests: data || [],
    isLoading,
    isError: error,
    refresh: () => mutate(API_URLS.REQUEST.GET_WITH_ROLE),
  };
};

// Hook to get a single request by ID
export const useRequest = (id: string | null) => {
  const { data, error, isLoading } = useSWR<Request>(
    id ? API_URLS.REQUEST.GET_BY_ID(id) : null,
    swrFetcher
  );

  return {
    request: data,
    isLoading,
    isError: error,
    refresh: () => id ? mutate(API_URLS.REQUEST.GET_BY_ID(id)) : undefined,
  };
};

// Function to create a new request
export const createRequest = async (requestData: CreateRequestData): Promise<Request> => {
  const response = await fetch(`${BASE_API_URL}/${API_URLS.REQUEST.CREATE}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    throw new Error('Failed to create request');
  }

  return response.json();
};

// Function to update a request
export const updateRequest = async (id: string, updateData: UpdateRequestData): Promise<Request> => {
  const response = await fetch(`${BASE_API_URL}/${API_URLS.REQUEST.UPDATE(id)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateData),
  });

  if (!response.ok) {
    throw new Error('Failed to update request');
  }

  return response.json();
};

// Function to update request status
export const updateRequestStatus = async (id: string, statusData: UpdateRequestStatusData): Promise<Request> => {
  const response = await fetch(`${BASE_API_URL}/${API_URLS.REQUEST.UPDATE_STATUS(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(statusData),
  });

  if (!response.ok) {
    throw new Error('Failed to update request status');
  }

  return response.json();
};

// Function to delete a request
export const deleteRequest = async (id: string): Promise<void> => {
  const response = await fetch(`${BASE_API_URL}/${API_URLS.REQUEST.DELETE(id)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete request');
  }
};
