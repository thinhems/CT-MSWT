import React, { useState, useRef, useEffect } from 'react';
import { HiOutlineChevronDown, HiOutlineX, HiOutlineCheck } from 'react-icons/hi';
import styles from './JobSelectionDropdown.module.css';

const JobSelectionDropdown = ({ 
  jobs, 
  selectedJobs, 
  onSelectionChange, 
  placeholder = "Chọn công việc...",
  label = "Chọn công việc"
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter jobs based on search term
  const filteredJobs = jobs.filter(job =>
    job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group jobs by category
  const groupedJobs = filteredJobs.reduce((acc, job) => {
    if (!acc[job.category]) {
      acc[job.category] = [];
    }
    acc[job.category].push(job);
    return acc;
  }, {});

  const handleJobToggle = (jobId) => {
    const newSelection = selectedJobs.includes(jobId)
      ? selectedJobs.filter(id => id !== jobId)
      : [...selectedJobs, jobId];
    onSelectionChange(newSelection);
  };

  const removeJob = (jobId, e) => {
    e.stopPropagation();
    const newSelection = selectedJobs.filter(id => id !== jobId);
    onSelectionChange(newSelection);
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onSelectionChange([]);
  };

  const getSelectedJobNames = () => {
    return selectedJobs.map(id => {
      const job = jobs.find(j => j.id.toString() === id.toString());
      return job ? job.name : '';
    }).filter(name => name);
  };

  return (
    <div className={styles['job-selection-dropdown']} ref={dropdownRef}>
      <label className={styles['dropdown-label']}>
        {label}
      </label>
      
      <div 
        className={`${styles['dropdown-container']} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles['dropdown-header']}>
          {selectedJobs.length === 0 ? (
            <span className={styles.placeholder}>{placeholder}</span>
          ) : (
            <div className={styles['selected-items']}>
              {getSelectedJobNames().slice(0, 2).map((name, index) => (
                <span key={index} className={styles['selected-item']}>
                  {name}
                  <button
                    type="button"
                    onClick={(e) => removeJob(selectedJobs[index], e)}
                    className={styles['remove-btn']}
                  >
                    <HiOutlineX size={12} />
                  </button>
                </span>
              ))}
              {selectedJobs.length > 2 && (
                <span className={styles['more-count']}>+{selectedJobs.length - 2} nữa</span>
              )}
            </div>
          )}
          <HiOutlineChevronDown className={`${styles.chevron} ${isOpen ? styles.rotate : ''}`} />
        </div>

        {isOpen && (
          <div className={styles['dropdown-menu']}>
            {/* Search input */}
            <div className={styles['search-container']}>
              <input
                type="text"
                placeholder="Tìm kiếm công việc..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className={styles['search-input']}
              />
            </div>

            {/* Clear all button */}
            {selectedJobs.length > 0 && (
              <div className={styles['clear-all-container']}>
                <button
                  type="button"
                  onClick={clearAll}
                  className={styles['clear-all-btn']}
                >
                  Xóa tất cả
                </button>
              </div>
            )}

            {/* Jobs list */}
            <div className={styles['jobs-list']}>
              {Object.entries(groupedJobs).map(([category, categoryJobs]) => (
                <div key={category} className={styles['category-group']}>
                  <div className={styles['category-header']}>{category}</div>
                  {categoryJobs.map(job => (
                    <div
                      key={job.id}
                      className={`${styles['job-item']} ${selectedJobs.includes(job.id.toString()) ? styles.selected : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJobToggle(job.id.toString());
                      }}
                    >
                      <div className={styles['job-info']}>
                        <span className={styles['job-name']}>{job.name}</span>
                        <span className={styles['job-category']}>{job.category}</span>
                      </div>
                      {selectedJobs.includes(job.id.toString()) && (
                        <HiOutlineCheck className={styles['check-icon']} />
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* No results message */}
            {filteredJobs.length === 0 && (
              <div className={styles['no-results']}>
                Không tìm thấy công việc nào
              </div>
            )}
          </div>
        )}
      </div>

      {/* Helper text */}
      <div className={styles['helper-text']}>
        Đã chọn {selectedJobs.length} công việc
      </div>
    </div>
  );
};

export default JobSelectionDropdown;
