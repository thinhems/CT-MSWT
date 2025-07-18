import React, { useState, useEffect } from 'react';
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
  HiOutlineCog
} from "react-icons/hi";
import UserRoleInfo from '../components/UserRoleInfo';

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats] = useState({
    totalUsers: 125,
    activeTrashBins: 32,
    pendingReports: 8,
    maintenanceItems: 3,
    todayReports: 12,
    completedTasks: 47
  });

  const [recentActivities] = useState([
    {
      id: 1,
      type: 'report',
      message: 'Báo cáo mới từ Nguyễn Văn A - Thùng rác T1-01 đầy',
      time: '10 phút trước',
      priority: 'high'
    },
    {
      id: 2,
      type: 'maintenance',
      message: 'Hoàn thành bảo trì thùng rác T2-03',
      time: '1 giờ trước',
      priority: 'normal'
    },
    {
      id: 3,
      type: 'user',
      message: 'Thêm nhân viên mới: Trần Thị B',
      time: '2 giờ trước',
      priority: 'normal'
    },
    {
      id: 4,
      type: 'system',
      message: 'Cập nhật lịch làm việc tuần này',
      time: '3 giờ trước',
      priority: 'low'
    }
  ]);

  const [chartData] = useState({
    reports: [
      { day: 'T2', count: 8 },
      { day: 'T3', count: 12 },
      { day: 'T4', count: 6 },
      { day: 'T5', count: 15 },
      { day: 'T6', count: 10 },
      { day: 'T7', count: 4 },
      { day: 'CN', count: 2 }
    ]
  });

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
    const maxValue = Math.max(...data.map(item => item.count));
    
    return (
      <div style={{ display: "flex", alignItems: "end", gap: "12px", height: "200px", padding: "20px 0" }}>
        {data.map((item, index) => (
          <div key={index} style={{ 
            display: "flex", 
            flexDirection: "column", 
            alignItems: "center", 
            flex: 1 
          }}>
            <div style={{
              width: "100%",
              height: `${(item.count / maxValue) * 160}px`,
              backgroundColor: "#FF5B27",
              borderRadius: "4px 4px 0 0",
              marginBottom: "8px",
              transition: "all 0.3s ease",
              position: "relative",
              cursor: "pointer"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#E04B1F";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#FF5B27";
            }}>
              <div style={{
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
        ))}
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
          value={stats.totalUsers}
          subtitle="+12% so với tháng trước"
          trend="up"
          color="#3b82f6"
        />
        <StatCard
          icon={HiOutlineTrash}
          title="Thùng rác hoạt động"
          value={stats.activeTrashBins}
          subtitle="94% hiệu suất"
          trend="up"
          color="#10b981"
        />
        <StatCard
          icon={HiOutlineExclamation}
          title="Báo cáo chờ xử lý"
          value={stats.pendingReports}
          subtitle="-25% so với hôm qua"
          trend="down"
          color="#f59e0b"
        />
        <StatCard
          icon={HiOutlineClock}
          title="Nhiệm vụ hoàn thành"
          value={stats.completedTasks}
          subtitle="Hôm nay"
          color="#8b5cf6"
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
          <BarChart data={chartData.reports} />
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
            {recentActivities.map(activity => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
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
            { title: "Kiểm tra thùng rác", description: "Trạng thái hiện tại", color: "#10b981" },
            { title: "Lịch làm việc", description: "Xem ca làm việc", color: "#8b5cf6" }
          ].map((action, index) => (
            <button key={index} style={{
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
