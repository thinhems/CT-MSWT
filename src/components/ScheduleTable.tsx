import { useState } from "react";
import { HiOutlineDotsVertical, HiOutlineEye, HiOutlinePencil } from "react-icons/hi";
import { Schedule } from "@/config/models/schedule.model";

interface IProps {
  schedules: Schedule[];
  onActionClick: (action: IAction) => void;
}

interface IAction {
  action: string;
  schedule: Schedule;
}

const ScheduleTable = ({ schedules, onActionClick }: IProps) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  const handleDropdownToggle = (scheduleId: string) => {
    setOpenDropdown(openDropdown === scheduleId ? null : scheduleId);
  };

  const handleActionSelect = (action: string, schedule: Schedule) => {
    onActionClick({ action, schedule });
    setOpenDropdown(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit", 
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScheduleTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "cleaning":
      case "hằng ngày":
      case "daily":
        return { backgroundColor: "#dcfce7", color: "#15803d" };
      case "maintenance":
      case "đột xuất":
      case "emergency":
        return { backgroundColor: "#fef3c7", color: "#d97706" };
      case "inspection":
        return { backgroundColor: "#dbeafe", color: "#1d4ed8" };
      default:
        return { backgroundColor: "#f3f4f6", color: "#374151" };
    }
  };

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

  return (
    <div
      style={{
        marginLeft: "32px",
        marginRight: "32px",
        marginTop: "0px",
        backgroundColor: "white",
        borderRadius: "12px",
        border: "1px solid #f0f0f0",
        overflow: "auto",
        boxShadow: "0 2px 8px 0 rgba(0, 0, 0, 0.06)",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
          <tr
            style={{
              backgroundColor: "#FEF6F4",
              borderBottom: "2px solid #e5e7eb",
            }}
          >
            <th
              style={{
                padding: "12px 16px",
                textAlign: "left",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Tên lịch trình
            </th>
            <th
              style={{
                padding: "12px 16px",
                textAlign: "left",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Khu vực
            </th>
           
            <th
              style={{
                padding: "12px 16px",
                textAlign: "left",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Loại lịch trình
            </th>
            <th
              style={{
                padding: "12px 16px",
                textAlign: "left",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Ngày bắt đầu
            </th>
            <th
              style={{
                padding: "12px 16px",
                textAlign: "left",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Ngày kết thúc
            </th>
            <th
              style={{
                padding: "12px 16px",
                textAlign: "left",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Ca làm việc
            </th>
            <th
              style={{
                padding: "12px 16px",
                textAlign: "center",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Hành động
            </th>
          </tr>
        </thead>
        <tbody style={{ borderTop: "2px solid transparent" }}>
          {schedules.map((schedule, index) => (
            <tr
              key={schedule.scheduleId}
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
              {/* Schedule Name Column */}
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#111827",
                }}
              >
                {schedule.scheduleName || `Schedule ${schedule.scheduleId.slice(0, 8)}`}
              </td>

              {/* Area Name Column */}
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "#6b7280",
                }}
              >
                {schedule.areaName || schedule.areaId}
              </td>

              
              {/* Schedule Type Column */}
              <td style={{ padding: "12px 16px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    padding: "3px 10px",
                    fontSize: "11px",
                    fontWeight: "600",
                    borderRadius: "9999px",
                    ...getScheduleTypeColor(schedule.scheduleType),
                  }}
                >
                  {getScheduleTypeDisplay(schedule.scheduleType)}
                </span>
              </td>

              {/* Start Date Column */}
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "#6b7280",
                }}
              >
                <div>
                  <div style={{ fontWeight: "500" }}>
                    {formatDate(schedule.startDate)}
                  </div>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                    {formatTime(schedule.startDate)}
                  </div>
                </div>
              </td>

              {/* End Date Column */}
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "#6b7280",
                }}
              >
                <div>
                  <div style={{ fontWeight: "500" }}>
                    {formatDate(schedule.endDate)}
                  </div>
                  <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                    {formatTime(schedule.endDate)}
                  </div>
                </div>
              </td>

              {/* Shift Name Column */}
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "#6b7280",
                }}
              >
                {schedule.shiftName || `Shift ${schedule.shiftId.slice(0, 8)}`}
              </td>

              {/* Action Column */}
              <td
                style={{
                  padding: "12px 16px",
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <button
                  onClick={() => handleDropdownToggle(schedule.scheduleId)}
                  style={{
                    color: "#6b7280",
                    background: "transparent",
                    border: "none",
                    padding: "8px",
                    borderRadius: "9999px",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e: any) => {
                    e.target.style.color = "#374151";
                    e.target.style.backgroundColor = "#f3f4f6";
                  }}
                  onMouseLeave={(e: any) => {
                    e.target.style.color = "#6b7280";
                    e.target.style.backgroundColor = "transparent";
                  }}
                >
                  <HiOutlineDotsVertical
                    style={{ width: "20px", height: "20px" }}
                  />
                </button>

                {/* Dropdown Menu */}
                {openDropdown === schedule.scheduleId && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "10%",
                      right: "8px",
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.1)",
                      zIndex: 5,
                      minWidth: "120px",
                    }}
                  >
                    <button
                      onClick={() => handleActionSelect("view", schedule)}
                      style={{
                        width: "100%",
                        padding: "6px 10px",
                        border: "none",
                        backgroundColor: "transparent",
                        textAlign: "left",
                        fontSize: "12px",
                        color: "#374151",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        borderRadius: "6px 6px 0 0",
                      }}
                      onMouseEnter={(e: any) => {
                        e.target.style.backgroundColor = "#f9fafb";
                      }}
                      onMouseLeave={(e: any) => {
                        e.target.style.backgroundColor = "transparent";
                      }}
                    >
                      <HiOutlineEye style={{ width: "14px", height: "14px" }} />
                      Xem chi tiết
                    </button>
                    
                    <button
                      onClick={() => handleActionSelect("edit", schedule)}
                      style={{
                        width: "100%",
                        padding: "6px 10px",
                        border: "none",
                        backgroundColor: "transparent",
                        textAlign: "left",
                        fontSize: "12px",
                        color: "#374151",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        borderTop: "1px solid #f3f4f6",
                      }}
                      onMouseEnter={(e: any) => {
                        e.target.style.backgroundColor = "#f9fafb";
                      }}
                      onMouseLeave={(e: any) => {
                        e.target.style.backgroundColor = "transparent";
                      }}
                    >
                      <HiOutlinePencil style={{ width: "14px", height: "14px" }} />
                      Sửa lịch trình
                    </button>
                    
                    {/* <button
                      onClick={() => handleActionSelect("update", schedule)}
                      style={{
                        width: "100%",
                        padding: "6px 10px",
                        border: "none",
                        backgroundColor: "transparent",
                        textAlign: "left",
                        fontSize: "12px",
                        color: "#374151",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        borderRadius: "0 0 6px 6px",
                        borderTop: "1px solid #f3f4f6",
                      }}
                      onMouseEnter={(e: any) => {
                        e.target.style.backgroundColor = "#f9fafb";
                      }}
                      onMouseLeave={(e: any) => {
                        e.target.style.backgroundColor = "transparent";
                      }}
                    >
                      <HiOutlineUserAdd style={{ width: "14px", height: "14px" }} />
                      Gán vị trí
                    </button> */}
                   
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {schedules.length === 0 && (
        <div
          style={{
            padding: "48px",
            textAlign: "center",
            color: "#6b7280",
            fontSize: "14px",
          }}
        >
          Không có lịch trình nào được tìm thấy
        </div>
      )}
    </div>
  );
};

export default ScheduleTable; 