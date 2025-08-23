import { Area } from "@/config/models/area.model";
import { useAreas } from "../hooks/useArea";
import { useBuildings } from "../hooks/useBuilding";
import { useState } from "react";
import {
  HiOutlineLocationMarker,
  HiOutlinePlus,
  HiOutlineSearch,
  HiX,
  HiOutlinePencil,
  HiOutlineEye,
} from "react-icons/hi";
import AreaTable from "../components/AreaTable";
import Pagination from "../components/Pagination";
import { ICreateAreaRequest } from "@/config/models/area.model";

const Areas = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all"); // "all", "active", "maintenance", "inactive"
  const [showAddAreaPopup, setShowAddAreaPopup] = useState(false);
  const [showViewAreaModal, setShowViewAreaModal] = useState(false);
  const [showUpdateAreaModal, setShowUpdateAreaModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [updateAreaData, setUpdateAreaData] = useState<Area>({
    areaName: "",
    buildingId: "",
    buildingName: "",
    description: "",
    status: "",
    areaId: "",
    rooms: [],
  });
  const [newArea, setNewArea] = useState<ICreateAreaRequest & { buildingName: string }>({
    areaName: "",
    buildingId: "",
    buildingName: "",
    description: "",
    status: "Hoạt động",
  });

  const itemsPerPage = 5; // Số khu vực hiển thị mỗi trang
  const { areas, createAsync, deleteAsync, updateAsync } = useAreas();
  const { buildings } = useBuildings();

  const handleActionClick = async ({
    action,
    area,
  }: {
    action: string;
    area: Area;
  }) => {
    if (action === "view") {
      setSelectedArea(area);
      setShowViewAreaModal(true);
    } else if (action === "edit") {
      setSelectedArea(area);

      setUpdateAreaData({
        areaName: area.areaName,
        buildingId: area.buildingId,
        buildingName: area.buildingName,
        description: area.description,
        status: area.status,
        areaId: area.areaId,
        rooms: area.rooms,
      });
      setShowUpdateAreaModal(true);
    } else if (action === "delete") {
      if (window.confirm("Bạn có chắc muốn xóa khu vực này?")) {
        await deleteAsync(area.areaId);
        alert("✅ Đã xóa khu vực thành công!");
      }
    }
  };

  const handleCloseViewModal = () => {
    setShowViewAreaModal(false);
    setSelectedArea(null);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateAreaModal(false);
    setSelectedArea(null);
    setUpdateAreaData({
      areaName: "",
      buildingId: "",
      buildingName: "",
      description: "",
      status: "",
      areaId: "",
      rooms: [],
    });
  };

  const handleUpdateChange = (e: any) => {
    const { name, value } = e.target;
    
    if (name === 'buildingId') {
      const selectedBuilding = buildings.find(building => building.buildingId === value);
      setUpdateAreaData((prev) => ({
        ...prev,
        buildingId: value,
        buildingName: selectedBuilding ? selectedBuilding.buildingName : "",
      }));
    } else {
      setUpdateAreaData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmitUpdate = async (e: any) => {
    e.preventDefault();
    handleCloseUpdateModal();

    await updateAsync(updateAreaData.areaId, {
      areaName: updateAreaData.areaName,
      buildingId: updateAreaData.buildingId,
      description: updateAreaData.description,
      status: updateAreaData.status,
    });

    alert("✅ Đã cập nhật khu vực thành công!");
  };

  const handleClosePopup = () => {
    setShowAddAreaPopup(false);
    setNewArea({
      areaName: "",
      buildingId: "",
      buildingName: "",
      description: "",
      status: "Hoạt động",
    });
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setNewArea((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBuildingChange = (e: any) => {
    const buildingId = e.target.value;
    const selectedBuilding = buildings.find(building => building.buildingId === buildingId);
    
    setNewArea((prev) => ({
      ...prev,
      buildingId: buildingId,
      buildingName: selectedBuilding ? selectedBuilding.buildingName : "",
    }));
  };

  const handleSubmitArea = (e: any) => {
    e.preventDefault();

    // Kiểm tra đầy đủ thông tin
    if (
      !newArea.areaName ||
      !newArea.buildingId
    ) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    // Kiểm tra số phòng hợp lệ
    // const roomBeginNum = parseInt(newArea.roomBegin.trim());
    // const roomEndNum = parseInt(newArea.roomEnd.trim());

    // if (isNaN(roomBeginNum) || isNaN(roomEndNum)) {
    //   alert("Số phòng phải là số hợp lệ!");
    //   return;
    // }

    // if (roomBeginNum >= roomEndNum) {
    //   alert("Số phòng bắt đầu phải nhỏ hơn số phòng kết thúc!");
    //   return;
    // }

    // Kiểm tra tên khu vực
    if (newArea.areaName.trim().length < 2) {
      alert("Tên khu vực phải có ít nhất 2 ký tự!");
      return;
    }

    createAsync(newArea);
    handleClosePopup();
    alert("✅ Đã thêm khu vực thành công!");
  };

  // Filter areas based on active tab and search term
  const filteredAreas = areas.filter((area) => {
    // Tab filtering
    let tabFilter;
    if (activeTab === "all") {
      tabFilter = true;
    } else if (activeTab === "active") {
      tabFilter = area.status === "Hoạt động";
    } else if (activeTab === "maintenance") {
      tabFilter = area.status === "Bảo trì";
    }

    if (!tabFilter) return false;

    // Search filtering
    if (!searchTerm) return true;

    return area.areaName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Sort areas by floor number and room begin (ascending)
  const sortedAreas = [...filteredAreas].sort((a, b) => {
    // First sort by floor number (ascending)
    // if (a.floorNumber !== b.floorNumber) {
    //   return a.floorNumber - b.floorNumber;
    // }
    
    // Then sort by room begin number (ascending)
    // const aRoomBegin = parseInt(a.roomBegin?.toString() || "0");
    // const bRoomBegin = parseInt(b.roomBegin?.toString() || "0");
    // return aRoomBegin - bRoomBegin;
    return 0; // No sorting by floor number or room begin in this version
  });

  // Tính toán pagination
  const totalPages = Math.ceil(sortedAreas.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAreas = sortedAreas.slice(startIndex, endIndex);

  // Reset về trang 1 khi search
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
              Quản lý khu vực
            </h1>
            <span>Trang chủ</span>
            <span style={{ margin: "0 8px" }}>›</span>
            <span style={{ color: "#374151", fontWeight: "500" }}>
              Quản lý khu vực
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
              onMouseEnter={(e: any) => {
                if (activeTab !== "all") {
                  e.target.style.color = "#374151";
                }
              }}
              onMouseLeave={(e: any) => {
                if (activeTab !== "all") {
                  e.target.style.color = "#6b7280";
                }
              }}
            >
              Tất cả
            </button>
            <button
              onClick={() => {
                setActiveTab("active");
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
                  activeTab === "active"
                    ? "2px solid #FF5B27"
                    : "2px solid transparent",
                color: activeTab === "active" ? "#FF5B27" : "#6b7280",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e: any) => {
                if (activeTab !== "active") {
                  e.target.style.color = "#374151";
                }
              }}
              onMouseLeave={(e: any) => {
                if (activeTab !== "active") {
                  e.target.style.color = "#6b7280";
                }
              }}
            >
              Hoạt động
            </button>
            <button
              onClick={() => {
                setActiveTab("maintenance");
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
                  activeTab === "maintenance"
                    ? "2px solid #FF5B27"
                    : "2px solid transparent",
                color: activeTab === "maintenance" ? "#FF5B27" : "#6b7280",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e: any) => {
                if (activeTab !== "maintenance") {
                  e.target.style.color = "#374151";
                }
              }}
              onMouseLeave={(e: any) => {
                if (activeTab !== "maintenance") {
                  e.target.style.color = "#6b7280";
                }
              }}
            >
              Bảo trì
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
              placeholder="Tìm khu vực"
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
            {/* Add Area Button */}
            <button
              onClick={() => setShowAddAreaPopup(true)}
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
                (e.target.style.backgroundColor = "#e04516")
              }
              onMouseLeave={(e: any) =>
                (e.target.style.backgroundColor = "#FF5B27")
              }
            >
              <HiOutlinePlus style={{ width: "20px", height: "20px" }} />
              Thêm khu vực
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ flex: "0 0 auto" }}>
        <AreaTable areas={currentAreas} onActionClick={handleActionClick} />
      </div>

      {/* Pagination */}
      <div style={{ flex: "0 0 auto", padding: "16px" }}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Area Popup */}
      {showAddAreaPopup && (
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
                Thêm khu vực mới
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
            <form onSubmit={handleSubmitArea}>
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
                  Tên khu vực *
                </label>
                <input
                  type="text"
                  name="areaName"
                  value={newArea.areaName}
                  onChange={handleInputChange}
                  required
                  placeholder="Nhập tên khu vực"
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
                  Tòa *
                </label>
                <select
                  name="buildingId"
                  value={newArea.buildingId}
                  onChange={handleBuildingChange}
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
                  <option value="">Chọn tòa</option>
                  {buildings
                    .sort((a, b) => a.buildingName.localeCompare(b.buildingName))
                    .map((building) => (
                      <option key={building.buildingId} value={building.buildingId}>
                        {building.buildingName}
                      </option>
                    ))}
                </select>
                {newArea.buildingId && (
                  <div style={{ 
                    marginTop: "4px", 
                    fontSize: "12px", 
                    color: "#6b7280",
                    fontStyle: "italic"
                  }}>
                    Đã chọn: {buildings.find(b => b.buildingId === newArea.buildingId)?.buildingName || "Không xác định"}
                  </div>
                )}
              </div>



              {/* <div
                style={{ display: "flex", gap: "12px", marginBottom: "16px" }}
              >
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Phòng bắt đầu *
                  </label>
                  <input
                    type="text"
                    name="roomBegin"
                    value={newArea.roomBegin}
                    onChange={handleInputChange}
                    required
                    placeholder="VD: A101"
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
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Phòng kết thúc *
                  </label>
                  <input
                    type="text"
                    name="roomEnd"
                    value={newArea.roomEnd}
                    onChange={handleInputChange}
                    required
                    placeholder="VD: A120"
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
              </div> */}

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
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={newArea.description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Nhập mô tả khu vực"
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
                  value={newArea.status}
                  onChange={handleInputChange}
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
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Bảo trì">Bảo trì</option>
          
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
                  onMouseEnter={(e: any) =>
                    (e.target.style.backgroundColor = "#E04B1F")
                  }
                  onMouseLeave={(e: any) =>
                    (e.target.style.backgroundColor = "#FF5B27")
                  }
                >
                  Thêm khu vực
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Update Area Modal */}
      {showUpdateAreaModal && selectedArea && (
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
                Cập nhật khu vực
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
                  Tên khu vực *
                </label>
                <input
                  type="text"
                  name="areaName"
                  value={updateAreaData.areaName}
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
                  Tòa *
                </label>
                <select
                  name="buildingId"
                  value={updateAreaData.buildingId}
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
                  <option value="">Chọn tòa</option>
                  {buildings
                    .sort((a, b) => a.buildingName.localeCompare(b.buildingName))
                    .map((building) => (
                      <option key={building.buildingId} value={building.buildingId}>
                        {building.buildingName}
                      </option>
                    ))}
                </select>
              </div>

              {/* <div
                style={{ display: "flex", gap: "12px", marginBottom: "16px" }}
              >
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Phòng bắt đầu *
                  </label>
                  <input
                    type="text"
                    name="roomBegin"
                    value={updateAreaData.roomBegin}
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
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#374151",
                    }}
                  >
                    Phòng kết thúc *
                  </label>
                  <input
                    type="text"
                    name="roomEnd"
                    value={updateAreaData.roomEnd}
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
              </div> */}

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
                  Mô tả
                </label>
                <textarea
                  name="description"
                  value={updateAreaData.description}
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
                  Trạng thái *
                </label>
                <select
                  name="status"
                  value={updateAreaData.status}
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
                  <option value="Hoạt động">Hoạt động</option>
                  <option value="Bảo trì">Bảo trì</option>
                  
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
                  onMouseEnter={(e: any) =>
                    (e.target.style.backgroundColor = "#E04B1F")
                  }
                  onMouseLeave={(e: any) =>
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

      {/* View Area Modal */}
      {showViewAreaModal && selectedArea && (
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
                Chi tiết khu vực
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

            {/* Area Info */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Area Header */}
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
                <HiOutlineLocationMarker
                  style={{ width: "24px", height: "24px", color: "#FF5B27" }}
                />
                <div>
                  <h4
                    style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}
                  >
                    {selectedArea.areaName}
                  </h4>
                  <p style={{ margin: 0, fontSize: "14px", color: "#6b7280" }}>
                    {buildings.find(b => b.buildingId === selectedArea.buildingId)?.buildingName || "Không xác định"}
                  </p>
                </div>
              </div>

              

              {/* Area Details */}
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
                          selectedArea.status === "Hoạt động"
                            ? "#dcfce7"
                            : selectedArea.status === "Bảo trì"
                            ? "#fef3c7"
                            : "#fee2e2",
                        color:
                          selectedArea.status === "Hoạt động"
                            ? "#15803d"
                            : selectedArea.status === "Bảo trì"
                            ? "#d97706"
                            : "#dc2626",
                      }}
                    >
                      {selectedArea.status}
                    </span>
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
                    Số phòng
                  </label>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#111827",
                      margin: "4px 0 0 0",
                    }}
                  >
                    {selectedArea.rooms ? selectedArea.rooms.length : 0} phòng
                  </p>
                </div>
              </div>

              {/* Rooms List - Full width */}
              {selectedArea.rooms && selectedArea.rooms.length > 0 && (
                <div>
                  <label
                    style={{
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#6b7280",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Danh sách phòng
                  </label>
                  <div
                    style={{
                      backgroundColor: "#f8fafc",
                      borderRadius: "8px",
                      padding: "16px",
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                        gap: "8px",
                      }}
                    >
                      {selectedArea.rooms.map((room) => (
                        <div
                          key={room.roomId}
                          style={{
                            backgroundColor: "white",
                            padding: "8px 12px",
                            borderRadius: "6px",
                            border: "1px solid #e5e7eb",
                            textAlign: "center",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "14px",
                              fontWeight: "600",
                              color: "#111827",
                            }}
                          >
                            {room.roomNumber}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#6b7280",
                              marginTop: "2px",
                            }}
                          >
                            {room.roomType}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Description - Full width */}
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
                    lineHeight: "1.5",
                  }}
                >
                  {selectedArea.description || "Không có mô tả"}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <div style={{ textAlign: "right", marginTop: "24px" }}>
              <button
                onClick={handleCloseViewModal}
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
                onMouseEnter={(e: any) =>
                  (e.target.style.backgroundColor = "#4b5563")
                }
                onMouseLeave={(e: any) =>
                  (e.target.style.backgroundColor = "#6b7280")
                }
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Areas;
