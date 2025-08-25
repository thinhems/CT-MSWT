import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineUsers, 
  HiOutlineTrash, 
  HiOutlineChartBar, 
  HiOutlineExclamation,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineEye,
  HiOutlineTrendingUp,
  HiOutlineTrendingDown,
  HiOutlineCog,
  HiOutlineBell
} from "react-icons/hi";
import UserRoleInfo from '../components/UserRoleInfo';
import { useDashboardStats, useRecentActivities, useChartData } from '../hooks/useDashboard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Fetch real data from APIs
  const { stats, isLoading: statsLoading, isError: statsError } = useDashboardStats();
  const { activities, isLoading: activitiesLoading, isError: activitiesError } = useRecentActivities();
  const { chartData, isLoading: chartLoading, isError: chartError } = useChartData();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Helper function to convert hex to rgba
  const hexToRgba = (hex, alpha = 0.1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, color = "#FF5B27" }) => (
    <div style={{
      backgroundColor: "white",
      borderRadius: "12px",
      padding: "24px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      border: "1px solid #f3f4f6",
      transition: "transform 0.2s, box-shadow 0.2s"
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = "0 8px 25px -8px rgba(0, 0, 0, 0.15)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ 
            fontSize: "14px", 
            fontWeight: "500", 
            color: "#6b7280", 
            margin: "0 0 8px 0" 
          }}>
            {title}
          </h3>
          <p style={{ 
            fontSize: "32px", 
            fontWeight: "700", 
            color: "#111827", 
            margin: "0 0 4px 0" 
          }}>
            {value}
          </p>
          {subtitle && (
            <p style={{ 
              fontSize: "12px", 
              color: "#6b7280", 
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              {trend && (
                <span style={{ 
                  color: trend === 'up' ? '#10b981' : '#ef4444' 
                }}>
                  {trend === 'up' ? <HiOutlineTrendingUp /> : <HiOutlineTrendingDown />}
                </span>
              )}
              {subtitle}
            </p>
          )}
        </div>
        <div style={{
          width: "48px",
          height: "48px",
          backgroundColor: hexToRgba(color, 0.1),
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <Icon style={{ width: "24px", height: "24px", color }} />
        </div>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getIcon = () => {
      switch (activity.type) {
        case 'report': return <HiOutlineChartBar />;
        case 'maintenance': return <HiOutlineCog />;
        case 'user': return <HiOutlineUsers />;
        case 'alert': return <HiOutlineBell />;
        default: return <HiOutlineCheckCircle />;
      }
    };

    const getPriorityColor = () => {
      switch (activity.priority) {
        case 'high': return '#ef4444';
        case 'normal': return '#3b82f6';
        case 'low': return '#6b7280';
        default: return '#6b7280';
      }
    };

    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid #f3f4f6"
      }}>
        <div style={{
          width: "40px",
          height: "40px",
          backgroundColor: hexToRgba(getPriorityColor(), 0.1),
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: "12px"
        }}>
          <span style={{ color: getPriorityColor(), fontSize: "16px" }}>
            {getIcon()}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ 
            fontSize: "14px", 
            color: "#111827", 
            margin: "0 0 4px 0",
            fontWeight: "500"
          }}>
            {activity.message}
          </p>
          <p style={{ 
            fontSize: "12px", 
            color: "#6b7280", 
            margin: 0 
          }}>
            {activity.time}
          </p>
        </div>
      </div>
    );
  };

  const BarChart = ({ data }) => {
    console.log('=== BarChart Debug ===');
    console.log('Chart data received:', data);
    console.log('Data type:', typeof data);
    console.log('Data length:', data?.length);
    
    if (!data || data.length === 0) {
      console.log('No data for chart');
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          Không có dữ liệu để hiển thị
        </div>
      );
    }
    
    const maxValue = Math.max(...data.map(item => item.count));
    console.log('Max value:', maxValue);
    
    if (maxValue === 0) {
      console.log('All values are 0');
      return (
        <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
          Không có báo cáo trong tuần này
        </div>
      );
    }
    
    return (
      <div style={{ display: "flex", alignItems: "end", gap: "12px", height: "200px", padding: "20px 0" }}>
        {data.map((item, index) => {
          const height = maxValue > 0 ? `${(item.count / maxValue) * 160}px` : '4px';
          console.log(`Bar ${item.day}: count=${item.count}, height=${height}`);
          
          return (
            <div key={index} style={{ 
              display: "flex", 
              flexDirection: "column", 
              alignItems: "center", 
              flex: 1 
            }}>
              <div style={{
                width: "100%",
                height: height,
                backgroundColor: "#FF5B27",
                borderRadius: "4px 4px 0 0",
                marginBottom: "8px",
                transition: "all 0.3s ease",
                position: "relative",
                cursor: "pointer",
                minHeight: "4px"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#E04B1F";
                e.target.querySelector('.tooltip').style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#FF5B27";
                e.target.querySelector('.tooltip').style.opacity = "0";
              }}>
              <div className="tooltip" style={{
                position: "absolute",
                top: "-20px",
                left: "50%",
                transform: "translateX(-50%)",
                backgroundColor: "#111827",
                color: "white",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "10px",
                opacity: 0,
                transition: "opacity 0.2s"
              }}>
                {item.count}
              </div>
            </div>
            <span style={{ fontSize: "12px", color: "#6b7280", fontWeight: "500" }}>
              {item.day}
            </span>
          </div>
        );
      })}
      </div>
    );
  };

  return (
    <div style={{ 
      backgroundColor: "#ffffff", 
      minHeight: "100vh", 
      padding: "16px" 
    }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ 
              fontSize: "22px", 
              fontWeight: "700", 
              color: "#111827", 
              margin: "0 0 8px 0" 
            }}>
              Dashboard MSWT
            </h1>
            
          </div>
          <div style={{
            backgroundColor: "white",
            padding: "16px 20px",
            borderRadius: "12px",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            textAlign: "center"
          }}>
            <div style={{ fontSize: "18px", fontWeight: "600", color: "#111827" }}>
              {currentTime.toLocaleTimeString('vi-VN')}
            </div>
            <div style={{ fontSize: "14px", color: "#6b7280" }}>
              {currentTime.toLocaleDateString('vi-VN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
        gap: "24px", 
        marginBottom: "32px" 
      }}>
        <StatCard
          icon={HiOutlineUsers}
          title="Tổng nhân viên"
          value={statsLoading ? "..." : stats.totalUsers}
          subtitle={statsLoading ? "Đang tải..." : `${stats.totalUsers} người`}
          color="#3b82f6"
        />
        <StatCard
          icon={HiOutlineTrash}
          title="Thùng rác hoạt động"
          value={statsLoading ? "..." : stats.activeTrashBins}
          subtitle={statsLoading ? "Đang tải..." : `${stats.activeTrashBins} thùng`}
          color="#10b981"
        />
        <StatCard
          icon={HiOutlineExclamation}
          title="Báo cáo chờ xử lý"
          value={statsLoading ? "..." : stats.pendingReports}
          subtitle={statsLoading ? "Đang tải..." : `${stats.pendingReports} báo cáo`}
          color="#f59e0b"
        />
        <StatCard
          icon={HiOutlineBell}
          title="Cảnh báo chưa xử lý"
          value={statsLoading ? "..." : (stats.totalAlerts - stats.resolvedAlerts)}
          subtitle={statsLoading ? "Đang tải..." : `${stats.totalAlerts - stats.resolvedAlerts} cảnh báo`}
          color="#ef4444"
        />
      </div>

      {/* Charts and Activities */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "2fr 1fr", 
        gap: "24px", 
        marginBottom: "32px" 
      }}>
        {/* Reports Chart */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        }}>
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center", 
            marginBottom: "24px" 
          }}>
            <h3 style={{ fontSize: "18px", fontWeight: "600", color: "#111827", margin: 0 }}>
              Báo cáo trong tuần
            </h3>
            <button style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#f3f4f6",
              border: "none",
              borderRadius: "6px",
              padding: "8px 12px",
              fontSize: "14px",
              color: "#374151",
              cursor: "pointer"
            }}>
              <HiOutlineEye style={{ width: "16px", height: "16px" }} />
              Xem chi tiết
            </button>
          </div>
          {chartLoading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
              Đang tải biểu đồ...
            </div>
          ) : chartError ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#ef4444" }}>
              Lỗi tải dữ liệu biểu đồ
            </div>
          ) : (
            <BarChart data={chartData} />
          )}
        </div>

        {/* Recent Activities */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
        }}>
          <h3 style={{ 
            fontSize: "18px", 
            fontWeight: "600", 
            color: "#111827", 
            margin: "0 0 20px 0" 
          }}>
            Hoạt động gần đây
          </h3>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {activitiesLoading ? (
              <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
                Đang tải hoạt động...
              </div>
            ) : activitiesError ? (
              <div style={{ textAlign: "center", padding: "20px", color: "#ef4444" }}>
                Lỗi tải dữ liệu
              </div>
            ) : activities.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "#6b7280" }}>
                Không có hoạt động gần đây
              </div>
            ) : (
              activities.map(activity => (
                <ActivityItem key={activity.id} activity={activity} />
              ))
            )}
          </div>
          <button style={{
            width: "100%",
            marginTop: "16px",
            padding: "12px",
            backgroundColor: "#f9fafb",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            color: "#374151",
            cursor: "pointer",
            fontWeight: "500"
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = "#f3f4f6"}
          onMouseLeave={(e) => e.target.style.backgroundColor = "#f9fafb"}>
            Xem tất cả hoạt động
          </button>
        </div>
      </div>

      

      {/* Quick Actions */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "24px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }}>
        <h3 style={{ 
          fontSize: "18px", 
          fontWeight: "600", 
          color: "#111827", 
          margin: "0 0 20px 0" 
        }}>
          Thao tác nhanh
        </h3>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
          gap: "16px" 
        }}>
          {[
            { title: "Thêm báo cáo", description: "Tạo báo cáo mới", color: "#FF5B27" },
            { title: "Quản lý nhân viên", description: "Thêm/sửa thông tin", color: "#3b82f6" },
            { title: "Quản lý nhóm", description: "Quản lý nhóm làm việc", color: "#8b5cf6" },
            { title: "Nhóm Công việc", description: "Quản lý nhóm công việc", color: "#f59e0b" },
            { title: "Kiểm tra thùng rác", description: "Trạng thái hiện tại", color: "#10b981" },
            { title: "Lịch làm việc", description: "Xem ca làm việc", color: "#ef4444" }
          ].map((action, index) => (
            <button key={index} 
              onClick={() => {
                if (action.title === "Thêm báo cáo") navigate('/report-management');
                else if (action.title === "Quản lý nhân viên") navigate('/user-management');
                else if (action.title === "Quản lý nhóm") navigate('/worker-group-management');
                else if (action.title === "Nhóm Công việc") navigate('/group-assignment');
                else if (action.title === "Kiểm tra thùng rác") navigate('/trash');
                else if (action.title === "Lịch làm việc") navigate('/shifts');
              }}
              style={{
                backgroundColor: hexToRgba(action.color, 0.1),
                border: `1px solid ${hexToRgba(action.color, 0.3)}`,
                borderRadius: "8px",
                padding: "16px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = hexToRgba(action.color, 0.2);
                e.target.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = hexToRgba(action.color, 0.1);
                e.target.style.transform = "translateY(0)";
              }}>
              <div style={{ 
                fontSize: "16px", 
                fontWeight: "600", 
                color: action.color, 
                marginBottom: "4px" 
              }}>
                {action.title}
              </div>
              <div style={{ fontSize: "14px", color: "#6b7280" }}>
                {action.description}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
