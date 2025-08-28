import { useState } from "react";
import { HiOutlineEye, HiOutlinePencil } from "react-icons/hi";
import Dropdown from './common/Dropdown';

const UserTable = ({ users, onActionClick }) => {

  // Debug log to check users data
  console.log('UserTable received users:', users);
  console.log('UserTable users length:', users?.length);

  const getStatusColor = (status) => {
    switch (status) {
      case "Hoạt động":
        return { backgroundColor: "#dcfce7", color: "#15803d" }; // Green
      case "Thôi việc":
        return { backgroundColor: "#fee2e2", color: "#dc2626" }; // Red
      case "Chưa xác thực":
        return { backgroundColor: "#fef3c7", color: "#ea580c" }; // Yellow/Orange
      default:
        return { backgroundColor: "#f3f4f6", color: "#6b7280" }; // Gray
    }
  };

  const handleDropdownAction = (item, user) => {
    onActionClick({ action: item.action, user });
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
          <tr style={{ backgroundColor: "#FEF6F4"  ,borderBottom: "2px solid #e5e7eb" }}>
            <th
              style={{
                padding: "16px 24px",
                textAlign: "center",
                fontSize: "13px",
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
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Avatar
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
              Tên
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
              Chức vụ
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
              Số điện thoại
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
          {users.map((user, index) => (
            <tr
              key={user.id}
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
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                  width: "60px",
                }}
              >
                {index + 1}
              </td>
              {/* Avatar Column */}
              <td
                style={{
                  padding: "16px 24px",
                }}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </td>

              {/* Name Column */}
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#111827",
                }}
              >
                {user.name}
              </td>

              {/* Position Column */}
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                {user.position}
              </td>

              {/* Phone Column */}
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                {user.phone}
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
                    ...getStatusColor(user.status),
                  }}
                >
                  {user.status}
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
                      label: 'Cập nhật',
                      icon: <HiOutlinePencil style={{ width: "14px", height: "14px" }} />,
                      color: "#374151"
                    }
                  ]}
                  onItemClick={handleDropdownAction}
                  triggerData={user}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>


    </div>
  );
};

export default UserTable; 