import React, { useState } from 'react';
import LeaveTable from '../components/LeaveTable';
import LeaveForm from '../components/LeaveForm';
import { Leave } from '../config/models/leave.model';
import { HiOutlinePlus, HiOutlineSearch } from 'react-icons/hi';
import Notification from '../components/Notification';

const Leaves: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingLeave, setEditingLeave] = useState<Leave | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const handleCreateNew = () => {
    setEditingLeave(undefined);
    setShowForm(true);
  };

  const handleEdit = (leave: Leave) => {
    setEditingLeave(leave);
    setShowForm(true);
  };



  const handleCloseForm = () => {
    setShowForm(false);
    setEditingLeave(undefined);
  };

  const handleSuccess = () => {
    showNotification('Thao tác thành công!', 'success');
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
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
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ show: false, message: '', type: '' })}
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
              Danh sách đơn nghỉ phép
            </h1>
            <span>Trang chủ</span>
            <span style={{ margin: "0 8px" }}>›</span>
            <span style={{ color: "#374151", fontWeight: "500" }}>
              Danh sách đơn nghỉ phép
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
              placeholder="Tìm đơn nghỉ phép"
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

          {/* Add New Button */}
         
        </div>
      </div>

      {/* Leave Table Container */}
      <div style={{ flex: "1", overflow: "auto", minHeight: 0 }}>
        <LeaveTable onEdit={handleEdit} searchTerm={searchTerm} />
      </div>

      {showForm && (
        <LeaveForm
          leave={editingLeave}
          onClose={handleCloseForm}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default Leaves; 