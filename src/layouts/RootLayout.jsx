import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { SidebarProvider, useSidebar } from "../contexts/SidebarContext";
import { HiOutlineMenu } from "react-icons/hi";
import Sidebar from "../components/Sidebar";

// Layout content component that uses sidebar context
const LayoutContent = () => {
  const { sidebarWidth, isMobile, isMobileOpen, closeMobileSidebar, toggleSidebar, isCollapsed } = useSidebar();

  return (
    <div style={{ backgroundColor: "#f5f5f5" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
            transition: "opacity 0.3s ease"
          }}
          onClick={closeMobileSidebar}
        />
      )}



      {/* Main Content */}
      <div
        style={{
          marginLeft: isMobile ? 0 : `${sidebarWidth}px`,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          transition: "margin-left 0.3s ease",
        }}
      >
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            backgroundColor: "#f5f5f5",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const RootLayout = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Pages that don't require authentication
  const publicPages = ['/login', '/register'];
  const isPublicPage = publicPages.includes(location.pathname);
  
  // If not authenticated and trying to access protected page, redirect to login
  if (!isAuthenticated && !isPublicPage) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated and on login page, redirect to dashboard
  if (isAuthenticated && location.pathname === '/login') {
    return <Navigate to="/dashboard" replace />;
  }

  // If on public page (login/register), show without layout
  if (isPublicPage) {
    return <Outlet />;
  }

  // Show with sidebar and layout for authenticated pages
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  );
};

export default RootLayout;
