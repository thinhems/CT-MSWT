import React, { useState, useEffect } from 'react';
import { createLeave, updateLeave } from '../hooks/useLeave';
import { Leave, CreateLeaveRequest, UpdateLeaveRequest } from '../config/models/leave.model';
import { HiX } from 'react-icons/hi';

interface LeaveFormProps {
  leave?: Leave;
  onClose: () => void;
  onSuccess: () => void;
}

const LeaveForm: React.FC<LeaveFormProps> = ({ leave, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<CreateLeaveRequest>({
    workerId: '',
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: '',
    approvalStatus: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (leave) {
      setFormData({
        workerId: leave.workerId,
        leaveType: leave.leaveType,
        startDate: leave.startDate.split('T')[0],
        endDate: leave.endDate.split('T')[0],
        reason: leave.reason,
        approvalStatus: leave.approvalStatus || ''
      });
    }
  }, [leave]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.workerId.trim()) {
      newErrors.workerId = 'Mã nhân viên là bắt buộc';
    }

    if (!formData.leaveType.trim()) {
      newErrors.leaveType = 'Loại nghỉ phép là bắt buộc';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Ngày bắt đầu là bắt buộc';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc là bắt buộc';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Lý do là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (leave) {
        const updateData: UpdateLeaveRequest = {
          leaveType: formData.leaveType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          reason: formData.reason,
          approvalStatus: formData.approvalStatus
        };
        await updateLeave(leave.leaveId, updateData);
      } else {
        await createLeave(formData);
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting leave:', error);
      alert('Có lỗi xảy ra khi gửi đơn nghỉ phép');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CreateLeaveRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        width: "100%",
        maxWidth: "500px",
        maxHeight: "90vh",
        overflow: "auto",
        margin: "20px"
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "20px 24px",
          borderBottom: "1px solid #e5e7eb"
        }}>
          <h2 style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#111827",
            margin: 0
          }}>
            {leave ? 'Chỉnh sửa đơn nghỉ phép' : 'Tạo đơn nghỉ phép mới'}
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#6b7280",
              padding: "4px",
              borderRadius: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <HiX size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Worker ID */}
            <div>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "6px"
              }}>
                Mã nhân viên
              </label>
              <input
                type="text"
                value={formData.workerId}
                onChange={(e) => handleInputChange('workerId', e.target.value)}
                disabled={!!leave}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${errors.workerId ? '#dc2626' : '#d1d5db'}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                  backgroundColor: leave ? "#f9fafb" : "white"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF5B27";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.workerId ? '#dc2626' : '#d1d5db';
                }}
                placeholder="Nhập mã nhân viên"
              />
              {errors.workerId && (
                <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                  {errors.workerId}
                </p>
              )}
            </div>

            {/* Leave Type */}
            <div>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "6px"
              }}>
                Loại nghỉ phép
              </label>
              <select
                value={formData.leaveType}
                onChange={(e) => handleInputChange('leaveType', e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${errors.leaveType ? '#dc2626' : '#d1d5db'}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                  backgroundColor: "white"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF5B27";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.leaveType ? '#dc2626' : '#d1d5db';
                }}
              >
                <option value="">Chọn loại nghỉ phép</option>
                <option value="Nghỉ phép năm">Nghỉ phép năm</option>
                <option value="Nghỉ ốm">Nghỉ ốm</option>
                <option value="Nghỉ việc riêng">Nghỉ việc riêng</option>
                <option value="Nghỉ không lương">Nghỉ không lương</option>
                <option value="Nghỉ thai sản">Nghỉ thai sản</option>
              </select>
              {errors.leaveType && (
                <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                  {errors.leaveType}
                </p>
              )}
            </div>

            {/* Date Range */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "6px"
                }}>
                  Ngày bắt đầu
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => handleInputChange('startDate', e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${errors.startDate ? '#dc2626' : '#d1d5db'}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#FF5B27";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.startDate ? '#dc2626' : '#d1d5db';
                  }}
                />
                {errors.startDate && (
                  <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "6px"
                }}>
                  Ngày kết thúc
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${errors.endDate ? '#dc2626' : '#d1d5db'}`,
                    borderRadius: "6px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#FF5B27";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = errors.endDate ? '#dc2626' : '#d1d5db';
                  }}
                />
                {errors.endDate && (
                  <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>

            {/* Reason */}
            <div>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                marginBottom: "6px"
              }}>
                Lý do
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => handleInputChange('reason', e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  border: `1px solid ${errors.reason ? '#dc2626' : '#d1d5db'}`,
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                  transition: "border-color 0.2s",
                  resize: "vertical"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#FF5B27";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = errors.reason ? '#dc2626' : '#d1d5db';
                }}
                placeholder="Nhập lý do nghỉ phép"
              />
              {errors.reason && (
                <p style={{ color: "#dc2626", fontSize: "12px", marginTop: "4px" }}>
                  {errors.reason}
                </p>
              )}
            </div>

            {/* Status - Only show when editing */}
            {leave && (
              <div>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "6px"
                }}>
                  Trạng thái
                </label>
                <select
                  value={formData.approvalStatus || ''}
                  onChange={(e) => handleInputChange('approvalStatus', e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s",
                    backgroundColor: "white"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#FF5B27";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                  }}
                >
                  <option value="">Chọn trạng thái</option>
                  <option value="0">Chờ duyệt</option>
                  <option value="1">Đã duyệt</option>
                  <option value="2">Từ chối</option>
                </select>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "12px",
            marginTop: "32px",
            paddingTop: "20px",
            borderTop: "1px solid #e5e7eb"
          }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "500",
                color: "#374151",
                backgroundColor: "#f9fafb",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f3f4f6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#f9fafb";
              }}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "500",
                color: "white",
                backgroundColor: isSubmitting ? "#9ca3af" : "#FF5B27",
                border: "none",
                borderRadius: "6px",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = "#e04a1a";
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = "#FF5B27";
                }
              }}
            >
              {isSubmitting ? 'Đang gửi...' : (leave ? 'Cập nhật' : 'Gửi đơn')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeaveForm; 