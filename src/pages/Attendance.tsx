import { useMemo, useState } from "react";
import { useAttendanceAll, useAttendanceByDate, AttendanceRecord } from "../hooks/useAttendance";

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState<string>("");

  const { records: allRecords, isLoading: loadingAll, error: errorAll } = useAttendanceAll();
  const { records: dateRecords, isLoading: loadingDate, error: errorDate } = useAttendanceByDate(selectedDate || undefined);

  const records: AttendanceRecord[] = useMemo(() => {
    if (selectedDate) return dateRecords;
    return allRecords;
  }, [selectedDate, allRecords, dateRecords]);

  const isLoading = selectedDate ? loadingDate : loadingAll;
  const error = selectedDate ? errorDate : errorAll;

  // Sort by newest date (and latest check-in time within same day)
  const sortedRecords = useMemo(() => {
    const copy = [...records];
    copy.sort((a, b) => {
      const da = new Date(a.attendanceDate).getTime();
      const db = new Date(b.attendanceDate).getTime();
      if (db !== da) return db - da;
      const ta = a.checkInTime ? new Date(a.checkInTime).getTime() : 0;
      const tb = b.checkInTime ? new Date(b.checkInTime).getTime() : 0;
      return tb - ta;
    });
    return copy;
  }, [records]);

  return (
    <div style={{ backgroundColor: "#ffffff", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: 16 }}>
        <nav style={{ color: "#6b7280", fontSize: 14 }}>
          <h1 style={{ fontSize: 22, fontWeight: "bold", color: "#111827", marginBottom: 16 }}>Xem điểm danh</h1>
          <span>Trang chủ</span>
          <span style={{ margin: "0 8px" }}>›</span>
          <span style={{ color: "#374151", fontWeight: 500 }}>Xem điểm danh</span>
        </nav>
      </div>

      <div style={{ padding: 16, display: "flex", alignItems: "center", gap: 12 }}>
        <label style={{ fontSize: 14, color: "#374151" }}>Chọn ngày:</label>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, fontSize: 14 }}
        />
        {selectedDate && (
          <button
            onClick={() => setSelectedDate("")}
            style={{ padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: 6, background: "white", cursor: "pointer" }}
          >
            Xem tất cả
          </button>
        )}
      </div>

      <div style={{ padding: 16 }}>
        {isLoading && (
          <div style={{ color: "#6b7280" }}>Đang tải dữ liệu...</div>
        )}
        {error && (
          <div style={{ color: "#dc2626" }}>{(error as any)?.message || "Có lỗi xảy ra"}</div>
        )}

        {!isLoading && !error && (
          <div style={{ backgroundColor: "white", borderRadius: 10, border: "1px solid #e5e7eb", overflow: "hidden" }}>
            
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <colgroup>
                <col style={{ width: "28%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "18%" }} />
                <col style={{ width: "18%" }} />
              </colgroup>
              <thead>
                <tr style={{ backgroundColor: "#FEF6F4", borderBottom: "1px solid #f3f4f6" }}>
                  <th style={{ textAlign: "left", padding: "12px 14px", fontSize: 12, color: "#374151", textTransform: "uppercase", letterSpacing: "0.03em" }}>Tên nhân viên</th>
                  <th style={{ textAlign: "left", padding: "12px 14px", fontSize: 12, color: "#374151", textTransform: "uppercase", letterSpacing: "0.03em" }}>Ngày</th>
                  <th style={{ textAlign: "left", padding: "12px 14px", fontSize: 12, color: "#374151", textTransform: "uppercase", letterSpacing: "0.03em" }}>Check-in</th>
                  <th style={{ textAlign: "left", padding: "12px 14px", fontSize: 12, color: "#374151", textTransform: "uppercase", letterSpacing: "0.03em" }}>Check-out</th>
                  <th style={{ textAlign: "left", padding: "12px 14px", fontSize: 12, color: "#374151", textTransform: "uppercase", letterSpacing: "0.03em" }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {sortedRecords.map((r, index) => {
                  const zebra = index % 2 === 1 ? "#fafafa" : "transparent";
                  const fmt = (iso?: string | null) => (iso ? new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "-");
                  return (
                    <tr key={`${r.id || r.employeeId}-${r.attendanceDate}-${index}`}
                        style={{ backgroundColor: zebra, transition: "background-color 0.2s" }}
                        onMouseEnter={(e: any) => (e.currentTarget.style.backgroundColor = "#f9fafb")}
                        onMouseLeave={(e: any) => (e.currentTarget.style.backgroundColor = zebra)}>
                      <td style={{ padding: "12px 14px", fontSize: 14, color: "#111827" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontWeight: "500" }}>{r.fullName}</span>
                          
                        </div>
                      </td>
                      <td style={{ padding: "12px 14px", fontSize: 14, color: "#374151" }}>{new Date(r.attendanceDate).toLocaleDateString("vi-VN")}</td>
                      <td style={{ padding: "12px 14px", fontSize: 14, color: "#374151" }}>{fmt(r.checkInTime)}</td>
                      <td style={{ padding: "12px 14px", fontSize: 14, color: "#374151" }}>{fmt(r.checkOutTime)}</td>
                      <td style={{ padding: "12px 14px", fontSize: 14, color: "#374151" }}>{r.status || ""}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {records.length === 0 && (
              <div style={{ padding: 24, textAlign: "center", color: "#6b7280" }}>Không có dữ liệu</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;


