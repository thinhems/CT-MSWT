import { HiOutlineEye, HiOutlinePencil } from "react-icons/hi";
import Dropdown from './common/Dropdown';

const RequestTable = ({ requests, onActionClick }) => {
  const handleDropdownAction = (item, request) => {
    onActionClick({ action: item.action, request });
  };

  const handleStatusChange = (request, newStatus) => {
    onActionClick({ action: 'status', request, newStatus });
  };

  const getStatusColor = (status) => {
    if (!status) return { backgroundColor: "#f3f4f6", color: "#374151" };
    
    switch (status.toLowerCase()) {
      case "đã xử lý":
      case "da xu ly":
        return { backgroundColor: "#dcfce7", color: "#15803d" }; // Green
      case "đang xử lý":
      case "dang xu ly":
        return { backgroundColor: "#fef3c7", color: "#d97706" }; // Orange/Yellow
      case "đã gửi":
      case "da gui":
        return { backgroundColor: "#dbeafe", color: "#1d4ed8" }; // Blue
      case "đã hủy":
      case "da huy":
        return { backgroundColor: "#fee2e2", color: "#dc2626" }; // Red
      default:
        return { backgroundColor: "#f3f4f6", color: "#374151" }; // Default gray
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return "N/A";
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "N/A";
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return "N/A";
    }
  };

  const getWorkerName = (request) => {
    // Prioritize workerName from API response
    if (request.workerName) return request.workerName;
    if (request.worker?.fullName) return request.worker.fullName;
    if (request.worker?.username) return request.worker.username;
    // If only workerId is available, show a shortened version
    if (request.workerId && request.workerId.length > 8) {
      return `${request.workerId.substring(0, 8)}...`;
    }
    return request.workerId || "N/A";
  };

  const getSupervisorName = (request) => {
    if (request.supervisor?.fullName) return request.supervisor.fullName;
    if (request.supervisor?.username) return request.supervisor.username;
    if (request.supervisorId && request.supervisorId.length > 8) {
      return `${request.supervisorId.substring(0, 8)}...`;
    }
    return request.supervisorId || "N/A";
  };

  if (!requests || requests.length === 0) {
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
                Vị trí
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
                Nhân viên
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
                Giám sát
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
                  textAlign: "left",
                  fontSize: "12px",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Ngày yêu cầu
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
                Ngày xử lý
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
            <tr>
              <td colSpan="8" style={{ padding: "24px", textAlign: "center", color: "#6b7280" }}>
                Không có dữ liệu yêu cầu
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

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
              Vị trí
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
              Nhân viên
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
              Giám sát
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
                textAlign: "left",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Ngày yêu cầu
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
              Ngày xử lý
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
          {requests.map((request, index) => (
            <tr
              key={request.requestId}
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
              {/* Description Column */}
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  fontWeight: "500",
                  color: "#111827",
                  maxWidth: "250px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={request.description || "N/A"}
              >
                {request.description || "N/A"}
              </td>

              {/* Location Column */}
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "#6b7280",
                  maxWidth: "150px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={request.location || "N/A"}
              >
                {request.location || "N/A"}
              </td>

              {/* Worker Column */}
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "#6b7280",
                  maxWidth: "120px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={request.workerName || request.workerId || "N/A"}
              >
                {getWorkerName(request)}
              </td>

              {/* Supervisor Column */}
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "#6b7280",
                  maxWidth: "120px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={request.supervisor?.fullName || request.supervisorId || "N/A"}
              >
                {getSupervisorName(request)}
              </td>

              {/* Status Column */}
              <td style={{ padding: "12px 16px" }}>
                <Dropdown
                  items={[
                    { label: 'Đã gửi', value: 'Đã gửi', color: "#1d4ed8" },
                    { label: 'Đang xử lý', value: 'Đang xử lý', color: "#d97706" },
                    { label: 'Đã xử lý', value: 'Đã xử lý', color: "#15803d" },
                    { label: 'Đã hủy', value: 'Đã hủy', color: "#dc2626" }
                  ]}
                  onItemClick={(item) => handleStatusChange(request, item.value)}
                  triggerData={request}
                  buttonText={
                    <span
                      style={{
                        display: "inline-flex",
                        padding: "3px 10px",
                        fontSize: "11px",
                        fontWeight: "600",
                        borderRadius: "9999px",
                        backgroundColor: getStatusColor(request.status).backgroundColor,
                        color: getStatusColor(request.status).color,
                        cursor: "pointer",
                        border: "none",
                        minWidth: "80px",
                        justifyContent: "center"
                      }}
                    >
                      {request.status || "N/A"}
                    </span>
                  }
                  buttonStyle={{
                    padding: "0",
                    background: "none",
                    border: "none",
                    cursor: "pointer"
                  }}
                />
              </td>

              {/* Request Date Column */}
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "#6b7280",
                }}
              >
                <div style={{ color: "#111827", fontWeight: "500" }}>
                  {formatDate(request.requestDate)}
                </div>
                <div style={{ color: "#9ca3af", fontSize: "11px" }}>
                  {formatTime(request.requestDate)}
                </div>
              </td>

              {/* Resolve Date Column */}
              <td
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: "#6b7280",
                }}
              >
                {request.resolveDate ? (
                  <>
                    <div style={{ color: "#111827", fontWeight: "500" }}>
                      {formatDate(request.resolveDate)}
                    </div>
                    <div style={{ color: "#9ca3af", fontSize: "11px" }}>
                      {formatTime(request.resolveDate)}
                    </div>
                  </>
                ) : (
                  <span style={{ color: "#9ca3af", fontStyle: "italic" }}>
                    Chưa xử lý
                  </span>
                )}
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
                  triggerData={request}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RequestTable;
