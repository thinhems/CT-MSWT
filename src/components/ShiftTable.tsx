import { useState } from "react";
import {
  HiOutlineDotsVertical,
  HiOutlineEye,
  HiOutlinePencil,
  HiChevronUp,
  HiChevronDown,
} from "react-icons/hi";
import { Shift } from "@/config/models/shift.mode";
import { IActionType } from "@/config/models/types";

interface ShiftTableProps {
  shifts: Shift[];
  onActionClick: (params: { action: IActionType; shift: Shift }) => void;
  sortState: "asc" | "desc" | "default";
  onSortClick: () => void;
}

const ShiftTable: React.FC<ShiftTableProps> = ({
  shifts,
  onActionClick,
  sortState,
  onSortClick,
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Debug log to check shifts data
  console.log("ShiftTable received shifts:", shifts);
  console.log("ShiftTable shifts length:", shifts?.length);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "hoạt động":
        return { backgroundColor: "#dcfce7", color: "#15803d" };
      case "tạm dừng":
        return { backgroundColor: "#fee2e2", color: "#dc2626" };
      default:
        return { backgroundColor: "#f3f4f6", color: "#374151" };
    }
  };

  const handleDropdownToggle = (shiftId: string) => {
    setOpenDropdown(openDropdown === shiftId ? null : shiftId);
  };

  const handleActionSelect = (action: IActionType, shift: Shift) => {
    onActionClick({ action, shift });
    setOpenDropdown(null);
  };

  return (
    <div
      style={{
        marginLeft: "32px",
        marginRight: "32px",
        marginTop: "0px",
        marginBottom: "12px",
        backgroundColor: "white",
        borderRadius: "12px",
        border: "1px solid #f0f0f0",
        overflow: "hidden",
        boxShadow: "0 2px 8px 0 rgba(0, 0, 0, 0.06)",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#FEF6F4" }}>
            <th
              style={{
                padding: "16px 24px",
                textAlign: "left",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  cursor: "pointer",
                }}
                onClick={onSortClick}
              >
                Ca làm
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1px",
                  }}
                >
                  <HiChevronUp
                    style={{
                      width: "12px",
                      height: "12px",
                      color: sortState === "asc" ? "#374151" : "#d1d5db",
                    }}
                  />
                  <HiChevronDown
                    style={{
                      width: "12px",
                      height: "12px",
                      color: sortState === "desc" ? "#374151" : "#d1d5db",
                    }}
                  />
                </div>
              </div>
            </th>
            <th
              style={{
                padding: "16px 24px",
                textAlign: "left",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Thời gian bắt đầu
            </th>
            <th
              style={{
                padding: "16px 24px",
                textAlign: "left",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Thời gian kết thúc
            </th>
            <th
              style={{
                padding: "16px 24px",
                textAlign: "left",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Trạng thái
            </th>
            <th
              style={{
                padding: "18px 24px",
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
        <tbody>
          {shifts.map((shift, index) => (
            <tr
              key={shift.shiftId}
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
              {/* Shift Name Column */}
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#111827",
                }}
              >
                {shift.shiftName}
              </td>

              {/* Start Time Column */}
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                {shift.startTime}
              </td>

              {/* End Time Column */}
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                {shift.endTime}
              </td>

              {/* Status Column */}
              <td style={{ padding: "16px 24px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    padding: "4px 12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    borderRadius: "9999px",
                    backgroundColor: getStatusColor(shift.status).backgroundColor,
                color: getStatusColor(shift.status).color,
                  }}
                >
                  {shift.status}
                </span>
              </td>

              {/* Action Column */}
              <td
                style={{
                  padding: "16px 24px",
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <button
                  onClick={() => handleDropdownToggle(shift.shiftId)}
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
                {openDropdown === shift.shiftId && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "50%",
                      right: "8px",
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.1)",
                      zIndex: 10,
                      minWidth: "100px",
                    }}
                  >
                    <button
                      onClick={() => handleActionSelect("view", shift)}
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
                      onMouseEnter={(e: any) =>
                        (e.target.style.backgroundColor = "#f9fafb")
                      }
                      onMouseLeave={(e: any) =>
                        (e.target.style.backgroundColor = "transparent")
                      }
                    >
                      <HiOutlineEye style={{ width: "14px", height: "14px" }} />
                      Xem chi tiết
                    </button>
                    <button
                      onClick={() => handleActionSelect("update", shift)}
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
                      onMouseEnter={(e: any) =>
                        (e.target.style.backgroundColor = "#f9fafb")
                      }
                      onMouseLeave={(e: any) =>
                        (e.target.style.backgroundColor = "transparent")
                      }
                    >
                      <HiOutlinePencil
                        style={{ width: "14px", height: "14px" }}
                      />
                      Cập nhật
                    </button>
                    
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Click outside to close dropdown */}
      {openDropdown && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 5,
          }}
          onClick={() => setOpenDropdown(null)}
        />
      )}
    </div>
  );
};

export default ShiftTable;
