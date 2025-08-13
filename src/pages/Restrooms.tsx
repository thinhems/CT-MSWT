import {
  Restroom,
  RestroomCreateRequest,
  RestroomUpdateRequest,
} from "../config/models/restroom.model";
import { useRestrooms, useRestroomDetail } from "../hooks/useRestroom";
import { useState } from "react";
import { HiOutlinePlus, HiOutlineSearch, HiX, HiOutlinePencil } from "react-icons/hi";
import Notification from "../components/Notification";
import Pagination from "../components/Pagination";
import RestroomTable from "../components/RestroomTable";
import { useAreas } from "../hooks/useArea";
import { IActionType } from "@/config/models/types";

const Restrooms = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddRestroomPopup, setShowAddRestroomPopup] = useState(false);
  const [showViewRestroomModal, setShowViewRestroomModal] = useState(false);
  const [showUpdateRestroomModal, setShowUpdateRestroomModal] = useState(false);
  const [selectedRestroomId, setSelectedRestroomId] = useState<string | null>(null);
  const [selectedRestroom, setSelectedRestroom] = useState<Restroom | null>(null);

  const [updateRestroomData, setUpdateRestroomData] =
    useState<RestroomUpdateRequest>({
      restroomNumber: "",
      areaId: "",
      description: "",
      status: "Hoạt động",
    });
  const [newRestroom, setNewRestroom] = useState<RestroomCreateRequest>({
    restroomNumber: "",
    areaId: "",
    description: "",
    status: "Hoạt động",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState({
    isVisible: false,
    type: "success",
    message: "",
  });

  const { restrooms, createAsync, updateAsync, deleteAsync } =
    useRestrooms();
  
  // Use the new hook to fetch detailed restroom data
  const { restroom: restroomDetail } = useRestroomDetail(selectedRestroomId);
  
  const { areas } = useAreas();
  const itemsPerPage = 5;

  const sampleStatuses = [
    { id: "1", name: "Hoạt động" },
    { id: "2", name: "Bảo trì" },
  ];

  const handleActionClick = async ({
    action,
    restroom,
  }: {
    action: IActionType;
    restroom: Restroom;
  }) => {
    if (action === "view") {
      console.log('🔍 Viewing restroom details for:', restroom.restroomId);
      setSelectedRestroomId(restroom.restroomId);
      setSelectedRestroom(restroom);
      setShowViewRestroomModal(true);
    } else if (action === "update") {
      setSelectedRestroom(restroom);
      setUpdateRestroomData({
        restroomNumber: restroom.restroomNumber || "",
        areaId: restroom.areaId || "",
        description: restroom.description || "",
        status: restroom.status || "Hoạt động",
      });
      setShowUpdateRestroomModal(true);
    } else if (action === "delete") {
      if (window.confirm("Bạn có chắc muốn xóa nhà vệ sinh này?")) {
        await deleteAsync(restroom.restroomId);
        alert("✅ Đã xóa nhà vệ sinh thành công!");
      }
    }
  };

  const handleCloseViewModal = () => {
    setShowViewRestroomModal(false);
    setSelectedRestroomId(null);
    setSelectedRestroom(null);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateRestroomModal(false);
    setSelectedRestroom(null);
    setUpdateRestroomData({
      restroomNumber: "",
      areaId: "",
      description: "",
      status: "Hoạt động",
    });
    setIsUpdating(false);
  };

  const handleUpdateChange = (e: any) => {
    const { name, value } = e.target;
    setUpdateRestroomData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitUpdate = async (e: any) => {
    e.preventDefault();
    
    if (!selectedRestroom?.restroomId) {
      showNotificationMessage("error", "Không tìm thấy thông tin nhà vệ sinh!");
      return;
    }
    
    if (!updateRestroomData?.areaId || !updateRestroomData?.restroomNumber?.trim() || !updateRestroomData?.status) {
      showNotificationMessage("error", "Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    
    try {
      setIsUpdating(true);
      await updateAsync(selectedRestroom.restroomId, updateRestroomData);
      handleCloseUpdateModal();
      showNotificationMessage("success", "Đã cập nhật nhà vệ sinh thành công!");
    } catch (error: any) {
      console.error("❌ Error updating restroom:", error);
      let errorMessage = "Có lỗi xảy ra khi cập nhật nhà vệ sinh!";
      
      if (error?.message) {
        if (error.message.includes("already exists") || error.message.includes("duplicate")) {
          errorMessage = "Số phòng này đã tồn tại! Vui lòng chọn số phòng khác.";
        } else if (error.message.includes("validation") || error.message.includes("invalid")) {
          errorMessage = "Dữ liệu không hợp lệ! Vui lòng kiểm tra lại thông tin.";
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          errorMessage = "Lỗi kết nối mạng! Vui lòng thử lại.";
        } else {
          errorMessage = error.message;
        }
      }
      
      showNotificationMessage("error", errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddRestroom = () => {
    setShowAddRestroomPopup(true);
  };

  const handleClosePopup = () => {
    setShowAddRestroomPopup(false);
    setNewRestroom({
      restroomNumber: "",
      areaId: "",
      description: "",
      status: "Hoạt động",
    });
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setNewRestroom((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitRestroom = async (e: any) => {
    e.preventDefault();
    
    if (
      !newRestroom.areaId ||
      !newRestroom.restroomNumber?.trim() ||
      !newRestroom.status
    ) {
      showNotificationMessage(
        "error",
        "Vui lòng điền đầy đủ thông tin bắt buộc (Khu vực, Số phòng, Trạng thái)!"
      );
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('🔄 Creating restroom with data:', newRestroom);
      
      const response = await createAsync(newRestroom);
      console.log('✅ Restroom created successfully:', response);

      // Reset form
      setNewRestroom({
        restroomNumber: "",
        areaId: "",
        description: "",
        status: "Hoạt động",
      });
      
      // Close popup first
      handleClosePopup();
      
      // Show success message
      showNotificationMessage("success", "🎉 Đã thêm nhà vệ sinh thành công!");
      
      // Small delay to ensure the UI updates properly
      setTimeout(() => {
        console.log('🔄 Triggering data refresh...');
        // The mutate() from SWR should automatically refresh the data
      }, 100);
    } catch (error: any) {
      console.error("❌ Error creating restroom:", error);
      
      let errorMessage = "Có lỗi xảy ra khi thêm nhà vệ sinh!";
      
      if (error?.message) {
        if (error.message.includes("already exists") || error.message.includes("duplicate")) {
          errorMessage = "Số phòng này đã tồn tại! Vui lòng chọn số phòng khác.";
        } else if (error.message.includes("validation") || error.message.includes("invalid")) {
          errorMessage = "Dữ liệu không hợp lệ! Vui lòng kiểm tra lại thông tin.";
        } else if (error.message.includes("network") || error.message.includes("fetch")) {
          errorMessage = "Lỗi kết nối mạng! Vui lòng thử lại.";
        } else {
          errorMessage = error.message;
        }
      }
      
      showNotificationMessage("error", errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const showNotificationMessage = (type: string, message: string) => {
    setNotification({
      isVisible: true,
      type,
      message,
    });
  };

  const hideNotification = () => {
    setNotification((prev) => ({
      ...prev,
      isVisible: false,
    }));
  };

  const filteredRestrooms = restrooms?.filter(
    (restroom) =>
      restroom?.restroomNumber
        ?.toLowerCase()
        .includes(searchTerm?.toLowerCase()) ||
      restroom?.area?.areaName?.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      restroom?.description?.toLowerCase().includes(searchTerm?.toLowerCase())
  );

  // Sort restrooms by floor number, area name, and room number (ascending)
  const sortedRestrooms = [...filteredRestrooms]?.sort((a: any, b: any) => {
    // First sort by floor number (ascending)
    const aFloorNum = a.area?.floorNumber || 0;
    const bFloorNum = b.area?.floorNumber || 0;
    if (aFloorNum !== bFloorNum) {
      return aFloorNum - bFloorNum;
    }
    
    // Then sort by area name (alphabetical)
    const aAreaName = a.area?.areaName?.toLowerCase() || "";
    const bAreaName = b.area?.areaName?.toLowerCase() || "";
    if (aAreaName !== bAreaName) {
      return aAreaName.localeCompare(bAreaName);
    }
    
    // Finally sort by room number (ascending)
    const aRoomNum = parseInt(a.restroomNumber?.toString() || "0");
    const bRoomNum = parseInt(b.restroomNumber?.toString() || "0");
    return aRoomNum - bRoomNum;
  });

  // Calculate pagination
  const totalPages = Math.ceil(sortedRestrooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRestrooms = sortedRestrooms.slice(startIndex, endIndex);

  // Reset to page 1 when searching
  const handleSearchChange = (e: any) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

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
      {/* Notification */}
      <Notification
        type={notification.type}
        message={notification.message}
        isVisible={notification.isVisible}
        onClose={hideNotification}
      />

      <div style={{ padding: "16px 32px", flex: "0 0 auto" }}>
        <div style={{ marginBottom: "16px" }}>
          <nav style={{ color: "#6b7280", fontSize: "14px" }}>
            <h1
              style={{
                fontSize: "30px",
                fontWeight: "bold",
                color: "#111827",
                marginBottom: "16px",
              }}
            >
              Danh sách nhà vệ sinh
            </h1>
            <span>Trang chủ</span>
            <span style={{ margin: "0 8px" }}>›</span>
            <span style={{ color: "#374151", fontWeight: "500" }}>
              Danh sách nhà vệ sinh
            </span>
          </nav>
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
              placeholder="Tìm nhà vệ sinh"
              value={searchTerm}
              onChange={handleSearchChange}
              style={{
                width: "40%",
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
            {/* Add Restroom Button */}
            <button
              onClick={handleAddRestroom}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "#FF5B27",
                color: "white",
                padding: "12px 20px",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e: any) =>
                (e.target.style.backgroundColor = "#E04B1F")
              }
              onMouseLeave={(e: any) =>
                (e.target.style.backgroundColor = "#FF5B27")
              }
            >
              <HiOutlinePlus style={{ width: "16px", height: "16px" }} />
              Thêm nhà vệ sinh
            </button>
          </div>
        </div>
      </div>

      {/* Restroom Table Container */}
      <div style={{ flex: "1", overflow: "auto", minHeight: 0 }}>
        <RestroomTable
          restrooms={currentRestrooms}
          onActionClick={handleActionClick}
        />
      </div>

      {/* Pagination */}
      <div style={{ flex: "0 0 auto", padding: "16px 32px" }}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Restroom Popup */}
      {showAddRestroomPopup && (
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
          onClick={handleClosePopup}
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
                Thêm nhà vệ sinh mới
              </h2>
              <button
                onClick={handleClosePopup}
                style={{
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  color: "#6b7280",
                }}
                onMouseEnter={(e: any) =>
                  (e.target.style.backgroundColor = "#f3f4f6")
                }
                onMouseLeave={(e: any) =>
                  (e.target.style.backgroundColor = "transparent")
                }
              >
                <HiX style={{ width: "24px", height: "24px" }} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitRestroom}>
              

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
                  Khu vực *
                </label>
                <select
                  name="areaId"
                  value={newRestroom.areaId}
                  onChange={handleInputChange}
                  required
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
                  <option value="">Chọn khu vực</option>
                  {areas?.map((area) => (
                    <option key={area.areaId} value={area.areaId}>
                      {area.areaName}
                    </option>
                  ))}
                </select>
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
                  Số phòng *
                </label>
                <input
                  type="text"
                  name="restroomNumber"
                  value={newRestroom.restroomNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập số phòng"
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
                  Trạng thái *
                </label>
                <select
                  name="status"
                  value={newRestroom.status}
                  onChange={handleInputChange}
                  required
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
                  {sampleStatuses.map((status) => (
                    <option key={status.id} value={status.name}>
                      {status.name}
                    </option>
                  ))}
                </select>
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
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={newRestroom.description}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Nhập mô tả chi tiết..."
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
                  onClick={handleClosePopup}
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
                  onMouseEnter={(e: any) =>
                    (e.target.style.backgroundColor = "#f9fafb")
                  }
                  onMouseLeave={(e: any) =>
                    (e.target.style.backgroundColor = "white")
                  }
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "12px 20px",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    backgroundColor: isSubmitting ? "#9ca3af" : "#FF5B27",
                    color: "white",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    transition: "background-color 0.2s",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                  onMouseEnter={(e: any) => {
                    if (!isSubmitting) {
                      e.target.style.backgroundColor = "#E04B1F";
                    }
                  }}
                  onMouseLeave={(e: any) => {
                    if (!isSubmitting) {
                      e.target.style.backgroundColor = "#FF5B27";
                    }
                  }}
                >
                  {isSubmitting ? "Đang thêm..." : "Thêm nhà vệ sinh"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Restroom Modal */}
      {showViewRestroomModal && (
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
              borderRadius: "16px",
              padding: "32px",
              width: "600px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid #f1f5f9",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "32px",
                paddingBottom: "16px",
                borderBottom: "2px solid #f1f5f9",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    color: "#1e293b",
                    margin: 0,
                    marginBottom: "4px",
                  }}
                >
                  Chi tiết nhà vệ sinh
                </h2>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                    margin: 0,
                  }}
                >
                  Thông tin chi tiết về phòng vệ sinh {(restroomDetail || selectedRestroom)?.restroomNumber}
                </p>
              </div>
              <button
                onClick={handleCloseViewModal}
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "8px",
                  color: "#64748b",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e: any) => {
                  e.target.style.backgroundColor = "#f1f5f9";
                  e.target.style.borderColor = "#cbd5e1";
                }}
                onMouseLeave={(e: any) => {
                  e.target.style.backgroundColor = "#f8fafc";
                  e.target.style.borderColor = "#e2e8f0";
                }}
              >
                <HiX style={{ width: "20px", height: "20px" }} />
              </button>
            </div>

            {/* Loading State */}
            {selectedRestroomId && !restroomDetail ? (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "40px",
                }}
              >
                <div
                  style={{
                    fontSize: "16px",
                    color: "#64748b",
                  }}
                >
                  Đang tải thông tin chi tiết...
                </div>
              </div>
            ) : (
              /* Restroom Info */
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Basic Information Card */}
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "24px",
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#1e293b",
                      margin: "0 0 16px 0",
                    }}
                  >
                    📍 Thông tin cơ bản
                  </h3>
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
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Số phòng
                      </label>
                      <p
                        style={{
                          fontSize: "18px",
                          fontWeight: "700",
                          color: "#1e293b",
                          margin: "6px 0 0 0",
                        }}
                      >
                        {(restroomDetail || selectedRestroom)?.restroomNumber}
                      </p>
                    </div>

                    <div>
                      <label
                        style={{
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Trạng thái
                      </label>
                      <div style={{ marginTop: "6px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            padding: "6px 12px",
                            fontSize: "14px",
                            fontWeight: "600",
                            borderRadius: "20px",
                            backgroundColor:
                              (restroomDetail || selectedRestroom)?.status?.toLowerCase() === "hoatdong" || 
                              (restroomDetail || selectedRestroom)?.status?.toLowerCase() === "hoạt động"
                                ? "#dcfce7"
                                : "#fee2e2",
                            color:
                              (restroomDetail || selectedRestroom)?.status?.toLowerCase() === "hoatdong" || 
                              (restroomDetail || selectedRestroom)?.status?.toLowerCase() === "hoạt động"
                                ? "#15803d"
                                : "#dc2626",
                          }}
                        >
                          <span
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor:
                                (restroomDetail || selectedRestroom)?.status?.toLowerCase() === "hoatdong" || 
                                (restroomDetail || selectedRestroom)?.status?.toLowerCase() === "hoạt động"
                                  ? "#15803d"
                                  : "#dc2626",
                              marginRight: "8px",
                            }}
                          />
                          {(restroomDetail || selectedRestroom)?.status?.toLowerCase() === "hoatdong" ? "Hoạt động" : 
                           (restroomDetail || selectedRestroom)?.status?.toLowerCase() === "baotri" ? "Bảo trì" : 
                           (restroomDetail || selectedRestroom)?.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Location Information Card */}
                <div
                  style={{
                    backgroundColor: "#fefbff",
                    padding: "24px",
                    borderRadius: "12px",
                    border: "1px solid #e0e7ff",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#1e293b",
                      margin: "0 0 16px 0",
                    }}
                  >
                    🏢 Vị trí
                  </h3>
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
                          fontSize: "12px",
                          fontWeight: "600",
                          color: "#64748b",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Khu vực
                      </label>
                      <p
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#1e293b",
                          margin: "6px 0 0 0",
                        }}
                      >
                        {(restroomDetail || selectedRestroom)?.area?.areaName || 
                         areas.find(a => a.areaId === (restroomDetail || selectedRestroom)?.areaId)?.areaName || 
                         "Chưa xác định"}
                      </p>
                    </div>

                   
                  </div>

                  
                </div>

                {/* Description Card */}
                <div
                  style={{
                    backgroundColor: "#fefcf3",
                    padding: "24px",
                    borderRadius: "12px",
                    border: "1px solid #fde68a",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: "600",
                      color: "#1e293b",
                      margin: "0 0 12px 0",
                    }}
                  >
                    📝 Mô tả chi tiết
                  </h3>
                  <p
                    style={{
                      fontSize: "15px",
                      color: "#374151",
                      margin: 0,
                      lineHeight: "1.6",
                      minHeight: "40px",
                    }}
                  >
                    {(restroomDetail || selectedRestroom)?.description || "Chưa có mô tả chi tiết"}
                  </p>
                </div>

                {/* Metadata Card */}
                
                 
              
              </div>
            )}

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "32px",
                paddingTop: "24px",
                borderTop: "2px solid #f1f5f9",
              }}
            >
              <div style={{ display: "flex", gap: "12px" }}>
                {(restroomDetail || selectedRestroom) && (
                  <button
                    onClick={() => {
                      handleCloseViewModal();
                      handleActionClick({ action: "update", restroom: restroomDetail || selectedRestroom! });
                    }}
                    style={{
                      padding: "12px 20px",
                      backgroundColor: "#3b82f6",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "14px",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onMouseEnter={(e: any) => (e.target.style.backgroundColor = "#2563eb")}
                    onMouseLeave={(e: any) => (e.target.style.backgroundColor = "#3b82f6")}
                  >
                    <HiOutlinePencil style={{ width: "16px", height: "16px" }} />
                    Chỉnh sửa
                  </button>
                )}
              </div>

              <button
                onClick={handleCloseViewModal}
                style={{
                  padding: "12px 24px",
                  border: "2px solid #e2e8f0",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "600",
                  backgroundColor: "white",
                  color: "#475569",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e: any) => {
                  e.target.style.backgroundColor = "#f8fafc";
                  e.target.style.borderColor = "#cbd5e1";
                }}
                onMouseLeave={(e: any) => {
                  e.target.style.backgroundColor = "white";
                  e.target.style.borderColor = "#e2e8f0";
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Restroom Modal */}
      {showUpdateRestroomModal && selectedRestroom && (
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
                Cập nhật nhà vệ sinh
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
                onMouseEnter={(e: any) =>
                  (e.target.style.backgroundColor = "#f3f4f6")
                }
                onMouseLeave={(e: any) =>
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
                  Khu vực *
                </label>
                <select
                  name="areaId"
                  value={updateRestroomData?.areaId || ""}
                  onChange={handleUpdateChange}
                  required
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
                  <option value="">Chọn khu vực</option>
                  {areas?.map((area) => (
                    <option key={area.areaId} value={area.areaId}>
                      {area.areaName}
                    </option>
                  ))}
                </select>
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
                  Số phòng *
                </label>
                <input
                  type="text"
                  name="restroomNumber"
                  value={updateRestroomData?.restroomNumber || ""}
                  onChange={handleUpdateChange}
                  required
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
                  Trạng thái *
                </label>
                <select
                  name="status"
                  value={updateRestroomData?.status || ""}
                  onChange={handleUpdateChange}
                  required
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                    backgroundColor: "white",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                >
                  {sampleStatuses.map((status) => (
                    <option key={status.id} value={status.name}>
                      {status.name}
                    </option>
                  ))}
                </select>
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
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={updateRestroomData?.description || ""}
                  onChange={handleUpdateChange}
                  rows={4}
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
                  onMouseEnter={(e: any) =>
                    (e.target.style.backgroundColor = "#f9fafb")
                  }
                  onMouseLeave={(e: any) =>
                    (e.target.style.backgroundColor = "white")
                  }
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  style={{
                    padding: "12px 20px",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    backgroundColor: isUpdating ? "#9ca3af" : "#FF5B27",
                    color: "white",
                    cursor: isUpdating ? "not-allowed" : "pointer",
                    transition: "background-color 0.2s",
                    opacity: isUpdating ? 0.7 : 1,
                  }}
                  onMouseEnter={(e: any) => {
                    if (!isUpdating) {
                      e.target.style.backgroundColor = "#E04B1F";
                    }
                  }}
                  onMouseLeave={(e: any) => {
                    if (!isUpdating) {
                      e.target.style.backgroundColor = "#FF5B27";
                    }
                  }}
                >
                  {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restrooms;
