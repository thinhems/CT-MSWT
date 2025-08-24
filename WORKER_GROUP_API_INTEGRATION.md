# Worker Group API Integration

## Overview
This document describes the integration of the GET `/api/workerGroup` API endpoint for the group management page in the CT-MSWT application.

## What Was Implemented

### 1. API Endpoint Configuration
- Added `WORKER_GROUP` endpoints to `src/constants/api-urls.ts`
- Includes GET, POST, PUT, and DELETE operations for worker groups
- Added `GET_ALL_MEMBERS` endpoint for `/api/workGroupMember/all-members`

### 2. Custom Hook (`useWorkerGroup`)
- Created `src/hooks/useWorkerGroup.ts` for managing worker group data
- Provides functions for CRUD operations:
  - `fetchGroups()` - GET all worker groups
  - `fetchAllMembers()` - GET all group members
  - `createGroup()` - POST new worker group
  - `updateGroup()` - PUT update existing group
  - `deleteGroup()` - DELETE worker group
  - `getGroupById()` - GET specific worker group

### 3. Data Models
- `WorkerGroup` interface with properties:
  - `workerGroupId`, `workerGroupName`, `description`, `createdAt`
  - Optional: `members`, `leader`, `area`, `status` (for future use)
- `WorkerGroupMember` interface for group members (from separate API)

### 4. Updated GroupManagement Component
- Replaced mock data with real API calls using `useWorkerGroup` hook
- Added loading states and error handling
- Implemented real delete functionality with confirmation
- Added refresh button for manual data reload
- Enhanced UI with loading indicators and error messages

### 5. Enhanced GroupTable Component
- Added null safety checks for all data fields
- Support for both Vietnamese and English status values
- Fallback display text for missing data
- Improved error handling and user experience

### 6. API Testing Component
- Updated `ApiTestDebug.jsx` to include worker group API testing
- Provides visual feedback for API responses
- Helps debug API integration issues

## API Response Handling

### Expected Response Format
The API returns data in the following format:

```json
// Worker Group API Response
[
  {
    "workerGroupId": "2d347038-5488-466f-ba5d-d1b7f19f07e6",
    "workerGroupName": "Worker group test 3",
    "description": "Nhóm làm việc test 3",
    "createdAt": "2025-08-24T23:19:18.213"
  }
]

// Group Members API Response (separate endpoint)
[
  {
    "id": "member-id",
    "name": "Member Name",
    "position": "Position",
    "avatar": "avatar-url",
    "email": "email@example.com",
    "phone": "phone-number"
  }
]
```

### Data Structure
The system now uses the real API response structure:

| Field | Type | Description |
|-------|------|-------------|
| `workerGroupId` | string | Unique identifier for the worker group |
| `workerGroupName` | string | Display name of the worker group |
| `description` | string | Description of the worker group |
| `createdAt` | string | ISO date string when the group was created |

## Features

### ✅ Implemented
- Real-time data fetching from `/api/workerGroup`
- Real-time data fetching from `/api/workGroupMember/all-members`
- Loading states and error handling
- Delete functionality with confirmation
- Refresh button for manual data reload
- Responsive UI with proper loading indicators
- Null safety for all data fields
- Pagination support
- Search functionality by group name, description, or ID
- Creation date display
- Description display

### 🔄 In Progress
- Create new worker group (UI ready, API integration pending)
- Edit existing worker group (UI ready, API integration pending)

### 📋 Future Enhancements
- Bulk operations (delete multiple groups)
- Advanced filtering and sorting
- Export functionality
- Group member management
- Group assignment to areas/buildings

## Usage

### Basic Usage
```jsx
import { useWorkerGroup } from '../hooks/useWorkerGroup';

const MyComponent = () => {
  const { groups, loading, error, fetchGroups, deleteGroup } = useWorkerGroup();
  
  // Groups are automatically fetched on component mount
  // Use the returned functions for CRUD operations
};
```

### Error Handling
```jsx
if (error) {
  // Error is automatically displayed in the UI
  // User can click "Thử lại" to retry
}
```

### Loading States
```jsx
if (loading) {
  // Loading indicator is automatically shown
  // UI is disabled during API calls
}
```

## Testing

### API Test Component
Navigate to the API test component to verify the worker group API integration:

1. Click "Test Worker Group API" button
2. Check the response format and data
3. Verify error handling by testing with invalid endpoints

### Manual Testing
1. Navigate to Group Management page
2. Verify data loads from API
3. Test search functionality
4. Test delete functionality
5. Test refresh button
6. Verify loading states and error handling

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Check network connectivity
   - Verify API base URL in constants
   - Check browser console for CORS errors

2. **Data Not Loading**
   - Verify API endpoint is correct
   - Check API response format
   - Review browser console for errors

3. **Status Not Displaying**
   - Check status values in API response
   - Verify status mapping in components

### Debug Steps

1. Open browser developer tools
2. Check Network tab for API calls
3. Review Console for error messages
4. Use API test component to verify endpoints
5. Check API response format matches expected structure

## Dependencies

- `axios` - HTTP client for API calls
- `react` - React hooks and state management
- Existing API service infrastructure
- Existing notification and UI components

## Files Modified

- `src/constants/api-urls.ts` - Added worker group endpoints
- `src/hooks/useWorkerGroup.ts` - New custom hook
- `src/pages/GroupManagement.jsx` - Updated to use real API
- `src/components/GroupTable.jsx` - Enhanced with null safety
- `src/components/ApiTestDebug.jsx` - Added worker group testing

## Next Steps

1. Test the API integration with real backend
2. Implement create and edit functionality
3. Add more advanced features as needed
4. Optimize performance for large datasets
5. Add unit tests for the custom hook
