import {
  Building,
  ICreateBuildingRequest,
} from "@/config/models/building.model";
import { useState } from "react";
import { HiOutlinePlus, HiOutlineSearch, HiX, HiOutlineOfficeBuilding } from "react-icons/hi";
import BuildingTable from "../components/BuildingTable";
import Notification from "../components/Notification";
import Pagination from "../components/Pagination";
import { useBuildings } from "../hooks/useBuilding";

const Buildings = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddBuildingPopup, setShowAddBuildingPopup] = useState(false);
  const [showViewBuildingModal, setShowViewBuildingModal] = useState(false);

  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  const [newBuilding, setNewBuilding] = useState<ICreateBuildingRequest>({
    buildingName: "",
    description: "",
  });
  const [notification, setNotification] = useState({
    isVisible: false,
    type: "success",
    message: "",
  });

  const itemsPerPage = 5;

  const { buildings, createAsync, deleteAsync } = useBuildings();

  // Early return if no buildings
  if (buildings.length === 0) {
    return (
      <div style={{ padding: "20px", textAlign: "center" }}>
        <p>Không có dữ liệu tòa nào.</p>
      </div>
    );
  }

  const handleActionClick = async ({
    action,
    building,
  }: {
    action: "view" | "delete";
    building: Building;
  }) => {
    console.log("🚀 Buildings - handleActionClick called:", { action, building });
    console.log("Current state:", { showViewBuildingModal, selectedBuilding });
    
    if (action === "view") {
      console.log("Setting selectedBuilding and opening modal...");
      setSelectedBuilding(building);
      setShowViewBuildingModal(true);
      console.log("After setting state:", { showViewBuildingModal: true, selectedBuilding: building });
    } else if (action === "delete") {
      if (window.confirm("Bạn có chắc muốn xóa tòa này?")) {
        await deleteAsync(building.buildingId);
        alert("✅ Đã xóa tòa thành công!");
      }
    }
  };

  // Filtering and sorting logic
  const filteredBuildings = buildings?.filter((building: Building) => {
    const matchesSearch = building?.buildingName
      ?.toLowerCase()
      ?.includes(searchTerm?.toLowerCase());
    
    return matchesSearch;
  });

  const sortedBuildings = [...filteredBuildings]?.sort((a, b) => {
    // Sort by building name alphabetically
    return a.buildingName.localeCompare(b.buildingName);
  });



  // Calculate pagination
  const totalPages = Math.ceil(sortedBuildings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBuildings = sortedBuildings.slice(startIndex, endIndex);

  const handleSearchChange = (e: any) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Calculate counts for each tab
  const allCount = buildings?.length || 0;

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

  const handleCloseViewModal = () => {
    setShowViewBuildingModal(false);
    setSelectedBuilding(null);
  };



  const handleClosePopup = () => {
    setShowAddBuildingPopup(false);
    setNewBuilding({
      buildingName: "",
      description: "",
    });
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setNewBuilding((prev) => ({
      ...prev,
      [name]: value,
    }));
  };



  const handleSubmitBuilding = async (e: any) => {
    e.preventDefault();
    if (!newBuilding.buildingName || !newBuilding.description) {
      showNotificationMessage(
        "error",
        "Vui lòng điền đầy đủ thông tin bắt buộc!"
      );
      return;
    }

    try {
      await createAsync(newBuilding);
      handleClosePopup();
      showNotificationMessage("success", "Đã thêm tòa thành công!");
    } catch (error) {
      console.error("Error creating building:", error);
      showNotificationMessage("error", "Có lỗi xảy ra khi thêm tòa!");
    }
  };



  console.log("Buildings component render:", { 
    showViewBuildingModal, 
    selectedBuilding, 
    buildingsCount: buildings.length 
  });

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
               Quản lý tòa
             </h1>
             <span>Trang chủ</span>
             <span style={{ margin: "0 8px" }}>›</span>
             <span style={{ color: "#374151", fontWeight: "500" }}>
               Quản lý tòa
             </span>
          </nav>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", gap: "0", borderBottom: "1px solid #e5e7eb" }}>
            <button
              onClick={() => {
                setActiveTab("all");
                setCurrentPage(1);
              }}
              style={{
                padding: "12px 24px",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: activeTab === "all" ? "2px solid #FF5B27" : "2px solid transparent",
                color: activeTab === "all" ? "#FF5B27" : "#6b7280",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Tất cả ({allCount})
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
               placeholder="Tìm tòa"
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
                         <button
               onClick={() => setShowAddBuildingPopup(true)}
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
               Thêm tòa
             </button>
          </div>
        </div>
      </div>

             {/* Building Table Container */}
       <div style={{ flex: "1", overflow: "visible", minHeight: 0 }}>
         <BuildingTable
           buildings={currentBuildings}
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

             {/* Add Building Popup */}
       {showAddBuildingPopup && (
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
              width: "600px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
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
                 Thêm tòa mới
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
              >
                <HiX style={{ width: "24px", height: "24px" }} />
              </button>
            </div>

                         <form onSubmit={handleSubmitBuilding}>
              <div style={{ marginBottom: "20px" }}>
                                 <label
                   style={{
                     display: "block",
                     fontSize: "14px",
                     fontWeight: "500",
                     color: "#374151",
                     marginBottom: "8px",
                   }}
                 >
                   Tên tòa *
                 </label>
                 <input
                   type="text"
                   name="buildingName"
                   value={newBuilding.buildingName}
                   onChange={handleInputChange}
                   placeholder="Nhập tên tòa"
                   style={{
                     width: "100%",
                     padding: "12px 16px",
                     border: "1px solid #d1d5db",
                     borderRadius: "8px",
                     fontSize: "14px",
                     outline: "none",
                     transition: "border-color 0.2s",
                   }}
                   required
                 />
              </div>



                             <div style={{ marginBottom: "24px" }}>
                 <label
                   style={{
                     display: "block",
                     fontSize: "14px",
                     fontWeight: "500",
                     color: "#374151",
                     marginBottom: "8px",
                   }}
                 >
                   Mô tả *
                 </label>
                 <textarea
                   name="description"
                   value={newBuilding.description}
                   onChange={handleInputChange}
                   placeholder="Nhập mô tả tòa"
                   style={{
                     width: "100%",
                     padding: "12px 16px",
                     border: "1px solid #d1d5db",
                     borderRadius: "8px",
                     fontSize: "14px",
                     outline: "none",
                     backgroundColor: "white",
                     minHeight: "80px",
                     resize: "vertical",
                   }}
                   required
                 />
               </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={handleClosePopup}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  Hủy bỏ
                </button>
                                 <button
                   type="submit"
                   style={{
                     padding: "12px 24px",
                     backgroundColor: "#FF5B27",
                     color: "white",
                     border: "none",
                     borderRadius: "8px",
                     fontSize: "14px",
                     fontWeight: "500",
                     cursor: "pointer",
                   }}
                 >
                   Thêm tòa
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}

             {/* View Building Modal */}
       {showViewBuildingModal && selectedBuilding && (
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
              width: "600px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow:
                "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
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
                 Thông tin tòa - Debug: {showViewBuildingModal ? 'OPEN' : 'CLOSED'}
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
              >
                <HiX style={{ width: "24px", height: "24px" }} />
              </button>
            </div>

                         <div style={{ marginBottom: "20px" }}>
               <label
                 style={{
                   display: "block",
                   fontSize: "14px",
                   fontWeight: "500",
                   color: "#374151",
                   marginBottom: "8px",
                 }}
               >
                 Tên tòa
               </label>
               <div
                 style={{
                   padding: "12px 16px",
                   backgroundColor: "#f9fafb",
                   borderRadius: "8px",
                   fontSize: "14px",
                   color: "#111827",
                 }}
               >
                 {selectedBuilding.buildingName}
               </div>
             </div>

             {/* Building Summary */}
             <div style={{ 
               marginBottom: "20px", 
               padding: "16px", 
               backgroundColor: "#f8fafc", 
               borderRadius: "8px",
               border: "1px solid #e2e8f0"
             }}>
               <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                 <div>
                   <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>
                     Tổng quan
                   </div>
                   <div style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                     {selectedBuilding.areas?.length || 0} khu vực
                   </div>
                 </div>
                 <div style={{ textAlign: "right" }}>
                   <div style={{ fontSize: "14px", color: "#6b7280", marginBottom: "4px" }}>
                     Tổng số phòng
                   </div>
                   <div style={{ fontSize: "16px", fontWeight: "600", color: "#111827" }}>
                     {selectedBuilding.areas?.reduce((total, area) => total + (area.rooms?.length || 0), 0) || 0}
                   </div>
                 </div>
               </div>
             </div>

                         {/* Areas Section */}
             <div style={{ marginBottom: "20px" }}>
               <label
                 style={{
                   display: "block",
                   fontSize: "14px",
                   fontWeight: "500",
                   color: "#374151",
                   marginBottom: "8px",
                 }}
               >
                 Danh sách khu vực ({selectedBuilding.areas?.length || 0})
               </label>
               <div 
                 style={{ 
                   maxHeight: "200px", 
                   overflowY: "auto",
                   border: "1px solid #e5e7eb",
                   borderRadius: "8px",
                   backgroundColor: "#ffffff"
                 }}
               >
                 {selectedBuilding.areas && selectedBuilding.areas.length > 0 ? (
                   selectedBuilding.areas.map((area, index) => (
                     <div
                       key={area.areaId}
                       style={{
                         padding: "12px 16px",
                         borderBottom: index < selectedBuilding.areas!.length - 1 ? "1px solid #f3f4f6" : "none",
                         fontSize: "14px",
                         color: "#374151",
                         display: "flex",
                         justifyContent: "space-between",
                         alignItems: "center",
                       }}
                     >
                       <div style={{ flex: 1 }}>
                         <div style={{ fontWeight: "500", color: "#111827", marginBottom: "4px" }}>
                           {area.areaName}
                         </div>
                         <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "2px" }}>
                           {area.description}
                         </div>
                         <div style={{ fontSize: "11px", color: "#9ca3af" }}>
                           ID: {area.areaId}
                         </div>
                         {area.rooms && area.rooms.length > 0 && (
                           <div style={{ fontSize: "11px", color: "#9ca3af", marginTop: "2px" }}>
                             Số phòng: {area.rooms.length}
                           </div>
                         )}
                       </div>
                       <span
                         style={{
                           padding: "2px 8px",
                           fontSize: "10px",
                           fontWeight: "500",
                           borderRadius: "4px",
                           backgroundColor: area.status === "Hoạt động" ? "#dcfce7" : "#fed7d7",
                           color: area.status === "Hoạt động" ? "#166534" : "#9b2c2c",
                         }}
                       >
                         {area.status}
                       </span>
                     </div>
                   ))
                 ) : (
                   <div
                     style={{
                       padding: "24px",
                       textAlign: "center",
                       color: "#6b7280",
                       fontStyle: "italic",
                     }}
                   >
                     <div style={{ marginBottom: "8px", fontSize: "14px" }}>
                       Chưa có khu vực nào
                     </div>
                     <div style={{ fontSize: "12px" }}>
                       Tòa này chưa có khu vực nào được gán
                     </div>
                   </div>
                 )}
               </div>
             </div>

                         <div style={{ marginBottom: "24px" }}>
               <label
                 style={{
                   display: "block",
                   fontSize: "14px",
                   fontWeight: "500",
                   color: "#374151",
                   marginBottom: "8px",
                 }}
               >
                 Mô tả
               </label>
               <div
                 style={{
                   padding: "12px 16px",
                   backgroundColor: "#f9fafb",
                   borderRadius: "8px",
                   fontSize: "14px",
                   color: "#111827",
                 }}
               >
                 {selectedBuilding.description}
               </div>
             </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={handleCloseViewModal}
                style={{
                  padding: "12px 24px",
                  backgroundColor: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                }}
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

export default Buildings;
