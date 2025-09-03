import { useState, useEffect } from "react";
import { HiOutlineSearch, HiOutlinePlus, HiX, HiOutlineArrowLeft, HiOutlineRefresh } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import GroupTable from "../components/GroupTable";
import Pagination from "../components/Pagination";
import Notification from "../components/Notification";
import { useWorkerGroup } from "../hooks/useWorkerGroup";
import { authService } from "../services/authService";
import { useUsers } from "../hooks/useUsers";

const GroupManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddGroupPopup, setShowAddGroupPopup] = useState(false);
  const [showViewGroupModal, setShowViewGroupModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  const itemsPerPage = 5; // Số nhóm hiển thị mỗi trang

  // Sử dụng hook để quản lý nhóm làm việc
  const { 
    groups, 
    loading, 
    error, 
    fetchGroups, 
    deleteGroup,
    fetchAllMembers,
    getGroupById
  } = useWorkerGroup();

  // Sử dụng hook để lấy thông tin users (có roleId)
  const { users } = useUsers();

  // Show notification helper
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleActionClick = async ({ action, group }) => {
    if (action === 'view') {
      setSelectedGroup(group);
      setShowViewGroupModal(true);
      
      setLoadingMembers(true);
      try {
        // First check if the group already has members data from the get-all API
        if (group.members && group.members.length > 0) {
          setGroupMembers(group.members);
        } else {
          // Try to get detailed group info 
          const detailedGroup = await getGroupById(group.workerGroupId);
          
          if (detailedGroup && detailedGroup.members) {
            setGroupMembers(detailedGroup.members);
          } else {
            // No members found
            setGroupMembers([]);
          }
        }
      } catch (err) {
        console.error('Error fetching group members:', err);
        setGroupMembers([]);
      } finally {
        setLoadingMembers(false);
      }
    } else if (action === 'edit') {
      showNotification("🔧 Tính năng chỉnh sửa nhóm đang được phát triển!", "info");
    } else if (action === 'delete') {
      if (window.confirm(`Bạn có chắc chắn muốn xóa nhóm "${group.workerGroupName}"?`)) {
        const success = await deleteGroup(group.workerGroupId);
        if (success) {
          showNotification(`✅ Đã xóa nhóm "${group.workerGroupName}" thành công!`, "success");
        } else {
          showNotification("❌ Không thể xóa nhóm. Vui lòng thử lại!", "error");
        }
      }
    }
  };

  const handleCloseViewModal = () => {
    setShowViewGroupModal(false);
    setSelectedGroup(null);
    setGroupMembers([]);
    setLoadingMembers(false);
  };

  const handleAddGroup = () => {
    setShowAddGroupPopup(true);
  };

  const handleClosePopup = () => {
    setShowAddGroupPopup(false);
  };

  // Filter groups based on search term
  const filteredGroups = groups.filter(group => {
    if (!searchTerm) return true;
    
    return (
      group.workerGroupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.workerGroupId?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Tính toán pagination
  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentGroups = filteredGroups.slice(startIndex, endIndex);

  // Reset về trang 1 khi search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Show error notification when API fails
  useEffect(() => {
    if (error) {
      showNotification(`❌ Lỗi: ${error}`, "error");
    }
  }, [error]);

  return (
    <div style={{ backgroundColor: "#ffffff", height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      {/* CSS for loading animation */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      
      {/* Notification */}
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ show: false, message: "", type: "" })}
        />
      )}

      <div style={{ padding: "16px", flex: "0 0 auto" }}>
        <div style={{ marginBottom: "16px" }}>
          <nav style={{ color: "#6b7280", fontSize: "14px" }}>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: "bold",
                color: "#111827",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "12px"
              }}
            >
              <button
                onClick={() => navigate('/user-management')}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  color: "#6b7280",
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
              >
                <HiOutlineArrowLeft style={{ width: "20px", height: "20px" }} />
              </button>
              Quản lý nhóm làm việc
            </h1>
            <span>Trang chủ</span>
            <span style={{ margin: "0 8px" }}>›</span>
            <span style={{ color: "#6b7280" }}>Quản lý người dùng</span>
            <span style={{ margin: "0 8px" }}>›</span>
            <span style={{ color: "#374151", fontWeight: "500" }}>
              Quản lý nhóm
            </span>
          </nav>
        </div>

        {/* Search and Add Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          {/* Search Box */}
          <div style={{ position: "relative", flex: "1" }}>
            <div
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }}
            >
              <HiOutlineSearch style={{ width: "20px", height: "20px" }} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm nhóm theo tên, trưởng nhóm, khu vực..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{
                width: "50%",
                padding: "12px 16px 12px 48px",
                border: "1px solid #d1d5db",
                borderRadius: "50px",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", marginLeft: "24px" }}>
            {/* Refresh Button */}
            <button
              onClick={fetchGroups}
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#10B981",
                color: "white",
                padding: "12px 20px",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background-color 0.2s",
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) e.target.style.backgroundColor = "#059669";
              }}
              onMouseLeave={(e) => {
                if (!loading) e.target.style.backgroundColor = "#10B981";
              }}
            >
                             <HiOutlineRefresh 
                 style={{ 
                   width: "16px", 
                   height: "16px",
                   animation: loading ? "spin 1s linear infinite" : "none"
                 }} 
               />
              {loading ? "Đang tải..." : "Làm mới"}
            </button>

            {/* Add Group Button */}
            <button
              onClick={handleAddGroup}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#3B82F6",
                color: "white",
                padding: "12px 20px",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#2563EB")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#3B82F6")}
            >
              <HiOutlinePlus style={{ width: "16px", height: "16px" }} />
              Thêm nhóm mới
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            backgroundColor: "#FEF2F2",
            border: "1px solid #FECACA",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            <div style={{ fontSize: "20px" }}>⚠️</div>
            <div style={{ color: "#DC2626", fontSize: "14px" }}>
              {error}
            </div>
            <button
              onClick={() => fetchGroups()}
              style={{
                marginLeft: "auto",
                padding: "8px 16px",
                backgroundColor: "#DC2626",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontSize: "12px",
                cursor: "pointer"
              }}
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Stats */}
        <div style={{ 
          display: "flex", 
          gap: "16px", 
          marginBottom: "20px",
          flexWrap: "wrap" 
        }}>
          <div style={{
            backgroundColor: "#F0F9FF",
            border: "1px solid #BAE6FD",
            borderRadius: "8px",
            padding: "12px 16px",
            minWidth: "150px"
          }}>
            <div style={{ fontSize: "12px", color: "#0369A1", fontWeight: "500" }}>
              Tổng số nhóm
            </div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#0C4A6E" }}>
              {loading ? "..." : groups.length}
            </div>
          </div>
          
          <div style={{
            backgroundColor: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderRadius: "8px",
            padding: "12px 16px",
            minWidth: "150px"
          }}>
            <div style={{ fontSize: "12px", color: "#15803D", fontWeight: "500" }}>
              Nhóm hoạt động
            </div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#14532D" }}>
              {loading ? "..." : groups.length}
            </div>
          </div>

          <div style={{
            backgroundColor: "#FFFBEB",
            border: "1px solid #FED7AA",
            borderRadius: "8px",
            padding: "12px 16px",
            minWidth: "150px"
          }}>
            <div style={{ fontSize: "12px", color: "#EA580C", fontWeight: "500" }}>
              Ngày tạo mới nhất
            </div>
            <div style={{ fontSize: "20px", fontWeight: "bold", color: "#9A3412" }}>
              {loading ? "..." : groups.length > 0 ? new Date(Math.max(...groups.map(g => new Date(g.createdAt)))).toLocaleDateString('vi-VN') : "N/A"}
            </div>
          </div>
        </div>
      </div>

      {/* Group Table Container */}
      <div style={{ flex: "0 0 auto" }}>
        {loading ? (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "60px 20px",
            color: "#6b7280"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>⏳</div>
              <div style={{ fontSize: "16px", fontWeight: "500" }}>Đang tải dữ liệu nhóm...</div>
            </div>
          </div>
        ) : groups.length === 0 ? (
          <div style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "60px 20px",
            color: "#6b7280"
          }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>📭</div>
              <div style={{ fontSize: "16px", fontWeight: "500" }}>Không có nhóm nào</div>
              <div style={{ fontSize: "14px", marginTop: "8px" }}>
                Hãy tạo nhóm đầu tiên hoặc kiểm tra kết nối API
              </div>
            </div>
          </div>
        ) : (
          <GroupTable groups={currentGroups} onActionClick={handleActionClick} />
        )}
      </div>

      {/* Pagination */}
      {!loading && groups.length > 0 && (
        <div style={{ flex: "0 0 auto", padding: "16px" }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add Group Popup */}
      {showAddGroupPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={handleClosePopup}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "500px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#111827",
                  margin: 0,
                }}
              >
                Thêm nhóm mới
              </h2>
              <button
                onClick={handleClosePopup}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  color: "#6b7280",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#f3f4f6")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
              >
                <HiX style={{ width: "24px", height: "24px" }} />
              </button>
            </div>

            <div style={{ 
              textAlign: "center", 
              padding: "40px", 
              color: "#6b7280" 
            }}>
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>🚧</div>
              <h3 style={{ margin: "0 0 8px 0", color: "#374151" }}>
                Tính năng đang phát triển
              </h3>
              <p style={{ margin: 0 }}>
                Chức năng thêm nhóm mới sẽ sớm được cập nhật!
              </p>
            </div>

            <div style={{ textAlign: "right", marginTop: "24px" }}>
              <button
                onClick={handleClosePopup}
                style={{
                  padding: "12px 24px",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  backgroundColor: "#6b7280",
                  color: "white",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#4b5563")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#6b7280")}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Group Modal */}
      {showViewGroupModal && selectedGroup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={handleCloseViewModal}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "600px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#111827",
                  margin: 0,
                }}
              >
                Chi tiết nhóm: {selectedGroup.workerGroupName}
              </h2>
              <button
                onClick={handleCloseViewModal}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  color: "#6b7280",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#f3f4f6")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
              >
                <HiX style={{ width: "24px", height: "24px" }} />
              </button>
            </div>

            {/* Group Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              
              {/* Basic Info */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ fontSize: "14px", fontWeight: "500", color: "#6b7280" }}>
                    ID Nhóm
                  </label>
                  <p style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: "4px 0 0 0" }}>
                    {selectedGroup.workerGroupId}
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: "14px", fontWeight: "500", color: "#6b7280" }}>
                    Mô tả
                  </label>
                  <p style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: "4px 0 0 0" }}>
                    {selectedGroup.description || "Không có mô tả"}
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: "14px", fontWeight: "500", color: "#6b7280" }}>
                    Ngày tạo
                  </label>
                  <p style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: "4px 0 0 0" }}>
                    {new Date(selectedGroup.createdAt).toLocaleDateString('vi-VN')}
                  </p>
                </div>

                <div>
                  <label style={{ fontSize: "14px", fontWeight: "500", color: "#6b7280" }}>
                    Trạng thái
                  </label>
                  <p style={{ fontSize: "16px", fontWeight: "600", margin: "4px 0 0 0" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        padding: "4px 12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        borderRadius: "9999px",
                        backgroundColor: "#dcfce7",
                        color: "#15803d",
                      }}
                    >
                      Hoạt động
                    </span>
                  </p>
                </div>
              </div>

              {/* Group Members */}
              <div>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#6b7280" }}>
                  Danh sách thành viên ({groupMembers.length})
                </label>
                {loadingMembers ? (
                  <div style={{ 
                    marginTop: "8px",
                    padding: "32px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "14px", color: "#6b7280" }}>
                      Đang tải danh sách thành viên...
                    </div>
                  </div>
                ) : groupMembers.length > 0 ? (
                  <div style={{ 
                    marginTop: "8px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    overflow: "hidden"
                  }}>
                    {groupMembers.map((member, index) => (
                      <div key={member.workGroupMemberId || index} style={{
                        padding: "16px",
                        borderBottom: index < groupMembers.length - 1 ? "1px solid #e2e8f0" : "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        backgroundColor: "white"
                      }}>
                        {/* Avatar */}
                        <div style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundColor: "#FF5B27",
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "16px",
                          fontWeight: "600",
                          flexShrink: 0
                        }}>
                          {member.fullName ? member.fullName.charAt(0).toUpperCase() : member.name ? member.name.charAt(0).toUpperCase() : "?"}
                        </div>
                        
                        {/* Member Info */}
                        <div style={{ flex: 1 }}>
                          <div style={{ 
                            fontWeight: "600", 
                            color: "#111827", 
                            marginBottom: "4px",
                            fontSize: "14px"
                          }}>
                            {member.fullName || member.name || "Không có tên"}
                          </div>
                          <div style={{ 
                            color: "#6b7280", 
                            fontSize: "12px",
                            marginBottom: "2px"
                          }}>
                            Vai trò: {(() => {
                              // If API returns roleName directly, use it
                              if (member.roleName) {
                                // Map English role names to Vietnamese
                                const roleMap = {
                                  'Leader': 'Quản trị hệ thống',
                                  'Manager': 'Quản lý cấp cao',
                                  'Supervisor': 'Giám sát viên ',
                                  'Worker': 'Nhân viên vệ sinh'
                                };
                                return roleMap[member.roleName] || member.roleName;
                              }
                              // Otherwise use roleId with mapping
                              if (member.roleId) {
                                return authService.mapRoleIdToRoleName(member.roleId);
                              }
                              // Fallback
                              return "Nhân viên vệ sinh";
                            })()}
                          </div>
                          {member.userEmail && (
                            <div style={{ 
                              color: "#6b7280", 
                              fontSize: "12px"
                            }}>
                              📧 {member.userEmail}
                            </div>
                          )}
                        </div>
                        
                        {/* Status Badge */}
                        <div style={{
                          padding: "4px 8px",
                          borderRadius: "12px",
                          fontSize: "11px",
                          fontWeight: "600",
                          backgroundColor: member.leftAt ? "#fee2e2" : "#dcfce7",
                          color: member.leftAt ? "#dc2626" : "#15803d"
                        }}>
                          {member.leftAt ? "Đã rời" : "Hoạt động"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ 
                    marginTop: "8px",
                    padding: "32px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    textAlign: "center"
                  }}>
                    <div style={{ fontSize: "48px", marginBottom: "12px" }}>👥</div>
                    <div style={{ 
                      fontSize: "14px", 
                      color: "#6b7280",
                      fontWeight: "500"
                    }}>
                      Nhóm này chưa có thành viên
                    </div>
                    <div style={{ 
                      fontSize: "12px", 
                      color: "#9ca3af",
                      marginTop: "4px"
                    }}>
                      Hãy thêm thành viên vào nhóm để bắt đầu làm việc
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Close Button */}
            <div style={{ textAlign: "right", marginTop: "24px" }}>
              <button
                onClick={handleCloseViewModal}
                style={{
                  padding: "12px 24px",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  backgroundColor: "#6b7280",
                  color: "white",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = "#4b5563")}
                onMouseLeave={(e) => (e.target.style.backgroundColor = "#6b7280")}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupManagement;

