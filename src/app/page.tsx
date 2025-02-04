export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto">
        {/* Main Heading */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
          Authentication Made Easy
        </h1>

        {/* Subheading */}
        <p className="text-2xl md:text-3xl text-gray-800 mb-8">
          Secure, Scalable, and Simple
        </p>

        {/* Feature text on dark background */}
        <div className="bg-gray-800 text-white py-6 px-8 rounded-lg mb-8">
          <p className="text-xl md:text-2xl">
            Complete authentication solution with Next.js 15, featuring 2FA, Password Reset, and more
          </p>
        </div>

        {/* Additional features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-800">
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2">🔒 Secure by Default</h3>
            <p>Built with modern security practices and standards</p>
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2">⚡ Fast & Responsive</h3>
            <p>Optimized for performance across all devices</p>
          </div>
          <div className="p-4">
            <h3 className="text-xl font-semibold mb-2">🛠️ Easy Integration</h3>
            <p>Simple setup with comprehensive documentation</p>
          </div>
        </div>
      </div>
    </div>
  );
}
