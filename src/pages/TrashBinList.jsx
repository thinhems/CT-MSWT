import React, { useState } from 'react';
import { HiOutlineSearch, HiOutlinePlus } from "react-icons/hi";
import Pagination from "../components/Pagination";
import TrashBinTable from "../components/TrashBinTable";
import { useTrashBins, useTrashBinDetail } from "../hooks/useTrashBins";
import { useAreas } from "../hooks/useArea";
import { useRooms } from "../hooks/useRoom";
import { BASE_API_URL, API_URLS } from "../constants/api-urls";


const TrashBinList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [statusFilter, setStatusFilter] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all", "active", "full", "maintenance"
  const [showDetailPopup, setShowDetailPopup] = useState(false);
  const [selectedBin, setSelectedBin] = useState(null);
  const [selectedBinId, setSelectedBinId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBin, setEditingBin] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTrashBin, setNewTrashBin] = useState({
    areaId: "",
    location: "",
    roomId: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    isVisible: false,
    type: "success",
    message: "",
  });

  // Use API data instead of static data
  const { trashBins, isLoading, error, updateAsync, createAsync, mutate } = useTrashBins();
  const { areas } = useAreas();
  const { rooms } = useRooms();
  
  // Get detailed data for selected trash bin
  const { trashBinDetail, isLoadingDetail, errorDetail } = useTrashBinDetail(selectedBinId);

  console.log('🔍 TrashBinList - API data:', { trashBins, isLoading, error });
  console.log('🏢 Areas data:', areas);
  console.log('🚪 Rooms data:', rooms);
  console.log('📋 Selected Bin Detail:', { selectedBinId, trashBinDetail, isLoadingDetail, errorDetail });

  // Add spinner CSS
  const spinnerStyle = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;

  // Add spinner CSS to head if not exists
  React.useEffect(() => {
    const styleId = 'spinner-animation';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = spinnerStyle;
      document.head.appendChild(style);
    }
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Hoạt động':
        return 'bg-green-100 text-green-800';
      
      case 'Bảo trì':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter trash bins based on active tab and search term
  const filteredTrashBins = trashBins.filter(bin => {
    // Tab filtering
    let tabFilter;
    if (activeTab === "all") {
      tabFilter = true;
    } else if (activeTab === "active") {
      const status = bin.status?.toLowerCase() || '';
      tabFilter = status === "hoạt động" || status === "danghoatdong" || status === "hoatdong";
    } else if (activeTab === "maintenance") {
      const status = bin.status?.toLowerCase() || '';
      tabFilter = status === "bảo trì" || status === "dangbaotri" || status === "baotri";
    }
    
    if (!tabFilter) return false;
    
    // Search filtering - adapt to API data structure
    const matchesSearch = !searchTerm || 
      bin.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bin.trashBinId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bin.area?.areaName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bin.areaId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bin.roomId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter (keep this for backward compatibility)
    const matchesStatus = statusFilter === "" || bin.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredTrashBins.length / itemsPerPage);
  const currentTrashBins = filteredTrashBins.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleActionClick = ({ action, trashBin }) => {
    console.log('🚀 TrashBinList handleActionClick called:', { action, binId: trashBin.trashBinId || trashBin.id });
    
    switch (action) {
      case 'view':
        console.log('🔍 Opening detail for trash bin:', trashBin.trashBinId || trashBin.id);
        setSelectedBin(trashBin); // Keep for fallback
        setSelectedBinId(trashBin.trashBinId || trashBin.id); // Trigger API call
        setShowDetailPopup(true);
        console.log('✅ Detail popup state set to true');
        break;
      case 'edit':
        console.log('✏️ Opening edit for trash bin:', trashBin.trashBinId || trashBin.id);
        setEditingBin({ ...trashBin });
        setShowEditModal(true);
        console.log('✅ Edit modal state set to true');
        break;
      default:
        console.warn('⚠️ Unknown action:', action);
        break;
    }
  };

  const handleSaveStatus = async () => {
    if (editingBin) {
      try {
        const trashBinId = editingBin.trashBinId || editingBin.id;
        
        console.log('🔄 Updating trash bin status:', {
          trashBinId,
          newStatus: editingBin.status
        });

        // Try PATCH method first, then fallback to PUT
        let response;
        try {
          response = await fetch(`${BASE_API_URL}/${API_URLS.TRASHBIN.UPDATE(trashBinId)}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: editingBin.status
            }),
          });
        } catch (error) {
          console.log('PATCH failed, trying PUT...');
          response = await fetch(`${BASE_API_URL}/${API_URLS.TRASHBIN.UPDATE(trashBinId)}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              status: editingBin.status
            }),
          });
        }

        console.log('📡 API Response:', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API Error Response:', errorText);
          
          // Try toggle-status endpoint as fallback
          console.log('🔄 Trying toggle-status endpoint as fallback...');
          const toggleResponse = await fetch(`${BASE_API_URL}/${API_URLS.TRASHBIN.TOGGLE_STATUS(trashBinId)}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (!toggleResponse.ok) {
            const toggleErrorText = await toggleResponse.text();
            console.error('❌ Toggle API Error Response:', toggleErrorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
          }
          
          console.log('✅ Toggle-status API worked as fallback');
        }

        console.log('✅ Trash bin status updated successfully');

        // Refresh the trash bins data using SWR mutate
        await mutate();

        showNotificationMessage("success", "✅ Đã cập nhật trạng thái thùng rác thành công!");
        setShowEditModal(false);
        setEditingBin(null);
      } catch (error) {
        console.error('❌ Error updating trash bin status:', error);
        showNotificationMessage("error", "❌ Có lỗi xảy ra khi cập nhật trạng thái thùng rác!");
      }
    }
  };

  const showNotificationMessage = (type, message) => {
    setNotification({
      isVisible: true,
      type,
      message,
    });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTrashBin(prev => ({
      ...prev,
      [name]: value
    }));
  };









  const handleSubmitTrashBin = async (e) => {
    e.preventDefault();
    
    // Backend sẽ xử lý validation

    setIsSubmitting(true);
    
    try {
      const createData = {
        areaId: newTrashBin.areaId || null,
        location: newTrashBin.location?.trim() || "",
        roomId: newTrashBin.roomId || ""
      };

      console.log('🔄 Creating trash bin:', createData);
      const response = await createAsync(createData);
      console.log('✅ Trash bin created successfully:', response);

      // Reset form
      setNewTrashBin({
        areaId: "",
        location: "",
        roomId: ""
      });
      setShowAddModal(false);
      showNotificationMessage("success", "🎉 Đã thêm thùng rác thành công!");
      
    } catch (error) {
      console.error('❌ Error creating trash bin:', error);
      showNotificationMessage("error", error.message || "Có lỗi xảy ra khi thêm thùng rác!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewTrashBin({
      areaId: "",
      location: "",
      roomId: ""
    });
  };

  const getStatusBadge = (status) => {
    let badgeStyle = {
      padding: "4px 12px",
      borderRadius: "16px",
      fontSize: "12px",
      fontWeight: "500",
    };

    const statusLower = status?.toLowerCase() || '';
    
    switch (statusLower) {
      case "danghoatdong":
      case "hoatdong":
        return (
          <span style={{ ...badgeStyle, backgroundColor: "#dcfce7", color: "#166534" }}>
            Đang hoạt động
          </span>
        );
      case "dangbaotri":
      case "baotri":
        return (
          <span style={{ ...badgeStyle, backgroundColor: "#fef3c7", color: "#d97706" }}>
            Đang bảo trì
          </span>
        );
      case "dahong":
      case "hong":
        return (
          <span style={{ ...badgeStyle, backgroundColor: "#fee2e2", color: "#dc2626" }}>
            Đã hỏng
          </span>
        );
      default:
        return <span style={badgeStyle}>{status || "Không xác định"}</span>;
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div style={{ 
        backgroundColor: "#ffffff", 
        height: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center" 
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ 
            width: "40px", 
            height: "40px", 
            border: "4px solid #f3f4f6", 
            borderTop: "4px solid #FF5B27", 
            borderRadius: "50%", 
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px"
          }}></div>
          <p style={{ color: "#6b7280" }}>Đang tải danh sách thùng rác...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={{ 
        backgroundColor: "#ffffff", 
        height: "100vh", 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center" 
      }}>
        <div style={{ textAlign: "center", color: "#dc2626" }}>
          <p style={{ fontSize: "18px", marginBottom: "8px" }}>❌ Lỗi tải dữ liệu</p>
          <p style={{ color: "#6b7280" }}>Không thể tải danh sách thùng rác. Vui lòng thử lại.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#ffffff", height: "100vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
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
              Danh sách thùng rác
            </h1>
            <span>Trang chủ</span>
            <span style={{ margin: "0 8px" }}>›</span>
            <span style={{ color: "#374151", fontWeight: "500" }}>
              Danh sách thùng rác
            </span>
          </nav>
        </div>

        {/* Tabs
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
                borderBottom: activeTab === "all" ? "2px solid #FF5B27" : "2px solid transparent",
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
              Tất cả thùng rác
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
                borderBottom: activeTab === "active" ? "2px solid #FF5B27" : "2px solid transparent",
                color: activeTab === "active" ? "#FF5B27" : "#6b7280",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== "active") {
                  e.target.style.color = "#374151";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "active") {
                  e.target.style.color = "#6b7280";
                }
              }}
            >
              Đang hoạt động
            </button>
            <button
              onClick={() => {
                setActiveTab("full");
                setCurrentPage(1);
              }}
              style={{
                padding: "12px 24px",
                border: "none",
                backgroundColor: "transparent",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
                borderBottom: activeTab === "full" ? "2px solid #FF5B27" : "2px solid transparent",
                color: activeTab === "full" ? "#FF5B27" : "#6b7280",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== "full") {
                  e.target.style.color = "#374151";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "full") {
                  e.target.style.color = "#6b7280";
                }
              }}
            >
              Thùng đầy
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
                borderBottom: activeTab === "maintenance" ? "2px solid #FF5B27" : "2px solid transparent",
                color: activeTab === "maintenance" ? "#FF5B27" : "#6b7280",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (activeTab !== "maintenance") {
                  e.target.style.color = "#374151";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== "maintenance") {
                  e.target.style.color = "#6b7280";
                }
              }}
            >
              Đang bảo trì
            </button>
          </div>
        </div> */}

        {/* Search and Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "12px",
          }}
        >
          {/* Search Box */}
          <div style={{ position: "relative", flex: "1", maxWidth: "400px" }}>
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
              placeholder="Tìm kiếm theo vị trí, ID thùng rác, khu vực..."
              value={searchTerm}
              onChange={handleSearchChange}
              style={{
                width: "100%",
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

          {/* Filters and Add Button */}
          <div style={{ display: "flex", gap: "12px", marginLeft: "24px", alignItems: "center" }}>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "8px 12px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                fontSize: "14px",
                outline: "none",
                backgroundColor: "white"
              }}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="DangHoatDong">Đang hoạt động</option>
              <option value="DangBaoTri">Đang bảo trì</option>
            </select>

            <button
              onClick={() => setShowAddModal(true)}
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
              onMouseEnter={(e) => (e.target.style.backgroundColor = "#E04B1F")}
              onMouseLeave={(e) => (e.target.style.backgroundColor = "#FF5B27")}
            >
              <HiOutlinePlus style={{ width: "16px", height: "16px" }} />
              Thêm thùng rác
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div style={{ flex: "0 0 auto" }}>
        <TrashBinTable 
          trashBins={currentTrashBins}
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

      {/* Detail Popup */}
      {showDetailPopup && (
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
          onClick={() => setShowDetailPopup(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#111827", margin: 0 }}>
                Chi tiết thùng rác
              </h2>
              <button
                onClick={() => {
                  setShowDetailPopup(false);
                  setSelectedBinId(null);
                  setSelectedBin(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  color: "#6b7280",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                ×
              </button>
            </div>

            {/* Loading State */}
            {isLoadingDetail && (
              <div style={{ 
                display: "flex", 
                justifyContent: "center", 
                alignItems: "center", 
                padding: "40px",
                flexDirection: "column",
                gap: "16px" 
              }}>
                <div style={{ 
                  width: "40px", 
                  height: "40px", 
                  border: "4px solid #f3f4f6", 
                  borderTop: "4px solid #FF5B27", 
                  borderRadius: "50%", 
                  animation: "spin 1s linear infinite" 
                }}></div>
                <p style={{ color: "#6b7280", margin: 0 }}>Đang tải chi tiết thùng rác...</p>
              </div>
            )}

            {/* Error State */}
            {errorDetail && !isLoadingDetail && (
              <div style={{ 
                textAlign: "center", 
                padding: "40px",
                color: "#dc2626" 
              }}>
                <p style={{ fontSize: "18px", marginBottom: "8px" }}>❌ Lỗi tải chi tiết</p>
                <p style={{ color: "#6b7280" }}>Không thể tải thông tin chi tiết. Sử dụng dữ liệu cơ bản.</p>
              </div>
            )}

            {/* Content */}
            {!isLoadingDetail && (
              <div style={{ display: "grid", gap: "16px" }}>
                {(() => {
                  // Use API data if available, fallback to list data
                  const displayData = trashBinDetail || selectedBin;
                  if (!displayData) return null;

                  return (
                    <>
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                        {displayData.image && displayData.image !== "string" ? (
                          <img
                            src={displayData.image.startsWith('data:') 
                              ? displayData.image 
                              : `data:image/jpeg;base64,${displayData.image}`
                            }
                            alt="Trash bin"
                            style={{
                              width: "200px",
                              height: "200px",
                              objectFit: "cover",
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                            }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div 
                          style={{ 
                            display: (displayData.image && displayData.image !== "string") ? 'none' : 'flex',
                            width: "200px",
                            height: "200px", 
                            backgroundColor: '#f3f4f6',
                            borderRadius: '8px',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            color: '#9ca3af',
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          Không có hình ảnh
                        </div>
                      </div>

                      {/* Detail Information */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "12px", alignItems: "center" }}>
                        <strong style={{ color: "#374151" }}>Trash Bin ID:</strong>
                        <span style={{ color: "#6b7280", fontFamily: "monospace" }}>{displayData.trashBinId || displayData.id}</span>

                        <strong style={{ color: "#374151" }}>Vị trí:</strong>
                        <span style={{ color: "#6b7280" }}>{displayData.location || "Chưa có vị trí"}</span>

                       
                        <strong style={{ color: "#374151" }}>Khu vực:</strong>
                        <span style={{ color: "#6b7280" }}>
                          {(() => {
                            if (!displayData.areaId || displayData.areaId === "string") {
                              return "Không có khu vực";
                            }
                            const area = areas?.find(a => a.areaId === displayData.areaId);
                            return area?.areaName || `Area: ${displayData.areaId.slice(-8)}`;
                          })()}
                        </span>

                        

                        {displayData.roomId && displayData.roomId !== "string" && (
                          <>
                            <strong style={{ color: "#374151" }}>Phòng:</strong>
                            <span style={{ color: "#6b7280" }}>
                              {(() => {
                                const linkedRoom = rooms?.find(r => r.roomId === displayData.roomId);
                                return linkedRoom 
                                  ? `${linkedRoom.roomNumber} - ${linkedRoom.roomType}`
                                  : displayData.roomId;
                              })()}
                            </span>
                          </>
                        )}

                        {displayData.image && displayData.image !== "string" && (
                          <>
                            <strong style={{ color: "#374151" }}>Hình ảnh:</strong>
                            <span style={{ color: "#6b7280" }}>Có sẵn</span>
                          </>
                        )}

                        <strong style={{ color: "#374151" }}>Trạng thái:</strong>
                        <div>
                          {getStatusBadge(displayData.status)}
                        </div>

                      
                       
                        
                        {!trashBinDetail && selectedBin && (
                          <>
                            <strong style={{ color: "#374151" }}>Nguồn dữ liệu:</strong>
                            <span style={{ color: "#f59e0b", fontSize: "12px", fontWeight: "500" }}>
                              📋 Cache (Dữ liệu cơ bản)
                            </span>
                          </>
                        )}
                      </div>
                    </>
                  );
                })()}
              </div>
            )}



            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px", gap: "12px" }}>
              <button
                onClick={() => {
                  setShowDetailPopup(false);
                  setSelectedBinId(null);
                  setSelectedBin(null);
                }}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  backgroundColor: "white",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#f9fafb"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "white"}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {showEditModal && editingBin && (
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
          onClick={() => setShowEditModal(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "400px",
              width: "90%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "600", color: "#111827", margin: 0 }}>
                Sửa trạng thái thùng rác
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  color: "#6b7280",
                  cursor: "pointer",
                  padding: "4px",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <div style={{ marginBottom: "12px" }}>
                <strong style={{ color: "#374151", display: "block", marginBottom: "4px" }}>
                  Thùng rác #{editingBin.trashBinId?.slice(-8) || "N/A"}
                </strong>
                <span style={{ color: "#6b7280", fontSize: "14px" }}>
                  📍 {editingBin.location || "Chưa có vị trí"}
                </span>
                <br />
                <span style={{ color: "#6b7280", fontSize: "14px" }}>
                  🏢 {editingBin.area?.areaName || "Khu vực chưa xác định"}
                </span>
              </div>

              <div>
                <label style={{ color: "#374151", fontWeight: "500", display: "block", marginBottom: "8px" }}>
                  Trạng thái hiện tại:
                </label>
                <div style={{
                  padding: "12px 16px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "6px",
                  border: "1px solid #e5e7eb",
                  marginBottom: "12px"
                }}>
                  <span style={{
                    display: "inline-flex",
                    padding: "4px 12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    borderRadius: "9999px",
                    backgroundColor: editingBin.status === "DangHoatDong" ? "#dcfce7" : "#fef3c7",
                    color: editingBin.status === "DangHoatDong" ? "#15803d" : "#d97706"
                  }}>
                    {editingBin.status === "DangHoatDong" ? "Đang hoạt động" : "Ngưng hoạt động"}
                  </span>
                </div>
                <div style={{
                  padding: "16px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  marginTop: "12px"
                }}>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "16px",
                    padding: "12px 16px",
                    backgroundColor: "white",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#374151"
                      }}>
                        Chuyển đổi trạng thái:
                      </span>
                      
                    </div>
                    <label style={{
                      position: "relative",
                      display: "inline-block",
                      width: "56px",
                      height: "28px",
                      cursor: "pointer",
                      borderRadius: "28px",
                      backgroundColor: editingBin.status === "DangHoatDong" ? "#10b981" : "#d1d5db",
                      transition: "background-color 0.3s ease",
                      boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)"
                    }}>
                      <input
                        type="checkbox"
                        checked={editingBin.status === "DangHoatDong"}
                        onChange={(e) => {
                          const newStatus = e.target.checked ? "DangHoatDong" : "DangBaoTri";
                          setEditingBin({ ...editingBin, status: newStatus });
                        }}
                        style={{
                          opacity: 0,
                          width: 0,
                          height: 0,
                          position: "absolute"
                        }}
                      />
                      <span style={{
                        position: "absolute",
                        top: "2px",
                        left: editingBin.status === "DangHoatDong" ? "30px" : "2px",
                        width: "24px",
                        height: "24px",
                        backgroundColor: "white",
                        borderRadius: "50%",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}>
                        {editingBin.status === "DangHoatDong" ? (
                          <span style={{ fontSize: "10px", color: "#10b981" }}>✓</span>
                        ) : (
                          <span style={{ fontSize: "10px", color: "#9ca3af" }}>✕</span>
                        )}
                      </span>
                    </label>
                  </div>
                  <div style={{
                    fontSize: "13px",
                    color: "#6b7280",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    backgroundColor: "white",
                    borderRadius: "6px",
                    border: "1px solid #e5e7eb"
                  }}>
                    <span style={{
                      color: editingBin.status === "DangHoatDong" ? "#10b981" : "#d97706",
                      fontWeight: "500"
                    }}>
                      {editingBin.status === "DangHoatDong" ? "🟢 Đang hoạt động" : "🟡 Ngưng hoạt động"}
                    </span>
                    
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  padding: "10px 20px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  backgroundColor: "white",
                  color: "#374151",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#f9fafb"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "white"}
              >
                Hủy
              </button>
              <button
                onClick={handleSaveStatus}
                style={{
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor: "#FF5B27",
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#E04B1F"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "#FF5B27"}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Trash Bin Modal */}
      {showAddModal && (
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
          onClick={handleCloseAddModal}
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
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: "24px", fontWeight: "600", color: "#111827", margin: 0 }}>
                🗑️ Thêm thùng rác mới
              </h2>
              <button
                onClick={handleCloseAddModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  color: "#6b7280",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = "#f3f4f6"}
                onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmitTrashBin}>
              {/* Area Selection */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Khu vực (tùy chọn)
                </label>
                <select
                  name="areaId"
                  value={newTrashBin.areaId}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    backgroundColor: "white",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                >
                  <option value="">Không chọn khu vực</option>
                  {areas?.map((area) => (
                    <option key={area.areaId} value={area.areaId}>
                      {area.areaName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location */}
              <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
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
                  value={newTrashBin.location}
                  onChange={handleInputChange}
                  placeholder="VD: Tầng 1 phòng 111"
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                />
              </div>

              {/* Image Upload - Hidden */}
              {/* <div style={{ marginBottom: "20px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#374151",
                  }}
                >
                  Hình ảnh thùng rác (tùy chọn)
                </label>
                
                <div style={{
                  border: "2px dashed #d1d5db",
                  borderRadius: "8px",
                  padding: "20px",
                  textAlign: "center",
                  backgroundColor: "#fafafa",
                  transition: "all 0.2s",
                  cursor: "pointer",
                }}
                onClick={() => document.getElementById('imageInput').click()}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.backgroundColor = "#f0f9ff";
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = "#d1d5db";
                  e.target.style.backgroundColor = "#fafafa";
                }}
                >
                  <input
                    id="imageInput"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  
                  {!imagePreview ? (
                    <div>
                      <div style={{ fontSize: "48px", marginBottom: "8px" }}>📷</div>
                      <p style={{ margin: "0 0 4px 0", color: "#374151", fontWeight: "500" }}>
                        Nhấn để chọn hình ảnh
                      </p>
                      <p style={{ margin: "0", color: "#6b7280", fontSize: "12px" }}>
                        Hỗ trợ: JPG, PNG, GIF, WEBP (tối đa 5MB)
                      </p>
                    </div>
                  ) : (
                    <div style={{ position: "relative" }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          maxWidth: "100%",
                          maxHeight: "200px",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSelectedFile();
                        }}
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          backgroundColor: "#dc2626",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "24px",
                          height: "24px",
                          fontSize: "12px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ×
                      </button>
                      <p style={{ margin: "8px 0 0 0", color: "#374151", fontSize: "12px" }}>
                        📁 {selectedFile?.name} ({(selectedFile?.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}
                </div>
              </div> */}

              {/* Room Selection */}
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
                  Phòng liên kết (tùy chọn)
                </label>
                <select
                  name="roomId"
                  value={newTrashBin.roomId}
                  onChange={handleInputChange}
                  disabled={!rooms || rooms.length === 0}
                  style={{
                    width: "100%",
                    padding: "12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    outline: "none",
                    backgroundColor: "white",
                    opacity: (!rooms || rooms.length === 0) ? 0.6 : 1,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                  onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
                >
                  <option value="">
                    {!rooms ? "Đang tải phòng..." : "Không liên kết với phòng"}
                  </option>
                                     {rooms
                     ?.filter(room => room.roomType === "Nhà vệ sinh")
                     ?.map((room) => {
                       const area = areas?.find(a => a.areaId === room.areaId);
                       return (
                         <option key={room.roomId} value={room.roomId}>
                           {room.roomNumber} - {room.roomType}
                           {area && ` (Khu vực: ${area.areaName})`}
                         </option>
                       );
                     })}
                </select>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={handleCloseAddModal}
                  style={{
                    padding: "12px 20px",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    backgroundColor: "white",
                    color: "#374151",
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#f9fafb")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "white")}
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
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.target.style.backgroundColor = "#E04B1F";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.target.style.backgroundColor = "#FF5B27";
                    }
                  }}
                >
                  {isSubmitting ? "Đang thêm..." : "Thêm thùng rác"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification.isVisible && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            padding: "12px 16px",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            zIndex: 1100,
            fontSize: "14px",
            fontWeight: "500",
            backgroundColor: 
              notification.type === "success" ? "#dcfce7" : 
              notification.type === "warning" ? "#fef3c7" : "#fee2e2",
            color: 
              notification.type === "success" ? "#166534" : 
              notification.type === "warning" ? "#d97706" : "#dc2626",
            border: `1px solid ${
              notification.type === "success" ? "#bbf7d0" : 
              notification.type === "warning" ? "#fed7aa" : "#fecaca"
            }`,
          }}
        >
          {notification.message}
        </div>
      )}
    </div>
  );
};

export default TrashBinList; 