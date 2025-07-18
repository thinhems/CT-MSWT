const NotFound = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Page Not Found</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          The page you're looking for doesn't exist.
        </p>
      </div>
    </div>
  );
};

export default NotFound;
