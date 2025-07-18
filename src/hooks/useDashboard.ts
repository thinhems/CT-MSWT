import useSWR from 'swr';
import { API_URLS, BASE_API_URL } from '../constants/api-urls';
import { swrFetcher } from '../utils/swr-fetcher';

// Dashboard stats interface
export interface DashboardStats {
  totalUsers: number;
  activeTrashBins: number;
  pendingReports: number;
  completedTasks: number;
  totalAlerts: number;
  resolvedAlerts: number;
}

// Recent activity interface
export interface RecentActivity {
  id: string;
  type: 'report' | 'maintenance' | 'user' | 'system' | 'alert';
  message: string;
  time: string;
  priority: 'high' | 'normal' | 'low';
  userId?: string;
  userName?: string;
}

// Chart data interface
export interface ChartData {
  day: string;
  count: number;
}

// Hook for fetching dashboard stats
export const useDashboardStats = () => {
  // Fetch users count
  const { data: users } = useSWR<any[]>(
    `${BASE_API_URL}/${API_URLS.USER.GET_ALL}`,
    swrFetcher
  );

  // Fetch trash bins count
  const { data: trashBins } = useSWR<any[]>(
    `${BASE_API_URL}/${API_URLS.TRASHBIN.GET_ALL}`,
    swrFetcher
  );

  // Fetch reports count
  const { data: reports } = useSWR<any[]>(
    `${BASE_API_URL}/${API_URLS.REPORT.GET_ALL}`,
    swrFetcher
  );

  // Fetch alerts count
  const { data: alerts } = useSWR<any[]>(
    `${BASE_API_URL}/${API_URLS.ALERTS.GET_ALL}`,
    swrFetcher
  );

  // Calculate stats
  const stats: DashboardStats = {
    totalUsers: users?.length || 0,
    activeTrashBins: trashBins?.filter(bin => bin.status === 'Hoạt động').length || 0,
    pendingReports: reports?.filter(report => report.status === 'Chờ xử lý').length || 0,
    completedTasks: reports?.filter(report => report.status === 'Hoàn thành').length || 0,
    totalAlerts: alerts?.length || 0,
    resolvedAlerts: alerts?.filter(alert => alert.resolvedAt !== null).length || 0,
  };

  return {
    stats,
    isLoading: !users || !trashBins || !reports || !alerts,
    isError: false,
  };
};

// Hook for fetching recent activities
export const useRecentActivities = () => {
  // Fetch recent reports
  const { data: reports } = useSWR<any[]>(
    `${BASE_API_URL}/${API_URLS.REPORT.GET_ALL}`,
    swrFetcher
  );

  // Fetch recent alerts
  const { data: alerts } = useSWR<any[]>(
    `${BASE_API_URL}/${API_URLS.ALERTS.GET_ALL}`,
    swrFetcher
  );

  // Combine and format activities
  const activities: RecentActivity[] = [];

  // Add recent reports
  if (reports) {
    reports.slice(0, 5).forEach(report => {
      activities.push({
        id: report.reportId,
        type: 'report',
        message: `Báo cáo mới: ${report.title || 'Báo cáo không tiêu đề'}`,
        time: new Date(report.createdAt).toLocaleString('vi-VN'),
        priority: report.priority === 'Cao' ? 'high' : report.priority === 'Trung bình' ? 'normal' : 'low',
        userId: report.userId,
        userName: report.user?.fullName || 'Không xác định'
      });
    });
  }

  // Add recent alerts
  if (alerts) {
    alerts.slice(0, 3).forEach(alert => {
      activities.push({
        id: alert.alertId,
        type: 'alert',
        message: `Cảnh báo: Thùng rác ${alert.trashBinId} cần được xử lý`,
        time: new Date(alert.timeSend).toLocaleString('vi-VN'),
        priority: alert.resolvedAt === null ? 'high' : 'normal',
        userId: alert.userId,
        userName: alert.user?.fullName || 'Không xác định'
      });
    });
  }

  // Sort by time (most recent first)
  activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  return {
    activities: activities.slice(0, 10), // Return only 10 most recent
    isLoading: !reports || !alerts,
    isError: false,
  };
};

// Hook for fetching chart data
export const useChartData = () => {
  // Fetch reports for the last 7 days
  const { data: reports, error } = useSWR<any[]>(
    `${BASE_API_URL}/${API_URLS.REPORT.GET_ALL}`,
    swrFetcher
  );

  // Generate chart data for the last 7 days
  const generateChartData = (): ChartData[] => {
    console.log('=== Chart Data Debug ===');
    console.log('Reports data:', reports);
    console.log('Reports length:', reports?.length);
    
    const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
    const today = new Date();
    
    const chartData = days.map((day, index) => {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() - (6 - index));
      
      const dayReports = reports?.filter(report => {
        if (!report.createdAt) {
          console.log('Report without createdAt:', report);
          return false;
        }
        const reportDate = new Date(report.createdAt);
        const isSameDay = reportDate.toDateString() === targetDate.toDateString();
        console.log(`Day ${day}: ${reportDate.toDateString()} vs ${targetDate.toDateString()} = ${isSameDay}`);
        return isSameDay;
      }) || [];

      console.log(`Day ${day}: ${dayReports.length} reports`);
      
      return {
        day,
        count: dayReports.length
      };
    });
    
    console.log('Final chart data:', chartData);
    return chartData;
  };

  const chartData = reports ? generateChartData() : [];

  return {
    chartData,
    isLoading: !reports,
    isError: error,
  };
}; 