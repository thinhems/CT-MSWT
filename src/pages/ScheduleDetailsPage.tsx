import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlineClipboardList, HiOutlinePlus } from "react-icons/hi";

import { useScheduleDetails } from "../hooks/useScheduleDetails";

import { useShifts } from "../hooks/useShifts";

import { useWorkerGroup } from "../hooks/useWorkerGroup";
import { API_URLS } from "../constants/api-urls";
import { swrFetcher } from "../utils/swr-fetcher";
import useSWR from "swr";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Notification from "../components/Notification";
import Pagination from "../components/Pagination";
import { authService } from "../services/authService";


interface ScheduleDetailResponse {
  scheduleDetailId: string;
  scheduleId: string;
  description: string;
  date: string;
  status: string;
  supervisorId: string;
  supervisorName: string;
  rating: number | null;
  workerGroupId: string;
  workerGroupName: string;
  backupForUserId: string | null;
  endTime: string;
  startTime: string;
  isBackup: boolean | null;
  groupAssignmentId: string;
  groupAssignmentName: string;
  comment: string | null;
  areaId: string;
  areaName: string;
  schedule: {
    scheduleId: string;
    startDate: string;
    endDate: string;
    scheduleType: string;
    shiftId: string;
    scheduleName: string;
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
  timeSlots?: Array<{
    startTime: string;
    endTime: string;
    scheduleDetailId: string;
    rating?: number | null;
    status?: string;
    description?: string;
    comment?: string;
  }>;
}

interface PaginatedScheduleDetailResponse {
  items: ScheduleDetailResponse[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}


const ScheduleDetailsPage = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  
  const [notification, setNotification] = useState({
    isVisible: false,
    type: "",
    message: "",
  });

  // State for filtering and display - MUST be declared before useSWR
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); // Default to today
  
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  
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

  // State for detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<ScheduleDetailResponse | null>(null);

  // Get formatted date for API (default to today)
  const getApiDate = (date: Date | null) => {
    const targetDate = date || new Date();
    return targetDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
  };


  // Fetch detailed schedule information from API
  const { data: scheduleDetail, error: scheduleError, isLoading: scheduleLoading } = useSWR(
    scheduleId ? API_URLS.SCHEDULE.GET_BY_ID(scheduleId) : null,
    swrFetcher
  );

  // Fetch schedule details using date with pagination
  const { data: scheduleDetailsResponse, error: detailsError, isLoading: detailsLoading, mutate: mutateScheduleDetails } = useSWR<PaginatedScheduleDetailResponse>(
    selectedDate ? 
      API_URLS.SCHEDULE_DETAILS.GET_BY_DATE_PAGINATED(getApiDate(selectedDate), currentPage, pageSize) : 
      null,
    swrFetcher
  );

  // Extract data from paginated response
  const scheduleDetails = scheduleDetailsResponse?.items || [];
  const totalItems = scheduleDetailsResponse?.totalCount || 0;
  const totalPages = Math.ceil(totalItems / pageSize) || 0;




  const { shifts } = useShifts(); // Keep for shift name lookup


  


  // Fetch data for create form dropdowns
  const { data: areasData, isLoading: isLoadingAreas } = useSWR(
    API_URLS.AREA.GET_ALL,
    swrFetcher
  );

  // Fetch group assignments instead of assignments
  const { data: groupAssignmentsData, isLoading: isLoadingGroupAssignments } = useSWR(
    API_URLS.GROUP_ASSIGNMENT.GET_ALL,
    swrFetcher
  );

  const { groups: workerGroupsData, loading: isLoadingWorkerGroups, error: workerGroupsError } = useWorkerGroup();
  
  // Add useScheduleDetails hook for creating schedule details
  const { createScheduleDetailForSchedule } = useScheduleDetails();



