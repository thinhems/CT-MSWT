import React from 'react';
import { useUnassignedWorkers } from '../hooks/useUnassignedWorkers';

const ApiTestDebug = () => {
  const { unassignedWorkers, isLoading, error } = useUnassignedWorkers();

  console.log("🔍 ApiTestDebug - Full Response:", {
    unassignedWorkers,
    isLoading,
    error,
    count: unassignedWorkers?.length
  });

  return (
    <div style={{ 
      padding: "20px", 
      border: "2px solid #3b82f6", 
      borderRadius: "8px", 
      margin: "20px",
      backgroundColor: "#f0f9ff"
    }}>
      <h3 style={{ color: "#1e40af", marginBottom: "16px" }}>
        🧪 Unassigned Workers API Test
      </h3>
      
      {isLoading && <p style={{ color: "#f59e0b" }}>⏳ Loading...</p>}
      
      {error && (
        <div style={{ 
          backgroundColor: "#fef2f2", 
          border: "1px solid #fecaca", 
          borderRadius: "6px", 
          padding: "12px",
          marginBottom: "16px"
        }}>
          <p style={{ color: "#dc2626", fontWeight: "500" }}>❌ Error:</p>
          <p style={{ color: "#dc2626" }}>{error.message || error.toString()}</p>
        </div>
      )}
      
      {!isLoading && !error && (
        <div>
          <p style={{ color: "#059669", fontWeight: "500" }}>
            ✅ API Response received: {unassignedWorkers?.length || 0} workers
          </p>
          
          {unassignedWorkers?.length > 0 && (
            <div style={{ marginTop: "16px" }}>
              <h4 style={{ color: "#1e40af", marginBottom: "12px" }}>First Worker Data:</h4>
              <pre style={{ 
                backgroundColor: "#f3f4f6", 
                padding: "12px", 
                borderRadius: "6px",
                fontSize: "12px",
                overflow: "auto",
                border: "1px solid #d1d5db"
              }}>
                {JSON.stringify(unassignedWorkers[0], null, 2)}
              </pre>
              
              <h4 style={{ color: "#1e40af", marginTop: "16px", marginBottom: "12px" }}>
                Filtered Workers (description === "Nhân viên vệ sinh"):
              </h4>
              <div style={{ backgroundColor: "#f3f4f6", padding: "12px", borderRadius: "6px" }}>
                {unassignedWorkers
                  .filter(worker => worker.description === "Nhân viên vệ sinh")
                  .map((worker, index) => (
                    <div key={worker.userId} style={{ 
                      marginBottom: "8px", 
                      padding: "8px",
                      backgroundColor: "white",
                      borderRadius: "4px",
                      border: "1px solid #e5e7eb"
                    }}>
                      <strong>{index + 1}. {worker.fullName}</strong> 
                      <br />
                      <small>ID: {worker.userId} | Description: {worker.description} | Status: {worker.status}</small>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ApiTestDebug;