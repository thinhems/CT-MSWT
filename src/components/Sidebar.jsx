import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSidebar } from "../contexts/SidebarContext";
import { useRequests } from "../hooks/useRequest";
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
  HiChevronDown,
  HiChevronRight,
  HiOutlineEmojiHappy,
  HiOutlineFolder,
} from "react-icons/hi";

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { isCollapsed, isMobile, isMobileOpen, toggleSidebar, closeMobileSidebar, sidebarWidth } = useSidebar();
  const [hoveredItem, setHoveredItem] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState({});
  
  // Fetch requests for notification badge
  const { requests } = useRequests();
  const pendingRequestsCount = requests?.filter(request => 
    request.status === 'Đã gửi' || 
    request.status === 'da gui'
  ).length || 0;

  // Clear hover state when location changes
  useEffect(() => {
    setHoveredItem(null);
  }, [location.pathname]);



  // Collapse all menus when sidebar is collapsed
  useEffect(() => {
    if (isCollapsed) {
      setExpandedMenus({});
    }
  }, [isCollapsed]);

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      logout();
    }
  };

  const toggleDropdown = (menuKey) => {
    // Nếu sidebar đang collapsed, mở rộng sidebar và mở dropdown tương ứng
    if (isCollapsed) {
      console.log('Menu item clicked while collapsed, expanding sidebar and opening dropdown');
      toggleSidebar();
      
      // Delay một chút để sidebar mở rộng xong rồi mới mở dropdown
      setTimeout(() => {
        setExpandedMenus(prev => ({
          ...prev,
          [menuKey]: true
        }));
      }, 100);
      return;
    }
    
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const menuItems = [
    {
      key: "personnel",
      title: "Quản lý nhân sự",
      icon: HiOutlineUsers,
      isDropdown: true,
      children: [
        {
          title: "Danh sách nhân viên",
          path: "/user-management",
          icon: HiOutlineUsers,
        },
        {
          title: "Nhóm nhân viên",
          path: "/worker-group-management",
          icon: HiOutlineUserGroup,
        },
        {
          title: "Điểm danh",
          path: "/attendance",
          icon: HiOutlineUserGroup,
        },
        {
          title: "Nghỉ phép",
          path: "/leaves",
          icon: HiOutlineDocumentText,
        },
      ]
    },
    {
      key: "facility",
      title: "Quản lý cơ sở",
      icon: HiOutlineOfficeBuilding,
      isDropdown: true,
      children: [
        {
          title: "Quản lý tòa",
          path: "/buildings",
          icon: HiOutlineOfficeBuilding,
        },
        {
          title: "Quản lý khu vực",
          path: "/areas",
          icon: HiOutlineFolder,
        },
        {
          title: "Quản lý phòng",
          path: "/rooms",
          icon: HiOutlineHome,
        },
        
        {
          title: "Danh sách thùng rác",
          path: "/trash",
          icon: HiOutlineTrash,
        },
      ]
    },
    {
      key: "schedule",
      title: "Quản lý lịch",
      icon: HiOutlineCalendar,
      isDropdown: true,
      children: [
        {
          title: "Lịch làm việc",
          path: "/schedules",
          icon: HiOutlineCalendar,
        },
        {
          title: "Quản lý công việc",
          path: "/assignments",
          icon: HiOutlineClipboardList,
        },
        {
          title: "Nhóm công việc",
          path: "/group-assignment",
          icon: HiOutlineUserGroup,
        },
        {
          title: "Ca làm việc",
          path: "/shifts",
          icon: HiOutlineClock,
        },
        
      ]
    },
    {
      key: "others",
      title: "Khác",
      icon: HiOutlineCog,
      isDropdown: true,
      children: [
        {
          title: "Yêu cầu",
          path: "/request-management",
          icon: HiOutlineClipboardList,
          hasNotification: true,
        },
        {
          title: "Báo cáo",
          path: "/report-management",
          icon: HiOutlineChartBar,
        },
      ]
    },
  ];

  // Auto-expand menu if it contains active page
  useEffect(() => {
    const newExpandedMenus = {};
    menuItems.forEach(item => {
      if (item.children?.some(child => location.pathname === child.path)) {
        newExpandedMenus[item.key] = true;
      }
    });
    
    if (Object.keys(newExpandedMenus).length > 0) {
      setExpandedMenus(prev => ({
        ...prev,
        ...newExpandedMenus
      }));
    }
  }, [location.pathname]);

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
        padding: isCollapsed ? "12px 5px" : "12px 10px",
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        transition: "all 0.3s ease",
        flexWrap: "nowrap",
        minHeight: "56px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)"
      }}>
        {/* Toggle Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Sidebar toggle button clicked', { isCollapsed, isMobile });
            toggleSidebar();
          }}
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
            order: isCollapsed ? 0 : -1,
            position: "relative",
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#f3f4f6";
            e.target.style.color = "#FF5B27";
            e.target.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = "#6b7280";
            e.target.style.transform = "scale(1)";
          }}
          title={isCollapsed ? "Mở rộng sidebar" : "Thu nhỏ sidebar"}
        >
          <HiOutlineMenu style={{ width: "20px", height: "20px" }} />
        </button>

        {/* MSWT Logo */}
        {!isCollapsed && (
          <div 
            onClick={() => navigate('/dashboard')}
            style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#FF5B27",
              cursor: "pointer",
              letterSpacing: "0.5px",
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
        padding: isCollapsed ? "0 5px" : "0 10px", 
        marginTop: "8px",
        transition: "padding 0.3s ease",
        overflowY: "auto",
        overflowX: "hidden"
      }}>
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: "4px 0",
            gap: "2px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {menuItems.map((item, index) => {
            const isExpanded = expandedMenus[item.key];
            const Icon = item.icon;
            const isHovered = hoveredItem === `main-${index}`;
            
            // Check if any child is active
            const hasActiveChild = item.children?.some(child => location.pathname === child.path);

            return (
              <li
                key={item.key}
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  position: "relative",
                }}
              >
                {/* Parent Menu Item */}
                <div
                  onClick={() => toggleDropdown(item.key)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isCollapsed ? "center" : "space-between",
                    padding: isCollapsed ? "8px 5px" : "8px 10px",
                    fontSize: "12px",
                    fontWeight: "600",
                    borderRadius: "6px",
                    textDecoration: "none",
                    transition: "all 0.2s ease",
                    backgroundColor: hasActiveChild ? "#ff5b27" : (isHovered ? (isCollapsed ? "#fff3f0" : "#f8fafc") : "transparent"),
                    color: hasActiveChild ? "white" : "#374151",
                    marginBottom: "1px",
                    cursor: "pointer",
                    position: "relative",
                    border: isHovered && !hasActiveChild ? (isCollapsed ? "1px solid #ff5b27" : "1px solid #e5e7eb") : "1px solid transparent",
                    boxShadow: hasActiveChild ? "0 1px 3px rgba(255, 91, 39, 0.2)" : (isHovered && isCollapsed ? "0 2px 8px rgba(255, 91, 39, 0.15)" : "none"),
                    transform: isHovered && isCollapsed ? "scale(1.05)" : "scale(1)",
                  }}
                  onMouseEnter={() => setHoveredItem(`main-${index}`)}
                  onMouseLeave={() => setHoveredItem(null)}
                  title={isCollapsed ? `${item.title} - Click để mở rộng` : item.title}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <Icon
                      style={{
                        width: "16px",
                        height: "16px",
                        marginRight: isCollapsed ? 0 : "8px",
                        color: hasActiveChild ? "white" : "#6b7280",
                        flexShrink: 0,
                        transition: "all 0.3s ease"
                      }}
                    />
                    {!isCollapsed && (
                      <span style={{
                        opacity: isCollapsed ? 0 : 1,
                        transform: isCollapsed ? "translateX(-10px)" : "translateX(0)",
                        transition: "all 0.3s ease",
                        whiteSpace: "nowrap",
                        fontWeight: "600",
                        letterSpacing: "0.25px"
                      }}>
                        {item.title}
                      </span>
                    )}
                  </div>
                  
                  {/* Dropdown Arrow */}
                  {!isCollapsed && (
                    <div style={{
                      transition: "transform 0.3s ease",
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                      padding: "2px",
                    }}>
                      <HiChevronRight style={{ 
                        width: "14px", 
                        height: "14px", 
                        color: hasActiveChild ? "white" : "#9ca3af",
                        transition: "color 0.3s ease"
                      }} />
                    </div>
                  )}
                </div>

                {/* Dropdown Children */}
                {!isCollapsed && isExpanded && (
                  <ul style={{
                    listStyle: "none",
                    margin: 0,
                    padding: "2px 0",
                    paddingLeft: "10px",
                    backgroundColor: "#ffffff",
                    borderRadius: "0 0 6px 6px",
                    overflow: "hidden",
                    animation: "slideDown 0.3s ease",
                    maxHeight: "250px",
                    border: "1px solid #f1f5f9",
                    borderTop: "none",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                  }}>
                    {item.children.map((child, childIndex) => {
                      const isActive = location.pathname === child.path;
                      const isChildHovered = hoveredItem === `child-${index}-${childIndex}`;
                      const ChildIcon = child.icon;

                      return (
                        <li key={childIndex} style={{ listStyle: "none", margin: 0, padding: 0 }}>
                          <Link
                            to={child.path}
                            onClick={isMobile ? closeMobileSidebar : undefined}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              padding: "6px 10px",
                              fontSize: "11px",
                              fontWeight: "500",
                              borderRadius: "4px",
                              textDecoration: "none",
                              transition: "all 0.2s ease",
                              backgroundColor: isActive ? "#ff5b27" : (isChildHovered ? "#f8fafc" : "transparent"),
                              color: isActive ? "white" : "#64748b",
                              margin: "1px 6px 1px 14px",
                              position: "relative",
                              border: isActive ? "none" : (isChildHovered ? "1px solid #e2e8f0" : "1px solid transparent"),
                              boxShadow: isActive ? "0 1px 3px rgba(255, 91, 39, 0.2)" : "none",
                            }}
                            onMouseEnter={() => setHoveredItem(`child-${index}-${childIndex}`)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <ChildIcon
                              style={{
                                width: "14px",
                                height: "14px",
                                marginRight: "8px",
                                color: isActive ? "white" : "#9ca3af",
                                flexShrink: 0,
                                transition: "color 0.2s ease",
                              }}
                            />
                            <span style={{ 
                              whiteSpace: "nowrap",
                              fontWeight: isActive ? "600" : "500",
                              letterSpacing: "0.1px"
                            }}>
                              {child.title}
                            </span>
                            
                            {/* Notification badge for "Yêu cầu" */}
                            {child.hasNotification && pendingRequestsCount > 0 && (
                              <div style={{
                                position: "absolute",
                                top: "4px",
                                right: "4px",
                                minWidth: "16px",
                                height: "16px",
                                backgroundColor: "#ef4444",
                                borderRadius: "8px",
                                border: "1px solid white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "9px",
                                fontWeight: "600",
                                color: "white",
                                padding: "0 3px",
                                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)"
                              }}>
                                {pendingRequestsCount > 99 ? "99+" : pendingRequestsCount}
                              </div>
                            )}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div
        style={{
          padding: isCollapsed ? "12px 5px" : "12px 10px",
          borderTop: "1px solid #e5e7eb",
          marginTop: "auto",
          transition: "padding 0.3s ease",
          backgroundColor: "#fafafa",
          boxShadow: "0 -1px 3px rgba(0, 0, 0, 0.05)"
        }}
      >
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: isCollapsed ? "center" : "flex-start",
          marginBottom: isCollapsed ? "6px" : "8px",
          transition: "all 0.3s ease"
        }}>
          <div
            style={{
              width: "32px",
              height: "32px",
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
                fontSize: "12px",
              }}
            >
              {user?.username?.charAt(0).toUpperCase() || user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          {!isCollapsed && (
            <div style={{ 
              marginLeft: "8px",
              opacity: isCollapsed ? 0 : 1,
              transform: isCollapsed ? "translateX(-10px)" : "translateX(0)",
              transition: "all 0.3s ease",
              overflow: "hidden"
            }}>
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: "500",
                  color: "#000000",
                  margin: 0,
                  marginBottom: "1px",
                  whiteSpace: "nowrap"
                }}
              >
                {user?.fullName || user?.username || 'User'}
              </p>
              <p
                style={{
                  fontSize: "9px",
                  color: "#6b7280",
                  margin: 0,
                  whiteSpace: "nowrap"
                }}
              >
                {user?.position || user?.role || 'User'}
              </p>
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
            padding: isCollapsed ? "6px 5px" : "6px 7px",
            fontSize: "11px",
            fontWeight: "500",
            borderRadius: "4px",
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
              width: "14px",
              height: "14px",
              marginRight: isCollapsed ? 0 : "6px",
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
