import { IShiftRequest, Shift } from "@/config/models/shift.mode";
import { IActionType } from "@/config/models/types";
import { useShifts } from "@/hooks/useShift";
import { useState } from "react";
import { HiOutlinePlus, HiOutlineSearch, HiX } from "react-icons/hi";
import Notification from "../components/Notification";
import Pagination from "../components/Pagination";
import ShiftTable from "../components/ShiftTable";

const Shifts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddShiftPopup, setShowAddShiftPopup] = useState(false);
  const [showViewShiftModal, setShowViewShiftModal] = useState(false);
  const [showUpdateShiftModal, setShowUpdateShiftModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [sortState, setSortState] = useState<"asc" | "desc" | "default">(
    "default"
  ); // "asc", "desc", or "default"
  const [updateShiftData, setUpdateShiftData] = useState<IShiftRequest>({
    shiftName: "",
    startTime: "",
    endTime: "",
  });
  const [newShift, setNewShift] = useState<IShiftRequest>({
    shiftName: "",
    startTime: "",
    endTime: "",
  });
  const [notification, setNotification] = useState({
    isVisible: false,
    type: "success",
    message: "",
  });

  const itemsPerPage = 5;
  const { shifts, createAsync, updateAsync, deleteAsync } = useShifts();

  const handleActionClick = async ({
    action,
    shift,
  }: {
    action: IActionType;
    shift: Shift;
  }) => {
    if (action === "view") {
      setSelectedShift(shift);
      setShowViewShiftModal(true);
    } else if (action === "update") {
      setSelectedShift(shift);
      setUpdateShiftData({
        shiftName: shift.shiftName,
        startTime: shift.startTime,
        endTime: shift.endTime,
      });
      setShowUpdateShiftModal(true);
    } else if (action === "delete") {
      const confirmed = window.confirm("Bạn có chắc chắn muốn xóa ca làm này?");
      if (confirmed) {
        await deleteAsync(shift.shiftId);
        showNotificationMessage("success", "Đã xóa ca làm thành công!");
      }
    }
  };

  const handleCloseViewModal = () => {
    setShowViewShiftModal(false);
    setSelectedShift(null);
  };

  const handleCloseUpdateModal = () => {
    setShowUpdateShiftModal(false);
    setSelectedShift(null);
    setUpdateShiftData({
      shiftName: "",
      startTime: "",
      endTime: "",
    });
  };

  // Time validation function
  const validateTimeInput = (value: any) => {
    // Remove any non-digit characters except colon
    let cleanValue = value.replace(/[^\d:]/g, "");

    // Limit to HH:MM:SS format
    if (cleanValue.length > 8) {
      cleanValue = cleanValue.substring(0, 8);
    }

    // Auto-add colons after 2 and 5 digits
    if (cleanValue.length === 2 && !cleanValue.includes(":")) {
      cleanValue += ":";
    } else if (cleanValue.length === 5 && cleanValue.split(":").length === 2) {
      cleanValue += ":";
    }

    // Validate the time format
    if (cleanValue.includes(":")) {
      let [hours, minutes, seconds] = cleanValue.split(":");

      // Validate hours (00-23)
      if (hours && parseInt(hours) > 23) {
        hours = "23";
      }

      // Validate minutes (00-59)
      if (minutes && parseInt(minutes) > 59) {
        minutes = "59";
      }

      // Validate seconds (00-59)
      if (seconds && parseInt(seconds) > 59) {
        seconds = "59";
      }

      // Ensure two digits for hours
      if (hours && hours.length === 1) {
        hours = "0" + hours;
      }

      // Ensure two digits for minutes
      if (minutes !== undefined) {
        if (minutes.length === 1) {
          minutes = "0" + minutes;
        } else if (minutes.length === 0) {
          minutes = "00";
        }
      }

      // Ensure two digits for seconds
      if (seconds !== undefined) {
        if (seconds.length === 1) {
          seconds = "0" + seconds;
        } else if (seconds.length === 0) {
          seconds = "00";
        }
      }

      cleanValue = hours + ":" + (minutes || "00") + ":" + (seconds || "00");
    } else if (cleanValue.length === 1 || cleanValue.length === 2) {
      // If only hours are entered, pad with zero if needed
      if (cleanValue.length === 1) {
        cleanValue = "0" + cleanValue;
      }
      cleanValue += ":00:00";
    }

    return cleanValue;
  };

  const handleUpdateChange = (e: any) => {
    const { name, value } = e.target;

    if (name === "startTime" || name === "endTime") {
      const validatedTime = validateTimeInput(value);
      setUpdateShiftData((prev) => ({
        ...prev,
        [name]: validatedTime,
      }));
    } else {
      setUpdateShiftData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmitUpdate = async (e: any) => {
    e.preventDefault();

    // Validate required fields
    if (
      !updateShiftData.shiftName ||
      !updateShiftData.startTime ||
      !updateShiftData.endTime
    ) {
      showNotificationMessage(
        "error",
        "Vui lòng điền đầy đủ thông tin bắt buộc!"
      );
      return;
    }

    // Validate time format (24-hour format with leading zeros)
    const timePattern = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    if (!timePattern.test(updateShiftData.startTime)) {
      showNotificationMessage(
        "error",
        "Thời gian bắt đầu không hợp lệ! Vui lòng nhập theo định dạng HH:MM:SS"
      );
      return;
    }
    if (!timePattern.test(updateShiftData.endTime)) {
      showNotificationMessage(
        "error",
        "Thời gian kết thúc không hợp lệ! Vui lòng nhập theo định dạng HH:MM:SS"
      );
      return;
    }

    // Validate that end time is after start time
    const startTime = updateShiftData.startTime;
    const endTime = updateShiftData.endTime;
    if (startTime >= endTime) {
      showNotificationMessage(
        "error",
        "Thời gian kết thúc phải sau thời gian bắt đầu!"
      );
      return;
    }

    await updateAsync(selectedShift!.shiftId, updateShiftData);
    handleCloseUpdateModal();
    showNotificationMessage("success", "Đã cập nhật ca làm thành công!");
  };

  const handleAddShift = () => {
    setShowAddShiftPopup(true);
  };

  const handleClosePopup = () => {
    setShowAddShiftPopup(false);
    setNewShift({
      shiftName: "",
      startTime: "",
      endTime: "",
    });
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;

    setNewShift((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmitShift = async (e: any) => {
    e.preventDefault();

    // Validate required fields
    if (!newShift.shiftName || !newShift.startTime || !newShift.endTime) {
      showNotificationMessage(
        "error",
        "Vui lòng điền đầy đủ thông tin bắt buộc!"
      );
      return;
    }

    // Validate time format (24-hour format with leading zeros)
    const timePattern = /^([0-1][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/;
    if (!timePattern.test(newShift.startTime)) {
      showNotificationMessage(
        "error",
        "Thời gian bắt đầu không hợp lệ! Vui lòng nhập theo định dạng HH:MM:SS"
      );
      return;
    }
    if (!timePattern.test(newShift.endTime)) {
      showNotificationMessage(
        "error",
        "Thời gian kết thúc không hợp lệ! Vui lòng nhập theo định dạng HH:MM:SS"
      );
      return;
    }

    // Validate that end time is after start time
    const startTime = newShift.startTime;
    const endTime = newShift.endTime;
    if (startTime >= endTime) {
      showNotificationMessage(
        "error",
        "Thời gian kết thúc phải sau thời gian bắt đầu!"
      );
      return;
    }
    await createAsync(newShift);
    handleClosePopup();
    showNotificationMessage("success", "Đã thêm ca làm thành công!");
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

  const filteredShifts = shifts.filter(
    (shift) =>
      shift.shiftName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.startTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shift.endTime.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort filtered shifts based on sort state
  const sortedShifts = [...filteredShifts].sort((a: any, b: any) => {
    if (sortState === "default") {
      // Sort by creation date (newest first)
      return new Date(b.startTime);
    } else if (sortState === "asc") {
      // Sort by shift name A-Z
      return a.shiftName.toLowerCase().localeCompare(b.shiftName.toLowerCase());
    } else if (sortState === "desc") {
      // Sort by shift name Z-A
      return b.shiftName.toLowerCase().localeCompare(a.shiftName.toLowerCase());
    }
    return 0;
  });

  const handleSortClick = () => {
    if (sortState === "default") {
      setSortState("asc");
    } else if (sortState === "asc") {
      setSortState("desc");
    } else {
      setSortState("default");
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(sortedShifts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentShifts = sortedShifts.slice(startIndex, endIndex);

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
              Ca làm
            </h1>
            <span>Trang chủ</span>
            <span style={{ margin: "0 8px" }}>›</span>
            <span style={{ color: "#374151", fontWeight: "500" }}>Ca làm</span>
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
              placeholder="Tìm ca làm"
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
            {/* Add Shift Button */}
            <button
              onClick={handleAddShift}
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
              Thêm ca làm
            </button>
          </div>
        </div>
      </div>

      {/* Shift Table Container */}
      <div style={{ flex: "1", overflow: "auto", minHeight: 0 }}>
        <ShiftTable
          shifts={currentShifts}
          onActionClick={handleActionClick}
          sortState={sortState}
          onSortClick={handleSortClick}
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

      {/* Add Shift Popup */}
      {showAddShiftPopup && (
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
                Thêm ca làm mới
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
            <form onSubmit={handleSubmitShift}>
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
                  Tên ca làm *
                </label>
                <input
                  type="text"
                  name="shiftName"
                  value={newShift.shiftName}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter shift name"
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
                  Thời gian bắt đầu *
                </label>
                <input
                  type="text"
                  name="startTime"
                  value={newShift.startTime}
                  onChange={handleInputChange}
                  required
                  placeholder="HH:MM:SS"
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
                  Thời gian kết thúc *
                </label>
                <input
                  type="text"
                  name="endTime"
                  value={newShift.endTime}
                  onChange={handleInputChange}
                  required
                  placeholder="HH:MM:SS"
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
                  Hủy bỏ
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
                  Tạo ca làm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Shift Modal */}
      {showViewShiftModal && selectedShift && (
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
                Chi tiết ca làm
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

            {/* Shift Info */}
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Shift Details */}
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
                    Tên ca làm
                  </label>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#111827",
                      margin: "4px 0 0 0",
                    }}
                  >
                    {selectedShift.shiftName}
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
                    Thời gian bắt đầu
                  </label>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#111827",
                      margin: "4px 0 0 0",
                    }}
                  >
                    {selectedShift.startTime}
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
                    Thời gian kết thúc
                  </label>
                  <p
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "#111827",
                      margin: "4px 0 0 0",
                    }}
                  >
                    {selectedShift.endTime}
                  </p>
                </div>

                <div style={{ gridColumn: "1 / -1" }}>
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
                          selectedShift.status === "Hoạt động"
                            ? "#dcfce7"
                            : "#fee2e2",
                        color:
                          selectedShift.status === "Hoạt động"
                            ? "#15803d"
                            : "#dc2626",
                      }}
                    >
                      {selectedShift.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "24px",
              }}
            >
              <button
                onClick={handleCloseViewModal}
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
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Update Shift Modal */}
      {showUpdateShiftModal && selectedShift && (
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
                Cập nhật ca làm
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
                  Tên ca làm *
                </label>
                <input
                  type="text"
                  name="shiftName"
                  value={updateShiftData.shiftName}
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
                  Thời gian bắt đầu *
                </label>
                <input
                  type="text"
                  name="startTime"
                  value={updateShiftData.startTime}
                  onChange={handleUpdateChange}
                  required
                  placeholder="HH:MM:SS"
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
                  Thời gian kết thúc *
                </label>
                <input
                  type="text"
                  name="endTime"
                  value={updateShiftData.endTime}
                  onChange={handleUpdateChange}
                  required
                  placeholder="HH:MM:SS"
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
                  Hủy bỏ
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
    </div>
  );
};

export default Shifts;
