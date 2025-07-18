import React, { useState, useEffect } from "react";
import { FiPlus, FiSearch } from "react-icons/fi";
import { HiOutlineDotsVertical, HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import Notification from "../components/Notification";
import Pagination from "../components/Pagination";
import { useAssignments } from "../hooks/useAssignments";

const AssignmentManagement = () => {
  // State management
  const [assignments, setAssignments] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [detailedAssignment, setDetailedAssignment] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    assignmentName: "",
    description: "",
    timesPerDay: "",
    status: "Hoạt động"
  });
  const [updateAssignmentData, setUpdateAssignmentData] = useState({
    assignmentName: "",
    description: "",
    timesPerDay: "",
    status: ""
  });
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openDropdown, setOpenDropdown] = useState(null);
  
  const itemsPerPage = 5;

  // Use the custom hook for API calls
  const {
    assignments: apiAssignments,
    isLoading,
    error,
    createAsync,
    updateAsync,
    deleteAsync,
    getAssignmentById,
    mutate
  } = useAssignments();

  // Show notification helper
  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  // Update assignments when apiAssignments changes
  useEffect(() => {
    if (apiAssignments) {
      setAssignments(apiAssignments);
      console.log('✅ Đã tải dữ liệu công việc từ API:', apiAssignments.length, 'assignments');
    }
  }, [apiAssignments]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside dropdown
      const dropdownElement = event.target.closest('[data-dropdown]');
      if (!dropdownElement && openDropdown) {
        setOpenDropdown(null);
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      
      // Also close dropdown on scroll
      const handleScroll = () => setOpenDropdown(null);
      window.addEventListener('scroll', handleScroll, true);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [openDropdown]);

  // Action handlers
  const handleActionClick = async ({ action, assignment }) => {
    if (action === 'view') {
      setSelectedAssignment(assignment);
      setShowViewModal(true);
      
      // Fetch detailed assignment data from API
      setIsLoadingDetail(true);
      try {
        const detailedData = await getAssignmentById(assignment.assignmentId);
        setDetailedAssignment(detailedData);
        console.log('✅ Detailed assignment data loaded:', detailedData);
      } catch (error) {
        console.error('❌ Error loading detailed assignment:', error);
        showNotification(`❌ ${error.message}`, "error");
        // Fallback to basic assignment data
        setDetailedAssignment(assignment);
      } finally {
        setIsLoadingDetail(false);
      }
    } else if (action === 'update') {
      setSelectedAssignment(assignment);
      setUpdateAssignmentData({
        assignmentName: assignment.assignmentName || "",
        description: assignment.description || "",
        timesPerDay: assignment.timesPerDay || "",
        status: assignment.status || "Hoạt động"
      });
      setShowUpdateModal(true);
    } else if (action === 'delete') {
      handleDeleteAssignment(assignment);
    }
  };

  // Close modals
  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedAssignment(null);
    setDetailedAssignment(null);
    setIsLoadingDetail(false);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedAssignment(null);
    setUpdateAssignmentData({
      assignmentName: "",
      description: "",
      timesPerDay: "",
      status: ""
    });
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewAssignment({
      assignmentName: "",
      description: "",
      timesPerDay: "",
      status: "Hoạt động"
    });
  };

  // Input change handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAssignment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateAssignmentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Create assignment
  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    
    if (!newAssignment.assignmentName.trim()) {
      showNotification("❌ Vui lòng điền tên công việc!", "error");
      return;
    }

    if (!newAssignment.timesPerDay.trim()) {
      showNotification("❌ Vui lòng điền số lần thực hiện mỗi ngày!", "error");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createAsync({
        assignmentName: newAssignment.assignmentName.trim(),
        description: newAssignment.description.trim() || "",
        timesPerDay: newAssignment.timesPerDay.trim(),
        status: newAssignment.status
      });
      
      showNotification("🎉 Đã thêm công việc thành công!");
      handleCloseAddModal();
      
    } catch (error) {
      console.error('❌ Error creating assignment:', error);
      const errorMessage = error.message || "Có lỗi xảy ra khi thêm công việc!";
      showNotification(`❌ ${errorMessage}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update assignment
  const handleSubmitUpdate = async (e) => {
    e.preventDefault();
    
    if (!updateAssignmentData.assignmentName.trim()) {
      showNotification("❌ Vui lòng điền tên công việc!", "error");
      return;
    }

    if (!updateAssignmentData.timesPerDay.trim()) {
      showNotification("❌ Vui lòng điền số lần thực hiện mỗi ngày!", "error");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await updateAsync(selectedAssignment.assignmentId, {
        assignmentName: updateAssignmentData.assignmentName.trim(),
        description: updateAssignmentData.description.trim() || "",
        timesPerDay: updateAssignmentData.timesPerDay.trim(),
        status: updateAssignmentData.status
      });
      
      showNotification("✅ Đã cập nhật công việc thành công!");
      handleCloseUpdateModal();
      
    } catch (error) {
      console.error('❌ Error updating assignment:', error);
      const errorMessage = error.message || "Có lỗi xảy ra khi cập nhật!";
      showNotification(`❌ ${errorMessage}`, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete assignment
  const handleDeleteAssignment = async (assignment) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa công việc "${assignment.assignmentName}"?`)) {
      return;
    }

    try {
      await deleteAsync(assignment.assignmentId);
      showNotification("✅ Đã xóa công việc thành công!");
    } catch (error) {
      console.error('❌ Error deleting assignment:', error);
      const errorMessage = error.message || "Có lỗi xảy ra khi xóa!";
      showNotification(`❌ ${errorMessage}`, "error");
    }
  };

  // Filter assignments based on search term
  const filteredAssignments = assignments.filter(assignment =>
    assignment.assignmentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assignment.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredAssignments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAssignments = filteredAssignments.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Dropdown handlers
  const handleDropdownToggle = (assignmentId) => {
    setOpenDropdown(openDropdown === assignmentId ? null : assignmentId);
  };

  const handleActionSelect = (action, assignment) => {
    console.log('🎯 Action selected:', action, assignment.assignmentId);
    handleActionClick({ action, assignment });
    setOpenDropdown(null);
  };

  if (isLoading) {
    return (
      <div style={{ 
        backgroundColor: "#ffffff", 
        height: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center" 
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#6b7280" }}>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#ffffff", height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
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
              Quản lý công việc
            </h1>
            <span>Trang chủ</span>
            <span style={{ margin: "0 8px" }}>›</span>
            <span style={{ color: "#374151", fontWeight: "500" }}>
              Quản lý công việc
            </span>
          </nav>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
            <button
              style={{
                padding: "12px 24px",
                border: "none",
                backgroundColor: "transparent",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                borderBottom: "2px solid #FF5B27",
                color: "#FF5B27",
                transition: "all 0.2s",
              }}
            >
              Tất cả công việc
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
              <FiSearch style={{ width: "20px", height: "20px" }} />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm công việc..."
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
            {/* Add Assignment Button */}
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
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#E04B1F")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#FF5B27")}
            >
              <FiPlus style={{ width: "16px", height: "16px" }} />
              Thêm công việc
            </button>
          </div>
        </div>

        
      </div>

            {/* Assignment Table Container */}
      <div style={{ flex: "0 0 auto" }}>
        {/* Table */}
        <div style={{
          marginLeft: "32px",
          marginRight: "32px",
          marginTop: "0px",
          marginBottom: "12px",
          backgroundColor: "white",
          borderRadius: "12px",
          border: "1px solid #f0f0f0",
          overflow: "auto",
          maxHeight: "350px",
          boxShadow: "0 2px 8px 0 rgba(0, 0, 0, 0.06)",
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
              <tr style={{ backgroundColor: "#FEF6F4", borderBottom: "2px solid #e5e7eb" }}>
                <th style={{ 
                  padding: "16px 24px", 
                  textAlign: "left", 
                  fontWeight: "600",
                  fontSize: "13px",
                  color: "#374151"
                }}>
                  STT
                </th>
                <th style={{ 
                  padding: "16px 24px", 
                  textAlign: "left", 
                  fontWeight: "600",
                  fontSize: "13px",
                  color: "#374151"
                }}>
                  Tên công việc
                </th>
                <th style={{ 
                  padding: "16px 24px", 
                  textAlign: "left", 
                  fontWeight: "600",
                  fontSize: "13px",
                  color: "#374151"
                }}>
                  Mô tả
                </th>
                <th style={{ 
                  padding: "16px 24px", 
                  textAlign: "left", 
                  fontWeight: "600",
                  fontSize: "13px",
                  color: "#374151"
                }}>
                  Số lần/ngày
                </th>
                <th style={{ 
                  padding: "16px 24px", 
                  textAlign: "left", 
                  fontWeight: "600",
                  fontSize: "13px",
                  color: "#374151"
                }}>
                  Trạng thái
                </th>
                <th style={{ 
                  padding: "16px 24px", 
                  textAlign: "center", 
                  fontWeight: "600",
                  fontSize: "13px",
                  color: "#374151"
                }}>
                  Hành động
                </th>
              </tr>
            </thead>
                      <tbody>
              {currentAssignments.length > 0 ? (
                currentAssignments.map((assignment, index) => (
                  <tr 
                    key={assignment.assignmentId} 
                    style={{
                      borderTop: index > 0 ? "1px solid #f0f0f0" : "none",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#fafafa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td style={{ 
                      padding: "16px 24px", 
                      fontSize: "14px", 
                      color: "#111827" 
                    }}>
                      {startIndex + index + 1}
                    </td>
                    <td style={{ 
                      padding: "16px 24px", 
                      fontSize: "14px", 
                      color: "#111827", 
                      fontWeight: "500" 
                    }}>
                      {assignment.assignmentName}
                    </td>
                    <td style={{ 
                      padding: "16px 24px", 
                      fontSize: "14px", 
                      color: "#6b7280" 
                    }}>
                      {assignment.description || "Không có mô tả"}
                    </td>
                    <td style={{ 
                      padding: "16px 24px", 
                      fontSize: "14px", 
                      color: "#111827",
                      fontWeight: "500"
                    }}>
                      {assignment.timesPerDay || "N/A"}
                    </td>
                    <td style={{ 
                      padding: "16px 24px", 
                      fontSize: "14px"
                    }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "500",
                        backgroundColor: assignment.status === "Hoạt động" ? "#d1fae5" : "#fee2e2",
                        color: assignment.status === "Hoạt động" ? "#065f46" : "#991b1b"
                      }}>
                        {assignment.status || "N/A"}
                      </span>
                    </td>
                    <td style={{ 
                      padding: "16px 24px", 
                      textAlign: "center",
                      position: "relative"
                    }}
                    data-dropdown="true">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDropdownToggle(assignment.assignmentId);
                        }}
                        style={{
                          backgroundColor: "transparent",
                          border: "none",
                          padding: "8px",
                          cursor: "pointer",
                          borderRadius: "6px",
                          color: "#6b7280",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto",
                          transition: "all 0.2s ease",
                          minWidth: "32px",
                          minHeight: "32px"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = "#f3f4f6";
                          e.target.style.color = "#374151";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = "transparent";
                          e.target.style.color = "#6b7280";
                        }}
                        title="Tùy chọn"
                      >
                        <HiOutlineDotsVertical style={{ width: "18px", height: "18px" }} />
                      </button>

                      {/* Dropdown Menu */}
                      {openDropdown === assignment.assignmentId && (
                        <div
                          data-dropdown="true"
                          style={{
                            position: "absolute",
                            top: "100%",
                            right: "0px",
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "6px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                            zIndex: 1000,
                            minWidth: "120px",
                            marginTop: "4px"
                          }}
                        >
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActionSelect('view', assignment);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              width: "100%",
                              padding: "8px 12px",
                              border: "none",
                              backgroundColor: "transparent",
                              textAlign: "left",
                              cursor: "pointer",
                              fontSize: "13px",
                              color: "#374151",
                              borderBottom: "1px solid #f3f4f6"
                            }}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = "#f9fafb")}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                          >
                            <HiOutlineEye style={{ width: "14px", height: "14px" }} />
                            Xem
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActionSelect('update', assignment);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              width: "100%",
                              padding: "8px 12px",
                              border: "none",
                              backgroundColor: "transparent",
                              textAlign: "left",
                              cursor: "pointer",
                              fontSize: "13px",
                              color: "#374151",
                              borderBottom: "1px solid #f3f4f6"
                            }}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = "#f9fafb")}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = "transparent")}
                          >
                            <HiOutlinePencil style={{ width: "14px", height: "14px" }} />
                            Sửa
                          </button>
                          
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ 
                    padding: "32px", 
                    textAlign: "center", 
                    color: "#6b7280",
                    fontSize: "14px"
                  }}>
                    {searchTerm ? "Không tìm thấy công việc nào" : "Chưa có công việc nào"}
                  </td>
                </tr>
              )}
            </tbody>
        </table>
      </div>
      </div>

      {/* Pagination */}
      <div style={{ flex: "0 0 auto", padding: "16px" }}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            width: "450px",
            maxHeight: "80vh",
            overflow: "auto"
          }}>
            <div style={{ padding: "18px", borderBottom: "1px solid #e5e7eb" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
                Thêm công việc mới
              </h2>
            </div>

            <form onSubmit={handleSubmitAssignment} style={{ padding: "18px" }}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "6px", 
                  fontWeight: "500",
                  fontSize: "13px",
                  color: "#374151"
                }}>
                  Tên công việc *
                </label>
                <input
                  type="text"
                  name="assignmentName"
                  value={newAssignment.assignmentName}
                  onChange={handleInputChange}
                  placeholder="Nhập tên công việc..."
                  required
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "13px",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "6px", 
                  fontWeight: "500",
                  fontSize: "13px",
                  color: "#374151"
                }}>
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={newAssignment.description}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả công việc..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "13px",
                    resize: "vertical",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "6px", 
                  fontWeight: "500",
                  fontSize: "13px",
                  color: "#374151"
                }}>
                  Số lần thực hiện mỗi ngày *
                </label>
                <input
                  type="number"
                  name="timesPerDay"
                  value={newAssignment.timesPerDay}
                  onChange={handleInputChange}
                  placeholder="Nhập số lần..."
                  min="1"
                  max="10"
                  required
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "13px",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "6px", 
                  fontWeight: "500",
                  fontSize: "13px",
                  color: "#374151"
                }}>
                  Trạng thái *
                </label>
                <select
                  name="status"
                  value={newAssignment.status}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "13px",
                    outline: "none",
                    backgroundColor: "white"
                  }}
                >
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Không hoạt động">Không hoạt động</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    color: "#374151",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer"
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor: isSubmitting ? "#9ca3af" : "#FF5B27",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: isSubmitting ? "not-allowed" : "pointer"
                  }}
                >
                  {isSubmitting ? "Đang thêm..." : "Thêm công việc"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedAssignment && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            width: "500px",
            maxHeight: "80vh",
            overflow: "auto"
          }}>
            <div style={{ 
              padding: "24px", 
              borderBottom: "1px solid #e5e7eb",
              backgroundColor: "#fafafa"
            }}>
              <h2 style={{ 
                fontSize: "20px", 
                fontWeight: "600", 
                margin: 0,
                color: "#111827",
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}>
                📋 Chi tiết công việc
              </h2>
            </div>

            <div style={{ padding: "24px" }}>
              {/* Loading State */}
              {isLoadingDetail && (
                <div style={{ 
                  display: "flex", 
                  justifyContent: "center", 
                  alignItems: "center", 
                  padding: "40px",
                  flexDirection: "column",
                  gap: "16px" 
                }}>
                  <div style={{ 
                    width: "40px", 
                    height: "40px", 
                    border: "4px solid #f3f4f6", 
                    borderTop: "4px solid #FF5B27", 
                    borderRadius: "50%", 
                    animation: "spin 1s linear infinite" 
                  }}></div>
                  <p style={{ color: "#6b7280", margin: 0 }}>Đang tải chi tiết công việc...</p>
                </div>
              )}

              {/* Content */}
              {!isLoadingDetail && (
                <>


                  {/* Assignment Name */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontWeight: "600",
                      fontSize: "14px",
                      color: "#374151"
                    }}>
                      Tên công việc
                    </label>
                    <div style={{ 
                      padding: "12px 16px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "14px",
                      color: "#111827",
                      fontWeight: "500",
                      boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.05)"
                    }}>
                      {detailedAssignment?.assignmentName || selectedAssignment.assignmentName}
                    </div>
                  </div>

                  {/* Description */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontWeight: "600",
                      fontSize: "14px",
                      color: "#374151"
                    }}>
                      Mô tả
                    </label>
                    <div style={{ 
                      padding: "12px 16px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "14px",
                      color: "#374151",
                      minHeight: "80px",
                      lineHeight: "1.5",
                      boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.05)"
                    }}>
                      {detailedAssignment?.description || selectedAssignment.description || "Không có mô tả"}
                    </div>
                  </div>

                  {/* Times Per Day */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontWeight: "600",
                      fontSize: "14px",
                      color: "#374151"
                    }}>
                      Số lần thực hiện mỗi ngày
                    </label>
                    <div style={{ 
                      padding: "12px 16px",
                      backgroundColor: "#ffffff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "14px",
                      color: "#111827",
                      fontWeight: "500",
                      boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.05)"
                    }}>
                      {detailedAssignment?.timesPerDay || selectedAssignment.timesPerDay || "N/A"}
                    </div>
                  </div>

                  {/* Status */}
                  <div style={{ marginBottom: "20px" }}>
                    <label style={{ 
                      display: "block", 
                      marginBottom: "8px", 
                      fontWeight: "600",
                      fontSize: "14px",
                      color: "#374151"
                    }}>
                      Trạng thái
                    </label>
                    <div style={{ 
                     
                    }}>
                      <span style={{
                        padding: "6px 16px",
                        borderRadius: "20px",
                        marginTop: "1px",
                        fontSize: "13px",
                        fontWeight: "600",
                        backgroundColor: (detailedAssignment?.status || selectedAssignment.status) === "Hoạt động" ? "#dcfce7" : "#fef3c7",
                        color: (detailedAssignment?.status || selectedAssignment.status) === "Hoạt động" ? "#166534" : "#d97706",
                        border: `1px solid ${(detailedAssignment?.status || selectedAssignment.status) === "Hoạt động" ? "#bbf7d0" : "#fed7aa"}`
                      }}>
                        {(detailedAssignment?.status || selectedAssignment.status) === "Hoạt động" ? "🟢 " : "🟡 "}
                        {detailedAssignment?.status || selectedAssignment.status || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Created At */}
                  {detailedAssignment?.createdAt && (
                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ 
                        display: "block", 
                        marginBottom: "8px", 
                        fontWeight: "600",
                        fontSize: "14px",
                        color: "#374151"
                      }}>
                        Ngày tạo
                      </label>
                      <div style={{ 
                        padding: "12px 16px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "14px",
                        color: "#6b7280",
                        boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.05)"
                      }}>
                        📅 {new Date(detailedAssignment.createdAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  )}

                  {/* Updated At */}
                  {detailedAssignment?.updatedAt && (
                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ 
                        display: "block", 
                        marginBottom: "6px", 
                        fontWeight: "600",
                        fontSize: "13px",
                        color: "#374151"
                      }}>
                        Ngày cập nhật:
                      </label>
                      <div style={{ 
                        padding: "8px 10px",
                        backgroundColor: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: "6px",
                        fontSize: "13px",
                        color: "#374151"
                      }}>
                        {new Date(detailedAssignment.updatedAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  )}

                  {/* Data Source Indicator */}
                  {!detailedAssignment && (
                    <div style={{ 
                      marginBottom: "16px",
                      padding: "8px 12px",
                      backgroundColor: "#fef3c7",
                      border: "1px solid #fbbf24",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "#92400e"
                    }}>
                      📋 Hiển thị dữ liệu cơ bản (chưa tải được chi tiết từ API)
                    </div>
                  )}
                </>
              )}

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={handleCloseViewModal}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    color: "#374151",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer"
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedAssignment && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            width: "450px",
            maxHeight: "80vh",
            overflow: "auto"
          }}>
            <div style={{ padding: "18px", borderBottom: "1px solid #e5e7eb" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>
                Cập nhật công việc
              </h2>
            </div>

            <form onSubmit={handleSubmitUpdate} style={{ padding: "18px" }}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "6px", 
                  fontWeight: "500",
                  fontSize: "13px",
                  color: "#374151"
                }}>
                  Tên công việc *
                </label>
                <input
                  type="text"
                  name="assignmentName"
                  value={updateAssignmentData.assignmentName}
                  onChange={handleUpdateInputChange}
                  placeholder="Nhập tên công việc..."
                  required
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "13px",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "6px", 
                  fontWeight: "500",
                  fontSize: "13px",
                  color: "#374151"
                }}>
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={updateAssignmentData.description}
                  onChange={handleUpdateInputChange}
                  placeholder="Nhập mô tả công việc..."
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "13px",
                    resize: "vertical",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "6px", 
                  fontWeight: "500",
                  fontSize: "13px",
                  color: "#374151"
                }}>
                  Số lần thực hiện mỗi ngày *
                </label>
                <input
                  type="number"
                  name="timesPerDay"
                  value={updateAssignmentData.timesPerDay}
                  onChange={handleUpdateInputChange}
                  placeholder="Nhập số lần..."
                  min="1"
                  max="10"
                  required
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "13px",
                    outline: "none"
                  }}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "6px", 
                  fontWeight: "500",
                  fontSize: "13px",
                  color: "#374151"
                }}>
                  Trạng thái *
                </label>
                <select
                  name="status"
                  value={updateAssignmentData.status}
                  onChange={handleUpdateInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "8px 10px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "13px",
                    outline: "none",
                    backgroundColor: "white"
                  }}
                >
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Không hoạt động">Không hoạt động</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={handleCloseUpdateModal}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    color: "#374151",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: "pointer"
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor: isSubmitting ? "#9ca3af" : "#FF5B27",
                    color: "white",
                    fontSize: "13px",
                    fontWeight: "500",
                    cursor: isSubmitting ? "not-allowed" : "pointer"
                  }}
                >
                  {isSubmitting ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification */}
      <Notification
        show={notification.show}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ show: false, message: "", type: "" })}
      />
    </div>
  );
};

export default AssignmentManagement; 