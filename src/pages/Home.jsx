import ApiTestDebug from '../components/ApiTestDebug';

const Home = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Welcome to Our App</h1>
      <p className="text-lg text-gray-600">
        This is the home page of your application.
      </p>
      
      {/* Temporary API Test Component */}
      <ApiTestDebug />
    </div>
  );
};

export default Home;
