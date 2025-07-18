import useSWR from 'swr';
import { API_URLS, BASE_API_URL } from '../constants/api-urls';
import { swrFetcher } from '../utils/swr-fetcher';
import { enhancedFetch } from '../utils/enhanced-fetch';

// Alert type definitions based on API response
export interface Alert {
  alertId: string;
  trashBinId: string;
  timeSend: string;
  resolvedAt: string | null;
  userId: string | null;
  trashBin?: {
    trashBinId: string;
    status: string;
    areaId: string;
    location: string;
    image: string | null;
    restroomId: string;
    alerts?: (Alert | null)[];
    area?: any;
    requests?: any[];
    restroom?: any;
    schedules?: any[];
    sensorBins?: any[];
  };
  user?: any;
}

export interface CreateAlertData {
  trashBinId: string;
  status: string;
  userId?: string;
}

// Hook for fetching all alerts
export const useNotifications = () => {
  const { data, error, mutate } = useSWR<Alert[]>(
    `${BASE_API_URL}/${API_URLS.ALERTS.GET_ALL}`,
    swrFetcher
  );

  console.log('=== useNotifications Hook ===');
  console.log('API URL:', `${BASE_API_URL}/${API_URLS.ALERTS.GET_ALL}`);
  console.log('Raw data:', data);
  console.log('Error:', error);
  console.log('Data length:', data?.length);

  return {
    notifications: data || [],
    isLoading: !error && !data,
    isError: error,
    refetch: mutate,
  };
};

// Hook for fetching alerts by user
export const useNotificationsByUser = (userId: string) => {
  const { data, error, mutate } = useSWR<Alert[]>(
    userId ? `${BASE_API_URL}/${API_URLS.ALERTS.GET_BY_USER(userId)}` : null,
    swrFetcher
  );

  return {
    notifications: data || [],
    isLoading: !error && !data,
    isError: error,
    refetch: mutate,
  };
};

// Hook for fetching a single alert
export const useNotification = (id: string) => {
  const { data, error, mutate } = useSWR<Alert>(
    id ? `${BASE_API_URL}/${API_URLS.ALERTS.GET_BY_ID(id)}` : null,
    swrFetcher
  );

  return {
    notification: data,
    isLoading: !error && !data,
    isError: error,
    refetch: mutate,
  };
};

// Function to create a new alert
export const createNotification = async (alertData: CreateAlertData): Promise<Alert> => {
  try {
    const response = await swrFetcher(`${BASE_API_URL}/${API_URLS.ALERTS.CREATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertData),
    }) as Response;

    if (!response.ok) {
      throw new Error(`Failed to create alert: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error creating alert:', error);
    throw error;
  }
};

// Function to update an alert
export const updateNotification = async (id: string, alertData: Partial<CreateAlertData>): Promise<Alert> => {
  try {
    const response = await swrFetcher(`${BASE_API_URL}/${API_URLS.ALERTS.UPDATE(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(alertData),
    }) as Response;

    if (!response.ok) {
      throw new Error(`Failed to update alert: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error updating alert:', error);
    throw error;
  }
};

// Function to mark alert as resolved
export const markNotificationAsRead = async (id: string): Promise<Alert> => {
  try {
    const response = await swrFetcher(`${BASE_API_URL}/${API_URLS.ALERTS.MARK_AS_READ(id)}`, {
      method: 'PUT',
    }) as Response;

    if (!response.ok) {
      throw new Error(`Failed to mark alert as resolved: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error marking alert as resolved:', error);
    throw error;
  }
};

// Function to mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  const token = localStorage.getItem('authToken');
  const response = await enhancedFetch(`${BASE_API_URL}/${API_URLS.ALERTS.MARK_ALL_AS_READ(userId)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  }) as Response;

  if (!response.ok) {
    throw new Error(`Failed to mark all notifications as read: ${response.statusText}`);
  }
};

// Function to delete a notification
export const deleteNotification = async (id: string): Promise<void> => {
  const token = localStorage.getItem('authToken');
  const response = await enhancedFetch(`${BASE_API_URL}/${API_URLS.ALERTS.DELETE(id)}`, {
    method: 'DELETE',
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  }) as Response;

  if (!response.ok) {
    throw new Error(`Failed to delete notification: ${response.statusText}`);
  }
}; 