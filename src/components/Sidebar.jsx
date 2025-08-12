import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSidebar } from "../contexts/SidebarContext";
import {
  HiOutlineChartBar,
  HiOutlineUsers,
  HiOutlineTrash,
  HiOutlineCog,
  HiOutlineOfficeBuilding,
  HiOutlineHome,
  HiOutlineCalendar,
  HiOutlineClock,
  HiOutlineLogout,
  HiOutlineBell,
  HiOutlineClipboardList,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
} from "react-icons/hi";

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isCollapsed, isMobile, isMobileOpen, toggleSidebar, closeMobileSidebar, sidebarWidth } = useSidebar();
  const [hoveredItem, setHoveredItem] = useState(null);

  // Clear hover state when location changes
  useEffect(() => {
    setHoveredItem(null);
  }, [location.pathname]);

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
    }
  };

  const menuItems = [
    {
      title: "Danh sách báo cáo",
      path: "/report-management",
      icon: HiOutlineChartBar,
    },
    {
      title: "Danh sách nhân viên",
      path: "/user-management",
      icon: HiOutlineUsers,
    },
    {
      title: "Danh sách thùng rác",
      path: "/trash",
      icon: HiOutlineTrash,
    },
    {
      title: "Quản lý công việc",
      path: "/assignments",
      icon: HiOutlineClipboardList,
    },
    {
      title: "Các tầng",
      path: "/floors",
      icon: HiOutlineOfficeBuilding,
    },
          {
        title: "Khu vực",
        path: "/areas",
        icon: HiOutlineOfficeBuilding,
      },
    {
      title: "Nhà vệ sinh",
      path: "/restrooms",
      icon: HiOutlineHome,
    },
    {
      title: "Lịch trình",
      path: "/schedules",
      icon: HiOutlineCalendar,
    },
    {
      title: "Ca làm việc",
      path: "/shifts",
      icon: HiOutlineClock,
    },
    {
      title: "Đơn nghỉ phép",
      path: "/leaves",
      icon: HiOutlineDocumentText,
    },
    {
      title: "Điểm danh",
      path: "/attendance",
      icon: HiOutlineUserGroup,
    },
  ];

  return (
    <div
      style={{
        position: "fixed",
        left: isMobile ? (isMobileOpen ? 0 : "-200px") : 0,
        top: 0,
        width: `${sidebarWidth}px`,
        height: "100vh",
        backgroundColor: "white",
        borderRight: "1px solid #e5e7eb",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
        transition: "all 0.3s ease",
        overflow: "hidden",
      }}
    >
      {/* Header với toggle button, MSWT và Icon thông báo */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: isCollapsed ? "center" : "space-between",
        padding: isCollapsed ? "18px 8px" : "18px 16px",
        borderBottom: "2px solid #f1f5f9",
        backgroundColor: "white",
        transition: "all 0.3s ease",
        flexWrap: "nowrap",
        minHeight: "70px"
      }}>
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          style={{
            background: "transparent",
            border: "none",
            padding: "8px",
            borderRadius: "6px",
            cursor: "pointer",
            color: "#6b7280",
            transition: "all 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginRight: isCollapsed ? 0 : "12px",
            order: isCollapsed ? 0 : -1
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#f3f4f6";
            e.target.style.color = "#FF5B27";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = "#6b7280";
          }}
        >
          <HiOutlineMenu style={{ width: "20px", height: "20px" }} />
        </button>

        {/* MSWT Logo */}
        {!isCollapsed && (
          <div 
            onClick={() => navigate('/dashboard')}
            style={{
              fontSize: "24px",
              fontWeight: "800",
              color: "#FF5B27",
              cursor: "pointer",
              letterSpacing: "1px",
              textShadow: "0 2px 4px rgba(255, 91, 39, 0.2)",
              transition: "all 0.3s ease",
              opacity: isCollapsed ? 0 : 1,
              transform: isCollapsed ? "scale(0)" : "scale(1)",
              whiteSpace: "nowrap"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.05)";
              e.target.style.textShadow = "0 4px 8px rgba(255, 91, 39, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.textShadow = "0 2px 4px rgba(255, 91, 39, 0.2)";
            }}
          >
            MSWT
          </div>
        )}

        {/* Icon thông báo */}
        {!isCollapsed && (
          <div 
            onClick={() => navigate('/notifications')}
            style={{
              position: "relative",
              padding: "6px",
              backgroundColor: "#ffffff",
              borderRadius: "10px",
              cursor: "pointer",
              transition: "all 0.3s ease",
              border: "2px solid transparent",
              opacity: isCollapsed ? 0 : 1,
              transform: isCollapsed ? "scale(0)" : "scale(1)"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#FF5B27";
              e.target.style.borderColor = "#FF5B27";
              e.target.style.transform = "scale(1.1)";
              e.target.style.boxShadow = "0 4px 12px rgba(255, 91, 39, 0.3)";
              // Change icon color to white on hover
              const icon = e.target.querySelector('svg');
              if (icon) icon.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#ffffff";
              e.target.style.borderColor = "transparent";
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "none";
              // Reset icon color
              const icon = e.target.querySelector('svg');
              if (icon) icon.style.color = "#FF5B27";
            }}
          >
            <HiOutlineBell 
              style={{ 
                width: "20px", 
                height: "20px", 
                color: "#FF5B27",
                transition: "color 0.3s ease"
              }} 
            />
            {/* Badge cho số thông báo chưa đọc */}
            <div style={{
              position: "absolute",
              top: "3px",
              right: "3px",
              width: "6px",
              height: "6px",
              backgroundColor: "#ef4444",
              borderRadius: "50%",
              border: "1px solid white"
            }} />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ 
        flex: 1, 
        padding: isCollapsed ? "0 8px" : "0 16px", 
        marginTop: "10px",
        transition: "padding 0.3s ease"
      }}>
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            gap: "4px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {menuItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            const isHovered = hoveredItem === index && !isActive;
            const Icon = item.icon;

            return (
              <li
                key={index}
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  position: "relative",
                }}
              >
                <Link
                  to={item.path}
                  onClick={isMobile ? closeMobileSidebar : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isCollapsed ? "center" : "flex-start",
                    padding: isCollapsed ? "10px 8px" : "10px 14px",
                    fontSize: "12px",
                    fontWeight: "500",
                    borderRadius: "6px",
                    textDecoration: "none",
                    transition: "all 0.2s",
                    backgroundColor: isActive ? "#d1d5db" : (isHovered ? "#f3f4f6" : "transparent"),
                    color: "#000000",
                    marginBottom: "1px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                  onMouseEnter={() => setHoveredItem(index)}
                  onMouseLeave={() => setHoveredItem(null)}
                  title={isCollapsed ? item.title : ""}
                >
                  <Icon
                    style={{
                      width: "18px",
                      height: "16px",
                      marginRight: isCollapsed ? 0 : "10px",
                      color: "#000000",
                      flexShrink: 0,
                      transition: "margin-right 0.3s ease"
                    }}
                  />
                  {!isCollapsed && (
                    <span style={{
                      opacity: isCollapsed ? 0 : 1,
                      transform: isCollapsed ? "translateX(-10px)" : "translateX(0)",
                      transition: "all 0.3s ease",
                      whiteSpace: "nowrap"
                    }}>
                      {item.title}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div
        style={{
          padding: isCollapsed ? "18px 8px" : "18px 16px",
          borderTop: "1px solid #e5e7eb",
          marginTop: "auto",
          transition: "padding 0.3s ease"
        }}
      >
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: isCollapsed ? "center" : "flex-start",
          marginBottom: isCollapsed ? "8px" : "12px",
          transition: "all 0.3s ease"
        }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              backgroundColor: "#3b82f6",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            <span
              style={{
                color: "white",
                fontWeight: "500",
                fontSize: "14px",
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          {!isCollapsed && (
            <div style={{ 
              marginLeft: "10px",
              opacity: isCollapsed ? 0 : 1,
              transform: isCollapsed ? "translateX(-10px)" : "translateX(0)",
              transition: "all 0.3s ease",
              overflow: "hidden"
            }}>
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#000000",
                  margin: 0,
                  marginBottom: "2px",
                  whiteSpace: "nowrap"
                }}
              >
                {user?.fullName || user?.username || 'User'}
              </p>
              <p
                style={{
                  fontSize: "11px",
                  color: "#6b7280",
                  margin: 0,
                  marginBottom: "1px",
                  whiteSpace: "nowrap"
                }}
              >
                {user?.position || user?.role || 'User'}
              </p>
              {user?.email && (
                <p
                  style={{
                    fontSize: "9px",
                    color: "#9ca3af",
                    margin: 0,
                    whiteSpace: "nowrap"
                  }}
                >
                  {user.email}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "flex-start",
            width: "100%",
            padding: isCollapsed ? "10px 8px" : "10px 12px",
            fontSize: "13px",
            fontWeight: "500",
            borderRadius: "6px",
            border: "none",
            backgroundColor: "transparent",
            color: "#dc2626",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#fef2f2";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
          }}
          title={isCollapsed ? "Đăng xuất" : ""}
        >
          <HiOutlineLogout
            style={{
              width: "18px",
              height: "18px",
              marginRight: isCollapsed ? 0 : "10px",
              flexShrink: 0,
              transition: "margin-right 0.3s ease"
            }}
          />
          {!isCollapsed && (
            <span style={{
              opacity: isCollapsed ? 0 : 1,
              transform: isCollapsed ? "translateX(-10px)" : "translateX(0)",
              transition: "all 0.3s ease",
              whiteSpace: "nowrap"
            }}>
              Đăng xuất
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