  const showNotification = (type: string, message: string) => {
    setNotification({
      isVisible: true,
      type,
      message,
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };
  
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
  console.log("- Loading:", isLoadingGroupAssignments);





  // Get shift name from shiftId
  const getShiftName = useMemo(() => {
    if (!shifts || !scheduleDetail?.shiftId) return scheduleDetail?.shiftId || "N/A";
    const shift = shifts.find((s: any) => s.shiftId === scheduleDetail.shiftId);
    return shift?.shiftName || `Ca ${scheduleDetail.shiftId}`;
  }, [shifts, scheduleDetail?.shiftId]);




  console.log("🔍 Schedule Detail Debug Info:");
  console.log("- Schedule ID:", scheduleId);
  console.log("- Schedule detail data:", scheduleDetail);
  console.log("- Schedule Details data:", scheduleDetails);

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
    console.log("- Schedule ID:", scheduleId);
    console.log("- newDetail:", newDetail);
    console.log("- Description:", `"${newDetail?.description}" (trimmed: "${newDetail?.description?.trim()}")`);
    
    if (!scheduleId) {
      console.log("❌ VALIDATION FAILED: No schedule ID");
      showNotification("error", "Không tìm thấy thông tin lịch trình!");
      return;
    }
    
    if (!newDetail?.description?.trim()) {
      console.log("❌ VALIDATION FAILED: Empty description");
      showNotification("error", "Vui lòng nhập đầy đủ thông tin mô tả công việc!");
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
      console.log("Schedule ID:", scheduleId);
      console.log("Request body:", requestBody);
      
      // Use the hook function which has the correct endpoint configuration
      console.log(`Using hook function createScheduleDetailForSchedule with scheduleId: ${scheduleId}`);
      
      const result = await createScheduleDetailForSchedule(scheduleId, requestBody);

      console.log("=== RESPONSE SUCCESS ===");
      console.log("Response data:", result);
      
      // Show success message
      showNotification("success", "Tạo chi tiết lịch trình thành công!");
      
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
      
      showNotification("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };







  // Filter schedule details by scheduleId since we're fetching by user/date
  const currentScheduleDetails = useMemo(() => {
    if (!scheduleDetails) return [];
    
    // If scheduleId is provided, filter by it; otherwise show all for the user/date
    if (scheduleId) {
      return scheduleDetails.filter((detail: ScheduleDetailResponse) => 
        detail.scheduleId === scheduleId
      );
    }
    
    return scheduleDetails;
  }, [scheduleDetails, scheduleId]);

  console.log("- Current Schedule Details:", currentScheduleDetails);





  // Date change handler
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setCurrentPage(1); // Reset to first page when date changes
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  // Detail modal handlers
  const handleViewDetail = (detail: ScheduleDetailResponse) => {
    setSelectedDetail(detail);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedDetail(null);
  };

  // Group schedule details by worker group
  const filteredScheduleDetails = useMemo(() => {
    if (!currentScheduleDetails) return [];
    
    // Group by workerGroupId and merge details
    const grouped = currentScheduleDetails.reduce((acc: Record<string, ScheduleDetailResponse>, detail) => {
      const key = detail.workerGroupId;
      if (!acc[key]) {
        // First detail for this group becomes the base
        acc[key] = {
          ...detail,
          timeSlots: [{
            startTime: detail.startTime,
            endTime: detail.endTime,
            scheduleDetailId: detail.scheduleDetailId,
            rating: detail.rating,
            status: detail.status,
            description: detail.description,
            comment: detail.comment || undefined
          }]
        };
      } else {
        // Add time slot to existing group
        if (!acc[key].timeSlots) acc[key].timeSlots = [];
        acc[key].timeSlots.push({
          startTime: detail.startTime,
          endTime: detail.endTime,
          scheduleDetailId: detail.scheduleDetailId,
          rating: detail.rating,
          status: detail.status,
          description: detail.description,
          comment: detail.comment || undefined
        });
      }
      return acc;
    }, {});

    return Object.values(grouped);
  }, [currentScheduleDetails]);

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
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "16px", color: "#374151" }}>Đang tải thông tin lịch trình...</div>
      </div>
    );
  }

