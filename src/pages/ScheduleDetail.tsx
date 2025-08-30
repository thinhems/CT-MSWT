import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiOutlineArrowLeft, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi";
import { useSchedules } from "../hooks/useSchedule";
import { useShifts } from "../hooks/useShifts";
import { useRooms } from "../hooks/useRoom";
import { useTrashBins } from "../hooks/useTrashBins";
import { useUsers } from "../hooks/useUsers";
import { Schedule } from "@/config/models/schedule.model";
import Notification from "../components/Notification";

const ScheduleDetail = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [notification, setNotification] = useState({
    isVisible: false,
    type: "",
    message: "",
  });

  const { schedules, updateSchedule, deleteSchedule } = useSchedules();
  const { shifts } = useShifts();
  const { rooms } = useRooms();
  const { trashBins } = useTrashBins();
  const { users } = useUsers();

  // Form state for editing
  const [editForm, setEditForm] = useState({
    scheduleName: "",
    startDate: "",
    endDate: "",
    scheduleType: "Hằng ngày",
    shiftId: "",
  });

  useEffect(() => {
    if (scheduleId && schedules.length > 0) {
      const foundSchedule = schedules.find(s => s.scheduleId === scheduleId);
      if (foundSchedule) {
        setSchedule(foundSchedule);
        setEditForm({
          scheduleName: foundSchedule.scheduleName || "",
          startDate: foundSchedule.startDate || "",
          endDate: foundSchedule.endDate || "",
          scheduleType: foundSchedule.scheduleType || "Hằng ngày",
          shiftId: foundSchedule.shiftId || "",
        });
      } else {
        setError("Không tìm thấy lịch trình");
      }
      setIsLoading(false);
    }
  }, [scheduleId, schedules]);

  const showNotification = (type: string, message: string) => {
    setNotification({
      isVisible: true,
      type,
      message,
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schedule) return;

    try {
      await updateSchedule(schedule.scheduleId, editForm);
      showNotification("success", "Cập nhật lịch trình thành công!");
      setShowEditModal(false);
      // Refresh the schedule data
      const updatedSchedule = schedules.find(s => s.scheduleId === scheduleId);
      if (updatedSchedule) {
        setSchedule(updatedSchedule);
      }
    } catch (error) {
      showNotification("error", "Có lỗi xảy ra khi cập nhật lịch trình!");
    }
  };

  const handleDelete = async () => {
    if (!schedule) return;

    try {
      await deleteSchedule(schedule.scheduleId);
      showNotification("success", "Xóa lịch trình thành công!");
      navigate("/schedules");
    } catch (error) {
      showNotification("error", "Có lỗi xảy ra khi xóa lịch trình!");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getScheduleTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case "cleaning":
      case "hằng ngày":
      case "daily":
        return { backgroundColor: "#dcfce7", color: "#15803d" };
      case "maintenance":
      case "đột xuất":
      case "emergency":
        return { backgroundColor: "#fef3c7", color: "#d97706" };
      default:
        return { backgroundColor: "#f3f4f6", color: "#374151" };
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
      }}>
        <div>Đang tải...</div>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        gap: "16px"
      }}>
        <div style={{ color: "#dc2626" }}>⚠️ {error || "Không tìm thấy lịch trình"}</div>
        <button
          onClick={() => navigate("/schedules")}
          style={{
            padding: "8px 16px",
            backgroundColor: "#FF5B27",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh", padding: "16px" }}>
      {/* Notification */}
      {notification.isVisible && (
        <Notification
          message={notification.message}
          type={notification.type}
          isVisible={notification.isVisible}
          onClose={hideNotification}
        />
      )}

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ marginBottom: "16px" }}>
          <nav style={{ color: "#6b7280", fontSize: "14px" }}>
            <span>Trang chủ</span>
            <span style={{ margin: "0 8px" }}>›</span>
            <span>Quản lý lịch trình</span>
            <span style={{ margin: "0 8px" }}>›</span>
            <span style={{ color: "#374151", fontWeight: "500" }}>
              Chi tiết lịch trình
            </span>
          </nav>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{
            fontSize: "24px",
            fontWeight: "bold",
            color: "#111827",
            margin: 0
          }}>
            Chi tiết lịch trình
          </h1>

          <div style={{ display: "flex", gap: "12px" }}>
            <button
              onClick={() => navigate("/schedules")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                backgroundColor: "white",
                color: "#374151",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              <HiOutlineArrowLeft style={{ width: "16px", height: "16px" }} />
              Quay lại
            </button>

            <button
              onClick={handleEdit}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                border: "1px solid #FF5B27",
                borderRadius: "6px",
                backgroundColor: "white",
                color: "#FF5B27",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              <HiOutlinePencil style={{ width: "16px", height: "16px" }} />
              Sửa
            </button>



            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                border: "1px solid #dc2626",
                borderRadius: "6px",
                backgroundColor: "white",
                color: "#dc2626",
                cursor: "pointer",
                fontSize: "14px"
              }}
            >
              <HiOutlineTrash style={{ width: "16px", height: "16px" }} />
              Xóa
            </button>
          </div>
        </div>
      </div>

      {/* Schedule Information */}
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        padding: "24px",
        marginBottom: "24px"
      }}>
        <h2 style={{
          fontSize: "18px",
          fontWeight: "600",
          color: "#111827",
          marginBottom: "20px",
          borderBottom: "1px solid #e5e7eb",
          paddingBottom: "12px"
        }}>
          Thông tin lịch trình
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
          <div>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#6b7280",
              marginBottom: "8px"
            }}>
              Tên lịch trình
            </label>
            <div style={{
              fontSize: "16px",
              color: "#111827",
              fontWeight: "500"
            }}>
              {schedule.scheduleName || "Chưa có tên"}
            </div>
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#6b7280",
              marginBottom: "8px"
            }}>
              Loại lịch trình
            </label>
            <span style={{
              display: "inline-flex",
              padding: "4px 12px",
              fontSize: "12px",
              fontWeight: "600",
              borderRadius: "9999px",
              backgroundColor: getScheduleTypeColor(schedule.scheduleType).backgroundColor,
              color: getScheduleTypeColor(schedule.scheduleType).color,
            }}>
              {schedule.scheduleType}
            </span>
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#6b7280",
              marginBottom: "8px"
            }}>
              Ngày bắt đầu
            </label>
            <div style={{
              fontSize: "16px",
              color: "#111827",
              fontWeight: "500"
            }}>
              {formatDate(schedule.startDate)}
            </div>
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#6b7280",
              marginBottom: "8px"
            }}>
              Ngày kết thúc
            </label>
            <div style={{
              fontSize: "16px",
              color: "#111827",
              fontWeight: "500"
            }}>
              {formatDate(schedule.endDate)}
            </div>
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#6b7280",
              marginBottom: "8px"
            }}>
              Ca làm việc
            </label>
            <div style={{
              fontSize: "16px",
              color: "#111827",
              fontWeight: "500"
            }}>
              {schedule.shiftName || `Shift ${schedule.shiftId?.slice(0, 8)}`}
            </div>
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: "14px",
              fontWeight: "500",
              color: "#6b7280",
              marginBottom: "8px"
            }}>
              ID lịch trình
            </label>
            <div style={{
              fontSize: "14px",
              color: "#6b7280",
              fontFamily: "monospace"
            }}>
              {schedule.scheduleId}
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information */}
      {schedule.areaName && (
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "24px",
          marginBottom: "24px"
        }}>
          <h2 style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#111827",
            marginBottom: "20px",
            borderBottom: "1px solid #e5e7eb",
            paddingBottom: "12px"
          }}>
            Thông tin khu vực
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            {schedule.areaName && (
              <div>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#6b7280",
                  marginBottom: "8px"
                }}>
                  Khu vực
                </label>
                <div style={{
                  fontSize: "16px",
                  color: "#111827",
                  fontWeight: "500"
                }}>
                  {schedule.areaName}
                </div>
              </div>
            )}

            {schedule.roomName && (
              <div>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#6b7280",
                  marginBottom: "8px"
                }}>
                  Phòng
                </label>
                <div style={{
                  fontSize: "16px",
                  color: "#111827",
                  fontWeight: "500"
                }}>
                  {schedule.roomName}
                </div>
              </div>
            )}

            {schedule.assignmentName && (
              <div>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#6b7280",
                  marginBottom: "8px"
                }}>
                  Tên phân công
                </label>
                <div style={{
                  fontSize: "16px",
                  color: "#111827",
                  fontWeight: "500"
                }}>
                  {schedule.assignmentName}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div style={{
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
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "600px",
            width: "90%",
            maxHeight: "80vh",
            overflow: "auto",
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "16px"
            }}>
              <h2 style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#111827",
                margin: 0
              }}>
                Sửa lịch trình
              </h2>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  color: "#6b7280",
                  background: "transparent",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                }}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                    Tên lịch trình *
                  </label>
                  <input
                    type="text"
                    value={editForm.scheduleName}
                    onChange={(e) => setEditForm(prev => ({ ...prev, scheduleName: e.target.value }))}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                    Loại lịch trình *
                  </label>
                  <select
                    value={editForm.scheduleType}
                    onChange={(e) => setEditForm(prev => ({ ...prev, scheduleType: e.target.value }))}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="Hằng ngày">Hằng ngày</option>
                    <option value="Đột xuất">Đột xuất</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                    Ca làm việc *
                  </label>
                  <select
                    value={editForm.shiftId}
                    onChange={(e) => setEditForm(prev => ({ ...prev, shiftId: e.target.value }))}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  >
                    <option value="">-- Chọn ca làm việc --</option>
                    {shifts && shifts.length > 0 ? (
                      shifts.map((shift) => (
                        <option key={shift.shiftId} value={shift.shiftId}>
                          {shift.shiftName}
                        </option>
                      ))
                    ) : (
                      <option disabled>Không có dữ liệu ca làm việc</option>
                    )}
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                    Ngày bắt đầu *
                  </label>
                  <input
                    type="date"
                    value={editForm.startDate}
                    onChange={(e) => setEditForm(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "500" }}>
                    Ngày kết thúc *
                  </label>
                  <input
                    type="date"
                    value={editForm.endDate}
                    onChange={(e) => setEditForm(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #d1d5db",
                      borderRadius: "6px",
                      fontSize: "14px",
                    }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    padding: "10px 20px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    color: "#374151",
                    fontSize: "14px",
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor: "#FF5B27",
                    color: "white",
                    fontSize: "14px",
                    cursor: "pointer",
                    fontWeight: "500",
                  }}
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{
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
        }}>
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            maxWidth: "400px",
            width: "90%",
          }}>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#111827",
              marginBottom: "16px"
            }}>
              Xác nhận xóa
            </h3>
            <p style={{
              color: "#6b7280",
              marginBottom: "24px"
            }}>
              Bạn có chắc chắn muốn xóa lịch trình "{schedule.scheduleName}"? Hành động này không thể hoàn tác.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #d1d5db",
                  borderRadius: "6px",
                  backgroundColor: "white",
                  color: "#374151",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor: "#dc2626",
                  color: "white",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleDetail;
