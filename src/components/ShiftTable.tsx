import { useState } from "react";
import {
  HiOutlineEye,
  HiOutlinePencil,
  HiChevronUp,
  HiChevronDown,
} from "react-icons/hi";
import { Shift } from "@/config/models/shift.mode";
import { IActionType } from "@/config/models/types";
import Dropdown from './common/Dropdown';

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
  // Debug log to check shifts data
  console.log("ShiftTable received shifts:", shifts);
  console.log("ShiftTable shifts length:", shifts?.length);

  const handleDropdownAction = (item, shift) => {
    onActionClick({ action: item.action, shift });
  };

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
                fontSize: "12px",
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
                fontSize: "12px",
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
                fontSize: "12px",
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
                fontSize: "12px",
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
                  fontSize: "13px",
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
                  fontSize: "13px",
                  color: "#6b7280",
                }}
              >
                {shift.startTime}
              </td>

              {/* End Time Column */}
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "13px",
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
                    fontSize: "11px",
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
                      label: 'Chỉnh sửa',
                      icon: <HiOutlinePencil style={{ width: "14px", height: "14px" }} />,
                      color: "#374151"
                    }
                  ]}
                  onItemClick={handleDropdownAction}
                  triggerData={shift}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>


    </div>
  );
};

export default ShiftTable;
