import React, { useState } from "react";
import { HiOutlinePlus, HiOutlineSearch } from "react-icons/hi";
import ScheduleTable from "../components/ScheduleTable";
import ScheduleDetailsModal from "../components/ScheduleDetailsModal";
import StaffAssignmentModal from "../components/StaffAssignmentModal";
import Pagination from "../components/Pagination";
import Notification from "../components/Notification";
import { useSchedules } from "../hooks/useSchedule";
import { useAreas } from "../hooks/useArea";
import { useShifts } from "../hooks/useShifts";
import { useRestrooms } from "../hooks/useRestroom";
import { useTrashBins } from "../hooks/useTrashBins";
import { useAssignments } from "../hooks/useAssignments";
import { useUsers } from "../hooks/useUsers";
import { Schedule, ICreateScheduleRequest } from "@/config/models/schedule.model";

const Schedules = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showEditScheduleModal, setShowEditScheduleModal] = useState(false); // New modal for editing schedule info
  const [notification, setNotification] = useState({
    isVisible: false,
    type: "",
    message: "",
  });

  const { schedules, isLoading, error, createSchedule, updateSchedule } = useSchedules();
  const { areas, isLoading: areasLoading, error: areasError } = useAreas();
  const { shifts, isLoading: shiftsLoading, error: shiftsError } = useShifts();
  const { restrooms } = useRestrooms();
  const { trashBins } = useTrashBins();
  const { assignments } = useAssignments();
  const { users } = useUsers();

  // Filter supervisors from users
  const supervisors = users?.filter((user: any) => user.position === "Giám sát viên vệ sinh") || [];
  



  

  // Form state for new schedule
  const [newSchedule, setNewSchedule] = useState<ICreateScheduleRequest>({
    areaId: "",
    scheduleName: "",
    assignmentId: "",
    startDate: "",
    endDate: "",
    restroomId: "",
    scheduleType: "Hằng ngày",
    shiftId: "",
    supervisorId: "",
  });

  // Form state for updating schedule assignments
  const [updateData, setUpdateData] = useState({
    restroomId: "",
    trashBinId: "",
  });

  // Form state for updating schedule information
  const [updateScheduleData, setUpdateScheduleData] = useState<{
    scheduleName: string;
    areaId: string;
    assignmentId: string;
    startDate: string;
    endDate: string;
    restroomId: string;
    scheduleType: string;
    shiftId: string;
  }>({
    scheduleName: "",
    areaId: "",
    assignmentId: "",
    startDate: "",
    endDate: "",
    restroomId: "",
    scheduleType: "Hằng ngày",
    shiftId: "",
  });
  const itemsPerPage = 5; // Hiển thị 5 items mỗi trang

  const handleActionClick = ({
    action,
    schedule,
  }: {
    action: string;
    schedule: Schedule;
  }) => {
    if (action === "view") {
      setSelectedSchedule(schedule);
      setShowViewModal(true);
    } else if (action === "edit") {
      setSelectedSchedule(schedule);
      // Populate form with current schedule data
      setUpdateScheduleData({
        scheduleName: schedule.scheduleName || "",
        areaId: schedule.areaId || "",
        assignmentId: schedule.assignmentId || "",
        startDate: schedule.startDate || "",
        endDate: schedule.endDate || "",
        restroomId: schedule.restroomId || "",
        scheduleType: schedule.scheduleType || "Hằng ngày",
        shiftId: schedule.shiftId || "",
      });
      setShowEditScheduleModal(true);
    } else if (action === "assign") {
      setSelectedSchedule(schedule);
      setShowAssignModal(true);
    } else if (action === "update") {
      setSelectedSchedule(schedule);
      setUpdateData({
        restroomId: schedule.restroomId || "",
        trashBinId: schedule.assignmentId || "",
      });
      setShowUpdateModal(true);
    }
  };

  const showNotificationMessage = (type: string, message: string) => {
    setNotification({
      isVisible: true,
      type,
      message,
    });
  };

  const hideNotification = () => {
    setNotification((prev) => ({
      ...prev,
      isVisible: false,
    }));
  };

  // Filter schedules based on search term and active tab
  const filteredSchedules = schedules.filter((schedule) => {
    // Search filtering - search by names and type only (no IDs)
    const matchesSearch = !searchTerm || 
      (schedule.areaName && schedule.areaName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (schedule.restroomName && schedule.restroomName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (schedule.shiftName && schedule.shiftName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (schedule.assignmentName && schedule.assignmentName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      schedule.scheduleType.toLowerCase().includes(searchTerm.toLowerCase());

    // Tab filtering
    if (activeTab === "all") return matchesSearch;
    if (activeTab === "Hằng ngày") return matchesSearch && (
      schedule.scheduleType.toLowerCase() === "cleaning" || 
      schedule.scheduleType.toLowerCase() === "daily" ||
      schedule.scheduleType.toLowerCase() === "hằng ngày"
    );
    if (activeTab === "Đột xuất") return matchesSearch && (
      schedule.scheduleType.toLowerCase() === "maintenance" || 
      schedule.scheduleType.toLowerCase() === "emergency" ||
      schedule.scheduleType.toLowerCase() === "đột xuất"
    );

    return matchesSearch;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredSchedules.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSchedules = filteredSchedules.slice(startIndex, endIndex);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddSchedule = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewSchedule({
      areaId: "",
      scheduleName: "",
      assignmentId: "",
      startDate: "",
      endDate: "",
      restroomId: "",
      scheduleType: "Hằng ngày",
      shiftId: "",
      supervisorId: "",
    });
  };

  const   handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSchedule(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitNewSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSchedule.areaId || !newSchedule.scheduleName ||
        !newSchedule.startDate || !newSchedule.endDate || !newSchedule.shiftId) {
      showNotificationMessage("error", "Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      await createSchedule(newSchedule);
      showNotificationMessage("success", "Đã thêm lịch trình thành công!");
      handleCloseAddModal();
    } catch (error) {
      console.error("Error creating schedule:", error);
      showNotificationMessage("error", "Có lỗi xảy ra khi tạo lịch trình!");
    }
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateModal(false);
    setUpdateData({
      restroomId: "",
      trashBinId: "",
    });
    setSelectedSchedule(null);
  };

  // Handlers for editing schedule information
  const handleCloseEditScheduleModal = () => {
    setShowEditScheduleModal(false);
    setUpdateScheduleData({
      scheduleName: "",
      areaId: "",
      assignmentId: "",
      startDate: "",
      endDate: "",
      restroomId: "",
      scheduleType: "Hằng ngày",
      shiftId: "",
    });
    setSelectedSchedule(null);
  };

  const handleEditScheduleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUpdateScheduleData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitEditSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSchedule) {
      showNotificationMessage("error", "Không có lịch trình được chọn!");
      return;
    }

    if (!updateScheduleData.scheduleName.trim() || !updateScheduleData.areaId || 
        !updateScheduleData.startDate || !updateScheduleData.endDate || !updateScheduleData.shiftId) {
      showNotificationMessage("error", "Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      await updateSchedule(selectedSchedule.scheduleId, updateScheduleData);
      showNotificationMessage("success", "Đã cập nhật lịch trình thành công!");
      handleCloseEditScheduleModal();
    } catch (error) {
      console.error("Error updating schedule:", error);
      showNotificationMessage("error", "Có lỗi xảy ra khi cập nhật lịch trình!");
    }
  };

  const handleUpdateDataChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setUpdateData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmitUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedSchedule) {
      showNotificationMessage("error", "Không có lịch trình được chọn!");
      return;
    }

    if (!updateData.restroomId && !updateData.trashBinId) {
      showNotificationMessage("error", "Vui lòng chọn ít nhất một vị trí để gán!");
      return;
    }

    try {
      // Create update payload
      const updatePayload = {
        ...selectedSchedule,
        restroomId: updateData.restroomId || selectedSchedule.restroomId,
        assignmentId: updateData.trashBinId || selectedSchedule.assignmentId,
      };

      await updateSchedule(selectedSchedule.scheduleId, updatePayload);
      showNotificationMessage("success", "Đã cập nhật gán vị trí thành công!");
      handleCloseUpdateModal();
    } catch (error) {
      console.error("Error updating schedule assignments:", error);
      showNotificationMessage("error", "Có lỗi xảy ra khi cập nhật gán vị trí!");
    }
  };



  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Notification */}
      {notification.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.isVisible}
          onClose={hideNotification}
        />
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #FF5B27",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto"
            }}></div>
            <p style={{ marginTop: "10px", textAlign: "center" }}>Đang tải...</p>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          backgroundColor: "#fee2e2",
          border: "1px solid #fecaca",
          color: "#dc2626",
          padding: "12px",
          margin: "16px",
          borderRadius: "6px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <span>⚠️ {error.message || error}</span>
          <button 
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: "#dc2626",
              color: "white",
              border: "none",
              padding: "6px 12px",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "12px"
            }}
          >
            Thử lại
          </button>
        </div>
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
              Quản lý lịch trình
            </h1>
            <span>Trang chủ</span>
            <span style={{ margin: "0 8px" }}>›</span>
            <span style={{ color: "#374151", fontWeight: "500" }}>
              Quản lý lịch trình
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
              onMouseEnter={(e: any) => {
                if (activeTab !== "all") {
                  e.target.style.color = "#374151";
                }
              }}
              onMouseLeave={(e: any) => {
                if (activeTab !== "all") {
                  e.target.style.color = "#6b7280";
                }
              }}
            >
              Tất cả
            </button>
            <button
              onClick={() => {
                setActiveTab("Hằng ngày");
                setCurrentPage(1);
              }}
              style={{
                padding: "12px 24px",
                border: "none",
                backgroundColor: "transparent",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                borderBottom: activeTab === "Hằng ngày" ? "2px solid #FF5B27" : "2px solid transparent",
                color: activeTab === "Hằng ngày" ? "#FF5B27" : "#6b7280",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e: any) => {
                if (activeTab !== "Hằng ngày") {
                  e.target.style.color = "#374151";
                }
              }}
              onMouseLeave={(e: any) => {
                if (activeTab !== "Hằng ngày") {
                  e.target.style.color = "#6b7280";
                }
              }}
            >
              Hằng ngày
            </button>
            <button
              onClick={() => {
                setActiveTab("Đột xuất");
                setCurrentPage(1);
              }}
              style={{
                padding: "12px 24px",
                border: "none",
                backgroundColor: "transparent",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                borderBottom: activeTab === "Đột xuất" ? "2px solid #FF5B27" : "2px solid transparent",
                color: activeTab === "Đột xuất" ? "#FF5B27" : "#6b7280",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e: any) => {
                if (activeTab !== "Đột xuất") {
                  e.target.style.color = "#374151";
                }
              }}
              onMouseLeave={(e: any) => {
                if (activeTab !== "Đột xuất") {
                  e.target.style.color = "#6b7280";
                }
              }}
            >
              Đột xuất
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
              placeholder="Tìm lịch trình"
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
            {/* Add Schedule Button */}
            <button
              onClick={handleAddSchedule}
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
              onMouseEnter={(e: any) => (e.target.style.backgroundColor = "#E04B1F")}
              onMouseLeave={(e: any) => (e.target.style.backgroundColor = "#FF5B27")}
            >
              <HiOutlinePlus style={{ width: "16px", height: "16px" }} />
              Thêm lịch trình
            </button>
          </div>
        </div>


      </div>

      {/* Schedule Table Container */}
      <div style={{ flex: "0 0 auto" }}>
        <ScheduleTable
          schedules={currentSchedules}
          onActionClick={handleActionClick}
        />
      </div>

      {/* Pagination */}
      <div style={{ flex: "0 0 auto", padding: "16px" }}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>

      {/* Schedule Details Modal */}
      <ScheduleDetailsModal
        schedule={selectedSchedule}
        isVisible={showViewModal}
        onClose={() => setShowViewModal(false)}
      />

      {/* Staff Assignment Modal */}
      <StaffAssignmentModal
        schedule={selectedSchedule}
        isVisible={showAssignModal}
        onClose={() => setShowAssignModal(false)}
      />

      {/* Update Schedule Assignment Modal */}
      {showUpdateModal && selectedSchedule && (
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
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseUpdateModal();
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "90%",
              maxWidth: "500px",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "600", margin: 0, color: "#111827" }}>
                🏗️ Cập nhật gán vị trí
              </h2>
              <p style={{ fontSize: "14px", color: "#6b7280", margin: "8px 0 0 0" }}>
                Lịch trình: <strong>{selectedSchedule.scheduleName}</strong>
              </p>
            </div>

            <form onSubmit={handleSubmitUpdate}>
              {/* Current Assignment Info */}
              <div style={{ 
                backgroundColor: "#f9fafb", 
                padding: "16px", 
                borderRadius: "8px", 
                marginBottom: "20px",
                border: "1px solid #e5e7eb"
              }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "600", color: "#374151" }}>
                  📋 Thông tin hiện tại
                </h4>
                <div style={{ fontSize: "13px", color: "#6b7280" }}>
                  <div>🏢 Khu vực: <strong>{selectedSchedule.areaName}</strong></div>
                  <div>🚻 Nhà vệ sinh: <strong>{selectedSchedule.restroomName || "Chưa gán"}</strong></div>
                  <div>🗑️ Thùng rác: <strong>{selectedSchedule.assignmentName || "Chưa gán"}</strong></div>
                </div>
              </div>

              {/* Restroom Selection */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "14px", 
                  fontWeight: "500",
                  color: "#374151"
                }}>
                  🚻 Nhà vệ sinh
                </label>
                <select
                  name="restroomId"
                  value={updateData.restroomId}
                  onChange={handleUpdateDataChange}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "white",
                  }}
                >
                  <option value="">Không gán nhà vệ sinh</option>
                  {restrooms && restrooms.length > 0 ? (
                    restrooms.map((restroom) => (
                      <option key={restroom.restroomId} value={restroom.restroomId}>
                        Nhà vệ sinh số {restroom.restroomNumber}
                        {restroom.area?.floorNumber !== undefined && 
                          ` (Tầng ${restroom.area.floorNumber === 0 ? "trệt" : restroom.area.floorNumber})`
                        }
                      </option>
                    ))
                  ) : (
                    <option disabled>Không có dữ liệu nhà vệ sinh</option>
                  )}
                </select>
              </div>

              {/* Trash Bin Selection */}
              <div style={{ marginBottom: "24px" }}>
                <label style={{ 
                  display: "block", 
                  marginBottom: "8px", 
                  fontSize: "14px", 
                  fontWeight: "500",
                  color: "#374151"
                }}>
                  🗑️ Thùng rác
                </label>
                <select
                  name="trashBinId"
                  value={updateData.trashBinId}
                  onChange={handleUpdateDataChange}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    backgroundColor: "white",
                  }}
                >
                  <option value="">Không gán thùng rác</option>
                                     {trashBins && trashBins.length > 0 ? (
                     trashBins.map((trashBin) => (
                       <option key={trashBin.trashBinId} value={trashBin.trashBinId}>
                         Thùng #{trashBin.trashBinId?.slice(-8)} 
                         {trashBin.area?.areaName && ` (${trashBin.area.areaName})`}
                       </option>
                     ))
                   ) : (
                     <option disabled>Không có dữ liệu thùng rác</option>
                   )}
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={handleCloseUpdateModal}
                  style={{
                    padding: "10px 20px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    color: "#374151",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = "#f9fafb"}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = "white"}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor: "#FF5B27",
                    color: "white",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = "#E04B1F"}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = "#FF5B27"}
                >
                  💾 Cập nhật gán vị trí
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal */}
      {showEditScheduleModal && selectedSchedule && (
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
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div style={{
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: "20px",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "16px"
            }}>
              <h2 style={{ 
                fontSize: "20px", 
                fontWeight: "600", 
                color: "#111827",
                margin: 0 
              }}>
                Cập nhật lịch trình
              </h2>
              <button
                onClick={handleCloseEditScheduleModal}
                style={{
                  color: "#6b7280",
                  background: "transparent",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                }}
                onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = "#f3f4f6"}
                onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = "transparent"}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitEditSchedule}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                {/* Schedule Name */}
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                    Tên lịch trình *
                  </label>
                  <input
                    type="text"
                    name="scheduleName"
                    value={updateScheduleData.scheduleName}
                    onChange={handleEditScheduleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                {                   /* Schedule Type */}
                 <div>
                   <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                     Loại lịch trình *
                   </label>
                   <select
                     name="scheduleType"
                     value={updateScheduleData.scheduleType}
                     onChange={handleEditScheduleInputChange}
                     required
                     style={{
                       width: "100%",
                       padding: "8px 12px",
                       border: "1px solid #d1d5db",
                       borderRadius: "6px",
                       fontSize: "14px",
                     }}
                   >
                     <option value="Hằng ngày">Hằng ngày</option>
                     <option value="Đột xuất">Đột xuất</option>
                   </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                {/* Area Selection */}
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                    Khu vực *
                  </label>
                  <select
                    name="areaId"
                    value={updateScheduleData.areaId}
                    onChange={handleEditScheduleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="">-- Chọn khu vực --</option>
                    {areas && areas.length > 0 ? (
                      areas.map((area) => (
                        <option key={area.areaId} value={area.areaId}>
                          {area.areaName}
                        </option>
                      ))
                    ) : (
                      <option disabled>Không có dữ liệu khu vực</option>
                    )}
                  </select>
                </div>

                {/* Shift Selection */}
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                    Ca làm việc *
                  </label>
                  <select
                    name="shiftId"
                    value={updateScheduleData.shiftId}
                    onChange={handleEditScheduleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="">-- Chọn ca làm việc --</option>
                    {shifts && shifts.length > 0 ? (
                      shifts.map((shift) => (
                        <option key={shift.shiftId} value={shift.shiftId}>
                          {shift.shiftName}
                        </option>
                      ))
                    ) : (
                      <option disabled>Không có dữ liệu ca làm việc</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Assignment Selection
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                  Loại công việc
                </label>
                <select
                  name="assignmentId"
                  value={updateScheduleData.assignmentId}
                  onChange={handleEditScheduleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                >
                                     <option value="">-- Chọn loại công việc --</option>
                   {assignments && assignments.length > 0 ? (
                     assignments.map((assignment) => (
                       <option key={assignment.assignmentId} value={assignment.assignmentId}>
                         {assignment.assignmentName}
                       </option>
                     ))
                   ) : (
                     <option disabled>Không có dữ liệu loại công việc</option>
                   )}
                </select>
              </div> */}

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                {/* Start Date */}
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={updateScheduleData.startDate}
                    onChange={handleEditScheduleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                {/* End Date */}
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                    Ngày kết thúc *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={updateScheduleData.endDate}
                    onChange={handleEditScheduleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              {/* Optional Fields
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "8px", fontSize: "14px", fontWeight: "500" }}>
                  Nhà vệ sinh (tùy chọn)
                </label>
                <select
                  name="restroomId"
                  value={updateScheduleData.restroomId}
                  onChange={handleEditScheduleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                >
                  <option value="">-- Chọn nhà vệ sinh --</option>
                  {restrooms && restrooms.length > 0 ? (
                    restrooms.map((restroom) => (
                      <option key={restroom.restroomId} value={restroom.restroomId}>
                        Nhà vệ sinh {restroom.restroomNumber}
                      </option>
                    ))
                  ) : (
                    <option disabled>Không có dữ liệu nhà vệ sinh</option>
                  )}
                </select>
              </div> */}

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={handleCloseEditScheduleModal}
                  style={{
                    padding: "10px 20px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    color: "#374151",
                    fontSize: "14px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = "#f9fafb"}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = "white"}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor: "#FF5B27",
                    color: "white",
                    fontSize: "14px",
                    cursor: "pointer",
                    fontWeight: "500",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = "#E04B1F"}
                  onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = "#FF5B27"}
                >
                  Cập nhật lịch trình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Schedule Modal */}
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
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseAddModal();
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>
                Thêm lịch trình mới
              </h2>
            </div>

            <form onSubmit={handleSubmitNewSchedule}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                {/* Schedule Name */}
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                    Tên lịch trình *
                  </label>
                  <input
                    type="text"
                    name="scheduleName"
                    value={newSchedule.scheduleName}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                {                  /* Schedule Type */}
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                    Loại lịch trình *
                  </label>
                  <select
                    name="scheduleType"
                    value={newSchedule.scheduleType}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="Hằng ngày">Hằng ngày</option>
                    <option value="Đột xuất">Đột xuất</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                {/* Area */}
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                    Khu vực *
                  </label>
                  <select
                    name="areaId"
                    value={newSchedule.areaId}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="">Chọn khu vực</option>
                    {areasLoading ? (
                      <option disabled>Đang tải dữ liệu khu vực...</option>
                    ) : areasError ? (
                      <option disabled>Lỗi tải dữ liệu khu vực</option>
                    ) : areas && areas.length > 0 ? (
                      areas.map((area) => (
                        <option key={area.areaId} value={area.areaId}>
                          {area.areaName}
                        </option>
                      ))
                    ) : (
                      <option disabled>Không có dữ liệu khu vực</option>
                    )}
                  </select>
                </div>

                
                {/* Shift */}
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                    Ca làm việc *
                  </label>
                  <select
                    name="shiftId"
                    value={newSchedule.shiftId}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="">Chọn ca làm việc</option>
                    {shiftsLoading ? (
                      <option disabled>Đang tải dữ liệu ca làm việc...</option>
                    ) : shiftsError ? (
                      <option disabled>Lỗi tải dữ liệu ca làm việc</option>
                    ) : shifts && shifts.length > 0 ? (
                      shifts.map((shift) => (
                        <option key={shift.shiftId} value={shift.shiftId}>
                          {shift.shiftName}
                        </option>
                      ))
                    ) : (
                      <option disabled>Không có dữ liệu ca làm việc</option>
                    )}
                  </select>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                {/* Start Date */}
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={newSchedule.startDate}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                {/* End Date */}
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                    Ngày kết thúc *
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={newSchedule.endDate}
                    onChange={handleInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              {/* Supervisor Selection */}
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                  Giám sát viên vệ sinh
                </label>
                <select
                  name="supervisorId"
                  value={newSchedule.supervisorId}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                  }}
                >
                  <option value="">Chọn giám sát viên (tùy chọn)</option>
                  {supervisors && supervisors.length > 0 ? (
                    supervisors.map((supervisor: any) => (
                      <option key={supervisor.id} value={supervisor.id}>
                        {supervisor.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>Không có giám sát viên nào</option>
                  )}
                </select>
              </div>



              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  style={{  
                    padding: "10px 20px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    color: "#374151",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor: "#FF5B27",
                    color: "white",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Thêm lịch trình
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Schedules; 