import React, { useState, useEffect } from "react";
import { HiOutlineSearch, HiOutlinePlus, HiX, HiOutlineRefresh, HiOutlineArrowLeft, HiOutlineEye, HiOutlineClipboardList } from "react-icons/hi";
import { useNavigate } from "react-router-dom";
import Notification from "../components/Notification";
import Pagination from "../components/Pagination";
import GroupAssignmentTable from "../components/GroupAssignmentTable";
import JobSelectionDropdown from "../components/common/JobSelectionDropdown";
import { useAssignments } from "../hooks/useAssignments";
import { useGroupAssignments } from "../hooks/useGroupAssignment";

const GroupAssignment = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [editingGroup, setEditingGroup] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingGroupDetails, setIsLoadingGroupDetails] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: "",
    description: "",
    selectedJobs: []
  });

  // Sử dụng dữ liệu thực từ API assignments
  const { assignments, isLoading: assignmentsLoading, error: assignmentsError } = useAssignments();
  
  // Sử dụng dữ liệu thực từ API group assignments
  const { groupAssignments, isLoading: groupAssignmentsLoading, error: groupAssignmentsError, mutate: refreshGroupAssignments } = useGroupAssignments();
  
  // Sử dụng dữ liệu thực thay vì fake data
  const realJobs = assignments || [];
  const realGroupAssignments = groupAssignments || [];

  const itemsPerPage = 5;

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, 3000);
  };

  const handleActionClick = async ({ action, group }) => {
    if (action === 'view') {
      try {
        setIsLoadingGroupDetails(true);
        // Find detailed group assignment data from existing data
        const detailedGroup = realGroupAssignments.find(g => g.groupAssignmentId === group.groupAssignmentId);
        console.log('📋 Detailed group data:', detailedGroup);
        
        if (detailedGroup) {
          setSelectedGroup(detailedGroup);
          setShowViewModal(true);
          showNotification("✅ Đã tải chi tiết nhóm công việc thành công!", "success");
        } else {
          // Fallback to basic group data if not found
          setSelectedGroup(group);
          setShowViewModal(true);
          showNotification("⚠️ Không tìm thấy thông tin chi tiết, hiển thị thông tin cơ bản", "warning");
        }
      } catch (error) {
        console.error('❌ Error processing group details:', error);
        showNotification("❌ Có lỗi xảy ra khi xử lý thông tin nhóm công việc!", "error");
        // Fallback to basic group data if error occurs
        setSelectedGroup(group);
        setShowViewModal(true);
      } finally {
        // Add a small delay to make loading state visible
        setTimeout(() => {
          setIsLoadingGroupDetails(false);
        }, 500);
      }
         } else if (action === 'edit') {
       // Lấy danh sách công việc hiện có của nhóm
       const currentJobs = group.assignments?.map(job => job.assignmentId) || [];
       
       setEditingGroup({
         groupAssignmentId: group.groupAssignmentId,
         name: group.assignmentGroupName,
         description: group.description || "",
         selectedJobs: currentJobs // Sử dụng công việc hiện có
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
      name: "",
      description: "",
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
    
    if (!newGroup.name.trim()) {
      showNotification("❌ Vui lòng nhập tên nhóm công việc!", "error");
      return;
    }

    if (newGroup.selectedJobs.length === 0) {
      showNotification("❌ Vui lòng chọn ít nhất một công việc!", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare request data according to API specification
      const requestData = {
        name: newGroup.name,
        description: newGroup.description,
        assignmentIds: newGroup.selectedJobs
      };
      
      console.log('📤 Creating group assignment with data:', requestData);
      
      // Make API call to create group assignment
      const response = await fetch('/api/groupAssignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Group assignment created successfully:', result);
      
      const selectedJobNames = realJobs
        .filter(job => newGroup.selectedJobs.includes(job.assignmentId?.toString() || job.id?.toString()))
        .map(job => job.assignmentName || job.name);
      
      showNotification(`🎉 Đã tạo nhóm công việc thành công với ${newGroup.selectedJobs.length} công việc: ${selectedJobNames.join(", ")}`);
      handleCloseAddModal();
      
      // Refresh the group assignments list
      refreshGroupAssignments();
      
    } catch (error) {
      console.error('❌ Error creating group assignment:', error);
      showNotification("❌ Có lỗi xảy ra khi tạo nhóm công việc!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEditGroup = async (e) => {
    e.preventDefault();
    
    if (!editingGroup.name.trim()) {
      showNotification("❌ Vui lòng nhập tên nhóm công việc!", "error");
      return;
    }

    if (!editingGroup.selectedJobs || editingGroup.selectedJobs.length === 0) {
      showNotification("❌ Vui lòng chọn ít nhất một công việc cho nhóm!", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Prepare request data according to API specification
      const requestData = {
        name: editingGroup.name,
        description: editingGroup.description,
        assignmentIds: editingGroup.selectedJobs
      };
      
      console.log('📤 Updating group assignment with data:', requestData);
      
      // Make API call to update group assignment
      const response = await fetch(`/api/groupAssignment/${editingGroup.groupAssignmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('✅ Group assignment updated successfully:', result);
      
      const selectedJobNames = realJobs
        .filter(job => editingGroup.selectedJobs.includes(job.assignmentId?.toString() || job.id?.toString()))
        .map(job => job.assignmentName || job.name);
      
      showNotification(`🎉 Đã cập nhật nhóm công việc thành công với ${editingGroup.selectedJobs.length} công việc: ${selectedJobNames.join(", ")}`);
      handleCloseEditModal();
      
      // Refresh the group assignments list
      refreshGroupAssignments();
      
    } catch (error) {
      console.error('❌ Error updating group assignment:', error);
      showNotification("❌ Có lỗi xảy ra khi cập nhật nhóm công việc!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter groups based on search term
  const filteredGroups = realGroupAssignments.filter(group => {
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

  // Handle search change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Reset page when data changes
  useEffect(() => {
    const totalPages = Math.ceil(realGroupAssignments.length / itemsPerPage);
    if (realGroupAssignments.length > 0 && currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [realGroupAssignments, currentPage, itemsPerPage]);

  // Reset page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Show loading state
  if (groupAssignmentsLoading) {
    return (
      <div style={{ backgroundColor: "#ffffff", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", color: "#6b7280", marginBottom: "16px" }}>Đang tải dữ liệu...</div>
          <div style={{ width: "40px", height: "40px", border: "4px solid #f3f4f6", borderTop: "4px solid #FF5B27", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
        </div>
      </div>
    );
  }

  // Show error state
  if (groupAssignmentsError) {
    return (
      <div style={{ backgroundColor: "#ffffff", height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "18px", color: "#dc2626", marginBottom: "16px" }}>Có lỗi xảy ra khi tải dữ liệu</div>
          <button 
            onClick={() => refreshGroupAssignments()}
            style={{
              padding: "12px 24px",
              backgroundColor: "#FF5B27",
              color: "white",
              border: "none",
              borderRadius: "8px",
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

        {/* Summary */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ 
            padding: "16px", 
            backgroundColor: "#f8fafc", 
            borderRadius: "8px", 
            border: "1px solid #e2e8f0" 
          }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "12px" 
            }}>
              <div style={{
                width: "40px",
                height: "40px",
                backgroundColor: "#FF5B27",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "18px",
                fontWeight: "600"
              }}>
                {realGroupAssignments.length}
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                  Tổng số nhóm công việc
                </div>
                <div style={{ fontSize: "14px", color: "#6b7280" }}>
                  {realGroupAssignments.length === 0 ? "Chưa có nhóm nào" : 
                   realGroupAssignments.length === 1 ? "1 nhóm công việc" : 
                   `${realGroupAssignments.length} nhóm công việc`}
                </div>
              </div>
            </div>
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
            {/* Refresh Button */}
            <button
              onClick={() => refreshGroupAssignments()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#6b7280",
                color: "white",
                padding: "12px 20px",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#4b5563")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#6b7280")}
            >
              <HiOutlineRefresh style={{ width: "20px", height: "20px" }} />
              Làm mới
            </button>
            
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
        {realGroupAssignments.length === 0 ? (
          <div style={{
            marginLeft: "32px",
            marginRight: "32px",
            marginTop: "0px",
            backgroundColor: "white",
            borderRadius: "12px",
            border: "1px solid #f0f0f0",
            padding: "48px",
            textAlign: "center",
            boxShadow: "0 2px 8px 0 rgba(0, 0, 0, 0.06)"
          }}>
            <div style={{ fontSize: "18px", color: "#6b7280", marginBottom: "16px" }}>
              Chưa có nhóm công việc nào
            </div>
            <div style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "24px" }}>
              Hãy tạo nhóm công việc đầu tiên để bắt đầu
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                display: "inline-flex",
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
              Tạo nhóm công việc đầu tiên
            </button>
          </div>
        ) : (
          <GroupAssignmentTable 
            groups={currentGroups} 
            onActionClick={handleActionClick} 
            isLoadingView={isLoadingGroupDetails}
          />
        )}
      </div>

      {/* Pagination */}
      {realGroupAssignments.length > 0 && (
        <div style={{ flex: "0 0 auto", padding: "16px" }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

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
                   name="name"
                   value={newGroup.name}
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
                <JobSelectionDropdown
                  jobs={realJobs}
                  selectedJobs={newGroup.selectedJobs}
                  onSelectionChange={(selectedJobs) => {
                    setNewGroup(prev => ({
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
                  {newGroup.selectedJobs.length > 0 && (
                    <div style={{ marginTop: "8px" }}>
                      <strong>Danh sách công việc:</strong>
                      <div style={{ 
                        marginTop: "4px", 
                        display: "flex", 
                        flexDirection: "column", 
                        gap: "4px" 
                      }}>
                        {newGroup.selectedJobs.map((jobId, index) => {
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
      {showViewModal && (
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
            {isLoadingGroupDetails ? (
              <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                padding: "48px",
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
                <div style={{ fontSize: "16px", color: "#6b7280" }}>
                  Đang tải chi tiết nhóm công việc...
                </div>
              </div>
            ) : selectedGroup ? (
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
                    Danh sách công việc ({selectedGroup.assignments?.length || 0} công việc)
                  </label>
                  <div style={{ marginTop: "8px" }}>
                    {selectedGroup.assignments && selectedGroup.assignments.length > 0 ? (
                      <div style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        gap: "8px",
                        maxHeight: "300px",
                        overflowY: "auto"
                      }}>
                        {selectedGroup.assignments.map((job, index) => (
                          <div key={job.assignmentId} style={{
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
                                {job.assigmentName || "Không có tên"}
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
            ) : (
              <div style={{ 
                padding: "48px", 
                textAlign: "center", 
                color: "#6b7280" 
              }}>
                Không thể tải thông tin nhóm công việc
              </div>
            )}

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
                   name="name"
                   value={editingGroup.name}
                   onChange={(e) => setEditingGroup(prev => ({
                     ...prev,
                     name: e.target.value
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
                        <strong>Danh sách công việc hiện tại:</strong>
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
