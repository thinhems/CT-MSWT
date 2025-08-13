import { useState, useEffect } from "react";
import { HiX, HiOutlineSearch, HiOutlineClipboardList } from "react-icons/hi";
import RequestTable from "../components/RequestTable";
import Pagination from "../components/Pagination";
import { useRequests, useRequest, updateRequestStatus, REQUEST_STATUS_MAPPING, REQUEST_STATUS_MAPPING_REVERSE } from "../hooks/useRequest";
import { useAuth } from "../contexts/AuthContext";

const RequestManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all"); // "all", "supervisor", "worker", "mine"
  const [showViewRequestModal, setShowViewRequestModal] = useState(false);
  const [showUpdateRequestModal, setShowUpdateRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [updateRequestData, setUpdateRequestData] = useState({
    description: "",
    location: "",
    status: ""
  });

  const itemsPerPage = 5;
  const { user } = useAuth();

  // API hooks
  const { requests: allRequests, isLoading: allLoading, isError: allError, refresh: refreshAll } = useRequests();
  const { request: detailedRequest, isLoading: detailLoading, isError: detailError } = useRequest(selectedRequestId);

  // Get requests based on active tab
  const getRequestsForTab = () => {
    if (activeTab === "all") {
      return allRequests || [];
    } else if (activeTab === "sent") {
      return (allRequests || []).filter(request => request.status === "Đã gửi");
    } else if (activeTab === "processing") {
      return (allRequests || []).filter(request => request.status === "Đang xử lý");
    } else if (activeTab === "completed") {
      return (allRequests || []).filter(request => request.status === "Đã xử lý");
    } else if (activeTab === "cancelled") {
      return (allRequests || []).filter(request => request.status === "Đã hủy");
    } else if (activeTab === "mine") {
      return (allRequests || []).filter(request => request.workerId === user?.id);
    }
    return allRequests || [];
  };

  // Filter requests based on active tab and search term
  const filteredRequests = getRequestsForTab().filter((request) => {
    if (!searchTerm) return true;
    return request.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
           request.location.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Sort requests by request date (newest first)
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    return new Date(b.requestDate) - new Date(a.requestDate);
  });

  const requests = sortedRequests;
  const totalPages = Math.ceil(requests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = requests.slice(startIndex, endIndex);

  // Get counts for tabs
  const getTabCounts = () => {
    const allCount = (allRequests || []).length;
    const sentCount = (allRequests || []).filter(r => r.status === "Đã gửi").length;
    const processingCount = (allRequests || []).filter(r => r.status === "Đang xử lý").length;
    const completedCount = (allRequests || []).filter(r => r.status === "Đã xử lý").length;
    const cancelledCount = (allRequests || []).filter(r => r.status === "Đã hủy").length;
    const mineCount = (allRequests || []).filter(r => r.workerId === user?.id).length;

    return { allCount, sentCount, processingCount, completedCount, cancelledCount, mineCount };
  };

  const tabCounts = getTabCounts();

  const handleActionClick = ({ action, request, newStatus }) => {
    if (action === "view") {
      setSelectedRequest(request);
      setSelectedRequestId(request.requestId);
      setShowViewRequestModal(true);
    } else if (action === "edit") {
      setSelectedRequest(request);
      setUpdateRequestData({
        description: request.description,
        location: request.location,
        status: request.status
      });
      setShowUpdateRequestModal(true);
    } else if (action === "status") {
      handleStatusUpdate(request.requestId, newStatus);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      // Convert status text to number using the mapping
      const statusNumber = REQUEST_STATUS_MAPPING_REVERSE[newStatus];
      if (statusNumber === undefined) {
        alert("Trạng thái không hợp lệ!");
        return;
      }
      
      await updateRequestStatus(requestId, statusNumber);
      refreshAll();
      alert("✅ Đã cập nhật trạng thái thành công!");
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Không thể cập nhật trạng thái. Vui lòng thử lại.");
    }
  };

  const handleUpdateRequest = async () => {
    try {
      // Since the backend doesn't support updating requests, we'll just update the status
      // if the status has changed
      if (updateRequestData.status !== selectedRequest.status) {
        const statusNumber = REQUEST_STATUS_MAPPING_REVERSE[updateRequestData.status];
        if (statusNumber !== undefined) {
          await updateRequestStatus(selectedRequest.requestId, statusNumber);
        }
      }
      
      setShowUpdateRequestModal(false);
      setSelectedRequest(null);
      setUpdateRequestData({
        description: "",
        location: "",
        status: ""
      });
      refreshAll();
      alert("✅ Đã cập nhật yêu cầu thành công!");
    } catch (error) {
      console.error("Error updating request:", error);
      alert("Không thể cập nhật yêu cầu. Vui lòng thử lại.");
    }
  };

  const handleCloseViewModal = () => {
    setShowViewRequestModal(false);
    setSelectedRequest(null);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateRequestModal(false);
    setSelectedRequest(null);
    setUpdateRequestData({
      description: "",
      location: "",
      status: ""
    });
  };

  const handleInputChange = (e) => {
    // Function removed - no longer needed
  };

  const handleUpdateChange = (e) => {
    const { name, value } = e.target;
    setUpdateRequestData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    // Function removed - no longer needed
  };

  const handleSubmitUpdate = (e) => {
    e.preventDefault();
    handleUpdateRequest();
  };

  // Reset về trang 1 khi search
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  if (allLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (allError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-red-600">Có lỗi xảy ra khi tải dữ liệu</div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#ffffff",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ padding: "16px", flex: "0 0 auto" }}>
        
        <div style={{ marginBottom: "16px" }}>
          <nav style={{ color: "#6b7280", fontSize: "14px" }}>
            <h1
              style={{
                fontSize: "22px",
                fontWeight: "bold",
                color: "#111827",
                marginBottom: "16px",
              }}
            >
              Quản lý Yêu cầu
            </h1>
            <span>Trang chủ</span>
            <span style={{ margin: "0 8px" }}>›</span>
            <span style={{ color: "#374151", fontWeight: "500" }}>
              Quản lý Yêu cầu
            </span>
          </nav>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb" }}>
            <button
              onClick={() => {
                setActiveTab("all");
                setCurrentPage(1);
              }}
              style={{
                padding: "12px 24px",
                border: "none",
                backgroundColor: "transparent",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                borderBottom:
                  activeTab === "all"
                    ? "2px solid #FF5B27"
                    : "2px solid transparent",
                color: activeTab === "all" ? "#FF5B27" : "#6b7280",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== "all") {
                  e.target.style.color = "#374151";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "all") {
                  e.target.style.color = "#6b7280";
                }
              }}
            >
              Tất cả
            </button>
            <button
              onClick={() => {
                setActiveTab("sent");
                setCurrentPage(1);
              }}
              style={{
                padding: "12px 24px",
                border: "none",
                backgroundColor: "transparent",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                borderBottom:
                  activeTab === "sent"
                    ? "2px solid #FF5B27"
                    : "2px solid transparent",
                color: activeTab === "sent" ? "#FF5B27" : "#6b7280",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== "sent") {
                  e.target.style.color = "#374151";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "sent") {
                  e.target.style.color = "#6b7280";
                }
              }}
            >
              Đã gửi
            </button>
            <button
              onClick={() => {
                setActiveTab("processing");
                setCurrentPage(1);
              }}
              style={{
                padding: "12px 24px",
                border: "none",
                backgroundColor: "transparent",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                borderBottom:
                  activeTab === "processing"
                    ? "2px solid #FF5B27"
                    : "2px solid transparent",
                color: activeTab === "processing" ? "#FF5B27" : "#6b7280",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== "processing") {
                  e.target.style.color = "#374151";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "processing") {
                  e.target.style.color = "#6b7280";
                }
              }}
            >
              Đang xử lý
            </button>
            <button
              onClick={() => {
                setActiveTab("completed");
                setCurrentPage(1);
              }}
              style={{
                padding: "12px 24px",
                border: "none",
                backgroundColor: "transparent",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                borderBottom:
                  activeTab === "completed"
                    ? "2px solid #FF5B27"
                    : "2px solid transparent",
                color: activeTab === "completed" ? "#FF5B27" : "#6b7280",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== "completed") {
                  e.target.style.color = "#374151";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "completed") {
                  e.target.style.color = "#6b7280";
                }
              }}
            >
              Đã xử lý
            </button>
            <button
              onClick={() => {
                setActiveTab("cancelled");
                setCurrentPage(1);
              }}
              style={{
                padding: "12px 24px",
                border: "none",
                backgroundColor: "transparent",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                borderBottom:
                  activeTab === "cancelled"
                    ? "2px solid #FF5B27"
                    : "2px solid transparent",
                color: activeTab === "cancelled" ? "#FF5B27" : "#6b7280",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== "cancelled") {
                  e.target.style.color = "#374151";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "cancelled") {
                  e.target.style.color = "#6b7280";
                }
              }}
            >
              Đã hủy
            </button>
            
          </div>
        </div>

        {/* Search and Add Button */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          {/* Search Box */}
          <div style={{ position: "relative", flex: "1" }}>
            <div
              style={{
                position: "absolute",
                left: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#9ca3af",
              }}
            >
              <HiOutlineSearch style={{ width: "20px", height: "20px" }} />
            </div>
            <input
              type="text"
              placeholder="Tìm yêu cầu"
              value={searchTerm}
              onChange={handleSearchChange}
              style={{
                width: "32%",
                padding: "12px 16px 12px 48px",
                border: "1px solid #d1d5db",
                borderRadius: "50px",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
              onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", marginLeft: "24px" }}>
            {/* Add Request Button - REMOVED */}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: "0 0 auto" }}>
        <RequestTable 
          requests={currentRequests} 
          onActionClick={handleActionClick} 
        />
      </div>

      {/* Pagination */}
      <div style={{ flex: "0 0 auto", padding: "16px" }}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* View Request Modal */}
      {showViewRequestModal && selectedRequest && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={handleCloseViewModal}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "500px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#111827",
                  margin: 0,
                }}
              >
                Chi tiết yêu cầu
              </h2>
              <button
                onClick={handleCloseViewModal}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  color: "#6b7280",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#f3f4f6")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
              >
                <HiX style={{ width: "24px", height: "24px" }} />
              </button>
            </div>

            {/* Request Info */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Request Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "16px",
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                }}
              >
                <HiOutlineClipboardList
                  style={{ width: "24px", height: "24px", color: "#FF5B27" }}
                />
                <div>
                  <h4
                    style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}
                  >
                    Yêu cầu #{selectedRequest.requestId.slice(0, 8)}
                  </h4>
                  <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
                    {new Date(selectedRequest.requestDate).toLocaleDateString('vi-VN')}
                  </p>
                </div>
              </div>

              {/* Request Details */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div>
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#6b7280",
                    }}
                  >
                    Mô tả
                  </label>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#111827",
                      margin: "4px 0 0 0",
                    }}
                  >
                    {selectedRequest.description}
                  </p>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#6b7280",
                    }}
                  >
                    Vị trí
                  </label>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#111827",
                      margin: "4px 0 0 0",
                    }}
                  >
                    {selectedRequest.location}
                  </p>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#6b7280",
                    }}
                  >
                    Nhân viên
                  </label>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#111827",
                      margin: "4px 0 0 0",
                    }}
                  >
                    {selectedRequest.workerName || selectedRequest.workerId || "N/A"}
                  </p>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#6b7280",
                    }}
                  >
                    Trạng thái
                  </label>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      margin: "4px 0 0 0",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        padding: "4px 12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        borderRadius: "9999px",
                        backgroundColor: 
                          selectedRequest.status === "Đã xử lý" ? "#dcfce7" :
                          selectedRequest.status === "Đang xử lý" ? "#fef3c7" :
                          selectedRequest.status === "Đã gửi" ? "#dbeafe" : "#f3f4f6",
                        color: 
                          selectedRequest.status === "Đã xử lý" ? "#15803d" :
                          selectedRequest.status === "Đang xử lý" ? "#d97706" :
                          selectedRequest.status === "Đã gửi" ? "#1d4ed8" : "#374151",
                      }}
                    >
                      {selectedRequest.status}
                    </span>
                  </p>
                </div>
              </div>

              {/* Description - Full width */}
              <div>
                <label
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#6b7280",
                  }}
                >
                  Ngày xử lý
                </label>
                <p
                  style={{
                    fontSize: "16px",
                    fontWeight: "600",
                    color: "#111827",
                    margin: "4px 0 0 0",
                    lineHeight: "1.5",
                  }}
                >
                  {selectedRequest.resolveDate 
                    ? new Date(selectedRequest.resolveDate).toLocaleDateString('vi-VN')
                    : "Chưa xử lý"
                  }
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ textAlign: "right", marginTop: "24px" }}>
              <button
                onClick={() => handleCloseViewModal()}
                style={{
                  padding: "12px 24px",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  backgroundColor: "#6b7280",
                  color: "white",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#4b5563")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "#6b7280")
                }
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Request Modal */}
      {showUpdateRequestModal && selectedRequest && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={handleCloseUpdateModal}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              width: "500px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#111827",
                  margin: 0,
                }}
              >
                Cập nhật yêu cầu
              </h2>
              <button
                onClick={handleCloseUpdateModal}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  color: "#6b7280",
                }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = "#f3f4f6")
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = "transparent")
                }
              >
                <HiX style={{ width: "24px", height: "24px" }} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitUpdate}>
              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Mô tả yêu cầu
                </label>
                <textarea
                  name="description"
                  value={updateRequestData.description}
                  onChange={handleUpdateChange}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                    resize: "vertical",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Vị trí
                </label>
                <input
                  type="text"
                  name="location"
                  value={updateRequestData.location}
                  onChange={handleUpdateChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Trạng thái
                </label>
                <select
                  name="status"
                  value={updateRequestData.status}
                  onChange={handleUpdateChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                >
                  <option value="Đã gửi">Đã gửi</option>
                  <option value="Đang xử lý">Đang xử lý</option>
                  <option value="Đã xử lý">Đã xử lý</option>
                  <option value="Đã hủy">Đã hủy</option>
                </select>
              </div>

              {/* Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "12px",
                }}
              >
                <button
                  type="button"
                  onClick={handleCloseUpdateModal}
                  style={{
                    padding: "12px 20px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    backgroundColor: "white",
                    color: "#374151",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#f9fafb")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "white")
                  }
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "12px 20px",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    backgroundColor: "#FF5B27",
                    color: "white",
                    cursor: "pointer",
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#E04B1F")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "#FF5B27")
                  }
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestManagement;