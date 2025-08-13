import { useState, useEffect } from "react";
import { HiOutlinePlus, HiX } from "react-icons/hi";
import RequestTable from "../components/RequestTable";
import Pagination from "../components/Pagination";
import { useRequests, useRequestsWithRole, useRequest, createRequest, updateRequest, updateRequestStatus, deleteRequest, REQUEST_PRIORITY_MAPPING, REQUEST_STATUS_MAPPING } from "../hooks/useRequest";
import { useAuth } from "../contexts/AuthContext";

const RequestManagement = () => {
  const [priorityFilter, setPriorityFilter] = useState(""); // Filter by priority
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all"); // "all", "supervisor", "worker", "mine"
  const [showAddRequestPopup, setShowAddRequestPopup] = useState(false);
  const [showViewRequestModal, setShowViewRequestModal] = useState(false);
  const [showUpdateRequestModal, setShowUpdateRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null); // ID for detailed API call
  const [updateRequestData, setUpdateRequestData] = useState({
    requestType: "",
    location: "",
    status: ""
  });
  const [newRequest, setNewRequest] = useState({
    title: "",
    description: "",
    priority: 2,
    requestedTo: "", // Nhân viên được yêu cầu
    image: null, // File hình ảnh
    imagePreview: null, // URL preview hình ảnh
    requestType: "",
    status: "Đang duyệt"
  });

  const itemsPerPage = 5; // Số yêu cầu hiển thị mỗi trang
  const { user } = useAuth(); // Get current user from auth context
  const currentUser = user?.username || "Alex Morgan"; // Fallback

  // API hooks - now using single call to get all requests with role info
  const { requests: allRequests, isLoading: allLoading, isError: allError, refresh: refreshAll } = useRequests();
  const { requests: requestsWithRole, isLoading: roleLoading, isError: roleError, refresh: refreshWithRole } = useRequestsWithRole();
  
  // Hook for detailed request view
  const { request: detailedRequest, isLoading: detailLoading, isError: detailError } = useRequest(selectedRequestId);

  // Debug detailed request data
  console.log('🔍 Detailed Request Data:', detailedRequest);
  console.log('🔍 Available fields:', detailedRequest ? Object.keys(detailedRequest) : 'No data');
  console.log('🔍 requestedBy field:', detailedRequest?.requestedBy);
  console.log('🔍 createdBy field:', detailedRequest?.createdBy);
  console.log('🔍 userName field:', detailedRequest?.userName);

  // Get requests based on active tab
  const getRequestsForTab = () => {
    switch (activeTab) {
      case "all":
        return { requests: allRequests, isLoading: allLoading, isError: allError };
      case "supervisor":
        // Filter requests where roleName is "Supervisor"
        const supervisorRequests = requestsWithRole.filter(request => 
          request.requesterRole === "Supervisor" || request.requesterRole === "supervisor"
        );
        return { requests: supervisorRequests, isLoading: roleLoading, isError: roleError };
      case "worker":
        // Filter requests where roleName is "Worker" 
        const workerRequests = requestsWithRole.filter(request => 
          request.requesterRole === "Worker" || request.requesterRole === "worker"
        );
        return { requests: workerRequests, isLoading: roleLoading, isError: roleError };
      case "mine":
        // Filter requests created by current leader specifically
        console.log('🔍 Filtering current leader requests - User:', user?.username);
        console.log('🔍 Requests with role data:', requestsWithRole.map(r => ({ 
          requesterRole: r.requesterRole, 
          userName: r.userName, 
          createdBy: r.createdBy 
        })));
        const myLeaderRequests = requestsWithRole.filter(request => 
          (request.requesterRole === "Leader" || request.requesterRole === "leader") &&
          (request.userName === user?.username || request.createdBy === user?.username)
        );
        console.log('🔍 My leader requests:', myLeaderRequests);
        return { requests: myLeaderRequests, isLoading: roleLoading, isError: roleError };
      default:
        return { requests: [], isLoading: false, isError: false };
    }
  };

  const { requests, isLoading, isError } = getRequestsForTab();

  const handleActionClick = ({ action, request }) => {
    if (action === 'view') {
      setSelectedRequestId(request.id); // Set ID to trigger API call
      setSelectedRequest(request); // Keep basic info for immediate display
      setShowViewRequestModal(true);
    } else if (action === 'update') {
      setSelectedRequest(request);
      setUpdateRequestData({
        requestType: request.requestType,
        location: request.location,
        status: request.status
      });
      setShowUpdateRequestModal(true);
    }
  };

  const handleAddRequest = async () => {
    try {
      const requestData = {
        description: newRequest.description,
        requestName: newRequest.title,
        priority: newRequest.priority,
        requestType: parseInt(newRequest.requestType) || 1,
        image: newRequest.image
      };

      await createRequest(requestData);
      setShowAddRequestPopup(false);
      setNewRequest({
        title: "",
        description: "",
        priority: 2,
        requestedTo: "",
        image: null,
        imagePreview: null,
        requestType: "",
        status: "Đang duyệt"
      });
      
      // Refresh data
      refreshAll();
      refreshWithRole();
      
      alert("Tạo yêu cầu thành công!");
    } catch (error) {
      console.error("Error creating request:", error);
      alert("Có lỗi xảy ra khi tạo yêu cầu!");
    }
  };

  const handleUpdateRequest = async () => {
    try {
      const updateData = {};
      
      if (updateRequestData.requestType) updateData.requestType = updateRequestData.requestType;
      if (updateRequestData.location) updateData.location = updateRequestData.location;
      if (updateRequestData.status) updateData.status = updateRequestData.status;

      await updateRequest(selectedRequest.id, updateData);
      setShowUpdateRequestModal(false);
      
      // Refresh data
      refreshAll();
      refreshWithRole();
      
      alert("Cập nhật yêu cầu thành công!");
    } catch (error) {
      console.error("Error updating request:", error);
      alert("Có lỗi xảy ra khi cập nhật yêu cầu!");
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa yêu cầu này?')) {
      try {
        await deleteRequest(requestId);
        
        // Refresh data
        refreshAll();
        refreshWithRole();
        
        alert("Xóa yêu cầu thành công!");
      } catch (error) {
        console.error("Error deleting request:", error);
        alert("Có lỗi xảy ra khi xóa yêu cầu!");
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewRequest(prev => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file)
      }));
    }
  };

  const removeImage = () => {
    setNewRequest(prev => ({
      ...prev,
      image: null,
      imagePreview: null
    }));
  };

  // Filter requests by priority
  const filteredRequests = priorityFilter
    ? requests.filter(request => {
        const priority = getPriorityDisplay(request.priority);
        return priority === priorityFilter;
      })
    : requests;

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  const getPriorityDisplay = (priority) => {
    if (priority === undefined || priority === null) {
      return "Không xác định";
    }
    
    const priorityStr = String(priority).trim().toLowerCase();
    
    switch (priorityStr) {
      case "1":
      case "cao":
        return "Cao";
      case "2":
      case "trung bình":
        return "Trung bình";
      case "3":
      case "thấp":
        return "Thấp";
      default:
        return "Không xác định";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Có lỗi xảy ra khi tải dữ liệu yêu cầu</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý yêu cầu</h1>
        <p className="text-gray-600">Quản lý và theo dõi các yêu cầu từ nhân viên</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: "all", label: "Tất cả yêu cầu" },
              { id: "supervisor", label: "Yêu cầu từ giám sát" },
              { id: "worker", label: "Yêu cầu từ công nhân" },
              { id: "mine", label: "Yêu cầu của tôi" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Filters and Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả độ ưu tiên</option>
            <option value="Cao">Cao</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Thấp">Thấp</option>
          </select>
        </div>

        <button
          onClick={() => setShowAddRequestPopup(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <HiOutlinePlus className="mr-2 h-5 w-5" />
          Thêm yêu cầu mới
        </button>
      </div>

      {/* Request Table */}
      <div className="bg-white rounded-lg shadow">
        <RequestTable 
          requests={currentRequests} 
          onActionClick={handleActionClick}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}

      {/* Add Request Popup */}
      {showAddRequestPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Thêm yêu cầu mới</h3>
              <button
                onClick={() => setShowAddRequestPopup(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tiêu đề yêu cầu
                </label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập tiêu đề yêu cầu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mô tả
                </label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập mô tả chi tiết"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại yêu cầu
                </label>
                <select
                  value={newRequest.requestType}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, requestType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn loại yêu cầu</option>
                  <option value="1">Vệ sinh</option>
                  <option value="2">Bảo trì</option>
                  <option value="3">Cung cấp</option>
                  <option value="4">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Độ ưu tiên
                </label>
                <select
                  value={newRequest.priority}
                  onChange={(e) => setNewRequest(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={1}>Cao</option>
                  <option value={2}>Trung bình</option>
                  <option value={3}>Thấp</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hình ảnh (tùy chọn)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {newRequest.imagePreview && (
                  <div className="mt-2 relative">
                    <img
                      src={newRequest.imagePreview}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddRequestPopup(false)}
                className="px-4 py-2 text-gray-700 bg-gray-300 rounded-md hover:bg-gray-400"
              >
                Hủy
              </button>
              <button
                onClick={handleAddRequest}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Tạo yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Request Modal */}
      {showViewRequestModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Chi tiết yêu cầu</h3>
              <button
                onClick={() => setShowViewRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tiêu đề:</label>
                <p className="text-sm text-gray-900">{selectedRequest.title || "Không có"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Trạng thái:</label>
                <p className="text-sm text-gray-900">{selectedRequest.status || "Không xác định"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Độ ưu tiên:</label>
                <p className="text-sm text-gray-900">{getPriorityDisplay(selectedRequest.priority)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Loại yêu cầu:</label>
                <p className="text-sm text-gray-900">{selectedRequest.requestType || "Không xác định"}</p>
              </div>
                              <div>
                  <label className="block text-sm font-medium text-gray-700">Vị trí:</label>
                  <p className="text-sm text-gray-900">{selectedRequest.location || "Không xác định"}</p>
                </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Người yêu cầu:</label>
                <p className="text-sm text-gray-900">{selectedRequest.requestedBy || selectedRequest.createdBy || "Không xác định"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Người được phân công:</label>
                <p className="text-sm text-gray-900">{selectedRequest.assignedTo || "Chưa phân công"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Ngày tạo:</label>
                <p className="text-sm text-gray-900">{selectedRequest.createdDate || "Không xác định"}</p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Mô tả:</label>
              <p className="text-sm text-gray-900 mt-1">{selectedRequest.description || "Không có mô tả"}</p>
            </div>

            {selectedRequest.imageUrl && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Hình ảnh:</label>
                <img
                  src={selectedRequest.imageUrl}
                  alt="Request"
                  className="mt-2 w-32 h-32 object-cover rounded"
                />
              </div>
            )}

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowViewRequestModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Đóng
              </button>
              <button
                onClick={() => {
                  setShowViewRequestModal(false);
                  handleActionClick({ action: 'update', request: selectedRequest });
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Request Modal */}
      {showUpdateRequestModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Cập nhật yêu cầu</h3>
              <button
                onClick={() => setShowUpdateRequestModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiX className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Loại yêu cầu
                </label>
                <select
                  value={updateRequestData.requestType}
                  onChange={(e) => setUpdateRequestData(prev => ({ ...prev, requestType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Giữ nguyên</option>
                  <option value="1">Vệ sinh</option>
                  <option value="2">Bảo trì</option>
                  <option value="3">Cung cấp</option>
                  <option value="4">Khác</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vị trí
                </label>
                <input
                  type="text"
                  value={updateRequestData.location}
                  onChange={(e) => setUpdateRequestData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập vị trí mới"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Trạng thái
                </label>
                <select
                  value={updateRequestData.status}
                  onChange={(e) => setUpdateRequestData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Giữ nguyên</option>
                  <option value="Đã gửi">Đã gửi</option>
                  <option value="Đang xử lý">Đang xử lý</option>
                  <option value="Đã hoàn thành">Đã hoàn thành</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowUpdateRequestModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateRequest}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Cập nhật
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestManagement;