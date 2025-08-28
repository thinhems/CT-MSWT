import React from "react";
import { HiOutlineEye, HiOutlinePencil } from "react-icons/hi";
import Dropdown from './common/Dropdown';

interface WorkerGroup {
  workerGroupId: string;
  workerGroupName: string;
  description?: string;
  members?: Array<{
    workGroupMemberId: string;
    workGroupId: string;
    userId: string;
    roleId?: string;
    joinedAt: string;
    leftAt?: string;
    fullName: string;
    userEmail: string;
  }>;
  createdAt: string;
  status?: string;
}

interface IProps {
  groups: WorkerGroup[];
  onActionClick: (action: IAction) => void;
}

interface IAction {
  action: string;
  group: WorkerGroup;
}

const WorkerGroupTable = ({
  groups,
  onActionClick,
}: IProps) => {
  const handleDropdownAction = (item: any, group: WorkerGroup) => {
    onActionClick({ action: item.action, group });
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
                padding: "12px 16px",
                textAlign: "left",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Tên nhóm làm việc
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
              key={group.workerGroupId}
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
                  padding: "12px 16px",
                  textAlign: "center",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#111827",
                  width: "60px",
                }}
              >
                {index + 1}
              </td>
              {/* Group Name Column */}
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#111827",
                }}
              >
                <div>{group.workerGroupName}</div>
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
                      color: "#FF5B27"
                    }
                  ] as any}
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

export default WorkerGroupTable;
