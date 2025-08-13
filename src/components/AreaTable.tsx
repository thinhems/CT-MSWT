import { Area } from "@/config/models/restroom.model";
import { useState } from "react";
import {
  HiOutlineEye,
  HiOutlinePencil,
} from "react-icons/hi";
import Dropdown from './common/Dropdown';

interface IProps {
  areas: Area[];
  onActionClick: (action: IAction) => void;
}

interface IAction {
  action: string;
  area: Area;
}

const AreaTable = ({
  areas,
  onActionClick,
}: IProps) => {
  console.log("areas", areas);
  
  const handleDropdownAction = (item, area) => {
    onActionClick({ action: item.action, area });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hoạt động":
        return { backgroundColor: "#dcfce7", color: "#15803d" };
      case "Bảo trì":
        return { backgroundColor: "#fef3c7", color: "#d97706" };
      case "Tạm ngưng":
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
              Tên khu vực
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
              Phòng bắt đầu
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
              Phòng kết thúc
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
        <tbody style={{ borderTop: "2px solid transparent" }}>
          {areas.map((area, index) => (
            <tr
              key={area.areaId}
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
              {/* Area Name Column */}
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#111827",
                }}
              >
                {area.areaName}
              </td>

              {/* Floor Column */}
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "#6b7280",
                }}
              >
                {area.floorNumber === 0
                  ? "Tầng trệt"
                  : `Tầng ${area.floorNumber}`}
              </td>



              {/* Start Room Column */}
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "#6b7280",
                }}
              >
                {area.roomBegin}
              </td>

              {/* End Room Column */}
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "#6b7280",
                }}
              >
                {area.roomEnd}
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
                {area.description || "Không có mô tả"}
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
                    backgroundColor: getStatusColor(area.status).backgroundColor,
                color: getStatusColor(area.status).color,
                  }}
                >
                  {area.status}
                </span>
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
                      label: 'Chỉnh sửa',
                      icon: <HiOutlinePencil style={{ width: "14px", height: "14px" }} />,
                      color: "#374151"
                    }
                  ]}
                  onItemClick={handleDropdownAction}
                  triggerData={area}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>


    </div>
  );
};

export default AreaTable;
