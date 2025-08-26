import React from "react";
import { HiOutlineEye, HiOutlinePencil } from "react-icons/hi";
import Dropdown from './common/Dropdown';

interface GroupAssignment {
  groupAssignmentId: string;
  assignmentGroupName: string;
  description?: string;
  status: string;
  workCount: number;
  createdAt: string;
}

interface IProps {
  groups: GroupAssignment[];
  onActionClick: (action: IAction) => void;
}

interface IAction {
  action: string;
  group: GroupAssignment;
}

const GroupAssignmentTable = ({
  groups,
  onActionClick,
}: IProps) => {
  console.log("groupAssignments", groups);
  
  const handleDropdownAction = (item: any, group: GroupAssignment) => {
    onActionClick({ action: item.action, group });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Hoạt động":
        return { backgroundColor: "#dcfce7", color: "#15803d" };
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
              Tên nhóm công việc
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
              Số công việc
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
              Ngày tạo
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
          {groups.map((group, index) => (
            <tr
              key={group.groupAssignmentId}
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
              {/* Group Name Column */}
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#111827",
                }}
              >
                <div>{group.assignmentGroupName}</div>
                <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                 
                </div>
              </td>

              {/* Work Count Column */}
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "#6b7280",
                }}
              >
                <span style={{ fontWeight: "600", color: "#111827" }}>
                  {group.workCount}
                </span>
                <span style={{ fontSize: "11px", color: "#6b7280", marginLeft: "4px" }}>
                  công việc
                </span>
              </td>

              {/* Created Date Column */}
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "#6b7280",
                }}
              >
                {group.createdAt ? new Date(group.createdAt).toLocaleDateString('vi-VN') : "Không xác định"}
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
                {group.description || "Không có mô tả"}
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
                    backgroundColor: getStatusColor(group.status).backgroundColor,
                    color: getStatusColor(group.status).color,
                  }}
                >
                  {group.status}
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
                  items={([
                    {
                      key: 'view',
                      action: 'view',
                      label: 'Xem chi tiết',
                      icon: <HiOutlineEye style={{ width: "14px", height: "14px" }} />,
                      color: "#374151"
                    },
                    {
                      key: 'edit',
                      action: 'edit',
                      label: 'Chỉnh sửa',
                      icon: <HiOutlinePencil style={{ width: "14px", height: "14px" }} />,
                      color: "#374151"
                    }
                  ] as any)}
                  onItemClick={(item: any, triggerData: any) => handleDropdownAction(item, triggerData)}
                  triggerData={group as any}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupAssignmentTable;
