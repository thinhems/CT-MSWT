import { useState } from "react";
import api from "../services/api";
import { API_URLS } from "../constants/api-urls";

const ApiTestDebug = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState({});

  const testApi = async (endpoint, name) => {
    setLoading(prev => ({ ...prev, [name]: true }));
    try {
      const response = await api.get(endpoint);
      setResults(prev => ({
        ...prev,
        [name]: {
          success: true,
          data: response.data,
          status: response.status
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: {
          success: false,
          error: error.message,
          status: error.response?.status
        }
      }));
    } finally {
      setLoading(prev => ({ ...prev, [name]: false }));
    }
  };

  const testWorkerGroupApi = () => {
    testApi(API_URLS.WORKER_GROUP.GET_ALL, 'workerGroup');
  };

  const testWorkerGroupMembersApi = () => {
    testApi(API_URLS.WORKER_GROUP.GET_ALL_MEMBERS, 'workerGroupMembers');
  };

  const testUsersApi = () => {
    testApi(API_URLS.USER.GET_ALL, 'users');
  };

  const testBuildingsApi = () => {
    testApi(API_URLS.BUILDING.GET_ALL, 'buildings');
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>API Test Debug</h2>
      
      <div style={{ marginBottom: "20px" }}>
        <h3>Worker Group API</h3>
        <button 
          onClick={testWorkerGroupApi}
          disabled={loading.workerGroup}
          style={{
            padding: "10px 20px",
            backgroundColor: "#3B82F6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading.workerGroup ? "not-allowed" : "pointer",
            marginRight: "10px"
          }}
        >
          {loading.workerGroup ? "Testing..." : "Test Worker Group API"}
        </button>

        <button 
          onClick={testWorkerGroupMembersApi}
          disabled={loading.workerGroupMembers}
          style={{
            padding: "10px 20px",
            backgroundColor: "#8B5CF6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading.workerGroupMembers ? "not-allowed" : "pointer",
            marginRight: "10px"
          }}
        >
          {loading.workerGroupMembers ? "Testing..." : "Test Group Members API"}
        </button>
        
        {results.workerGroup && (
          <div style={{
            marginTop: "10px",
            padding: "15px",
            backgroundColor: results.workerGroup.success ? "#F0FDF4" : "#FEF2F2",
            border: `1px solid ${results.workerGroup.success ? "#BBF7D0" : "#FECACA"}`,
            borderRadius: "8px"
          }}>
            <h4>Worker Group API Result:</h4>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>
              {JSON.stringify(results.workerGroup, null, 2)}
            </pre>
          </div>
        )}

        {results.workerGroupMembers && (
          <div style={{
            marginTop: "10px",
            padding: "15px",
            backgroundColor: results.workerGroupMembers.success ? "#F0FDF4" : "#FEF2F2",
            border: `1px solid ${results.workerGroupMembers.success ? "#BBF7D0" : "#FECACA"}`,
            borderRadius: "8px"
          }}>
            <h4>Worker Group Members API Result:</h4>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>
              {JSON.stringify(results.workerGroupMembers, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Users API</h3>
        <button 
          onClick={testUsersApi}
          disabled={loading.users}
          style={{
            padding: "10px 20px",
            backgroundColor: "#10B981",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading.users ? "not-allowed" : "pointer",
            marginRight: "10px"
          }}
        >
          {loading.users ? "Testing..." : "Test Users API"}
        </button>
        
        {results.users && (
          <div style={{
            marginTop: "10px",
            padding: "15px",
            backgroundColor: results.users.success ? "#F0FDF4" : "#FEF2F2",
            border: `1px solid ${results.users.success ? "#BBF7D0" : "#FECACA"}`,
            borderRadius: "8px"
          }}>
            <h4>Users API Result:</h4>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>
              {JSON.stringify(results.users, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Buildings API</h3>
        <button 
          onClick={testBuildingsApi}
          disabled={loading.buildings}
          style={{
            padding: "10px 20px",
            backgroundColor: "#F59E0B",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading.buildings ? "not-allowed" : "pointer",
            marginRight: "10px"
          }}
        >
          {loading.buildings ? "Testing..." : "Test Buildings API"}
        </button>
        
        {results.buildings && (
          <div style={{
            marginTop: "10px",
            padding: "15px",
            backgroundColor: results.buildings.success ? "#F0FDF4" : "#FEF2F2",
            border: `1px solid ${results.buildings.success ? "#BBF7D0" : "#FECACA"}`,
            borderRadius: "8px"
          }}>
            <h4>Buildings API Result:</h4>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: "12px" }}>
              {JSON.stringify(results.buildings, null, 2)}
            </pre>
          </div>
        )}
      </div>

      <div style={{ marginTop: "30px", padding: "15px", backgroundColor: "#F3F4F6", borderRadius: "8px" }}>
        <h4>API Base URL:</h4>
        <code>{import.meta.env.VITE_API_URL || "https://capstoneproject-mswt-su25.onrender.com/api"}</code>
      </div>
    </div>
  );
};

export default ApiTestDebug;