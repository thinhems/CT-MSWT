import { HiOutlineX, HiOutlineClipboardList, HiOutlinePlus } from "react-icons/hi";
import { Schedule } from "@/config/models/schedule.model";
import { useScheduleDetails } from "../hooks/useScheduleDetails";
import { useAssignments } from "../hooks/useAssignments";
import { useShifts } from "../hooks/useShifts";
import { useUsers } from "../hooks/useUsers";
import { API_URLS } from "../constants/api-urls";
import { swrFetcher } from "../utils/swr-fetcher";
import useSWR from "swr";
import { useMemo, useState } from "react";

interface IProps {
  schedule: Schedule | null;
  isVisible: boolean;
  onClose: () => void;
}

const ScheduleDetailsModal = ({ schedule, isVisible, onClose }: IProps) => {
  // Fetch detailed schedule information from API
  const { data: scheduleDetail, error: scheduleError, isLoading: scheduleLoading } = useSWR(
    schedule?.scheduleId ? API_URLS.SCHEDULE.GET_BY_ID(schedule.scheduleId) : null,
    swrFetcher
  );

  const { assignments } = useAssignments();
  const { shifts } = useShifts(); // Keep for shift name lookup
  const { scheduleDetails, createScheduleDetailForSchedule } = useScheduleDetails(schedule?.scheduleId);
  const { users } = useUsers();
  
  // Fetch unassigned workers using API
  const { data: unassignedWorkers, error: unassignedWorkersError, isLoading: isLoadingWorkers } = useSWR(
    API_URLS.USER.GET_UNASSIGNED_WORKERS,
    swrFetcher
  );
  
  // State for creating new schedule detail
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [detailSearchTerm, setDetailSearchTerm] = useState("");
  const [activeWorkerNameTab, setActiveWorkerNameTab] = useState("Tất cả");
  const [newDetail, setNewDetail] = useState({
    assignmentId: "",
    description: "",
    workerId: "",
  });
  
  // Filter unassigned workers by position for staff assignment
  const workers = useMemo(() => {
    if (!unassignedWorkers) return [];
    return unassignedWorkers.filter((worker: any) => worker.description === "Nhân viên vệ sinh");
  }, [unassignedWorkers]);



  // Get shift name from shiftId
  const getShiftName = useMemo(() => {
    if (!shifts || !scheduleDetail?.shiftId) return scheduleDetail?.shiftId || "N/A";
    const shift = shifts.find((s: any) => s.shiftId === scheduleDetail.shiftId);
    return shift?.shiftName || `Ca ${scheduleDetail.shiftId}`;
  }, [shifts, scheduleDetail?.shiftId]);

  console.log("🔍 Schedule Detail Debug Info:");
  console.log("- Schedule ID:", schedule?.scheduleId);
  console.log("- API URL:", schedule?.scheduleId ? API_URLS.SCHEDULE.GET_BY_ID(schedule.scheduleId) : "No URL");
  console.log("- Schedule detail data:", scheduleDetail);
  console.log("- Schedule error:", scheduleError);
  console.log("- Schedule loading:", scheduleLoading);

  // Handle form input changes
  const handleDetailInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewDetail(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmitDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedule?.scheduleId || !newDetail.description.trim() || !newDetail.assignmentId.trim()) {
      alert("Vui lòng nhập đầy đủ thông tin công việc và chọn loại công việc!");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create FormData object
      const formData = new FormData();
      formData.append('Description', newDetail.description);
      formData.append('Date', new Date().toISOString()); // Use current date
      formData.append('Status', ''); // Send empty status
      formData.append('WorkerId', newDetail.workerId || '');
      formData.append('AssignmentId', newDetail.assignmentId);
      
      await createScheduleDetailForSchedule(schedule.scheduleId, formData);
      
      const assignmentMsg = newDetail.workerId 
        ? " và đã gán nhân viên thực hiện"
        : "";
      
      alert(`✅ Tạo chi tiết lịch trình thành công${assignmentMsg}!`);
      setShowCreateForm(false);
      setNewDetail({
        assignmentId: "",
        description: "",
        workerId: "",
      });
    } catch (error) {
      console.error("Error creating schedule detail:", error);
      alert("❌ Có lỗi xảy ra khi tạo chi tiết lịch trình!");
    } finally {
      setIsSubmitting(false);
    }
  };

      // Get user name by ID - check both unassignedWorkers and users
    const getUserName = (userId: string) => {
      if (!userId) return "Chưa gán";
      
      // First check in unassignedWorkers
      if (unassignedWorkers) {
        const user = unassignedWorkers.find((u: any) => u.userId === userId);
        if (user?.fullName) return user.fullName;
      }
      
      // Then check in users (for supervisors and other users)
      if (users) {
        const user = users.find((u: any) => u.id === userId);
        if (user?.name) return user.name;
      }
      
      // Fallback to userId if no name found
      return userId;
    };


  const workerNameTabs = useMemo(() => {
    if (!scheduleDetails) return ["Tất cả"];
    const names = new Set<string>();
    scheduleDetails.forEach((d: any) => {
      const name = getUserName(d.workerId);
      if (name && name !== "Chưa gán") names.add(name);
    });
    return ["Tất cả", ...Array.from(names)];
  }, [scheduleDetails, unassignedWorkers, users]);

  // Filter schedule details by worker name
  const filteredScheduleDetails = useMemo(() => {
    if (!scheduleDetails) return [];
    const term = detailSearchTerm.toLowerCase();
    return scheduleDetails.filter((detail: any) => {
      const matchesName = !term || getUserName(detail.workerId).toLowerCase().includes(term);
      const matchesNameTab =
        activeWorkerNameTab === "Tất cả" ||
        getUserName(detail.workerId) === activeWorkerNameTab;
      return matchesName && matchesNameTab;
    });
  }, [scheduleDetails, detailSearchTerm, activeWorkerNameTab, unassignedWorkers, users]);

  const getScheduleTypeDisplay = (type: string) => {
    switch (type?.toLowerCase()) {
      case "cleaning":
        return "Hằng ngày";
      case "maintenance":
        return "Đột xuất";
      default:
        return type;
    }
  };

  if (!isVisible || !schedule) return null;

  // Show loading state while fetching schedule details
  if (scheduleLoading) {
    return (
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
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            width: "400px",
            padding: "40px",
            textAlign: "center",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: "16px", color: "#374151" }}>Đang tải thông tin lịch trình...</div>
        </div>
      </div>
    );
  }

  // Show error state if failed to fetch schedule details
  if (scheduleError) {
    return (
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
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            width: "400px",
            padding: "40px",
            textAlign: "center",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ fontSize: "16px", color: "#dc2626", marginBottom: "16px" }}>
            Không thể tải thông tin lịch trình
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "12px 24px",
              backgroundColor: "#FF5B27",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  // Use data from API response, fallback to props if not available
  const displaySchedule = scheduleDetail || schedule;

  return (
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
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          width: "90vw",
          maxWidth: "1200px",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "24px",
            borderBottom: "1px solid #e5e7eb",
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
            Thông tin lịch trình
          </h2>
          <button
            onClick={onClose}
            style={{
              padding: "8px",
              border: "none",
              borderRadius: "6px",
              backgroundColor: "transparent",
              cursor: "pointer",
              color: "#6b7280",
            }}
            onMouseEnter={(e: any) => {
              e.target.style.backgroundColor = "#f3f4f6";
            }}
            onMouseLeave={(e: any) => {
              e.target.style.backgroundColor = "transparent";
            }}
          >
            <HiOutlineX style={{ width: "24px", height: "24px" }} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: "24px" }}>
          {/* Schedule Info */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              padding: "24px",
              marginBottom: "24px"
            }}
          >
            <h3
              style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "20px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "0"
              }}
            >
              <HiOutlineClipboardList style={{ width: "24px", height: "24px" }} />
              {displaySchedule.scheduleName}
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "20px",
              }}
            >
              <div>
                <span style={{ 
                  fontWeight: "600", 
                  color: "#6b7280",
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  Loại lịch trình
                </span>
                <div style={{ 
                  color: "#111827", 
                  fontSize: "16px", 
                  fontWeight: "500",
                  marginTop: "4px"
                }}>
                  {getScheduleTypeDisplay(displaySchedule.scheduleType)}
                </div>
              </div>

              <div>
                <span style={{ 
                  fontWeight: "600",
                  color: "#6b7280",
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  Ngày bắt đầu
                </span>
                <div style={{ 
                  color: "#111827", 
                  fontSize: "16px", 
                  fontWeight: "500",
                  marginTop: "4px"
                }}>
                  {new Date(displaySchedule.startDate).toLocaleDateString("vi-VN")}
                </div>
              </div>

              <div>
                <span style={{ 
                  fontWeight: "600", 
                  color: "#6b7280",
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  Ngày kết thúc
                </span>
                <div style={{ 
                  color: "#111827", 
                  fontSize: "16px", 
                  fontWeight: "500",
                  marginTop: "4px"
                }}>
                  {new Date(displaySchedule.endDate).toLocaleDateString("vi-VN")}
                </div>
              </div>

              <div>
                <span style={{ 
                  fontWeight: "600", 
                  color: "#6b7280",
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  Khu vực
                </span>
                <div style={{ 
                  color: "#111827", 
                  fontSize: "16px", 
                  fontWeight: "500",
                  marginTop: "4px"
                }}>
                  {displaySchedule.areaName}
                </div>
              </div>

              

              <div>
                <span style={{ 
                  fontWeight: "600", 
                  color: "#6b7280",
                  fontSize: "14px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em"
                }}>
                  Ca làm việc
                </span>
                <div style={{ 
                  color: "#111827", 
                  fontSize: "16px", 
                  fontWeight: "500",
                  marginTop: "4px"
                }}>
                  {getShiftName}
                </div>
              </div>


            </div>
          </div>

          {/* Supervisor Section - Separate from main table */}
          <div style={{
            backgroundColor: "#f0f9ff",
            border: "1px solid #e0f2fe",
            borderRadius: "12px",
            padding: "10px",
            marginTop: "14px",
            marginBottom: "14px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center"
          }}>
            <span style={{ 
              fontWeight: "700", 
              color: "#1e40af",
              fontSize: "13px",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px"
            }}>
              👨‍💼 Giám sát viên vệ sinh
            </span>
                         <div style={{ 
               color: displaySchedule.supervisorId ? "#1e40af" : "#6b7280", 
               fontSize: "13px", 
               fontWeight: displaySchedule.supervisorId ? "600" : "500",
               padding: "12px 24px",
               backgroundColor: displaySchedule.supervisorId ? "#dbeafe" : "#f3f4f6",
               borderRadius: "8px",
               display: "inline-block",
               minWidth: "150px",
               border: `2px solid ${displaySchedule.supervisorId ? "#bfdbfe" : "#e5e7eb"}`
             }}>
               {displaySchedule.supervisorId ? getUserName(displaySchedule.supervisorId) : "Chưa gán"}
             </div>
          </div>

          {/* Area Restrooms Section */}
          {displaySchedule.areaRestrooms && displaySchedule.areaRestrooms.length > 0 && (
            <div style={{ 
              marginBottom: "24px",
              backgroundColor: "#f0f9ff",
              borderRadius: "8px",
              padding: "16px",
              border: "1px solid #e0f2fe"
            }}>
              <h4 style={{ 
                fontSize: "14px", 
                fontWeight: "600", 
                color: "#374151",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                🚻 Nhà vệ sinh trong khu vực
              </h4>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                gap: "8px" 
              }}>
                {displaySchedule.areaRestrooms.map((restroom: any) => (
                  <div key={restroom.restroomId} style={{
                    backgroundColor: "white",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    fontSize: "13px"
                  }}>
                    <div style={{ fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                      Phòng {restroom.restroomNumber}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: "12px", marginBottom: "4px" }}>
                      {restroom.description}
                    </div>
                    <div style={{ 
                      fontSize: "11px", 
                      padding: "2px 6px", 
                      borderRadius: "4px",
                      display: "inline-block",
                      backgroundColor: restroom.status === "Hoạt động" ? "#dcfce7" : "#fee2e2",
                      color: restroom.status === "Hoạt động" ? "#15803d" : "#dc2626"
                    }}>
                      {restroom.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Area Trash Bins Section */}
          {displaySchedule.areaTrashBins && displaySchedule.areaTrashBins.length > 0 && (
            <div style={{ 
              marginBottom: "24px",
              backgroundColor: "#fef3c7",
              borderRadius: "8px",
              padding: "16px",
              border: "1px solid #fed7aa"
            }}>
              <h4 style={{ 
                fontSize: "14px", 
                fontWeight: "600", 
                color: "#374151",
                marginBottom: "12px",
                marginTop: "0"
              }}>
                🗑️ Thùng rác trong khu vực
              </h4>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                gap: "8px" 
              }}>
                {displaySchedule.areaTrashBins.map((trashBin: any) => (
                  <div key={trashBin.trashBinId} style={{
                    backgroundColor: "white",
                    padding: "12px",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb",
                    fontSize: "13px"
                  }}>
                    <div style={{ fontWeight: "600", color: "#374151", marginBottom: "4px" }}>
                      {trashBin.trashBinId.length > 6 
                        ? `${trashBin.trashBinId.substring(0, 2)}${trashBin.trashBinId.substring(trashBin.trashBinId.length - 2)}`
                        : trashBin.trashBinId
                      }
                    </div>
                    <div style={{ color: "#6b7280", fontSize: "12px", marginBottom: "4px" }}>
                      📍 {trashBin.location}
                    </div>
                    <div style={{ 
                      fontSize: "11px", 
                      padding: "2px 6px", 
                      borderRadius: "4px",
                      display: "inline-block",
                      backgroundColor: trashBin.status === "Hoạt động" ? "#dcfce7" : "#fee2e2",
                      color: trashBin.status === "Hoạt động" ? "#15803d" : "#dc2626"
                    }}>
                      {trashBin.status === "Hoạt động" ? "Hoạt động" : trashBin.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Schedule Details Section */}
          <div>
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center", 
              marginBottom: "16px",
              gap: "12px"
            }}>
              <h3 style={{ 
                fontSize: "18px", 
                fontWeight: "600", 
                color: "#374151",
                margin: 0 
              }}>
                Chi tiết công việc
              </h3>
              {/* Search input */}
              <div style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
                <input
                  type="text"
                  placeholder="Lọc theo tên nhân viên"
                  value={detailSearchTerm}
                  onChange={(e) => setDetailSearchTerm(e.target.value)}
                  style={{
                    width: "60%",
                    maxWidth: "280px",
                    padding: "8px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                />
              </div>
              <button
                onClick={() => {
                  setShowCreateForm(!showCreateForm);
                  if (!showCreateForm) {
                    // Reset form when opening
                    setNewDetail({
                      assignmentId: "",
                      description: "",
                      workerId: "",
                    });
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backgroundColor: "#FF5B27",
                  color: "white",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e: any) => (e.target.style.backgroundColor = "#E04B1F")}
                onMouseLeave={(e: any) => (e.target.style.backgroundColor = "#FF5B27")}
              >
                <HiOutlinePlus style={{ width: "14px", height: "14px" }} />
                Thêm chi tiết
              </button>
            </div>

            {/* Worker name tabs only */}

            {/* Worker name tabs */}
            <div style={{ marginBottom: "12px", borderBottom: "1px solid #e5e7eb", display: "flex", gap: "12px", overflowX: "auto" }}>
              {workerNameTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveWorkerNameTab(tab)}
                  style={{
                    padding: "8px 12px",
                    border: "none",
                    backgroundColor: "transparent",
                    fontSize: "13px",
                    fontWeight: 500,
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    borderBottom: activeWorkerNameTab === tab ? "2px solid #FF5B27" : "2px solid transparent",
                    color: activeWorkerNameTab === tab ? "#FF5B27" : "#6b7280",
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Create Form */}
            {showCreateForm && (
              <form onSubmit={handleSubmitDetail} style={{
                backgroundColor: "#f0f9ff",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "16px",
                border: "1px solid #e0f2fe"
              }}>
                <h4 style={{ 
                  fontSize: "16px", 
                  fontWeight: "600", 
                  color: "#374151",
                  marginBottom: "16px",
                  marginTop: "0"
                }}>
                  Chi tiết lịch trình
                </h4>
                
                {/* Assignment Selection */}
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ 
                    marginBottom: "8px"
                  }}>
                    <label style={{ 
                      fontSize: "14px", 
                      fontWeight: "500",
                      color: "#374151"
                    }}>
                      Loại công việc
                    </label>
                  </div>
                  <select
                    name="assignmentId"
                    value={newDetail.assignmentId}
                    onChange={handleDetailInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      backgroundColor: "white",
                      fontFamily: "inherit"
                    }}
                  >
                    <option value="">-- Chọn loại công việc --</option>
                    {assignments.map((assignment) => (
                      <option key={assignment.assignmentId} value={assignment.assignmentId}>
                        {assignment.assignmentName}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Description */}
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ 
                    marginBottom: "8px"
                  }}>
                    <label style={{ 
                      fontSize: "14px", 
                      fontWeight: "500",
                      color: "#374151"
                    }}>
                      Mô tả công việc
                    </label>
                  </div>
                  <textarea
                    name="description"
                    value={newDetail.description}
                    onChange={handleDetailInputChange}
                    placeholder=""
                    required
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      resize: "vertical",
                      fontFamily: "inherit",
                      backgroundColor: "white"
                    }}
                  />
                </div>

                {/* Staff Assignment Section */}
                <div style={{ 
                  backgroundColor: "#f0f9ff", 
                  borderRadius: "8px", 
                  padding: "16px", 
                  marginBottom: "20px",
                  border: "1px solid #e0f2fe"
                }}>
                  
                  
                  <h5 style={{ 
                    fontSize: "14px", 
                    fontWeight: "600", 
                    color: "#374151",
                    marginBottom: "12px",
                    marginTop: "0",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    👥 Gán nhân viên
                  </h5>
                  
                  {/* Worker Selection */}
                  <div>
                    <div style={{ 
                      marginBottom: "8px"
                    }}>
                      <label style={{ 
                        fontSize: "13px", 
                        fontWeight: "500",
                        color: "#374151"
                      }}>
                        Nhân viên thực hiện
                      </label>
                    </div>
                    <select
                      name="workerId"
                      value={newDetail.workerId}
                      onChange={handleDetailInputChange}
                      disabled={isLoadingWorkers}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "13px",
                        backgroundColor: isLoadingWorkers ? "#f3f4f6" : "white",
                        fontFamily: "inherit",
                        cursor: isLoadingWorkers ? "not-allowed" : "pointer",
                      }}
                    >
                      <option value="">
                        {isLoadingWorkers ? "Đang tải..." : "-- Chọn nhân viên --"}
                      </option>
                      {!isLoadingWorkers && workers.length === 0 && (
                        <option value="" disabled>
                          Không có nhân viên vệ sinh nào khả dụng
                        </option>
                      )}
                      {workers.map((worker: any) => (
                        <option key={worker.userId} value={worker.userId}>
                          {worker.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ 
                  display: "flex", 
                  gap: "12px", 
                  justifyContent: "flex-end"
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewDetail({
                        assignmentId: "",
                        description: "",
                        workerId: "",
                      });
                    }}
                    style={{
                      padding: "10px 20px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      backgroundColor: "white",
                      color: "#374151",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: "10px 20px",
                      border: "none",
                      borderRadius: "6px",
                      backgroundColor: isSubmitting ? "#9ca3af" : "#FF5B27",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                    }}
                  >
                    {isSubmitting ? "Đang tạo..." : "Tạo chi tiết"}
                  </button>
                </div>
              </form>
            )}

            {/* Schedule Details List */}
            <div style={{ marginBottom: "16px" }}>
              {filteredScheduleDetails && filteredScheduleDetails.length > 0 ? (
                <div style={{ 
                  backgroundColor: "white", 
                  borderRadius: "10px", 
                  border: "1px solid #e5e7eb",
                  overflow: "hidden"
                }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <colgroup>
                      <col style={{ width: "28%" }} />
                      <col style={{ width: "18%" }} />
                      <col style={{ width: "32%" }} />
                      <col style={{ width: "12%" }} />
                      <col style={{ width: "10%" }} />
                    </colgroup>
                    <thead>
                      <tr style={{ backgroundColor: "#FEF6F4", borderBottom: "1px solid #f3f4f6" }}>
                        <th style={{ textAlign: "left", padding: "12px 14px", fontSize: "11px", color: "#374151", textTransform: "uppercase", letterSpacing: "0.03em" }}>Tên chi tiết công việc</th>
                        <th style={{ textAlign: "left", padding: "12px 14px", fontSize: "11px", color: "#374151", textTransform: "uppercase", letterSpacing: "0.03em" }}>Loại công việc</th>
                        <th style={{ textAlign: "left", padding: "12px 14px", fontSize: "11px", color: "#374151", textTransform: "uppercase", letterSpacing: "0.03em" }}>Mô tả</th>
                        <th style={{ textAlign: "left", padding: "12px 14px", fontSize: "11px", color: "#374151", textTransform: "uppercase", letterSpacing: "0.03em" }}>Ngày</th>
                        <th style={{ textAlign: "left", padding: "12px 14px", fontSize: "11px", color: "#374151", textTransform: "uppercase", letterSpacing: "0.03em" }}>Đánh giá</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredScheduleDetails.map((detail: any, index: number) => {
                        const ratingValue = detail.rating ? parseInt(detail.rating) : 0;
                        const zebra = index % 2 === 1 ? "#fafafa" : "transparent";
                        return (
                          <tr key={detail.scheduleDetailId} style={{ backgroundColor: zebra, transition: "background-color 0.2s" }}
                              onMouseEnter={(e: any) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                              onMouseLeave={(e: any) => (e.currentTarget.style.backgroundColor = zebra)}>
                            <td style={{ padding: "12px 14px", fontSize: "13px", color: "#111827", verticalAlign: "top" }}>
                              <div style={{ fontWeight: 600 }}>{`Chi tiết công việc #${detail.scheduleDetailId.slice(0, 8)}`}</div>
                            </td>
                            <td style={{ padding: "12px 14px", fontSize: "13px", color: "#374151", verticalAlign: "top" }}>
                              <span style={{ backgroundColor: "#f3f4f6", padding: "4px 10px", borderRadius: 6, display: "inline-block", fontSize: "12px" }}>
                                {detail.assignmentName || "Chưa xác định"}
                              </span>
                            </td>
                            <td style={{ padding: "12px 14px", fontSize: "13px", color: "#374151", verticalAlign: "top", whiteSpace: "pre-wrap" }}>
                              {detail.description || "Không có mô tả"}
                            </td>
                            <td style={{ padding: "12px 14px", fontSize: "13px", color: "#374151", verticalAlign: "top" }}>
                              {new Date(detail.date).toLocaleDateString("vi-VN")}
                            </td>
                            <td style={{ padding: "12px 14px", fontSize: "13px", color: "#374151", verticalAlign: "top" }}>
                              {ratingValue > 0 ? (
                                <span>
                                  {[1,2,3,4,5].map((star) => (
                                    <span key={star} style={{ color: star <= ratingValue ? "#f59e0b" : "#d1d5db", marginRight: 2 }}>★</span>
                                  ))}
                                  <span style={{ marginLeft: 6, color: "#6b7280", fontSize: "12px" }}>
                                    {ratingValue}/5
                                  </span>
                                </span>
                              ) : (
                                <span style={{ color: "#6b7280", fontSize: "12px" }}>
                                  Chưa đánh giá
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{ 
                  textAlign: "center", 
                  color: "#6b7280", 
                  fontSize: "14px",
                  padding: "32px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px"
                }}>
                  Không tìm thấy chi tiết công việc phù hợp
                </div>
              )}
            </div>

            {/* Create Form */}
            {showCreateForm && (
              <form onSubmit={handleSubmitDetail} style={{
                backgroundColor: "#f0f9ff",
                borderRadius: "8px",
                padding: "20px",
                marginBottom: "16px",
                border: "1px solid #e0f2fe"
              }}>
                <h4 style={{ 
                  fontSize: "16px", 
                  fontWeight: "600", 
                  color: "#374151",
                  marginBottom: "16px",
                  marginTop: "0"
                }}>
                  Chi tiết lịch trình
                </h4>
                
                {/* Assignment Selection */}
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ 
                    marginBottom: "8px"
                  }}>
                    <label style={{ 
                      fontSize: "14px", 
                      fontWeight: "500",
                      color: "#374151"
                    }}>
                      Loại công việc
                    </label>
                  </div>
                  <select
                    name="assignmentId"
                    value={newDetail.assignmentId}
                    onChange={handleDetailInputChange}
                    required
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      backgroundColor: "white",
                      fontFamily: "inherit"
                    }}
                  >
                    <option value="">-- Chọn loại công việc --</option>
                    {assignments.map((assignment) => (
                      <option key={assignment.assignmentId} value={assignment.assignmentId}>
                        {assignment.assignmentName}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Description */}
                <div style={{ marginBottom: "20px" }}>
                  <div style={{ 
                    marginBottom: "8px"
                  }}>
                    <label style={{ 
                      fontSize: "14px", 
                      fontWeight: "500",
                      color: "#374151"
                    }}>
                      Mô tả công việc
                    </label>
                  </div>
                  <textarea
                    name="description"
                    value={newDetail.description}
                    onChange={handleDetailInputChange}
                    placeholder=""
                    required
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "14px",
                      resize: "vertical",
                      fontFamily: "inherit",
                      backgroundColor: "white"
                    }}
                  />
                </div>





                {/* Staff Assignment Section */}
                <div style={{ 
                  backgroundColor: "#f0f9ff", 
                  borderRadius: "8px", 
                  padding: "16px", 
                  marginBottom: "20px",
                  border: "1px solid #e0f2fe"
                }}>
                  <h5 style={{ 
                    fontSize: "14px", 
                    fontWeight: "600", 
                    color: "#374151",
                    marginBottom: "12px",
                    marginTop: "0",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}>
                    👥 Gán nhân viên
                  </h5>
                  
                  {/* Worker Selection */}
                  <div>
                    <div style={{ 
                      marginBottom: "8px"
                    }}>
                      <label style={{ 
                        fontSize: "13px", 
                        fontWeight: "500",
                        color: "#374151"
                      }}>
                        Nhân viên thực hiện
                      </label>
                    </div>
                    <select
                      name="workerId"
                      value={newDetail.workerId}
                      onChange={handleDetailInputChange}
                      disabled={isLoadingWorkers}
                      style={{
                        width: "100%",
                        padding: "10px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        fontSize: "13px",
                        backgroundColor: isLoadingWorkers ? "#f3f4f6" : "white",
                        fontFamily: "inherit",
                        cursor: isLoadingWorkers ? "not-allowed" : "pointer",
                      }}
                    >
                      <option value="">
                        {isLoadingWorkers ? "Đang tải..." : "-- Chọn nhân viên --"}
                      </option>
                      {!isLoadingWorkers && workers.length === 0 && (
                        <option value="" disabled>
                          Không có nhân viên vệ sinh nào khả dụng
                        </option>
                      )}
                      {workers.map((worker: any) => (
                        <option key={worker.userId} value={worker.userId}>
                          {worker.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ 
                  display: "flex", 
                  gap: "12px", 
                  justifyContent: "flex-end"
                }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewDetail({
                        assignmentId: "",
                        description: "",
                        workerId: "",
                      });
                    }}
                    style={{
                      padding: "10px 20px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      backgroundColor: "white",
                      color: "#374151",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                    }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      padding: "10px 20px",
                      border: "none",
                      borderRadius: "6px",
                      backgroundColor: isSubmitting ? "#9ca3af" : "#FF5B27",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                    }}
                  >
                    {isSubmitting ? "Đang tạo..." : "Tạo chi tiết"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Footer */}
          <div style={{ 
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "24px",
            paddingTop: "20px",
            borderTop: "1px solid #e5e7eb"
          }}>
            <button
              onClick={onClose}
              style={{
                padding: "12px 24px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                backgroundColor: "white",
                color: "#374151",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
              onMouseEnter={(e: any) => {
                e.target.style.backgroundColor = "#f9fafb";
              }}
              onMouseLeave={(e: any) => {
                e.target.style.backgroundColor = "white";
              }}
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleDetailsModal; 