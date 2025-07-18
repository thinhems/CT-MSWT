import { Floor } from "../config/models/floor.model";
import { useEffect, useState } from "react";
import {
  HiOutlineDotsVertical,
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlinePlus,
} from "react-icons/hi";
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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const { areas } = useAreas();

  // Function to get areas for a specific floor
  const getAreasForFloor = (floorId: string) => {
    return areas.filter(area => area.floorId === floorId);
  };

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (openDropdown !== null) {
        // Check if click is inside the dropdown or on the dropdown button
        const isDropdownButton = event.target.closest("[data-dropdown-button]");
        const isDropdownMenu = event.target.closest(
          "[data-dropdown-container]"
        );

        // Only close if clicking outside both the button and menu
        if (!isDropdownButton && !isDropdownMenu) {
          setOpenDropdown(null);
        }
      }
    };

    if (openDropdown !== null) {
      // Add slight delay to prevent immediate closing
      const timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 50);

      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [openDropdown]);

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

  const handleDropdownToggle = (floorId: string) => {
    console.log("🎯 Dropdown toggle for floor ID:", floorId);
    setOpenDropdown(openDropdown === floorId ? null : floorId);
  };

  const handleActionSelect = (
    action: "view" | "delete" | "assign",
    floor: Floor
  ) => {
    console.log("🔥 FloorTable - Action selected:", action, floor);
    onActionClick({ action, floor });
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
                      {floorAreas.slice(0, 3).map((area, areaIndex) => (
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
                    ...getStatusColor(floor.status),
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
                <button
                  data-dropdown-button="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log(
                      "🔥 Button clicked for floor:",
                      floor.floorId,
                      floor.floorNumber
                    );
                    handleDropdownToggle(floor.floorId);
                  }}
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
                {openDropdown === floor.floorId && (
                  <div
                    data-dropdown-container="true"
                    style={{
                      position: "absolute",
                      top: "20%",
                      right: "110px",
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.1)",
                      zIndex: 1000,
                      minWidth: "10px",
                      marginTop: "4px",
                    }}
                  >
                    <button
                      onClick={() => handleActionSelect("view", floor)}
                      style={{
                        width: "100%",
                        padding: "6px 10px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#374151",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      onMouseEnter={(e: any) => (e.target.style.backgroundColor = "#f3f4f6")}
                      onMouseLeave={(e: any) => (e.target.style.backgroundColor = "transparent")}
                    >
                      <HiOutlineEye style={{ width: "14px", height: "14px" }} />
                      Xem chi tiết
                    </button>
                   
                    <button
                      onClick={() => handleActionSelect("assign", floor)}
                      style={{
                        width: "100%",
                        padding: "6px 10px",
                        textAlign: "left",
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#374151",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                      onMouseEnter={(e: any) => (e.target.style.backgroundColor = "#f3f4f6")}
                      onMouseLeave={(e: any) => (e.target.style.backgroundColor = "transparent")}
                                         >
                       <HiOutlinePlus style={{ width: "14px", height: "14px" }} />
                       Gán khu vực
                     </button>

                    
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FloorTable;
