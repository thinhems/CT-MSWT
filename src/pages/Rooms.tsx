import {
  Room,
  RoomCreateRequest,
  RoomUpdateRequest,
} from "../config/models/room.model";
import { useRooms } from "../hooks/useRoom";
import { useState } from "react";
import { HiOutlinePlus, HiOutlineSearch, HiX, HiOutlinePencil } from "react-icons/hi";
import Notification from "../components/Notification";
import Pagination from "../components/Pagination";
import RoomTable from "../components/RoomTable";
import { useAreas } from "../hooks/useArea";
import { IActionType } from "@/config/models/types";

const Rooms = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [roomTypeFilter, setRoomTypeFilter] = useState("");
  const [showAddRoomPopup, setShowAddRoomPopup] = useState(false);
  const [showViewRoomModal, setShowViewRoomModal] = useState(false);
  const [showUpdateRoomModal, setShowUpdateRoomModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const [updateRoomData, setUpdateRoomData] = useState<RoomUpdateRequest>({
    roomNumber: "",
    areaId: null,
    description: "",
    status: "Hoạt động",
    roomType: "",
  });
  const [newRoom, setNewRoom] = useState<RoomCreateRequest>({
    roomNumber: "",
    areaId: null,
    description: "",
    status: "Hoạt động",
    roomType: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState({
    isVisible: false,
    type: "success",
    message: "",
  });

  const { rooms, createAsync, updateAsync, deleteAsync } = useRooms();
  const { areas } = useAreas();
  const itemsPerPage = 5;

  // Predefined room types
  const ROOM_TYPES = ["Phòng học", "Nhà vệ sinh", "DVSV"];

  // Get unique room types for filter dropdown (combine predefined + existing)
  const uniqueRoomTypes = [...new Set([...ROOM_TYPES, ...rooms.map(room => room.roomType)])].filter(Boolean).sort();

  const handleClosePopup = () => {
    setShowAddRoomPopup(false);
    setNewRoom({
      roomNumber: "",
      areaId: null,
      description: "",
      status: "Hoạt động",
      roomType: "",
    });
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setNewRoom((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitRoom = async (e: any) => {
    e.preventDefault();
    
    if (
      !newRoom.roomNumber?.trim() ||
      !newRoom.roomType?.trim() ||
      !newRoom.status
    ) {
      showNotificationMessage(
        "error",
        "Vui lòng điền đầy đủ thông tin bắt buộc (Số phòng, Loại phòng, Trạng thái)!"
      );
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await createAsync(newRoom);
      showNotificationMessage("success", "🎉 Đã thêm phòng thành công!");
      handleClosePopup();
    } catch (error: any) {
      showNotificationMessage(
        "error",
        `❌ Lỗi khi tạo phòng: ${error.message || "Không thể kết nối đến server"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActionClick = async ({ action, room }: IActionType) => {
    if (action === "view") {
      setSelectedRoom(room);
      setShowViewRoomModal(true);
    } else if (action === "edit") {
      setSelectedRoom(room);
      setUpdateRoomData({
        roomNumber: room.roomNumber,
        areaId: room.areaId,
        description: room.description,
        status: room.status,
        roomType: room.roomType,
      });
      setShowUpdateRoomModal(true);
    } else if (action === "delete") {
      if (window.confirm("Bạn có chắc muốn xóa phòng này?")) {
        try {
          await deleteAsync(room.roomId);
          showNotificationMessage("success", "✅ Đã xóa phòng thành công!");
        } catch (error: any) {
          showNotificationMessage(
            "error",
            `❌ Lỗi khi xóa phòng: ${error.message || "Không thể kết nối đến server"}`
          );
        }
      }
    }
  };

  const handleUpdateChange = (e: any) => {
    const { name, value } = e.target;
    setUpdateRoomData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitUpdate = async (e: any) => {
    e.preventDefault();
    
    if (
      !updateRoomData.roomNumber?.trim() ||
      !updateRoomData.roomType?.trim() ||
      !updateRoomData.status
    ) {
      showNotificationMessage(
        "error",
        "Vui lòng điền đầy đủ thông tin bắt buộc!"
      );
      return;
    }

    setIsUpdating(true);
    
    try {
      if (selectedRoom) {
        await updateAsync(selectedRoom.roomId, updateRoomData);
        showNotificationMessage("success", "✅ Đã cập nhật phòng thành công!");
        setShowUpdateRoomModal(false);
        setSelectedRoom(null);
      }
    } catch (error: any) {
      showNotificationMessage(
        "error",
        `❌ Lỗi khi cập nhật phòng: ${error.message || "Không thể kết nối đến server"}`
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const showNotificationMessage = (type: "success" | "error", message: string) => {
    setNotification({
      isVisible: true,
      type,
      message,
    });
    setTimeout(() => {
      setNotification({ ...notification, isVisible: false });
    }, 3000);
  };

  // Filter rooms based on search term and room type
  const filteredRooms = rooms.filter((room) => {
    // Search term filter
    const matchesSearch = !searchTerm || (() => {
      const searchLower = searchTerm.toLowerCase();
      return (
        room.roomNumber.toLowerCase().includes(searchLower) ||
        room.roomType.toLowerCase().includes(searchLower) ||
        (room.description && room.description.toLowerCase().includes(searchLower))
      );
    })();
    
    // Room type filter
    const matchesRoomType = !roomTypeFilter || room.roomType === roomTypeFilter;
    
    return matchesSearch && matchesRoomType;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRooms = filteredRooms.slice(startIndex, endIndex);

  // Reset to page 1 when searching
  const handleSearchChange = (e: any) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Reset to page 1 when filtering by room type
  const handleRoomTypeFilterChange = (e: any) => {
    setRoomTypeFilter(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div style={{ backgroundColor: "#ffffff", height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "16px", flex: "0 0 auto" }}>
        <div style={{ marginBottom: "16px" }}>
          <nav style={{ color: "#6b7280", fontSize: "14px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: "bold", color: "#111827", marginBottom: "16px" }}>
              Quản lý phòng
            </h1>
            <span>Trang chủ</span>
            <span style={{ margin: "0 8px" }}>›</span>
            <span style={{ color: "#374151", fontWeight: "500" }}>Quản lý phòng</span>
          </nav>
        </div>

        {/* Search and Add Button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          {/* Search and Filter Controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: "1" }}>
            {/* Search Box */}
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>
                <HiOutlineSearch style={{ width: "20px", height: "20px" }} />
              </div>
              <input
                type="text"
                placeholder="Tìm phòng theo số phòng, loại phòng..."
                value={searchTerm}
                onChange={handleSearchChange}
                style={{
                  width: "400px",
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

            {/* Room Type Filter */}
            <div style={{ position: "relative" }}>
              <select
                value={roomTypeFilter}
                onChange={handleRoomTypeFilterChange}
                style={{
                  padding: "12px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "14px",
                  outline: "none",
                  backgroundColor: "white",
                  cursor: "pointer",
                  minWidth: "180px",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
              >
                <option value="">Tất cả loại phòng</option>
                {uniqueRoomTypes.map((roomType) => (
                  <option key={roomType} value={roomType}>
                    {roomType}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", marginLeft: "24px" }}>
            <button
              onClick={() => setShowAddRoomPopup(true)}
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
              onMouseEnter={(e: any) => (e.target.style.backgroundColor = "#e04516")}
              onMouseLeave={(e: any) => (e.target.style.backgroundColor = "#FF5B27")}
            >
              <HiOutlinePlus style={{ width: "20px", height: "20px" }} />
              Thêm phòng
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: "0 0 auto" }}>
        <RoomTable rooms={currentRooms} onActionClick={handleActionClick} areas={areas} />
      </div>

      {/* Pagination */}
      <div style={{ flex: "0 0 auto", padding: "16px" }}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Room Popup */}
      {showAddRoomPopup && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={handleClosePopup}>
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", width: "500px", maxWidth: "90vw", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", margin: 0 }}>Thêm phòng mới</h2>
              <button onClick={handleClosePopup} style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", padding: "4px", borderRadius: "4px", color: "#6b7280" }} onMouseEnter={(e: any) => (e.target.style.backgroundColor = "#f3f4f6")} onMouseLeave={(e: any) => (e.target.style.backgroundColor = "transparent") }>
                <HiX style={{ width: "24px", height: "24px" }} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitRoom}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>Số phòng *</label>
                <input
                  type="text"
                  name="roomNumber"
                  value={newRoom.roomNumber}
                  onChange={handleInputChange}
                  required
                  placeholder="VD: 601, A101"
                  style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none", transition: "border-color 0.2s" }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>Loại phòng *</label>
                <select
                  name="roomType"
                  value={newRoom.roomType}
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
                    backgroundColor: "white",
                    cursor: "pointer"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                >
                  <option value="">-- Chọn loại phòng --</option>
                  {ROOM_TYPES.map((roomType) => (
                    <option key={roomType} value={roomType}>
                      {roomType}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>Khu vực</label>
                <select
                  name="areaId"
                  value={newRoom.areaId || ""}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none", transition: "border-color 0.2s", backgroundColor: "white" }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                >
                  <option value="">Chọn khu vực (tùy chọn)</option>
                  {areas.sort((a, b) => a.areaName.localeCompare(b.areaName)).map((area) => (
                    <option key={area.areaId} value={area.areaId}>{area.areaName}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>Mô tả</label>
                <textarea
                  name="description"
                  value={newRoom.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Nhập mô tả phòng"
                  style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none", transition: "border-color 0.2s", resize: "vertical" }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>Trạng thái</label>
                <select
                  name="status"
                  value={newRoom.status}
                  onChange={handleInputChange}
                  style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none", transition: "border-color 0.2s", backgroundColor: "white" }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                >
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Bảo trì">Bảo trì</option>
                  <option value="Tạm ngưng">Tạm ngưng</option>
                </select>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={handleClosePopup}
                  style={{ padding: "12px 20px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontWeight: "500", backgroundColor: "white", color: "#374151", cursor: "pointer", transition: "background-color 0.2s" }}
                  onMouseEnter={(e: any) => (e.target.style.backgroundColor = "#f9fafb")}
                  onMouseLeave={(e: any) => (e.target.style.backgroundColor = "white")}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: "12px 20px", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", backgroundColor: isSubmitting ? "#9ca3af" : "#FF5B27", color: "white", cursor: isSubmitting ? "not-allowed" : "pointer", transition: "background-color 0.2s" }}
                  onMouseEnter={(e: any) => { if (!isSubmitting) { e.target.style.backgroundColor = "#E04B1F"; } }}
                  onMouseLeave={(e: any) => { if (!isSubmitting) { e.target.style.backgroundColor = isSubmitting ? "#9ca3af" : "#FF5B27"; } }}
                >
                  {isSubmitting ? "Đang thêm..." : "Thêm phòng"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Room Modal */}
      {showUpdateRoomModal && selectedRoom && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setShowUpdateRoomModal(false)}>
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", width: "500px", maxWidth: "90vw", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", margin: 0 }}>Cập nhật phòng</h2>
              <button onClick={() => setShowUpdateRoomModal(false)} style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", padding: "4px", borderRadius: "4px", color: "#6b7280" }} onMouseEnter={(e: any) => (e.target.style.backgroundColor = "#f3f4f6")} onMouseLeave={(e: any) => (e.target.style.backgroundColor = "transparent") }>
                <HiX style={{ width: "24px", height: "24px" }} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitUpdate}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>Số phòng *</label>
                <input
                  type="text"
                  name="roomNumber"
                  value={updateRoomData.roomNumber}
                  onChange={handleUpdateChange}
                  required
                  style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none", transition: "border-color 0.2s" }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>Loại phòng *</label>
                <select
                  name="roomType"
                  value={updateRoomData.roomType}
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
                    cursor: "pointer"
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                >
                  <option value="">-- Chọn loại phòng --</option>
                  {ROOM_TYPES.map((roomType) => (
                    <option key={roomType} value={roomType}>
                      {roomType}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>Khu vực</label>
                <select
                  name="areaId"
                  value={updateRoomData.areaId || ""}
                  onChange={handleUpdateChange}
                  style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none", transition: "border-color 0.2s", backgroundColor: "white" }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                >
                  <option value="">Chọn khu vực (tùy chọn)</option>
                  {areas.sort((a, b) => a.areaName.localeCompare(b.areaName)).map((area) => (
                    <option key={area.areaId} value={area.areaId}>{area.areaName}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>Mô tả</label>
                <textarea
                  name="description"
                  value={updateRoomData.description}
                  onChange={handleUpdateChange}
                  rows={3}
                  style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none", transition: "border-color 0.2s", resize: "vertical" }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "14px", fontWeight: "500", color: "#374151" }}>Trạng thái *</label>
                <select
                  name="status"
                  value={updateRoomData.status}
                  onChange={handleUpdateChange}
                  required
                  style={{ width: "100%", padding: "12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none", transition: "border-color 0.2s", backgroundColor: "white" }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                >
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Bảo trì">Bảo trì</option>
                  <option value="Tạm ngưng">Tạm ngưng</option>
                </select>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowUpdateRoomModal(false)}
                  style={{ padding: "12px 20px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", fontWeight: "500", backgroundColor: "white", color: "#374151", cursor: "pointer", transition: "background-color 0.2s" }}
                  onMouseEnter={(e: any) => (e.target.style.backgroundColor = "#f9fafb")}
                  onMouseLeave={(e: any) => (e.target.style.backgroundColor = "white")}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  style={{ padding: "12px 20px", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", backgroundColor: isUpdating ? "#9ca3af" : "#FF5B27", color: "white", cursor: isUpdating ? "not-allowed" : "pointer", transition: "background-color 0.2s" }}
                  onMouseEnter={(e: any) => { if (!isUpdating) { e.target.style.backgroundColor = "#E04B1F"; } }}
                  onMouseLeave={(e: any) => { if (!isUpdating) { e.target.style.backgroundColor = isUpdating ? "#9ca3af" : "#FF5B27"; } }}
                >
                  {isUpdating ? "Đang cập nhật..." : "Cập nhật"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Room Modal */}
      {showViewRoomModal && selectedRoom && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0, 0, 0, 0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }} onClick={() => setShowViewRoomModal(false)}>
          <div style={{ backgroundColor: "white", borderRadius: "12px", padding: "24px", width: "500px", maxWidth: "90vw", maxHeight: "90vh", overflow: "auto", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", margin: 0 }}>Chi tiết phòng</h2>
              <button onClick={() => setShowViewRoomModal(false)} style={{ backgroundColor: "transparent", border: "none", cursor: "pointer", padding: "4px", borderRadius: "4px", color: "#6b7280" }} onMouseEnter={(e: any) => (e.target.style.backgroundColor = "#f3f4f6")} onMouseLeave={(e: any) => (e.target.style.backgroundColor = "transparent") }>
                <HiX style={{ width: "24px", height: "24px" }} />
              </button>
            </div>

            {/* Room Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Room Details */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div>
                  <label style={{ fontSize: "14px", fontWeight: "500", color: "#6b7280" }}>Số phòng</label>
                  <p style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: "4px 0 0 0" }}>{selectedRoom.roomNumber}</p>
                </div>

                <div>
                  <label style={{ fontSize: "14px", fontWeight: "500", color: "#6b7280" }}>Loại phòng</label>
                  <p style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: "4px 0 0 0" }}>{selectedRoom.roomType}</p>
                </div>

                <div>
                  <label style={{ fontSize: "14px", fontWeight: "500", color: "#6b7280" }}>Khu vực</label>
                  <p style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: "4px 0 0 0" }}>{selectedRoom.areaId ? areas.find(a => a.areaId === selectedRoom.areaId)?.areaName || selectedRoom.areaId : "Chưa phân công"}</p>
                </div>

                <div>
                  <label style={{ fontSize: "14px", fontWeight: "500", color: "#6b7280" }}>Trạng thái</label>
                  <p style={{ fontSize: "16px", fontWeight: "600", margin: "4px 0 0 0" }}>
                    <span style={{
                      display: "inline-flex",
                      padding: "4px 12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      borderRadius: "9999px",
                      backgroundColor: selectedRoom.status === "Hoạt động" ? "#dcfce7" : selectedRoom.status === "Bảo trì" ? "#fef3c7" : "#fee2e2",
                      color: selectedRoom.status === "Hoạt động" ? "#15803d" : selectedRoom.status === "Bảo trì" ? "#d97706" : "#dc2626",
                    }}>
                      {selectedRoom.status}
                    </span>
                  </p>
                </div>
              </div>

              {/* Description - Full width */}
              <div>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#6b7280" }}>Mô tả</label>
                <p style={{ fontSize: "16px", fontWeight: "600", color: "#111827", margin: "4px 0 0 0", lineHeight: "1.5" }}>
                  {selectedRoom.description || "Không có mô tả"}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <div style={{ textAlign: "right", marginTop: "24px" }}>
              <button
                onClick={() => setShowViewRoomModal(false)}
                style={{ padding: "12px 24px", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "500", backgroundColor: "#6b7280", color: "white", cursor: "pointer", transition: "background-color 0.2s" }}
                onMouseEnter={(e: any) => (e.target.style.backgroundColor = "#4b5563")}
                onMouseLeave={(e: any) => (e.target.style.backgroundColor = "#6b7280")}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      <Notification
        isVisible={notification.isVisible}
        type={notification.type}
        message={notification.message}
        onClose={() => setNotification({ ...notification, isVisible: false })}
      />
    </div>
  );
};

export default Rooms;
