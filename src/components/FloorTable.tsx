import { Floor } from "../config/models/floor.model";

import {
  HiOutlineEye,
  HiOutlinePencil,
} from "react-icons/hi";
import Dropdown from './common/Dropdown';
import { useAreas } from "../hooks/useArea";

interface FloorTableProps {
  floors: Floor[];
  onActionClick: (params: {
    action: "view" | "delete" | "assign";
    floor: Floor;
  }) => void;
}

const FloorTable: React.FC<FloorTableProps> = ({
  floors,
  onActionClick,
}) => {
  
  const handleDropdownAction = (item: any, floor: Floor) => {
    onActionClick({ action: item.action, floor });
  };

  const { areas } = useAreas();

  // Function to get areas for a specific floor
  const getAreasForFloor = (floorId: string) => {
    return areas.filter(area => area.floorId === floorId);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "hoạt động":
        return { backgroundColor: "#dcfce7", color: "#15803d" };
      case "bảo trì":
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
        overflow: "visible",
        boxShadow: "0 2px 8px 0 rgba(0, 0, 0, 0.06)",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#FEF6F4" }}>
            <th
              style={{
                padding: "12px 16px",
                textAlign: "left",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
                position: "relative",
              }}
              >
                Tầng
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
              Trạng thái
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
        <tbody>
          {floors.map((floor, index) => (
            <tr
              key={floor.floorId}
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
              {/* Floor Name Column */}
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#111827",
                }}
              >
                {floor.floorNumber}
              </td>

              {/* Areas Column */}
              <td style={{ padding: "12px 16px" }}>
                {(() => {
                  const floorAreas = getAreasForFloor(floor.floorId);
                  if (floorAreas.length === 0) {
                    return (
                      <span style={{
                        color: "#6b7280",
                        fontSize: "12px",
                        fontStyle: "italic"
                      }}>
                        Chưa có khu vực
                      </span>
                    );
                  }
                  
                  return (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {floorAreas.slice(0, 3).map((area) => (
                        <span
                          key={area.areaId}
                          style={{
                            display: "inline-flex",
                            padding: "2px 8px",
                            fontSize: "11px",
                            fontWeight: "500",
                            borderRadius: "4px",
                            backgroundColor: "#dbeafe",
                            color: "#1e40af",
                            border: "1px solid #bfdbfe",
                          }}
                          title={`${area.areaName} (Phòng ${area.roomBegin} - ${area.roomEnd})`}
                        >
                          {area.areaName}
                        </span>
                      ))}
                      {floorAreas.length > 3 && (
                        <span 
                          style={{
                            fontSize: "11px",
                            color: "#6b7280",
                            fontWeight: "500"
                          }}
                          title={`Tổng cộng ${floorAreas.length} khu vực: ${floorAreas.map(a => a.areaName).join(', ')}`}
                        >
                          +{floorAreas.length - 3} khác
                        </span>
                      )}
                    </div>
                  );
                })()}
              </td>

              {/* Status Column */}
              <td style={{ padding: "12px 16px" }}>
                <span
                  style={{
                    display: "inline-flex",
                    padding: "3px 10px",
                    fontSize: "11px",
                    fontWeight: "600",
                    borderRadius: "9999px",
                    backgroundColor: getStatusColor(floor.status).backgroundColor,
                color: getStatusColor(floor.status).color,
                  }}
                >
                  {floor.status}
                </span>
              </td>

              {/* Action Column */}
              <td
                style={{
                  padding: "12px 16px",
                  textAlign: "center",
                  position: "relative",
                  overflow: "visible",
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
                  ] as any}
                  onItemClick={handleDropdownAction}
                  triggerData={floor as any}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FloorTable;
