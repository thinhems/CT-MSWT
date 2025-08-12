import React, { useState, useEffect, useRef } from 'react';
import { HiOutlineDotsVertical } from 'react-icons/hi';

const Dropdown = ({ 
  items = [], 
  onItemClick, 
  disabled = false,
  buttonStyle = {},
  dropdownStyle = {},
  triggerData = null 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const target = event.target;
      if (
        isOpen && 
        !buttonRef.current?.contains(target) && 
        !target.closest('[data-dropdown-menu]')
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    if (!isOpen) {
      // Calculate position for dropdown
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 160;
      const dropdownHeight = 120; // Estimate dropdown height
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const margin = 10;
      
      let top = rect.bottom + window.scrollY + 4;
      let left = rect.right + window.scrollX - dropdownWidth;
      
      // Adjust horizontal position if dropdown would go off screen
      if (left < margin) {
        left = rect.left + window.scrollX;
      }
      if (left + dropdownWidth > viewportWidth - margin) {
        left = rect.left + window.scrollX - dropdownWidth + rect.width;
      }
      
      // Adjust vertical position if dropdown would go off screen
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      
      if (spaceBelow < dropdownHeight && spaceAbove > dropdownHeight) {
        // Not enough space below, but enough space above - show above
        top = rect.top + window.scrollY - dropdownHeight - 4;
      } else if (spaceBelow < dropdownHeight && spaceAbove < dropdownHeight) {
        // Not enough space above or below - position at best available space
        if (spaceAbove > spaceBelow) {
          top = window.scrollY + margin; // Show at top of viewport
        } else {
          top = window.scrollY + viewportHeight - dropdownHeight - margin; // Show at bottom of viewport
        }
      }
      
      setPosition({ top, left });
    }
    
    setIsOpen(!isOpen);
  };

  const handleItemClick = (item) => {
    setIsOpen(false);
    onItemClick?.(item, triggerData);
  };

  return (
    <>
      {/* Dropdown Button */}
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        disabled={disabled}
        style={{
          background: "none",
          border: "none",
          outline: "none",
          boxShadow: "none",
          cursor: disabled ? "not-allowed" : "pointer",
          padding: "8px",
          borderRadius: "4px",
          color: disabled ? "#9ca3af" : "#6b7280",
          transition: "all 0.2s",
          WebkitAppearance: "none",
          MozAppearance: "none",
          appearance: "none",
          ...buttonStyle
        }}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = "#f3f4f6";
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled) {
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
      >
        <HiOutlineDotsVertical size={16} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          data-dropdown-menu
          style={{
            position: "fixed",
            top: `${position.top}px`,
            left: `${position.left}px`,
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            zIndex: 9999,
            minWidth: "160px",
            maxHeight: "200px",
            overflow: "auto",
            ...dropdownStyle
          }}
        >
          {items.map((item, index) => (
            <button
              key={item.key || index}
              onClick={() => handleItemClick(item)}
              disabled={item.disabled}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                width: "100%",
                padding: "8px 12px",
                border: "none",
                outline: "none",
                background: "none",
                cursor: item.disabled ? "not-allowed" : "pointer",
                fontSize: "14px",
                color: item.disabled ? "#9ca3af" : (item.color || "#374151"),
                transition: "background-color 0.2s",
                textAlign: "left",
                borderTop: index > 0 ? "1px solid #f3f4f6" : "none",
              }}
              onMouseEnter={(e) => {
                if (!item.disabled) {
                  e.currentTarget.style.backgroundColor = item.hoverColor || "#f9fafb";
                }
              }}
              onMouseLeave={(e) => {
                if (!item.disabled) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              {item.icon && <span style={{ display: "flex", alignItems: "center" }}>{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
};

export default Dropdown;
