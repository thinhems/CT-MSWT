import { HiOutlineHome, HiOutlineChevronRight, HiOutlineMenu } from "react-icons/hi";
import { useSidebar } from "../contexts/SidebarContext";

const TopBar = ({ title, breadcrumbs = [], actionButton }) => {
  const { toggleSidebar, isMobile } = useSidebar();

  return (
    <div
      style={{
        backgroundColor: "white",
        borderBottom: "1px solid #e5e7eb",
        width: "100%",
      }}
    >
      <div
        style={{
          marginLeft: "20px",
          marginRight: "20px",
          paddingTop: "20px",
          paddingBottom: "20px",
        }}
      >
        {/* Header Row with Toggle Button and Title */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "12px"
        }}>
          {/* Mobile Toggle Button */}
          {isMobile && (
            <button
              onClick={toggleSidebar}
              style={{
                background: "transparent",
                border: "none",
                padding: "8px",
                borderRadius: "6px",
                cursor: "pointer",
                color: "#6b7280",
                transition: "all 0.2s ease",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#f3f4f6";
                e.target.style.color = "#FF5B27";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "#6b7280";
              }}
            >
              <HiOutlineMenu style={{ width: "20px", height: "20px" }} />
            </button>
          )}

          {/* Page Title */}
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "bold",
              color: "black",
              margin: 0,
            }}
          >
            {title}
          </h1>
        </div>

        {/* Breadcrumb and Button on same level */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Breadcrumbs */}
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              color: "black",
            }}
          >
            <HiOutlineHome style={{ width: "14px", height: "14px" }} />
            <span>Trang chủ</span>
            {breadcrumbs.map((crumb, index) => (
              <div
                key={index}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <HiOutlineChevronRight
                  style={{ width: "14px", height: "14px" }}
                />
                <span>{crumb}</span>
              </div>
            ))}
          </nav>

          {/* Action Button */}
          {actionButton && <div>{actionButton}</div>}
        </div>
      </div>
    </div>
  );
};

export default TopBar;