  // Show error state if failed to fetch schedule details
  if (scheduleError) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "16px", color: "#dc2626", marginBottom: "16px" }}>
          Không thể tải thông tin lịch trình
        </div>
        <button
          onClick={() => navigate('/schedules')}
          style={{
            padding: "12px 24px",
            backgroundColor: "#FF5B27",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Quay lại danh sách lịch trình
        </button>
      </div>
    );
  }

  // Use data from API response, fallback to scheduleId if not available
  const displaySchedule = scheduleDetail;

  if (!displaySchedule) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <div style={{ fontSize: "16px", color: "#dc2626", marginBottom: "16px" }}>
          Không tìm thấy thông tin lịch trình
        </div>
        <button
          onClick={() => navigate('/schedules')}
          style={{
            padding: "12px 24px",
            backgroundColor: "#FF5B27",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Quay lại danh sách lịch trình
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{datePickerStyles}</style>
      <div style={{ 
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "20px"
      }}>
        {/* Header */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "15px",
          marginBottom: "10px",
          marginTop: "-10px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}>
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button
                onClick={() => navigate('/schedules')}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  backgroundColor: "white",
                  color: "#374151",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e: any) => {
                  e.target.style.backgroundColor = "#f9fafb";
                }}
                onMouseLeave={(e: any) => {
                  e.target.style.backgroundColor = "white";
                }}
              >
                <HiOutlineArrowLeft style={{ width: "16px", height: "16px" }} />
                Quay lại
              </button>
              <h1 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#111827",
                margin: 0,
                letterSpacing: "0.25px"
              }}>
                Chi tiết lịch trình
              </h1>
            </div>
          </div>
        </div>

        {/* Content Container */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "20px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}>
          {/* Schedule Info */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              padding: "20px",
              marginBottom: "20px"
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginTop: "0",
                letterSpacing: "0.25px"
              }}
            >
              <HiOutlineClipboardList style={{ width: "20px", height: "20px" }} />
              {displaySchedule.scheduleName}
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "16px",
              }}
            >
              <div>
                <span style={{ 
                  fontWeight: "600", 
                  color: "#6b7280",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em"
                }}>
                  Loại lịch trình
                </span>
                <div style={{ 
                  color: "#111827", 
                  fontSize: "14px", 
                  fontWeight: "500",
                  marginTop: "4px",
                  letterSpacing: "0.1px"
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
                  fontSize: "14px", 
                  fontWeight: "500",
                  marginTop: "4px",
                  letterSpacing: "0.1px"
                }}>
                  {new Date(displaySchedule.startDate).toLocaleDateString("vi-VN")}
                </div>
              </div>

              <div>
                <span style={{ 
                  fontWeight: "600", 
                  color: "#6b7280",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em"
                }}>
                  Ngày kết thúc
                </span>
                <div style={{ 
                  color: "#111827", 
                  fontSize: "14px", 
                  fontWeight: "500",
                  marginTop: "4px",
                  letterSpacing: "0.1px"
                }}>
                  {new Date(displaySchedule.endDate).toLocaleDateString("vi-VN")}
                </div>
              </div>

              

              <div>
                <span style={{ 
                  fontWeight: "600", 
                  color: "#6b7280",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em"
                }}>
                  Ca làm việc
                </span>
                <div style={{ 
                  color: "#111827", 
                  fontSize: "14px", 
                  fontWeight: "500",
                  marginTop: "4px",
                  letterSpacing: "0.1px"
                }}>
                  {getShiftName}
                </div>
              </div>


            </div>
          </div>



          {/* Area Restrooms Section */}
          {displaySchedule.areaRestrooms && displaySchedule.areaRestrooms.length > 0 && (
            <div style={{ 
              marginBottom: "20px",
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
              marginBottom: "20px",
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
              marginBottom: "14px",
              gap: "12px"
            }}>
              <h3 style={{ 
                fontSize: "14px", 
                fontWeight: "600", 
                color: "#374151",
                margin: 0,
                letterSpacing: "0.25px"
              }}>
                Chi tiết công việc
              </h3>
              
                            {/* Date Filter and Add Detail Button */}
              <div style={{ 
                display: "flex", 
                alignItems: "flex-start", 
                gap: "16px"
              }}>
                {/* Date Filter Section */}
                <div style={{ 
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "flex-start",
                  gap: "6px",
                  minWidth: "200px"
                }}>
                  {/* Date Picker and Quick Buttons Row */}
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center",
                    gap: "8px",
                    width: "100%"
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
                      height: "36px",
                      flex: "1"
                    }}>
                      <DatePicker
                        selected={selectedDate}
                        onChange={handleDateChange}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="Chọn ngày..."
                        isClearable
                        showYearDropdown
                        showMonthDropdown
                        dropdownMode="select"
                        className="custom-datepicker"
                      />
                    </div>
                    
                    {/* Quick Date Button */}
                    <button
                      onClick={() => {
                        setSelectedDate(new Date());
                      }}
                      style={{
                        padding: "8px 12px",
                        border: "1px solid #d1d5db",
                        borderRadius: "6px",
                        backgroundColor: selectedDate && selectedDate.toDateString() === new Date().toDateString() ? "#FF5B27" : "white",
                        color: selectedDate && selectedDate.toDateString() === new Date().toDateString() ? "white" : "#6b7280",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        height: "36px",
                        whiteSpace: "nowrap",
                        letterSpacing: "0.1px"
                      }}
                      title="Hôm nay"
                    >
                      Hôm nay
                    </button>

                    {/* Add Detail Button */}
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
                        padding: "8px 16px",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        height: "36px",
                        whiteSpace: "nowrap",
                        letterSpacing: "0.1px",
                        boxShadow: "0 1px 3px rgba(255, 91, 39, 0.2)"
                      }}
                      onMouseEnter={(e: any) => (e.target.style.backgroundColor = "#E04B1F")}
                      onMouseLeave={(e: any) => (e.target.style.backgroundColor = "#FF5B27")}
                    >
                      <HiOutlinePlus style={{ width: "16px", height: "16px" }} />
                      Thêm chi tiết
                    </button>
                  </div>
                </div>
              </div>

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
                   fontSize: "14px", 
                   fontWeight: "600", 
                   color: "#374151",
                   marginBottom: "16px",
                   marginTop: "0",
                   letterSpacing: "0.25px"
                 }}>
                   Tạo chi tiết lịch trình
                 </h4>
                 
                 {/* Worker Group Selection */}
                 <div style={{ marginBottom: "20px" }}>
                   <div style={{ 
                     marginBottom: "8px"
                   }}>
                     <label style={{ 
                       fontSize: "12px", 
                       fontWeight: "600",
                       color: "#374151",
                       letterSpacing: "0.1px"
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
                       fontSize: "12px",
                       backgroundColor: isLoadingWorkerGroups ? "#f3f4f6" : "white",
                       fontFamily: "inherit",
                       cursor: isLoadingWorkerGroups ? "not-allowed" : "pointer",
                       letterSpacing: "0.1px"
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
                       fontSize: "12px", 
                       fontWeight: "600",
                       color: "#374151",
                       letterSpacing: "0.1px"
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
                       fontSize: "12px",
                       backgroundColor: "white",
                       fontFamily: "inherit",
                       letterSpacing: "0.1px"
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
                       fontSize: "12px", 
                       fontWeight: "600",
                       color: "#374151",
                       letterSpacing: "0.1px"
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
                       fontSize: "12px",
                       backgroundColor: isLoadingGroupAssignments ? "#f3f4f6" : "white",
                       fontFamily: "inherit",
                       cursor: isLoadingGroupAssignments ? "not-allowed" : "pointer",
                       letterSpacing: "0.1px"
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
                       fontSize: "12px", 
                       fontWeight: "600",
                       color: "#374151",
                       letterSpacing: "0.1px"
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
                       fontSize: "12px",
                       backgroundColor: isLoadingAreas ? "#f3f4f6" : "white",
                       fontFamily: "inherit",
                       cursor: isLoadingAreas ? "not-allowed" : "pointer",
                       letterSpacing: "0.1px"
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
                       fontSize: "12px", 
                       fontWeight: "600",
                       color: "#374151",
                       letterSpacing: "0.1px"
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
                       fontSize: "12px",
                       resize: "vertical",
                       fontFamily: "inherit",
                       backgroundColor: "white",
                       letterSpacing: "0.1px"
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
                      padding: "8px 16px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      backgroundColor: "white",
                      color: "#374151",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                      letterSpacing: "0.1px"
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
                      padding: "8px 16px",
                      border: "none",
                      borderRadius: "6px",
                      backgroundColor: isSubmitting ? "#9ca3af" : "#FF5B27",
                      color: "white",
                      fontSize: "12px",
                      fontWeight: "600",
                      cursor: isSubmitting ? "not-allowed" : "pointer",
                      transition: "all 0.2s ease",
                      letterSpacing: "0.1px",
                      boxShadow: isSubmitting ? "none" : "0 1px 3px rgba(255, 91, 39, 0.2)"
                    }}
                  >
                     {isSubmitting ? "Đang tạo..." : "Tạo chi tiết"}
                   </button>
                 </div>
               </form>
             )}




                        {/* Schedule Details List */}
            <div style={{ marginBottom: "12px" }}>
              {detailsLoading ? (
                <div style={{ 
                  textAlign: "center", 
                  color: "#6b7280", 
                  fontSize: "12px",
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
                  fontSize: "12px",
                  padding: "32px",
                  backgroundColor: "#fef2f2",
                  borderRadius: "8px"
                }}>
                  Không thể tải chi tiết công việc
                </div>
              ) : filteredScheduleDetails && filteredScheduleDetails.length > 0 ? (
                <div style={{
                  backgroundColor: "white",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  overflow: "hidden",
                  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
                }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ backgroundColor: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                        <th style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#374151",
                          borderBottom: "1px solid #e5e7eb",
                          letterSpacing: "0.1px"
                        }}>
                          Nhóm làm việc
                        </th>
                        <th style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#374151",
                          borderBottom: "1px solid #e5e7eb",
                          letterSpacing: "0.1px"
                        }}>
                          Nhóm công việc
                        </th>
                        <th style={{
                          padding: "12px 16px",
                          textAlign: "left",
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#374151",
                          borderBottom: "1px solid #e5e7eb",
                          letterSpacing: "0.1px"
                        }}>
                          Khu vực
                        </th>
                        <th style={{
                          padding: "16px",
                          textAlign: "center",
                          fontSize: "14px",
                          fontWeight: "600",
                          color: "#374151",
                          borderBottom: "1px solid #e5e7eb"
                        }}>
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredScheduleDetails.map((detail: ScheduleDetailResponse, index) => (
                        <tr 
                    key={detail.scheduleDetailId}
                    style={{
                            borderBottom: index < filteredScheduleDetails.length - 1 ? "1px solid #f3f4f6" : "none",
                            transition: "background-color 0.2s"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#f9fafb"}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                        >
                          <td style={{
                            padding: "12px 16px",
                            fontSize: "12px",
                            color: "#374151",
                            verticalAlign: "top"
                          }}>
                    <div style={{ 
                              fontWeight: "500",
                              marginBottom: "4px"
                            }}>
                              {detail.workerGroupName || "Không có tên"}
                            </div>
                            <div style={{
                              fontSize: "12px",
                              color: "#6b7280"
                            }}>
                              {detail.workers?.length || 0} thành viên • {detail.timeSlots?.length || 1} khung giờ
                            </div>
                          </td>
                          <td style={{
                            padding: "16px",
                            fontSize: "14px",
                          color: "#374151",
                            verticalAlign: "top"
                          }}>
                            <div style={{
                              fontWeight: "500",
                              marginBottom: "4px"
                            }}>
                              {detail.groupAssignmentName || "Không có"}
                            </div>
                            <div style={{
                              fontSize: "12px",
                              color: "#6b7280"
                            }}>
                              {detail.assignments?.length || 0} công việc
                            </div>
                          </td>
                          <td style={{
                            padding: "12px 16px",
                            fontSize: "12px",
                            color: "#374151",
                            verticalAlign: "top"
                          }}>
                            <div style={{
                              fontWeight: "500",
                              marginBottom: "4px"
                            }}>
                              {detail.areaName || "Không xác định"}
                      </div>
                                                  <div style={{
                              fontSize: "12px",
                              color: "#6b7280"
                            }}>
                              Giám sát: {detail.supervisorName || "Không có"}
                            </div>
                          </td>
                          <td style={{
                            padding: "12px 16px",
                            textAlign: "center",
                            verticalAlign: "top"
                          }}>
                            <button
                              onClick={() => handleViewDetail(detail)}
                              style={{
                                backgroundColor: "#FF5B27",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                padding: "6px 12px",
                                fontSize: "11px",
                                fontWeight: "600",
                                cursor: "pointer",
                                transition: "all 0.2s ease",
                                letterSpacing: "0.1px",
                                boxShadow: "0 1px 3px rgba(255, 91, 39, 0.2)"
                              }}
                              onMouseEnter={(e) => (e.target as HTMLButtonElement).style.backgroundColor = "#e04516"}
                              onMouseLeave={(e) => (e.target as HTMLButtonElement).style.backgroundColor = "#FF5B27"}
                            >
                              Xem chi tiết
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                    </div>
              ) : currentScheduleDetails && currentScheduleDetails.length === 0 ? (
                    <div style={{ 
                  textAlign: "center", 
                          color: "#6b7280", 
                          fontSize: "14px",
                  padding: "32px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px"
                }}>
                  {selectedDate ? 
                    `Không có chi tiết công việc nào cho ngày ${selectedDate.toLocaleDateString("vi-VN")}` : 
                    "Không có chi tiết công việc nào được tạo"
                  }
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
                  Không tìm thấy chi tiết công việc phù hợp với bộ lọc
                      </div>
              ) : null}
                    </div>



          </div>
        </div>

        {/* Pagination Controls */}
        {scheduleDetails && scheduleDetails.length > 0 && (
          <div style={{ 
            padding: "16px 32px",
            backgroundColor: "white",
            borderTop: "1px solid #e5e7eb",
            display: "flex", 
            justifyContent: "space-between",
            alignItems: "center", 
            flexWrap: "wrap",
            gap: "16px"
          }}>
            {/* Pagination Info and Page Size Control */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              fontSize: "12px",
              color: "#6b7280"
            }}>
              <span>
                Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalItems)} trong tổng số {totalItems} kết quả
              </span>
              
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span>Số kết quả mỗi trang:</span>
                <select
                  value={pageSize}
                  onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                  style={{
                    padding: "4px 8px",
                    border: "1px solid #d1d5db",
                    borderRadius: "4px",
                    fontSize: "12px",
                    backgroundColor: "white",
                    cursor: "pointer"
                  }}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Pagination Component */}
            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedDetail && (
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
            onClick={handleCloseDetailModal}
          >
            <div
              style={{
                        backgroundColor: "white",
                borderRadius: "12px",
                padding: "24px",
                width: "1150px",
                maxWidth: "95vw",
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
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "16px"
                }}
              >
                <h2
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#111827",
                    margin: 0,
                    letterSpacing: "0.25px"
                  }}
                >
                  Chi tiết công việc
                </h2>
                <button
                  onClick={handleCloseDetailModal}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "4px",
                    borderRadius: "4px",
                    color: "#6b7280",
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = "#f3f4f6")}
                  onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = "transparent")}
                >
                  ✕
                </button>
              </div>

              {/* Basic Information */}
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "16px", letterSpacing: "0.25px" }}>
                  Thông tin cơ bản
                </h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", letterSpacing: "0.1px" }}>Nhóm công nhân</label>
                    <div style={{ fontSize: "14px", color: "#374151", marginTop: "4px", letterSpacing: "0.1px" }}>
                      {selectedDetail.workerGroupName || "Không có"}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", letterSpacing: "0.1px" }}>Nhóm công việc</label>
                    <div style={{ fontSize: "14px", color: "#374151", marginTop: "4px", letterSpacing: "0.1px" }}>
                      {selectedDetail.groupAssignmentName || "Không có"}
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", letterSpacing: "0.1px" }}>Khu vực</label>
                    <div style={{ fontSize: "14px", color: "#374151", marginTop: "4px", letterSpacing: "0.1px" }}>
                      {selectedDetail.areaName || "Không xác định"}
                    </div>
                  </div>




                  <div style={{ gridColumn: "span 3" }}>
                    <label style={{ fontSize: "12px", fontWeight: "600", color: "#6b7280", letterSpacing: "0.1px" }}>Đánh giá trung bình</label>
                    <div style={{ fontSize: "14px", color: "#374151", marginTop: "4px", letterSpacing: "0.1px" }}>
                      {selectedDetail.timeSlots ? (
                        (() => {
                          const ratings = selectedDetail.timeSlots.filter(slot => slot.rating).map(slot => slot.rating!);
                          if (ratings.length === 0) return "Chưa có đánh giá";
                          const avgRating = (ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1);
                          return `${avgRating}/5 ⭐ (${ratings.length}/${selectedDetail.timeSlots.length} khung đã đánh giá)`;
                        })()
                      ) : (
                        selectedDetail.rating ? `${selectedDetail.rating}/5 ⭐` : "Chưa đánh giá"
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Slots Section */}
              {selectedDetail.timeSlots && selectedDetail.timeSlots.length > 0 ? (
                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "16px", letterSpacing: "0.25px" }}>
                    Khung thời gian ({selectedDetail.timeSlots.length})
                  </h3>
                  <div style={{ 
                    display: "flex", 
                    flexDirection: "row", 
                    gap: "16px",
                    width: "100%",
                    overflowX: "auto"
                  }}>
                    {selectedDetail.timeSlots.map((slot, index) => (
                      <div key={slot.scheduleDetailId} style={{
                        padding: "20px",
                        backgroundColor: "#f8fafc",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                        minWidth: "350px",
                        flexShrink: 0
                      }}>
                        {/* Header với thời gian và trạng thái */}
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "16px",
                          paddingBottom: "12px",
                          borderBottom: "1px solid #e2e8f0"
                        }}>
                          <div style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#111827"
                          }}>
                            Khung {index + 1}: {slot.startTime?.substring(0, 5)} - {slot.endTime?.substring(0, 5)}
                          </div>
                          <div style={{
                            padding: "6px 12px",
                            borderRadius: "16px",
                            fontSize: "12px",
                            fontWeight: "600",
                            backgroundColor: slot.status === "Sắp tới" ? "#fef3c7" : 
                                           slot.status === "Đang thực hiện" ? "#dcfce7" :
                                           slot.status === "Hoàn thành" ? "#dbeafe" : "#fee2e2",
                            color: slot.status === "Sắp tới" ? "#d97706" : 
                                  slot.status === "Đang thực hiện" ? "#166534" :
                                  slot.status === "Hoàn thành" ? "#1d4ed8" : "#dc2626"
                          }}>
                            {slot.status || "Sắp tới"}
                          </div>
                        </div>
                        
                        {/* Content area - chỉ có đánh giá và ghi chú */}
                        <div style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "12px"
                        }}>
                            {/* Đánh giá */}
                            <div>
                              <label style={{ 
                                fontSize: "12px", 
                                fontWeight: "600", 
                                color: "#6b7280",
                                letterSpacing: "0.1px",
                                display: "block",
                                marginBottom: "6px"
                              }}>
                                Đánh giá
                              </label>
                              <div style={{
                                padding: "10px",
                                backgroundColor: "white",
                                borderRadius: "6px",
                                border: "1px solid #e5e7eb",
                                minHeight: "40px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center"
                              }}>
                                {slot.rating ? (
                                  <div style={{ 
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px"
                                  }}>
                                    <span style={{ 
                                      fontSize: "16px", 
                                      fontWeight: "600", 
                                      color: "#374151" 
                                    }}>
                                      {slot.rating}/5
                                    </span>
                                    <span style={{ fontSize: "16px", color: "#fbbf24" }}>⭐</span>
                                  </div>
                                ) : (
                                  <span style={{ 
                                    fontSize: "12px", 
                                    color: "#9ca3af",
                                    fontStyle: "italic"
                                  }}>
                                    Chưa có
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Ghi chú */}
                            <div>
                              <label style={{ 
                                fontSize: "12px", 
                                fontWeight: "600", 
                                color: "#6b7280",
                                letterSpacing: "0.1px",
                                display: "block",
                                marginBottom: "6px"
                              }}>
                                Ghi chú
                              </label>
                              <div style={{
                                fontSize: "12px",
                                color: "#374151",
                                lineHeight: "1.4",
                                padding: "10px",
                                backgroundColor: "white",
                                borderRadius: "6px",
                                border: "1px solid #e5e7eb",
                                minHeight: "40px",
                                fontStyle: slot.comment ? "normal" : "italic"
                              }}>
                                {slot.comment || "Không có"}
                              </div>
                            </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Fallback for single time slot */
                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "16px", letterSpacing: "0.25px" }}>
                    Khung thời gian (1)
                  </h3>
                  <div style={{
                    padding: "20px",
                    backgroundColor: "#f8fafc",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    maxWidth: "400px"
                  }}>
                    {/* Header với thời gian và trạng thái */}
                    <div style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "16px",
                      paddingBottom: "12px",
                      borderBottom: "1px solid #e2e8f0"
                    }}>
                      <div style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#111827"
                      }}>
                        Khung 1: {selectedDetail.startTime?.substring(0, 5)} - {selectedDetail.endTime?.substring(0, 5)}
                      </div>
                      <div style={{
                        padding: "6px 12px",
                        borderRadius: "16px",
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor: selectedDetail.status === "Sắp tới" ? "#fef3c7" : 
                                       selectedDetail.status === "Đang thực hiện" ? "#dcfce7" :
                                       selectedDetail.status === "Hoàn thành" ? "#dbeafe" : "#fee2e2",
                        color: selectedDetail.status === "Sắp tới" ? "#d97706" : 
                              selectedDetail.status === "Đang thực hiện" ? "#166534" :
                              selectedDetail.status === "Hoàn thành" ? "#1d4ed8" : "#dc2626"
                      }}>
                        {selectedDetail.status || "Sắp tới"}
                      </div>
                    </div>
                    
                    {/* Content area - chỉ có đánh giá và ghi chú */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "12px"
                    }}>
                        {/* Đánh giá */}
                        <div>
                          <label style={{ 
                            fontSize: "12px", 
                            fontWeight: "600", 
                            color: "#6b7280",
                            letterSpacing: "0.1px",
                            display: "block",
                            marginBottom: "6px"
                          }}>
                            Đánh giá
                          </label>
                          <div style={{
                            padding: "10px",
                            backgroundColor: "white",
                            borderRadius: "6px",
                            border: "1px solid #e5e7eb",
                            minHeight: "40px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                          }}>
                            {selectedDetail.rating ? (
                              <div style={{ 
                                display: "flex",
                                alignItems: "center",
                                gap: "4px"
                              }}>
                                <span style={{ 
                                  fontSize: "16px", 
                                  fontWeight: "600", 
                                  color: "#374151" 
                                }}>
                                  {selectedDetail.rating}/5
                                </span>
                                <span style={{ fontSize: "16px", color: "#fbbf24" }}>⭐</span>
                              </div>
                            ) : (
                              <span style={{ 
                                fontSize: "12px", 
                                color: "#9ca3af",
                                fontStyle: "italic"
                              }}>
                                Chưa có
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Ghi chú */}
                        <div>
                          <label style={{ 
                            fontSize: "12px", 
                            fontWeight: "600", 
                            color: "#6b7280",
                            letterSpacing: "0.1px",
                            display: "block",
                            marginBottom: "6px"
                          }}>
                            Ghi chú
                          </label>
                          <div style={{
                            fontSize: "12px",
                            color: "#374151",
                            lineHeight: "1.4",
                            padding: "10px",
                            backgroundColor: "white",
                            borderRadius: "6px",
                            border: "1px solid #e5e7eb",
                            minHeight: "40px",
                            fontStyle: selectedDetail.comment ? "normal" : "italic"
                          }}>
                            {selectedDetail.comment || "Không có"}
                          </div>
                        </div>
                    </div>
                  </div>
                </div>
              )}



              {/* Workers */}
              {selectedDetail.workers && selectedDetail.workers.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "12px", letterSpacing: "0.25px" }}>
                    Nhân viên thực hiện ({selectedDetail.workers.length})
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "12px" }}>
                    {selectedDetail.workers.map((worker) => (
                            <div key={worker.workGroupMemberId} style={{
                        backgroundColor: "#f9fafb",
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
                                  Vai trò: {authService.mapRoleIdToRoleName(worker.roleId)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

              {/* Assignments */}
              {selectedDetail.assignments && selectedDetail.assignments.length > 0 && (
                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "12px", letterSpacing: "0.25px" }}>
                    Công việc được giao ({selectedDetail.assignments.length})
                  </h3>
                  <div style={{ display: "grid", gap: "12px" }}>
                    {selectedDetail.assignments.map((assignment) => (
                            <div key={assignment.assignmentId} style={{
                        backgroundColor: "#f9fafb",
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

              

              {/* Description */}
              {selectedDetail.description && (
                <div style={{ marginBottom: "24px" }}>
                  <h3 style={{ fontSize: "14px", fontWeight: "600", color: "#374151", marginBottom: "12px", letterSpacing: "0.25px" }}>
                    Mô tả
                  </h3>
                  <div style={{ 
                    padding: "16px",
                    backgroundColor: "#f9fafb",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "14px",
                    color: "#6b7280",
                    fontStyle: "italic",
                    lineHeight: "1.5"
                  }}>
                    {selectedDetail.description}
                  </div>
                </div>
              )}

              {/* Close Button */}
              <div style={{ textAlign: "right", marginTop: "24px" }}>
                <button
                  onClick={handleCloseDetailModal}
                  style={{
                    padding: "8px 16px",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: "600",
                    backgroundColor: "#6b7280",
                    color: "white",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    letterSpacing: "0.1px"
                  }}
                  onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = "#4b5563")}
                  onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.backgroundColor = "#6b7280")}
                >
                  Đóng
                </button>
                      </div>
                  </div>
                </div>
        )}

        {/* Notification */}
        {notification.isVisible && (
          <Notification
            type={notification.type}
            message={notification.message}
            isVisible={notification.isVisible}
            onClose={hideNotification}
          />
        )}
      </div>
    </>
  );
};

export default ScheduleDetailsPage;
