export interface NotificationModel {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  priority: 'high' | 'normal' | 'low';
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationData {
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  priority: 'high' | 'normal' | 'low';
  userId?: string;
}

export interface NotificationResponse {
  success: boolean;
  data?: NotificationModel | NotificationModel[];
  message?: string;
  error?: string;
} 