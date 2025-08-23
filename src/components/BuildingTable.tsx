import React from "react";
import { Building } from "../config/models/building.model";
import Dropdown from "./common/Dropdown";

interface BuildingTableProps {
  buildings: Building[];
  onActionClick: (params: { action: "view" | "delete"; building: Building }) => void;
}

const BuildingTable: React.FC<BuildingTableProps> = ({ buildings, onActionClick }) => {
  const handleDropdownAction = (item, building) => {
    onActionClick({ action: item.action, building });
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
              Tên tòa
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
              Mô tả
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
              Số khu vực
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
          {buildings.map((building, index) => (
            <tr
              key={building.buildingId}
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
              {/* Building Name Column */}
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#111827",
                }}
              >
                {building.buildingName}
              </td>

              {/* Description Column */}
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "#6b7280",
                  maxWidth: "180px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {building.description || "Không có mô tả"}
              </td>

              {/* Areas Count Column */}
              <td
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    minWidth: "32px",
                    height: "24px",
                    padding: "2px 8px",
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "#059669",
                    backgroundColor: "#d1fae5",
                    borderRadius: "12px",
                    border: "1px solid #a7f3d0",
                  }}
                >
                  {building.areas?.length || 0}
                </span>
              </td>

              {/* Actions Column */}
              <td style={{ padding: "12px 16px", textAlign: "center" }}>
                <Dropdown
                  items={[
                    {
                      label: "Xem chi tiết",
                      action: "view",
                    },
                    {
                      label: "Xóa",
                      action: "delete",
                    },
                  ]}
                  onItemClick={handleDropdownAction}
                  triggerData={building}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default BuildingTable;
