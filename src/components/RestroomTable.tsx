import { Restroom } from "@/config/models/restroom.model";
import { IActionType } from "@/config/models/types";

import {
  HiOutlineEye,
  HiOutlinePencil,
} from "react-icons/hi";
import { useAreas } from "@/hooks/useArea";
import Dropdown from './common/Dropdown';

interface IAction {
  action: IActionType;
  restroom: Restroom;
}

interface IProps {
  restrooms: Restroom[];
  onActionClick: (action: IAction) => void;
}

const RestroomTable = ({
  restrooms,
  onActionClick,
}: IProps) => {
  
  const handleDropdownAction = (item: any, restroom: Restroom) => {
    onActionClick({ action: item.action, restroom });
  };

  const { areas } = useAreas();

  // Debug log to check restrooms data
  console.log("RestroomTable received restrooms:", restrooms);
  console.log("RestroomTable restrooms length:", restrooms?.length);

  const getStatusColor = (status: string) => {
    console.log('🔍 Getting status color for:', status, 'type:', typeof status);
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "hoatdong":
      case "hoạt động":
        return { backgroundColor: "#dcfce7", color: "#15803d" };
      case "baotri":
      case "bảo trì":
        return { backgroundColor: "#fee2e2", color: "#dc2626" };
      default:
        console.log('⚠️ Unknown status, using default color:', status);
        return { backgroundColor: "#f3f4f6", color: "#374151" };
    }
  };

  const getStatusDisplay = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "hoatdong":
      case "hoạt động":
        return "Hoạt động";
      case "baotri":
      case "bảo trì":
        return "Bảo trì";
      default:
        return status;
    }
  };

  // Function to get area name from areaId
  const getAreaName = (areaId: string) => {
    const area = areas.find(a => a.areaId === areaId);
    return area ? area.areaName : "Chưa có khu vực";
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
              Phòng
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
              Khu vực
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
              Chi tiết
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
          {restrooms?.map((restroom, index) => (
            <tr
              key={restroom.restroomId}
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
              {/* Room Column */}
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#111827",
                }}
              >
                {restroom.restroomNumber}
              </td>

              {/* Area Column */}
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                {getAreaName(restroom.areaId)}
              </td>

              {/* Details Column */}
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  color: "#6b7280",
                  maxWidth: "200px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {restroom.description}
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
                    backgroundColor: getStatusColor(restroom.status).backgroundColor,
                color: getStatusColor(restroom.status).color,
                  }}
                >
                  {getStatusDisplay(restroom.status)}
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
                      action: 'update',
                      label: 'Chỉnh sửa',
                      icon: <HiOutlinePencil style={{ width: "14px", height: "14px" }} />,
                      color: "#374151"
                    }
                  ] as any}
                  onItemClick={handleDropdownAction}
                  triggerData={restroom as any}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>


    </div>
  );
};

export default RestroomTable;
