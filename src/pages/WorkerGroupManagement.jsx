import React, { useState, useEffect } from "react";
import { HiOutlineSearch, HiOutlinePlus, HiX, HiOutlineRefresh, HiOutlineArrowLeft, HiOutlineEye, HiOutlineUserGroup } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import Notification from "../components/Notification";
import Pagination from "../components/Pagination";
import WorkerGroupTable from "../components/WorkerGroupTable";
import { useWorkerGroup } from "../hooks/useWorkerGroup";
import { useUsers } from "../hooks/useUsers";
import MultiSelectDropdown from "../components/common/MultiSelectDropdown";

const WorkerGroupManagement = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all"); // "all", "active", "inactive"
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newGroup, setNewGroup] = useState({
    groupName: "",
    description: "",
    status: "Hoạt động",
    selectedMembers: []
  });

  const itemsPerPage = 5;

  const {
    groups: workerGroups,
    loading: isLoading,
    error,
    fetchGroups
  } = useWorkerGroup();

  const { users } = useUsers();

  // Sử dụng dữ liệu từ API
  const displayData = workerGroups || [];
  


  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleActionClick = ({ action, group }) => {
    if (action === 'view') {
      setSelectedGroup(group);
      setShowViewModal(true);
    } else if (action === 'edit') {
      setEditingGroup({
        groupId: group.workerGroupId,
        groupName: group.workerGroupName,
        description: group.description || "",
        status: group.status || "Hoạt động",
        selectedMembers: group.members ? group.members.map(member => ({
          value: member.userId,
          label: member.userName,
          subtitle: `${member.roleId || 'Không có vai trò'} - ${member.userEmail}`,
          avatar: null
        })) : []
      });
      setShowEditModal(true);
    }
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedGroup(null);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingGroup(null);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewGroup({
      groupName: "",
      description: "",
      status: "Hoạt động",
      selectedMembers: []
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGroup(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMembersChange = (selectedMembers) => {
    setNewGroup(prev => ({
      ...prev,
      selectedMembers
    }));
  };

  const handleEditMembersChange = (selectedMembers) => {
    setEditingGroup(prev => ({
      ...prev,
      selectedMembers
    }));
  };

  // Tạo danh sách options cho dropdown nhân viên
  const memberOptions = users.map(user => ({
    value: user.id,
    label: user.name,
    subtitle: `${user.position} - ${user.phone || 'Không có số điện thoại'}`,
    avatar: user.avatar
  }));

  const handleSubmitGroup = async (e) => {
    e.preventDefault();
    
    if (!newGroup.groupName.trim()) {
      showNotification("❌ Vui lòng nhập tên nhóm!", "error");
      return;
    }

    if (newGroup.selectedMembers.length === 0) {
      showNotification("❌ Vui lòng chọn ít nhất một nhân viên cho nhóm!", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // TODO: Implement create API call when available
      // await createWorkerGroup(newGroup);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showNotification("🎉 Đã tạo nhóm làm việc thành công!");
      handleCloseAddModal();
      
      // Refresh data
      if (fetchGroups) {
        fetchGroups();
      }
      
    } catch (error) {
      console.error('Error creating group:', error);
      showNotification("❌ Có lỗi xảy ra khi tạo nhóm!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEditGroup = async (e) => {
    e.preventDefault();
    
    if (!editingGroup.groupName.trim()) {
      showNotification("❌ Vui lòng nhập tên nhóm!", "error");
      return;
    }

    if (editingGroup.selectedMembers.length === 0) {
      showNotification("❌ Vui lòng chọn ít nhất một nhân viên cho nhóm!", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // TODO: Implement update API call when available
      // await updateWorkerGroup(editingGroup.groupId, editingGroup);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showNotification("🎉 Đã cập nhật nhóm làm việc thành công!");
      handleCloseEditModal();
      
      // Refresh data
      if (fetchGroups) {
        fetchGroups();
      }
      
    } catch (error) {
      console.error('Error updating group:', error);
      showNotification("❌ Có lỗi xảy ra khi cập nhật nhóm!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter groups based on active tab and search term
  const filteredGroups = displayData.filter(group => {
    // Tab filtering - Since API doesn't have status field, show all groups
    let tabFilter = true;
    
    // Search filtering
    if (!searchTerm) return true;
    
    return (
      group.workerGroupName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchTerm.toLowerCase())
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

  return (
    <div style={{ backgroundColor: "#ffffff", height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .spinning {
            animation: spin 1s linear infinite;
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
                 margin: 0,
               }}
             >
               Quản lý nhóm làm việc
             </h1>
            <span>Trang chủ</span>
            <span style={{ margin: "0 8px" }}>›</span>
            <span style={{ color: "#374151", fontWeight: "500" }}>
              Quản lý nhóm làm việc
            </span>
          </nav>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
            <button
              onClick={() => {
                setActiveTab("all");
                setCurrentPage(1);
              }}
              style={{
                padding: "12px 24px",
                border: "none",
                backgroundColor: "transparent",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                borderBottom: activeTab === "all" ? "2px solid #FF5B27" : "2px solid transparent",
                color: activeTab === "all" ? "#FF5B27" : "#6b7280",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== "all") {
                  e.target.style.color = "#374151";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "all") {
                  e.target.style.color = "#6b7280";
                }
              }}
            >
              Tất cả
            </button>
            <button
              onClick={() => {
                setActiveTab("active");
                setCurrentPage(1);
              }}
              style={{
                padding: "12px 24px",
                border: "none",
                backgroundColor: "transparent",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                borderBottom: activeTab === "active" ? "2px solid #FF5B27" : "2px solid transparent",
                color: activeTab === "active" ? "#FF5B27" : "#6b7280",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== "active") {
                  e.target.style.color = "#374151";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "active") {
                  e.target.style.color = "#6b7280";
                }
              }}
            >
              Hoạt động
            </button>
            <button
              onClick={() => {
                setActiveTab("inactive");
                setCurrentPage(1);
              }}
              style={{
                padding: "12px 24px",
                border: "none",
                backgroundColor: "transparent",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                borderBottom: activeTab === "inactive" ? "2px solid #FF5B27" : "2px solid transparent",
                color: activeTab === "inactive" ? "#FF5B27" : "#6b7280",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== "inactive") {
                  e.target.style.color = "#374151";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "inactive") {
                  e.target.style.color = "#6b7280";
                }
              }}
            >
              Tạm ngưng
            </button>
          </div>
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
              placeholder="Tìm nhóm làm việc"
              value={searchTerm}
              onChange={handleSearchChange}
              style={{
                width: "32%",
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
            {/* Add Group Button */}
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#FF5B27",
                color: "white",
                padding: "12px 20px",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#e04516")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#FF5B27")}
            >
              <HiOutlinePlus style={{ width: "20px", height: "20px" }} />
              Thêm nhóm làm việc
            </button>
          </div>
        </div>
      </div>

      {/* Loading and Error States */}
      {isLoading && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          color: "#6b7280"
        }}>
          <HiOutlineRefresh style={{ 
            width: "24px", 
            height: "24px", 
            marginRight: "8px",
            animation: "spin 1s linear infinite"
          }} />
          Đang tải dữ liệu từ API...
        </div>
      )}

      {error && (
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
          color: "#dc2626",
          backgroundColor: "#fef2f2",
          border: "1px solid #fecaca",
          borderRadius: "8px",
          margin: "0 16px 16px 16px"
        }}>
          ❌ Lỗi khi tải dữ liệu: {error}
          <button
            onClick={fetchGroups}
            style={{
              marginLeft: "12px",
              padding: "4px 8px",
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer"
            }}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Content Area */}
      <div style={{ flex: "0 0 auto" }}>
      

        

        {/* Groups Table */}
        <WorkerGroupTable 
          groups={currentGroups} 
          onActionClick={handleActionClick} 
        />
      </div>

      {/* Pagination */}
      <div style={{ flex: "0 0 auto", padding: "16px" }}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Group Modal */}
      {showAddModal && (
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
          onClick={handleCloseAddModal}
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
                Thêm nhóm làm việc mới
              </h2>
              <button
                onClick={handleCloseAddModal}
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

            {/* Form */}
            <form onSubmit={handleSubmitGroup}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Tên nhóm làm việc *
                </label>
                <input
                  type="text"
                  name="groupName"
                  value={newGroup.groupName}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập tên nhóm làm việc"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>
              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Chọn nhân viên *
                </label>
                <MultiSelectDropdown
                  options={memberOptions}
                  value={newGroup.selectedMembers}
                  onChange={handleMembersChange}
                  placeholder="Chọn nhân viên cho nhóm làm việc..."
                  style={{ width: "100%" }}
                />
                <div style={{ 
                  marginTop: "4px", 
                  fontSize: "12px", 
                  color: "#6b7280" 
                }}>
                  Đã chọn {newGroup.selectedMembers.length} nhân viên
                  {newGroup.selectedMembers.length > 0 && (
                    <div style={{ marginTop: "8px" }}>
                      <strong>Danh sách nhân viên:</strong>
                      <div style={{ 
                        marginTop: "4px", 
                        display: "flex", 
                        flexDirection: "column", 
                        gap: "4px" 
                      }}>
                        {newGroup.selectedMembers.map((member, index) => {
                          const user = users.find(u => u.id === member.value);
                          return (
                            <div key={member.value} style={{
                              padding: "6px 8px",
                              backgroundColor: "#f3f4f6",
                              borderRadius: "6px",
                              fontSize: "11px",
                              color: "#374151",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px"
                            }}>
                              <span style={{ fontWeight: "600", color: "#6b7280" }}>
                                {index + 1}.
                              </span>
                              <div style={{
                                width: "20px",
                                height: "20px",
                                borderRadius: "50%",
                                backgroundColor: "#e5e7eb",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "10px",
                                fontWeight: "600",
                                color: "#6b7280"
                              }}>
                                {member.label?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                              <span style={{ fontWeight: "500" }}>
                                {member.label}
                              </span>
                              <span style={{ color: "#6b7280" }}>
                                - {user?.position || 'Không xác định'}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>


              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={newGroup.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Nhập mô tả nhóm làm việc"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                    resize: "vertical",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={newGroup.status}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                    backgroundColor: "white",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                >
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Tạm ngưng">Tạm ngưng</option>
                </select>
              </div>

              
              {/* Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  style={{
                    padding: "12px 20px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    backgroundColor: "white",
                    color: "#374151",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#f9fafb")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "12px 20px",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    backgroundColor: isSubmitting ? "#9ca3af" : "#FF5B27",
                    color: "white",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    transition: "background-color 0.2s",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.target.style.backgroundColor = "#E04B1F";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.target.style.backgroundColor = "#FF5B27";
                    }
                  }}
                >
                  {isSubmitting ? "Đang tạo..." : `Thêm nhóm làm việc (${newGroup.selectedMembers.length} nhân viên)`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Group Modal */}
      {showViewModal && selectedGroup && (
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
                Chi tiết nhóm làm việc
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
              {/* Group Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                }}
              >
                <HiOutlineUserGroup
                  style={{ width: "24px", height: "24px", color: "#FF5B27" }}
                />
                <div>
                  <h4
                    style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}
                  >
                    {selectedGroup.workerGroupName}
                  </h4>
                  <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
                    ID: {selectedGroup.workerGroupId}
                  </p>
                </div>
              </div>

              {/* Group Details */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#6b7280",
                    }}
                  >
                    Số thành viên
                  </label>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#111827",
                      margin: "4px 0 0 0",
                    }}
                  >
                    {selectedGroup.members?.length || 0} người
                  </p>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#6b7280",
                    }}
                  >
                    Ngày tạo
                  </label>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#111827",
                      margin: "4px 0 0 0",
                    }}
                  >
                    {selectedGroup.createdAt ? new Date(selectedGroup.createdAt).toLocaleDateString('vi-VN') : "Không xác định"}
                  </p>
                </div>
              </div>

              {/* Description - Full width */}
              <div>
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#6b7280",
                  }}
                >
                  Mô tả
                </label>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#111827",
                    margin: "4px 0 0 0",
                    lineHeight: "1.5",
                  }}
                >
                  {selectedGroup.description || "Không có mô tả"}
                </p>
              </div>

              {/* Members List */}
              <div>
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#6b7280",
                  }}
                >
                  Danh sách nhân viên ({selectedGroup.members?.length || 0} người)
                </label>
                <div style={{ marginTop: "8px" }}>
                  {selectedGroup.members && selectedGroup.members.length > 0 ? (
                    <div style={{ 
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "8px",
                      maxHeight: "300px",
                      overflowY: "auto"
                    }}>
                      {selectedGroup.members.map((member, index) => (
                        <div key={member.workGroupMemberId} style={{
                          padding: "12px",
                          backgroundColor: "#f8fafc",
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          display: "flex",
                          alignItems: "center",
                          gap: "12px"
                        }}>
                          {/* Avatar */}
                          <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            overflow: "hidden",
                            flexShrink: 0,
                            backgroundColor: "#e5e7eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            <span style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              color: "#6b7280"
                            }}>
                              {member.userName?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                          
                          {/* Member Info */}
                          <div style={{ flex: 1 }}>
                            <div style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#111827",
                              marginBottom: "2px"
                            }}>
                              {member.userName}
                            </div>
                            <div style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              marginBottom: "2px"
                            }}>
                              {member.roleId || "Không có vai trò"}
                            </div>
                            <div style={{
                              fontSize: "12px",
                              color: "#6b7280"
                            }}>
                              {member.userEmail}
                            </div>
                          </div>
                          
                          {/* Member Number */}
                          <div style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            backgroundColor: "#FF5B27",
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: "600",
                            flexShrink: 0
                          }}>
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      padding: "16px",
                      textAlign: "center",
                      color: "#6b7280",
                      backgroundColor: "#f9fafb",
                      borderRadius: "8px",
                      border: "1px dashed #d1d5db"
                    }}>
                      Chưa có nhân viên nào trong nhóm
                    </div>
                  )}
                </div>
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

       {/* Edit Group Modal */}
       {showEditModal && editingGroup && (
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
           onClick={handleCloseEditModal}
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
                 Chỉnh sửa nhóm làm việc
               </h2>
               <button
                 onClick={handleCloseEditModal}
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

             {/* Form */}
             <form onSubmit={handleSubmitEditGroup}>
               <div style={{ marginBottom: "16px" }}>
                 <label
                   style={{
                     display: "block",
                     marginBottom: "6px",
                     fontSize: "14px",
                     fontWeight: "500",
                     color: "#374151",
                   }}
                 >
                   Tên nhóm làm việc *
                 </label>
                 <input
                   type="text"
                   name="groupName"
                   value={editingGroup.groupName}
                   onChange={(e) => setEditingGroup(prev => ({
                     ...prev,
                     groupName: e.target.value
                   }))}
                   required
                   placeholder="Nhập tên nhóm làm việc"
                   style={{
                     width: "100%",
                     padding: "12px",
                     border: "1px solid #d1d5db",
                     borderRadius: "8px",
                     fontSize: "14px",
                     outline: "none",
                     transition: "border-color 0.2s",
                   }}
                   onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                   onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                 />
               </div>

               <div style={{ marginBottom: "16px" }}>
                 <label
                   style={{
                     display: "block",
                     marginBottom: "6px",
                     fontSize: "14px",
                     fontWeight: "500",
                     color: "#374151",
                   }}
                 >
                   Mô tả
                 </label>
                 <textarea
                   name="description"
                   value={editingGroup.description}
                   onChange={(e) => setEditingGroup(prev => ({
                     ...prev,
                     description: e.target.value
                   }))}
                   rows={3}
                   placeholder="Nhập mô tả nhóm làm việc"
                   style={{
                     width: "100%",
                     padding: "12px",
                     border: "1px solid #d1d5db",
                     borderRadius: "8px",
                     fontSize: "14px",
                     outline: "none",
                     transition: "border-color 0.2s",
                     resize: "vertical",
                   }}
                   onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                   onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                 />
               </div>

               <div style={{ marginBottom: "24px" }}>
                 <label
                   style={{
                     display: "block",
                     marginBottom: "6px",
                     fontSize: "14px",
                     fontWeight: "500",
                     color: "#374151",
                   }}
                 >
                   Trạng thái
                 </label>
                 <select
                   name="status"
                   value={editingGroup.status}
                   onChange={(e) => setEditingGroup(prev => ({
                     ...prev,
                     status: e.target.value
                   }))}
                   style={{
                     width: "100%",
                     padding: "12px",
                     border: "1px solid #d1d5db",
                     borderRadius: "8px",
                     fontSize: "14px",
                     outline: "none",
                     transition: "border-color 0.2s",
                     backgroundColor: "white",
                   }}
                   onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                   onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                 >
                   <option value="Hoạt động">Hoạt động</option>
                   <option value="Tạm ngưng">Tạm ngưng</option>
                 </select>
               </div>

               <div style={{ marginBottom: "24px" }}>
                 <label
                   style={{
                     display: "block",
                     marginBottom: "6px",
                     fontSize: "14px",
                     fontWeight: "500",
                     color: "#374151",
                   }}
                 >
                   Chọn nhân viên *
                 </label>
                 <MultiSelectDropdown
                   options={memberOptions}
                   value={editingGroup.selectedMembers}
                   onChange={handleEditMembersChange}
                   placeholder="Chọn nhân viên cho nhóm làm việc..."
                   style={{ width: "100%" }}
                 />
                 <div style={{ 
                   marginTop: "4px", 
                   fontSize: "12px", 
                   color: "#6b7280" 
                 }}>
                   Đã chọn {editingGroup.selectedMembers.length} nhân viên
                   {editingGroup.selectedMembers.length > 0 && (
                     <div style={{ marginTop: "8px" }}>
                       <strong>Danh sách nhân viên:</strong>
                       <div style={{ 
                         marginTop: "4px", 
                         display: "flex", 
                         flexDirection: "column", 
                         gap: "4px" 
                       }}>
                         {editingGroup.selectedMembers.map((member, index) => {
                           const user = users.find(u => u.id === member.value);
                           return (
                             <div key={member.value} style={{
                               padding: "6px 8px",
                               backgroundColor: "#f3f4f6",
                               borderRadius: "6px",
                               fontSize: "11px",
                               color: "#374151",
                               display: "flex",
                               alignItems: "center",
                               gap: "8px"
                             }}>
                               <span style={{ fontWeight: "600", color: "#6b7280" }}>
                                 {index + 1}.
                               </span>
                               <div style={{
                                 width: "20px",
                                 height: "20px",
                                 borderRadius: "50%",
                                 backgroundColor: "#e5e7eb",
                                 display: "flex",
                                 alignItems: "center",
                                 justifyContent: "center",
                                 fontSize: "10px",
                                 fontWeight: "600",
                                 color: "#6b7280"
                               }}>
                                 {member.label?.charAt(0)?.toUpperCase() || "?"}
                               </div>
                               <span style={{ fontWeight: "500" }}>
                                 {member.label}
                               </span>
                               <span style={{ color: "#6b7280" }}>
                                 - {user?.position || 'Không xác định'}
                               </span>
                             </div>
                           );
                         })}
                       </div>
                     </div>
                   )}
                 </div>
               </div>

               {/* Buttons */}
               <div
                 style={{
                   display: "flex",
                   justifyContent: "flex-end",
                   gap: "12px",
                 }}
               >
                 <button
                   type="button"
                   onClick={handleCloseEditModal}
                   style={{
                     padding: "12px 20px",
                     border: "1px solid #d1d5db",
                     borderRadius: "8px",
                     fontSize: "14px",
                     fontWeight: "500",
                     backgroundColor: "white",
                     color: "#374151",
                     cursor: "pointer",
                     transition: "background-color 0.2s",
                   }}
                   onMouseEnter={(e) => (e.target.style.backgroundColor = "#f9fafb")}
                   onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
                 >
                   Hủy
                 </button>
                 <button
                   type="submit"
                   disabled={isSubmitting}
                   style={{
                     padding: "12px 20px",
                     border: "none",
                     borderRadius: "8px",
                     fontSize: "14px",
                     fontWeight: "500",
                     backgroundColor: isSubmitting ? "#9ca3af" : "#FF5B27",
                     color: "white",
                     cursor: isSubmitting ? "not-allowed" : "pointer",
                     transition: "background-color 0.2s",
                     opacity: isSubmitting ? 0.7 : 1,
                   }}
                   onMouseEnter={(e) => {
                     if (!isSubmitting) {
                       e.target.style.backgroundColor = "#E04B1F";
                     }
                   }}
                   onMouseLeave={(e) => {
                     if (!isSubmitting) {
                       e.target.style.backgroundColor = "#FF5B27";
                     }
                   }}
                 >
                   {isSubmitting ? "Đang cập nhật..." : `Cập nhật nhóm làm việc (${editingGroup.selectedMembers.length} nhân viên)`}
                 </button>
               </div>
             </form>
           </div>
         </div>
       )}
     </div>
   );
 };

export default WorkerGroupManagement;
