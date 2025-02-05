export default function DocsSidebar({ activeTab, setActiveTab }: { 
  activeTab: string; 
  setActiveTab: (tab: string) => void;
}) {
  const navItems = [
    {
      section: "Getting Started",
      items: [
        { id: "getting-started", label: "Installation & Setup" },
      ]
    },
    {
      section: "Authentication",
      items: [
        { id: "auth-setup", label: "Basic Auth" },
        { id: "oauth", label: "OAuth Providers" },
      ]
    },
    {
      section: "Features",
      items: [
        { id: "2fa-setup", label: "Two-Factor Auth" },
        { id: "reset-flow", label: "Password Reset" },
      ]
    },
    {
      section: "API Reference",
      items: [
        { id: "api-auth", label: "Auth Endpoints" },
      ]
    }
  ];

  return (
    <nav className="space-y-8">
      {navItems.map((section) => (
        <div key={section.section}>
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