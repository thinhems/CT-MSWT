import useSWR from 'swr';
import { API_URLS, BASE_API_URL } from '../constants/api-urls';
import { swrFetcher } from '../utils/swr-fetcher';
import { enhancedFetch } from '../utils/enhanced-fetch';

// Notification type definitions
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  time: string;
  read: boolean;
  priority: 'high' | 'normal' | 'low';
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'high' | 'normal' | 'low';
  userId?: string;
}

// Hook for fetching all notifications
export const useNotifications = () => {
  const { data, error, mutate } = useSWR(
    `${BASE_API_URL}/${API_URLS.ALERTS.GET_ALL}`,
    swrFetcher
  );

  return {
    notifications: data || [],
    isLoading: !error && !data,
    isError: error,
    refetch: mutate,
  };
};

// Hook for fetching notifications by user
export const useNotificationsByUser = (userId: string) => {
  const { data, error, mutate } = useSWR(
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

// Hook for fetching a single notification
export const useNotification = (id: string) => {
  const { data, error, mutate } = useSWR(
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

// Function to create a new notification
export const createNotification = async (notificationData: CreateNotificationData): Promise<Notification> => {
  try {
    const response = await swrFetcher(`${BASE_API_URL}/${API_URLS.ALERTS.CREATE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    }) as Response;

    if (!response.ok) {
      throw new Error(`Failed to create notification: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Function to update a notification
export const updateNotification = async (id: string, notificationData: Partial<CreateNotificationData>): Promise<Notification> => {
  try {
    const response = await swrFetcher(`${BASE_API_URL}/${API_URLS.ALERTS.UPDATE(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notificationData),
    }) as Response;

    if (!response.ok) {
      throw new Error(`Failed to update notification: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error updating notification:', error);
    throw error;
  }
};

// Function to mark notification as read
export const markNotificationAsRead = async (id: string): Promise<Notification> => {
  try {
    const response = await swrFetcher(`${BASE_API_URL}/${API_URLS.ALERTS.MARK_AS_READ(id)}`, {
      method: 'PUT',
    }) as Response;

    if (!response.ok) {
      throw new Error(`Failed to mark notification as read: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error marking notification as read:', error);
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