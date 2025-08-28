import React, { useState, useEffect, useRef } from 'react';
import { HiOutlineChevronDown, HiOutlineX, HiOutlineCheck } from 'react-icons/hi';

const MultiSelectDropdown = ({
  options = [],
  value = [],
  onChange,
  placeholder = "Chọn nhân viên...",
  disabled = false,
  maxHeight = "200px",
  style = {}
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filteredOptions = (options || []).filter(option => {
    if (!option || !option.label || !option.value) return false;
    
    const searchValue = (searchTerm || "").toLowerCase();
    const label = (option.label || "").toLowerCase();
    const value = (option.value || "").toLowerCase();
    
    return label.includes(searchValue) || value.includes(searchValue);
  });

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      if (!isOpen) {
        setSearchTerm("");
      }
    }
  };

  const handleSelect = (option) => {
    if (!option || !option.value) return;
    
    const isSelected = (value || []).some(item => item && item.value === option.value);
    
    if (isSelected) {
      // Remove if already selected
      onChange((value || []).filter(item => item && item.value !== option.value));
    } else {
      // Add if not selected
      onChange([...(value || []), option]);
    }
  };

  const handleRemove = (optionToRemove) => {
    if (!optionToRemove || !optionToRemove.value) return;
    onChange((value || []).filter(item => item && item.value !== optionToRemove.value));
  };

  const handleRemoveAll = () => {
    onChange([]);
  };

  const isSelected = (option) => {
    if (!option || !option.value) return false;
    return (value || []).some(item => item && item.value === option.value);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', ...style }}>
      {/* Selected Items Display */}
      <div
        onClick={handleToggle}
        style={{
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          padding: '8px 12px',
          minHeight: '44px',
          backgroundColor: disabled ? '#f9fafb' : 'white',
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px',
          alignItems: 'center',
          transition: 'border-color 0.2s',
          ...(isOpen && { borderColor: '#3b82f6' })
        }}
        onMouseEnter={(e) => {
          if (!disabled && !isOpen) {
            e.target.style.borderColor = '#9ca3af';
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isOpen) {
            e.target.style.borderColor = '#d1d5db';
          }
        }}
      >
        {(value || []).length === 0 ? (
          <span style={{ color: '#9ca3af', fontSize: '14px' }}>
            {placeholder}
          </span>
        ) : (
          <>
            {(value || []).filter(item => item && item.value && item.label).map((item) => (
              <span
                key={item.value}
                style={{
                  backgroundColor: '#e5e7eb',
                  color: '#374151',
                  padding: '2px 8px',
                  borderRadius: '16px',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {item.label}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(item);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0',
                    display: 'flex',
                    alignItems: 'center',
                    color: '#6b7280'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.color = '#dc2626';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.color = '#6b7280';
                  }}
                >
                  <HiOutlineX size={12} />
                </button>
              </span>
            ))}
            {value.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveAll();
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '2px 6px',
                  fontSize: '12px',
                  color: '#dc2626',
                  textDecoration: 'underline'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#dc2626';
                }}
              >
                Xóa tất cả
              </button>
            )}
          </>
        )}
        
        {/* Dropdown Arrow */}
        <HiOutlineChevronDown
          style={{
            marginLeft: 'auto',
            color: '#6b7280',
            transition: 'transform 0.2s',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
          }}
          size={20}
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            zIndex: 1000,
            marginTop: '4px',
            maxHeight: maxHeight,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Search Input */}
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #f3f4f6' }}>
            <input
              type="text"
              placeholder="Tìm kiếm nhân viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {/* Options List */}
          <div style={{ overflowY: 'auto', maxHeight: 'calc(100% - 60px)' }}>
            {filteredOptions.length === 0 ? (
              <div style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>
                Không tìm thấy nhân viên nào
              </div>
            ) : (
              filteredOptions.map((option) => {
                if (!option || !option.value || !option.label) return null;
                
                return (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background-color 0.2s',
                    borderBottom: '1px solid #f3f4f6'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                  }}
                >
                  {/* Checkbox */}
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #d1d5db',
                      borderRadius: '3px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isSelected(option) ? '#3b82f6' : 'transparent',
                      borderColor: isSelected(option) ? '#3b82f6' : '#d1d5db'
                    }}
                  >
                    {isSelected(option) && (
                      <HiOutlineCheck size={12} color="white" />
                    )}
                  </div>
                  
                  {/* Option Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>
                      {option.label}
                    </div>
                    {option.subtitle && (
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                        {option.subtitle}
                      </div>
                    )}
                    {option.avatar && (
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        overflow: 'hidden',
                        marginLeft: 'auto'
                      }}>
                        <img 
                          src={option.avatar} 
                          alt={option.label}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectDropdown;
