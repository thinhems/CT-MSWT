import React, { useState, useEffect } from "react";
import { HiOutlineSearch, HiOutlinePlus, HiX, HiOutlineRefresh, HiOutlineArrowLeft, HiOutlineEye, HiOutlineClipboardList } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import Notification from "../components/Notification";
import Pagination from "../components/Pagination";
import GroupAssignmentTable from "../components/GroupAssignmentTable";
import JobSelectionDropdown from "../components/common/JobSelectionDropdown";
import { useAssignments } from "../hooks/useAssignments";

const GroupAssignment = () => {
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
    assignmentGroupName: "",
    description: "",
    status: "Hoạt động",
    selectedJobs: []
  });

  // Sử dụng dữ liệu thực từ API assignments
  const { assignments, isLoading: assignmentsLoading, error: assignmentsError } = useAssignments();
  
  // Sử dụng dữ liệu thực thay vì fake data
  const realJobs = assignments || [];

  const itemsPerPage = 5;

  // Dữ liệu mẫu để demo
  const mockData = [
    {
      assignmentGroupName: "Nhóm công việc 1",
      description: "Công việc liên quan đến nhà vệ sinh",
      status: "Hoạt động",
      workCount: 15,
      createdAt: "2024-01-15"
    },
    {
      groupAssignmentId: "ACF66107-4971-4800-8F49-C7985BB501AD",
      assignmentGroupName: "Nhóm công việc 2",
      description: "Công việc liên quan đến phòng học",
      status: "Tạm ngưng",
      workCount: 8,
      createdAt: "2024-01-16"
    },
    {
      groupAssignmentId: "B8E9F2A1-3C4D-5E6F-7G8H-9I0J1K2L3M4N",
      assignmentGroupName: "Nhóm công việc 3",
      description: "Công việc liên quan đến khu vực chung",
      status: "Hoạt động",
      workCount: 22,
      createdAt: "2024-01-17"
    },
    {
      groupAssignmentId: "C7D6E5F4-3G2H-1I0J-9K8L-7M6N5O4P3Q2R",
      assignmentGroupName: "Nhóm công việc 4",
      description: "Công việc liên quan đến hầm xe",
      status: "Hoạt động",
      workCount: 12,
      createdAt: "2024-01-18"
    },
    {
      groupAssignmentId: "D6C5B4A3-2Z1Y-0X9W-8V7U-6T5S4R3Q2P1O",
      assignmentGroupName: "Nhóm công việc 5",
      description: "Công việc liên quan đến khu vực hành chính",
      status: "Tạm ngưng",
      workCount: 18,
      createdAt: "2024-01-19"
    }
  ];

  // Sử dụng dữ liệu mẫu
  const displayData = mockData;

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
        groupAssignmentId: group.groupAssignmentId,
        assignmentGroupName: group.assignmentGroupName,
        description: group.description || "",
        status: group.status,
        selectedJobs: [] // Khởi tạo là array rỗng
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
      assignmentGroupName: "",
      description: "",
      status: "Hoạt động",
      selectedJobs: []
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGroup(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitGroup = async (e) => {
    e.preventDefault();
    
    if (!newGroup.assignmentGroupName.trim()) {
      showNotification("❌ Vui lòng nhập tên nhóm công việc!", "error");
      return;
    }

    if (newGroup.selectedJobs.length === 0) {
      showNotification("❌ Vui lòng chọn ít nhất một công việc!", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const selectedJobNames = realJobs
        .filter(job => newGroup.selectedJobs.includes(job.assignmentId?.toString() || job.id?.toString()))
        .map(job => job.assignmentName || job.name);
      showNotification(`🎉 Đã tạo nhóm công việc thành công với ${newGroup.selectedJobs.length} công việc: ${selectedJobNames.join(", ")}`);
      handleCloseAddModal();
      
    } catch (error) {
      console.error('Error creating group assignment:', error);
      showNotification("❌ Có lỗi xảy ra khi tạo nhóm công việc!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEditGroup = async (e) => {
    e.preventDefault();
    
    if (!editingGroup.assignmentGroupName.trim()) {
      showNotification("❌ Vui lòng nhập tên nhóm công việc!", "error");
      return;
    }

    if (!editingGroup.selectedJobs || editingGroup.selectedJobs.length === 0) {
      showNotification("❌ Vui lòng chọn ít nhất một công việc cho nhóm!", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const selectedJobNames = realJobs
        .filter(job => editingGroup.selectedJobs.includes(job.assignmentId?.toString() || job.id?.toString()))
        .map(job => job.assignmentName || job.name);
      
      showNotification(`🎉 Đã cập nhật nhóm công việc thành công với ${editingGroup.selectedJobs.length} công việc: ${selectedJobNames.join(", ")}`);
      handleCloseEditModal();
      
    } catch (error) {
      console.error('Error updating group assignment:', error);
      showNotification("❌ Có lỗi xảy ra khi cập nhật nhóm công việc!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter groups based on active tab and search term
  const filteredGroups = displayData.filter(group => {
    // Tab filtering
    let tabFilter;
    if (activeTab === "all") {
      tabFilter = true;
    } else if (activeTab === "active") {
      tabFilter = group.status === "Hoạt động";
    } else if (activeTab === "inactive") {
      tabFilter = group.status === "Tạm ngưng";
    }
    
    if (!tabFilter) return false;
    
    // Search filtering
    if (!searchTerm) return true;
    
    // Safe string operations with null checks
    const groupName = group.assignmentGroupName || "";
    const description = group.description || "";
    
    return (
      groupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      description.toLowerCase().includes(searchTerm.toLowerCase())
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
              }}
            >
              Quản lý nhóm công việc
            </h1>
            <span>Trang chủ</span>
            <span style={{ margin: "0 8px" }}>›</span>
            <span style={{ color: "#374151", fontWeight: "500" }}>
              Quản lý nhóm công việc
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
              placeholder="Tìm nhóm công việc"
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
              Thêm nhóm công việc
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: "0 0 auto" }}>
        

        {/* Groups Table */}
        <GroupAssignmentTable 
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
                Thêm nhóm công việc mới
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
                  Tên nhóm công việc *
                </label>
                <input
                  type="text"
                  name="assignmentGroupName"
                  value={newGroup.assignmentGroupName}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập tên nhóm công việc"
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
                  value={newGroup.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Nhập mô tả nhóm công việc"
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
                  {isSubmitting ? "Đang tạo..." : "Thêm nhóm công việc"}
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
                Chi tiết nhóm công việc
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
                <HiOutlineClipboardList
                  style={{ width: "24px", height: "24px", color: "#FF5B27" }}
                />
                <div>
                  <h4
                    style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}
                  >
                    {selectedGroup.assignmentGroupName}
                  </h4>
                  <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
                    ID: {selectedGroup.groupAssignmentId || "Chưa có ID"}
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
                    Trạng thái
                  </label>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      margin: "4px 0 0 0",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        padding: "4px 12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        borderRadius: "9999px",
                        backgroundColor:
                          selectedGroup.status === "Hoạt động"
                            ? "#dcfce7"
                            : "#fee2e2",
                        color:
                          selectedGroup.status === "Hoạt động"
                            ? "#15803d"
                            : "#dc2626",
                      }}
                    >
                      {selectedGroup.status}
                    </span>
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
                    Số công việc
                  </label>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#111827",
                      margin: "4px 0 0 0",
                    }}
                  >
                    {selectedGroup.workCount || 0} công việc
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

                <div>
                  
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

             
               
               {/* Jobs List */}
               <div>
                 <label
                   style={{
                     fontSize: "14px",
                     fontWeight: "500",
                     color: "#6b7280",
                   }}
                 >
                   Danh sách công việc ({realJobs.length} công việc)
                 </label>
                                    <div style={{ marginTop: "8px" }}>
                     {realJobs.length > 0 ? (
                       <div style={{ 
                         display: "flex", 
                         flexDirection: "column", 
                         gap: "8px",
                         maxHeight: "300px",
                         overflowY: "auto"
                       }}>
                         {realJobs.map((job, index) => (
                           <div key={job.assignmentId || job.id} style={{
                             padding: "12px",
                             backgroundColor: "#f8fafc",
                             borderRadius: "8px",
                             border: "1px solid #e5e7eb",
                             display: "flex",
                             alignItems: "center",
                             gap: "12px"
                           }}>
                             {/* Job Number */}
                             <div style={{
                               width: "28px",
                               height: "28px",
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
                             
                             {/* Job Info */}
                             <div style={{ flex: 1 }}>
                               <div style={{
                                 fontSize: "14px",
                                 fontWeight: "600",
                                 color: "#111827",
                                 marginBottom: "4px"
                               }}>
                                 {job.assignmentName || job.name || "Không có tên"}
                               </div>
                               <div style={{
                                 fontSize: "12px",
                                 color: "#6b7280",
                                 marginBottom: "2px"
                               }}>
                                 {job.description || "Không có mô tả"}
                               </div>
                             </div>
                             
                             {/* Status Badge */}
                             <div style={{
                               display: "flex",
                               alignItems: "center",
                               gap: "8px"
                             }}>
                               <span
                                 style={{
                                   display: "inline-flex",
                                   padding: "4px 8px",
                                   fontSize: "10px",
                                   fontWeight: "600",
                                   borderRadius: "12px",
                                   backgroundColor:
                                     job.status === "Hoạt động"
                                       ? "#dcfce7"
                                       : "#fee2e2",
                                   color:
                                     job.status === "Hoạt động"
                                       ? "#15803d"
                                       : "#dc2626",
                                 }}
                               >
                                 {job.status || "Không xác định"}
                               </span>
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
                         Chưa có công việc nào được gán cho nhóm này
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
                Chỉnh sửa nhóm công việc
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
                  Tên nhóm công việc *
                </label>
                <input
                  type="text"
                  name="assignmentGroupName"
                  value={editingGroup.assignmentGroupName}
                  onChange={(e) => setEditingGroup(prev => ({
                    ...prev,
                    assignmentGroupName: e.target.value
                  }))}
                  required
                  placeholder="Nhập tên nhóm công việc"
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
                  placeholder="Nhập mô tả nhóm công việc"
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
                 
                 <JobSelectionDropdown
                   jobs={realJobs}
                   selectedJobs={editingGroup.selectedJobs || []}
                   onSelectionChange={(selectedJobs) => {
                     setEditingGroup(prev => ({
                       ...prev,
                       selectedJobs: selectedJobs || []
                     }));
                   }}
                   label="Chọn công việc"
                   placeholder="Chọn công việc cho nhóm..."
                 />
                 <div style={{ 
                   marginTop: "8px", 
                   fontSize: "12px", 
                   color: "#6b7280" 
                 }}>
                   
                   {(editingGroup.selectedJobs || []).length > 0 && (
                     <div style={{ marginTop: "8px" }}>
                       <strong>Danh sách công việc:</strong>
                       <div style={{ 
                         marginTop: "4px", 
                         display: "flex", 
                         flexDirection: "column", 
                         gap: "4px" 
                       }}>
                         {(editingGroup.selectedJobs || []).map((jobId, index) => {
                           const job = realJobs.find(j => j.assignmentId?.toString() === jobId.toString() || j.id?.toString() === jobId.toString());
                           return (
                             <div key={jobId} style={{
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
                               <span style={{ fontWeight: "500" }}>
                                 {job?.assignmentName || job?.name || 'Không xác định'}
                               </span>
                               <span style={{ color: "#6b7280" }}>
                                 - {job?.description || 'Không có mô tả'}
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
                  {isSubmitting ? "Đang cập nhật..." : "Cập nhật nhóm công việc"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupAssignment;
