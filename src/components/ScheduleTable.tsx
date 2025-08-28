import { useState } from "react";
import { HiOutlineEye, HiOutlinePencil } from "react-icons/hi";
import { Schedule } from "@/config/models/schedule.model";
import Dropdown from './common/Dropdown';

interface IProps {
  schedules: Schedule[];
  onActionClick: (action: IAction) => void;
}

interface IAction {
  action: string;
  schedule: Schedule;
}

const ScheduleTable = ({ schedules, onActionClick }: IProps) => {
  const handleDropdownAction = (item: any, schedule: Schedule) => {
    onActionClick({ action: item.action, schedule });
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
                textAlign: "center",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
                width: "60px",
              }}
            >
              STT
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
              {/* STT Column */}
              <td
                style={{
                  padding: "12px 16px",
                  textAlign: "center",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#111827",
                  width: "60px",
                }}
              >
                {index + 1}
              </td>
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
              {/* Schedule Type Column */}
              <td style={{ padding: "12px 16px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    padding: "3px 10px",
                    fontSize: "11px",
                    fontWeight: "600",
                    borderRadius: "9999px",
                    backgroundColor: getScheduleTypeColor(schedule.scheduleType).backgroundColor,
                color: getScheduleTypeColor(schedule.scheduleType).color,
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
                <div style={{ fontWeight: "500" }}>
                  {formatDate(schedule.startDate)}
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
                <div style={{ fontWeight: "500" }}>
                  {formatDate(schedule.endDate)}
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
                                                  <Dropdown
                   items={[
                     {
                       action: 'view',
                       label: 'Xem chi tiết',
                       icon: <HiOutlineEye style={{ width: "14px", height: "14px" }} />,
                       color: "#374151"
                     },
                     {
                       action: 'edit',
                       label: 'Sửa lịch trình',
                       icon: <HiOutlinePencil style={{ width: "14px", height: "14px" }} />,
                       color: "#374151"
                     }
                   ]}
                  onItemClick={handleDropdownAction}
                  triggerData={schedule}
                />



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