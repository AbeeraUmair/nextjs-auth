export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto">
        {/* Logo and Main Heading */}
        <div className="mb-8">
          <h1 className="text-7xl md:text-8xl font-bold mb-4">
            <span className="bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Auth
            </span>
            <span className="text-blue-600">Flow</span>
          </h1>
          <p className="text-2xl md:text-3xl text-gray-700">
            Seamless Authentication for Modern Apps
          </p>
        </div>

        {/* Feature text on dark background */}
        <div className="bg-gray-800 text-white py-6 px-8 rounded-lg mb-12 transform hover:scale-105 transition-transform duration-300">
          <p className="text-xl md:text-2xl">
            Complete authentication solution with Next.js 15, featuring 2FA, Password Reset, and more
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-800">
          <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-3">🔒 Secure by Default</h3>
            <p>Built with modern security practices and standards</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-3">⚡ Fast & Responsive</h3>
            <p>Optimized for performance across all devices</p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h3 className="text-xl font-semibold mb-3">🛠️ Easy Integration</h3>
            <p>Simple setup with comprehensive documentation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
