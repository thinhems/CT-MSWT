import { useEffect } from 'react';
import axios from 'axios';

const QuickApiTest = () => {
  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('🧪 Quick API Test Starting...');
        
        const baseURL = import.meta.env.VITE_API_URL;
        console.log('📡 Base URL:', baseURL);
        
        const response = await axios.get(`${baseURL}/users`);
        console.log('📋 Full Response:', response);
        console.log('📋 Response Data:', response.data);
        console.log('📋 Data Type:', typeof response.data);
        console.log('📋 Is Array:', Array.isArray(response.data));
        
        if (response.data && response.data.$values) {
          console.log('🔧 Found $values property');
          console.log('📋 $values:', response.data.$values);
          console.log('📋 $values Type:', typeof response.data.$values);
          console.log('📋 $values Is Array:', Array.isArray(response.data.$values));
        }
        
      } catch (error) {
        console.error('❌ API Test Error:', error);
      }
    };
    
    testAPI();
  }, []);

  return null; // This component doesn't render anything
};

export default QuickApiTest; 