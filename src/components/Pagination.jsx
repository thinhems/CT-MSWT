import { HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi";

const Pagination = ({ currentPage = 1, totalPages = 3, onPageChange }) => {
  // Generate page numbers to display
  const getPageNumbers = () => {
    if (totalPages <= 3) {
      // If 4 pages or less, show all pages
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = [];
    
    if (currentPage <= 2) {
      // Show first 3 pages: [1] [2] [3] [...] [last]
      pages.push(1, 2, 3);
      if (totalPages > 3) {
        pages.push('...');
      }
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 1) {
      // Show last 3 pages: [1] [...] [n-2] [n-1] [n]
      pages.push(1);
      if (totalPages > 3) {
        pages.push('...');
      }
      pages.push(totalPages - 2, totalPages - 1, totalPages);
    } else {
      // Show current page and neighbors: [current-1] [current] [current+1] [...] [last]
      pages.push(currentPage - 1, currentPage, currentPage + 1);
      if (currentPage + 1 < totalPages - 1) {
        pages.push('...');
      }
      pages.push(totalPages);
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        paddingTop: "16px",
        paddingBottom: "16px",
      }}
    >
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        style={{
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid #FFDED4",
          backgroundColor: "#FFDED4",
          color: currentPage === 1 ? "#9ca3af" : "#374151",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
          transition: "all 0.2s",
        }}
      >
        <HiOutlineChevronLeft style={{ width: "16px", height: "16px" }} />
      </button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => {
        if (page === '...') {
          return (
            <span
              key={`ellipsis-${index}`}
              style={{
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6b7280",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              ...
            </span>
          );
        }

        return (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              border: "1px solid #FF5B27",
              backgroundColor: page === currentPage ? "#FF5B27" : "#FFDED4",
              color: page === currentPage ? "white" : "#374151",
              fontSize: "14px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {page}
          </button>
        );
      })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={{
          padding: "8px",
          borderRadius: "6px",
          border: "1px solid #FFDED4",
          backgroundColor: "#FFDED4",
          color: currentPage === totalPages ? "#9ca3af" : "#374151",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
          transition: "all 0.2s",
        }}
      >
        <HiOutlineChevronRight style={{ width: "16px", height: "16px" }} />
      </button>
    </div>
  );
};

export default Pagination;
