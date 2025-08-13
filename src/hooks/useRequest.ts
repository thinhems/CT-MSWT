import useSWR, { mutate } from 'swr';
import { API_URLS, BASE_API_URL } from '../constants/api-urls';
import { swrFetcher } from '../utils/swr-fetcher';

// Request interface based on actual API response
export interface Request {
  requestId: string;
  workerId: string;
  workerName: string | null;
  description: string;
  status: string;
  requestDate: string;
  resolveDate: string | null;
  location: string;
  supervisorId: string | null;
  trashBinId: string | null;
  supervisor: any | null;
  trashBin: any | null;
  worker: any | null;
}

export interface RequestWithRole extends Request {
  roleName: string;
}

export interface CreateRequestData {
  workerId: string;
  description: string;
  location: string;
  supervisorId?: string;
  trashBinId?: string;
}

export interface UpdateRequestData {
  description?: string;
  status?: string;
  location?: string;
  supervisorId?: string;
  trashBinId?: string;
}

// Priority mapping for requests
export const REQUEST_PRIORITY_MAPPING = {
  1: "Thấp",
  2: "Trung bình", 
  3: "Cao",
  4: "Khẩn cấp"
};

export const REQUEST_PRIORITY_MAPPING_REVERSE = {
  "Thấp": 1,
  "Trung bình": 2,
  "Cao": 3,
  "Khẩn cấp": 4
};

// Status mapping for requests - Updated to match the new 4 statuses
export const REQUEST_STATUS_MAPPING = {
  1: "Đã gửi",
  2: "Đang xử lý", 
  3: "Đã xử lý",
  4: "Đã hủy"
};

export const REQUEST_STATUS_MAPPING_REVERSE = {
  "Đã gửi": 1,
  "Đang xử lý": 2,
  "Đã xử lý": 3,
  "Đã hủy": 4
};

// Helper function to validate and normalize request data
const normalizeRequestData = (data: any): Request[] => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map((item, index) => {
    // Ensure all required fields are present
    const normalized: Request = {
      requestId: item.requestId || `temp-${index}`,
      workerId: item.workerId || '',
      workerName: item.workerName || null,
      description: item.description || '',
      status: item.status || 'Chờ xử lý',
      requestDate: item.requestDate || new Date().toISOString(),
      resolveDate: item.resolveDate || null,
      location: item.location || '',
      supervisorId: item.supervisorId || null,
      trashBinId: item.trashBinId || null,
      supervisor: item.supervisor || null,
      trashBin: item.trashBin || null,
      worker: item.worker || null,
    };

    return normalized;
  });
};

// Hook to get all requests
export const useRequests = () => {
  const { data, error, isLoading } = useSWR<Request[]>(
    API_URLS.REQUEST.GET_ALL,
    swrFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  // Normalize the data before returning
  const normalizedRequests = data ? normalizeRequestData(data) : [];

  return {
    requests: normalizedRequests,
    isLoading,
    isError: error,
    refresh: () => mutate(API_URLS.REQUEST.GET_ALL),
  };
};

// Hook to get requests with role filtering (now just returns the same data with role info)
export const useRequestsWithRole = () => {
  const { data, error, isLoading } = useSWR<Request[]>(
    API_URLS.REQUEST.GET_ALL, // Use the same endpoint since /with-role doesn't exist
    swrFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
  );

  // Since the backend doesn't support role filtering, we'll add a roleName property
  // based on the user's role or other logic
  const requestsWithRole = (data || []).map(request => ({
    ...request,
    roleName: 'worker' // Default role, you can customize this based on your needs
  }));

  return {
    requests: requestsWithRole,
    isLoading,
    isError: error,
    refresh: () => mutate(API_URLS.REQUEST.GET_ALL),
  };
};

// Hook to get a single request by ID
export const useRequest = (id: string | null) => {
  const { data, error, isLoading } = useSWR<Request>(
    id ? API_URLS.REQUEST.GET_BY_ID(id) : null,
    swrFetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      errorRetryCount: 3,
      errorRetryInterval: 5000,
    }
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
  try {
    const response = await swrFetcher(API_URLS.REQUEST.CREATE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    // Refresh the requests list
    mutate(API_URLS.REQUEST.GET_ALL);

    return response;
  } catch (error) {
    console.error('Error creating request:', error);
    throw error;
  }
};

// Function to update a request
export const updateRequest = async (id: string, requestData: UpdateRequestData): Promise<Request> => {
  try {
    const response = await swrFetcher(API_URLS.REQUEST.UPDATE(id), {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    // Refresh the requests list
    mutate(API_URLS.REQUEST.GET_ALL);
    mutate(API_URLS.REQUEST.GET_BY_ID(id));

    return response;
  } catch (error) {
    console.error('Error updating request:', error);
    throw error;
  }
};

// Function to update request status using the new API endpoint
export const updateRequestStatus = async (requestId: string, status: number): Promise<Request> => {
  try {
    // Use the endpoint from Swagger documentation: PUT /api/request/status
    const response = await swrFetcher(`${BASE_API_URL}/request/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        requestId, 
        status 
      }),
    });

    // Refresh the requests list
    mutate(API_URLS.REQUEST.GET_ALL);
    mutate(API_URLS.REQUEST.GET_BY_ID(requestId));

    return response;
  } catch (error) {
    console.error('Error updating request status:', error);
    throw error;
  }
};

// Function to delete a request
export const deleteRequest = async (id: string): Promise<void> => {
  try {
    await swrFetcher(API_URLS.REQUEST.DELETE(id), {
      method: 'DELETE',
    });

    // Refresh the requests list
    mutate(API_URLS.REQUEST.GET_ALL);
  } catch (error) {
    console.error('Error deleting request:', error);
    throw error;
  }
};
