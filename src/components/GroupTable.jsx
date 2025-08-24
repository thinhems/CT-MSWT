import { useState } from "react";
import { HiOutlineEye, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import Dropdown from './common/Dropdown';

const GroupTable = ({ groups, onActionClick }) => {
  
  // Debug log để kiểm tra dữ liệu groups
  console.log('GroupTable received groups:', groups);
  console.log('GroupTable groups length:', groups?.length);



  const handleDropdownAction = (item, group) => {
    onActionClick({ action: item.action, group });
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
        overflow: "auto",
        maxHeight: "350px",
        boxShadow: "0 2px 8px 0 rgba(0, 0, 0, 0.06)",
      }}
    >
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
          <tr style={{ backgroundColor: "#F0F9FF", borderBottom: "2px solid #e5e7eb" }}>
            <th
              style={{
                padding: "16px 24px",
                textAlign: "left",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              ID Nhóm
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
              Tên Nhóm
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
              Mô tả
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
              Ngày tạo
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
          {groups.map((group, index) => (
            <tr
              key={group.id}
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
              {/* Group ID Column */}
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#3B82F6",
                }}
              >
                {group.workerGroupId || "N/A"}
              </td>

              {/* Group Name Column */}
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#111827",
                }}
              >
                {group.workerGroupName || "Không có tên"}
              </td>

              {/* Description Column */}
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                {group.description || "Không có mô tả"}
              </td>

              {/* Creation Date Column */}
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                {group.createdAt ? new Date(group.createdAt).toLocaleDateString('vi-VN') : "N/A"}
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
                    },
                    {
                      action: 'delete',
                      label: 'Xóa nhóm',
                      icon: <HiOutlineTrash style={{ width: "14px", height: "14px" }} />,
                      color: "#dc2626"
                    }
                  ]}
                  onItemClick={handleDropdownAction}
                  triggerData={group}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupTable;

