// Upload ảnh lên Cloudinary thông qua API
export const uploadImageToCloudinary = async (file) => {
  try {
    // Tạo FormData
    const formData = new FormData();
    formData.append('file', file);
    
    // Gọi API Cloudinary
    const response = await fetch('/api/Cloudinary/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Kiểm tra content-type để xử lý response phù hợp
    const contentType = response.headers.get('content-type');
    let result;
    
    if (contentType && contentType.includes('application/json')) {
      // Nếu response là JSON
      result = await response.json();
    } else {
      // Nếu response là plain text (URL)
      const urlText = await response.text();
      result = { url: urlText.trim() };
    }
    
    return {
      success: true,
      url: result.secure_url || result.url,
      publicId: result.public_id,
      data: result
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Alias function để giữ tương thích với code hiện tại
export const uploadImageWithFallback = uploadImageToCloudinary;
