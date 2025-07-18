import { useState, useMemo } from "react";
import { HiOutlineX } from "react-icons/hi";
import { Schedule } from "@/config/models/schedule.model";
import { useScheduleDetails } from "../hooks/useScheduleDetails";
import { useUsers } from "../hooks/useUsers";
import { API_URLS } from "../constants/api-urls";
import { swrFetcher } from "../utils/swr-fetcher";

interface IProps {
  schedule: Schedule | null;
  isVisible: boolean;
  onClose: () => void;
}

const StaffAssignmentModal = ({ schedule, isVisible, onClose }: IProps) => {
  const { scheduleDetails, mutate } = useScheduleDetails(schedule?.scheduleId);
  const { users } = useUsers();
  
  const [selectedDetailId, setSelectedDetailId] = useState<string>("");
  const [staffData, setStaffData] = useState({
    workerId: "",
    supervisorId: "",
  });
  const [isAssigning, setIsAssigning] = useState(false);

  // Filter users by position
  const workers = useMemo(() => {
    if (!users) return [];
    const filteredWorkers = users.filter((user: any) => user.position === "Nhân viên vệ sinh");
    console.log("🔍 All users:", users);
    console.log("🔍 Filtered workers:", filteredWorkers);
    console.log("🔍 Available positions:", [...new Set(users.map((u: any) => u.position))]);
    return filteredWorkers;
  }, [users]);

  const supervisors = useMemo(() => {
    if (!users) return [];
    
    // Chỉ filter "Giám sát viên vệ sinh"
    const filteredSupervisors = users.filter((user: any) => 
      user.position === "Giám sát viên vệ sinh"
    );
    
    console.log("🔍 Filtered supervisors:", filteredSupervisors);
    console.log("🔍 Supervisor positions found:", filteredSupervisors.map(s => s.position));
    
    return filteredSupervisors;
  }, [users]);

  // Get user name by ID
  const getUserName = (userId: string) => {
    if (!users || !userId) return "Chưa gán";
    const user = users.find((u: any) => u.id === userId);
    return user?.name || userId;
  };

  // Handle form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStaffData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle detail selection change
  const handleDetailChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDetailId(e.target.value);
  };

  // Assign worker
  const assignWorker = async (scheduleDetailId: string, workerId: string) => {
    console.log("🚀 Assigning worker:", { scheduleDetailId, workerId });
    
    // Verify worker exists in data
    const selectedWorker = workers.find(w => w.id === workerId);
    console.log("🚀 Selected worker object:", selectedWorker);
    
    try {
      const response = await swrFetcher(API_URLS.SCHEDULE_DETAILS.ASSIGN_WORKER(scheduleDetailId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(workerId),
      });
      return response;
    } catch (error) {
      console.error("Error assigning worker:", error);
      throw error;
    }
  };

  // Assign supervisor
  const assignSupervisor = async (scheduleDetailId: string, supervisorId: string) => {
    console.log("🚀 Assigning supervisor:", { scheduleDetailId, supervisorId });
    
    // Verify supervisor exists in data
    const selectedSupervisor = supervisors.find(s => s.id === supervisorId);
    console.log("🚀 Selected supervisor object:", selectedSupervisor);
    
    try {
      const response = await swrFetcher(API_URLS.SCHEDULE_DETAILS.ASSIGN_SUPERVISOR(scheduleDetailId), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(supervisorId),
      });
      return response;
    } catch (error) {
      console.error("Error assigning supervisor:", error);
      throw error;
    }
  };

  // Handle assignment submission
  const handleAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedDetailId) {
      alert("⚠️ Vui lòng chọn chi tiết công việc!");
      return;
    }

    if (!staffData.workerId && !staffData.supervisorId) {
      alert("⚠️ Vui lòng chọn ít nhất một nhân viên hoặc giám sát viên vệ sinh!");
      return;
    }

    setIsAssigning(true);
    
    console.log("🚀 Starting staff assignment:", {
      selectedDetailId,
      workerId: staffData.workerId,
      supervisorId: staffData.supervisorId,
      assigningBoth: !!(staffData.workerId && staffData.supervisorId)
    });

    try {
      const results = [];
      
      // Assign worker if selected
      if (staffData.workerId) {
        console.log("👷 Assigning worker...");
        const workerResult = await assignWorker(selectedDetailId, staffData.workerId);
        results.push({ type: "worker", success: true, data: workerResult });
        console.log("✅ Worker assigned successfully:", workerResult);
      }
      
      // Assign supervisor if selected
      if (staffData.supervisorId) {
        console.log("👨‍💼 Assigning supervisor...");
        const supervisorResult = await assignSupervisor(selectedDetailId, staffData.supervisorId);
        results.push({ type: "supervisor", success: true, data: supervisorResult });
        console.log("✅ Supervisor assigned successfully:", supervisorResult);
      }
      
      // Success message with details
      const assignedRoles = [];
      if (staffData.workerId) assignedRoles.push("nhân viên thực hiện");
      if (staffData.supervisorId) assignedRoles.push("giám sát viên");
      
      alert(`✅ Đã gán ${assignedRoles.join(" và ")} thành công!`);
      console.log("🎉 All assignments completed:", results);
      
      // Refresh data with a small delay to ensure backend processing
      console.log("🔄 Refreshing data...");
      setTimeout(() => {
        mutate();
      }, 500);
      
      // Reset form
      setStaffData({
        workerId: "",
        supervisorId: "",
      });
      setSelectedDetailId("");
      
    } catch (error) {
      console.error("❌ Error assigning staff:", error);
      
      // More detailed error message
      const errorMsg = error instanceof Error ? error.message : "Lỗi không xác định";
      alert(`❌ Có lỗi xảy ra khi gán nhân viên!\nChi tiết: ${errorMsg}`);
    } finally {
      setIsAssigning(false);
    }
  };

  // Handle close
  const handleClose = () => {
    setStaffData({
      workerId: "",
      supervisorId: "",
    });
    setSelectedDetailId("");
    onClose();
  };

  if (!isVisible || !schedule) return null;

  return (
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
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "24px",
        maxWidth: "600px",
        width: "90%",
        maxHeight: "80vh",
        overflow: "auto",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "16px",
        }}>
          <h2 style={{
            fontSize: "20px",
            fontWeight: "600",
            color: "#111827",
            margin: 0,
          }}>
            Gán nhân viên cho lịch trình
          </h2>
          <button
            onClick={handleClose}
            style={{
              color: "#6b7280",
              background: "transparent",
              border: "none",
              padding: "8px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            <HiOutlineX style={{ width: "24px", height: "24px" }} />
          </button>
        </div>

        {/* Schedule Info */}
        <div style={{
          backgroundColor: "#f9fafb",
          borderRadius: "8px",
          padding: "16px",
          marginBottom: "24px",
        }}>
          <h3 style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#374151",
            margin: "0 0 8px 0",
          }}>
            {schedule.scheduleName || `Lịch trình ${schedule.scheduleId.slice(0, 8)}`}
          </h3>
          <div style={{
            fontSize: "14px",
            color: "#6b7280",
          }}>
            Khu vực: {schedule.areaName || schedule.areaId} • 
            Ca làm việc: {schedule.shiftName || schedule.shiftId}
          </div>
        </div>

        {/* Assignment Form */}
        <form onSubmit={handleAssignmentSubmit}>
          {/* Select Schedule Detail */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
            }}>
              Chọn chi tiết công việc *
            </label>
            <select
              value={selectedDetailId}
              onChange={handleDetailChange}
              required
              style={{
                width: "100%",
                padding: "12px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                fontSize: "14px",
                backgroundColor: "white",
              }}
            >
              <option value="">-- Chọn chi tiết công việc --</option>
              {scheduleDetails.map((detail) => (
                <option key={detail.scheduleDetailId} value={detail.scheduleDetailId}>
                  Chi tiết #{detail.scheduleDetailId.slice(0, 8)} - {detail.description || "Không có mô tả"}
                </option>
              ))}
            </select>
          </div>

          {/* Current Assignment Info */}
          {selectedDetailId && (() => {
            const detail = scheduleDetails.find(d => d.scheduleDetailId === selectedDetailId);
            const hasWorker = detail?.workerId;
            const hasSupervisor = detail?.supervisorId;
            const hasAssignments = hasWorker || hasSupervisor;
            
            return (
              <div style={{
                backgroundColor: hasAssignments ? "#f0f9ff" : "#fef3c7",
                borderRadius: "8px",
                padding: "16px",
                marginBottom: "20px",
                border: `1px solid ${hasAssignments ? "#e0f2fe" : "#fed7aa"}`,
              }}>
                <h4 style={{
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  margin: "0 0 12px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px"
                }}>
                  {hasAssignments ? "👥 Nhân viên đã gán:" : "⚠️ Chưa có nhân viên được gán"}
                  {hasWorker && hasSupervisor && (
                    <span style={{ 
                      fontSize: "12px", 
                      backgroundColor: "#10b981", 
                      color: "white",
                      padding: "2px 8px",
                      borderRadius: "12px"
                    }}>
                      Đã gán đủ cả hai
                    </span>
                  )}
                </h4>
                
                {hasAssignments ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                    <div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                        👷 Nhân viên thực hiện:
                      </div>
                      <div style={{ 
                        fontSize: "14px", 
                        color: hasWorker ? "#374151" : "#9ca3af", 
                        fontWeight: hasWorker ? "500" : "400",
                        fontStyle: hasWorker ? "normal" : "italic"
                      }}>
                        {hasWorker ? getUserName(detail.workerId) : "Chưa gán"}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "4px" }}>
                        👨‍💼 Giám sát viên vệ sinh:
                      </div>
                      <div style={{ 
                        fontSize: "14px", 
                        color: hasSupervisor ? "#374151" : "#9ca3af", 
                        fontWeight: hasSupervisor ? "500" : "400",
                        fontStyle: hasSupervisor ? "normal" : "italic"
                      }}>
                        {hasSupervisor ? getUserName(detail.supervisorId) : "Chưa gán"}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ 
                    fontSize: "14px", 
                    color: "#d97706", 
                    textAlign: "center",
                    fontStyle: "italic"
                  }}>
                    Vui lòng chọn nhân viên hoặc giám sát viên để gán cho chi tiết công việc này
                  </div>
                )}
              </div>
            );
          })()}

          {/* Staff Selection */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
            {/* Worker Selection */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
              }}>
                Nhân viên thực hiện
              </label>
              <select
                name="workerId"
                value={staffData.workerId}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  backgroundColor: "white",
                }}
              >
                <option value="">-- Chọn nhân viên --</option>
                {workers.map((worker: any) => (
                  <option key={worker.id} value={worker.id}>
                    {worker.name} ({worker.position})
                  </option>
                ))}
              </select>
            </div>

            {/* Supervisor Selection */}
            <div>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
              }}>
                Giám sát viên vệ sinh
              </label>
              <select
                name="supervisorId"
                value={staffData.supervisorId}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  backgroundColor: "white",
                }}
              >
                <option value="">-- Chọn giám sát viên vệ sinh --</option>
                {supervisors.map((supervisor: any) => (
                  <option key={supervisor.id} value={supervisor.id}>
                    {supervisor.name} ({supervisor.position})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                padding: "12px 24px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
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
              disabled={isAssigning}
              style={{
                padding: "12px 24px",
                border: "none",
                borderRadius: "8px",
                backgroundColor: isAssigning ? "#9ca3af" : "#3b82f6",
                color: "white",
                fontSize: "14px",
                fontWeight: "500",
                cursor: isAssigning ? "not-allowed" : "pointer",
              }}
            >
              {isAssigning ? "Đang gán..." : "Xác nhận gán"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffAssignmentModal; 