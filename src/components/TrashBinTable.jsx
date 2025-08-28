import { HiOutlineEye, HiOutlinePencil } from "react-icons/hi";
import Dropdown from './common/Dropdown';
import { useAreas } from "../hooks/useArea";
import { useRooms } from "../hooks/useRoom";

// Add CSS animation styles
const dropdownAnimationStyle = `
  @keyframes dropdownFade {
    from {
      opacity: 0;
      transform: translateY(8px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
`;

const TrashBinTable = ({ trashBins, onActionClick }) => {
  
  const handleDropdownAction = (item, trashBin) => {
    onActionClick({ action: item.action, trashBin });
  };

  const { areas } = useAreas();
  const { rooms } = useRooms();

  // Inject animation styles

  // Function to get area name by areaId
  const getAreaInfo = (areaId) => {
    if (!areaId || areaId === "string") {
      return { areaName: "Không có khu vực" };
    }
    
    const area = areas?.find(a => a.areaId === areaId);
    return {
      areaName: area?.areaName || `Area: ${areaId.slice(-8)}`
    };
  };

  // Function to get room number by roomId
  const getRoomInfo = (roomId) => {
    if (!roomId || roomId === "string") {
      return "Không liên kết";
    }
    
    const room = rooms?.find(r => r.roomId === roomId);
    return room ? `${room.roomNumber} - ${room.roomType}` : `Phòng-${roomId.slice(-6)}`;
  };

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case "hoạt động":
      case "danghoatdong":
      case "hoatdong":
        return { backgroundColor: "#dcfce7", color: "#15803d" };
      case "bảo trì":
      case "baotri":
      case "dangbaotri":
      case "ngưng hoạt động":
        return { backgroundColor: "#fef3c7", color: "#d97706" };
      case "hỏng":
      case "hong":
      case "dahong":
        return { backgroundColor: "#fee2e2", color: "#dc2626" };
      default:
        return { backgroundColor: "#f3f4f6", color: "#374151" };
    }
  };

  const getStatusDisplay = (status) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case "danghoatdong":
      case "hoatdong":
        return "Hoạt động";
      case "dangbaotri":
      case "baotri":
        return "Ngưng hoạt động";
      case "dahong":
      case "hong":
        return "Đã hỏng";
      default:
        return status || "Không xác định";
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
        <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
          <tr style={{ backgroundColor: "#FEF6F4", borderBottom: "2px solid #e5e7eb" }}>
            <th
              style={{
                padding: "16px 24px",
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
                padding: "16px 24px",
                textAlign: "left",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Vị trí
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
          {trashBins.map((bin, index) => (
            <tr
              key={bin.trashBinId || bin.id}
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
                  padding: "16px 24px",
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#111827",
                }}
              >
                {index + 1}
              </td>

              {/* Thùng rác Column */}
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#111827",
                }}
              >
                <div>
                  <div style={{ fontWeight: "600", marginBottom: "4px" }}>
                    Thùng #{bin.trashBinId?.slice(-8) || "N/A"}
                  </div>
                  
                </div>
              </td>

              {/* Vị trí & Khu vực Column */}
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                <div>
                  
                  <div style={{  }}>
                    {getAreaInfo(bin.areaId)?.areaName}
                  </div>
                </div>
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
                    ...getStatusColor(bin.status),
                  }}
                >
                  {getStatusDisplay(bin.status)}
                </span>
              </td>

              {/* Action Column */}
              <td
                style={{
                  padding: "16px 24px",
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
                  ]}
                  onItemClick={handleDropdownAction}
                  triggerData={bin}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TrashBinTable; 