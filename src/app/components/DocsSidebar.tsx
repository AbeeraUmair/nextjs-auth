export default function DocsSidebar({ activeTab, setActiveTab }: { 
  activeTab: string; 
  setActiveTab: (tab: string) => void;
}) {
  const navItems = [
    {
      section: "Getting Started",
      items: [
        { id: "getting-started", label: "Installation & Setup" },
        { id: "authentication", label: "Basic Setup" }
      ]
    },
    {
      section: "Authentication",
      items: [
        { id: "auth-setup", label: "Auth Configuration" },
        { id: "register", label: "User Registration" },
        { id: "oauth", label: "OAuth Providers" }
      ]
    },
    {
      section: "Security Features",
      items: [
        { id: "2fa-setup", label: "Two-Factor Auth" },
        { id: "reset-flow", label: "Password Reset" }
      ]
    },
    {
      section: "API Reference",
      items: [
        { id: "api-auth", label: "Auth Endpoints" },
        { id: "api-2fa", label: "2FA Endpoints" },
        { id: "api-password", label: "Password Management" }
      ]
    }
  ];

  return (
    <nav className="max-h-[calc(100vh-12rem)] overflow-y-auto hover:overflow-y-auto scrollbar-none">
      {navItems.map((section) => (
        <div key={section.section} className="mb-8">
          <h5 className="mb-3 text-sm font-semibold text-gray-900">
            {section.section}
          </h5>
          <ul className="space-y-2">
            {section.items.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors ${
                    activeTab === item.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
} 