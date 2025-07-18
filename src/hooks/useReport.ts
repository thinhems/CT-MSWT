import useSWR, { mutate } from 'swr';
import { API_URLS, BASE_API_URL } from '../constants/api-urls';
import { swrFetcher } from '../utils/swr-fetcher';

// Report interface based on backend API
export interface Report {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  reportType: string;
  location: string;
  reportedBy: string;
  contactInfo: string;
  createdDate: string;
  timeCreated: string;
  createdBy: string;
  assignedTo: string;
  imageUrl?: string;
  reporterRole?: string;
}

export interface ReportWithRole extends Report {
  roleName: string;
  userName: string;
}

// Create report data interface for leader
export interface CreateReportData {
  description: string;
  reportName: string;
  image?: string;
  priority: number; // 1, 2, 3 cho Low, Medium, High
  reportType: number; // Loại báo cáo
}

// Update report data interface
export interface UpdateReportData {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  reportType?: string;
  location?: string;
  assignedTo?: string;
}

// Update report status data interface
export interface UpdateReportStatusData {
  status: number | string; // Based on enum: 1=DaGui, 2=DangXuLy, 3=DaHoanThanh or string format
}

// Priority mapping
export const PRIORITY_MAPPING = {
  "Thấp": 3,
  "Trung bình": 2, 
  "Cao": 1
};

export const PRIORITY_MAPPING_REVERSE = {
  1: "Cao",
  2: "Trung bình",
  3: "Thấp"
};

// Status mapping based on enum ReportStatus
export const STATUS_MAPPING = {
  "Đã gửi": 1,        // DaGui
  "Đang xử lý": 2,    // DangXuLy  
  "Đã hoàn thành": 3  // DaHoanThanh
};

export const STATUS_MAPPING_REVERSE = {
  1: "Đã gửi",        // DaGui
  2: "Đang xử lý",    // DangXuLy
  3: "Đã hoàn thành"  // DaHoanThanh
};

// Hook to get all reports (Báo cáo tổng)
export const useReports = () => {
  const { data, error, isLoading } = useSWR<Report[]>(
    API_URLS.REPORT.GET_ALL,
    swrFetcher
  );

  return {
    reports: data || [],
    isLoading,
    isError: error,
    refresh: () => mutate(API_URLS.REPORT.GET_ALL),
  };
};

// Hook to get reports with role filtering
export const useReportsWithRole = () => {
  const { data, error, isLoading } = useSWR<ReportWithRole[]>(
    API_URLS.REPORT.GET_WITH_ROLE,
    swrFetcher
  );

  return {
    reports: data || [],
    isLoading,
    isError: error,
    refresh: () => mutate(API_URLS.REPORT.GET_WITH_ROLE),
  };
};

// Hook to get single report by ID
export const useReport = (id: string) => {
  const { data, error, isLoading } = useSWR<Report>(
    id ? API_URLS.REPORT.GET_BY_ID(id) : null,
    swrFetcher
  );

  return {
    report: data,
    isLoading,
    isError: error,
    refresh: () => mutate(API_URLS.REPORT.GET_BY_ID(id)),
  };
};

// Create new report for leader
export const createReport = async (reportData: CreateReportData): Promise<Report> => {
  try {
    const response = await fetch(`${BASE_API_URL}/${API_URLS.REPORT.CREATE_LEADER}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      throw new Error('Failed to create report');
    }

    const newReport = await response.json();
    
    // Refresh reports list
    mutate(API_URLS.REPORT.GET_ALL);
    mutate(API_URLS.REPORT.GET_WITH_ROLE);
    
    return newReport;
  } catch (error) {
    console.error('Error creating report:', error);
    throw error;
  }
};

// Update existing report
export const updateReport = async (id: string, reportData: UpdateReportData): Promise<Report> => {
  try {
    const response = await fetch(`${BASE_API_URL}/${API_URLS.REPORT.UPDATE(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      throw new Error('Failed to update report');
    }

    const updatedReport = await response.json();
    
    // Refresh reports data
    mutate(API_URLS.REPORT.GET_ALL);
    mutate(API_URLS.REPORT.GET_WITH_ROLE);
    mutate(API_URLS.REPORT.GET_BY_ID(id));
    
    return updatedReport;
  } catch (error) {
    console.error('Error updating report:', error);
    throw error;
  }
};

// Update report status using PATCH API
export const updateReportStatus = async (id: string, statusData: UpdateReportStatusData): Promise<Report> => {
  try {
    const url = `${BASE_API_URL}/${API_URLS.REPORT.UPDATE_STATUS(id)}`;
    const token = localStorage.getItem('accessToken');
    
    console.log('🔍 PATCH Request Details:', {
      url,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token.substring(0, 20)}...` : 'No token',
      },
      body: JSON.stringify(statusData),
      statusData
    });

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(statusData),
    });

    console.log('🔍 Response Status:', response.status);
    console.log('🔍 Response Headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('🔍 Error Response Body:', errorText);
      throw new Error(`Failed to update report status: ${response.status} - ${errorText}`);
    }

    const updatedReport = await response.json();
    
    // Refresh reports data
    mutate(API_URLS.REPORT.GET_ALL);
    mutate(API_URLS.REPORT.GET_WITH_ROLE);
    mutate(API_URLS.REPORT.GET_BY_ID(id));
    
    return updatedReport;
  } catch (error) {
    console.error('Error updating report status:', error);
    throw error;
  }
};

// Delete report
export const deleteReport = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${BASE_API_URL}/${API_URLS.REPORT.DELETE(id)}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete report');
    }
    
    // Refresh reports data
    mutate(API_URLS.REPORT.GET_ALL);
    mutate(API_URLS.REPORT.GET_WITH_ROLE);
    
  } catch (error) {
    console.error('Error deleting report:', error);
    throw error;
  }
}; 