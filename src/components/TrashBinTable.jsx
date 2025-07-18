import { useState, useEffect } from "react";
import { HiOutlineDotsVertical, HiOutlineEye, HiOutlinePencil } from "react-icons/hi";
import { useAreas } from "../hooks/useArea";
import { useRestrooms } from "../hooks/useRestroom";

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
  const [openDropdown, setOpenDropdown] = useState(null);
  const { areas } = useAreas();
  const { restrooms } = useRestrooms();

  // Inject animation styles
  useEffect(() => {
    if (!document.getElementById('dropdown-animation-styles')) {
      const style = document.createElement('style');
      style.id = 'dropdown-animation-styles';
      style.textContent = dropdownAnimationStyle;
      document.head.appendChild(style);
    }
  }, []);

  // Debug log to check trash bins data
  console.log('TrashBinTable received trashBins:', trashBins);
  console.log('TrashBinTable trashBins length:', trashBins?.length);
  console.log('Sample trash bin with area data:', trashBins?.[0]);
  console.log('Areas data:', areas);
  console.log('Restrooms data:', restrooms);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdown !== null) {
        // Check if click is inside the dropdown or on the dropdown button
        const isDropdownButton = event.target.closest("[data-dropdown-button]");
        const isDropdownMenu = event.target.closest("[data-dropdown-container]");

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

  // Function to get area name by areaId
  const getAreaInfo = (areaId) => {
    if (!areaId || areaId === "string") {
      return { areaName: "Không có khu vực", floorNumber: null };
    }
    
    const area = areas?.find(a => a.areaId === areaId);
    return {
      areaName: area?.areaName || `Area: ${areaId.slice(-8)}`,
      floorNumber: area?.floorNumber
    };
  };

  // Function to get restroom number by restroomId
  const getRestroomNumber = (restroomId) => {
    if (!restroomId || restroomId === "string") {
      return "Không liên kết";
    }
    
    const restroom = restrooms?.find(r => r.restroomId === restroomId);
    return restroom?.restroomNumber || `WC-${restroomId.slice(-6)}`;
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

  const handleDropdownToggle = (binId) => {
    console.log('🔄 Toggling dropdown for bin:', binId, 'Current open:', openDropdown);
    setOpenDropdown(openDropdown === binId ? null : binId);
  };

  const handleActionSelect = (action, bin) => {
    console.log('🎯 TrashBinTable handleActionSelect called:', { action, binId: bin.trashBinId || bin.id });
    try {
      if (onActionClick && typeof onActionClick === 'function') {
        onActionClick({ action, bin });
        console.log('✅ onActionClick called successfully');
      } else {
        console.warn('⚠️ onActionClick is not a function:', onActionClick);
      }
    } catch (error) {
      console.error('❌ Error in handleActionSelect:', error);
    } finally {
      setOpenDropdown(null);
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
                padding: "16px 24px",
                textAlign: "left",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                position: "relative",
              }}
            >
              Thùng rác
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
              Vị trí & Khu vực
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
                    {getAreaInfo(bin.areaId)?.floorNumber !== undefined && 
                      ` • ${getAreaInfo(bin.areaId).floorNumber === 0 ? "Tầng trệt" : `Tầng ${getAreaInfo(bin.areaId).floorNumber}`}`
                    }
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
                <button
                  data-dropdown-button="true"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    console.log('📊 Dropdown toggle clicked for bin:', bin.trashBinId || bin.id);
                    handleDropdownToggle(bin.trashBinId || bin.id);
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
                  onMouseEnter={(e) => {
                    e.target.style.color = "#374151";
                    e.target.style.backgroundColor = "#f3f4f6";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = "#6b7280";
                    e.target.style.backgroundColor = "transparent";
                  }}
                >
                  <HiOutlineDotsVertical
                    style={{ width: "20px", height: "20px" }}
                  />
                </button>

                {/* Dropdown Menu */}
                {openDropdown === (bin.trashBinId || bin.id) && (
                  <div
                    data-dropdown-container="true"
                    style={{
                      position: "absolute",
                      top: "100%",
                      right: "0px",
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      borderRadius: "6px",
                      boxShadow: "0 2px 4px -1px rgba(0, 0, 0, 0.1)",
                      zIndex: 1000,
                      minWidth: "110px",
                      marginTop: "4px",
                    }}
                  >
                    <button
                      onClick={() => handleActionSelect('view', bin)}
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
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#f8fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "transparent")
                      }
                    >
                      <HiOutlineEye style={{ width: "14px", height: "14px" }} />
                      Xem chi tiết
                    </button>
                    <button
                      onClick={() => handleActionSelect('edit', bin)}
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
                      onMouseEnter={(e) =>
                        (e.target.style.backgroundColor = "#f8fafc")
                      }
                      onMouseLeave={(e) =>
                        (e.target.style.backgroundColor = "transparent")
                      }
                    >
                      <HiOutlinePencil style={{ width: "14px", height: "14px" }} />
                      Sửa
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

export default TrashBinTable; 