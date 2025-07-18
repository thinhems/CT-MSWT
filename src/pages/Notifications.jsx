import React, { useState, useEffect } from 'react';
import { 
  HiOutlineBell, 
  HiOutlineCheck, 
  HiOutlineX, 
  HiOutlineTrash,
  HiOutlineExclamationCircle,
  HiOutlineInformationCircle,
  HiOutlineCheckCircle
} from "react-icons/hi";
import { useAuth } from '../contexts/AuthContext';
import { 
  useNotifications, 
  useNotificationsByUser, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification as deleteNotificationAPI 
} from '../hooks/useNotifications';

const Notifications = () => {
  const { user } = useAuth();
  const [filter, setFilter] = useState("all"); // all, unread, read
  
  // Fetch notifications from API
  const { notifications: allNotifications, isLoading, isError, refetch } = useNotifications();
  const { notifications: userNotifications, refetch: refetchUserNotifications } = useNotificationsByUser(user?.id || '');
  
  // Use user-specific notifications if available, otherwise fall back to all notifications
  const notifications = user?.id ? userNotifications : allNotifications;

  // Debug: Log the notifications data structure
  console.log('=== DEBUG NOTIFICATIONS ===');
  console.log('Notifications data:', notifications);
  console.log('Notifications type:', typeof notifications);
  console.log('Notifications length:', notifications?.length);
  console.log('User ID:', user?.id);
  console.log('Filter:', filter);
  
  if (notifications && notifications.length > 0) {
    console.log('First notification:', notifications[0]);
    console.log('First notification keys:', Object.keys(notifications[0]));
    console.log('First notification resolvedAt:', notifications[0]?.resolvedAt);
    console.log('First notification trashBinId:', notifications[0]?.trashBinId);
    console.log('First notification timeSend:', notifications[0]?.timeSend);
    console.log('First notification alertId:', notifications[0]?.alertId);
  }
  
  // Ensure notifications is an array and has proper structure
  const notificationsArray = Array.isArray(notifications) ? notifications : [];
  console.log('NotificationsArray length:', notificationsArray.length);
  
  // Filter alerts based on status
  const filteredNotifications = notificationsArray.filter(alert => {
    if (!alert || typeof alert !== 'object') {
      console.log('Filtered out invalid alert:', alert);
      return false;
    }
    
    // Check if alert is resolved (has resolvedAt)
    const isResolved = alert.resolvedAt !== null;
    console.log('Alert:', alert.alertId, 'resolvedAt:', alert.resolvedAt, 'isResolved:', isResolved);
    
    if (filter === "unread") return !isResolved; // Unresolved alerts
    if (filter === "read") return isResolved; // Resolved alerts
    return true; // All alerts
  });
  
  console.log('Filtered notifications length:', filteredNotifications.length);

  // Function to format relative time
  const getRelativeTime = (timestamp) => {
    if (!timestamp) return 'Không xác định';
    
    try {
      const now = new Date();
      const time = new Date(timestamp);
      const diffInSeconds = Math.floor((now - time) / 1000);
      
      if (diffInSeconds < 60) return 'Vừa xong';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
      return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    } catch (error) {
      console.error('Error parsing timestamp:', timestamp, error);
      return 'Không xác định';
    }
  };

  // Function to get alert icon based on resolved status
  const getAlertIcon = (resolvedAt) => {
    if (resolvedAt === null) {
      return <HiOutlineExclamationCircle style={{ width: "18px", height: "18px" }} />;
    } else {
      return <HiOutlineCheckCircle style={{ width: "18px", height: "18px" }} />;
    }
  };

  // Function to get alert color based on resolved status
  const getAlertColor = (resolvedAt) => {
    if (resolvedAt === null) {
      return { 
        bg: "#fef3c7", 
        border: "#fde68a",
        icon: "#d97706"
      };
    } else {
      return { 
        bg: "#dcfce7", 
        border: "#bbf7d0",
        icon: "#15803d"
      };
    }
  };

  // Function to get status display text
  const getStatusDisplay = (resolvedAt) => {
    if (resolvedAt === null) {
      return "Cần được xử lý";
    } else {
      return "Đã xử lý";
    }
  };

  const markAsRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      refetch();
      if (user?.id) refetchUserNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      alert('Không thể đánh dấu thông báo đã đọc');
    }
  };

  const markAsUnread = async (id) => {
    try {
      // Note: API might not have mark as unread, you may need to implement this
      // For now, we'll just refetch data
      refetch();
      if (user?.id) refetchUserNotifications();
    } catch (error) {
      console.error('Failed to mark notification as unread:', error);
      alert('Không thể đánh dấu thông báo chưa đọc');
    }
  };

  const deleteNotification = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa thông báo này?")) {
      try {
        await deleteNotificationAPI(id);
        refetch();
        if (user?.id) refetchUserNotifications();
      } catch (error) {
        console.error('Failed to delete notification:', error);
        alert('Không thể xóa thông báo');
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      if (user?.id) {
        await markAllNotificationsAsRead(user.id);
      }
      refetch();
      if (user?.id) refetchUserNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      alert('Không thể đánh dấu tất cả thông báo đã đọc');
    }
  };

  const unreadCount = notificationsArray.filter(alert => alert && alert.resolvedAt === null).length;

  // Loading state
  if (isLoading) {
    return (
      <div style={{ 
        backgroundColor: "#ffffff", 
        minHeight: "100vh", 
        padding: "24px 32px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f4f6",
            borderTop: "4px solid #FF5B27",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px"
          }}></div>
          <p style={{ color: "#6b7280", fontSize: "16px" }}>Đang tải thông báo...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div style={{ 
        backgroundColor: "#ffffff", 
        minHeight: "100vh", 
        padding: "24px 32px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <div style={{ textAlign: "center" }}>
          <HiOutlineExclamationCircle style={{
            width: "48px",
            height: "48px",
            color: "#ef4444",
            margin: "0 auto 16px"
          }} />
          <h3 style={{ fontSize: "18px", fontWeight: "500", margin: "0 0 8px 0", color: "#111827" }}>
            Lỗi tải thông báo
          </h3>
          <p style={{ fontSize: "14px", margin: "0 0 16px 0", color: "#6b7280" }}>
            Không thể tải danh sách thông báo. Vui lòng thử lại.
          </p>
          <button
            onClick={() => {
              refetch();
              if (user?.id) refetchUserNotifications();
            }}
            style={{
              padding: "10px 20px",
              backgroundColor: "#FF5B27",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer"
            }}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    <div style={{ 
      backgroundColor: "#ffffff", 
      minHeight: "100vh", 
      padding: "24px 32px" 
    }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h1 style={{ 
              fontSize: "32px", 
              fontWeight: "700", 
              color: "#111827", 
              margin: "0 0 8px 0" 
            }}>
              Thông báo
            </h1>
            <p style={{ 
              fontSize: "16px", 
              color: "#6b7280", 
              margin: 0 
            }}>
              Quản lý tất cả thông báo của hệ thống
            </p>
          </div>
          
            
          
        </div>
      </div>

      {/* Filter Tabs & Actions */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "24px",
        marginBottom: "24px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {/* Filter Tabs */}
          <div style={{ display: "flex", gap: "24px" }}>
            {[
              { key: "all", label: `Tất cả (${notificationsArray.length})` },
              { key: "unread", label: `Chưa xử lý (${unreadCount})` },
              { key: "read", label: `Đã xử lý (${notificationsArray.length - unreadCount})` }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  backgroundColor: filter === tab.key ? "#FF5B27" : "transparent",
                  color: filter === tab.key ? "white" : "#6b7280",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (filter !== tab.key) {
                    e.target.style.backgroundColor = "#f3f4f6";
                  }
                }}
                onMouseLeave={(e) => {
                  if (filter !== tab.key) {
                    e.target.style.backgroundColor = "transparent";
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Action Button */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                backgroundColor: "#f3f4f6",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                color: "#374151",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "#e5e7eb"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "#f3f4f6"}
            >
              <HiOutlineCheck style={{ width: "16px", height: "16px" }} />
              Đánh dấu tất cả đã xử lý
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        overflow: "hidden"
      }}>
        {filteredNotifications.length === 0 ? (
          <div style={{
            padding: "48px 24px",
            textAlign: "center",
            color: "#6b7280"
          }}>
            <HiOutlineBell style={{ 
              width: "48px", 
              height: "48px", 
              margin: "0 auto 16px",
              color: "#d1d5db"
            }} />
            <h3 style={{ fontSize: "18px", fontWeight: "500", margin: "0 0 8px 0" }}>
              Không có thông báo
            </h3>
            <p style={{ fontSize: "14px", margin: 0 }}>
              {filter === "unread" ? "Tất cả thông báo đã được xử lý" : 
               filter === "read" ? "Không có thông báo đã xử lý" : 
               "Chưa có thông báo nào"}
            </p>
          </div>
        ) : (
          filteredNotifications.map((alert, index) => {
            const colors = getAlertColor(alert.resolvedAt);
            const isResolved = alert.resolvedAt !== null;
            
            return (
              <div
                key={alert.alertId || `alert-${index}`}
                style={{
                  padding: "20px 24px",
                  borderBottom: index < filteredNotifications.length - 1 ? "1px solid #f3f4f6" : "none",
                  backgroundColor: isResolved ? "white" : "#fafafa",
                  position: "relative",
                  transition: "background-color 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (isResolved) {
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = isResolved ? "white" : "#fafafa";
                }}
              >
                {/* Unresolved indicator */}
                {!isResolved && (
                  <div style={{
                    position: "absolute",
                    left: "8px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "4px",
                    height: "4px",
                    backgroundColor: "#FF5B27",
                    borderRadius: "50%"
                  }} />
                )}

                <div style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}>
                  {/* Icon */}
                  <div style={{
                    width: "40px",
                    height: "40px",
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0
                  }}>
                    <div style={{ color: colors.icon }}>
                      {getAlertIcon(alert.resolvedAt)}
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{
                          fontSize: "16px",
                          fontWeight: isResolved ? "500" : "600",
                          color: "#111827",
                          margin: "0 0 4px 0"
                        }}
                        title={`Alert ID: ${alert.alertId}\nTrash Bin ID: ${alert.trashBinId}\nTime: ${alert.timeSend}`}
                        >
                          {getStatusDisplay(alert.resolvedAt)}
                        </h4>
                        <p style={{
                          fontSize: "14px",
                          color: "#6b7280",
                          margin: "0 0 8px 0",
                          lineHeight: "1.5"
                        }}>
                          {alert.trashBin?.location || `Thùng rác ${alert.trashBinId || 'Không xác định'}`}
                          {alert.trashBin?.alerts && alert.trashBin.alerts.length > 1 && (
                            <span style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              marginLeft: "8px"
                            }}>
                              ({alert.trashBin.alerts.filter(a => a !== null).length} cảnh báo)
                            </span>
                          )}
                        </p>
                        <div style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          flexWrap: "wrap"
                        }}>
                          <span style={{
                            fontSize: "12px",
                            color: "#9ca3af"
                          }}>
                            {getRelativeTime(alert.timeSend)}
                          </span>
                          {alert.trashBin?.status && (
                            <span style={{
                              fontSize: "10px",
                              padding: "2px 6px",
                              backgroundColor: alert.trashBin.status === "Hoạt động" ? "#dcfce7" : "#fee2e2",
                              color: alert.trashBin.status === "Hoạt động" ? "#15803d" : "#dc2626",
                              borderRadius: "4px",
                              fontWeight: "500"
                            }}>
                              {alert.trashBin.status}
                            </span>
                          )}
                          {alert.trashBinId && (
                            <span style={{
                              fontSize: "10px",
                              padding: "2px 6px",
                              backgroundColor: "#dbeafe",
                              color: "#1d4ed8",
                              borderRadius: "4px",
                              fontWeight: "500"
                            }}>
                              ID: {alert.trashBinId?.slice(-8) || 'N/A'}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: "8px", marginLeft: "16px" }}>
                        {!isResolved ? (
                          <button
                            onClick={() => markAsRead(alert.alertId)}
                            style={{
                              padding: "6px",
                              backgroundColor: "transparent",
                              border: "1px solid #e5e7eb",
                              borderRadius: "6px",
                              color: "#6b7280",
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = "#f3f4f6";
                              e.target.style.color = "#374151";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = "transparent";
                              e.target.style.color = "#6b7280";
                            }}
                            title="Đánh dấu đã xử lý"
                          >
                            <HiOutlineCheck style={{ width: "16px", height: "16px" }} />
                          </button>
                        ) : (
                          <button
                            onClick={() => markAsUnread(alert.alertId)}
                            style={{
                              padding: "6px",
                              backgroundColor: "transparent",
                              border: "1px solid #e5e7eb",
                              borderRadius: "6px",
                              color: "#6b7280",
                              cursor: "pointer",
                              transition: "all 0.2s"
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = "#f3f4f6";
                              e.target.style.color = "#374151";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = "transparent";
                              e.target.style.color = "#6b7280";
                            }}
                            title="Đánh dấu chưa xử lý"
                          >
                            <HiOutlineX style={{ width: "16px", height: "16px" }} />
                          </button>
                        )}
                        
                        <button
                          onClick={() => deleteNotification(alert.alertId)}
                          style={{
                            padding: "6px",
                            backgroundColor: "transparent",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                            color: "#6b7280",
                            cursor: "pointer",
                            transition: "all 0.2s"
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#fee2e2";
                            e.target.style.borderColor = "#fecaca";
                            e.target.style.color = "#dc2626";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.borderColor = "#e5e7eb";
                            e.target.style.color = "#6b7280";
                          }}
                          title="Xóa thông báo"
                        >
                          <HiOutlineTrash style={{ width: "16px", height: "16px" }} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
    </>
  );
};

export default Notifications;