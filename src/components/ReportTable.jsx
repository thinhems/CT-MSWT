import { HiOutlineEye, HiOutlinePencil } from "react-icons/hi";
import Dropdown from './common/Dropdown';
import { PRIORITY_MAPPING_REVERSE, PRIORITY_MAPPING } from "../hooks/useReport";

const ReportTable = ({ reports, onActionClick }) => {

  const handleDropdownAction = (item, report) => {
    onActionClick({ action: item.action, report });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "đã duyệt":
      case "da duyet":
      case "approved":
        return { backgroundColor: "#dcfce7", color: "#15803d" }; // Green
      case "đang duyệt":
      case "dang duyet":
      case "pending":
      case "đang xử lý":
      case "dang xu ly":
      case "processing":
        return { backgroundColor: "#fef3c7", color: "#d97706" }; // Orange/Yellow
      case "hoàn thành":
      case "hoan thanh":
      case "completed":
        return { backgroundColor: "#dbeafe", color: "#1d4ed8" }; // Blue
      case "đã gửi":
      case "da gui":
      case "sent":
        return { backgroundColor: "#e0f2fe", color: "#0369a1" }; // Light blue
      case "từ chối":
      case "tu choi":
      case "rejected":
        return { backgroundColor: "#fee2e2", color: "#dc2626" }; // Red
      case "đã xử lý":
      case "da xu ly":
      case "processed":
        return { backgroundColor: "#dcfce7", color: "#15803d" }; // Green
      case "chưa xử lý":
      case "chua xu ly":
      case "unprocessed":
        return { backgroundColor: "#f3f4f6", color: "#6b7280" }; // Gray
      default:
        return { backgroundColor: "#f3f4f6", color: "#374151" }; // Default gray
    }
  };

  const getPriorityDisplay = (priority) => {
    // If priority is undefined or null
    if (priority === undefined || priority === null) {
      return "Không xác định";
    }
    
    // Convert to string first to handle all cases
    const priorityStr = String(priority).trim().toLowerCase();
    
    // Check direct string matches first (case-insensitive)
    switch (priorityStr) {
      case "1":
        return "Cao";
      case "2":
        return "Trung bình";
      case "3":
        return "Thấp";
      case "cao":
        return "Cao";
      case "trung bình":
        return "Trung bình";
      case "thấp":
        return "Thấp";
    }
    
    // Try numeric conversion as fallback
    const priorityNum = Number(priority);
    
    if (!isNaN(priorityNum)) {
      switch (priorityNum) {
        case 1:
          return "Cao";
        case 2:
          return "Trung bình";
        case 3:
          return "Thấp";
      }
    }
    
    return "Không xác định";
  };

  const getPriorityStyle = (priority) => {
    const priorityText = getPriorityDisplay(priority);
    switch (priorityText) {
      case "Cao":
        return { backgroundColor: "#fee2e2", color: "#dc2626" };
      case "Trung bình":
        return { backgroundColor: "#fef3c7", color: "#d97706" };
      case "Thấp":
        return { backgroundColor: "#dcfce7", color: "#15803d" };
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
        marginBottom: "32px",
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
          <tr style={{ backgroundColor: "#FEF6F4", borderBottom: "2px solid #e5e7eb" }}>
            <th
              style={{
                padding: "16px 24px",
                textAlign: "left",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Báo cáo
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
               Mức độ ưu tiên
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
              Mô tả
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
                padding: "16px 24px",
                textAlign: "left",
                fontSize: "12px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Thời gian tạo
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
        <tbody style={{ borderTop: "2px solid transparent" }}>
          {reports.map((report, index) => {
            // Ensure unique key - use a combination of id and index as fallback
            const uniqueKey = report.id || `report-${index}`;
            
            // Debug log to check for duplicate keys

            
            return (
            <tr
              key={uniqueKey}
              style={{
                borderTop: index > 0 ? "1px solid #f0f0f0" : "none",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#fafafa")
              }
              onMouseLeave={(e) => {
                (e.currentTarget.style.backgroundColor = "transparent");
                // Close dropdown if mouse leaves the row
                if (openDropdown === uniqueKey) {
                  setOpenDropdown(null);
                }
              }}
            >
                             {/* Report Type Column */}
               <td
                 style={{
                   padding: "16px 24px",
                   fontSize: "14px",
                   fontWeight: "500",
                   color: "#111827",
                 }}
               >
                 {report.reportType}
               </td>

               {/* Priority Column */}
               <td
                 style={{
                   padding: "16px 24px",
                   fontSize: "14px",
                 }}
               >
                 <span
                   style={{
                     display: "inline-flex",
                     padding: "4px 12px",
                     borderRadius: "9999px",
                     fontSize: "12px",
                     fontWeight: "500",
                     ...getPriorityStyle(report.priority)
                   }}
                 >
                   {getPriorityDisplay(report.priority)}
                 </span>
               </td>

              {/* Description Column */}
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  color: "#6b7280",
                  maxWidth: "300px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {report.description || "Không có mô tả"}
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
                    ...getStatusColor(report.status),
                  }}
                >
                  {report.status}
                </span>
              </td>

              {/* Time Column */}
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", fontWeight: "500", color: "#111827" }}>
                    {report.createdAt ? new Date(report.createdAt).toLocaleDateString('vi-VN') : ""}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    {report.createdAt ? new Date(report.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ""}
                  </div>
                </div>
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
                      label: 'Chỉnh sửa',
                      icon: <HiOutlinePencil style={{ width: "14px", height: "14px" }} />,
                      color: "#374151"
                    }
                  ]}
                  onItemClick={handleDropdownAction}
                  triggerData={report}
                />
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>

    </div>
  );
};

export default ReportTable; 