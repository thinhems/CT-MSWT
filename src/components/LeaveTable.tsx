import React, { useState, useMemo } from 'react';
import { useLeaves, deleteLeave, approveLeave } from '../hooks/useLeave';
import { Leave } from '../config/models/leave.model';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { HiDotsVertical, HiPencil, HiCheck, HiX } from 'react-icons/hi';

interface LeaveTableProps {
  onEdit: (leave: Leave) => void;
  searchTerm?: string;
}

const LeaveTable: React.FC<LeaveTableProps> = ({ onEdit, searchTerm = '' }) => {
  const { leaves, isLoading, error, mutate } = useLeaves();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<Leave | null>(null);
  const [approvalNote, setApprovalNote] = useState('');
  const [approvalStatus, setApprovalStatus] = useState<number>(1);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Debug logging
  console.log('LeaveTable - leaves data:', leaves);
  console.log('LeaveTable - error:', error);

  // Filter leaves based on search term
  const filteredLeaves = useMemo(() => {
    if (!searchTerm) return leaves;
    
    const searchLower = searchTerm.toLowerCase();
    return leaves.filter(leave =>
      leave.leaveId?.toLowerCase().includes(searchLower) ||
      leave.workerId?.toLowerCase().includes(searchLower) ||
      leave.leaveType?.toLowerCase().includes(searchLower) ||
      leave.reason?.toLowerCase().includes(searchLower)
    );
  }, [leaves, searchTerm]);

  const handleApprove = async (leaveId: string, approvalStatus: number, note?: string) => {
    setApprovingId(leaveId);
    try {
      await approveLeave(leaveId, { approvalStatus, note });
      mutate();
      alert('Cập nhật đơn nghỉ phép thành công!');
    } catch (error) {
      console.error('Error approving leave:', error);
      alert('Có lỗi xảy ra khi cập nhật đơn nghỉ phép');
    } finally {
      setApprovingId(null);
    }
    setOpenDropdown(null);
  };

  const handleActionClick = (action: string, leave: Leave) => {
    setOpenDropdown(null);
    if (action === 'edit') {
      onEdit(leave);
    } else if (action === 'approve') {
      setSelectedLeave(leave);
      // Set default approval status - only 2 choices: 1 (Đã duyệt) or 2 (Từ chối)
      if (leave.approvalStatus === 'Đã duyệt') {
        setApprovalStatus(2); // Từ chối (để có thể thay đổi)
      } else {
        setApprovalStatus(1); // Đã duyệt (default)
      }
      setShowApprovalModal(true);
    }
  };

  const handleSubmitApproval = () => {
    if (selectedLeave) {
      handleApprove(selectedLeave.leaveId, approvalStatus, approvalNote);
      setShowApprovalModal(false);
      setSelectedLeave(null);
      setApprovalNote('');
      setApprovalStatus(1);
    }
  };

  const getStatusColor = (status: string | undefined | null) => {
    if (!status) return { backgroundColor: '#f3f4f6', color: '#374151' };
    
    switch (status) {
      case 'Đã duyệt':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      case 'Từ chối':
        return { backgroundColor: '#fee2e2', color: '#dc2626' };
      case 'Chờ duyệt':
      case 'Chưa duyệt':
        return { backgroundColor: '#fef3c7', color: '#d97706' };
      default:
        return { backgroundColor: '#f3f4f6', color: '#374151' };
    }
  };

  const getStatusText = (status: string | undefined | null) => {
    if (!status) return 'Không xác định';
    
    switch (status) {
      case 'Đã duyệt':
        return 'Đã duyệt';
      case 'Từ chối':
        return 'Từ chối';
      case 'Chờ duyệt':
      case 'Chưa duyệt':
        return 'Chưa duyệt';
      default:
        return 'Chưa duyệt';
    }
  };

  if (isLoading) {
    return (
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "200px",
        color: "#6b7280"
      }}>
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px"
        }}>
          <div style={{
            width: "32px",
            height: "32px",
            border: "3px solid #f3f3f3",
            borderTop: "3px solid #FF5B27",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <span>Đang tải dữ liệu...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        textAlign: "center",
        color: "#dc2626",
        padding: "32px",
        backgroundColor: "#fef2f2",
        borderRadius: "6px",
        border: "1px solid #fecaca"
      }}>
        <div style={{ marginBottom: "12px" }}>
          <span style={{ fontSize: "24px" }}>⚠️</span>
        </div>
        <div style={{ fontWeight: "500", marginBottom: "8px" }}>
          Có lỗi xảy ra khi tải dữ liệu
        </div>
        <div style={{ fontSize: "14px", color: "#6b7280" }}>
          {error.message}
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          marginLeft: "32px",
          marginRight: "32px",
          marginTop: "0px",
          marginBottom: "12px",
          backgroundColor: "white",
          borderRadius: "12px",
          border: "1px solid #f0f0f0",
          overflow: "hidden",
          boxShadow: "0 2px 8px 0 rgba(0, 0, 0, 0.06)",
        }}
      >
        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#FEF6F4" }}>
                <th style={{
                  padding: "16px 24px",
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  borderBottom: "1px solid #e5e7eb"
                }}>
                  Mã đơn
                </th>
                <th style={{
                  padding: "16px 24px",
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  borderBottom: "1px solid #e5e7eb"
                }}>
                  Mã nhân viên
                </th>
                <th style={{
                  padding: "16px 24px",
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  borderBottom: "1px solid #e5e7eb"
                }}>
                  Loại nghỉ phép
                </th>
                <th style={{
                  padding: "16px 24px",
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  borderBottom: "1px solid #e5e7eb"
                }}>
                  Thời gian
                </th>
                <th style={{
                  padding: "16px 24px",
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  borderBottom: "1px solid #e5e7eb"
                }}>
                  Lý do
                </th>
                <th style={{
                  padding: "16px 24px",
                  textAlign: "left",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  borderBottom: "1px solid #e5e7eb"
                }}>
                  Trạng thái
                </th>
                <th style={{
                  padding: "16px 24px",
                  textAlign: "center",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  borderBottom: "1px solid #e5e7eb"
                }}>
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredLeaves.map((leave) => (
                <tr key={leave.leaveId} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{
                    padding: "16px 24px",
                    fontSize: "14px",
                    color: "#374151"
                  }}>
                    {leave.leaveId}
                  </td>
                  <td style={{
                    padding: "16px 24px",
                    fontSize: "14px",
                    color: "#374151"
                  }}>
                    {leave.workerId}
                  </td>
                  <td style={{
                    padding: "16px 24px",
                    fontSize: "14px",
                    color: "#374151"
                  }}>
                    {leave.leaveType}
                  </td>
                  <td style={{
                    padding: "16px 24px",
                    fontSize: "14px",
                    color: "#374151"
                  }}>
                    {format(new Date(leave.startDate), 'dd/MM/yyyy', { locale: vi })} - {format(new Date(leave.endDate), 'dd/MM/yyyy', { locale: vi })}
                  </td>
                  <td style={{
                    padding: "16px 24px",
                    fontSize: "14px",
                    color: "#374151",
                    maxWidth: "200px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}>
                    {leave.reason}
                  </td>
                  <td style={{
                    padding: "16px 24px",
                    textAlign: "center",
                  }}>
                    <span style={{
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "500",
                      ...getStatusColor(leave.approvalStatus)
                    }}>
                      {getStatusText(leave.approvalStatus)}
                    </span>
                  </td>
                  <td style={{
                    padding: "16px 24px",
                    textAlign: "center",
                  }}>
                    <div className="dropdown-container" style={{ position: "relative", display: "flex", justifyContent: "center" }}>
                      <button
                        onClick={() => setOpenDropdown(openDropdown === leave.leaveId ? null : leave.leaveId)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "8px",
                          borderRadius: "4px",
                          color: "#6b7280",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f3f4f6";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <HiDotsVertical size={16} />
                      </button>

                      {openDropdown === leave.leaveId && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            right: "0",
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                            zIndex: 10,
                            minWidth: "140px",
                            marginTop: "4px",
                          }}
                        >
                          
                          
                          <button
                            onClick={() => handleActionClick('approve', leave)}
                            disabled={approvingId === leave.leaveId}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              width: "100%",
                              padding: "8px 12px",
                              border: "none",
                              background: "none",
                              cursor: approvingId === leave.leaveId ? "not-allowed" : "pointer",
                              fontSize: "14px",
                              color: approvingId === leave.leaveId ? "#9ca3af" : "#059669",
                              transition: "background-color 0.2s",
                            }}
                            onMouseEnter={(e) => {
                              if (approvingId !== leave.leaveId) {
                                e.currentTarget.style.backgroundColor = "#ecfdf5";
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (approvingId !== leave.leaveId) {
                                e.currentTarget.style.backgroundColor = "transparent";
                              }
                            }}
                          >
                            <HiCheck size={16} />
                            {approvingId === leave.leaveId ? 'Đang cập nhật...' : 'Duyệt đơn'}
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredLeaves.length === 0 && (
            <div style={{
              textAlign: "center",
              padding: "48px 16px",
              color: "#6b7280"
            }}>
              <div style={{ marginBottom: "12px" }}>
                <span style={{ fontSize: "48px" }}>📄</span>
              </div>
              <div style={{ fontSize: "16px", fontWeight: "500", marginBottom: "4px" }}>
                {searchTerm ? 'Không tìm thấy đơn nghỉ phép' : 'Không có đơn nghỉ phép nào'}
              </div>
              <div style={{ fontSize: "14px" }}>
                {searchTerm 
                  ? 'Thử thay đổi từ khóa tìm kiếm'
                  : 'Bắt đầu tạo đơn nghỉ phép đầu tiên'
                }
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedLeave && (
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
                Duyệt đơn nghỉ phép
              </h2>
              <button
                onClick={() => setShowApprovalModal(false)}
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

            {/* Content */}
            <div style={{ padding: "24px" }}>
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "500", marginBottom: "12px" }}>
                  Thông tin đơn nghỉ phép
                </h3>
                <div style={{ fontSize: "14px", color: "#6b7280" }}>
                  <p><strong>Mã nhân viên:</strong> {selectedLeave.workerId}</p>
                  <p><strong>Loại nghỉ:</strong> {selectedLeave.leaveType}</p>
                  <p><strong>Thời gian:</strong> {format(new Date(selectedLeave.startDate), 'dd/MM/yyyy', { locale: vi })} - {format(new Date(selectedLeave.endDate), 'dd/MM/yyyy', { locale: vi })}</p>
                  <p><strong>Lý do:</strong> {selectedLeave.reason}</p>
                  <p><strong>Trạng thái hiện tại:</strong> 
                    <span style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: "500",
                      marginLeft: "8px",
                      ...getStatusColor(selectedLeave.approvalStatus)
                    }}>
                      {getStatusText(selectedLeave.approvalStatus)}
                    </span>
                  </p>
                </div>
              </div>

              {/* Approval Status */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "6px"
                }}>
                  Trạng thái duyệt *
                </label>
                <select
                  value={approvalStatus}
                  onChange={(e) => setApprovalStatus(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
                    borderRadius: "6px",
                    fontSize: "14px",
                    outline: "none",
                    transition: "border-color 0.2s"
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#FF5B27";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#d1d5db";
                  }}
                >
                  <option value={1}>Đã duyệt</option>
                  <option value={2}>Từ chối</option>
                </select>
              </div>

              {/* Note */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#374151",
                  marginBottom: "6px"
                }}>
                  Ghi chú
                </label>
                <textarea
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: "1px solid #d1d5db",
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
                    e.target.style.borderColor = "#d1d5db";
                  }}
                  placeholder="Nhập ghi chú (tùy chọn)"
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "12px",
              padding: "20px 24px",
              borderTop: "1px solid #e5e7eb"
            }}>
              <button
                type="button"
                onClick={() => setShowApprovalModal(false)}
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
                type="button"
                onClick={handleSubmitApproval}
                disabled={approvingId === selectedLeave.leaveId}
                style={{
                  padding: "10px 20px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "white",
                  backgroundColor: approvingId === selectedLeave.leaveId ? "#9ca3af" : "#059669",
                  border: "none",
                  borderRadius: "6px",
                  cursor: approvingId === selectedLeave.leaveId ? "not-allowed" : "pointer",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  if (approvingId !== selectedLeave.leaveId) {
                    e.currentTarget.style.backgroundColor = "#047857";
                  }
                }}
                onMouseLeave={(e) => {
                  if (approvingId !== selectedLeave.leaveId) {
                    e.currentTarget.style.backgroundColor = "#059669";
                  }
                }}
              >
                {approvingId === selectedLeave.leaveId ? 'Đang xử lý...' : 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LeaveTable; 