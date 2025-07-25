import React, { useState, useMemo } from 'react';
import { useLeaves, deleteLeave, approveLeave } from '../hooks/useLeave';
import { Leave } from '../config/models/leave.model';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { HiDotsVertical, HiPencil } from 'react-icons/hi';

interface LeaveTableProps {
  onEdit: (leave: Leave) => void;
  searchTerm?: string;
}

const LeaveTable: React.FC<LeaveTableProps> = ({ onEdit, searchTerm = '' }) => {
  const { leaves, isLoading, error, mutate } = useLeaves();
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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

  const handleApprove = async (leaveId: string, approvalStatus: string) => {
    setApprovingId(leaveId);
    try {
      await approveLeave(leaveId, { approvalStatus });
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
      const newStatus = leave.approvalStatus === 'Đã duyệt' ? 'Chờ duyệt' : 'Đã duyệt';
      handleApprove(leave.leaveId, newStatus);
    }
  };

  const getStatusColor = (status: string | undefined | null) => {
    if (!status) return { backgroundColor: '#f3f4f6', color: '#374151' };
    
    switch (status) {
      case 'Đã duyệt':
        return { backgroundColor: '#dcfce7', color: '#166534' };
      default:
        return { backgroundColor: '#fef3c7', color: '#d97706' };
    }
  };

  const getStatusText = (status: string | undefined | null) => {
    if (!status) return 'Không xác định';
    
    switch (status) {
      case 'Đã duyệt':
        return 'Đã duyệt';
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
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ backgroundColor: "#FEF6F4" }}>
            <th
              style={{
                padding: "16px 24px",
                textAlign: "left",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                position: "relative",
              }}
            >
              Mã đơn
            </th>
            <th
              style={{
                padding: "16px 24px",
                textAlign: "left",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Nhân viên
            </th>
            <th
              style={{
                padding: "16px 24px",
                textAlign: "left",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Loại nghỉ
            </th>
            <th
              style={{
                padding: "16px 24px",
                textAlign: "left",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Ngày bắt đầu
            </th>
            <th
              style={{
                padding: "16px 24px",
                textAlign: "left",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Ngày kết thúc
            </th>
            <th
              style={{
                padding: "16px 24px",
                textAlign: "left",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Lý do
            </th>
            <th
              style={{
                padding: "16px 24px",
                textAlign: "left",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Trạng thái
            </th>
            <th
              style={{
                padding: "16px 24px",
                textAlign: "center",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
              }}
            >
              Hành động
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredLeaves.map((leave, index) => (
            <tr
              key={leave.leaveId || `leave-${Math.random()}`}
              style={{
                borderTop: index > 0 ? "1px solid #f0f0f0" : "none",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#f9fafb";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "#111827",
                }}
              >
                {leave.leaveId || 'N/A'}
              </td>
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  color: "#374151",
                }}
              >
                {leave.workerId || 'N/A'}
              </td>
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  color: "#374151",
                }}
              >
                {leave.leaveType || 'N/A'}
              </td>
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  color: "#374151",
                }}
              >
                {leave.startDate ? format(new Date(leave.startDate), 'dd/MM/yyyy', { locale: vi }) : 'N/A'}
              </td>
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  color: "#374151",
                }}
              >
                {leave.endDate ? format(new Date(leave.endDate), 'dd/MM/yyyy', { locale: vi }) : 'N/A'}
              </td>
              <td
                style={{
                  padding: "16px 24px",
                  fontSize: "14px",
                  color: "#374151",
                  maxWidth: "200px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {leave.reason || 'N/A'}
              </td>
              <td
                style={{
                  padding: "16px 24px",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: "600",
                    borderRadius: "9999px",
                    backgroundColor: getStatusColor(leave.approvalStatus).backgroundColor,
                    color: getStatusColor(leave.approvalStatus).color,
                  }}
                >
                  {getStatusText(leave.approvalStatus)}
                </span>
              </td>
              <td
                style={{
                  padding: "16px 24px",
                  textAlign: "center",
                }}
              >
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
                        onClick={() => handleActionClick('edit', leave)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          width: "100%",
                          padding: "8px 12px",
                          border: "none",
                          background: "none",
                          cursor: "pointer",
                          fontSize: "14px",
                          color: "#374151",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f9fafb";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <HiPencil size={16} />
                        Sửa
                      </button>
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
                        <HiPencil size={16} />
                        {approvingId === leave.leaveId ? 'Đang cập nhật...' : 'Cập nhật đơn'}
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
  );
};

export default LeaveTable; 