import { HiOutlineX, HiOutlineClipboardList, HiOutlinePlus, HiOutlineClock, HiOutlineUser, HiOutlineMap, HiOutlineSearch } from "react-icons/hi";
import { Schedule } from "@/config/models/schedule.model";
import { useScheduleDetails } from "../hooks/useScheduleDetails";
import { useAssignments } from "../hooks/useAssignments";
import { useShifts } from "../hooks/useShifts";
import { useUsers } from "../hooks/useUsers";
import { useWorkerGroup } from "../hooks/useWorkerGroup";
import { API_URLS } from "../constants/api-urls";
import { swrFetcher } from "../utils/swr-fetcher";
import useSWR from "swr";
import { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { authService } from "../services/authService";

interface ScheduleDetailResponse {
  scheduleDetailId: string;
  scheduleId: string;
  description: string;
  date: string;
  status: string;
  rating: number | null;
  workerGroupId: string;
  workerGroupName: string;
  backupForUserId: string | null;
  endTime: string;
  startTime: string;
  isBackup: boolean | null;
  groupAssignmentId: string;
  comment: string | null;
  areaId: string;
  schedule: {
    scheduleId: string;
    startDate: string;
    endDate: string;
    scheduleType: string;
    shiftId: string;
    scheduleName: string;
    areaName?: string;
  };
  workers: Array<{
    workGroupMemberId: string;
    workGroupId: string;
    userId: string;
    roleId: string;
    joinedAt: string;
    leftAt: string | null;
    fullName: string;
  }>;
  assignments: Array<{
    assignmentId: string;
    description: string;
    status: string;
    assigmentName: string;
    groupAssignmentId: string;
  }>;
}

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

  // Fetch schedule details from the API endpoint
  const { data: scheduleDetails, error: detailsError, isLoading: detailsLoading } = useSWR(
    schedule?.scheduleId ? API_URLS.SCHEDULE_DETAILS.GET_ALL : null,
    swrFetcher
  );

  const { assignments } = useAssignments();
  const { shifts } = useShifts(); // Keep for shift name lookup

  const { users } = useUsers();
  
  // Fetch unassigned workers using API
  const { data: unassignedWorkers, error: unassignedWorkersError, isLoading: isLoadingWorkers } = useSWR(
    API_URLS.USER.GET_UNASSIGNED_WORKERS,
    swrFetcher
  );

  // Fetch data for create form dropdowns
  const { data: areasData, error: areasError, isLoading: isLoadingAreas } = useSWR(
    API_URLS.AREA.GET_ALL,
    swrFetcher
  );

  // Fetch group assignments instead of assignments
  const { data: groupAssignmentsData, error: groupAssignmentsError, isLoading: isLoadingGroupAssignments } = useSWR(
    API_URLS.GROUP_ASSIGNMENT.GET_ALL,
    swrFetcher
  );

  const { groups: workerGroupsData, loading: isLoadingWorkerGroups, error: workerGroupsError } = useWorkerGroup();
  
  // Add useScheduleDetails hook for creating schedule details
  const { createScheduleDetailForSchedule, mutate: mutateScheduleDetails } = useScheduleDetails();

  
  // State for filtering and display
  const [detailSearchTerm, setDetailSearchTerm] = useState("");
  const [activeWorkerGroupTab, setActiveWorkerGroupTab] = useState("Tất cả");
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Default to today
  
  // State for creating new schedule detail
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDetail, setNewDetail] = useState({
    description: "",
    workerGroupId: "",
    startTime: "",
    groupAssignmentId: "",
    areaId: "",
  });
  
  // Debug logs (after all state is declared)
  console.log("🔍 Worker Groups Debug:");
  console.log("- Data:", workerGroupsData);
  console.log("- Error:", workerGroupsError);
  console.log("- Loading:", isLoadingWorkerGroups);
  
  console.log("📝 Form State Debug:");
  console.log("- showCreateForm:", showCreateForm);
  console.log("- isSubmitting:", isSubmitting);
  console.log("- newDetail:", newDetail);
  
  console.log("🔍 Group Assignments Debug:");
  console.log("- Data:", groupAssignmentsData);
  console.log("- Error:", groupAssignmentsError);
  console.log("- Loading:", isLoadingGroupAssignments);

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
  console.log("- Schedule Details API URL:", schedule?.scheduleId ? API_URLS.SCHEDULE_DETAILS.GET_ALL : "No URL");
  console.log("- Schedule Details data:", scheduleDetails);
  console.log("- Schedule Details error:", detailsError);

  // Handle form input changes
  const handleDetailInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e?.target || {};
    if (name) {
      setNewDetail(prev => ({
        ...prev,
        [name]: value || ""
      }));
    }
  };

  // Handle form submission using the useScheduleDetails hook
  const handleSubmitDetail = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("🚀 FORM SUBMISSION STARTED");
    console.log("- Schedule:", schedule);
    console.log("- Schedule ID:", schedule?.scheduleId);
    console.log("- newDetail:", newDetail);
    console.log("- Description:", `"${newDetail?.description}" (trimmed: "${newDetail?.description?.trim()}")`);
    
    if (!schedule?.scheduleId) {
      console.log("❌ VALIDATION FAILED: No schedule ID");
      alert("Không tìm thấy thông tin lịch trình!");
      return;
    }
    
    if (!newDetail?.description?.trim()) {
      console.log("❌ VALIDATION FAILED: Empty description");
      alert("Vui lòng nhập đầy đủ thông tin mô tả công việc!");
      return;
    }
    
    console.log("✅ VALIDATION PASSED - Proceeding with hook function");

    setIsSubmitting(true);
    try {
      // Create request body according to API format (scheduleId is in URL path)
      const requestBody = {
        description: newDetail?.description || "",
        workerGroupId: newDetail?.workerGroupId || "",
        startTime: newDetail?.startTime || null,
        groupAssignmentId: newDetail?.groupAssignmentId || "",
        areaId: newDetail?.areaId || "",
      };
      
      console.log("=== USING HOOK FUNCTION ===");
      console.log("Schedule ID:", schedule?.scheduleId);
      console.log("Request body:", requestBody);
      
      // Use the hook function which has the correct endpoint configuration
      console.log(`Using hook function createScheduleDetailForSchedule with scheduleId: ${schedule.scheduleId}`);
      
      const result = await createScheduleDetailForSchedule(schedule.scheduleId, requestBody);

      console.log("=== RESPONSE SUCCESS ===");
      console.log("Response data:", result);
      
      // Show success message
      alert(`✅ Tạo chi tiết lịch trình thành công!`);
      
      // Reset form and close
      setShowCreateForm(false);
      setNewDetail({
        description: "",
        workerGroupId: "",
        startTime: "",
        groupAssignmentId: "",
        areaId: "",
      });
      
      // Refresh the schedule details using mutate
      await mutateScheduleDetails();
      
    } catch (error: any) {
      console.error("Error creating schedule detail:", error);
      
      // Provide specific error messages based on error type
      let errorMessage = "❌ **VẤN ĐỀ BACKEND NGHIÊM TRỌNG**\n\n";
      
      if (error.message?.includes('Network Error') || error.message?.includes('kết nối mạng')) {
        errorMessage += "🔥 **CORS + Server Error Combo:**\n";
        errorMessage += "- Backend server trả về HTTP 500 (Internal Server Error)\n";
        errorMessage += "- CORS policy chưa được cấu hình đúng\n";
        errorMessage += "- Endpoint có thể chưa được implement hoặc có bug\n\n";
        errorMessage += "📞 **Cần liên hệ Backend Team để:**\n";
        errorMessage += "1. Fix lỗi HTTP 500 trên endpoint POST /scheduledetails/{id}/details\n";
        errorMessage += "2. Cấu hình CORS cho endpoint này\n";
        errorMessage += "3. Kiểm tra data validation và database schema\n\n";
        errorMessage += "⚠️ **Tạm thời không thể tạo schedule detail mới!**";
      } else if (error.response?.status === 500) {
        errorMessage += "Backend server gặp lỗi nội bộ (HTTP 500).";
      } else if (error.response?.status === 404) {
        errorMessage += "Endpoint không tồn tại (HTTP 404).";
      } else if (error.message?.includes('CORS')) {
        errorMessage += "CORS policy chưa được cấu hình đúng.";
      } else {
        errorMessage += `Lỗi không xác định: ${error.message || 'Không rõ nguyên nhân'}`;
      }
      
      alert(errorMessage);
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
      
      // Then check in users
      if (users) {
        const user = users.find((u: any) => u.id === userId);
        if (user?.name) return user.name;
      }
      
      // Fallback to userId if no name found
      return userId;
    };


  // Filter schedule details for the current schedule
  const currentScheduleDetails = useMemo(() => {
    if (!scheduleDetails || !schedule?.scheduleId) return [];
    return scheduleDetails.filter((detail: ScheduleDetailResponse) => 
      detail.scheduleId === schedule.scheduleId
    );
  }, [scheduleDetails, schedule?.scheduleId]);

  console.log("- Current Schedule Details:", currentScheduleDetails);

  const workerGroupTabs = useMemo(() => {
    if (!currentScheduleDetails) return ["Tất cả"];
    const groups = new Set<string>();
    currentScheduleDetails.forEach((d: ScheduleDetailResponse) => {
      if (d.workerGroupName) {
        groups.add(d.workerGroupName);
      }
    });
    return ["Tất cả", ...Array.from(groups)];
  }, [currentScheduleDetails]);

  // Filter schedule details by worker group name and date
  const filteredScheduleDetails = useMemo(() => {
    if (!currentScheduleDetails) return [];
    const term = detailSearchTerm.toLowerCase();
    return currentScheduleDetails.filter((detail: ScheduleDetailResponse) => {
      const hasMatchingGroup = !term || (detail.workerGroupName && 
        detail.workerGroupName.toLowerCase().includes(term)
      );
      const matchesGroupTab =
        activeWorkerGroupTab === "Tất cả" ||
        (detail.workerGroupName && detail.workerGroupName === activeWorkerGroupTab);
      
      // Filter by date - if selectedDate is null (Tất cả), show all; otherwise filter by specific date
      const matchesDate = !selectedDate || (detail.date && selectedDate && 
        detail.date.startsWith(selectedDate.toISOString().split('T')[0])
      );
      
      return hasMatchingGroup && matchesGroupTab && matchesDate;
    });
  }, [currentScheduleDetails, detailSearchTerm, activeWorkerGroupTab, selectedDate]);

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

  // Custom CSS for DatePicker
  const datePickerStyles = `
    .custom-datepicker {
      border: none !important;
      outline: none !important;
      font-size: 13px !important;
      padding: 6px 8px !important;
      border-radius: 4px !important;
      background-color: transparent !important;
      color: #374151 !important;
      font-weight: 500 !important;
      min-width: 130px !important;
      font-family: inherit !important;
    }
    .custom-datepicker:focus {
      box-shadow: none !important;
    }
    .react-datepicker-wrapper {
      width: auto !important;
    }
    .react-datepicker__input-container input {
      border: none !important;
      outline: none !important;
      font-size: 13px !important;
      padding: 6px 8px !important;
      border-radius: 4px !important;
      background-color: transparent !important;
      color: #374151 !important;
      font-weight: 500 !important;
      min-width: 130px !important;
      font-family: inherit !important;
    }
  `;

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
    <>
      <style>{datePickerStyles}</style>
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
              
              {/* Search and Filter inputs */}
              <div style={{ 
                flex: 1, 
                display: "flex", 
                justifyContent: "flex-end", 
                gap: "20px", 
                alignItems: "flex-start"
              }}>
                {/* Date Filter Section */}
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "flex-start",
                  gap: "6px",
                  minWidth: "200px"
                }}>
                  
                  
                  {/* Date Picker */}
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    backgroundColor: "white",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    padding: "4px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    width: "100%",
                    height: "40px"
                  }}>
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date: Date | null) => setSelectedDate(date)}
                      dateFormat="dd/MM/yyyy"
                      placeholderText="Chọn ngày..."
                      isClearable
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      className="custom-datepicker"
                    />
                  </div>
                  
                  {/* Quick Date Buttons */}
                  <div style={{ 
                    display: "flex", 
                    gap: "4px",
                    flexWrap: "wrap",
                    justifyContent: "center"
                  }}>

                    <button
                      onClick={() => setSelectedDate(new Date())}
                      style={{
                        padding: "4px 8px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        backgroundColor: selectedDate && selectedDate.toDateString() === new Date().toDateString() ? "#FF5B27" : "white",
                        color: selectedDate && selectedDate.toDateString() === new Date().toDateString() ? "white" : "#6b7280",
                        fontSize: "11px",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        minWidth: "60px"
                      }}
                      title="Hôm nay"
                    >
                      Hôm nay
                    </button>

                    <button
                      onClick={() => setSelectedDate(null)}
                      style={{
                        padding: "4px 8px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        backgroundColor: !selectedDate ? "#FF5B27" : "white",
                        color: !selectedDate ? "white" : "#6b7280",
                        fontSize: "11px",
                        fontWeight: "500",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        minWidth: "60px"
                      }}
                      title="Tất cả ngày"
                    >
                      Tất cả
                    </button>
                  </div>
                </div>

                {/* Group Name Search Section */}
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "flex-start",
                  gap: "6px",
                  minWidth: "200px"
                }}>
                  
                  <div style={{ position: "relative", width: "100%" }}>
                    <HiOutlineSearch 
                      style={{ 
                        position: "absolute", 
                        left: "12px", 
                        top: "50%", 
                        transform: "translateY(-50%)", 
                        color: "#9ca3af",
                        width: "16px",
                        height: "16px"
                      }} 
                    />
                <input
                  type="text"
                      placeholder="Nhập tên nhóm..."
                  value={detailSearchTerm}
                  onChange={(e) => setDetailSearchTerm(e.target.value)}
                  style={{
                        padding: "8px 12px 8px 36px",
                    border: "1px solid #d1d5db",
                        borderRadius: "8px",
                    fontSize: "13px",
                        width: "100%",
                        height: "40px",
                        backgroundColor: "white",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        transition: "all 0.2s"
                      }}
                      onFocus={(e) => {
                        (e.target as HTMLInputElement).style.borderColor = "#3b82f6";
                        (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                      }}
                      onBlur={(e) => {
                        (e.target as HTMLInputElement).style.borderColor = "#d1d5db";
                        (e.target as HTMLInputElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                      }}
                    />
                  </div>
                </div>

                {/* Add Detail Button */}
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "flex-start",
                  gap: "6px",
                  minWidth: "auto"
                }}>
                  <button
                    onClick={() => {
                      console.log("🔘 Add Detail Button Clicked");
                      console.log("- Current showCreateForm:", showCreateForm);
                      setShowCreateForm(!showCreateForm);
                      if (!showCreateForm) {
                        console.log("- Opening form, resetting newDetail");
                        // Reset form when opening
                        setNewDetail({
                          description: "",
                          workerGroupId: "",
                          startTime: "",
                          groupAssignmentId: "",
                          areaId: "",
                        });
                      } else {
                        console.log("- Closing form");
                      }
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      backgroundColor: "#FF5B27",
                      color: "white",
                      padding: "12px 20px",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                      height: "40px",
                      whiteSpace: "nowrap"
                    }}
                    onMouseEnter={(e: any) => (e.target.style.backgroundColor = "#E04B1F")}
                    onMouseLeave={(e: any) => (e.target.style.backgroundColor = "#FF5B27")}
                  >
                    <HiOutlinePlus style={{ width: "14px", height: "14px" }} />
                    Thêm chi tiết
                  </button>
                </div>


              </div>

            </div>

            {/* Worker name tabs only */}

                         {/* Worker group tabs */}
             <div style={{ marginBottom: "12px", borderBottom: "1px solid #e5e7eb", display: "flex", gap: "12px", overflowX: "auto" }}>
               {workerGroupTabs.map((tab) => (
                 <button
                   key={tab}
                   onClick={() => setActiveWorkerGroupTab(tab)}
                   style={{
                     padding: "8px 12px",
                     border: "none",
                     backgroundColor: "transparent",
                     fontSize: "13px",
                     fontWeight: 500,
                     cursor: "pointer",
                     whiteSpace: "nowrap",
                     borderBottom: activeWorkerGroupTab === tab ? "2px solid #FF5B27" : "2px solid transparent",
                     color: activeWorkerGroupTab === tab ? "#FF5B27" : "#6b7280",
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
                 
                 {/* Worker Group Selection */}
                 <div style={{ marginBottom: "20px" }}>
                   <div style={{ 
                     marginBottom: "8px"
                   }}>
                     <label style={{ 
                       fontSize: "14px", 
                       fontWeight: "500",
                       color: "#374151"
                     }}>
                       Chọn nhóm công nhân
                     </label>
                   </div>
                   <select
                     name="workerGroupId"
                     value={newDetail.workerGroupId}
                     onChange={handleDetailInputChange}
                     disabled={isLoadingWorkerGroups}
                     style={{
                       width: "100%",
                       padding: "12px",
                       border: "1px solid #d1d5db",
                       borderRadius: "8px",
                       fontSize: "14px",
                       backgroundColor: isLoadingWorkerGroups ? "#f3f4f6" : "white",
                       fontFamily: "inherit",
                       cursor: isLoadingWorkerGroups ? "not-allowed" : "pointer"
                     }}
                   >
                     <option value="">
                       {isLoadingWorkerGroups ? "Đang tải..." : "-- Chọn tên nhóm công nhân --"}
                     </option>
                     {!isLoadingWorkerGroups && workerGroupsData && workerGroupsData.length > 0 ? (
                       workerGroupsData.map((group: any) => (
                         <option key={group.workerGroupId} value={group.workerGroupId}>
                           {group.workerGroupName || group.workerGroupId}
                         </option>
                       ))
                     ) : (
                       <option value="" disabled>
                         {isLoadingWorkerGroups ? "Đang tải..." : "Không có dữ liệu nhóm công nhân"}
                       </option>
                     )}
                   </select>
                 </div>

                 {/* Start Time Selection */}
                 <div style={{ marginBottom: "20px" }}>
                   <div style={{ 
                     marginBottom: "8px"
                   }}>
                     <label style={{ 
                       fontSize: "14px", 
                       fontWeight: "500",
                       color: "#374151"
                     }}>
                       Thời gian bắt đầu (24h)
                     </label>
                   </div>
                   <input
                     type="text"
                     name="startTime"
                     value={newDetail.startTime}
                     onChange={handleDetailInputChange}
                     placeholder="HH:MM:SS (ví dụ: 05:00:00, 14:30:00)"
                     style={{
                       width: "100%",
                       padding: "12px",
                       border: "1px solid #d1d5db",
                       borderRadius: "8px",
                       fontSize: "14px",
                       backgroundColor: "white",
                       fontFamily: "inherit"
                     }}
                   />
                   <div style={{ 
                     fontSize: "12px", 
                     color: "#6b7280", 
                     marginTop: "4px",
                     fontStyle: "italic"
                   }}>
                     Định dạng: HH:MM:SS (ví dụ: 05:00:00, 14:30:00)
                   </div>
                 </div>

                 {/* Group Assignment Selection */}
                 <div style={{ marginBottom: "20px" }}>
                   <div style={{ 
                     marginBottom: "8px"
                   }}>
                     <label style={{ 
                       fontSize: "14px", 
                       fontWeight: "500",
                       color: "#374151"
                     }}>
                       Chọn phân công nhóm
                     </label>
                   </div>
                   <select
                     name="groupAssignmentId"
                     value={newDetail.groupAssignmentId}
                     onChange={handleDetailInputChange}
                     disabled={isLoadingGroupAssignments}
                     style={{
                       width: "100%",
                       padding: "12px",
                       border: "1px solid #d1d5db",
                       borderRadius: "8px",
                       fontSize: "14px",
                       backgroundColor: isLoadingGroupAssignments ? "#f3f4f6" : "white",
                       fontFamily: "inherit",
                       cursor: isLoadingGroupAssignments ? "not-allowed" : "pointer"
                     }}
                   >
                     <option value="">
                       {isLoadingGroupAssignments ? "Đang tải..." : "-- Chọn tên phân công nhóm --"}
                     </option>
                     {!isLoadingGroupAssignments && groupAssignmentsData && groupAssignmentsData.length > 0 ? (
                       groupAssignmentsData.map((groupAssignment: any) => (
                         <option key={groupAssignment.groupAssignmentId} value={groupAssignment.groupAssignmentId}>
                           {groupAssignment.assignmentGroupName || groupAssignment.groupAssignmentId}
                         </option>
                       ))
                     ) : (
                       <option value="" disabled>
                         {isLoadingGroupAssignments ? "Đang tải..." : "Không có dữ liệu phân công nhóm"}
                       </option>
                     )}
                   </select>
                 </div>

                 {/* Area Selection */}
                 <div style={{ marginBottom: "20px" }}>
                   <div style={{ 
                     marginBottom: "8px"
                   }}>
                     <label style={{ 
                       fontSize: "14px", 
                       fontWeight: "500",
                       color: "#374151"
                     }}>
                       Khu vực
                     </label>
                   </div>
                   <select
                     name="areaId"
                     value={newDetail.areaId}
                     onChange={handleDetailInputChange}
                     disabled={isLoadingAreas}
                     style={{
                       width: "100%",
                       padding: "12px",
                       border: "1px solid #d1d5db",
                       borderRadius: "8px",
                       fontSize: "14px",
                       backgroundColor: isLoadingAreas ? "#f3f4f6" : "white",
                       fontFamily: "inherit",
                       cursor: isLoadingAreas ? "not-allowed" : "pointer"
                     }}
                   >
                     <option value="">
                       {isLoadingAreas ? "Đang tải..." : "-- Chọn khu vực --"}
                     </option>
                     {!isLoadingAreas && areasData && areasData.length > 0 ? (
                       areasData.map((area: any) => (
                         <option key={area.areaId} value={area.areaId}>
                           {area.areaName || area.areaId}
                         </option>
                       ))
                     ) : (
                       <option value="" disabled>
                         {isLoadingAreas ? "Đang tải..." : "Không có dữ liệu khu vực"}
                       </option>
                     )}
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
                         description: "",
                         workerGroupId: "",
                         startTime: "",
                         groupAssignmentId: "",
                         areaId: "",
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
                    onClick={(e) => {
                      console.log("🔘 Submit Button Clicked");
                      console.log("- isSubmitting:", isSubmitting);
                      console.log("- Event:", e);
                      // Don't prevent default, let form submission handle it
                    }}
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
              {detailsLoading ? (
                <div style={{ 
                  textAlign: "center", 
                  color: "#6b7280", 
                  fontSize: "14px",
                  padding: "32px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px"
                }}>
                  Đang tải chi tiết công việc...
                </div>
              ) : detailsError ? (
                <div style={{ 
                  textAlign: "center", 
                  color: "#dc2626", 
                  fontSize: "14px",
                  padding: "32px",
                  backgroundColor: "#fef2f2",
                  borderRadius: "8px"
                }}>
                  Không thể tải chi tiết công việc
                </div>
              ) : filteredScheduleDetails && filteredScheduleDetails.length > 0 ? (
                filteredScheduleDetails.map((detail: ScheduleDetailResponse) => (
                  <div
                    key={detail.scheduleDetailId}
                    style={{
                      backgroundColor: "#f9fafb",
                      borderRadius: "8px",
                      padding: "24px",
                      marginBottom: "24px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "flex-start",
                      marginBottom: "20px",
                      flexWrap: "wrap",
                      gap: "16px"
                    }}>
                      <div>
                        <h4 style={{ 
                          fontSize: "18px", 
                          fontWeight: "600", 
                          color: "#374151",
                          margin: "0 0 8px 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          <HiOutlineClipboardList style={{ width: "20px", height: "20px" }} />
                          {detail.workerGroupName || `Chi tiết #${detail.scheduleDetailId.slice(0, 8)}`}
                        </h4>
                        {detail.schedule?.areaName && (
                          <p style={{ 
                            margin: "0 0 8px 0", 
                            fontSize: "14px",
                            color: "#6b7280",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px"
                          }}>
                            <HiOutlineMap style={{ width: "16px", height: "16px" }} />
                            Khu vực: {detail.schedule.areaName}
                          </p>
                        )}
                        <p style={{ 
                          margin: 0, 
                          color: "#6b7280", 
                          fontSize: "14px",
                          fontStyle: "italic",
                          marginBottom: "8px"
                        }}>
                          {detail.description || "Không có mô tả"}
                        </p>
                      </div>
                      <div style={{
                        padding: "8px 16px",
                        borderRadius: "20px",
                        fontSize: "14px",
                        fontWeight: "600",
                        backgroundColor: "#fef3c7",
                        color: "#d97706",
                        border: "2px solid #fed7aa",
                      }}>
                        {detail.status}
                      </div>
                    </div>

                    {/* Date and Time Information */}
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "8px",
                      marginBottom: "16px",
                      padding: "12px 16px",
                      backgroundColor: "white",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb"
                    }}>
                      <HiOutlineClock style={{ width: "20px", height: "20px", color: "#FF5B27" }} />
                      <span style={{ fontWeight: "600", color: "#374151" }}>Ngày:</span>
                      <span style={{ color: "#6b7280", marginRight: "16px" }}>
                        {detail.date ? new Date(detail.date).toLocaleDateString("vi-VN") : "N/A"}
                      </span>
                      <span style={{ fontWeight: "600", color: "#374151" }}>Thời gian:</span>
                      <span style={{ color: "#6b7280" }}>
                        {detail.startTime?.substring(0, 5) || "N/A"} - {detail.endTime?.substring(0, 5) || "N/A"}
                      </span>
                    </div>



                    {/* Rating */}
                    {detail.rating && (
                      <div style={{ 
                        display: "flex", 
                        alignItems: "center", 
                        gap: "8px",
                        marginBottom: "16px",
                        padding: "12px 16px",
                        backgroundColor: "white",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb"
                      }}>
                        <span style={{ fontSize: "20px" }}>⭐</span>
                        <span style={{ fontWeight: "600", color: "#374151" }}>Đánh giá:</span>
                        <span style={{ color: "#6b7280" }}>
                          {detail.rating}/5
                        </span>
                      </div>
                    )}

                    {/* Workers Section */}
                    {detail.workers && detail.workers.length > 0 && (
                      <div style={{ marginBottom: "20px" }}>
                        <h5 style={{ 
                          fontSize: "16px", 
                          fontWeight: "600", 
                          color: "#374151",
                          margin: "0 0 12px 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          <HiOutlineUser style={{ width: "18px", height: "18px" }} />
                          Nhân viên thực hiện
                        </h5>
                        <div style={{ 
                          display: "grid", 
                          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", 
                          gap: "12px" 
                        }}>
                          {detail.workers.map((worker) => (
                            <div key={worker.workGroupMemberId} style={{
                              backgroundColor: "white",
                              padding: "16px",
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              display: "flex",
                              alignItems: "center",
                              gap: "12px"
                            }}>
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
                                fontWeight: "600"
                              }}>
                                {worker.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div style={{ fontWeight: "600", color: "#111827", marginBottom: "4px" }}>
                                  {worker.fullName}
                                </div>
                                <div style={{ color: "#6b7280", fontSize: "12px" }}>
                                  ID: {worker.userId}
                                </div>
                                <div style={{ color: "#6b7280", fontSize: "12px" }}>
                                  Vai trò: {authService.mapRoleIdToRoleName(worker.roleId)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Assignments Section */}
                    {detail.assignments && detail.assignments.length > 0 && (
                      <div style={{ marginBottom: "20px" }}>
                        <h5 style={{ 
                          fontSize: "16px", 
                          fontWeight: "600", 
                          color: "#374151",
                          margin: "0 0 12px 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "8px"
                        }}>
                          <HiOutlineMap style={{ width: "18px", height: "18px" }} />
                          Công việc được giao
                        </h5>
                        <div style={{ 
                          display: "grid", 
                          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", 
                          gap: "12px" 
                        }}>
                          {detail.assignments.map((assignment) => (
                            <div key={assignment.assignmentId} style={{
                              backgroundColor: "white",
                              padding: "16px",
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                            }}>
                              <div style={{ fontWeight: "600", color: "#111827", marginBottom: "8px" }}>
                                {assignment.assigmentName}
                              </div>
                              <div style={{ color: "#6b7280", fontSize: "14px", marginBottom: "8px" }}>
                                {assignment.description}
                              </div>
                              <div style={{ 
                                fontSize: "12px", 
                                padding: "4px 8px", 
                                borderRadius: "4px",
                                display: "inline-block",
                                backgroundColor: assignment.status === "Hoạt động" ? "#dcfce7" : "#fee2e2",
                                color: assignment.status === "Hoạt động" ? "#15803d" : "#dc2626"
                              }}>
                                {assignment.status}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Comment Section */}
                    {detail.comment && (
                      <div style={{ 
                        backgroundColor: "white",
                        padding: "16px",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb"
                      }}>
                        <h5 style={{ 
                          fontSize: "16px", 
                          fontWeight: "600", 
                          color: "#374151",
                          margin: "0 0 12px 0"
                        }}>
                          💬 Ghi chú
                        </h5>
                        <p style={{ 
                          margin: 0, 
                          color: "#6b7280", 
                          fontSize: "14px",
                          fontStyle: "italic"
                        }}>
                          {detail.comment}
                        </p>
                      </div>
                    )}
                  </div>
                ))
              ) : currentScheduleDetails && currentScheduleDetails.length === 0 ? (
                <div style={{ 
                  textAlign: "center", 
                  color: "#6b7280", 
                  fontSize: "14px",
                  padding: "32px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px"
                }}>
                  Không có chi tiết công việc nào được tạo
                </div>
              ) : filteredScheduleDetails.length === 0 ? (
                <div style={{ 
                  textAlign: "center", 
                  color: "#6b7280", 
                  fontSize: "14px",
                  padding: "32px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px"
                }}>
                  {selectedDate ? `Không có chi tiết công việc nào cho ngày ${selectedDate.toLocaleDateString("vi-VN")}` : "Không tìm thấy chi tiết công việc phù hợp"}
                </div>
              ) : null}
            </div>



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
    </>
  );
};

export default ScheduleDetailsModal; 