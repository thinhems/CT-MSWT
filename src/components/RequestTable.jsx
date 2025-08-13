import { HiOutlineEye, HiOutlinePencil } from "react-icons/hi";
import Dropdown from './common/Dropdown';
import { REQUEST_PRIORITY_MAPPING_REVERSE, REQUEST_PRIORITY_MAPPING } from "../hooks/useRequest";

const RequestTable = ({ requests, onActionClick }) => {

  const handleDropdownAction = (item, request) => {
    onActionClick({ action: item.action, request });
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
        return { backgroundColor: "#e0e7ff", color: "#6366f1" }; // Indigo
      case "chưa xử lý":
      case "chua xu ly":
      case "unprocessed":
        return { backgroundColor: "#f3f4f6", color: "#6b7280" }; // Gray
      default:
        return { backgroundColor: "#f3f4f6", color: "#374151" }; // Default gray
    }
  };

  const getPriorityDisplay = (priority) => {
    console.log('Raw priority value:', priority, 'Type:', typeof priority, 'String value:', String(priority));
    
    // If priority is undefined or null
    if (priority === undefined || priority === null) {
      console.log('Priority is undefined or null');
      return "Không xác định";
    }
    
    // Convert to string first to handle all cases
    const priorityStr = String(priority).trim().toLowerCase();
    console.log('Priority as lowercase string:', priorityStr);
    
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
    console.log('Priority as number:', priorityNum, 'isNaN:', isNaN(priorityNum));
    
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
    
    console.log('No match found, returning default');
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
        return { backgroundColor: "#f3f4f6", color: "#6b7280" };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      return "N/A";
    }
  };

  const formatTime = (timeString) => {
    if (!timeString) return "N/A";
    try {
      const time = new Date(timeString);
      return time.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch (error) {
      return "N/A";
    }
  };

  const getRequestTypeDisplay = (requestType) => {
    if (!requestType) return "Không xác định";
    
    const typeStr = String(requestType).toLowerCase();
    switch (typeStr) {
      case "1":
      case "vệ sinh":
      case "vesinh":
        return "Vệ sinh";
      case "2":
      case "bảo trì":
      case "baotri":
        return "Bảo trì";
      case "3":
      case "cung cấp":
      case "cungcap":
        return "Cung cấp";
      case "4":
      case "khác":
        return "Khác";
      default:
        return requestType;
    }
  };

  const getLocationDisplay = (location) => {
    if (!location) return "Không xác định";
    return location;
  };

  const getRequesterDisplay = (requestedBy, createdBy, userName) => {
    // Priority: userName > requestedBy > createdBy
    if (userName) return userName;
    if (requestedBy) return requestedBy;
    if (createdBy) return createdBy;
    return "Không xác định";
  };

  const getAssignedToDisplay = (assignedTo) => {
    if (!assignedTo) return "Chưa phân công";
    return assignedTo;
  };

  const getContactInfoDisplay = (contactInfo) => {
    if (!contactInfo) return "Không có";
    return contactInfo;
  };

  const getImageDisplay = (imageUrl) => {
    if (!imageUrl) return "Không có";
    return "Có hình ảnh";
  };

  const getRoleDisplay = (requesterRole) => {
    if (!requesterRole) return "Không xác định";
    
    const roleStr = String(requesterRole).toLowerCase();
    switch (roleStr) {
      case "supervisor":
      case "giám sát":
      case "giamsat":
        return "Giám sát";
      case "worker":
      case "công nhân":
      case "congnhan":
        return "Công nhân";
      case "leader":
      case "trưởng nhóm":
      case "truongnhom":
        return "Trưởng nhóm";
      default:
        return requesterRole;
    }
  };

  const getDropdownItems = (request) => [
    {
      label: "Xem chi tiết",
      action: "view",
      icon: HiOutlineEye,
    },
    {
      label: "Cập nhật",
      action: "update",
      icon: HiOutlinePencil,
    },
  ];

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Không có yêu cầu nào để hiển thị
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Thông tin yêu cầu
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Loại yêu cầu
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Vị trí
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Người yêu cầu
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Người được phân công
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Trạng thái
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Độ ưu tiên
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Ngày tạo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
              Thao tác
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {requests.map((request) => (
            <tr key={request.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-gray-900">
                    {request.title || "Không có tiêu đề"}
                  </div>
                  <div className="text-sm text-gray-500 max-w-xs truncate">
                    {request.description || "Không có mô tả"}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {getImageDisplay(request.imageUrl)}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900">
                  {getRequestTypeDisplay(request.requestType)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900">
                  {getLocationDisplay(request.location)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <div className="text-sm font-medium text-gray-900">
                    {getRequesterDisplay(request.requestedBy, request.createdBy, request.userName)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getRoleDisplay(request.requesterRole)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {getContactInfoDisplay(request.contactInfo)}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-sm text-gray-900">
                  {getAssignedToDisplay(request.assignedTo)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  style={getStatusColor(request.status)}
                >
                  {request.status || "Không xác định"}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className="inline-flex px-2 py-1 text-xs font-semibold rounded-full"
                  style={getPriorityStyle(request.priority)}
                >
                  {getPriorityDisplay(request.priority)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-col">
                  <div className="text-sm text-gray-900">
                    {formatDate(request.createdDate)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatTime(request.timeCreated)}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <Dropdown
                  items={getDropdownItems(request)}
                  onItemClick={(item) => handleDropdownAction(item, request)}
                  trigger={
                    <button className="text-gray-400 hover:text-gray-600">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  }
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
