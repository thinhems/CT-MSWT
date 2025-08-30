import React, { useState } from 'react';
import { API_URLS } from '../constants/api-urls';
import { swrFetcher } from '../utils/swr-fetcher';
import useSWR from 'swr';
import Pagination from '../components/Pagination';

const TestPaginationPage = () => {
  const [selectedDate, setSelectedDate] = useState<string>('2025-08-30');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Test the paginated API endpoint
  const { data: response, error, isLoading } = useSWR(
    API_URLS.SCHEDULE_DETAILS.GET_BY_DATE_PAGINATED(selectedDate, currentPage, pageSize),
    swrFetcher
  );

  const scheduleDetails = response?.items || [];
  const totalItems = response?.totalCount || 0;
  const totalPages = Math.ceil(totalItems / pageSize) || 0;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    setCurrentPage(1);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Test Pagination API</h1>
      
      {/* Controls */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div>
          <label>Date: </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            style={{ padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>
        
        <div>
          <label>Page Size: </label>
          <select
            value={pageSize}
            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            style={{ padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* API URL Display */}
      <div style={{ 
        marginBottom: '20px', 
        padding: '10px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: '4px',
        fontSize: '12px',
        wordBreak: 'break-all'
      }}>
        <strong>API URL:</strong><br />
        {API_URLS.SCHEDULE_DETAILS.GET_BY_DATE_PAGINATED(selectedDate, currentPage, pageSize)}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          Loading...
        </div>
      )}

      {/* Error State */}
      {error && (
        <div style={{ 
          padding: '10px', 
          backgroundColor: '#ffebee', 
          border: '1px solid #f44336', 
          borderRadius: '4px',
          color: '#d32f2f',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error.message || 'An error occurred'}
        </div>
      )}

      {/* Results Summary */}
      {response && (
        <div style={{ 
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#e8f5e8',
          border: '1px solid #4caf50',
          borderRadius: '4px'
        }}>
          <strong>Results:</strong> Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items 
          (Page {currentPage} of {totalPages})
        </div>
      )}

      {/* Data Display */}
      {scheduleDetails && scheduleDetails.length > 0 ? (
        <div>
          <h3>Schedule Details ({scheduleDetails.length} items)</h3>
          <div style={{ 
            display: 'grid', 
            gap: '10px',
            marginBottom: '20px'
          }}>
            {scheduleDetails.map((detail: any, index: number) => (
              <div key={detail.scheduleDetailId || index} style={{
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                backgroundColor: '#fafafa'
              }}>
                <div><strong>ID:</strong> {detail.scheduleDetailId}</div>
                <div><strong>Description:</strong> {detail.description}</div>
                <div><strong>Date:</strong> {detail.date}</div>
                <div><strong>Worker Group:</strong> {detail.workerGroupName}</div>
                <div><strong>Group Assignment:</strong> {detail.groupAssignmentName}</div>
                <div><strong>Area:</strong> {detail.areaName}</div>
                <div><strong>Supervisor:</strong> {detail.supervisorName}</div>
                <div><strong>Status:</strong> {detail.status}</div>
                <div><strong>Time:</strong> {detail.startTime} - {detail.endTime}</div>
                <div><strong>Workers:</strong> {detail.workers?.map(w => w.fullName).join(', ') || 'None'}</div>
                <div><strong>Assignments:</strong> {detail.assignments?.map(a => a.assigmentName).join(', ') || 'None'}</div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      ) : response && !isLoading ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#666',
          backgroundColor: '#f9f9f9',
          borderRadius: '4px'
        }}>
          No schedule details found for {selectedDate}
        </div>
      ) : null}

      {/* Raw Response Display */}
      {response && (
        <details style={{ marginTop: '20px' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
            Raw API Response
          </summary>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '12px'
          }}>
            {JSON.stringify(response, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default TestPaginationPage;
